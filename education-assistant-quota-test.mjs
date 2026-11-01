
import test from 'node:test';
import assert from 'node:assert/strict';
import {reserveAssistantQuota} from './education-assistant-quota.mjs';
function fakeStore(){
 const slots=new Set();
 return {slots,async put(collection,id,_data,createOnly){
  assert.equal(createOnly,true,'quota reservations must be create-only and atomic');
  const key=collection+':'+id;
  if(slots.has(key))throw Object.assign(new Error('collision'),{status:409});
  slots.add(key);
 }};
}
test('a teacher is capped at 5 durable reservations in a UTC day, then resets next day',async()=>{
 const store=fakeStore(),now=()=>Date.UTC(2026,10,1,12);
 for(let n=0;n<5;n++)await reserveAssistantQuota({store,teacherId:'teacher-1',now});
 await assert.rejects(reserveAssistantQuota({store,teacherId:'teacher-1',now}),{status:429});
 const r=await reserveAssistantQuota({store,teacherId:'teacher-1',now:()=>Date.UTC(2026,10,2,12)});
 assert.equal(r.day,'2026-11-02');
});
test('concurrent instances share a hard limit, including minute and total daily slots',async()=>{
 const store=fakeStore();let now=()=>Date.UTC(2026,10,1,12);
 const claims=await Promise.allSettled(Array.from({length:24},(_,i)=>
  reserveAssistantQuota({store,teacherId:'teacher-'+i,now})));
 assert.equal(claims.filter(c=>c.status==='fulfilled').length,5);
 assert.ok(claims.filter(c=>c.status==='rejected').every(c=>c.reason.status===429));
 now=()=>Date.UTC(2026,10,1,12,1);
 const later=await Promise.allSettled(Array.from({length:24},(_,i)=>
  reserveAssistantQuota({store,teacherId:'later-'+i,now})));
 assert.equal(later.filter(c=>c.status==='fulfilled').length,5);
 now=()=>Date.UTC(2026,10,1,12,2);
 await assert.rejects(reserveAssistantQuota({store,teacherId:'other',now}),{status:429});
 assert.equal([...store.slots].filter(k=>k.startsWith('cham_ai_shared_day:')).length,10);
});
test('storage outage fails closed and no local in-memory fallback is used',async()=>{
 const bad={async put(){throw Object.assign(new Error('storage unavailable'),{status:503});}};
 await assert.rejects(reserveAssistantQuota({store:bad,teacherId:'teacher',now:()=>Date.UTC(2026,10,1)}),
  e=>e.status===503&&!e.message.includes('storage unavailable'));
 await assert.rejects(reserveAssistantQuota({store:null,teacherId:'teacher'}),{status:503});
});
