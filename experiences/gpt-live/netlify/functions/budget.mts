// Integer microdollars avoid floating-point admission errors. Historical records
// stay untouched; this one CAS record serializes reservations and settlements.
export const BUDGET_KEY = 'budget-accounting-v1';
export const SITE_BUDGET_MICROS = 4_000_000;
export const LEGACY_RESERVATION_MICROS = 500_000;
export const LEGACY_PLANNER_HOLD_MICROS = 200_000;
export const SESSION_SECONDS = 600;
export const MAX_PLANNER_REQUESTS = 30;
export const PLANNER_HOLD_MICROS = 600_000; // Reserve all 30 bounded requests, even when unused.
export const RESERVATION_MICROS = 1_250_000; // $0.50 voice + $0.60 planner + $0.15 close/retry margin.
export type BudgetConfig = {siteBudgetMicros:number;totalApprovedMicros:number;developmentHoldMicros:number;agentmartBudgetMicros:number;portfolioBudgetMicros:number};
// Both deployments must receive the same allocation map. Raising an approved
// total is an operator action after user approval, never a browser parameter.
export function budgetConfig(siteId:string,read:(key:string)=>string|undefined=()=>undefined):BudgetConfig {
 if(!['agentmart','portfolio'].includes(siteId))throw new Error('Unknown budget allocation');
 const amount=(key:string,fallback:number)=>{
  const raw=read(key);if(raw===undefined)return fallback;
  if(!/^\d+(?:\.\d{1,2})?$/.test(raw))throw new Error('Invalid approved budget configuration');
  const value=Math.round(Number(raw)*1e6);
  if(!Number.isSafeInteger(value)||value<0)throw new Error('Invalid approved budget configuration');
  return value;
 };
 const totalApprovedMicros=amount('LIVE_TOTAL_APPROVED_USD',10_000_000);
 if(![10_000_000,20_000_000,30_000_000].includes(totalApprovedMicros))throw new Error('Invalid approved budget tier');
 const developmentHoldMicros=2_000_000;
 const agentmartBudgetMicros=amount('LIVE_AGENTMART_BUDGET_USD',SITE_BUDGET_MICROS);
 const portfolioBudgetMicros=amount('LIVE_PORTFOLIO_BUDGET_USD',SITE_BUDGET_MICROS);
 if(agentmartBudgetMicros+portfolioBudgetMicros>totalApprovedMicros-developmentHoldMicros)throw new Error('Site allocations exceed the approved budget');
 return {siteBudgetMicros:siteId==='agentmart'?agentmartBudgetMicros:portfolioBudgetMicros,totalApprovedMicros,developmentHoldMicros,agentmartBudgetMicros,portfolioBudgetMicros};
}
export const MAX_SLOTS = 100;
export type BudgetStore = {
 get(key:string, options:{type:'json'}):Promise<unknown>;
 getWithMetadata(key:string, options:{type:'json'}):Promise<{data:unknown;etag?:string}|null>;
 setJSON(key:string, value:unknown, options:{onlyIfNew:true;onlyIfMatch?:never}|{onlyIfNew?:never;onlyIfMatch:string}):Promise<{modified:boolean;etag?:string}>;
};
type Entry = {chargeMicros:number;settled:boolean;reservationMicros?:number;plannerHoldMicros?:number};
export type BudgetLedger = {version:1;nextSlot:number;entries:Record<string,Entry>};
type Session = {tokenHash?:unknown;createdAt?:unknown;deadline?:unknown;sessionId?:unknown;closed?:unknown;usageFinal?:unknown;finalization?:unknown;usageSeconds?:unknown;providerUnavailable?:unknown};
export type BudgetSnapshot = {ledger:BudgetLedger;reservedMicros:number;remainingMicros:number;voiceAvailable:boolean;blockingConnection:boolean;maxSlots:number};
function validateLedger(value:unknown):BudgetLedger {
 if(!value||typeof value!=='object')throw new Error('Usage accounting is unavailable');
 const r=value as BudgetLedger;
 if(r.version!==1||!Number.isSafeInteger(r.nextSlot)||r.nextSlot<8||r.nextSlot>MAX_SLOTS||!r.entries||typeof r.entries!=='object'||Array.isArray(r.entries)||Object.keys(r.entries).length!==r.nextSlot)throw new Error('Usage accounting is unavailable');
 for(let n=0;n<r.nextSlot;n++){
  const e=r.entries[String(n)];
  if(e&&(e.reservationMicros!==undefined||e.plannerHoldMicros!==undefined)&&(e.reservationMicros!==RESERVATION_MICROS||e.plannerHoldMicros!==PLANNER_HOLD_MICROS))throw new Error('Usage accounting is unavailable');
  const reservation=e?.reservationMicros??LEGACY_RESERVATION_MICROS,planner=e?.plannerHoldMicros??LEGACY_PLANNER_HOLD_MICROS;
  if(!e||typeof e.settled!=='boolean'||!Number.isSafeInteger(e.chargeMicros)||e.chargeMicros<0||(!e.settled&&e.chargeMicros!==reservation)||(e.settled&&e.chargeMicros<planner))throw new Error('Usage accounting is unavailable');
 }
 if(!Number.isSafeInteger(total(r)))throw new Error('Usage accounting is unavailable');
 return structuredClone(r);
}
function total(ledger:BudgetLedger){return Object.values(ledger.entries).reduce((sum,e)=>sum+e.chargeMicros,0);}
async function records(store:BudgetStore,count:number){
 // Bounded by MAX_SLOTS; parallel reads avoid a serial network round trip per slot.
 return Promise.all(Array.from({length:count},(_,slot)=>store.get(`sessions/${slot}`,{type:'json'}))) as Promise<(Session|null)[]>;
}
function validLegacy(s:Session|null){return !!s&&typeof s.tokenHash==='string'&&s.tokenHash.length===64&&typeof s.createdAt==='number'&&Number.isFinite(s.createdAt)&&typeof s.deadline==='number'&&Number.isFinite(s.deadline)&&typeof s.closed==='boolean';}
function bootstrap(sessions:(Session|null)[]):BudgetLedger {
 if(sessions.length!==8||sessions.some(s=>!validLegacy(s)))throw new Error('Historical usage accounting could not be verified');
 return {version:1,nextSlot:8,entries:Object.fromEntries(sessions.map((_,n)=>[String(n),{chargeMicros:LEGACY_RESERVATION_MICROS,settled:false}]))};
}
function reconcile(ledger:BudgetLedger,sessions:(Session|null)[],now:number,config:BudgetConfig):BudgetSnapshot {
 let blockingConnection=false;
 for(let slot=0;slot<ledger.nextSlot;slot++){
  const s=sessions[slot];if(!s)continue; // An ambiguous admission keeps its full hold.
  const deadline=typeof s.deadline==='number'&&Number.isFinite(s.deadline)?s.deadline:Infinity;
  if(s.sessionId&&!s.closed&&!s.providerUnavailable&&now>deadline+5000)blockingConnection=true;
  if(ledger.entries[String(slot)]!.settled||s.closed!==true||s.usageFinal!==true||s.finalization!=='confirmed'||now<deadline+30000||typeof s.usageSeconds!=='number'||!Number.isFinite(s.usageSeconds)||s.usageSeconds<0)continue;
  const entry=ledger.entries[String(slot)]!;
  const chargeMicros=(entry.plannerHoldMicros??LEGACY_PLANNER_HOLD_MICROS)+Math.ceil(Math.max(15,s.usageSeconds)*50_000/60);
  if(!Number.isSafeInteger(chargeMicros))throw new Error('Final usage could not be accounted');
  // Excess usage increases the debit too; it is never clamped to the reservation.
  ledger.entries[String(slot)]={...entry,chargeMicros,settled:true};
 }
 const reservedMicros=total(ledger);
 if(!Number.isSafeInteger(reservedMicros))throw new Error('Usage accounting is unavailable');
 const remainingMicros=config.siteBudgetMicros-reservedMicros;
 return {ledger,reservedMicros,remainingMicros,voiceAvailable:remainingMicros>=RESERVATION_MICROS&&ledger.nextSlot<MAX_SLOTS&&!blockingConnection,blockingConnection,maxSlots:MAX_SLOTS};
}
async function load(store:BudgetStore,now:number,config:BudgetConfig){
 const found=await store.getWithMetadata(BUDGET_KEY,{type:'json'});
 if(found&&!found.etag)throw new Error('Usage accounting could not be confirmed');
 const ledger=found?validateLedger(found.data):null;
 const sessions=await records(store,ledger?.nextSlot??8);
 return {found,snapshot:reconcile(ledger??bootstrap(sessions),sessions,now,config)};
}
// Read-only estimate: health cannot consume permits or rewrite accounting.
export async function inspectBudget(store:BudgetStore,now=Date.now(),config=budgetConfig('portfolio')):Promise<BudgetSnapshot>{return (await load(store,now,config)).snapshot;}
export async function reserveAdmission(store:BudgetStore,now=Date.now(),config=budgetConfig('portfolio')):Promise<{slot:number;budget:BudgetSnapshot}>{
 for(let attempt=0;attempt<12;attempt++){
  const {found,snapshot}=await load(store,now,config);
  if(!snapshot.voiceAvailable)throw new Error(snapshot.blockingConnection?'The guide is checking a previous connection before allowing more usage.':'This preview has reached its approved usage allowance.');
  const slot=snapshot.ledger.nextSlot++;
  snapshot.ledger.entries[String(slot)]={chargeMicros:RESERVATION_MICROS,settled:false,reservationMicros:RESERVATION_MICROS,plannerHoldMicros:PLANNER_HOLD_MICROS};
  const receipt=await store.setJSON(BUDGET_KEY,snapshot.ledger,found?{onlyIfMatch:found.etag!}:{onlyIfNew:true});
  if(receipt.modified){
   if(!receipt.etag)throw new Error('Usage accounting could not confirm the reservation');
   const reservedMicros=total(snapshot.ledger),remainingMicros=config.siteBudgetMicros-reservedMicros;
   return {slot,budget:{...snapshot,reservedMicros,remainingMicros,voiceAvailable:remainingMicros>=RESERVATION_MICROS&&snapshot.ledger.nextSlot<MAX_SLOTS}};
  }
 }
 throw new Error('Usage accounting is busy. Please try again shortly.');
}
