import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import test from 'node:test';
import {effectiveness} from './functions/api/effectiveness.js';

const schema = await readFile(new URL('./cloudflare/effectiveness/0001.sql', import.meta.url), 'utf8');
const origin = 'https://example.test';
const token = 'cham_session=' + 'a'.repeat(64);
const station = 'g1-station-1';
const started = Date.parse('2026-11-06T16:50:00Z');

function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(schema);
  const db = {
    prepare(query) {return {bind(...args) {return {query, args,first:()=>sql.prepare(query).get(...args)};}};},
    async batch(commands) {
      sql.exec('BEGIN');
      try {
        const results = commands.map(({query, args}) => ({
          results: sql.prepare(query).all(...args),
        }));
        sql.exec('COMMIT');
        return results;
      } catch (error) { sql.exec('ROLLBACK'); throw error; }
    },
  };
  const env = {EFFECTIVENESS_ENABLED: 'true', EFFECTIVENESS_DB: db};
  const write = (data, now = started, from = origin) => effectiveness(new Request(origin + '/api/effectiveness', {
    method: 'POST', headers: {Origin: from, 'Content-Type': 'application/json'}, body: JSON.stringify(data),
  }), env, undefined, now);
  const read = (role = 'admin', cookie = token, now = started, search = '') => effectiveness(new Request(
    origin + '/api/effectiveness' + search, {headers: {Cookie: cookie}},
  ), env, request => {
    assert.equal(new URL(request.url).pathname, '/api/auth/session');
    assert.equal(request.headers.get('Cookie'), token);
    return Response.json({user: role ? {role} : null});
  }, now);
  return {sql, env, write, read};
}

test('staff-only read, opt-in, bounded date ranges and input', async () => {
  const {env, read, write} = fixture();
  assert.equal((await effectiveness(new Request(origin), {...env,EFFECTIVENESS_ENABLED:'false'})).status, 503);
  assert.equal((await read('admin', '')).status, 401);
  assert.equal((await read(null)).status, 401);
  assert.equal((await read('teacher')).status, 403);
  assert.equal((await read('admin',token,started,'?days=999')).status, 400);
  assert.equal((await read('admin',token,started,'?days=0')).status, 400);
  assert.equal((await read('admin',token,started,'?days=10.5')).status, 400);
  assert.equal((await read('admin',token,started,'?days=-1')).status, 400);
  assert.equal((await read('admin',token,started,'?days=91')).status, 400);
  assert.deepEqual(await (await read('admin',token,started,'?days=37')).json(), {
    start:'2026-10-01',end:'2026-11-06',visits:[],stations:[],people:[],namedRatings:[],
  },'Precise October-to-present range must be accepted without inventing visits');
  assert.equal((await write({}, started, 'https://other.test')).status, 403);
  assert.equal((await write({session:'a'.repeat(5000)})).status, 413);
  assert.equal((await write({session:'a'.repeat(32), audience:0, stations:[{id:'unknown',stage:1}]})).status, 400);
  assert.deepEqual(await (await read()).json(), {start:'2026-10-08',end:'2026-11-06',visits:[],stations:[],people:[],namedRatings:[]});
});

test('same visit counts once, higher stages win, and staff/demo visits are excluded', async () => {
  const {write, read} = fixture();
  const record = (key, audience, stage, now) => write({
    session: key.repeat(32), audience, stations: stage === undefined ? [] : [{id:station,stage}],
  }, now);
  assert.equal((await record('a',0,0)).status,204);
  assert.equal((await record('a',1,3,started + 20 * 60000)).status,204);
  assert.equal((await record('a',0,1,started + 21 * 60000)).status,204);
  assert.equal((await record('a',1,4,started + 22 * 60000)).status,204);
  assert.equal((await record('a',1,4,started + 22 * 60000)).status,204);
  assert.equal((await record('b',0,0)).status,204);
  assert.equal((await record('c',0,2)).status,204);
  assert.equal((await record('c',2)).status,204);
  assert.equal((await record('d',0)).status,204);
  const data = await (await read('admin',token,started + 25 * 60000)).json();
  assert.deepEqual(data.visits, [
    {day:'2026-11-06',audience:0,visits:2},{day:'2026-11-06',audience:1,visits:1},
  ]);
  assert.deepEqual(data.stations, [
    {stationId:station,audience:0,started:1,stage1:0,stage2:0,stage3:0,stage4:0},
    {stationId:station,audience:1,started:1,stage1:1,stage2:1,stage3:1,stage4:1},
  ]);
});

test('database failure returns unavailable rather than zero or successful writes', async () => {
  const {env} = fixture();
  env.EFFECTIVENESS_DB.batch = async () => {throw Error('quota');};
  const response = await effectiveness(new Request(origin,{headers:{Cookie:token}}),env,() => Response.json({user:{role:'admin'}}));
  assert.equal(response.status,503);
  assert.equal((await response.json()).visits,undefined);
});


test('named visitors and replacement ratings stay in D1, are bounded and admin-only',async()=>{
 const {write,read}=fixture();const visitor={id:'d'.repeat(32),name:'Khách thử',role:'student'};
 const data={session:'e'.repeat(32),audience:0,stations:[],visitor};
 assert.equal((await write(data)).status,204);assert.equal((await write(data)).status,204);
 assert.equal((await write({...data,visitor:{...visitor,name:' '}})).status,400);
 assert.equal((await write({...data,rating:{stationId:station,stars:5}})).status,200);
 assert.equal((await write({...data,rating:{stationId:station,stars:4}})).status,200);
 assert.equal((await (await write({...data,rating:{stationId:station,action:'read'}})).json()).stars,4);
 const report=await (await read()).json();assert.equal(report.people.length,1);assert.equal(report.people[0].name,visitor.name);assert.equal(report.namedRatings.length,1);assert.equal(report.namedRatings[0].stars,4);
 assert.equal((await read('teacher')).status,403);
});
