import { createHash, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
import WebSocket from 'ws';
import {budgetConfig} from './budget.mjs';

type SessionRecord = {
  sessionId: string;
  tokenHash: string;
  createdAt: number;
  deadline: number;
  closed: boolean;
  stopRequested: boolean;
  ready: boolean;
  usageSeconds?: number;
  [key: string]: unknown;
};

const MAX_SESSION_MS = 600_000;
const MAX_WATCHDOG_MS = 14 * 60_000;
const POLL_MS = 2_000;
const STORE_TIMEOUT_MS = 4_000;
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function bounded<T>(work: Promise<T>, ms = STORE_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('operation_timeout')), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function validRecord(value: unknown): value is SessionRecord {
  if (!value || typeof value !== 'object') return false;
  const r = value as SessionRecord;
  return typeof r.sessionId === 'string' && /^[A-Za-z0-9_-]{1,256}$/.test(r.sessionId)
    && typeof r.tokenHash === 'string'
    && Number.isFinite(r.createdAt) && r.createdAt > 0
    && Number.isFinite(r.deadline) && r.deadline > 0
    && typeof r.closed === 'boolean' && typeof r.stopRequested === 'boolean'
    && typeof r.ready === 'boolean';
}

function matchesSecret(provided: unknown, expected: string | undefined): boolean {
  if (typeof provided !== 'string' || !expected || expected.length < 24 || provided.length > 1024) return false;
  // Fixed-size hashes allow timingSafeEqual even when input lengths differ.
  return timingSafeEqual(createHash('sha256').update(provided).digest(), createHash('sha256').update(expected).digest());
}

function usageFrom(event: Record<string, unknown>): number | undefined {
  const value = (event.usage as { seconds?: unknown } | undefined)?.seconds;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

// Background responses are acknowledged by Netlify before execution completes.
// Callers must poll the trusted session record; HTTP 202 is not readiness proof.
export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  let input: { slot?: unknown; watchdogSecret?: unknown };
  try {
    const body = await request.text();
    if (body.length > 2048) return new Response(null, { status: 413 });
    input = JSON.parse(body);
    if (!input || typeof input !== 'object') return new Response(null, { status: 400 });
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!matchesSecret(input.watchdogSecret, Netlify.env.get('WATCHDOG_SECRET'))) {
    return new Response(null, { status: 401 });
  }
  if (!Number.isSafeInteger(input.slot) || Number(input.slot) < 0) return new Response(null, { status: 400 });

  const store = getStore({ name: budgetConfig('portfolio',key=>Netlify.env.get(key)).storeName, consistency: 'strong' });
  const key = `sessions/${input.slot}`;
  const startedAt = Date.now();
  const finishBy = startedAt + MAX_WATCHDOG_MS;
  let initial: SessionRecord;
  try {
    const found = await bounded(store.getWithMetadata(key, { type: 'json' }));
    if (!found || !validRecord(found.data)) return new Response(null, { status: 404 });
    initial = found.data;
  } catch {
    // No provider session is created by this function, including on retries.
    return new Response(null, { status: 503 });
  }
  if (initial.closed) return new Response(null, { status: 200 });
  const sessionId = initial.sessionId;
  const tokenHash = initial.tokenHash;
  const deadline = Math.min(initial.deadline, initial.createdAt + MAX_SESSION_MS);

  // Every change merges into a fresh version. Never clear stopRequested, replace
  // a reused slot, or accidentally reopen a record finalized by another worker.
  async function update(change: Partial<SessionRecord> | ((record: SessionRecord) => Partial<SessionRecord>)): Promise<void> {
    for (let attempt = 0; attempt < 8; attempt++) {
      const found = await bounded(store.getWithMetadata(key, { type: 'json' }));
      if (!found || !validRecord(found.data) || !found.etag) throw new Error('record_unavailable');
      const current: SessionRecord = found.data;
      if (current.sessionId !== sessionId || current.tokenHash !== tokenHash) throw new Error('record_replaced');
      if (current.closed) return;
      const patch = typeof change === 'function' ? change(current) : change;
      const next = { ...current, ...patch, stopRequested: current.stopRequested || patch.stopRequested === true };
      const result = await bounded(store.setJSON(key, next, { onlyIfMatch: found.etag, metadata: found.metadata }));
      if (result.modified && result.etag) return;
      await sleep(25 + attempt * 25);
    }
    throw new Error('record_conflict');
  }

  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    await update({ ready: false, watchdogReason: 'credentials_unavailable', finalization: 'unconfirmed' }).catch(() => {});
    return new Response(null, { status: 503 });
  }

  let latestUsage = initial.usageSeconds;
  let closedEvent: Record<string, unknown> | undefined;
  let externallyClosed = false;
  let providerUnavailable = false;
  let mustClose = initial.stopRequested || Date.now() >= deadline;
  let attempts = 0;

  while (Date.now() < finishBy && !closedEvent && !externallyClosed && !providerUnavailable) {
    attempts++;
    // A lost watchdog channel is a fail-closed condition: retry only to close.
    if (attempts > 1) mustClose = true;
    await update({ ready: false, watchdogReason: attempts > 1 ? 'reconnecting_to_close' : 'connecting' }).catch(() => { mustClose = true; });

    await new Promise<void>(resolve => {
      let socket: WebSocket;
      let finished = false;
      let closeSent = false;
      let healthConfirmed = false;
      let lastPong = Date.now();
      let persistence = Promise.resolve();
      let polling = false;
      const timers: ReturnType<typeof setTimeout>[] = [];
      const intervals: ReturnType<typeof setInterval>[] = [];

      const finish = () => {
        if (finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        intervals.forEach(clearInterval);
        if (socket && socket.readyState !== WebSocket.CLOSED) socket.terminate();
        // Retain the listener on error: terminate can emit a final socket error.
        // Drain readiness writes before reconnect/finalization so an old socket
        // cannot mark the session ready after the next state transition.
        void persistence.then(resolve, resolve);
      };
      const close = () => {
        mustClose = true;
        if (finished || closeSent || socket.readyState !== WebSocket.OPEN) return;
        closeSent = true;
        persistence = persistence.then(() => update({ ready: false, watchdogReason: 'closing' })).catch(() => {});
        try {
          socket.send(JSON.stringify({ type: 'session.close' }), error => { if (error) finish(); });
          // If finalization is lost, reconnect and retry closure. Never report
          // closed merely because a socket or HTTP operation completed.
          timers.push(setTimeout(finish, 25_000));
        } catch { finish(); }
      };
      const markReady = () => {
        if (healthConfirmed || finished) return;
        healthConfirmed = true;
        if (mustClose || Date.now() >= deadline) { close(); return; }
        persistence = persistence.then(() => update(current =>
          finished || closeSent || mustClose || current.stopRequested || Date.now() >= deadline
            ? { ready: false }
            : { ready: true, watchdogReason: 'monitoring', watchdogReadyAt: Date.now() }))
          .catch(() => { close(); });
      };

      try {
        const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}` };
        // Honor explicit project routing used when the parent creates sessions.
        const project = Netlify.env.get('OPENAI_PROJECT');
        const organization = Netlify.env.get('OPENAI_ORGANIZATION');
        if (project) headers['OpenAI-Project'] = project;
        if (organization) headers['OpenAI-Organization'] = organization;
        socket = new WebSocket(`wss://api.openai.com/v1/live/sessions/${encodeURIComponent(sessionId)}/attach`, {
          headers, handshakeTimeout: 10_000, maxPayload: 1024 * 1024,
          perMessageDeflate: false, followRedirects: false,
        });
      } catch { finish(); return; }

      timers.push(setTimeout(finish, Math.max(1, finishBy - Date.now())));
      timers.push(setTimeout(close, Math.max(0, deadline - Date.now())));
      timers.push(setTimeout(() => { if (!healthConfirmed) { mustClose = true; close(); } }, 12_000));
      socket.on('open', () => {
        // An authenticated upgrade plus a protocol pong proves the sideband is
        // responsive even before the browser sends media or any API event.
        lastPong = Date.now();
        if (mustClose || Date.now() >= deadline) close();
        else socket.ping();
      });
      socket.on('pong', () => { lastPong = Date.now(); markReady(); });
      socket.on('unexpected-response', (_request, response) => {
        // Only this authenticated, session-specific response reconciles a lost
        // final event. It never establishes a close time, final usage or refund.
        const chunks: Buffer[] = [];
        let size = 0;
        timers.push(setTimeout(() => { response.destroy(); finish(); }, 5_000));
        response.on('data', (chunk: Buffer | string) => {
          const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += bytes.length;
          if (size > 8192) { response.destroy(); finish(); return; }
          chunks.push(bytes);
        });
        response.on('end', () => {
          if (finished) return;
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as { error?: { code?: unknown } };
            if (response.statusCode === 404 && body?.error?.code === 'session_id_not_found') providerUnavailable = true;
          } catch { /* Unrecognized responses remain unconfirmed. */ }
          finish();
        });
        response.on('error', () => finish());
      });
      socket.on('message', (data, isBinary) => {
        if (finished || isBinary) return;
        let event: Record<string, unknown>;
        try { event = JSON.parse(data.toString()); } catch { return; }
        if (!event || typeof event.type !== 'string') return;
        if (event.type === 'error' || event.type === 'session.command.rejected') {
          // Never persist upstream error details, which may contain private data.
          mustClose = true;
          if (!closeSent) close();
          // Pending append commands can reject during shutdown. Keep the socket
          // open for session.closed rather than losing final usage on that error.
          return;
        }
        const eventSession = event.session as { id?: unknown } | undefined;
        if (eventSession?.id !== undefined && eventSession.id !== sessionId) { mustClose = true; close(); return; }
        if (event.type === 'session.closed') {
          closedEvent = event;
          latestUsage = usageFrom(event) ?? latestUsage;
          finish();
          return;
        }
        if (event.type === 'session.usage.updated') latestUsage = usageFrom(event) ?? latestUsage;
        if (event.type.startsWith('session.')) markReady();
      });
      socket.on('error', () => { mustClose = true; finish(); });
      socket.on('close', () => { if (!closedEvent) mustClose = true; finish(); });

      intervals.push(setInterval(() => {
        if (finished || socket.readyState !== WebSocket.OPEN) return;
        if (Date.now() - lastPong > 20_000) { mustClose = true; finish(); return; }
        try { socket.ping(); } catch { mustClose = true; finish(); }
      }, 5_000));
      intervals.push(setInterval(() => {
        if (finished || polling) return;
        if (Date.now() >= deadline) close();
        polling = true;
        void bounded(store.getWithMetadata(key, { type: 'json' })).then(found => {
          if (finished) return;
          if (!found || !validRecord(found.data) || found.data.sessionId !== sessionId || found.data.tokenHash !== tokenHash) {
            close();
          } else if (found.data.closed) {
            externallyClosed = true;
            finish();
          } else if (found.data.stopRequested) close();
        }).catch(() => { close(); }).finally(() => { polling = false; });
      }, POLL_MS));
    });

    if (!closedEvent && !externallyClosed && !providerUnavailable && Date.now() < finishBy) {
      await sleep(Math.min(5_000, 500 * 2 ** Math.min(attempts - 1, 4), Math.max(0, finishBy - Date.now())));
    }
  }

  if (externallyClosed) return new Response(null, { status: 200 });
  if (providerUnavailable) {
    await update({ providerUnavailable: true, finalization: 'provider_unavailable', watchdogReason: 'session_id_not_found', ready: false, stopRequested: true, checkedAt: Date.now() })
      .catch(() => { console.warn('watchdog_unavailable_record_unconfirmed'); });
  } else if (closedEvent) {
    const finalUsage = usageFrom(closedEvent);
    const allowedReasons = new Set(['close_requested', 'expired', 'remote_hangup', 'connection_lost', 'safety']);
    const reason = typeof closedEvent.reason === 'string' && allowedReasons.has(closedEvent.reason) ? closedEvent.reason : 'provider_closed';
    const patch: Partial<SessionRecord> = {
      closed: true, ready: false, closedAt: Date.now(),
      watchdogReason: reason, finalization: 'confirmed',
      usageFinal: finalUsage !== undefined,
    };
    if (latestUsage !== undefined) patch.usageSeconds = latestUsage;
    // Persistence can fail after a confirmed provider close. Keep admission
    // fail-closed (old reservation remains) rather than inventing completion.
    await update(patch).catch(() => { console.warn('watchdog_final_record_unavailable'); });
  } else {
    const patch: Partial<SessionRecord> = { ready: false, stopRequested: true, finalization: 'unconfirmed', watchdogReason: 'close_unconfirmed' };
    if (latestUsage !== undefined) patch.usageSeconds = latestUsage;
    await update(patch).catch(() => {});
    console.warn('watchdog_close_unconfirmed');
  }
  return new Response(null, { status: 200 });
};

export const config: Config = { method: 'POST' };
