/** No-cost integration verification for actual shipped page-awareness/personality scripts.
 * AGENTMART_BASE=http://localhost:8793 PORTFOLIO_BASE=http://localhost:8794 node verify-awareness.mjs
 * All non-GET requests are intercepted. Microphone/RTC/provider responses are synthetic.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let chromium;
for(const candidate of [process.env.PLAYWRIGHT_MODULE,'playwright','/Users/shanto/.npm/_npx/31e32ef8478fbf80/node_modules/playwright'].filter(Boolean))try{({chromium}=require(candidate));break}catch{}
if(!chromium)throw new Error('An installed Playwright package is required.');
const root=path.dirname(fileURLToPath(import.meta.url));
const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()).replace(/[ :]/g,'-');
const output=process.env.OUTPUT_DIR||path.join(root,'output/playwright','awareness-'+stamp);
await fs.mkdir(output,{recursive:true});
const configs=[{id:'agentmart',url:process.env.AGENTMART_BASE},{id:'portfolio',url:process.env.PORTFOLIO_BASE}].filter(site=>site.url);
if(!configs.length)throw new Error('Provide AGENTMART_BASE and/or PORTFOLIO_BASE.');
const report={testedAtCentral:new Date().toLocaleString('en-US',{timeZone:'America/Chicago'})+' Central Time',mode:'Automated shipped-script integration; microphone, RTC and every mutating API request mocked. No admissions or paid model calls.',sites:[]};
const browser=await chromium.launch({headless:process.env.HEADED!=='1',channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'});
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const settle=()=>new Promise(resolve=>setTimeout(resolve,100));
async function waitUntil(predicate,message,timeout=5000){const end=Date.now()+timeout;while(Date.now()<end){if(await predicate())return;await settle()}throw new Error(message)}

async function fixture(config,data){
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await context.addInitScript(()=>{
  window.__allowMockMic=false;window.__rtcSent=[];window.__activities=[];window.__mockTrack={enabled:true,stop(){this.stopped=true}};
  window.addEventListener('site:activity',event=>window.__activities.push(event.detail));
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{
   if(!window.__allowMockMic)throw new DOMException('Denied by no-cost verification','NotAllowedError');
   return{getTracks:()=>[window.__mockTrack],getAudioTracks:()=>[window.__mockTrack]};
  }});
  HTMLMediaElement.prototype.play=async function(){};
  class Channel extends EventTarget{
   readyState='open';send(payload){const event=JSON.parse(payload);window.__rtcSent.push(event);if(event.type==='session.instructions.append')queueMicrotask(()=>this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({type:'session.instructions.appended',client_event_id:event.event_id})})));if(event.type==='session.close')queueMicrotask(()=>this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({type:'session.closed'})})));}close(){this.readyState='closed'}
  }
  window.RTCPeerConnection=class extends EventTarget{iceGatheringState='complete';connectionState='new';addTrack(){}createDataChannel(){this.channel=new Channel();window.__channel=this.channel;return this.channel}async createOffer(){return{type:'offer',sdp:'v=0\r\n'}}async setLocalDescription(value){this.localDescription=value}async setRemoteDescription(){this.connectionState='connected';queueMicrotask(()=>this.channel.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({type:'session.started'})})))}close(){this.connectionState='closed'}};
 });
 const requests=[],errors=[],blocked=[];let nextActions=[],nextPerformance={emotion:'happy',delivery:'warm'};let holdProactive=false,pendingRoute;
 await context.route('**/*',async route=>{
  const request=route.request();if(['GET','HEAD'].includes(request.method()))return route.continue();
  const endpoint=new URL(request.url()).pathname;
  const body=JSON.parse(request.postData()||'{}');requests.push({endpoint,body});
  const json=(value)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
  if(endpoint==='/api/live')return json({token:'awareness-test-only',durationSeconds:600,sdp:'v=0\r\n'});
  if(endpoint==='/api/chat')return json({token:'awareness-test-only',durationSeconds:600});
  if(endpoint==='/api/end')return json({ok:true});
  if(endpoint==='/api/guide'){
   const result={answer:'Mock response about the current website. What would you like to explore?',actions:nextActions,performance:nextPerformance};
   nextActions=[];
   if(body.mode==='proactive'&&holdProactive){pendingRoute={route,result};return}
   return json(result);
  }
  blocked.push({endpoint,method:request.method()});return route.fulfill({status:403,body:'Blocked by no-cost awareness fixture'});
 });
 const page=await context.newPage();page.setDefaultTimeout(6000);
 page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
 await page.goto(config.url,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.siteGuide?.getContext&&document.querySelector('.live-guide'));
 await page.clock.install();
 const tick=async ms=>{await page.clock.fastForward(ms);await settle()};
 const getContext=()=>page.evaluate(()=>siteGuide.getContext());
 const guideRequests=mode=>requests.filter(r=>r.endpoint==='/api/guide'&&(!mode||r.body.mode===mode));
 const emit=event=>page.evaluate(event=>window.__channel.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(event)})),event);
 let speechIndex=0;
 const speak=async message=>{speechIndex++;const before=guideRequests().length;await emit({type:'session.input_transcript.delta',delta:message,start_ms:speechIndex*10000,end_ms:speechIndex*10000+1000});await emit({type:'session.delegation.created',delegation:{id:'awareness-'+speechIndex}});await waitUntil(()=>guideRequests().length>before,'Delegated mock request missing');await settle()};
 const begin=async()=>{await page.evaluate(()=>window.__allowMockMic=true);await page.locator('.live-presence').click();await waitUntil(()=>page.locator('.live-guide').evaluate(e=>e.classList.contains('connected')),'Mock session did not connect');};
 const end=async()=>{await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.keyboard.press('Escape');await tick(5100);await waitUntil(()=>page.locator('.live-guide').evaluate(e=>!e.classList.contains('connected')),'Session did not end');};
 const nativeOpen=async(index=0)=>{const locator=page.locator(config.id==='portfolio'?'[data-project]':'[data-detail]').filter({visible:true}).nth(index);const item=await locator.getAttribute(config.id==='portfolio'?'data-project':'data-detail');await locator.click();await tick(450);return item};
 const dismiss=async()=>{await page.locator(config.id==='portfolio'?'#close-project':'dialog[open] .close-dialog').click();await tick(450)};
 const nativeFilter=async(index=0)=>{await page.locator(config.id==='portfolio'?'[data-filter]':'#chips [data-category]').filter({visible:true}).nth(index).click();await tick(450)};
 const setReply=(actions=[],performance={emotion:'happy',delivery:'warm'})=>{nextActions=actions;nextPerformance=performance};
 return{context,page,requests,errors,blocked,tick,getContext,guideRequests,emit,speak,begin,end,nativeOpen,dismiss,nativeFilter,setReply,hold:()=>{holdProactive=true},release:async()=>{holdProactive=false;if(pendingRoute){const p=pendingRoute;pendingRoute=null;await p.route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(p.result)}).catch(()=>{})}},close:async()=>{data.network.push({mockedRequests:requests.map(r=>({endpoint:r.endpoint,mode:r.body.mode||null})),blocked,errors});await context.close()}};
}

