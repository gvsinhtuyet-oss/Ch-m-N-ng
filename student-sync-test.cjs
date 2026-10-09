const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {transformSync}=require('esbuild');
const source=fs.readFileSync('src/contexts/AppContext.tsx','utf8');
const start=source.indexOf("    let syncCode = '';");
const end=source.indexOf('  }, [currentUser?.id, role]);',start);
assert.ok(start>=0&&end>start);
const code=transformSync(source.slice(start,end),{loader:'ts',target:'es2022'}).code;
const makeEffect=new Function('currentUser','localStorage','navigator','window','progressService','studentSyncService',code);
const tick=()=>new Promise(setImmediate);
function setup({existingCode='',online=true,failures=0}={}){
 const student={id:'synthetic-student',name:'Học sinh giả lập',className:'2/24',grade:2};
 let saved=JSON.stringify({...student,syncCode:existingCode});
 const timers=new Map(),events=new Map();let sequence=0,registrations=0,pushes=0;
 const navigator={onLine:online};
 const window={setTimeout(fn){const id=++sequence;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},addEventListener(k,fn){events.set(k,fn);},removeEventListener(k){events.delete(k);}};
 const localStorage={getItem:()=>saved,setItem:(key,value)=>{saved=value;}};
 const records={'hoi-an':{stage1Completed:true}};
 const progressService={getStudentProgressRecords:()=>records,mergeStudentProgressRecords:()=>{}};
 const studentSyncService={register:async()=>{registrations++;if(failures-->0)throw new Error('Temporary failure');return {profile:student,syncCode:'ABCD-EFGH-2345'};},push:async()=>{pushes++;return {progress:records};}};
 const cleanup=makeEffect(student,localStorage,navigator,window,progressService,studentSyncService);
 return {navigator,events,cleanup,stats:()=>({registrations,pushes,saved:JSON.parse(saved)}),run:async()=>{const [id,fn]=timers.entries().next().value||[];assert.ok(fn,'expected a scheduled sync');timers.delete(id);fn();await tick();}};
}
test('saved offline learning syncs on login without another progress event',async()=>{
 const h=setup({existingCode:'ABCD-EFGH-2345'});await h.run();assert.equal(h.stats().pushes,1);assert.equal(h.stats().registrations,0);h.cleanup();
});
test('offline learner registers and uploads after the network returns',async()=>{
 const h=setup({online:false});await h.run();assert.equal(h.stats().registrations,0);
 h.navigator.onLine=true;h.events.get('online')();await h.run();assert.equal(h.stats().pushes,1);assert.equal(h.stats().saved.syncCode,'ABCD-EFGH-2345');h.cleanup();
});
test('temporary registration failure retries without losing local progress',async()=>{
 const h=setup({failures:1});await h.run();assert.equal(h.stats().pushes,0);await h.run();assert.equal(h.stats().registrations,2);assert.equal(h.stats().pushes,1);h.cleanup();
});
