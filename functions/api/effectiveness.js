import {proxyApi} from './[[path]].js';
import {FEEDBACK_STATIONS} from '../../learning-feedback-catalog.mjs';

const stationIds = new Set(FEEDBACK_STATIONS.map(station => station.id));
const dayMs = 86400000;
const vietnamDay = now => new Date(now + 7 * 3600000).toISOString().slice(0, 10);
const json = (data, status = 200) => Response.json(data, {
  status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'},
});

async function record(request, db, day) {
  if (request.headers.get('Origin') !== new URL(request.url).origin ||
      request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    return json({error: 'Nguồn yêu cầu không hợp lệ.'}, 403);
  }
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') {
    return json({error: 'Yêu cầu phải dùng JSON.'}, 415);
  }
  // Stream at most 4 KiB even if Content-Length is absent or incorrect.
  const reader = request.body?.getReader();
  let size = 0;
  let raw = '';
  const decoder = new TextDecoder();
  if (reader) {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return json({error: 'Dữ liệu quá lớn.'}, 413);
      }
      raw += decoder.decode(value, {stream: true});
    }
  }
  let data;
  try { data = JSON.parse(raw + decoder.decode()); }
  catch { return json({error: 'Dữ liệu không hợp lệ.'}, 400); }
  if (typeof data?.session !== 'string' || !/^[a-f0-9]{32}$/.test(data.session) ||
      ![0, 1, 2].includes(data.audience) || !Array.isArray(data.stations) ||
      data.stations.length > stationIds.size ||
      data.stations.some(entry => !stationIds.has(entry?.id) ||
        !Number.isInteger(entry.stage) || entry.stage < 0 || entry.stage > 4) ||
      new Set(data.stations.map(entry => entry.id)).size !== data.stations.length ||
      (data.audience === 2 && data.stations.length)) {
    return json({error: 'Dữ liệu không hợp lệ.'}, 400);
  }

  const statements = [db.prepare(`
    INSERT INTO report_sessions(id, day, audience) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET audience = excluded.audience
    WHERE excluded.audience > report_sessions.audience
  `).bind(data.session, day, data.audience)];
  for (const {id, stage} of data.stations) {
    statements.push(db.prepare(`
      INSERT INTO report_station_sessions(session_id, station_id, day, stage)
      SELECT id, ?, day, ? FROM report_sessions WHERE id = ? AND audience < 2
      ON CONFLICT(session_id, station_id) DO UPDATE SET stage = excluded.stage
      WHERE excluded.stage > report_station_sessions.stage
    `).bind(id, stage, data.session));
  }
  await db.batch(statements);
  return new Response(null, {status: 204, headers: {'Cache-Control': 'no-store'}});
}

export async function effectiveness(request, env, authorize = proxyApi, now = Date.now()) {
  const db = env.EFFECTIVENESS_DB;
  if (env.EFFECTIVENESS_ENABLED !== 'true' || !db) {
    return json({error: 'Chưa bật thu thập báo cáo.'}, 503);
  }
  try {
    if (request.method === 'POST') return await record(request, db, vietnamDay(now));
    if (request.method !== 'GET') return json({error: 'Phương thức không hỗ trợ.'}, 405);

    if (!/(?:^|;\s*)cham_session=[a-f0-9]{64}(?:;|$)/.test(request.headers.get('Cookie') || '')) {
      return json({error: 'Vui lòng đăng nhập quản trị.'}, 401);
    }
    const session = await authorize(new Request(new URL('/api/auth/session', request.url), {
      headers: {Cookie: request.headers.get('Cookie')},
    }));
    if (!session.ok) return json({error: 'Chưa xác minh được quyền quản trị.'}, 503);
    const {user} = await session.json();
    if (!user) return json({error: 'Vui lòng đăng nhập lại.'}, 401);
    if (user.role !== 'admin') return json({error: 'Chức năng này dành cho quản trị.'}, 403);

    const days = Number(new URL(request.url).searchParams.get('days') ?? 30);
    // A precise October-to-present range must be possible while preventing
    // unbounded historical scans. Valid read windows are 1–90 whole days.
    if (!Number.isInteger(days) || days < 1 || days > 90) return json({error: 'Khoảng thời gian không hợp lệ.'}, 400);
    const start = vietnamDay(now - (days - 1) * dayMs);
    const end = vietnamDay(now);
    const [visits, stations] = await db.batch([
      db.prepare(`
        SELECT day, audience, COUNT(*) AS visits
        FROM report_sessions WHERE day BETWEEN ? AND ? AND audience < 2
        GROUP BY day, audience ORDER BY day
      `).bind(start, end),
      db.prepare(`
        SELECT p.station_id AS stationId, s.audience, COUNT(*) AS started,
          SUM(p.stage >= 1) AS stage1, SUM(p.stage >= 2) AS stage2,
          SUM(p.stage >= 3) AS stage3, SUM(p.stage = 4) AS stage4
        FROM report_station_sessions p JOIN report_sessions s ON s.id = p.session_id
        WHERE p.day BETWEEN ? AND ? AND s.audience < 2
        GROUP BY p.station_id, s.audience
      `).bind(start, end),
    ]);
    return json({start, end, visits: visits.results, stations: stations.results});
  } catch {
    return json({error: 'Chưa tải hoặc lưu được số liệu báo cáo. Vui lòng thử lại sau.'}, 503);
  }
}

export const onRequest = ({request, env}) => effectiveness(request, env);
