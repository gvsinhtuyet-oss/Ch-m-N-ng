type Audience = 0 | 1 | 2;
type Visit = {id: string; lastActivity: number; staff?: boolean};
type Batch = {session: string; audience: Audience; stations: Map<string, number>};

const visitKey = 'cham_effectiveness_visit_v1';
const idleMs = 30 * 60 * 1000;
let visit: Visit | undefined;
let audience: Audience = 0;
let acknowledged: Batch | undefined;
let pending: Batch | undefined;
let sending = false;
let pauseUntil = 0;
let timer: number | undefined;

function currentVisit(now: number): Visit {
  try {
    const saved = JSON.parse(localStorage.getItem(visitKey) || 'null') as Visit | null;
    if (saved && /^[a-f0-9]{32}$/.test(saved.id) && Number.isFinite(saved.lastActivity) &&
        (!visit || saved.lastActivity > visit.lastActivity)) visit = saved;
  } catch { /* Continue in memory. */ }
  if (!visit || now - visit.lastActivity >= idleMs || (visit.staff && audience === 1)) {
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    visit = {id, lastActivity: now};
  }
  visit.lastActivity = now;
  if (audience === 2) visit.staff = true;
  try { localStorage.setItem(visitKey, JSON.stringify(visit)); } catch { /* Continue in memory. */ }
  return visit;
}

async function flush() {
  if (timer !== undefined) window.clearTimeout(timer);
  timer = undefined;
  if (!pending || sending || !navigator.onLine || Date.now() < pauseUntil) return;
  const batch = pending;
  pending = undefined;
  sending = true;
  try {
    const response = await fetch('/api/effectiveness', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, keepalive: true,
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        session: batch.session, audience: batch.audience,
        stations: [...batch.stations].map(([id, stage]) => ({id, stage})),
      }),
    });
    if (response.status !== 204) throw Error('Analytics unavailable');
    if (acknowledged?.session !== batch.session) acknowledged = batch;
    else {
      acknowledged.audience = Math.max(acknowledged.audience, batch.audience) as Audience;
      for (const [id, stage] of batch.stations) {
        acknowledged.stations.set(id, Math.max(stage, acknowledged.stations.get(id) ?? -1));
      }
    }
  } catch {
    pauseUntil = Date.now() + 10 * 60 * 1000;
    // No retries in the background. A subsequent interaction can retry after the pause.
    restorePending(batch);
  } finally {
    sending = false;
    if (pending && Date.now() >= pauseUntil) schedule();
  }
}

function restorePending(batch: Batch) {
  if (!pending) pending = batch;
  else if (pending.session === batch.session && pending.audience !== 2) {
    pending.audience = Math.max(pending.audience, batch.audience) as Audience;
    if (pending.audience === 2) pending.stations.clear();
    else for (const [id, stage] of batch.stations) {
      pending.stations.set(id, Math.max(stage, pending.stations.get(id) ?? -1));
    }
  }
}

function schedule() {
  if (timer === undefined) timer = window.setTimeout(() => void flush(), 1500);
}

function note(stationId?: string, stage = 0) {
  if (import.meta.env.VITE_EFFECTIVENESS_ENABLED !== 'true') return;
  try {
    const {id: session} = currentVisit(Date.now());
    if (audience === 2) stationId = undefined;
    const sent = acknowledged?.session === session ? acknowledged : undefined;
    if (!pending && sent && audience <= sent.audience &&
        (!stationId || stage <= (sent.stations.get(stationId) ?? -1))) return;
    if (pending?.session !== session) pending = {session, audience, stations: new Map()};
    pending.audience = Math.max(pending.audience, audience) as Audience;
    if (pending.audience === 2) pending.stations.clear();
    else if (stationId && stage > Math.max(pending.stations.get(stationId) ?? -1, sent?.stations.get(stationId) ?? -1)) {
      pending.stations.set(stationId, stage);
    }
    if (Date.now() >= pauseUntil) schedule();
  } catch { /* Analytics must never interrupt the lesson. */ }
}

export const effectivenessService = {
  visit(kind: Audience) { audience = kind; note(); },
  stage(stationId: string, stage: number) { note(stationId, stage); },
  refreshVisit() { note(); },
  flush() { void flush(); },
};
