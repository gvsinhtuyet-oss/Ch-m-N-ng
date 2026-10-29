import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createLearningFeedback} from './learning-feedback.mjs';
import {createAuth} from './auth-server.mjs';
import {FEEDBACK_STATIONS} from './learning-feedback-catalog.mjs';
const error=(status)=>Object.assign(new Error('storage failure'),{status});
async function fixture(t) {
 const docs=new Map();let failWrites=false;
 const store={get:async(c,id)=>docs.get(c+'/'+id),put:async(c,id,v,create)=>{if(failWrites)throw error(503);if(create&&docs.has(c+'/'+id))throw error(409);docs.set(c+'/'+id,structuredClone(v));},list:async c=>[...docs].filter(([k])=>k.startsWith(c+'/')).map(([,v])=>v)};
 const auth=createAuth({store,secureCookie:false});
 const handle=createLearningFeedback({store,auth,secureCookie:false});
 const server=createServer(async(req,res)=>{const json=(r,s,d)=>{r.writeHead(s,{'Content-Type':'application/json'});r.end(JSON.stringify(d));};try{const body=async r=>{let raw='';for await(const c of r)raw+=c;return JSON.parse(raw);};if(!await handle(req,res,new URL(req.url,'http://local').pathname,body,json))json(res,404,{});}catch(e){json(res,e.status||500,{error:e.message});}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const base='http://127.0.0.1:'+server.address().port;
 async function call(path,data,cookie='',origin=base){const r=await fetch(base+'/api/learning/'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(data)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie};}
 return {docs,call,store,fail:()=>{failWrites=true;}};
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
 const {store,call}=await fixture(t);const {createHash}=await import('node:crypto');
 const code='ABCDEFGHJKLM',key=createHash('sha256').update(code).digest('hex');
 await store.put('cham_student_sync',key,{profile:{id:'local-student-1',name:'Private name'}});
 const stationId=FEEDBACK_STATIONS[0].id;
 assert.equal((await call('rating',{stationId,stars:4,syncCode:code})).data.saved,true);
 const read=await call('rating',{stationId,action:'read',syncCode:code});assert.deepEqual(read.data,{stars:4});
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
