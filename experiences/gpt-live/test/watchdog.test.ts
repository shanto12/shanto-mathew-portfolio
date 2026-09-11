import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

// Run each case in an isolated VM so imports are replaced before evaluation.
// The function executes its real lifecycle code; no OpenAI or Netlify requests
// are made, and there is no dependency on real credentials or browser media.
const harness = String.raw`
import fs from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { EventEmitter } from 'node:events';
import { createHash, timingSafeEqual } from 'node:crypto';
import assert from 'node:assert/strict';

const mode = process.argv[2];
const stop = mode === 'stop';
const race = mode === 'race';
const maxClamp = mode === 'deadline';
const unavailable = mode === 'unavailable';
const unexpectedCode = mode === 'unexpected-code';
const pendingError = mode === 'pending-error';
const source = stripTypeScriptTypes(fs.readFileSync(process.argv[3], 'utf8'));
// Advance the watchdog's clock only after queued I/O and promise callbacks have
// drained. Host load or concurrent real Chrome tests cannot consume its budget.
let virtualNow = 1_800_000_000_000;
let timerId = 0;
const timers = new Map();
class VirtualDate extends Date { static now() { return virtualNow; } }
function schedule(callback, delay = 0, repeat = false, args = []) {
  const id = ++timerId;
  timers.set(id, { callback, at: virtualNow + Math.max(0, Number(delay) || 0), repeat, delay: Math.max(1, Number(delay) || 0), args });
  return id;
}
async function runWithClock(promise) {
  let settled = false, value, failure;
  promise.then(result => { value = result; settled = true; }, error => { failure = error; settled = true; });
  for (let step = 0; step < 1000 && !settled; step++) {
    // Mock websocket events use microtasks. Yield to the host event loop so
    // all request-body, store, websocket, and persistence chains settle first.
    await new Promise(setImmediate);
    await new Promise(setImmediate);
    if (settled) break;
    const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
    assert.ok(next, 'Unsettled handler has no scheduled work');
    const [id, timer] = next;
    virtualNow = timer.at;
    if (timer.repeat) timer.at += timer.delay;
    else timers.delete(id);
    timer.callback(...timer.args);
  }
  assert.equal(settled, true, 'Watchdog failed to settle within the virtual-clock bound');
  if (failure) throw failure;
  return value;
}
let record = {
  sessionId: 'live_test', tokenHash: 'test-reservation-identity',
  createdAt: virtualNow - (maxClamp ? 119000 : 0),
  deadline: virtualNow + (maxClamp ? 60000 : 2000),
  closed: false, stopRequested: stop, ready: false,
};
let version = 1;
let sent = 0;
let injected = false;
let becameReady = false;
let socketsCreated = 0;
let pings = 0;
let pendingErrorSent = false;
const store = {
  getWithMetadata: async key => {
    assert.equal(key, 'sessions/0');
    return { data: structuredClone(record), etag: String(version), metadata: {} };
  },
  setJSON: async (_key, data, options) => {
    // Emulate /end writing between a readiness read and conditional write.
    if (race && data.ready && !injected) {
      injected = true;
      record.stopRequested = true;
      version++;
    }
    if (options.onlyIfMatch !== String(version)) return { modified: false };
    record = structuredClone(data);
    becameReady ||= record.ready;
    version++;
    return { modified: true, etag: String(version) };
  },
};
class Socket extends EventEmitter {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = 0;
  constructor(url, options) {
    super();
    socketsCreated++;
    assert.equal(url, 'wss://api.openai.com/v1/live/sessions/live_test/attach');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    if (unavailable || unexpectedCode) {
      queueMicrotask(() => {
        const response = new EventEmitter();
        response.statusCode = 404;
        response.destroy = () => {};
        this.emit('unexpected-response', {}, response);
        response.emit('data', Buffer.from(JSON.stringify({ error: { code: unavailable ? 'session_id_not_found' : 'invalid_endpoint' } })));
        response.emit('end');
      });
      return;
    }
    queueMicrotask(() => { this.readyState = 1; this.emit('open'); });
  }
  ping() {
    pings++;
    queueMicrotask(() => this.emit('pong'));
  }
  send(data, callback) {
    assert.equal(JSON.parse(data).type, 'session.close');
    sent++;
    callback?.();
    // A close send or socket close alone must never finalize the record.
    assert.equal(record.closed, false);
    if (pendingError) queueMicrotask(() => {
      pendingErrorSent = true;
      this.emit('message', Buffer.from(JSON.stringify({
        type: 'error', error: { code: 'session_closing', message: 'Pending instruction append rejected while closing' },
      })), false);
    });
    queueMicrotask(() => this.emit('message', Buffer.from(JSON.stringify({
      type: 'session.closed', reason: 'close_requested', usage: { seconds: 0.1 },
    })), false));
  }
  terminate() {
    this.readyState = 3;
    queueMicrotask(() => this.emit('close'));
  }
}
const secret = 'test-watchdog-secret-0123456789';
const context = vm.createContext({
  console, Response, Buffer, Date: VirtualDate,
  setTimeout: (callback, delay, ...args) => schedule(callback, delay, false, args),
  setInterval: (callback, delay, ...args) => schedule(callback, delay, true, args),
  clearTimeout: id => timers.delete(id), clearInterval: id => timers.delete(id),
  Netlify: { env: { get: key => key === 'WATCHDOG_SECRET' ? secret : key === 'OPENAI_API_KEY' ? 'test-key' : undefined } },
});
const imports = {
  'node:crypto': { createHash, timingSafeEqual },
  '@netlify/blobs': { getStore: options => {
    assert.deepEqual({ ...options }, { name: 'live-budget-release-v1', consistency: 'strong' });
    return store;
  } },
  ws: { default: Socket },
};
const module = new vm.SourceTextModule(source, { context });
await module.link(specifier => {
  const values = imports[specifier];
  assert.ok(values, 'Unexpected import: ' + specifier);
  return new vm.SyntheticModule(Object.keys(values), function () {
    for (const [key, value] of Object.entries(values)) this.setExport(key, value);
  }, { context });
});
await module.evaluate();
const handler = module.namespace.default;
const request = watchdogSecret => new Request('http://local', {
  method: 'POST', body: JSON.stringify({ slot: 0, watchdogSecret }),
});
assert.equal((await handler(request('wrong'))).status, 401);
assert.equal(socketsCreated, 0, 'Rejected authentication must not attach to a session');
assert.equal((await handler(new Request('http://local'))).status, 405);
const began = virtualNow;
assert.equal((await runWithClock(handler(request(secret)))).status, 200);
if (unavailable || unexpectedCode) {
  assert.equal(record.closed, false, 'Unavailable must never fabricate provider closure');
  assert.equal(record.usageSeconds, undefined, 'Unavailable must never invent usage');
  assert.equal(record.ready, false);
  assert.equal(record.stopRequested, true);
  assert.equal(sent, 0);
  if (unavailable) {
    assert.equal(socketsCreated, 1, 'Specific session-not-found response must stop retries');
    assert.equal(record.providerUnavailable, true);
    assert.equal(record.finalization, 'provider_unavailable');
    assert.equal(record.watchdogReason, 'session_id_not_found');
    assert.equal(record.checkedAt, virtualNow);
  } else {
    assert.ok(socketsCreated > 1, 'Other 404 error codes must retry');
    assert.equal(record.providerUnavailable, undefined);
    assert.equal(record.finalization, 'unconfirmed');
    assert.equal(record.watchdogReason, 'close_unconfirmed');
    assert.ok(virtualNow - began >= 480000, 'Unknown 404 should retry up to the bounded watchdog deadline');
  }
} else {
assert.equal(sent, 1);
assert.equal(record.closed, true);
assert.equal(record.ready, false);
assert.equal(record.finalization, 'confirmed');
assert.equal(record.usageSeconds, 0.1);
assert.equal(record.usageFinal, true);
if (pendingError) {
  assert.equal(pendingErrorSent, true, 'Case must deliver the pending-command error before session.closed');
  assert.equal(socketsCreated, 1, 'Pending command error must not terminate or reconnect the closing sideband');
  assert.equal(record.providerUnavailable, undefined, 'Final provider closure must retain confirmed usage');
}
if (race || stop) assert.equal(record.stopRequested, true);
if (race) {
  assert.equal(injected, true, 'Case must exercise the compare-and-swap conflict');
  assert.equal(becameReady, false, 'Concurrent stop must prevent a stale readiness write');
}
if (!race && !stop) {
  assert.equal(becameReady, true);
  assert.ok(pings > 0, 'Readiness must confirm the sideband is responsive');
}
if (maxClamp) assert.equal(virtualNow - began, 1000, 'createdAt + 120 seconds must clamp a later deadline');
}
`;

const sourcePath = fileURLToPath(new URL('../netlify/functions/watchdog-background.mts', import.meta.url));
const cases = [
  ['normal', 'authenticates, confirms readiness, and persists provider closure and usage'],
  ['stop', 'closes an already stopped reservation without publishing readiness'],
  ['race', 'preserves concurrent stop requests through a conditional-write conflict'],
  ['deadline', 'caps the deadline at 120 seconds from session creation'],
  ['unavailable', 'reconciles only authenticated session_id_not_found without inventing closure or usage'],
  ['unexpected-code', 'keeps unrelated 404 responses unconfirmed and retries within the watchdog bound'],
  ['pending-error', 'waits for confirmed closure and usage after a pending-command error during shutdown'],
] as const;

for (const [mode, description] of cases) {
  test(`watchdog ${description}`, { timeout: 10_000 }, () => {
    const result = spawnSync(process.execPath, [
      '--experimental-vm-modules', '--input-type=module', '-', mode, sourcePath,
    ], { input: harness, encoding: 'utf8', timeout: 5_000, maxBuffer: 1024 * 1024 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });
}
