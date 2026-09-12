'use strict';
(() => {
  const names = Object.freeze(['rain','snow','wind','pond','aurora','constellation','spotlight','surprise']);
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const ttl = 45_000;
  let scene = null, root = null, canvas = null, ctx = null, map = null;
  let raf = 0, expiry = 0, startedAt = 0, frameAt = 0, lifetime = 0, control = null;
  let width = 0, height = 0, particles = [], ripples = [], edges = [];
  let pointer = {x:0,y:0}, lastRipple = 0;
  const rand = (a,b) => a + Math.random() * (b-a);
  const motionReduced = () => preference.matches || document.body.classList.contains('motion-paused');
  const getState = () => ({scene,particleCount:particles.length,running:!!raf,reducedMotion:motionReduced(),expiresAt:scene ? startedAt + ttl : null});
  function notify() { for(const type of ['scene:changed','portfolio:scene-changed']) window.dispatchEvent(new CustomEvent(type,{detail:getState()})); }
  function announce(message) { const node = document.getElementById('page-status'); if(node) node.textContent = message; }
  function clear(announceEnd = true) {
    const hadScene = scene;
    cancelAnimationFrame(raf); clearTimeout(expiry); raf=0; expiry=0;
    control?.abort(); control=null;
    root?.remove(); map?.remove(); root=canvas=ctx=map=null;
    particles=[]; ripples=[]; edges=[]; scene=null; startedAt=0; lifetime=0;
    delete document.body.dataset.portfolioScene;
    if(hadScene) { notify(); if(announceEnd) announce('The scene has cleared. Your portfolio view is restored.'); }
    return {...getState(),ok:true,description:'Cleared the temporary scene.'};
  }
  function refreshEdges() {
    edges=[...document.querySelectorAll('.project-stage,.practice-grid article,.portrait-paper,.topbar')]
      .filter(node=>node.getClientRects().length).map(node=>node.getBoundingClientRect())
      .filter(rect=>rect.bottom>0&&rect.top<height).slice(0,7);
  }
  function resize() {
    if(!canvas)return;
    width=innerWidth; height=innerHeight;
    const ratio=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    refreshEdges();
    if(motionReduced())draw(lifetime,0);
  }
  function seed() {
    const compact=width<700;
    const counts={rain:compact?55:110,snow:compact?35:75,wind:compact?15:27,pond:7,aurora:compact?35:75,constellation:24,spotlight:0};
    particles=Array.from({length:counts[scene]||0},(_,i)=>({
      x:rand(0,width),y:rand(0,height),z:rand(.35,1),r:rand(1,3.4),v:rand(.6,1.5),a:rand(0,Math.PI*2),h:rand(0,1),i
    }));
  }
  function glow(x,y,r,color) {
    const gradient=ctx.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,color);gradient.addColorStop(1,'transparent');
    ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  function rain(t,dt) {
    const tint=ctx.createLinearGradient(0,0,0,height);tint.addColorStop(0,'rgba(91,125,145,.07)');tint.addColorStop(1,'rgba(144,193,207,.015)');ctx.fillStyle=tint;ctx.fillRect(0,0,width,height);
    for(const p of particles) {
      p.y+=dt*(280+p.z*400);p.x-=dt*(40+p.z*55);
      if(p.y>height+20){p.y=-30;p.x=rand(0,width+100);}if(p.x< -30)p.x=width+30;
      ctx.strokeStyle=`rgba(60,111,133,${.1+p.z*.24})`;ctx.lineWidth=.5+p.z;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+4+p.z*3,p.y-12-p.z*18);ctx.stroke();
    }
    for(let i=0;i<12;i++){
      const age=((t*.8+i*.38)%1),x=((i*137.13)%width),y=height-8-(i%3)*8;
      ctx.strokeStyle=`rgba(78,139,151,${(1-age)*.26})`;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(x,y,3+age*16,1+age*3,0,Math.PI,Math.PI*2);ctx.stroke();
    }
  }
  function snow(t,dt) {
    for(const p of particles) {
      p.y+=dt*(12+p.z*35);p.x+=Math.sin(t*.4+p.a)*dt*14;
      if(p.y>height+10){p.y=-10;p.x=rand(0,width);}if(p.x<0)p.x=width;if(p.x>width)p.x=0;
      ctx.fillStyle=`rgba(244,252,255,${.45+p.z*.5})`;ctx.shadowColor='rgba(109,146,158,.4)';ctx.shadowBlur=2;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      if(p.z>.8){ctx.strokeStyle='rgba(127,162,177,.28)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x-4,p.y);ctx.lineTo(p.x+4,p.y);ctx.moveTo(p.x,p.y-4);ctx.lineTo(p.x,p.y+4);ctx.stroke();}
    }
    const depth=motionReduced()?4:Math.min(5,t*.3);
    edges.forEach(r=>{ctx.strokeStyle='rgba(243,252,255,.85)';ctx.lineWidth=depth;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(Math.max(0,r.left+3),Math.max(1,r.top+2));ctx.bezierCurveTo(r.left+r.width*.25,r.top-depth,r.left+r.width*.65,r.top+3,Math.min(width,r.right-3),r.top+1);ctx.stroke();});
  }
  function wind(t,dt) {
    for(let i=0;i<4;i++){
      const y=height*(.14+i*.23)+Math.sin(t*.4+i)*18;
      ctx.strokeStyle='rgba(86,120,96,.09)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(width*.3,y-45,width*.6,y+40,width,y-30);ctx.stroke();
    }
    for(const p of particles){
      p.x+=dt*(45+p.z*110);p.y+=Math.sin(t+p.a)*dt*24;if(p.x>width+30){p.x=-30;p.y=rand(0,height);}
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a+t*p.v);ctx.scale(.6+p.z,.6+p.z);
      ctx.fillStyle=['rgba(119,145,76,.5)','rgba(183,133,76,.45)','rgba(156,171,111,.5)'][p.i%3];ctx.beginPath();ctx.moveTo(-8,0);ctx.quadraticCurveTo(-1,-8,10,0);ctx.quadraticCurveTo(0,7,-8,0);ctx.fill();ctx.strokeStyle='rgba(71,96,55,.32)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.stroke();ctx.restore();
    }
  }
  function pond(t,dt) {
    const waterline=height-Math.min(170,height*.23);
    const gradient=ctx.createLinearGradient(0,waterline,0,height);gradient.addColorStop(0,'rgba(118,199,191,.045)');gradient.addColorStop(.3,'rgba(95,176,173,.11)');gradient.addColorStop(1,'rgba(47,132,144,.24)');
    for(let layer=0;layer<3;layer++){
      ctx.beginPath();ctx.moveTo(0,height);
      for(let x=0;x<=width+12;x+=12)ctx.lineTo(x,waterline+layer*15+Math.sin(x*.011+t*.5+layer)*5+Math.sin(x*.023-t*.2)*3);
      ctx.lineTo(width,height);ctx.closePath();ctx.fillStyle=gradient;ctx.fill();
      ctx.beginPath();for(let x=0;x<=width+12;x+=12){const y=waterline+layer*15+Math.sin(x*.011+t*.5+layer)*5+Math.sin(x*.023-t*.2)*3;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.strokeStyle='rgba(227,251,239,.45)';ctx.lineWidth=1;ctx.stroke();
    }
    for(const p of particles){
      p.x+=dt*(p.i%2?14:-10);if(p.x>width+30)p.x=-30;if(p.x< -30)p.x=width+30;
      const y=waterline+40+(p.i/particles.length)*(height-waterline-55)+Math.sin(t*.6+p.a)*5;
      ctx.save();ctx.translate(p.x,y);ctx.scale(p.i%2?1:-1,1);ctx.rotate(Math.sin(t+p.a)*.07);
      ctx.fillStyle=p.i%3===0?'rgba(186,118,69,.38)':'rgba(40,107,108,.3)';ctx.beginPath();ctx.ellipse(0,0,10,3.4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(-16,-5+Math.sin(t*3+p.a)*2);ctx.lineTo(-16,5+Math.sin(t*3+p.a)*2);ctx.closePath();ctx.fill();ctx.restore();
    }
    if(motionReduced()){
      ctx.strokeStyle='rgba(236,254,246,.65)';[15,27,43].forEach(r=>{ctx.beginPath();ctx.ellipse(width*.32,height-54,r,r*.3,0,0,Math.PI*2);ctx.stroke();});
    }
    ripples=ripples.filter(r=>t-r.at<2.6);
    ripples.forEach(r=>{const age=t-r.at;ctx.strokeStyle=`rgba(247,255,246,${Math.max(0,.6-age*.22)})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(r.x,r.y,4+age*30,2+age*10,0,0,Math.PI*2);ctx.stroke();});
  }
  function aurora(t) {
    const sky=ctx.createLinearGradient(0,0,0,height*.6);sky.addColorStop(0,'rgba(21,51,65,.13)');sky.addColorStop(1,'transparent');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height*.6);
    for(let band=0;band<3;band++){
      ctx.beginPath();
      for(let x=-20;x<=width+20;x+=16){const y=height*.08+Math.sin(x*.004+t*.12+band*.65)*height*.045+band*18;if(x===-20)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
      for(let x=width+20;x>=-20;x-=16){const y=height*.22+Math.sin(x*.004+t*.12+band*.65)*height*.055+band*18;ctx.lineTo(x,y);}ctx.closePath();
      const light=ctx.createLinearGradient(0,0,0,height*.38);light.addColorStop(0,'transparent');light.addColorStop(.35,band%2?'rgba(148,132,202,.14)':'rgba(89,187,152,.16)');light.addColorStop(.62,'rgba(111,191,160,.09)');light.addColorStop(1,'transparent');ctx.fillStyle=light;ctx.fill();
    }
    for(const p of particles){const x=p.x,y=p.y*.38;ctx.fillStyle=`rgba(117,151,151,${.22+(Math.sin(t*.45+p.a)+1)*.15})`;ctx.beginPath();ctx.arc(x,y,p.z*1.6,0,Math.PI*2);ctx.fill();if(p.i%12===0)glow(x,y,9,'rgba(211,238,211,.24)');}
    const shooting=t%13;if(shooting>9&&shooting<10&&!motionReduced()){
      const x=width*.15+(shooting-9)*width*.45,y=height*.05+(shooting-9)*60;
      const tail=ctx.createLinearGradient(x-70,y-22,x,y);tail.addColorStop(0,'transparent');tail.addColorStop(1,'rgba(147,179,154,.55)');ctx.strokeStyle=tail;ctx.beginPath();ctx.moveTo(x-70,y-22);ctx.lineTo(x,y);ctx.stroke();
    }
  }
  function spotlight() {
    const target=document.getElementById('case-view')?.hidden===false?document.querySelector('#case-view .case-page'):document.getElementById('project-preview');
    if(!target)return;const r=target.getBoundingClientRect();
    if(r.bottom<0||r.top>height)return;
    const pad=12,x=Math.max(8,r.left-pad),y=Math.max(8,r.top-pad),w=Math.min(width-16,r.right+pad)-x,h=Math.min(height-8,r.bottom+pad)-y;
    ctx.fillStyle='rgba(18,38,30,.19)';ctx.fillRect(0,0,width,height);
    ctx.save();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.roundRect(x,y,w,h,16);ctx.fill();ctx.restore();
    ctx.strokeStyle='rgba(186,148,82,.68)';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x,y,w,h,16);ctx.stroke();
  }
  function draw(t,dt) {
    if(!ctx)return;ctx.clearRect(0,0,width,height);
    if(scene==='rain')rain(t,dt);else if(scene==='snow')snow(t,dt);else if(scene==='wind')wind(t,dt);else if(scene==='pond')pond(t,dt);else if(scene==='aurora'||scene==='constellation')aurora(t);else if(scene==='spotlight')spotlight();
  }
  function animate(now) {
    raf=0;if(!scene||motionReduced())return;
    if(now-frameAt>=32){const dt=Math.min((now-frameAt)/1000,.06);frameAt=now;lifetime+=dt;draw(lifetime,dt);}
    raf=requestAnimationFrame(animate);
  }
  function syncMotion() {
    if(!scene)return;cancelAnimationFrame(raf);raf=0;
    root.classList.toggle('scene-static',motionReduced());
    if(motionReduced())draw(lifetime,0);else{frameAt=performance.now();raf=requestAnimationFrame(animate);}
    notify();
  }
  function constellation() {
    const host=document.querySelector('#practice .practice-intro');if(!host)return;
    map=document.createElement('nav');map.className='scene-constellation';map.setAttribute('aria-label','Shanto’s skills constellation');
    const caption=document.createElement('p');caption.className='scene-map-caption';caption.textContent='CONNECTED BY CURIOSITY';map.append(caption);
    const center=document.createElement('span');center.className='scene-map-center';center.textContent='THE WAY I BUILD';map.append(center);
    const skills=[['Python','experience'],['Voice AI','voice'],['Agentic workflows','agents'],['RAG & retrieval','practice'],['Security automation','security'],['Cloud engineering','practice']];
    skills.forEach(([label,target],i)=>{const link=document.createElement('a');link.className='scene-skill';link.dataset.skill=String(i);link.href=['voice','security','agents'].includes(target)?'#work':'#'+target;link.textContent=label;link.addEventListener('click',e=>{e.preventDefault();clear(false);window.siteGuide?.applyActions([{type:['voice','security','agents'].includes(target)?'filter':'navigate',...(['voice','security','agents'].includes(target)?{value:target}:{target})}]);},{signal:control.signal});map.append(link);});
    host.after(map);window.siteGuide?.applyActions([{type:'navigate',target:'practice'}]);
  }
  function play(name) {
    if(typeof name!=='string'||!names.includes(name))return {ok:false,error:'Unknown scene',...getState()};
    if(document.hidden)return {ok:false,error:'Scenes are available while this page is visible',...getState()};
    clear(false);scene=name==='surprise'?names[Math.floor(Math.random()*7)]:name;
    startedAt=Date.now();control=new AbortController();const options={signal:control.signal};
    root=document.createElement('div');root.className='portfolio-scene';root.setAttribute('aria-hidden','true');root.dataset.scene=scene;
    canvas=document.createElement('canvas');root.append(canvas);document.body.append(root);ctx=canvas.getContext('2d');
    if(!ctx){clear(false);return {ok:false,error:'Canvas is unavailable',...getState()};}
    document.body.dataset.portfolioScene=scene;
    resize();seed();
    if(scene==='constellation')constellation();
    if(scene==='spotlight'&&document.getElementById('case-view')?.hidden!==false)window.siteGuide?.applyActions([{type:'navigate',target:'work'}]);
    window.addEventListener('resize',resize,options);
    window.addEventListener('scroll',()=>{refreshEdges();if(motionReduced()||scene==='spotlight')draw(lifetime,0);},{...options,passive:true});
    window.addEventListener('portfolio:changed',syncMotion,options);
    preference.addEventListener('change',syncMotion,options);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)clear(false);},options);
    window.addEventListener('pagehide',()=>clear(false),options);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')clear();},options);
    document.getElementById('reset-changes')?.addEventListener('click',()=>clear(),options);
    document.addEventListener('pointermove',e=>{
      if(scene!=='pond'||motionReduced()||lifetime-lastRipple<.18)return;
      pointer={x:e.clientX,y:e.clientY};if(pointer.y<height-Math.min(170,height*.23))return;
      lastRipple=lifetime;ripples.push({...pointer,at:lifetime});if(ripples.length>16)ripples.shift();
    },{...options,passive:true});
    document.addEventListener('pointerdown',e=>{if(scene==='pond'&&!motionReduced()&&e.clientY>height-Math.min(170,height*.23)){ripples.push({x:e.clientX,y:e.clientY,at:lifetime});if(ripples.length>16)ripples.shift();}},{...options,passive:true});
    draw(0,0);syncMotion();expiry=setTimeout(()=>clear(),ttl);
    announce(`${scene[0].toUpperCase()+scene.slice(1)} scene. ${motionReduced()?'Still artwork respects your motion preference. ':''}Press Escape or ask Pip to clear the effects. The scene clears after 45 seconds.`);
    return {...getState(),ok:true,description:'Started '+scene+' for up to 45 seconds'+(motionReduced()?' as still artwork.':'.')};
  }
  window.portfolioScenes=Object.freeze({play,clear,getState,names});
})();
