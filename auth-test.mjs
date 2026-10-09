import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {createAuth} from './auth-server.mjs';
const records=new Map();
const store={ async get(c,id){return structuredClone(records.get(c+'/'+id)||null);},async put(c,id,data,create=false){if(create&&records.has(c+'/'+id))throw Object.assign(new Error('exists'),{status:409});records.set(c+'/'+id,structuredClone(data));},async remove(c,id){records.delete(c+'/'+id);},async list(c){return [...records].filter(([key])=>key.startsWith(c+'/')).map(([,value])=>structuredClone(value));}};
let auth=createAuth({store,adminEmail:'owner@example.com',adminPassword:'Strong-test-owner-42',secureCookie:false});
const server=createServer(async(req,res)=>{try{
 const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
 const body=async req=>{const chunks=[];for await(const chunk of req)chunks.push(chunk);return JSON.parse(Buffer.concat(chunks));};
 const p=new URL(req.url,'http://localhost').pathname;
 if(p==='/api/protected'){auth.sameOrigin(req);await auth.requireAdmin(req);json(res,200,{ok:true});return;}
 await auth.handle(req,res,p,body,json);
}catch(error){res.writeHead(error.status||500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}));}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
async function call(path,method='GET',data,cookie='',origin=base,extraHeaders={}){const response=await fetch(base+path,{method,headers:{...(data?{'Content-Type':'application/json',Origin:origin}:{}),...(cookie?{Cookie:cookie}:{}),...extraHeaders},...(data?{body:JSON.stringify(data)}:{})});return {status:response.status,body:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};}
try {
 assert.equal((await call('/api/auth/session')).body.user,null);
 assert.equal((await call('/api/protected','POST',{})).status,401);
 assert.equal((await call('/api/auth/login','POST',{email:'owner@example.com',password:'incorrect'})).status,401);
 const admin=await call('/api/auth/login','POST',{email:'OWNER@example.com',password:'Strong-test-owner-42'});
 assert.equal(admin.status,200);assert.equal(admin.body.user.role,'admin');assert.ok(admin.cookie);assert.ok(!('passwordHash' in admin.body.user));
 const proxied=await call('/api/auth/login','POST',{email:'owner@example.com',password:'Strong-test-owner-42'},'','https://chamdanang-gddp.ai.studio',{
   'x-forwarded-host':'chamdanang-gddp.ai.studio',
   'x-forwarded-proto':'https'
 });
 assert.equal(proxied.status,200);assert.equal(proxied.body.user.role,'admin');
 assert.equal((await call('/api/admin/users','POST',{email:'teacher@example.com',name:'Cô giáo',password:'Teacher-test-password-42'},admin.cookie)).status,200);
 assert.equal((await call('/api/admin/users','POST',{email:'teacher@example.com',name:'Duplicate',password:'Teacher-test-password-42'},admin.cookie)).status,409);
 const teacher=await call('/api/auth/login','POST',{email:'teacher@example.com',password:'Teacher-test-password-42'});assert.equal(teacher.status,200);

 const roster={name:'2/24',grade:2,academicYear:'2026-2027',students:['Nguyễn An','Trần Bình']};
 assert.equal((await call('/api/teacher/classes','POST',roster)).status,401);
 assert.equal((await call('/api/teacher/classes','POST',roster,teacher.cookie,'https://attacker.example')).status,403);
 assert.equal((await call('/api/teacher/classes','POST',roster,teacher.cookie)).status,200);
 assert.equal((await call('/api/teacher/classes','POST',roster,teacher.cookie)).status,409);
 assert.deepEqual((await call('/api/teacher/classes','GET',undefined,teacher.cookie)).body.classes[0].students,roster.students);
 assert.equal((await call('/api/admin/users','POST',{email:'second@example.com',name:'GV hai',password:'Second-teacher-password-42'},admin.cookie)).status,200);
 const second=await call('/api/auth/login','POST',{email:'second@example.com',password:'Second-teacher-password-42'});
 assert.equal((await call('/api/teacher/classes','GET',undefined,second.cookie)).body.classes.length,0);
 assert.equal((await call('/api/teacher/classes','PUT',roster,second.cookie)).status,403);
 assert.equal((await call('/api/teacher/classes','POST',roster,second.cookie)).status,403);
 assert.equal((await call('/api/teacher/classes','PUT',{...roster,students:['Nguyễn An','Trần Bình','Lê Chi']},teacher.cookie)).status,200);
 assert.equal((await call('/api/teacher/classes','PUT',{...roster,academicYear:'2026-2028'},teacher.cookie)).status,400);
 assert.equal((await call('/api/teacher/classes','PUT',{...roster,grade:3},teacher.cookie)).status,400);
 assert.equal((await call('/api/teacher/classes','PUT',{...roster,students:Array(101).fill('An')},teacher.cookie)).status,400);
 assert.equal((await call('/api/teacher/classes','GET',undefined,admin.cookie)).body.classes[0].totalStudents,3);
 // A single synthetic learner mimics a real Firestore sync document; never use personal pupil data.
 const classId=createHash('sha256').update('2026-2027:2/24').digest('hex');
 const studentCode='ABCDEF234567';
 const syncKey=createHash('sha256').update(studentCode).digest('hex');
 const syntheticProfile={id:'student-test-1',name:'Nguyễn An',className:'2/24',grade:2};
 await store.put('cham_student_sync',syncKey,{profile:syntheticProfile,progress:{
  'hoi-an':{stationCompleted:true,stampReceived:true,stage1Completed:true,stage2Completed:true,stage3Completed:true,stage4Completed:true,lastVisitedAt:'2026-10-09T08:00:00.000Z'}
 }});
 assert.equal((await call('/api/teacher/progress?classId='+classId,'GET')).status,401);
 assert.equal((await call('/api/teacher/progress?classId='+classId,'GET',undefined,second.cookie)).status,403);
 assert.equal((await call('/api/teacher/progress','POST',{classId,syncCode:studentCode},second.cookie)).status,403);
 assert.equal((await call('/api/teacher/progress','POST',{classId,syncCode:studentCode},teacher.cookie,'https://attacker.example')).status,403);
 const initial=await call('/api/teacher/progress?classId='+classId,'GET',undefined,teacher.cookie);
 assert.equal(initial.status,200);assert.equal(initial.body.rosterCount,3);assert.equal(initial.body.linkedCount,0);
 assert.equal((await call('/api/teacher/progress','POST',{classId,syncCode:'XXXXXXXXXXXX'},teacher.cookie)).status,404);
 assert.equal((await call('/api/teacher/progress','POST',{classId,syncCode:studentCode},teacher.cookie)).status,200);
 const real=await call('/api/teacher/progress?classId='+classId,'GET',undefined,teacher.cookie);
 assert.equal(real.status,200);assert.equal(real.body.linkedCount,1);
 assert.equal(real.body.students[0].name,'Nguyễn An');
 assert.equal(real.body.students[0].completedStations,1);
 assert.equal(real.body.students[0].totalStamps,1);
 assert.equal(real.body.students[0].stations[0].completedStages,4);
 assert.equal((await call('/api/teacher/progress?classId='+classId,'GET',undefined,second.cookie)).status,403);
 await store.put('cham_student_sync',syncKey,{profile:syntheticProfile,progress:{
  'hoi-an':{stationCompleted:true,stampReceived:true,stage1Completed:true,stage2Completed:true,stage3Completed:true,stage4Completed:true,lastVisitedAt:'2026-10-09T08:00:00.000Z'},
  'da-nang':{stationCompleted:true,stampReceived:true,stage1Completed:true,stage2Completed:true,stage3Completed:true,stage4Completed:true,lastVisitedAt:'2026-10-09T08:30:00.000Z'}
 }});
 const refreshed=await call('/api/teacher/progress?classId='+classId,'GET',undefined,teacher.cookie);
 assert.equal(refreshed.body.students[0].completedStations,2);
 assert.equal(refreshed.body.students[0].totalStamps,2);
 const restart=createAuth({store,adminEmail:'owner@example.com',adminPassword:'Strong-test-owner-42',secureCookie:false});
 const beforeRestart=auth;auth=restart;
 assert.equal((await call('/api/teacher/classes','GET',undefined,teacher.cookie)).body.classes[0].totalStudents,3);
 auth=beforeRestart;
 assert.equal((await call('/api/protected','POST',{},teacher.cookie)).status,403);
 assert.equal((await call('/api/admin/users','GET',undefined,teacher.cookie)).status,403);
 assert.equal((await call('/api/admin/users','PUT',{email:'teacher@example.com',active:false},admin.cookie)).status,200);
 assert.equal((await call('/api/auth/session','GET',undefined,teacher.cookie)).body.user,null);
 assert.equal((await call('/api/auth/login','POST',{email:'teacher@example.com',password:'Teacher-test-password-42'})).status,401);
 assert.equal((await call('/api/admin/users','PUT',{email:'teacher@example.com',active:true,password:'Reset-teacher-password-42'},admin.cookie)).status,200);
 assert.equal((await call('/api/auth/login','POST',{email:'teacher@example.com',password:'Teacher-test-password-42'})).status,401);
 const reset=await call('/api/auth/login','POST',{email:'teacher@example.com',password:'Reset-teacher-password-42'});assert.equal(reset.status,200);
 assert.equal((await call('/api/auth/password','POST',{currentPassword:'Reset-teacher-password-42',password:'New-teacher-password-42'},reset.cookie)).status,200);
 assert.equal((await call('/api/auth/session','GET',undefined,reset.cookie)).body.user,null);
 const changed=await call('/api/auth/login','POST',{email:'teacher@example.com',password:'New-teacher-password-42'});assert.equal(changed.status,200);
 assert.equal((await call('/api/auth/logout','POST',{},changed.cookie)).status,200);
 assert.equal((await call('/api/auth/session','GET',undefined,changed.cookie)).body.user,null);
 assert.equal((await call('/api/protected','POST',{},admin.cookie,'https://attacker.example')).status,403);
 for(let i=0;i<5;i++)await call('/api/auth/login','POST',{email:'missing@example.com',password:'wrong'});
 assert.equal((await call('/api/auth/login','POST',{email:'missing@example.com',password:'wrong'})).status,429);
 const restored=createAuth({store,adminEmail:'owner@example.com',adminPassword:undefined,secureCookie:false});
 await assert.rejects(restored.requireAdmin({headers:{cookie:admin.cookie}}),{status:401});
 auth=createAuth({store,adminEmail:'owner@example.com',adminPassword:'Rotated-owner-secret-42',secureCookie:false});
 assert.equal((await call('/api/auth/login','POST',{email:'teacher@example.com',password:'Rotated-owner-secret-42'})).status,401);
 const recovered=await call('/api/auth/login','POST',{email:'owner@example.com',password:'Rotated-owner-secret-42'});
 assert.equal(recovered.status,200);assert.equal(recovered.body.user.role,'admin');
 assert.equal((await call('/api/auth/session','GET',undefined,admin.cookie)).body.user,null);
 assert.equal((await call('/api/auth/login','POST',{email:'owner@example.com',password:'Strong-test-owner-42'})).status,401);
 console.log('PASS: login, roles, duplicate, lock, reset, password change, logout, origin, throttle, persistent sessions; one student progress linked, refreshed and access-isolated.');
}finally{await new Promise(resolve=>server.close(resolve));}
