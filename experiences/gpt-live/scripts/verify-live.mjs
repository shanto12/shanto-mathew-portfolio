/** Real deployed voice verification: RUNNING THIS FILE USES PAID API SESSIONS.
 * AGENTMART_BASE=https://... PORTFOLIO_BASE=https://... node verify-live.mjs
 * One voice session per supplied site; no retries or text-only fallback sessions.
 * Isolated Chrome with synthetic microphone audio, not the user's Chrome profile.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const runFile = promisify(execFile);
const require = createRequire(import.meta.url);
let chromium;
for (const candidate of [process.env.PLAYWRIGHT_MODULE, 'playwright', '/Users/shanto/.npm/_npx/31e32ef8478fbf80/node_modules/playwright'].filter(Boolean)) {
  try { ({ chromium } = require(candidate)); break; } catch {}
}
if (!chromium) throw new Error('Set PLAYWRIGHT_MODULE to an installed Playwright package path.');
const root = path.dirname(fileURLToPath(import.meta.url));
const stamp = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()).replace(/[ :]/g, '-');
const output = process.env.OUTPUT_DIR || path.join(root, 'output/playwright', 'live-' + stamp);
const sites = [
  { id: 'agentmart', url: process.env.AGENTMART_BASE, target: 'agents', targetName: 'My agents' },
  { id: 'portfolio', url: process.env.PORTFOLIO_BASE, target: 'work', targetName: 'Selected work' },
].filter(site => site.url);
if (!sites.length) throw new Error('Provide AGENTMART_BASE and/or PORTFOLIO_BASE.');
for (const site of sites) if (new URL(site.url).protocol !== 'https:') throw new Error('Use the actual deployed HTTPS site URL.');
await fs.mkdir(output, { recursive: true });
const phrase = 'Change this website to rose pink, look playful, show TARGET, and celebrate with confetti.';
const report = {
  testedAtCentral: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }) + ' Central Time',
  mode: 'Actual deployed WebRTC/API, isolated Chrome, synthetic visitor audio; no API responses mocked. Does not verify a human microphone, subjective audio quality, or the real Chrome profile.',
  visitorSpeech: phrase, sites: [],
};
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: process.env.HEADED !== '1',
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
});
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function verify(site) {
  const speechPath = path.join(output, site.id+'-synthetic-visitor.wav');
  await runFile('/usr/bin/say',['--file-format=WAVE','--data-format=LEI16@24000','-r','190','-o',speechPath,phrase.replace('TARGET',site.targetName)],{timeout:15000});
  const speechBase64=(await fs.readFile(speechPath)).toString('base64');
  const data = { id: site.id, url: site.url, checks: [], apiRequests: [], httpErrors: [], pageErrors: [], consoleErrors: [], failedRequests: [], screenshots: [], liveRequests: 0 };
  report.sites.push(data);
  const began = Date.now();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['microphone'], reducedMotion: 'reduce' });
  const hardStop = setTimeout(() => {
    data.checks.push({ name: '90-second browser test ceiling', result: 'FAIL', error: 'Forced browser context closure at test deadline; server watchdog remains responsible for provider closure.' });
    void context.close().catch(() => {});
  }, Math.max(1, 90_000 - (Date.now() - began)));
  // All instrumentation observes public browser APIs. The synthesized stream is
  // actual WebRTC media sent to the deployed app's real provider connection.
  await context.addInitScript(() => {
    const state = window.__liveEvidence = { effects: [], peers: [], inputTracks: [], remoteTracks: [], contexts: [], recorders: [], rmsMax: 0, rmsSamples: 0, audibleSamples: 0, remoteBytes: 0, chunks: [], events: [], inputTranscript: '', outputTranscript: '', started: false, closed: false, speechPlayed: false };
    new MutationObserver(()=>{for(const e of document.querySelectorAll('[data-effect]')){const value=e.getAttribute('data-effect');if(value&&!state.effects.includes(value))state.effects.push(value);}}).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-effect']});
    const nativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async constraints => {
      const fake = await nativeGetUserMedia(constraints);
      fake.getTracks().forEach(track => track.stop());
      const audio = new AudioContext();
      state.contexts.push(audio);
      await audio.resume();
      const destination = audio.createMediaStreamDestination();
      // Keep a silent source connected until the synthetic visitor speaks.
      const oscillator = audio.createOscillator();
      const gain = audio.createGain(); gain.gain.value = 0;
      oscillator.connect(gain).connect(destination); oscillator.start();
      state.microphoneContext = audio; state.microphoneDestination = destination;
      state.inputTracks.push(...destination.stream.getTracks());
      return destination.stream;
    };
    const NativePeer = window.RTCPeerConnection;
    window.RTCPeerConnection = class extends NativePeer {
      constructor(...args) {
        super(...args); state.peers.push(this);
        this.addEventListener('track', event => {
          if (event.track.kind !== 'audio') return;
          state.remoteTracks.push(event.track);
          const stream = new MediaStream([event.track]);
          const audio = new AudioContext(); state.contexts.push(audio); void audio.resume();
          const analyser = audio.createAnalyser(); analyser.fftSize = 2048;
          audio.createMediaStreamSource(stream).connect(analyser);
          const samples = new Float32Array(analyser.fftSize);
          const timer = setInterval(() => {
            analyser.getFloatTimeDomainData(samples);
            const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
            state.rmsSamples++; state.rmsMax = Math.max(state.rmsMax, rms);
            if (rms > 0.001) state.audibleSamples++;
          }, 80);
          event.track.addEventListener('ended', () => clearInterval(timer));
          const mimeType = ['audio/webm;codecs=opus', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type));
          const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
          recorder.addEventListener('dataavailable', event => {
            if (event.data.size) { state.chunks.push(event.data); state.remoteBytes += event.data.size; }
          });
          recorder.start(250); state.recorders.push(recorder);
        });
      }
      createDataChannel(...args) {
        const channel = super.createDataChannel(...args);
        channel.addEventListener('message', event => {
          let message; try { message = JSON.parse(event.data); } catch { return; }
          if (typeof message.type !== 'string') return;
          if (state.events.length < 500) state.events.push(message.type);
          if (message.type === 'session.started') state.started = true;
          if (message.type === 'session.closed') state.closed = true;
          if (message.type === 'session.input_transcript.delta') state.inputTranscript = (state.inputTranscript + (message.delta || '')).slice(-16000);
          if (message.type === 'session.output_transcript.delta') state.outputTranscript = (state.outputTranscript + (message.delta || '')).slice(-24000);
        });
        return channel;
      }
    };
    state.playSpeech = async base64 => {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const context = state.microphoneContext;
      await context.resume();
      const buffer = await context.decodeAudioData(bytes.buffer);
      const source = context.createBufferSource(); source.buffer = buffer;
      source.connect(state.microphoneDestination);
      state.speechPlayed = true; state.speechDurationSeconds = buffer.duration;
      await new Promise(resolve => { source.onended = resolve; source.start(); });
    };
  });
  // Guard against accidental retries or creating a separate text session. The
  // first actual voice request and the normal guide requests pass untouched.
  await context.route('**/api/**', async route => {
    const request = route.request();
    const endpoint = new URL(request.url()).pathname;
    data.apiRequests.push({ endpoint, method: request.method() });
    if (request.method() === 'POST' && endpoint === '/api/live' && ++data.liveRequests > 1) return route.abort('blockedbyclient');
    if (request.method() === 'POST' && endpoint === '/api/chat') return route.abort('blockedbyclient');
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => data.pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') data.consoleErrors.push(message.text().slice(0, 1000)); });
  const safeUrl = value => { const url = new URL(value); return url.origin + url.pathname; };
  page.on('requestfailed', request => data.failedRequests.push({ url: safeUrl(request.url()), failure: request.failure()?.errorText }));
  page.on('response', response => { if (response.status() >= 400) data.httpErrors.push({ url: safeUrl(response.url()), status: response.status() }); });
  const remaining = () => Math.max(1, 80_000 - (Date.now() - began));
  const wait = (fn, arg, limit = 20_000) => page.waitForFunction(fn, arg, { timeout: Math.min(limit, remaining()) });
  async function step(name, fn) {
    page.setDefaultTimeout(Math.min(7000, remaining()));
    await fn(); data.checks.push({ name, result: 'PASS' }); console.log('PASS', site.id, name);
  }
  async function snapshot(name) {
    const filename = `${site.id}-${name}.png`;
    await page.screenshot({ path: path.join(output, filename), timeout: 3000 }); data.screenshots.push(filename);
  }
  let budgetTimer;
  try {
    await Promise.race([
      (async () => {
        await step('Actual deployed session connects and automatically greets with audible remote audio', async () => {
          const response = await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: Math.min(15_000, remaining()) });
          assert(response?.ok(), 'Deployed document did not load successfully');
          await wait(() => window.siteGuide && window.__liveEvidence?.started && document.querySelector('.live-guide.connected'));
          assert(await page.evaluate(() => siteGuide.id) === site.id, 'Wrong site identity');
          await wait(() => __liveEvidence.outputTranscript.length > 35 && __liveEvidence.audibleSamples >= 3 && __liveEvidence.remoteBytes > 0, undefined, 15_000);
          data.greeting = await page.evaluate(() => ({ transcript: __liveEvidence.outputTranscript, rmsMax: __liveEvidence.rmsMax, audibleSamples: __liveEvidence.audibleSamples, recordedBytes: __liveEvidence.remoteBytes, inputTranscript: __liveEvidence.inputTranscript, audioPlaying: [...document.querySelectorAll('audio')].some(audio => !audio.paused && audio.currentTime > 0) }));
          assert(data.greeting.inputTranscript === '', 'Greeting did not occur before synthetic visitor input');
          assert(data.greeting.audioPlaying, 'Remote audio element is not playing');
        });
        await snapshot('greeting');
        await step('Synthetic spoken visitor request is transcribed over the real WebRTC connection', async () => {
          await page.evaluate(base64 => __liveEvidence.playSpeech(base64), speechBase64);
          await wait(() => /rose|pink|playful/i.test(__liveEvidence.inputTranscript), undefined, 10_000);
          data.voiceInputTranscript = await page.evaluate(() => __liveEvidence.inputTranscript);
        });
        await step('Spoken request changes the page and expressive avatar', async () => {
          await wait(() => siteGuide.getState().theme==='rose' && document.querySelector('.live-face').dataset.emotion==='playful',undefined,15000);
          data.spokenActionState=await page.evaluate(()=>siteGuide.getState());
        });
        await step('Spoken navigation and confetti effect apply through the real planner', async()=>{
          await wait(target=>{const s=siteGuide.getState();return (s.section===target||s.view===target)&&__liveEvidence.effects.includes('confetti');},site.target,15000);
          data.pageState=await page.evaluate(()=>siteGuide.getState());
          data.effects=await page.evaluate(()=>__liveEvidence.effects);
        });
        await snapshot('spoken-navigation');
        if(site.id==='portfolio')await step('Portfolio guide explains Shanto’s professional fit through real voice delegation',async()=>{
          const speech=path.join(output,'portfolio-career-question.wav');
          await fs.copyFile(path.join(root,'output/career-question.wav'),speech);
          const before=await page.evaluate(()=>__liveEvidence.outputTranscript.length);
          await page.evaluate(base64=>__liveEvidence.playSpeech(base64),(await fs.readFile(speech)).toString('base64'));
          await wait(n=>/Python|security|engineer|enterprise|delivery/i.test(__liveEvidence.outputTranscript.slice(n)),before,25000);
          data.careerPitch=await page.evaluate(n=>__liveEvidence.outputTranscript.slice(n),before);
        });

        await step('Mute and unmute control the actual outgoing audio track', async () => {
          await page.locator('.live-presence').click();
          assert(await page.evaluate(() => __liveEvidence.inputTracks.every(track => !track.enabled)), 'Outgoing track was not muted');
          assert(await page.locator('.live-mute').getAttribute('aria-pressed') === 'true', 'Mute UI state incorrect');
          await page.locator('.live-presence').click();
          assert(await page.evaluate(() => __liveEvidence.inputTracks.every(track => track.enabled)), 'Outgoing track did not unmute');
        });
      })(),
      new Promise((_, reject) => { budgetTimer = setTimeout(() => reject(new Error('80-second work budget reached; closing session now')), remaining()); }),
    ]);
  } catch (error) {
    data.checks.push({ name: 'Live workflow', result: 'FAIL', error: error.message });
    console.error('FAIL', site.id, error.message);
  } finally {
    clearTimeout(budgetTimer);
    try {
      data.beforeEnd = await page.evaluate(async () => {
        const state = window.__liveEvidence; if (!state) return null;
        const stats = [];
        for (const peer of state.peers) for (const entry of (await peer.getStats()).values()) {
          if (['inbound-rtp', 'outbound-rtp'].includes(entry.type) && (entry.kind === 'audio' || entry.mediaType === 'audio')) {
            const item = {}; for (const key of ['type', 'kind', 'bytesReceived', 'bytesSent', 'packetsReceived', 'packetsSent', 'packetsLost', 'jitter', 'totalAudioEnergy', 'totalSamplesDuration']) if (entry[key] !== undefined) item[key] = entry[key];
            stats.push(item);
          }
        }
        return { stats, connected: state.peers.map(peer => peer.connectionState), rmsMax: state.rmsMax, audibleSamples: state.audibleSamples, remoteBytes: state.remoteBytes, transcript: document.querySelector('.live-transcript')?.textContent, inputTranscript: state.inputTranscript, outputTranscript: state.outputTranscript, events: state.events, error: document.querySelector('.live-error')?.textContent };
      });
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => {
        const state = window.__liveEvidence;
        return state && state.inputTracks.every(track => track.readyState === 'ended') && state.peers.every(peer => peer.connectionState === 'closed');
      }, undefined, { timeout: 7000 });
      data.afterEnd = await page.evaluate(() => ({ inputTracks: __liveEvidence.inputTracks.map(track => track.readyState), remoteTracks: __liveEvidence.remoteTracks.map(track => track.readyState), connections: __liveEvidence.peers.map(peer => peer.connectionState), providerClosedEventSeen: __liveEvidence.closed, status: document.querySelector('.live-status')?.textContent }));
      assert([...data.afterEnd.inputTracks, ...data.afterEnd.remoteTracks].every(state => state === 'ended'), 'An audio track remains live after End');
      assert(data.afterEnd.providerClosedEventSeen,'Provider session.closed was not observed before local teardown');
      data.checks.push({ name: 'End closes the peer and stops all local/remote audio tracks', result: 'PASS' });
      const bytes = data.beforeEnd?.stats?.filter(item => item.type === 'inbound-rtp').reduce((sum, item) => sum + (item.bytesReceived || 0), 0) || 0;
      assert(bytes > 0, 'No incoming audio bytes in WebRTC statistics');
      data.checks.push({ name: 'WebRTC statistics confirm incoming audio packets', result: 'PASS' });
    } catch (error) { data.checks.push({ name: 'End and media verification', result: 'FAIL', error: error.message }); }
    try {
      const recording = await page.evaluate(async () => {
        const state = window.__liveEvidence; if (!state) return null;
        await Promise.all(state.recorders.map(recorder => recorder.state === 'inactive' ? Promise.resolve() : new Promise(resolve => { recorder.addEventListener('stop', resolve, { once: true }); recorder.stop(); })));
        const blob = new Blob(state.chunks, { type: state.recorders[0]?.mimeType || 'audio/webm' });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = ''; for (let index = 0; index < bytes.length; index += 8192) binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
        await Promise.all(state.contexts.map(context => context.close().catch(() => {})));
        return { base64: btoa(binary), bytes: bytes.length, mimeType: blob.type };
      });
      if (recording?.bytes) {
        const filename = `${site.id}-remote-audio.webm`;
        await fs.writeFile(path.join(output, filename), Buffer.from(recording.base64, 'base64'));
        data.remoteRecording = { filename, bytes: recording.bytes, mimeType: recording.mimeType };
      }
      await snapshot('ended');
    } catch (error) { data.artifactError = error.message; }
    await context.close();
    clearTimeout(hardStop);
    data.elapsedSeconds = Math.round((Date.now() - began) / 100) / 10;
    if (data.liveRequests !== 1) data.checks.push({ name: 'Exactly one voice session request', result: 'FAIL', error: `Observed ${data.liveRequests}` });
    if (data.pageErrors.length) data.checks.push({ name: 'No browser runtime errors', result: 'FAIL', error: data.pageErrors.join('; ') });
    await fs.writeFile(path.join(output, 'live-verification.json'), JSON.stringify(report, null, 2));
  }
}
try { for (const site of sites) await verify(site); }
finally {
  await browser.close();
  await fs.writeFile(path.join(output, 'live-verification.json'), JSON.stringify(report, null, 2));
  const rows = report.sites.flatMap(site => site.checks.map(check => `| ${site.id} | ${check.name} | ${check.result} | ${(check.error || '').replaceAll('|', '/').replaceAll('\n', ' ')} |`));
  await fs.writeFile(path.join(output, 'LIVE_EVIDENCE_MATRIX.md'), `# Actual deployed voice evidence\n\n${report.testedAtCentral}\n\n${report.mode}\n\nBrowser End evidence alone does not establish final provider billing; verify server-side session.closed records separately.\n\n| Site | Check | Result | Detail |\n|---|---|---|---|\n${rows.join('\n')}\n`);
}
const failures = report.sites.flatMap(site => site.checks.filter(check => check.result === 'FAIL'));
console.log(JSON.stringify({ output, sites: report.sites.length, failures: failures.length }));
if (failures.length) process.exitCode = 1;
