/** Merged portfolio GUI verification. Every POST is intercepted: no paid API calls.
 * PORTFOLIO_BASE=https://shanto-portfolio-live.netlify.app node verify-portfolio-merge.mjs
 * With no URL, serves the current preview public directory on an ephemeral local port.
 * Isolated Chrome automation; not human-profile, real speech, or provider evidence.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/shanto/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');
const root=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.resolve(root,'../public');
const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()).replace(/[ :]/g,'-');
const output=process.env.OUTPUT_DIR||path.join(root,'../output/playwright','portfolio-merge-'+stamp);
await fs.mkdir(output,{recursive:true});
let server;
let url=process.env.PORTFOLIO_BASE;
if(!url){
 const dir=publicDir;
 server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(dir,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(dir+path.sep))throw new Error();const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png'};res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));url='http://127.0.0.1:'+server.address().port;
}
const origin=new URL(url).origin;
const report={testedAtCentral:new Date().toLocaleString('en-US',{timeZone:'America/Chicago'})+' Central Time',url,mode:new URL(url).protocol==='http:'?'Local shipped preview files, isolated Chrome, all POST/media/RTC mocked':'Deployed production document/assets, isolated Chrome, all POST/media/RTC mocked',checks:[],apiRequests:[],pageErrors:[],consoleErrors:[],failedRequests:[],httpErrors:[],screenshots:[],headers:{},externalClicks:[]};
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:process.env.HEADED!=='1'});
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await context.addInitScript(()=>{
 window.__mergeAllowMic=false;window.__mergeEvents=[];
 Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{if(!window.__mergeAllowMic)throw new DOMException('Verification microphone denied','NotAllowedError');return new MediaStream();}});
 class Channel extends EventTarget{readyState='open';send(raw){const e=JSON.parse(raw);window.__mergeEvents.push(e);if(e.type==='session.instructions.append')queueMicrotask(()=>this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({type:'session.instructions.appended',client_event_id:e.event_id})})));if(e.type==='session.close')queueMicrotask(()=>this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({type:'session.closed'})})));}close(){this.readyState='closed';}}
 window.RTCPeerConnection=class extends EventTarget{iceGatheringState='complete';connectionState='new';addTrack(){}createDataChannel(){return window.__mergeChannel=this.channel=new Channel();}async createOffer(){return{type:'offer',sdp:'v=0\r\n'};}async setLocalDescription(v){this.localDescription=v;}async setRemoteDescription(){this.connectionState='connected';queueMicrotask(()=>this.channel.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({type:'session.started'})})));}close(){this.connectionState='closed';}};
});
await context.route('**/*',async route=>{
 const req=route.request(),target=new URL(req.url());
 if(req.method()==='POST'){
  const endpoint=target.pathname;const entry={endpoint,method:'POST',mocked:true};report.apiRequests.push(entry);
  if(target.origin!==origin)return route.fulfill({status:403,body:'External POST blocked by no-cost verification'});
  if(['/api/live','/api/chat'].includes(endpoint))return route.fulfill({json:{token:'mock-only-token',sdp:'v=0\r\n',durationSeconds:300}});
  if(endpoint==='/api/end')return route.fulfill({json:{ended:true}});
  if(endpoint==='/api/guide'){
   const body=req.postDataJSON();entry.mode=body.mode;entry.awareness=body.awareness;entry.rawStateKeys=Object.keys(body.state||{});
   const effect=String(body.message).match(/effect (confetti|sparkles|bounce|spotlight|clear)/)?.[1];
   return route.fulfill({json:{answer:'Mocked interface verification response.',actions:effect?[{type:'effect',value:effect}]:[],performance:{emotion:'playful',delivery:'warm'}}});
  }
  return route.fulfill({status:503,json:{message:'API disabled by verification'}});
 }
 if(req.isNavigationRequest()&&target.origin!==origin){report.externalClicks.push(target.origin+target.pathname);return route.fulfill({contentType:'text/html',body:'<!doctype html><title>External link target verified</title><p>Network navigation intercepted by no-cost verification.</p>'});}
 return route.continue();
});
const page=await context.newPage();page.setDefaultTimeout(6000);
page.on('pageerror',e=>report.pageErrors.push(e.message));
page.on('console',e=>{if(e.type()==='error')report.consoleErrors.push(e.text().slice(0,500));});
page.on('requestfailed',req=>report.failedRequests.push({url:new URL(req.url()).origin+new URL(req.url()).pathname,error:req.failure()?.errorText}));
page.on('response',res=>{if(res.status()>=400)report.httpErrors.push({url:new URL(res.url()).origin+new URL(res.url()).pathname,status:res.status()});});
async function step(name,fn){try{const detail=await fn();report.checks.push({name,result:'PASS',...(detail?{detail}:{})});console.log('PASS',name);}catch(e){report.checks.push({name,result:'FAIL',error:e.message});console.error('FAIL',name,e.message);await screenshot('failure-'+report.checks.length).catch(()=>{});}}
async function screenshot(name){const filename=name+'.png';await page.screenshot({path:path.join(output,filename),timeout:4000});report.screenshots.push(filename);}
async function state(){return page.evaluate(()=>siteGuide.getState());}
async function awareness(){return page.evaluate(()=>siteGuide.getContext());}
async function action(a){const result=await page.evaluate(a=>siteGuide.applyActions([a]),a);assert.ok(result[0]?.ok,JSON.stringify(result));return result;}
async function home(section='home'){await action({type:'navigate',target:section});await page.waitForFunction(()=>!document.querySelector('#home-view').hidden);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function verifyImage(selector){await page.locator(selector).evaluateAll(images=>images.forEach(img=>img.loading='eager'));await page.waitForFunction(selector=>[...document.querySelectorAll(selector)].every(img=>img.complete&&img.naturalWidth>0),selector,{timeout:10000});}
async function noOverflow(label){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' horizontal overflow');}
let projects=[];
try{
 await step('Merged page boots with all14 owned projects, bridge and denied-mic recovery',async()=>{
  const response=await page.goto(url,{waitUntil:'networkidle'});assert.ok(response.ok());report.headers=await response.allHeaders();
  await page.waitForFunction(()=>window.siteGuide?.getContext&&window.portfolioUI?.projects);
  projects=await page.evaluate(()=>portfolioUI.projects.map(p=>({slug:p.slug,title:p.title,name:p.name,url:p.url,repo:p.repo,image:p.image})));
  assert.equal(projects.length,14);assert.equal(new Set(projects.map(p=>p.slug)).size,14);assert.equal(await page.locator('#project-list [data-project]').count(),14);
  assert.equal(await page.locator('#project-picker option').count(),14);assert.equal(await page.locator('#all-projects-links a').count(),14);assert.equal((await awareness()).siteId,'portfolio');
  assert.ok(await page.locator('.live-presence').isVisible());assert.ok(await page.locator('.live-recovery').isVisible());assert.equal(report.apiRequests.length,0);
  return{projects:projects.map(p=>p.slug)};
 });
 await step('Desktop hero has controlled whitespace and visible primary content at1440×900',async()=>{
  await home();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await verifyImage('.hero-headshot');const geometry=await page.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:r.height};};return{identity:box('#home'),name:box('.name-line'),bio:box('.hero-bottom'),heading:box('.hero-right h1'),work:box('#work')};});
  assert.ok(geometry.identity.height<=1100,'Desktop hero too tall');assert.ok(geometry.heading.top<900,'Primary heading below initial viewport');assert.ok(geometry.bio.top-geometry.name.bottom<=150,'Excessive hero gap');assert.ok(geometry.work.top-geometry.identity.bottom<=150,'Excessive pre-gallery gap');await noOverflow('Desktop');await screenshot('desktop-hero');return geometry;
 });
 await step('Native header, hero, story and footer links route correctly, including same-hash navigation',async()=>{for(const target of ['work','story','experience','contact']){await page.locator(`.topbar nav a[href="#${target}"]`).click();await page.waitForFunction(t=>location.hash==='#'+t,target);}await page.locator('.signature').click();await page.waitForFunction(()=>!document.querySelector('#home-view').hidden&&(!location.hash||location.hash==='#'));await page.locator('.currently-building').click();await page.waitForFunction(()=>location.hash==='#work/agentmart-studio');await page.locator('.case-nav a').click();await home();await page.locator('.round-arrow').click();await page.waitForFunction(()=>location.hash==='#work');await page.locator('.hero-bio .underlined').click();await page.waitForFunction(()=>location.hash==='#story');await page.locator('.story-copy .underlined').click();await page.waitForFunction(()=>location.hash==='#experience');await page.locator('footer>a').last().click();await page.waitForFunction(()=>!location.hash||location.hash==='#');await page.locator('.footer-signature').click();await page.waitForFunction(()=>!document.querySelector('#home-view').hidden);});
 await step('Every gallery row changes preview image, description, case link and awareness',async()=>{
  await home('work');for(const [i,p]of projects.entries()){
   await page.locator(`#project-list [data-project="${i}"]`).click();assert.equal(await page.locator('#stage-link').getAttribute('href'),'#work/'+p.slug);assert.equal(await page.locator(`#project-list [data-project="${i}"]`).getAttribute('aria-pressed'),'true');await verifyImage('#project-image');
   assert.ok(await page.locator('#stage-description').textContent());const c=await awareness();assert.ok(c.visibleItems.includes(p.slug)||c.openItem===p.slug,'Selected preview absent from awareness '+p.slug);
  }await screenshot('desktop-gallery');return{nativeSelections:14};
 });
 await step('Desktop previous/next and keyboard wrap through the collection',async()=>{
  await page.locator('#project-list [data-project="0"]').click();await page.locator('#previous-project').click();assert.equal(await page.locator('#stage-link').getAttribute('href'),'#work/'+projects.at(-1).slug);await page.locator('#next-project').click();assert.equal(await page.locator('#stage-link').getAttribute('href'),'#work/'+projects[0].slug);
  const first=page.locator('#project-list [data-project="0"]');await first.focus();await page.keyboard.press('End');assert.equal(await page.locator('#stage-link').getAttribute('href'),'#work/'+projects.at(-1).slug);await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');assert.equal(await page.locator('#stage-link').getAttribute('href'),'#work/'+projects[1].slug);await page.keyboard.press('ArrowUp');assert.equal(await page.locator('#stage-link').getAttribute('href'),'#work/'+projects[0].slug);
 });
 await step('All14 case studies, image inspections, next-case links and collection return',async()=>{
  for(const [i,p]of projects.entries()){
   await home('work');await page.locator(`#project-list [data-project="${i}"]`).click();await page.locator('#stage-link').click();await page.waitForFunction(slug=>location.hash==='#work/'+slug&&!document.querySelector('#case-view').hidden,p.slug);assert.ok(await page.locator('#home-view').evaluate(e=>e.hidden));assert.equal((await awareness()).openItem,p.slug);assert.equal((await page.title()),p.title+' — Shanto Mathew');assert.ok(await page.locator('#case-view .case-boundary').textContent());assert.equal(await page.locator('#case-view .case-links a').first().getAttribute('href'),p.url);if(p.repo)assert.equal(await page.locator('#case-view .case-links a').nth(1).getAttribute('href'),p.repo);await verifyImage('#case-view img');await noOverflow('Case '+p.slug);
   for(const trigger of await page.locator('#case-view [data-inspect]').all()){await trigger.click();assert.ok(await page.locator('#image-dialog').evaluate(e=>e.open));await verifyImage('#inspected-image');assert.equal(await page.locator('#image-dialog-title').textContent(),p.title);await page.locator('#close-image').click();assert.ok(!await page.locator('#image-dialog').evaluate(e=>e.open));}
   const next=projects[(i+1)%projects.length];await page.locator('.case-next a').click();await page.waitForFunction(slug=>location.hash==='#work/'+slug,next.slug);await page.goBack();await page.waitForFunction(slug=>location.hash==='#work/'+slug,p.slug);await page.locator('.case-nav a').click();await page.waitForFunction(()=>!document.querySelector('#home-view').hidden&&location.hash==='#work');
  }return{caseStudies:14,inspectOpenClose:14,nextAndBack:14};
 });
 await step('Image zoom bounds, fit, Escape, backdrop and focus restoration',async()=>{
  await page.locator('#project-list [data-project="0"]').click();await page.locator('#stage-link').click();await page.locator('[data-inspect]').first().click();assert.equal(await page.locator('#zoom-level').textContent(),'100%');assert.ok(await page.locator('#zoom-out').isDisabled());for(let n=0;n<4;n++)await page.locator('#zoom-in').click();assert.equal(await page.locator('#zoom-level').textContent(),'300%');assert.ok(await page.locator('#zoom-in').isDisabled());await page.locator('#zoom-out').click();assert.equal(await page.locator('#zoom-level').textContent(),'250%');await page.locator('#zoom-fit').click();assert.equal(await page.locator('#zoom-level').textContent(),'100%');await screenshot('image-inspection');await page.keyboard.press('Escape');assert.ok(!await page.locator('#image-dialog').evaluate(e=>e.open));assert.ok(await page.locator('[data-inspect]').first().evaluate(e=>e===document.activeElement));await page.locator('[data-inspect]').first().click();const box=await page.locator('#image-dialog').boundingBox();await page.mouse.click(Math.max(1,box.x-4),Math.max(1,box.y-4));assert.ok(!await page.locator('#image-dialog').evaluate(e=>e.open));await home('work');
 });
 await step('All filter controls change the index, picker and keyboard selection together',async()=>{
  for(const [filter,count]of Object.entries({all:14,voice:6,security:2,agents:4,creative:2})){
   await page.locator(`.project-filters [data-filter="${filter}"]`).click();assert.equal(await page.locator('#project-list [data-project]').count(),count);assert.equal(await page.locator('#project-picker option').count(),count);assert.equal((await state()).filter,filter);await page.locator('#project-list [data-project]').first().focus();await page.keyboard.press('End');assert.equal(await page.locator('#project-list [aria-pressed="true"]').count(),1);await page.keyboard.press('Home');
  }await action({type:'filter',value:'all'});await page.locator('.project-filters [data-filter=voice]').click();await page.locator('#undo-changes').click();assert.equal((await state()).filter,'all','Native filter Undo did not restore full collection');const announcement=(await page.locator('#project-announcement').textContent()).trim();const selectedTitle=await page.evaluate(()=>portfolioUI.projects.find(p=>p.slug===portfolioUI.getSelected()).title);assert.ok(!announcement||announcement.includes(selectedTitle),'Undo left stale accessible project announcement: '+announcement);
 });
 await step('Career accordions, all sections, motion and verified contact-link destinations',async()=>{
  await home('experience');assert.equal(await page.locator('#career-list details').count(),10);for(const row of await page.locator('#career-list details').all()){const open=await row.evaluate(e=>e.open);await row.locator('summary').click();assert.equal(await row.evaluate(e=>e.open),!open);}
  for(const section of ['home','work','story','experience','practice','contact']){await home(section);assert.ok(await page.locator('#'+section).isVisible());await noOverflow(section);}
  for(const href of ['https://www.linkedin.com/in/shanto-mathew/','https://github.com/shanto12']){const link=page.locator(`#contact a[href="${href}"]`);assert.equal(await link.getAttribute('target'),'_blank');assert.ok((await link.getAttribute('rel')).includes('noopener'));const popupPromise=context.waitForEvent('page');await link.click();const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');assert.equal(new URL(popup.url()).origin+new URL(popup.url()).pathname,new URL(href).origin+new URL(href).pathname);await popup.close();}
  await home();await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('#motion-toggle').click();assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'true');assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('motion-paused')));await page.locator('#motion-toggle').click();assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'false');await page.emulateMedia({reducedMotion:'reduce'});
 });
 await step('Bridge themes, spacing, safe rewrite, highlight, undo and reset work from a case route',async()=>{
  await home('work');await page.locator('#stage-link').click();for(const target of ['story','practice','home'])await home(target);for(const project of projects){await action({type:'navigate',target:project.slug});assert.equal((await awareness()).openItem,project.slug);assert.ok(await page.locator('#home-view').evaluate(e=>e.hidden));}await home('home');
  for(const value of ['original','midnight','ocean','rose','forest']){await action({type:'theme',value});assert.equal((await state()).theme,value);}
  for(const value of ['compact','comfortable']){await action({type:'density',value});assert.equal((await state()).density,value);}
  const original=await page.locator('#hero-description').textContent();await action({type:'rewrite',target:'hero',value:'<img src=x onerror=alert(1)>'});assert.equal(await page.locator('#hero-description img').count(),0);assert.equal(await page.locator('#hero-description').textContent(),'<img src=x onerror=alert(1)>');await action({type:'undo'});assert.equal(await page.locator('#hero-description').textContent(),original);for(const target of ['home','work','story','experience','practice','contact',...projects.map(p=>p.slug)]){await action({type:'highlight',target});assert.ok(await page.locator('.is-highlighted').first().isVisible(),'Highlight not visible '+target);}const invalid=await page.evaluate(()=>siteGuide.applyActions([{type:'navigate',target:'unknown'},{type:'theme',value:'invalid'},{type:'rewrite',target:'hero',value:'x'.repeat(181)}]));assert.ok(invalid.every(r=>!r.ok));await action({type:'reset'});assert.equal((await state()).theme,'original');assert.equal(await page.locator('#project-list [data-project]').count(),14);
  await action({type:'theme',value:'ocean'});await page.locator('#undo-changes').click();assert.equal((await state()).theme,'original');await action({type:'theme',value:'rose'});await page.locator('#reset-changes').click();assert.equal((await state()).theme,'original');
 });
 await step('Awareness contains owned IDs only, bounded native history and no synthetic feedback',async()=>{
  await home('work');for(let i=0;i<10;i++)await page.locator(`#project-list [data-project="${i}"]`).click();let c=await awareness();assert.ok(c.recentActions.length<=8);assert.ok(c.visibleItems.length<=3);const ids=new Set([...projects.map(p=>p.slug),'home','work','story','experience','practice','contact']);for(const id of [c.currentSection,c.openItem,...c.visibleItems].filter(Boolean))assert.ok(ids.has(id),'Unknown contextID '+id);const before=JSON.stringify(c.recentActions);await action({type:'navigate',target:'story'});assert.equal(JSON.stringify((await awareness()).recentActions),before);await page.evaluate(()=>document.querySelector('a[href="#work"]').click());assert.equal(JSON.stringify((await awareness()).recentActions),before);await home('work');
 });
 await step('Mocked delegated effects use merged gallery context and preserve avatar-only controls',async()=>{
  await page.evaluate(()=>window.__mergeAllowMic=true);await page.locator('.live-presence').click();await page.waitForFunction(()=>document.querySelector('.live-guide.connected'));
  assert.ok(!await page.locator('.live-recovery').isVisible());await page.locator('#stage-link').scrollIntoViewIfNeeded();let sequence=100;
  for(const effect of ['confetti','sparkles','bounce','spotlight','clear']){sequence++;await page.evaluate(({effect,sequence})=>{const emit=e=>__mergeChannel.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(e)}));emit({type:'session.input_transcript.delta',delta:'Apply effect '+effect+'.',start_ms:sequence*10000,end_ms:sequence*10000+1000});emit({type:'session.delegation.created',delegation:{id:'merge-'+sequence}});},{effect,sequence});await page.waitForFunction(effect=>effect==='clear'?!document.querySelector('.live-guide').dataset.effect:document.querySelector('.live-guide').dataset.effect===effect,effect);if(effect==='spotlight')assert.equal(await page.locator('.live-effect-spotlight').count(),1);assert.ok(await page.locator('.live-effects i').count()<=40);}
  const guideReq=report.apiRequests.filter(r=>r.endpoint==='/api/guide');assert.ok(guideReq.length>=5);assert.ok(guideReq.every(r=>r.rawStateKeys.length===0));assert.ok(guideReq.every(r=>r.awareness&&r.awareness.recentActions.length<=8));await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.live-guide.connected'));assert.ok(!await page.locator('.live-recovery').isVisible());
 });
 await step('Mobile picker, step buttons, all-project links and menu at390×844',async()=>{
  await page.setViewportSize({width:390,height:844});await action({type:'reset'});await home();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await screenshot('mobile-hero');const originalMobileSummary=await page.locator('#hero-description').innerText();await action({type:'rewrite',target:'hero',value:'A visible mobile introduction for this session.'});assert.ok(await page.locator('#hero-description').isVisible(),'Mobile rewrite target hidden');assert.equal(await page.locator('#hero-description').innerText(),'A visible mobile introduction for this session.');const rewriteBox=await page.locator('#hero-description').boundingBox();assert.ok(rewriteBox.height>12&&rewriteBox.x>=0&&rewriteBox.x+rewriteBox.width<=390,'Mobile rewrite outside layout');await action({type:'reset'});await home();assert.equal(await page.locator('#hero-description').innerText(),originalMobileSummary,'Reset lost original mobile summary');await noOverflow('Mobile hero');const height=await page.locator('#home').evaluate(e=>e.getBoundingClientRect().height);assert.ok(height<=1350,'Mobile hero has excessive whitespace: '+height);await home('work');assert.ok(await page.locator('#project-picker').isVisible());
  for(const [i,p]of projects.entries()){await page.locator('#project-picker').selectOption(String(i));assert.equal(await page.locator('#stage-link').getAttribute('href'),'#work/'+p.slug);}await page.locator('[data-project-step="1"]').click();assert.equal(await page.locator('#stage-link').getAttribute('href'),'#work/'+projects[0].slug);await page.locator('[data-project-step="-1"]').click();assert.equal(await page.locator('#stage-link').getAttribute('href'),'#work/'+projects.at(-1).slug);await screenshot('mobile-gallery');
  await page.locator('.mobile-all-projects summary').click();assert.ok(await page.locator('#all-projects-links a').first().isVisible());await page.locator('#all-projects-links a').first().click();await page.waitForFunction(()=>!document.querySelector('#case-view').hidden);await noOverflow('Mobile case');await screenshot('mobile-case');await page.locator('.case-nav a').click();
  for(const target of ['work','story','experience','contact']){await page.locator('#menu-toggle').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await page.locator(`#navigation-dialog a[href="#${target}"]`).click();await page.waitForFunction(()=>!document.querySelector('#navigation-dialog').open&&document.querySelector('#menu-toggle').getAttribute('aria-expanded')==='false');}
  await page.locator('#menu-toggle').click();await page.locator('#close-navigation').click();await page.waitForFunction(()=>!document.querySelector('#navigation-dialog').open);await page.locator('#menu-toggle').click();await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#navigation-dialog').open);
  for(const target of ['home','work','story','experience','practice','contact']){await home(target);await noOverflow('Mobile '+target);}return{pickerSelections:14,heroHeight:height};
 });
 await step('Session palette restoration and malformed-route recovery',async()=>{await home();await action({type:'theme',value:'ocean'});await page.reload({waitUntil:'networkidle'});assert.equal((await state()).theme,'ocean');await action({type:'reset'});await page.evaluate(()=>{location.hash='#work/unknown-project'});await page.waitForFunction(()=>location.hash==='#work'&&!document.querySelector('#home-view').hidden);await page.evaluate(()=>{location.hash='#work/%E0%A4%A'});await page.waitForFunction(()=>location.hash==='#work'&&!document.querySelector('#home-view').hidden);});
 await step('Served scripts and styles match current preview sources',async()=>{const assets=[];for(const name of ['app.js','site-guide.js','voice.js','styles.css','voice.css']){const response=await context.request.get(new URL('/'+name,url).href);assert.ok(response.ok(),name+' unavailable');const digest=bytes=>createHash('sha256').update(bytes).digest('hex');const actual=digest(await response.body()),expected=digest(await fs.readFile(path.join(publicDir,name)));assert.equal(actual,expected,name+' does not match preview source');assets.push({name,sha256:actual});}return assets;});
 await step('Auth, payments, external execution and submission are outside this portfolio',async()=>{assert.equal(await page.locator('#home-view form,#case-view form').count(),0);return{auth:'N/A: no portfolio account/login/logout workflow',passwordManager:'N/A: no credential form',payments:'N/A: no checkout',outboundMessages:'N/A: no sending workflow',externalDemos:'Owned hrefs checked; external backend/auth/AI execution not tested',voice:'All POST and RTC mocked; no paid speech verified'};});
 await step('No runtime errors, first-party failures, overflow or visible legacy chat controls',async()=>{
  await noOverflow('Final');assert.deepEqual(report.pageErrors,[]);const bad=report.failedRequests.filter(r=>r.url.startsWith(origin)&&!r.error?.includes('ERR_ABORTED'));assert.deepEqual(bad,[]);assert.deepEqual(report.httpErrors.filter(r=>r.url.startsWith(origin)),[]);assert.deepEqual(report.consoleErrors,[]);const visible=await page.locator('.live-heading,.live-welcome,.live-controls,.live-collapse,.live-body').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width>2&&r.height>2&&getComputedStyle(n).display!=='none';}).map(n=>n.className));assert.deepEqual(visible,[]);return{postRequestsMocked:report.apiRequests.length,failedThirdPartyRequests:report.failedRequests.filter(r=>!r.url.startsWith(origin))};
 });
}finally{
 await context.close();await browser.close();if(server)await new Promise(resolve=>server.close(resolve));
 await fs.writeFile(path.join(output,'verification.json'),JSON.stringify(report,null,2));
 const rows=report.checks.map(c=>`| ${c.name} | ${c.result} | ${(c.error||'').replaceAll('|','/').replaceAll('\n',' ')} |`);
 await fs.writeFile(path.join(output,'EVIDENCE_MATRIX.md'),`# Merged portfolio verification\n\n${report.testedAtCentral}\n\n${report.mode}. All POST requests intercepted. External links clicked into intercepted blank pages. This verifies interface behavior and reported context, not live speech, external services or the real Chrome profile.\n\n| Check | Result | Limitation/error |\n|---|---|---|\n${rows.join('\n')}\n`);
}
const failed=report.checks.filter(c=>c.result==='FAIL');console.log(JSON.stringify({output,checks:report.checks.length,failed:failed.length}));if(failed.length)process.exitCode=1;
