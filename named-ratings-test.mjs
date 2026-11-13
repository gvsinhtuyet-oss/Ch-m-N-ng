import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {ensureNamedReports} from './functions/api/effectiveness.js';
import {namedStationRatings} from './functions/api/admin/station-ratings.js';
test('combined stars stay admin-only and mark legacy source failures',async()=>{
 const sql=new DatabaseSync(':memory:');const prepare=query=>{const obj={bind:(...args)=>({query,args}),all:async()=>({results:sql.prepare(query).all()})};return obj};
 const db={prepare,batch:async rows=>rows.map(r=>({results:sql.prepare(r.query).all(...r.args)}))};await ensureNamedReports(db);
 sql.prepare('INSERT INTO report_named_ratings VALUES(?,?,?,?,?,?)').run('a','g2-station-1','Mẫu','student',5,'2026-11-13');
 const req=new Request('https://example.test/api/admin/station-ratings');const env={EFFECTIVENESS_DB:db,EFFECTIVENESS_ENABLED:'true'};
 const proxy=(role,legacyOk)=>async request=>new URL(request.url).pathname.endsWith('/session')?Response.json({user:role?{role}:null}):legacyOk?Response.json({ratings:{'g2-station-1':[0,0,0,1,0]}}):Response.json({error:'quota'},{status:503});
 assert.equal((await namedStationRatings(req,env,proxy(null,true))).status,401);assert.equal((await namedStationRatings(req,env,proxy('teacher',true))).status,403);
 const combined=await (await namedStationRatings(req,env,proxy('admin',true))).json();assert.deepEqual(combined.ratings['g2-station-1'],[0,0,0,1,1]);assert.equal(combined.warning,'');
 const partial=await (await namedStationRatings(req,env,proxy('admin',false))).json();assert(partial.warning);assert.deepEqual(partial.ratings['g2-station-1'],[0,0,0,0,1]);
});
