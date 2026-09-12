import assert from 'node:assert/strict';
import test from 'node:test';
import {BUDGET_KEY,inspectBudget,reserveAdmission,budgetConfig,type BudgetStore} from '../netlify/functions/budget.mjs';
const NOW=1_000_000;
const expanded=budgetConfig('portfolio',key=>({LIVE_TOTAL_APPROVED_USD:'20',LIVE_AGENTMART_BUDGET_USD:'9',LIVE_PORTFOLIO_BUDGET_USD:'9'} as Record<string,string>)[key]);
function session(overrides:Record<string,unknown>={}){return {tokenHash:'a'.repeat(64),createdAt:1,deadline:120001,sessionId:'test-session',closed:true,usageFinal:true,finalization:'confirmed',usageSeconds:15,...overrides};}
class MemoryStore implements BudgetStore {
 values=new Map<string,{data:unknown;etag:string}>();counter=0;ambiguous=false;conflicts=0;
 constructor(overrides:Record<string,unknown>={}){for(let n=0;n<8;n++)this.put(`sessions/${n}`,session(overrides));}
 put(key:string,data:unknown){this.values.set(key,{data:structuredClone(data),etag:String(++this.counter)});}
 async get(key:string){return structuredClone(this.values.get(key)?.data??null);}
 async getWithMetadata(key:string){return structuredClone(this.values.get(key)??null);}
 async setJSON(key:string,value:unknown,options:{onlyIfNew?:boolean;onlyIfMatch?:string}){
  await Promise.resolve();
  if(this.conflicts-->0)return {modified:false};
  const old=this.values.get(key);
  if(options.onlyIfNew&&old||options.onlyIfMatch&&options.onlyIfMatch!==old?.etag)return {modified:false};
  this.put(key,value);return {modified:true,etag:this.ambiguous?undefined:this.values.get(key)!.etag};
 }
}
test('health estimates confirmed final usage without creating or mutating ledger/history',async()=>{
 const store=new MemoryStore();const before=structuredClone([...store.values]);
 const info=await inspectBudget(store,NOW);
 assert.equal(info.reservedMicros,8*212500);assert.equal(info.remainingMicros,2300000);assert.equal(info.voiceAvailable,true);
 assert.deepEqual([...store.values],before);assert.equal(store.values.has(BUDGET_KEY),false);
});
test('concurrent first reservations serialize bootstrap and cannot overspend or reuse slots',async()=>{
 const store=new MemoryStore();const original=structuredClone([...store.values]);
 const results=await Promise.allSettled(Array.from({length:12},()=>reserveAdmission(store,NOW)));
 const admissions=results.filter((r):r is PromiseFulfilledResult<Awaited<ReturnType<typeof reserveAdmission>>>=>r.status==='fulfilled');
 assert.deepEqual(admissions.map(r=>r.value.slot).sort((a,b)=>a-b),[8]);
 const current=await inspectBudget(store,NOW);assert.equal(current.reservedMicros,2950000);assert.equal(current.remainingMicros,1050000);assert.equal(current.voiceAvailable,false);
 for(const [key,value]of original)assert.deepEqual(store.values.get(key),value);
});
test('settlement is applied once; later requests do not repeatedly refund the same session',async()=>{
 const store=new MemoryStore();await reserveAdmission(store,NOW,expanded);await reserveAdmission(store,NOW,expanded);
 const info=await inspectBudget(store,NOW);assert.equal(info.reservedMicros,4200000);
 store.put('sessions/0',session({usageSeconds:0}));
 assert.equal((await inspectBudget(store,NOW)).reservedMicros,4200000);
});
test('unknown close and unavailable-provider states retain complete holds',async()=>{
 const store=new MemoryStore({closed:false,usageFinal:false,providerUnavailable:true,finalization:'provider_unavailable'});
 const info=await inspectBudget(store,NOW);assert.equal(info.reservedMicros,4000000);assert.equal(info.blockingConnection,false);
 await assert.rejects(reserveAdmission(store,NOW),/approved usage/);
 assert.equal(store.values.has(BUDGET_KEY),false);
});
test('unconfirmed active connection blocks admission even when other sessions settle',async()=>{
 const store=new MemoryStore();store.put('sessions/0',session({closed:false,usageFinal:false}));
 const info=await inspectBudget(store,NOW);assert.equal(info.voiceAvailable,false);assert.equal(info.blockingConnection,true);
 await assert.rejects(reserveAdmission(store,NOW),/previous connection/);
});
test('final usage floor, upward rounding, grace interval and over-reservation debits are conservative',async()=>{
 const store=new MemoryStore();store.put('sessions/0',session({usageSeconds:0}));store.put('sessions/1',session({usageSeconds:15.001}));
 assert.equal((await inspectBudget(store,NOW)).reservedMicros,1700001);
 assert.equal((await inspectBudget(store,120002)).reservedMicros,4000000);
 store.put('sessions/0',session({usageSeconds:5000}));
 const info=await inspectBudget(store,NOW);assert.ok(info.reservedMicros>4000000);assert.equal(info.voiceAvailable,false);assert.ok(info.remainingMicros<0);
 await assert.rejects(reserveAdmission(store,NOW),/approved usage/);
});
test('missing/malformed history, corrupt accounting and missing etags fail closed',async()=>{
 const store=new MemoryStore();store.values.delete('sessions/0');await assert.rejects(inspectBudget(store,NOW),/Historical usage/);
 for(const bad of [null,{}, {version:1,nextSlot:8,entries:{}},{version:1,nextSlot:101,entries:{}}, {version:1,nextSlot:8,entries:Object.fromEntries(Array.from({length:8},(_,n)=>[n,{chargeMicros:-1,settled:true}]))}]){
  const s=new MemoryStore();s.put(BUDGET_KEY,bad);await assert.rejects(reserveAdmission(s,NOW),/accounting/);
 }
 const s=new MemoryStore();s.ambiguous=true;await assert.rejects(reserveAdmission(s,NOW,expanded),/confirm/);
 s.ambiguous=false;const next=await reserveAdmission(s,NOW,expanded);assert.equal(next.slot,9);
 const ledger=s.values.get(BUDGET_KEY)!;ledger.etag='';await assert.rejects(inspectBudget(s,NOW),/confirmed/);
});
test('nonfinal/invalid usage does not release holds and slot ceiling stays finite',async()=>{
 for(const usage of [NaN,Infinity,-1,'15',undefined]){
  const store=new MemoryStore({usageSeconds:usage});assert.equal((await inspectBudget(store,NOW)).reservedMicros,4000000);
 }
 const store=new MemoryStore();store.put(BUDGET_KEY,{version:1,nextSlot:100,entries:Object.fromEntries(Array.from({length:100},(_,n)=>[n,{chargeMicros:200000,settled:true}]))});
 await assert.rejects(reserveAdmission(store,NOW),/approved usage/);
});
test('CAS contention failure creates no reusable slot or accidental budget debit',async()=>{
 const store=new MemoryStore();store.conflicts=20;await assert.rejects(reserveAdmission(store,NOW),/busy/);
 assert.equal(store.values.has(BUDGET_KEY),false);
 store.conflicts=0;assert.equal((await reserveAdmission(store,NOW)).slot,8);
});

