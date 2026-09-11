import assert from 'node:assert/strict';
import test from 'node:test';
import {BUDGET_KEY,inspectBudget,reserveAdmission,type BudgetStore} from '../netlify/functions/budget.mjs';
const NOW=1_000_000;
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
 assert.deepEqual(admissions.map(r=>r.value.slot).sort((a,b)=>a-b),[8,9,10,11]);
 const current=await inspectBudget(store,NOW);assert.equal(current.reservedMicros,3700000);assert.equal(current.remainingMicros,300000);assert.equal(current.voiceAvailable,false);
 for(const [key,value]of original)assert.deepEqual(store.values.get(key),value);
});
test('settlement is applied once; later requests do not repeatedly refund the same session',async()=>{
 const store=new MemoryStore();await reserveAdmission(store,NOW);await reserveAdmission(store,NOW);
 const info=await inspectBudget(store,NOW);assert.equal(info.reservedMicros,2700000);
 store.put('sessions/0',session({usageSeconds:0}));
 assert.equal((await inspectBudget(store,NOW)).reservedMicros,2700000);
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
 const s=new MemoryStore();s.ambiguous=true;await assert.rejects(reserveAdmission(s,NOW),/confirm/);
 s.ambiguous=false;const next=await reserveAdmission(s,NOW);assert.equal(next.slot,9);
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
