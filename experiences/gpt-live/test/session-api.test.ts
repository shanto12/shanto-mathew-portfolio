import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

// Evaluate the shipped handler and budget implementation with in-memory CAS
// storage and mocked provider calls. No live service or admission is contacted.
const harness = String.raw`
import fs from 'node:fs';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.argv[2],mode=process.argv[3];
let now=1_800_000_000_000,version=0,providerCalls=0;
const start=now;let requestedScene='rain';
class VirtualDate extends Date {static now(){return now;}}
const values=new Map();
const put=(key,data)=>values.set(key,{data:structuredClone(data),etag:String(++version)});
for(let n=0;n<8;n++)put('sessions/'+n,{tokenHash:'a'.repeat(64),createdAt:1,deadline:120001,sessionId:'legacy-'+n,closed:true,usageFinal:true,finalization:'confirmed',usageSeconds:15});
const store={get:async key=>structuredClone(values.get(key)?.data??null),getWithMetadata:async key=>structuredClone(values.get(key)??null),setJSON:async(key,data,options)=>{
 const old=values.get(key);
 if(options.onlyIfNew&&old||options.onlyIfMatch&&old?.etag!==options.onlyIfMatch)return{modified:false};
 put(key,data);return{modified:true,etag:values.get(key).etag};
}};
const env={OPENAI_API_KEY:'test-key',WATCHDOG_SECRET:'test-secret',SITE_ORIGIN:'https://local.test',LIVE_TOTAL_APPROVED_USD:'20',LIVE_AGENTMART_BUDGET_USD:'9',LIVE_PORTFOLIO_BUDGET_USD:'9'};
if(mode==='review'){values.clear();Object.assign(env,{LIVE_TOTAL_APPROVED_USD:'30',LIVE_AGENTMART_BUDGET_USD:'14',LIVE_PORTFOLIO_BUDGET_USD:'14',LIVE_REVIEW_BUDGET_USD:'3.75',LIVE_BUDGET_STORE:'live-budget-atmosphere-review-v1'});}
const site={id:'portfolio',title:'Test portfolio',context:'Factual test content',sections:[{id:'home',label:'Home'}]};
const context=vm.createContext({console,Response,Buffer,AbortSignal,URL,structuredClone,Date:VirtualDate,setTimeout,clearTimeout,Netlify:{env:{get:key=>env[key]}},fetch:async(url,options)=>{
 if(url.includes('watchdog-background')){const {slot}=JSON.parse(options.body);const old=values.get('sessions/'+slot).data;put('sessions/'+slot,{...old,ready:true});return new Response(null,{status:202});}
 providerCalls++;
 const body=JSON.parse(options.body);
 if(url.endsWith('/live/sessions')){assert.match(body.session.instructions,/rain, snow, wind/);assert.match(body.session.instructions,/until the client reports actual action results/);now+=20_000;return Response.json({id:'mock-live-session',transport:{sdp:'v=0\r\nmock-answer'}});}
 assert.ok(url.endsWith('/responses'));
 assert.match(body.instructions,/rain\/snow\/wind\/pond\/aurora\/constellation\/spotlight\/surprise\/clear/);
 return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify({answer:'I can show that scene.',actions:mode==='scenes'?[{type:'effect',value:requestedScene}]:[]})}]}]});
}});
const modules=new Map();
async function load(name){
 if(modules.has(name))return modules.get(name);
 let module;
 if(name==='api'||name==='budget'||name==='policy'||name==='origins')module=new vm.SourceTextModule(stripTypeScriptTypes(fs.readFileSync(root+'/'+name+'.mts','utf8')),{context});
 else{
  const exports=name==='crypto'?{randomBytes,createHash,timingSafeEqual}:name==='blobs'?{getStore:options=>{assert.equal(options.name,mode==='review'?'live-budget-atmosphere-review-v1':'live-budget-release-v1');return store}}:name==='site'?{default:site}:name==='ws'?{default:class{constructor(){throw new Error('Unexpected emergency close')}}}:{};
  module=new vm.SyntheticModule(Object.keys(exports),function(){for(const[k,v]of Object.entries(exports))this.setExport(k,v);},{context});
 }
 modules.set(name,module);
 await module.link(spec=>load(spec==='node:crypto'?'crypto':spec==='@netlify/blobs'?'blobs':spec==='ws'?'ws':spec.endsWith('site-context.json')?'site':spec.replace('./','').replace('.mjs','')));
 return module;
}
const module=await load('api');await module.evaluate();const handler=module.namespace.default;
const request=(route,body)=>new Request('https://local.test/api/'+route,{method:'POST',headers:{origin:'https://local.test','content-type':'application/json'},body:JSON.stringify(body)});
const call=(route,body)=>handler(request(route,body));
if(mode==='review'){
 const initial=await(await handler(new Request('https://local.test/api/health'))).json();
 assert.equal(initial.voiceAvailable,true);assert.equal(initial.budget.reservedUSD,0);assert.equal(initial.budget.admittedSessions,0);assert.equal(initial.budget.siteEnvelopeUSD,3.75);assert.equal(initial.budget.totalApprovedUSD,30);assert.equal(initial.budget.developmentHoldUSD,2);assert.equal(initial.budget.reviewEnvelopeUSD,3.75);assert.equal(initial.budget.fundedFrom,'agentmart earmark');assert.equal(initial.budget.allocationIsAdditional,false);assert.equal(values.size,0);
 for(let n=0;n<3;n++){const response=await call('chat',{});assert.equal(response.status,200);const data=await response.json();assert.equal(data.token.split('.')[0],String(n));assert.equal(data.durationSeconds,600);}
 const before=structuredClone([...values]);assert.equal((await call('chat',{})).status,400);assert.deepEqual([...values],before);assert.equal(providerCalls,0);
 const full=await(await handler(new Request('https://local.test/api/health'))).json();assert.equal(full.voiceAvailable,false);assert.equal(full.budget.reservedUSD,3.75);assert.equal(full.budget.remainingUSD,0);
} else if(mode==='scenes'){
 const session=await(await call('chat',{})).json();
 for(const scene of ['rain','snow','wind','pond','aurora','constellation','spotlight','surprise','clear']){requestedScene=scene;const response=await call('guide',{token:session.token,message:'Please show '+scene});assert.equal(response.status,200);assert.deepEqual((await response.json()).actions,[{type:'effect',value:scene}]);}
 requestedScene='execute arbitrary code';assert.equal((await call('guide',{token:session.token,message:'Please rain'})).status,400);
 requestedScene='rain';const proactive=await(await call('guide',{token:session.token,message:'Visitor is looking around',mode:'proactive'})).json();assert.deepEqual(proactive.actions,[]);
} else if(mode==='duration'){
 const response=await call('live',{sdp:'v=0\r\nmock-offer'});assert.equal(response.status,200);const result=await response.json();
 assert.equal(result.deadline,start+600000);assert.equal(result.durationSeconds,580,'Startup latency must reduce remaining time');
 const record=values.get('sessions/'+result.token.split('.')[0]).data;assert.equal(record.deadline,result.deadline);assert.equal(record.plannerLimit,30);
 const health=await(await handler(new Request('https://local.test/api/health'))).json();assert.equal(health.sessionSeconds,600);assert.equal(health.plannerRequests,30);assert.equal(health.budget.reservationUSD,1.25);assert.equal(health.budget.siteEnvelopeUSD,9);assert.equal(health.budget.totalApprovedUSD,20);assert.equal(health.budget.developmentHoldUSD,2);
 now=result.deadline-1;assert.equal((await call('guide',{token:result.token,message:'Tell me about this page'})).status,200);
 const before=providerCalls;now=result.deadline;assert.equal((await call('guide',{token:result.token,message:'More'})).status,400);assert.equal(providerCalls,before,'The authoritative deadline must reject late provider calls');
} else if(mode==='planner'){
 const result=await(await call('chat',{})).json();assert.equal(result.durationSeconds,600);assert.equal(result.deadline,start+600000);
 for(let i=0;i<30;i++)assert.equal((await call('guide',{token:result.token,message:'Show me the page'})).status,200);
 const before=providerCalls;assert.equal((await call('guide',{token:result.token,message:'More'})).status,429);assert.equal(providerCalls,before);
 const token='0.'+'b'.repeat(48);put('sessions/0',{...values.get('sessions/0').data,tokenHash:createHash('sha256').update(token).digest('hex'),closed:false,stopRequested:false,deadline:now+120000});
 for(let i=0;i<10;i++)assert.equal((await call('guide',{token,message:'Legacy request'})).status,200);
 assert.equal((await call('guide',{token,message:'More'})).status,429,'Historical reservation never buys thirty planner requests');
} else if(mode==='config'){
 env.LIVE_TOTAL_APPROVED_USD='10';const before=structuredClone([...values]);
 assert.equal((await handler(new Request('https://local.test/api/health'))).status,503);
 assert.equal((await call('live',{sdp:'v=0\r\nmock'})).status,400);assert.equal(providerCalls,0);assert.deepEqual([...values],before,'Invalid allocations must not write the ledger');
 delete env.LIVE_TOTAL_APPROVED_USD;delete env.LIVE_AGENTMART_BUDGET_USD;delete env.LIVE_PORTFOLIO_BUDGET_USD;
 const health=await(await handler(new Request('https://local.test/api/health'))).json();assert.equal(health.budget.totalApprovedUSD,10);assert.equal(health.budget.siteEnvelopeUSD,4);
}
`;
const sourceRoot=fileURLToPath(new URL('../netlify/functions',import.meta.url));
for(const [mode,description]of [['review','serves zero-cost fresh health and refuses a fourth funded admission'],['scenes','passes requested fixed scenes and rejects unknown provider actions'],['duration','reports the authoritative ten-minute deadline minus setup latency and denies late calls'],['planner','allows thirty new-session guide requests while preserving ten legacy permits'],['config','fails closed before writes/provider calls for invalid allocation and defaults to existing approval']]){
 test(`session API ${description}`,()=>{
  const result=spawnSync(process.execPath,['--experimental-vm-modules','--input-type=module','-',sourceRoot,mode!],{input:harness,encoding:'utf8',timeout:10000,maxBuffer:1024*1024});
  assert.ifError(result.error);assert.equal(result.status,0,result.stderr||result.stdout);
 });
}