test('approved allocation defaults stay at $10 total; explicit tiers never remove the development hold',()=>{
 const defaults=budgetConfig('portfolio');assert.equal(defaults.siteBudgetMicros,4_000_000);assert.equal(defaults.totalApprovedMicros,10_000_000);assert.equal(defaults.developmentHoldMicros,2_000_000);
 assert.equal(expanded.siteBudgetMicros,9_000_000);
 for(const values of [{LIVE_TOTAL_APPROVED_USD:'11'},{LIVE_TOTAL_APPROVED_USD:'31'},{LIVE_TOTAL_APPROVED_USD:'20',LIVE_PORTFOLIO_BUDGET_USD:'15'},{LIVE_PORTFOLIO_BUDGET_USD:'4.001'},{LIVE_PORTFOLIO_BUDGET_USD:'NaN'},{LIVE_PORTFOLIO_BUDGET_USD:'-1'},{LIVE_PORTFOLIO_BUDGET_USD:''}])assert.throws(()=>budgetConfig('portfolio',key=>(values as Record<string,string>)[key]),/budget/);
 assert.throws(()=>budgetConfig('unknown'),/allocation/);
 const tier30=budgetConfig('agentmart',key=>({LIVE_TOTAL_APPROVED_USD:'30',LIVE_AGENTMART_BUDGET_USD:'14',LIVE_PORTFOLIO_BUDGET_USD:'14'} as Record<string,string>)[key]);
 assert.equal(tier30.agentmartBudgetMicros+tier30.portfolioBudgetMicros+tier30.developmentHoldMicros,tier30.totalApprovedMicros);
});
test('migration preserves old settled floors, unresolved holds and the append-only slot sequence',async()=>{
 const store=new MemoryStore();
 const entries=Object.fromEntries(Array.from({length:14},(_,n)=>[String(n),n===12?{chargeMicros:500_000,settled:false}:{chargeMicros:212_500,settled:true}]));
 store.put(BUDGET_KEY,{version:1,nextSlot:14,entries});
 const history=structuredClone([...store.values].filter(([key])=>key.startsWith('sessions/')));
 const admitted=await reserveAdmission(store,NOW,expanded);assert.equal(admitted.slot,14);
 const current=(await inspectBudget(store,NOW,expanded)).ledger;
 for(let n=0;n<14;n++)assert.deepEqual(current.entries[String(n)],entries[String(n)]);
 assert.deepEqual(current.entries['14'],{chargeMicros:1_250_000,settled:false,reservationMicros:1_250_000,plannerHoldMicros:600_000});
 assert.deepEqual([...store.values].filter(([key])=>key.startsWith('sessions/')),history);
});
test('ten minute settlement reserves every planner request and waits for confirmed final usage plus grace',async()=>{
 const store=new MemoryStore();await reserveAdmission(store,NOW,expanded);
 const deadline=NOW+600_000;
 store.put('sessions/8',session({createdAt:NOW,deadline,usageSeconds:600}));
 const before=await inspectBudget(store,deadline+29_999,expanded);assert.equal(before.ledger.entries['8']!.chargeMicros,1_250_000);assert.equal(before.ledger.entries['8']!.settled,false);
 const after=await inspectBudget(store,deadline+30_000,expanded);assert.equal(after.ledger.entries['8']!.chargeMicros,1_100_000);assert.equal(after.ledger.entries['8']!.plannerHoldMicros,600_000);
 store.put('sessions/8',session({createdAt:NOW,deadline,usageSeconds:0}));assert.equal((await inspectBudget(store,deadline+30_000,expanded)).ledger.entries['8']!.chargeMicros,612_500);
 store.put('sessions/8',session({createdAt:NOW,deadline,usageSeconds:900}));assert.equal((await inspectBudget(store,deadline+30_000,expanded)).ledger.entries['8']!.chargeMicros,1_350_000);
});
test('new-policy corrupted holds cannot be read as cheaper legacy entries',async()=>{
 for(const entry of [{chargeMicros:500_000,settled:false,reservationMicros:1_250_000,plannerHoldMicros:600_000},{chargeMicros:212_500,settled:true,reservationMicros:1_250_000,plannerHoldMicros:600_000},{chargeMicros:1_250_000,settled:false,reservationMicros:1_250_000}]){
  const store=new MemoryStore();const entries=Object.fromEntries(Array.from({length:8},(_,n)=>[n,n===0?entry:{chargeMicros:212_500,settled:true}]));store.put(BUDGET_KEY,{version:1,nextSlot:8,entries});await assert.rejects(inspectBudget(store,NOW),/accounting/);
 }
});
test('concurrent longer admissions enforce the configured ceiling across mixed policy histories',async()=>{
 const store=new MemoryStore();const results=await Promise.allSettled(Array.from({length:12},()=>reserveAdmission(store,NOW,expanded)));
 assert.equal(results.filter(result=>result.status==='fulfilled').length,5);
 const info=await inspectBudget(store,NOW,expanded);assert.equal(info.reservedMicros,7_950_000);assert.equal(info.remainingMicros,1_050_000);assert.equal(info.voiceAvailable,false);
 // A lower allocation preserves every existing debit and refuses new starts.
 assert.equal((await inspectBudget(store,NOW)).reservedMicros,7_950_000);await assert.rejects(reserveAdmission(store,NOW),/approved usage/);
});

