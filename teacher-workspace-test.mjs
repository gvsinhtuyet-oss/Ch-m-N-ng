import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createAuth} from './auth-server.mjs';
const data=new Map();let puts=0;
const store={async get(c,id){return structuredClone(data.get(c+'/'+id)||null)},async put(c,id,v,create){if(create&&data.has(c+'/'+id))throw Object.assign(Error(),{status:409});puts++;data.set(c+'/'+id,structuredClone(v))},async remove(c,id){data.delete(c+'/'+id)},async list(c){return [...data].filter(([k])=>k.startsWith(c+'/')).map(([,v])=>v)}};
const auth=createAuth({store,adminEmail:'admin@example.com',adminPassword:'strong-admin-password',secureCookie:false,verifyGoogle:async(token,nonce)=>{assert.ok(nonce);if(token==='bad')throw Object.assign(Error(),{status:401});return {email:token+'@example.com',sub:token,name:token}}});
const server=createServer(async(req,res)=>{const json=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body))};try{await auth.handle(req,res,new URL(req.url,'http://localhost').pathname,async req=>{const chunks=[];for await(const c of req)chunks.push(c);return JSON.parse(Buffer.concat(chunks))},json)}catch(e){json(res,e.status||500,{error:e.message})}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
async function call(path,method='GET',body,cookie='',origin=base){const r=await fetch(base+path,{method,headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
async function google(token){const c=await call('/api/auth/google/challenge','POST',{});return call('/api/auth/google','POST',{credential:token},c.cookie)}
try{
 assert.equal((await call('/api/teacher/workspace')).status,401);
 assert.equal((await call('/api/auth/google','POST',{credential:'one'})).status,401);
 assert.equal((await google('bad')).status,401);
 const one=await google('one'),two=await google('two');assert.equal(one.body.user.role,'teacher');assert.equal(one.body.user.authProvider,'google');
 assert.equal((await google('admin')).status,409);
 assert.equal((await call('/api/admin/users','GET',undefined,one.cookie)).status,403);
 const plan={school:'Trường A',book:'Sách hiện hành',year:'2026-2027',grade:2,records:[{id:'private-1',grade:2,subject:'TNXH',week:'2',lesson:'Bài mới',integrationType:'Liên hệ',activity:'Khám phá',content:'Chiếu Cẩm Nê',resourceLinks:[]}]};
 assert.equal((await call('/api/teacher/workspace','PUT',plan,one.cookie,'https://evil.test')).status,403);
 assert.equal((await call('/api/teacher/workspace','PUT',{...plan,year:'2026-2028'},one.cookie)).status,400);
 assert.equal((await call('/api/teacher/workspace','PUT',{...plan,records:[{...plan.records[0],grade:3}]},one.cookie)).status,400);
 assert.equal((await call('/api/teacher/workspace','PUT',plan,one.cookie)).status,200);const before=puts;
 assert.equal((await call('/api/teacher/workspace','PUT',plan,one.cookie)).status,200);assert.equal(puts,before,'unchanged save does not write');
 assert.equal((await call('/api/teacher/workspace','GET',undefined,two.cookie)).body.workspace,null);
 assert.equal((await call('/api/teacher/workspace?teacherId='+one.body.user.id,'GET',undefined,two.cookie)).body.workspace,null);
 const proposal=await call('/api/teacher/proposals','POST',{stationId:'teacher-plan',stationName:'Kế hoạch',grade:2,text:'Đề xuất'},one.cookie);assert.equal(proposal.body.record.workspace.records.length,1);
 assert.equal((await call('/api/teacher/proposals','PUT',{id:proposal.body.record.id,status:'accepted'},one.cookie)).status,403);
 const roster={name:'2/24',grade:2,academicYear:'2026-2027',students:[]};assert.equal((await call('/api/teacher/classes','POST',roster,one.cookie)).status,200);assert.equal((await call('/api/teacher/classes','POST',roster,two.cookie)).status,200);
 const admin=await call('/api/auth/login','POST',{email:'admin@example.com',password:'strong-admin-password'});assert.equal((await call('/api/teacher/proposals','PUT',{id:proposal.body.record.id,status:'accepted'},admin.cookie)).status,200);
 const hash=(await import('node:crypto')).createHash('sha256').update('one@example.com').digest('hex');const user=await store.get('cham_users',hash);await store.put('cham_users',hash,{...user,active:false});assert.equal((await google('one')).status,403);
 console.log('PASS Google teacher provisioning, existing account protection, disabled users, role enforcement, private plans, no-op writes, school class isolation and proposal review.');
}finally{await new Promise(r=>server.close(r))}
