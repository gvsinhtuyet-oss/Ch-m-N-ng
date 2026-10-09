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
function setup({existingCode='',online=true,failures=0,quotaFailure=false,mergeChanges=false,deferPush=false}={}){
 const student={id:'synthetic-student',name:'Học sinh giả lập',className:'2/24',grade:2};
 let saved=JSON.stringify({...student,syncCode:existingCode});
 const delays=[];const timers=new Map(),events=new Map();let sequence=0,registrations=0,pushes=0;
 const navigator={onLine:online};
 const window={setTimeout(fn,delay){delays.push(delay);const id=++sequence;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},addEventListener(k,fn){events.set(k,fn);},removeEventListener(k){events.delete(k);}};
 const localStorage={getItem:()=>saved,setItem:(key,value)=>{saved=value;}};
 const records={'hoi-an':{stage1Completed:true}};
 const progressService={getStudentProgressRecords:()=>records,mergeStudentProgressRecords:()=>{if(mergeChanges)records['hoi-an'].syncStatus='synced';}};
 let releasePush;
 const studentSyncService={register:async()=>{registrations++;if(failures-->0)throw new Error('Temporary failure');return {profile:student,syncCode:'ABCD-EFGH-2345'};},push:async()=>{pushes++;if(deferPush)await new Promise(resolve=>{releasePush=resolve;});if(quotaFailure)throw Object.assign(new Error('quota'),{storageCode:'RESOURCE_EXHAUSTED'});return {progress:records};}};
 const cleanup=makeEffect(student,localStorage,navigator,window,progressService,studentSyncService);
 return {navigator,events,cleanup,delays,records,release:()=>releasePush(),stats:()=>({registrations,pushes,saved:JSON.parse(saved)}),run:async()=>{const [id,fn]=timers.entries().next().value||[];assert.ok(fn,'expected a scheduled sync');timers.delete(id);fn();await tick();}};
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

test('quota pause survives new progress events without discarding local work',async()=>{
 const h=setup({existingCode:'ABCD-EFGH-2345',quotaFailure:true});await h.run();
 assert.equal(h.stats().pushes,1);assert.ok(h.delays.at(-1)>290000);
 h.events.get('cham-progress-changed')();assert.ok(h.delays.at(-1)>290000);
 await h.run();assert.equal(h.stats().pushes,1);h.cleanup();
});
test('server acknowledgement does not trigger an extra upload for syncStatus alone',async()=>{
 const h=setup({existingCode:'ABCD-EFGH-2345',mergeChanges:true});await h.run();
 h.events.get('cham-progress-changed')();await h.run();assert.equal(h.stats().pushes,1);h.cleanup();
});

test('an edit made during upload remains pending after the response is merged',async()=>{
 const h=setup({existingCode:'ABCD-EFGH-2345',deferPush:true});await h.run();
 h.records['hoi-an'].stage2Completed=true;h.events.get('cham-progress-changed')();
 h.release();await tick();await h.run();assert.equal(h.stats().pushes,2);
 h.release();await tick();h.cleanup();
});
