const guide = window.siteGuide;
if (!guide) throw new Error('The site guide is unavailable.');
const root = document.createElement('div');
root.className = 'live-guide';
root.setAttribute('role','complementary');
root.setAttribute('aria-label', 'Live AI website guide');
root.innerHTML = `<button class="live-presence" type="button" aria-label="AI voice guide. Select to connect. Press Escape to end."><div class="live-halo halo-one"></div><div class="live-halo halo-two"></div><span class="live-spark spark-one">✳</span><span class="live-spark spark-two">·</span><div class="live-face" data-emotion="happy" role="img" aria-label="Your AI guide, feeling happy"><span class="live-brow brow-left"></span><span class="live-brow brow-right"></span><i></i><i></i><b></b><span class="live-cheek cheek-left"></span><span class="live-cheek cheek-right"></span></div><div class="live-shadow"></div></button><div class="live-heading"><strong class="live-name"></strong><span class="live-dot"></span><span class="live-status" role="status">Getting ready…</span></div><p class="live-welcome"></p><div class="live-controls"><button class="live-start">Allow microphone</button><button class="live-mute" disabled aria-pressed="false" aria-label="Mute microphone">Mute mic</button><button class="live-stop" disabled>End</button></div><p class="live-notice">AI voice · Microphone used only while connected.</p><button class="live-collapse" aria-expanded="false" aria-label="Open conversation">Type or view conversation <span>↗</span></button><div class="live-body" hidden><div class="live-transcript" role="log" aria-label="Conversation" aria-live="polite"></div><form class="live-form"><label class="live-sr" for="live-message">Message your guide</label><input id="live-message" maxlength="600" placeholder="Type your question…" autocomplete="off"><button type="submit" aria-label="Send message">↗</button></form><div class="live-detail-footer"><span>Changes stay in this tab’s session.</span><button class="live-reset">Reset view</button></div></div><p class="live-error" role="alert"></p>`;
document.body.append(root);
root.classList.add('collapsed');
qName();
function qName(){root.querySelector('.live-name').textContent=guide.id==='agentmart'?'M, your studio companion':'Your AI field guide';}
const q = selector => root.querySelector(selector);
q('.live-status').classList.add('live-sr');root.append(q('.live-status'));
q('.live-error').classList.add('live-sr');
q('.live-presence').setAttribute('aria-description','Select to connect or enable audio. During a conversation, select to mute or unmute your microphone. Press Escape to end.');
q('.live-presence').querySelectorAll(':scope > *').forEach(element=>element.setAttribute('aria-hidden','true'));
q('.live-welcome').textContent = guide.id==='agentmart'?'Good taste. Curious mind. Occasional terrible puns.':'A curious companion to the work. Ask me anything about it.';
const audio = document.createElement('audio');
audio.autoplay = true;
audio.setAttribute('playsinline', '');
root.append(audio);
let ending=false, audioBlocked=false, effectTimer, effectOverlay, effectTarget;
let idleTimer, nudgeTimer, permissionTimer, permissionPending=false, permissionSpoken=false, permissionInvitationUsed=false, permissionDenied=false, lastVisitorAt=0, idleNudges=0;
let generation=0, greetingEvent, requestController, inputEndMs=0, visualAudio, visualFrame;
let peer, channel, mic, token, timer, closeTimer, sessionReady = false, connecting = false, muted = false, transcript = [], queue = Promise.resolve(), lastInput = '', collapsing = true;
const status = text => { q('.live-status').textContent = text; refreshAvatar(); };
const error = text => { q('.live-error').textContent = text; refreshAvatar(); };
function clearVisitorTimers(){clearTimeout(idleTimer);clearTimeout(nudgeTimer);}
function cancelPermissionPrompt(){
  permissionPending=false;clearTimeout(permissionTimer);
  if(permissionSpoken&&'speechSynthesis' in window)window.speechSynthesis.cancel();permissionSpoken=false;
}
function beginPermissionPrompt(){
  cancelPermissionPrompt();permissionPending=true;
  if(permissionInvitationUsed||permissionDenied)return;
  permissionTimer=setTimeout(()=>{
    if(!permissionPending||ending||document.hidden||!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance!=='function')return;
    permissionSpoken=true;permissionInvitationUsed=true;
    const invitation=new SpeechSynthesisUtterance('I’m the little face in the corner. Allow your microphone if you fancy a chat—I promise I have more personality than a loading spinner.');
    invitation.lang='en-US';
    try{window.speechSynthesis.speak(invitation);}catch{/* Browser permission controls may block speech. */}
  },18000);
}
function armVisitorTimers(){
  clearVisitorTimers();if(!sessionReady||ending)return;
  idleTimer=setTimeout(()=>{if(sessionReady&&!ending&&Date.now()-lastVisitorAt>=180000)void end();},Math.max(0,180000-(Date.now()-lastVisitorAt)));
  if(idleNudges>=2||muted||audioBlocked||document.hidden)return;
  const threshold=idleNudges===0?20000:50000;
  nudgeTimer=setTimeout(()=>{
    if(!sessionReady||ending||muted||audioBlocked||document.hidden||idleNudges>=2)return;
    idleNudges++;
    send('session.instructions.append','Offer one short, witty invitation to explore the website. Be welcoming, never pressure the visitor. Do not make website changes or repeat the full greeting. Then wait quietly.');
    send('session.commentary.append',idleNudges===1?'The visitor is quiet. A brief, playful invitation would be welcome.':'One final gentle invitation, then leave the visitor in peace.');
    armVisitorTimers();
  },Math.max(0,threshold-(Date.now()-lastVisitorAt)));
}
function visitorActivity(){if(!sessionReady||ending)return;lastVisitorAt=Date.now();armVisitorTimers();}
function refreshAvatar(){
  root.classList.toggle('muted',muted);root.classList.toggle('connecting',connecting);root.classList.toggle('ending',ending);
  root.classList.toggle('audio-blocked',audioBlocked);root.classList.toggle('has-error',!!q('.live-error').textContent);
  const control=q('.live-presence');control.disabled=ending||connecting;
  const instruction=ending?'Ending conversation.':connecting?'Connecting. Press Escape to cancel.':audioBlocked?'Select to enable audio. Press Escape to end.':sessionReady?(muted?'Microphone muted. Select to unmute. Press Escape to end.':'Listening. Select to mute your microphone. Press Escape to end.'):'Select to connect.';
  control.setAttribute('aria-label',`AI voice guide. ${instruction}`);
  if(sessionReady&&!audioBlocked)control.setAttribute('aria-pressed',String(muted));else control.removeAttribute('aria-pressed');
}
function clearEffects(){
  clearTimeout(effectTimer);effectOverlay?.remove();effectOverlay=undefined;
  effectTarget?.classList.remove('live-effect-spotlight');effectTarget=undefined;
  root.classList.remove('live-effect-bounce','live-effect-static');
  delete root.dataset.effect;
}
function runEffect(value){
  const supported=['confetti','sparkles','bounce','spotlight','clear'];
  if(!supported.includes(value))return {type:'effect',ok:false,description:'Unsupported effect.'};
  clearEffects();
  if(value==='clear')return {type:'effect',ok:true,description:'Cleared temporary visual effects.'};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(value==='spotlight'){
    effectTarget=[...document.querySelectorAll('[data-project],[data-product]'),...document.querySelectorAll('main section,[data-section]')].find(element=>{
      const box=element.getBoundingClientRect();return box.width>20&&box.height>20&&box.bottom>0&&box.top<innerHeight&&box.right>0&&box.left<innerWidth;
    });
    if(!effectTarget)return {type:'effect',ok:false,description:'No visible content card is available to highlight.'};
    effectTarget.classList.add('live-effect-spotlight');
  }else if(reduced){root.classList.add('live-effect-static');}
  else if(value==='bounce'){root.classList.add('live-effect-bounce');}
  else{
    effectOverlay=document.createElement('div');effectOverlay.className=`live-effects live-effects-${value}`;effectOverlay.dataset.effect=value;effectOverlay.setAttribute('aria-hidden','true');
    for(let i=0;i<(value==='confetti'?32:20);i++){
      const particle=document.createElement('i');
      particle.style.setProperty('--x',`${8+Math.random()*84}vw`);particle.style.setProperty('--y',`${12+Math.random()*32}vh`);
      particle.style.setProperty('--drift',`${-65+Math.random()*130}px`);particle.style.setProperty('--turn',`${-160+Math.random()*320}deg`);
      particle.style.setProperty('--duration',`${1400+Math.random()*800}ms`);particle.style.setProperty('--delay',`${Math.random()*200}ms`);
      particle.style.setProperty('--particle-color',['#a5c7b0','#d5bb80','#b8afd1','#8fb8c7'][i%4]);effectOverlay.append(particle);
    }
    document.body.append(effectOverlay);
  }
  root.dataset.effect=value;
  effectTimer=setTimeout(clearEffects,reduced?1200:value==='spotlight'?3500:2800);
  return {type:'effect',ok:true,description:reduced?'Applied a brief, still visual accent for reduced motion.':`Applied the temporary ${value} effect.`};
}
function line(role, content) {
  if (!content?.trim()) return;
  const previous = transcript.at(-1);
  if (previous?.role === role && previous.streaming) {
    previous.content += content;
    q('.live-transcript').lastElementChild.textContent = `${role === 'user' ? 'You' : 'Guide'}: ${previous.content}`;
  } else {
    transcript.push({role, content, streaming: true});
    const p = document.createElement('p');
    p.className = role;
    p.textContent = `${role === 'user' ? 'You' : 'Guide'}: ${content}`;
    q('.live-transcript').append(p);
  }
  if(role==='assistant')q('.live-welcome').textContent=(transcript.at(-1)?.content||content).slice(-220);
  transcript = transcript.slice(-16);
  while(q('.live-transcript').children.length > 16) q('.live-transcript').firstElementChild.remove();
  q('.live-transcript').scrollTop = q('.live-transcript').scrollHeight;
}
function send(type, content, delegationId = null) {
  if (ending || channel?.readyState !== 'open' || !sessionReady) return;
  const id=crypto.randomUUID(); channel.send(JSON.stringify({type,event_id:id,delegation_id:delegationId,content}));return id;
}
async function api(path, body, signal) {
  const response = await fetch(`/api/${path}`, {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'The guide could not connect. Please try again shortly.');
  return data;
}
function emotion(value) {
  q('.live-face').dataset.emotion = value;
  q('.live-face').setAttribute('aria-label',`Your AI guide, feeling ${value}`);
}
function cleanup() {
  clearVisitorTimers();cancelPermissionPrompt();
  generation++;requestController?.abort();token=undefined;
  clearTimeout(timer);clearTimeout(closeTimer);cancelAnimationFrame(visualFrame);visualAudio?.close().catch(()=>{});visualAudio=undefined;root.classList.remove('speaking');root.style.setProperty('--voice-energy','0');
  mic?.getTracks().forEach(track => track.stop());
  channel?.close(); peer?.close(); audio.srcObject = null;
  peer = channel = mic = undefined; sessionReady = connecting = false; ending = false;
  q('.live-start').disabled = false; q('.live-start').textContent = 'Talk again';
  q('.live-mute').disabled = true; q('.live-stop').disabled = true;
  root.classList.remove('connected');audioBlocked=false;muted=false;clearEffects();refreshAvatar();
}
async function end() {
  if(ending)return;ending=true;clearEffects();clearVisitorTimers();cancelPermissionPrompt();
  generation++;requestController?.abort();queue=Promise.resolve();
  const activeToken = token; token = undefined;
  if (sessionReady) channel?.send(JSON.stringify({type:'session.close', event_id:crypto.randomUUID()}));
  status(sessionReady?'Ending conversation…':'Conversation ended');
  q('.live-stop').disabled=true;q('.live-mute').disabled=true;
  mic?.getAudioTracks().forEach(track=>track.enabled=false);
  // The server owns the session deadline, even when this page disappears.
  if (activeToken) fetch('/api/end',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:activeToken}),keepalive:true}).catch(()=>{});
  if(sessionReady)closeTimer=setTimeout(()=>{cleanup();status('Disconnected');},5000);
  else cleanup();
}
async function act(message, delegationId = null, expectedGeneration = generation) {
  if(ending||expectedGeneration!==generation)return;
  const controller=new AbortController();requestController=controller;
  if (!message.trim()) return;
  error(''); emotion('thoughtful');
  try {
    if (!token) { ending=false;const session = await api('chat',{},controller.signal); if(expectedGeneration!==generation)return;token=session.token; timer=setTimeout(end,session.durationSeconds*1000); }
    const result = await api('guide', {token, message:message.slice(0,600), history:transcript.slice(-8).map(({role,content})=>({role,content:content.slice(-800)})), state:guide.getState()},controller.signal);
    if(expectedGeneration!==generation)return;
    const results = [...guide.applyActions(result.actions.filter(action=>action.type!=='effect')), ...result.actions.filter(action=>action.type==='effect').map(action=>runEffect(action.value))];
    for (const action of result.actions) if (action.type === 'emotion') {
      emotion(action.value);
      const tones={happy:'warm and cheerful',thoughtful:'curious and reflective',excited:'delighted and energetic',sad:'gently wistful',playful:'mischievous and lighthearted',angry:'theatrically grumpy in a friendly, humorous way',calm:'calm and reassuring'};
      if(tones[action.value])send('session.instructions.append',`For your next response, sound ${tones[action.value]}. Keep it natural and brief.`);
    }
    const failures = results.filter(item=>!item.ok);
    const answer = failures.length ? `I couldn’t apply part of that change. ${result.answer}` : result.answer;
    if (sessionReady) send('session.commentary.append', `${answer}\nActual website action results: ${JSON.stringify(results)}`, delegationId);
    else { if(transcript.at(-1)) transcript.at(-1).streaming = false; line('assistant',answer); }
  } catch (e) {
    if(controller.signal.aborted||expectedGeneration!==generation)return;
    error(e.message); emotion('calm');
    if (delegationId) send('session.commentary.append','The website action failed. Explain that politely; do not claim it succeeded.',delegationId);
  }
}
async function start() {
  if(ending)return;
  if (connecting || sessionReady) {
    try {await audio.play();await visualAudio?.resume();if(sessionReady){audioBlocked=false;status(muted?'Microphone muted':'Listening · you can interrupt');visitorActivity();q('.live-start').disabled=true;q('.live-start').textContent='Voice connected';error('');send('session.commentary.append','Audio is now enabled. Briefly welcome the visitor and invite their question.');}}
    catch {audioBlocked=true;error('Select the AI avatar to enable audio.');} return;
  }
  generation++; if(token) { fetch('/api/end',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token}),keepalive:true}).catch(()=>{}); token=undefined; }
  muted=false;lastInput='';inputEndMs=0;clearTimeout(timer);q('.live-mute').textContent='Mute mic';q('.live-mute').setAttribute('aria-pressed','false');q('.live-mute').setAttribute('aria-label','Mute microphone');
  ending=false;audioBlocked=false;
  const startGeneration=generation;
  connecting = true; q('.live-start').disabled = true; error('');
  status('Allow microphone in your browser');
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Voice needs a browser with microphone support on HTTPS.');
    beginPermissionPrompt();
    try{mic = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});}
    finally{cancelPermissionPrompt();}
    if(startGeneration!==generation){mic?.getTracks().forEach(t=>t.stop());return;}
    status('Connecting your guide…');
    peer = new RTCPeerConnection();
    const connection = peer;
    for (const track of mic.getAudioTracks()) connection.addTrack(track,mic);
    connection.addEventListener('track',event=>{
      audio.srcObject = new MediaStream([event.track]);
      try {
        visualAudio=new AudioContext();const analyser=visualAudio.createAnalyser();analyser.fftSize=256;
        visualAudio.createMediaStreamSource(audio.srcObject).connect(analyser);
        const samples=new Float32Array(analyser.fftSize);
        const animate=()=>{analyser.getFloatTimeDomainData(samples);const energy=Math.min(1,Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length)*7);root.style.setProperty('--voice-energy',energy.toFixed(3));root.classList.toggle('speaking',energy>.03);visualFrame=requestAnimationFrame(animate);};animate();
        visualAudio.resume().catch(()=>{});
      } catch { /* Voice remains usable when audio visualization is unavailable. */ }
      audio.play().then(()=>{audioBlocked=false;refreshAvatar();}).catch(()=>{audioBlocked=true;q('.live-start').disabled=false;q('.live-start').textContent='Enable sound';status('Select the AI avatar to enable audio.');});
    });
    channel = connection.createDataChannel('oai-events');
    channel.addEventListener('message',({data})=>{
      if(connection!==peer)return;
      let event; try {event=JSON.parse(data);} catch {return;}
      if(event.type==='session.started') {
        sessionReady=true; connecting=false; root.classList.add('connected'); status('Listening · you can interrupt');
        idleNudges=0;visitorActivity();
        q('.live-mute').disabled=false; q('.live-stop').disabled=false;
        greetingEvent=send('session.instructions.append',`Speak English unless the visitor asks for another language. Greet the visitor now. Say: ${guide.greeting} Then wait for their response. Introduce yourself as an AI guide.`);
      } else if(event.type==='session.instructions.appended'&&event.client_event_id===greetingEvent) {
        send('session.commentary.append','Begin the conversation now, following the greeting instructions.');
      } else if(event.type==='session.input_transcript.delta') {
        if(event.delta?.trim())visitorActivity();
        line('user',event.delta);
        if(typeof event.start_ms==='number'&&event.start_ms-inputEndMs>2200)lastInput='';
        lastInput=(lastInput+event.delta).slice(-600);inputEndMs=event.end_ms||inputEndMs;
      } else if(event.type==='session.output_transcript.delta') {line('assistant',event.delta);}
      else if(event.type==='session.delegation.created') {
        if(ending)return;
        const id=event.delegation.id; const message=lastInput;const current=generation;
        queue=queue.then(()=>act(message,id,current));
      } else if(event.type==='session.closed') {status('Conversation ended');cleanup();}
      else if(event.type==='error'&&!ending) error('The voice connection encountered a problem. Please end and reconnect.');
    });
    connection.addEventListener('connectionstatechange',()=>{
      if(['failed','disconnected'].includes(connection.connectionState)) {status('Connection lost — reconnect to continue');end();}
    });
    const offer=await connection.createOffer(); await connection.setLocalDescription(offer);
    if(connection.iceGatheringState!=='complete') await new Promise((resolve,reject)=>{
      const t=setTimeout(()=>reject(new Error('Connection timed out. Please try again.')),10000);
      connection.addEventListener('icegatheringstatechange',()=>{if(connection.iceGatheringState==='complete'){clearTimeout(t);resolve();}});
    });
    const data=await api('live',{sdp:connection.localDescription.sdp});
    if(startGeneration!==generation){fetch('/api/end',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:data.token}),keepalive:true}).catch(()=>{});return;}
    token=data.token;
    await connection.setRemoteDescription({type:'answer',sdp:data.sdp});
    timer=setTimeout(end,data.durationSeconds*1000);
  } catch(e) {
    if(startGeneration!==generation)return;
    if(e.name==='NotAllowedError')permissionDenied=true;
    cleanup(); status('Voice is optional');
    error(e.name==='NotAllowedError' ? 'Microphone permission was not granted. Allow it in your browser’s address bar, then select the AI avatar to try again.' : e.message);
    q('.live-start').textContent='Try microphone';
  }
}
q('.live-start').addEventListener('click',start);
q('.live-stop').addEventListener('click',end);
function toggleMute(){
  if(ending||!sessionReady)return;
  muted=!muted; mic?.getAudioTracks().forEach(track=>track.enabled=!muted);
  q('.live-mute').setAttribute('aria-label',muted?'Unmute microphone':'Mute microphone');
  q('.live-mute').textContent=muted?'Unmute mic':'Mute mic';q('.live-mute').setAttribute('aria-pressed',String(muted));status(muted?'Microphone muted':'Listening · you can interrupt');
  visitorActivity();
}
q('.live-mute').addEventListener('click',toggleMute);
q('.live-presence').addEventListener('click',()=>{if(ending||connecting)return;if(sessionReady&&!audioBlocked)toggleMute();else void start();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(sessionReady||connecting||token))void end();});
document.addEventListener('click',event=>{if(event.isTrusted)visitorActivity();});
document.addEventListener('keydown',event=>{if(event.isTrusted&&!['Shift','Control','Alt','Meta','Escape'].includes(event.key))visitorActivity();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearVisitorTimers();cancelPermissionPrompt();if(sessionReady||connecting||token)void end();}});
q('.live-reset').addEventListener('click',()=>{guide.applyActions([{type:'reset'}]);emotion('happy');send('session.thinking.append','The visitor reset the website appearance.');});
q('.live-collapse').addEventListener('click',()=>{collapsing=!collapsing;root.classList.toggle('collapsed',collapsing);q('.live-body').hidden=collapsing;q('.live-collapse').setAttribute('aria-expanded',String(!collapsing));q('.live-collapse').setAttribute('aria-label',collapsing?'Open conversation':'Close conversation');q('.live-collapse').textContent=collapsing?'Type or view conversation ↗':'Close conversation −';});
q('.live-form').addEventListener('submit',event=>{
  event.preventDefault();if(ending)return;const input=q('#live-message');const message=input.value.trim();if(!message)return;input.value='';
  if(transcript.at(-1))transcript.at(-1).streaming=false;line('user',message);const current=generation;queue=queue.then(()=>act(message,null,current));
});
document.addEventListener('click',event=>{if(ending)return;const button=event.target.closest('[data-ask]');if(button){const message=button.dataset.ask;line('user',message);const current=generation;queue=queue.then(()=>act(message,null,current));}});
window.addEventListener('site:changed',()=>send('session.thinking.append',`Current website state: ${JSON.stringify(guide.getState()).slice(0,1700)}`));
window.addEventListener('pagehide',end);
// Request immediately as requested; browsers retain control over permission and audio activation.
start();