async function verify(config){
 const data={id:config.id,url:config.url,checks:[],network:[],screenshots:[]};report.sites.push(data);
 async function check(name,fn){try{const detail=await fn();data.checks.push({name,result:'PASS',detail});console.log('PASS',config.id,name)}catch(error){data.checks.push({name,result:'FAIL',error:error.message});console.error('FAIL',config.id,name,error.message)}}
 async function scenario(name,fn){let f;try{f=await fixture(config,data);await fn(f)}catch(error){data.checks.push({name,result:'FAIL',error:error.message});console.error('FAIL',config.id,name,error.message)}finally{if(f)await f.close()}}
 await scenario('Native context scenario',async f=>{
  const {page}=f;
  await check('Native detail opening and dismissal expose known item context',async()=>{const id=await f.nativeOpen();const ctx=await f.getContext();assert(ctx.openItem===id,'Open item missing or incorrect');assert(ctx.items.some(item=>item.id===id&&item.summary&&item.label),'Owned item facts missing');assert(ctx.recentActions.some(action=>action.type==='open'&&action.target===id),'Trusted native open history missing');await f.dismiss();assert((await f.getContext()).openItem===null,'Dismissed item remains active');return{id}});
  await check('Visible item context follows desktop and mobile viewport',async()=>{for(const width of [1440,390]){await page.setViewportSize({width,height:900});const selector=config.id==='portfolio'?'[data-project]':'[data-product]';await page.locator(selector).first().scrollIntoViewIfNeeded();await f.tick(500);const ctx=await f.getContext();assert(ctx.visibleItems.length>0&&ctx.visibleItems.length<=8,'Visible items empty or unbounded');const visible=await page.locator(selector).evaluateAll(nodes=>nodes.filter(node=>{const r=node.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}).map(node=>node.dataset.project||node.dataset.product));assert(ctx.visibleItems.every(id=>visible.includes(id)),'Offscreen item reported visible');assert(ctx.items.length<=4,'Item summaries unbounded');const file=config.id+'-awareness-'+width+'.png';await page.screenshot({path:path.join(output,file)});data.screenshots.push(file)}await page.setViewportSize({width:1440,height:1000})});
  await check('Recent native actions bounded; synthetic model changes excluded',async()=>{for(let i=0;i<12;i++)await f.nativeFilter(i%2);const before=await f.getContext();assert(before.recentActions.length===8,'Recent action buffer should retain eight actions');const activityCount=await page.evaluate(()=>__activities.length);await page.evaluate(()=>{siteGuide.applyActions([{type:'theme',value:'rose'},{type:'navigate',target:siteGuide.sections[0].id}]);document.querySelector('[data-filter],[data-category]')?.click()});await f.tick(1000);assert(await page.evaluate(()=>__activities.length)===activityCount,'Model/synthetic action emitted visitor activity');assert(JSON.stringify((await f.getContext()).recentActions)===JSON.stringify(before.recentActions),'Model action polluted native history')});
 });
 await scenario('Runtime privacy and performance scenario',async f=>{
  const {page}=f;await f.begin();
  await check('Delegated request carries current context and bounded transcript',async()=>{const id=await f.nativeOpen();await f.speak('Explain this item.');const body=f.guideRequests('visitor').at(-1)?.body||f.guideRequests().at(-1).body;assert(body.awareness?.openItem===id,'Runtime did not send active item awareness');assert(body.awareness.intent?.label==='evaluating'&&body.awareness.intent.confidence==='medium'&&body.awareness.intent.evidence.includes(id),'Tentative current-item intent missing');assert(body.awareness.intent.evidence.length<=4&&body.awareness.visibleItems.length<=8&&body.awareness.recentActions.length<=8,'Awareness bounds exceeded');assert(JSON.stringify(body.state||{})==='{}','Runtime sent raw page state');for(let i=0;i<12;i++){await f.emit({type:'session.output_transcript.delta',delta:'Mock answer '+i});await f.speak('Question '+i+' '+'.'.repeat(900))}const last=f.guideRequests().at(-1).body;assert(last.history.length<=8&&last.history.every(line=>line.content.length<=800),'Transcript request exceeds bounds');assert(last.message.length<=600,'Visitor message exceeds bound');assert(await page.locator('.live-transcript p').count()<=16,'Rendered transcript exceeds bound');await f.dismiss()});
  await check('Form values, search values and arbitrary DOM text never enter page awareness',async()=>{const sentinel='PRIVATE_FORM_SENTINEL_7d09';if(config.id==='agentmart'){await page.locator('#search').fill(sentinel);await f.tick(500);await page.locator('#search').fill('');await page.locator('#sell').click();await page.locator('#seller-form input[name="name"]').fill(sentinel);await page.locator('#seller-form textarea').fill(sentinel+' details');await f.tick(700)}else await page.locator('#live-message').evaluate((el,value)=>{el.value=value},sentinel);await page.evaluate(value=>{const p=document.createElement('p');p.textContent=value;document.body.append(p)},sentinel);await f.speak('Tell me what is on the website.');const request=f.guideRequests().at(-1).body;assert(!JSON.stringify(request).includes(sentinel),'Private form/DOM text leaked in guide request');assert(!JSON.stringify(await page.evaluate(()=>__rtcSent)).includes(sentinel),'Private form/DOM text leaked in RTC context');assert(JSON.stringify(request.state||{})==='{}','Raw state leaked');await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()))});
  await check('Seven personality delivery enums render and return to neutral',async()=>{const deliveries=['neutral','warm','laugh','mock_cry','mock_grumpy','whisper','surprised'];const emotions=['calm','happy','playful','sad','angry','thoughtful','excited'];for(let i=0;i<deliveries.length;i++){f.setReply([],{emotion:emotions[i],delivery:deliveries[i]});await f.speak('Perform delivery '+deliveries[i]);await waitUntil(()=>page.locator('.live-guide').evaluate((e,value)=>e.dataset.delivery===value,deliveries[i]),'Delivery did not render '+deliveries[i]);assert(await page.locator('.live-face').getAttribute('data-emotion')===emotions[i],'Performance emotion not applied');await f.tick(4600);assert(await page.locator('.live-guide').evaluate(e=>!e.dataset.delivery||e.dataset.delivery==='neutral'),'Delivery did not expire')}return{deliveries:7,expiryMs:4600}});
  await check('Model action results do not trigger unsolicited requests',async()=>{const prior=f.guideRequests('proactive').length;f.setReply([{type:'theme',value:'ocean'},{type:'navigate',target:config.id==='portfolio'?'work':'catalog'}]);await f.speak('Show me the work and switch the palette.');await f.tick(7000);assert(f.guideRequests('proactive').length===prior,'Model action triggered a proactive request');assert(await page.evaluate(()=>siteGuide.getState().theme)==='ocean','Mock delegated action not applied')});
  await f.end();
 });
 await scenario('Proactive timing scenario',async f=>{
  const {page}=f;await f.begin();
  await check('Context synchronization deduplicates unchanged state',async()=>{await f.tick(500);const count=await page.evaluate(()=>__rtcSent.filter(e=>e.type==='session.thinking.append').length);await page.evaluate(()=>{for(let i=0;i<12;i++)window.dispatchEvent(new CustomEvent('site:changed'))});await f.tick(500);assert(await page.evaluate(()=>__rtcSent.filter(e=>e.type==='session.thinking.append').length)===count,'Unchanged context was repeated')});
  await check('Proactive dwell debounce and 25-second admission interval',async()=>{await f.tick(15000);await f.nativeFilter(1);await f.tick(2000);await f.nativeFilter(0);await f.tick(5000);assert(f.guideRequests('proactive').length===0,'Proactive request before interval/dwell');await f.tick(4000);await waitUntil(()=>f.guideRequests('proactive').length===1,'Proactive request missing after stable dwell');const body=f.guideRequests('proactive')[0].body;assert(body.awareness?.recentActions.length<=8,'Proactive recent actions unbounded');assert(JSON.stringify(body.state||{})==='{}','Proactive sent raw state');const count=f.guideRequests('proactive').length;await f.nativeFilter(1);await f.tick(6500);assert(f.guideRequests('proactive').length===count,'Proactive rate limit failed')});
  await check('Mute cancels pending proactive commentary',async()=>{await page.locator('.live-presence').click();assert(await page.locator('.live-guide').evaluate(e=>e.classList.contains('muted')),'Mock session did not mute');const count=f.guideRequests('proactive').length;await f.nativeFilter(0);await f.tick(30000);assert(f.guideRequests('proactive').length===count,'Proactive request while muted')});
  await check('End clears pending awareness work and microphone ownership',async()=>{await page.locator('.live-presence').click();await f.nativeFilter(1);await f.end();const count=f.requests.length;await f.tick(30000);assert(f.requests.length===count,'Network activity continued after End');assert(await page.evaluate(()=>__mockTrack.stopped===true),'Microphone track not stopped')});
 });
 await scenario('Proactive stale-response scenario',async f=>{
  const {page}=f;await f.begin();await f.tick(19000);f.hold();f.setReply([],{emotion:'angry',delivery:'mock_grumpy'});await f.nativeFilter(1);await f.tick(6500);
  await check('New visitor action discards an in-flight proactive response',async()=>{await waitUntil(()=>f.guideRequests('proactive').length===1,'Held proactive request missing');await f.nativeFilter(0);const before=await page.evaluate(()=>__rtcSent.filter(e=>e.type==='session.commentary.append').length);await f.release();await f.tick(500);assert(await page.evaluate(()=>__rtcSent.filter(e=>e.type==='session.commentary.append').length)===before,'Stale proactive commentary was delivered');assert(await page.locator('.live-guide').getAttribute('data-delivery')!=='mock_grumpy','Stale proactive performance rendered')});await f.end();
 });
 await scenario('Visitor personality preferences scenario',async f=>{
  const {page}=f;await f.begin();
  await check('Professional request suppresses theatrics; last explicit preference wins',async()=>{f.setReply([{type:'emotion',value:'angry'}],{emotion:'angry',delivery:'mock_grumpy'});await f.speak('Keep it professional.');assert(await page.locator('.live-guide').getAttribute('data-delivery')==='neutral','Professional request retained theatrical delivery');assert(await page.locator('.live-face').getAttribute('data-emotion')==='calm','Professional request retained theatrical expression');f.setReply([],{emotion:'playful',delivery:'laugh'});await f.speak('Be serious, actually be playful.');assert(await page.locator('.live-guide').getAttribute('data-delivery')==='laugh','Latest playful preference was not restored');f.setReply([{type:'emotion',value:'angry'}],{emotion:'playful',delivery:'laugh'});await f.speak('Make me laugh, actually be serious.');assert(await page.locator('.live-guide').getAttribute('data-delivery')==='neutral','Latest serious preference was not respected');assert(await page.locator('.live-face').getAttribute('data-emotion')==='calm','Emotion action bypassed professional preference')});
  await check('Give me space disables proactive comments and idle invitations',async()=>{await f.speak('Give me space and stop interrupting.');const before=f.guideRequests().length;const sent=await page.evaluate(()=>__rtcSent.length);await f.nativeFilter(1);await f.tick(35000);await f.nativeFilter(0);await f.tick(35000);assert(f.guideRequests().length===before,'Quiet preference allowed proactive request');const messages=await page.evaluate(index=>__rtcSent.slice(index).filter(event=>event.type==='session.commentary.append'),sent);assert(messages.length===0,'Quiet preference allowed unsolicited speech')});await f.end();
 });
 await scenario('Unsolicited commentary cap scenario',async f=>{
  await f.begin();
  await check('At most two unsolicited suggestions across continued browsing',async()=>{await f.tick(19000);await f.nativeFilter(1);await f.tick(6500);await waitUntil(()=>f.guideRequests('proactive').length===1,'First proactive suggestion absent');await f.tick(15000);await f.nativeFilter(0);await f.tick(11000);await waitUntil(()=>f.guideRequests('proactive').length===2,'Second proactive suggestion absent');for(let i=0;i<3;i++){await f.nativeFilter(i%2);await f.tick(15000)}assert(f.guideRequests('proactive').length===2,'Two-suggestion cap exceeded');const idle=await f.page.evaluate(()=>__rtcSent.filter(event=>event.type==='session.commentary.append'&&/visitor is quiet|final gentle invitation/.test(event.content)).length);assert(f.guideRequests('proactive').length+idle<=2,'Shared idle/proactive cap exceeded')});await f.end();
 });
 await check('No browser errors, unknown mutations or paid network requests',async()=>{assert(data.network.every(n=>n.errors.length===0),'Browser errors '+JSON.stringify(data.network.flatMap(n=>n.errors)));assert(data.network.every(n=>n.blocked.length===0),'Unexpected mutating requests');return{requests:data.network.reduce((sum,n)=>sum+n.mockedRequests.length,0),allMutatingRequests:'intercepted'}});
}
try{for(const config of configs)await verify(config)}finally{await browser.close();await fs.writeFile(path.join(output,'verification.json'),JSON.stringify(report,null,2));await fs.writeFile(path.join(output,'EVIDENCE_MATRIX.md'),`# Awareness and personality integration evidence\n\n${report.testedAtCentral}\n\n${report.mode} This is automation evidence, not a real microphone, provider intelligence or real Chrome-profile pass.\n\n| Site | Check | Result | Error |\n|---|---|---|---|\n${report.sites.flatMap(s=>s.checks.map(c=>`| ${s.id} | ${c.name} | ${c.result} | ${(c.error||'').replaceAll('|','/').replaceAll('\n',' ')} |`)).join('\n')}\n`)}
const checks=report.sites.flatMap(s=>s.checks),failed=checks.filter(c=>c.result==='FAIL');console.log(JSON.stringify({output,checks:checks.length,failed:failed.length}));if(failed.length)process.exitCode=1;
