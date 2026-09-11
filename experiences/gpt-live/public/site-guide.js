'use strict';
(() => {
  const ui = window.portfolioUI;
  if (!ui || !Array.isArray(ui.projects)) throw new Error('The portfolio presentation bridge is unavailable.');
  const projects = ui.projects;
  const careers = ui.careers;
  const byId = new Map(projects.map(project => [project.slug, project]));
  const pageSections = [
    {id:'home',label:'Introduction',description:'Meet Shanto, a Forward Deployed AI Engineer in Dallas–Fort Worth.'},
    {id:'work',label:'Selected work',description:'Fourteen public project cases: voice, security, agent systems and creative work.'},
    {id:'story',label:'The person',description:'Shanto’s journey from testing and support to Python, security automation and applied AI.'},
    {id:'experience',label:'Experience',description:'Resume-listed roles and engagements, including the owner-confirmed CDW end date of May 2026.'},
    {id:'practice',label:'Engineering practice',description:'Applied AI, security operations and engineering delivery capabilities.'},
    {id:'contact',label:'Contact',description:'Public website, LinkedIn and GitHub links; no message is sent by this guide.'}
  ];
  const sectionIds = new Set(pageSections.map(section => section.id));
  const sections = [...pageSections,...projects.map(project=>({id:project.slug,label:project.title,description:project.description}))];
  const knownIds = new Set(sections.map(section=>section.id));
  const themes = ['original','midnight','ocean','rose','forest'];
  const emotions = ['happy','thoughtful','excited','sad','playful','angry','calm'];
  const filters = ['all','voice','security','agents','creative'];
  const filterAliases = {'':'all','all':'all','all work':'all','voice':'voice','voice ai':'voice','security':'security','agents':'agents','agent':'agents','creative':'creative'};
  const hero = document.getElementById('hero-description');
  if (!hero) throw new Error('The portfolio introduction is unavailable.');
  const originalHero = hero.textContent;
  const originalHeroHTML = hero.innerHTML;
  const defaults = {theme:'original',density:'comfortable',filter:'all',hero:originalHero,emotion:'calm',highlight:null};
  let state = {...defaults};
  const undo = [];
  const recent = [];
  const storageKey = 'fieldwork-live-v2';
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey)||'null');
    if (saved && typeof saved === 'object') {
      state.theme=themes.includes(saved.theme)?saved.theme:'original';
      state.density=saved.density==='compact'?'compact':'comfortable';
      state.filter=filters.includes(saved.filter)?saved.filter:'all';
      state.hero=typeof saved.hero==='string'&&saved.hero.trim()&&saved.hero.length<=180?saved.hero:originalHero;
      state.emotion=emotions.includes(saved.emotion)?saved.emotion:'calm';
    }
  } catch { /* Optional session styling never prevents the portfolio from loading. */ }
  function selectedId(){const value=ui.getSelected();return typeof value==='number'?projects[value]?.slug:byId.has(value)?value:null;}
  function openItem(){
    if (document.getElementById('case-view')?.hidden !== false) return null;
    let hash;try{hash=decodeURIComponent(location.hash);}catch{return null;}
    const id=hash.startsWith('#work/')?hash.slice(6):null;
    return byId.has(id)?id:null;
  }
  function currentSection(){
    if(openItem())return 'work';
    const candidates=pageSections.map(section=>({id:section.id,node:document.getElementById(section.id)})).filter(item=>item.node&&item.node.getClientRects().length).map(item=>({...item,rect:item.node.getBoundingClientRect()})).filter(item=>item.rect.bottom>80&&item.rect.top<innerHeight);
    candidates.sort((a,b)=>Math.abs(a.rect.top-100)-Math.abs(b.rect.top-100));
    return candidates[0]?.id||'home';
  }
  function getState(){
    return {...state,filter:ui.getFilter(),section:currentSection(),project:openItem(),selectedProject:selectedId(),availableFilters:[...filters],visibleProjects:ui.getVisibleProjects().map(id=>byId.get(id)?.title).filter(Boolean),canUndo:undo.length>0};
  }
  function emitState(){
    state.filter=ui.getFilter();
    try{sessionStorage.setItem(storageKey,JSON.stringify({theme:state.theme,density:state.density,filter:state.filter,hero:state.hero,emotion:state.emotion}));}catch{}
    const button=document.getElementById('undo-changes');if(button)button.disabled=!undo.length;
    window.dispatchEvent(new CustomEvent('site:changed',{detail:getState()}));
  }
  function navigate(target){
    ui.closeImage();
    const menu=document.getElementById('navigation-dialog');if(menu?.open)menu.close();
    if(byId.has(target)){
      if(!ui.getVisibleProjects().includes(target))ui.setFilter('all');
      ui.selectProject(target,false);
    }
    history.replaceState(null,'',byId.has(target)?'#work/'+target:'#'+target);
    ui.route();
  }
  function renderState(){
    document.body.classList.remove(...themes.map(theme=>'theme-'+theme),'density-compact');
    if(state.theme!=='original')document.body.classList.add('theme-'+state.theme);
    if(state.density==='compact')document.body.classList.add('density-compact');
    document.body.dataset.emotion=state.emotion;
    if(state.hero===originalHero)hero.innerHTML=originalHeroHTML;else hero.textContent=state.hero;
    document.querySelectorAll('.is-highlighted').forEach(node=>node.classList.remove('is-highlighted'));
    const target=state.highlight;
    if(sectionIds.has(target))document.getElementById(target)?.classList.add('is-highlighted');
    else if(byId.has(target)){
      const node=openItem()===target?document.querySelector('#case-view .case-page'):selectedId()===target?document.getElementById('project-preview'):null;
      node?.classList.add('is-highlighted');
    }
  }
  function snapshot(){return {...state,filter:ui.getFilter(),selected:selectedId(),route:openItem()||currentSection()};}
  function applyActions(actions){
    if(!Array.isArray(actions))return [];
    return actions.slice(0,12).map(action=>{
      const a=action&&typeof action==='object'?action:{};
      const before=snapshot();let ok=false,description='Unsupported page action.';
      switch(a.type){
        case 'navigate':if(knownIds.has(a.target)){navigate(a.target);description='Opened '+sections.find(section=>section.id===a.target).label;ok=true;}break;
        case 'theme':if(themes.includes(a.value)){state.theme=a.value;description='Changed this session’s palette to '+a.value;ok=true;}break;
        case 'density':if(['comfortable','compact'].includes(a.value)){state.density=a.value;description='Changed page spacing to '+a.value;ok=true;}break;
        case 'filter':if(typeof a.value==='string'&&Object.hasOwn(filterAliases,a.value.trim().toLowerCase())){state.filter=filterAliases[a.value.trim().toLowerCase()];ui.setFilter(state.filter);navigate('work');description='Showing '+state.filter+' projects';ok=true;}break;
        case 'rewrite':if(a.target==='hero'&&typeof a.value==='string'&&a.value.trim()&&a.value.length<=180){state.hero=a.value.trim();description='Updated introduction copy for this session';ok=true;}break;
        case 'emotion':if(emotions.includes(a.value)){state.emotion=a.value;description='Changed the guide expression to '+a.value;ok=true;}break;
        case 'highlight':if(knownIds.has(a.target)){
          if(byId.has(a.target)&&openItem()!==a.target){if(!ui.getVisibleProjects().includes(a.target))ui.setFilter('all');ui.selectProject(a.target,false);navigate('work');}
          else if(sectionIds.has(a.target))navigate(a.target);
          state.highlight=a.target;description='Highlighted '+sections.find(section=>section.id===a.target).label;ok=true;
        }break;
        case 'reset':{const wasOpen=openItem();state={...defaults};ui.setFilter('all');if(wasOpen)navigate('work');description='Restored the original portfolio appearance and full project collection';ok=true;break;}
        case 'undo':if(undo.length){const previous=undo.pop();state={theme:previous.theme,density:previous.density,filter:previous.filter,hero:previous.hero,emotion:previous.emotion,highlight:previous.highlight};ui.setFilter(state.filter);if(previous.selected)ui.selectProject(previous.selected,false);navigate(previous.route);description='Undid the last page change';ok=true;}break;
      }
      if(ok){
        if(a.type!=='undo'){undo.push(before);if(undo.length>20)undo.shift();}
        renderState();emitState();const status=document.getElementById('page-status');if(status)status.textContent=description;
      }
      return {type:typeof a.type==='string'?a.type:'unknown',ok,description};
    });
  }
  function visible(node){if(!node||!node.getClientRects().length)return false;const r=node.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;}
  function getContext(){
    const active=openItem();let visibleItems=[];
    const modalOpen=document.getElementById('navigation-dialog')?.open||document.getElementById('image-dialog')?.open;
    if(!modalOpen){
      if(active&&visible(document.getElementById('case-view')))visibleItems=[active];
      else if(!active&&visible(document.getElementById('project-preview'))&&selectedId())visibleItems=[selectedId()];
    }
    const itemIds=[...new Set([active,...visibleItems].filter(Boolean))].slice(0,4);
    return {version:1,siteId:'portfolio',currentSection:currentSection(),openItem:active,visibleItems,
      items:itemIds.map(id=>{const p=byId.get(id);return {id,kind:'project',label:p.title,summary:(p.description+' '+p.boundary).slice(0,360)};}),
      selectedItems:{saved:[],compare:[]},activeFilter:ui.getFilter(),recentActions:recent.map(action=>({...action})),sessionOnly:true};
  }
  const context=('You are Pip, an AI guide for Shanto Mathew’s portfolio, not Shanto himself. Use a warm, witty, factual voice. Shanto is a Forward Deployed AI Engineer in Dallas–Fort Worth, Texas, working across applied AI, agentic workflows, retrieval, voice experiences, Python and enterprise security automation. Public projects are independent work with specific prototype and service boundaries; never claim a linked provider or business is operational from its portfolio image. Changes are local to this tab. No external messages, purchases, booking or source edits. Career dates reflect the August 2026 resume with owner-confirmed September updates; CDW ended May 2026. Education: BTech Computer Science, Rajiv Gandhi Institute of Technology, MG University. Contact: shantomathew.com, LinkedIn linkedin.com/in/shanto-mathew and GitHub github.com/shanto12. Experience: '+careers.map(c=>c[1]+' — '+c[2]+' ('+c[0]+'). '+c[3]).join(' ')).slice(0,4990);
  window.siteGuide={id:'portfolio',title:'Shanto’s Portfolio',context,sections,getState,applyActions,getContext};
  // Compatibility is read-only: app state continues to be owned by portfolioUI.
  window.portfolioState={get:getState,render:renderState};
  window.addEventListener('portfolio:changed',()=>{renderState();emitState();});
  document.getElementById('undo-changes')?.addEventListener('click',()=>applyActions([{type:'undo'}]));
  document.getElementById('reset-changes')?.addEventListener('click',()=>applyActions([{type:'reset'}]));
  ui.setFilter(state.filter);renderState();emitState();

  // Only known IDs and coarse visitor actions enter awareness. No DOM text,
  // contact details, input values, pointer coordinates, or external tabs are read.
  const excluded='.live-guide,#live-guide-mount,[data-guide-exclude],form,input,textarea,[contenteditable]';
  function record(type,target){
    if(!['navigate','open','filter','save','compare','dismiss','view'].includes(type)||target!==undefined&&!knownIds.has(target))return;
    const action=target===undefined?{type}:{type,target};recent.push(action);if(recent.length>8)recent.shift();
    window.dispatchEvent(new CustomEvent('site:activity',{detail:{version:1,siteId:'portfolio',source:'visitor',action:{...action}}}));
  }
  document.addEventListener('click',event=>{
    if(!event.isTrusted||!(event.target instanceof Element)||event.target.closest(excluded))return;
    const control=event.target.closest('button,a,summary');if(!control)return;
    const oldItem=openItem();const href=control.getAttribute('href');let action=null;let afterSelection=false;
    if(href?.startsWith('#work/')&&byId.has(href.slice(6)))action={type:'open',target:href.slice(6)};
    else if(href?.startsWith('#')&&sectionIds.has(href.slice(1)))action={type:oldItem&&href==='#work'?'dismiss':'navigate',target:oldItem&&href==='#work'?oldItem:href.slice(1)};
    else if(href==='#')action={type:'navigate',target:'home'};
    else if(control.matches('[data-project],[data-project-step],#previous-project,#next-project'))afterSelection=true;
    else if(filters.includes(control.dataset.filter))action={type:'filter',target:'work'};
    else if(control.matches('[data-inspect],#zoom-in,#zoom-out,#zoom-fit')&&oldItem)action={type:'view',target:oldItem};
    else if(control.tagName==='SUMMARY'&&control.closest('#career-list'))action={type:'view',target:'experience'};
    else if(control.tagName==='A'&&['https://shantomathew.com/','https://www.linkedin.com/in/shanto-mathew/','https://github.com/shanto12'].includes(href))action={type:'navigate',target:'contact'};
    if(action||afterSelection)queueMicrotask(()=>{if(afterSelection&&selectedId())record('view',selectedId());else if(action)record(action.type,action.target);});
  },true);
  document.addEventListener('change',event=>{if(event.isTrusted&&event.target===document.getElementById('project-picker'))queueMicrotask(()=>{if(selectedId())record('view',selectedId());});},true);
  let viewTimer,lastView='',lastViewAt=0;
  function visitorScroll(event){
    if(!event.isTrusted||!(event.target instanceof Element)||event.target.closest(excluded)||event.target.closest('select'))return;
    if(event.type==='keydown'&&!['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(event.key))return;
    clearTimeout(viewTimer);viewTimer=setTimeout(()=>{const target=openItem()||getContext().visibleItems[0]||currentSection();if(target!==lastView&&Date.now()-lastViewAt>1500){lastView=target;lastViewAt=Date.now();record('view',target);}},700);
  }
  document.addEventListener('wheel',visitorScroll,{passive:true});document.addEventListener('touchend',visitorScroll,{passive:true});document.addEventListener('keydown',visitorScroll);
  window.addEventListener('pagehide',()=>clearTimeout(viewTimer));
})();
