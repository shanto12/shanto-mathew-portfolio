// Integer microdollars avoid floating-point admission errors. Historical records
// stay untouched; this one CAS record serializes reservations and settlements.
export const BUDGET_KEY = 'budget-accounting-v1';
export const SITE_BUDGET_MICROS = 4_000_000;
export const RESERVATION_MICROS = 500_000;
export const PLANNER_HOLD_MICROS = 200_000; // All ten calls, even if none were used.
export const MAX_SLOTS = 100;
export type BudgetStore = {
 get(key:string, options:{type:'json'}):Promise<unknown>;
 getWithMetadata(key:string, options:{type:'json'}):Promise<{data:unknown;etag?:string}|null>;
 setJSON(key:string, value:unknown, options:{onlyIfNew:true;onlyIfMatch?:never}|{onlyIfNew?:never;onlyIfMatch:string}):Promise<{modified:boolean;etag?:string}>;
};
type Entry = {chargeMicros:number;settled:boolean};
export type BudgetLedger = {version:1;nextSlot:number;entries:Record<string,Entry>};
type Session = {tokenHash?:unknown;createdAt?:unknown;deadline?:unknown;sessionId?:unknown;closed?:unknown;usageFinal?:unknown;finalization?:unknown;usageSeconds?:unknown;providerUnavailable?:unknown};
export type BudgetSnapshot = {ledger:BudgetLedger;reservedMicros:number;remainingMicros:number;voiceAvailable:boolean;blockingConnection:boolean;maxSlots:number};
function validateLedger(value:unknown):BudgetLedger {
 if(!value||typeof value!=='object')throw new Error('Usage accounting is unavailable');
 const r=value as BudgetLedger;
 if(r.version!==1||!Number.isSafeInteger(r.nextSlot)||r.nextSlot<8||r.nextSlot>MAX_SLOTS||!r.entries||typeof r.entries!=='object'||Array.isArray(r.entries)||Object.keys(r.entries).length!==r.nextSlot)throw new Error('Usage accounting is unavailable');
 for(let n=0;n<r.nextSlot;n++){
  const e=r.entries[String(n)];
  if(!e||typeof e.settled!=='boolean'||!Number.isSafeInteger(e.chargeMicros)||e.chargeMicros<0||(!e.settled&&e.chargeMicros!==RESERVATION_MICROS)||(e.settled&&e.chargeMicros<PLANNER_HOLD_MICROS))throw new Error('Usage accounting is unavailable');
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
 return {version:1,nextSlot:8,entries:Object.fromEntries(sessions.map((_,n)=>[String(n),{chargeMicros:RESERVATION_MICROS,settled:false}]))};
}
function reconcile(ledger:BudgetLedger,sessions:(Session|null)[],now:number):BudgetSnapshot {
 let blockingConnection=false;
 for(let slot=0;slot<ledger.nextSlot;slot++){
  const s=sessions[slot];if(!s)continue; // An ambiguous admission keeps its full hold.
  const deadline=typeof s.deadline==='number'&&Number.isFinite(s.deadline)?s.deadline:Infinity;
  if(s.sessionId&&!s.closed&&!s.providerUnavailable&&now>deadline+5000)blockingConnection=true;
  if(ledger.entries[String(slot)]!.settled||s.closed!==true||s.usageFinal!==true||s.finalization!=='confirmed'||now<deadline+30000||typeof s.usageSeconds!=='number'||!Number.isFinite(s.usageSeconds)||s.usageSeconds<0)continue;
  const chargeMicros=PLANNER_HOLD_MICROS+Math.ceil(Math.max(15,s.usageSeconds)*50_000/60);
  if(!Number.isSafeInteger(chargeMicros))throw new Error('Final usage could not be accounted');
  // Excess usage increases the debit too; it is never clamped to the reservation.
  ledger.entries[String(slot)]={chargeMicros,settled:true};
 }
 const reservedMicros=total(ledger);
 if(!Number.isSafeInteger(reservedMicros))throw new Error('Usage accounting is unavailable');
 const remainingMicros=SITE_BUDGET_MICROS-reservedMicros;
 return {ledger,reservedMicros,remainingMicros,voiceAvailable:remainingMicros>=RESERVATION_MICROS&&ledger.nextSlot<MAX_SLOTS&&!blockingConnection,blockingConnection,maxSlots:MAX_SLOTS};
}
async function load(store:BudgetStore,now:number){
 const found=await store.getWithMetadata(BUDGET_KEY,{type:'json'});
 if(found&&!found.etag)throw new Error('Usage accounting could not be confirmed');
 const ledger=found?validateLedger(found.data):null;
 const sessions=await records(store,ledger?.nextSlot??8);
 return {found,snapshot:reconcile(ledger??bootstrap(sessions),sessions,now)};
}
// Read-only estimate: health cannot consume permits or rewrite accounting.
export async function inspectBudget(store:BudgetStore,now=Date.now()):Promise<BudgetSnapshot>{return (await load(store,now)).snapshot;}
export async function reserveAdmission(store:BudgetStore,now=Date.now()):Promise<{slot:number;budget:BudgetSnapshot}>{
 for(let attempt=0;attempt<12;attempt++){
  const {found,snapshot}=await load(store,now);
  if(!snapshot.voiceAvailable)throw new Error(snapshot.blockingConnection?'The guide is checking a previous connection before allowing more usage.':'This preview has reached its approved usage allowance.');
  const slot=snapshot.ledger.nextSlot++;
  snapshot.ledger.entries[String(slot)]={chargeMicros:RESERVATION_MICROS,settled:false};
  const receipt=await store.setJSON(BUDGET_KEY,snapshot.ledger,found?{onlyIfMatch:found.etag!}:{onlyIfNew:true});
  if(receipt.modified){
   if(!receipt.etag)throw new Error('Usage accounting could not confirm the reservation');
   const reservedMicros=total(snapshot.ledger),remainingMicros=SITE_BUDGET_MICROS-reservedMicros;
   return {slot,budget:{...snapshot,reservedMicros,remainingMicros,voiceAvailable:remainingMicros>=RESERVATION_MICROS&&snapshot.ledger.nextSlot<MAX_SLOTS}};
  }
 }
 throw new Error('Usage accounting is busy. Please try again shortly.');
}
