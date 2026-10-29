import test from 'node:test';
import assert from 'node:assert/strict';
import {learningFeedbackService as service} from './src/services/LearningFeedbackService';
test('client requires a server acknowledgement and never falls back to guest for a learner',async()=>{
 const nativeFetch=globalThis.fetch,nativeStorage=globalThis.localStorage;
 let calls=0,reply:unknown={saved:true,stars:4},status=200;
 globalThis.localStorage={getItem:()=>JSON.stringify({id:'learner-1',syncCode:'ABCD-EFGH-JKLM'})} as Storage;
 globalThis.fetch=async(_url,init)=>{calls++;const data=JSON.parse(String(init?.body));assert.equal(init?.credentials,'same-origin');if(data.syncCode)assert.equal(data.syncCode,'ABCD-EFGH-JKLM');return Response.json(reply,{status});};
 try {
  assert.equal(await service.saveRating('g1-station-1',4,'learner-1',true),4);
  const count=calls;await assert.rejects(service.saveRating('g1-station-1',4,'another-learner',true),/chưa đồng bộ/);assert.equal(calls,count);
  reply={};await assert.rejects(service.saveRating('g1-station-1',4),/chưa xác nhận/);
  reply={error:'Hết hạn mức'};status=503;await assert.rejects(service.saveRating('g1-station-1',4),/Hết hạn mức/);
  await assert.rejects(service.propose({stationId:'g1-station-1',category:'Kiến thức',text:'Góp ý thử nghiệm',source:''}),/Hết hạn mức/);
 }finally{globalThis.fetch=nativeFetch;globalThis.localStorage=nativeStorage;}
});