const reviewEnv:Record<string,string>={LIVE_TOTAL_APPROVED_USD:'30',LIVE_AGENTMART_BUDGET_USD:'14',LIVE_PORTFOLIO_BUDGET_USD:'14',LIVE_REVIEW_BUDGET_USD:'3.75',LIVE_BUDGET_STORE:'live-budget-atmosphere-review-v1'};
const review=budgetConfig('portfolio',key=>reviewEnv[key]);
function freshStore(){const store=new MemoryStore();store.values.clear();return store;}
test('review allocation is explicit, fixed and a parent suballocation, never additive to $30',()=>{
 assert.equal(review.siteBudgetMicros,3_750_000);assert.equal(review.reviewBudgetMicros,3_750_000);assert.equal(review.totalApprovedMicros,30_000_000);assert.equal(review.developmentHoldMicros,2_000_000);assert.equal(review.storeName,reviewEnv.LIVE_BUDGET_STORE);
 for(const change of [{LIVE_REVIEW_BUDGET_USD:'4'}, {LIVE_BUDGET_STORE:'live-budget-release-v1'}, {LIVE_BUDGET_STORE:'arbitrary-store'}, {LIVE_TOTAL_APPROVED_USD:'20'}, {LIVE_REVIEW_BUDGET_USD:'0'}, {LIVE_AGENTMART_BUDGET_USD:'3'}, {LIVE_REVIEW_BUDGET_USD:undefined}, {LIVE_BUDGET_STORE:undefined}])assert.throws(()=>budgetConfig('portfolio',key=>({...reviewEnv,...change})[key as keyof typeof change]),/budget/);
 assert.throws(()=>budgetConfig('agentmart',key=>reviewEnv[key]),/budget/);
});
test('fresh review health is read only with zero phantom historical charges and first slot zero',async()=>{
 const store=freshStore();const before=structuredClone([...store.values]);const info=await inspectBudget(store,NOW,review);
 assert.equal(info.reservedMicros,0);assert.equal(info.remainingMicros,3_750_000);assert.equal(info.ledger.nextSlot,0);assert.equal(info.voiceAvailable,true);assert.deepEqual([...store.values],before);
 const admission=await reserveAdmission(store,NOW,review);assert.equal(admission.slot,0);assert.equal(admission.budget.reservedMicros,1_250_000);
});
test('review CAS races admit exactly three full holds and cannot exceed the funded $3.75 envelope',async()=>{
 const store=freshStore();const results=await Promise.allSettled(Array.from({length:20},()=>reserveAdmission(store,NOW,review)));
 const slots=results.filter((r):r is PromiseFulfilledResult<Awaited<ReturnType<typeof reserveAdmission>>>=>r.status==='fulfilled').map(r=>r.value.slot).sort();
 assert.deepEqual(slots,[0,1,2]);const info=await inspectBudget(store,NOW,review);assert.equal(info.reservedMicros,3_750_000);assert.equal(info.remainingMicros,0);assert.equal(info.voiceAvailable,false);
 await assert.rejects(reserveAdmission(store,NOW,review),/approved usage/);
});
test('review bootstrap refuses orphan sessions and historical ledgers; historical mode never starts empty',async()=>{
 for(const slot of [0,7,99]){const store=freshStore();store.put(`sessions/${slot}`,session());await assert.rejects(inspectBudget(store,NOW,review),/accounting/);}
 await assert.rejects(inspectBudget(freshStore(),NOW),/Historical usage/);
 const historical=new MemoryStore();await reserveAdmission(historical,NOW);await assert.rejects(inspectBudget(historical,NOW,review),/accounting/);
 const fresh=freshStore();await reserveAdmission(fresh,NOW,review);await assert.rejects(inspectBudget(fresh,NOW),/accounting/);
 fresh.values.delete(BUDGET_KEY);fresh.put('sessions/0',session());await assert.rejects(reserveAdmission(fresh,NOW,review),/accounting/);
});
test('review confirmed short sessions retain the full planner hold and never reset the ledger',async()=>{
 const store=freshStore();await reserveAdmission(store,NOW,review);store.put('sessions/0',session());
 const info=await inspectBudget(store,NOW,review);assert.equal(info.reservedMicros,612_500);assert.equal(info.ledger.entries['0']!.plannerHoldMicros,600_000);
 await reserveAdmission(store,NOW,review);const settled=await inspectBudget(store,NOW,review);assert.equal(settled.ledger.nextSlot,2);assert.equal(settled.reservedMicros,1_862_500);
});
