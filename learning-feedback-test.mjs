import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {createLearningFeedback} from './learning-feedback.mjs';
import {createAuth} from './auth-server.mjs';
import {FEEDBACK_STATIONS} from './learning-feedback-catalog.mjs';
const error=(status)=>Object.assign(new Error('storage failure'),{status});
async function fixture(t) {
 const docs=new Map();let failWrites=false;
 const store={get:async(c,id)=>docs.get(c+'/'+id),put:async(c,id,v,create)=>{if(failWrites)throw error(503);if(create&&docs.has(c+'/'+id))throw error(409);docs.set(c+'/'+id,structuredClone(v));},list:async c=>[...docs].filter(([k])=>k.startsWith(c+'/')).map(([,v])=>v)};
 const adminEmail='admin@example.com';
 const auth=createAuth({store,adminEmail,secureCookie:false});
 async function staffCookie(role) {
  const hash=value=>createHash('sha256').update(value).digest('hex');
  const id=hash(role==='admin'?adminEmail:'teacher@example.com');
  const token=hash(role);
  await store.put('cham_users',id,{id,role,active:true,version:1});
  await store.put('cham_sessions',hash(token),{userId:id,version:1,expiresAt:Date.now()+60000});
  return 'cham_session='+token;
 }
 const handle=createLearningFeedback({store,auth,secureCookie:false});
 const server=createServer(async(req,res)=>{const json=(r,s,d)=>{r.writeHead(s,{'Content-Type':'application/json'});r.end(JSON.stringify(d));};try{const body=async r=>{let raw='';for await(const c of r)raw+=c;return JSON.parse(raw);};const {pathname}=new URL(req.url,'http://local');if(!await handle(req,res,pathname,body,json)&&!await auth.handle(req,res,pathname,body,json))json(res,404,{});}catch(e){json(res,e.status||500,{error:e.message});}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const base='http://127.0.0.1:'+server.address().port;
 async function call(path,data,cookie='',origin=base){const r=await fetch(base+'/api/learning/'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(data)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie};}
 async function get(path,cookie=''){
  const response=await fetch(base+path,{headers:{Cookie:cookie}});
  return {status:response.status,data:await response.json()};
 }
 return {docs,call,get,staffCookie,store,fail:()=>{failWrites=true;}};
}
test('all 25 stations, guest cookie persistence, replacement stars and private reads',async t=>{
 const {docs,call}=await fixture(t);assert.equal(FEEDBACK_STATIONS.length,25);
 let cookie='';
 for(const [i,s] of FEEDBACK_STATIONS.entries()){
  const result=await call('rating',{stationId:s.id,action:'read'},cookie);assert.equal(result.data.stars,0);cookie=result.cookie;
  if(i<15)assert.equal((await call('rating',{stationId:s.id,stars:5},cookie)).data.saved,true);
 }
 const stationId=FEEDBACK_STATIONS[0].id;
 assert.equal((await call('rating',{stationId,stars:2},cookie)).data.stars,2);
 assert.equal((await call('rating',{stationId,action:'read'},cookie)).data.stars,2);
 assert.equal((await call('rating',{stationId,action:'read'})).data.stars,0);
 assert.equal([...docs.keys()].filter(k=>k.startsWith('cham_journey_ratings/')).length,15);
 assert.equal((await call('rating',{stationId,stars:6},cookie)).status,400);
 assert.equal((await call('rating',{stationId,stars:3,syncCode:'INVALID'},cookie)).status,401);
});
test('server assigns station metadata, accepts references, deduplicates and rate-limits across instances',async t=>{
 const {docs,call}=await fixture(t);const stationId=FEEDBACK_STATIONS[0].id;
 let a=await call('rating',{stationId,action:'read'});const cookie=a.cookie;
 const payload={stationId,stationName:'spoof',grade:5,category:'Kiến thức',text:'Đề nghị kiểm tra lại nội dung bài học.',source:'Tài liệu địa phương trang 12'};
 const sent=await call('proposals',payload,cookie);assert.equal(sent.data.saved,true);
 assert.equal((await call('proposals',payload,cookie)).data.saved,true);
 const record=[...docs].find(([k])=>k.startsWith('cham_learning_proposals/'))[1];
 assert.equal(record.stationName,FEEDBACK_STATIONS[0].titleVi);assert.equal(record.grade,1);assert.equal(record.teacherName,'Khách ẩn danh');
 assert.equal((await call('proposals',{...payload,text:'Một góp ý khác cần kiểm tra.'},cookie)).status,429);
 assert.equal((await call('proposals',{...payload,source:'javascript:alert(1)'},cookie)).status,400);
 assert.equal((await call('proposals',payload,cookie,'https://attacker.invalid')).status,403);
});
test('learner sync credential restores the same rating across devices, no profile data returned',async t=>{
 const {store,call}=await fixture(t);
 const code='ABCDEFGHJKLM',key=createHash('sha256').update(code).digest('hex');
 await store.put('cham_student_sync',key,{profile:{id:'local-student-1',name:'Private name'}});
 const stationId=FEEDBACK_STATIONS[0].id;
 assert.equal((await call('rating',{stationId,stars:4,syncCode:code})).data.saved,true);
 const read=await call('rating',{stationId,action:'read',syncCode:code});assert.deepEqual(read.data,{stars:4});
});
test('only admin sees station counts and can retrieve the corresponding written feedback',async t=>{
 const {call,get,staffCookie}=await fixture(t);
 const admin=await staffCookie('admin'),teacher=await staffCookie('teacher');
 const path='/api/admin/station-ratings';
 assert.equal((await get(path)).status,401);
 assert.equal((await get(path,teacher)).status,403);
 const [{id:stationId},{id:emptyId}]=FEEDBACK_STATIONS;
 const first=await call('rating',{stationId,stars:2});
 assert.equal(first.status,200);
 assert.equal((await call('rating',{stationId,stars:4},first.cookie)).status,200);
 assert.equal((await call('rating',{stationId,stars:5})).status,200);
 const text='Đề nghị thêm ảnh minh họa.';
 assert.equal((await call('proposals',{stationId,category:'Hình ảnh/âm thanh',text},first.cookie)).status,200);
 const result=await get(path,admin);
 assert.equal(result.status,200);
 assert.equal(Object.keys(result.data.ratings).length,25);
 assert.deepEqual(result.data.ratings[stationId],[0,0,0,1,1]);
 assert.deepEqual(result.data.ratings[emptyId],[0,0,0,0,0]);
 const inbox=await get('/api/teacher/proposals',admin);
 assert.deepEqual(inbox.data.records.map(r=>({stationId:r.stationId,text:r.text})),[{stationId,text}]);
});
test('storage failure never returns success',async t=>{
 const f=await fixture(t);const stationId=FEEDBACK_STATIONS[0].id;
 const first=await f.call('rating',{stationId,action:'read'});f.fail();
 const failed=await f.call('rating',{stationId,stars:5},first.cookie);assert.equal(failed.status,503);assert.equal(failed.data.saved,undefined);
});
test('durable create-only quotas enforce concurrent proposals with different bodies',async t=>{
 const {call,docs}=await fixture(t);const stationId=FEEDBACK_STATIONS[0].id;
 const first=await call('rating',{stationId,action:'read'});
 const responses=await Promise.all(Array.from({length:6},(_,i)=>call('proposals',{stationId,category:'Đề xuất khác',text:'Góp ý đồng thời số '+i,source:''},first.cookie)));
 assert.equal(responses.filter(r=>r.status===200).length,1);
 assert.equal([...docs.keys()].filter(k=>k.startsWith('cham_learning_proposals/')).length,1);
});


test('Admin five-star cache reduces Firestore scans while preserving auth on every request',async()=>{
 const rating={stationId:'g1-station-1',stars:5};
 let reads=0,verified=0;
 const store={list:async collection=>{assert.equal(collection,'cham_journey_ratings');reads++;return [rating];}};
 const auth={requireAdmin:async()=>{verified++;}};
 const handle=createLearningFeedback({store,auth});
 const results=[];
 const json=(_res,status,payload)=>results.push({status,payload});
 const req={method:'GET'};
 assert.equal(await handle(req,{},'/api/admin/station-ratings',null,json),true);
 assert.equal(await handle(req,{},'/api/admin/station-ratings',null,json),true);
 assert.equal(verified,2,'Reauthenticate every Admin API read');
 assert.equal(reads,1,'Do not repeatedly scan Firestore during cache TTL');
 assert.equal(results[0].payload.ratings['g1-station-1'][4],1);
});

test('Teacher cannot read cached Admin star aggregation',async()=>{
 const auth={requireAdmin:async()=>{throw Object.assign(new Error('Forbidden'),{status:403});}};
 const store={list:async()=>{throw Error('Unauthorized request must not read Firestore');}};
 const handle=createLearningFeedback({store,auth});
 await assert.rejects(()=>handle({method:'GET'},{},'/api/admin/station-ratings',null,()=>{}),/Forbidden/);
});
