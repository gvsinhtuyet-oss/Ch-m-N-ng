import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createEducationAssistant} from './education-assistant.mjs';
const request=(method='POST',data={question:'Người Kinh có phải dân tộc thiểu số?'})=>Object.assign(Readable.from([JSON.stringify(data)]),{method,url:'/api/education-assistant'});
const response=()=>({writeHead(status,headers){this.status=status;this.headers=headers;},end(body){this.data=JSON.parse(body);}});
const auth={sameOrigin(){},requireTeacher:async()=>({id:'teacher-test'})};
const env={EDUCATION_ASSISTANT_AI_ENABLED:'true',GEMINI_API_KEY:'test-only'};
test('AI expansion defaults off and does not invoke provider or auth store',async()=>{
 const h=createEducationAssistant({auth:{sameOrigin(){},requireTeacher(){assert.fail();}},env:{},generate(){assert.fail();}});
 const r=response();await h(request('GET'),r);assert.equal(r.data.available,false);
 await assert.rejects(h(request(),response()),{status:503});
});
test('requires same origin and real teacher authorization, not body role',async()=>{
 for(const status of [401,403]){
  const h=createEducationAssistant({env,auth:{...auth,requireTeacher:async()=>{throw Object.assign(new Error('Denied'),{status});}},generate(){assert.fail();}});
  await assert.rejects(h(request('POST',{question:'Hỏi kiến thức',role:'teacher'}),response()),{status});
 }
 const h=createEducationAssistant({env,auth:{...auth,sameOrigin(){throw Object.assign(new Error('Origin'),{status:403});}},generate(){assert.fail();}});
 await assert.rejects(h(request(),response()),{status:403});
});
test('supports broad educational questions, labels AI and never invents source attribution',async()=>{
 let received;
 const h=createEducationAssistant({env,auth,generate:async(input)=>{received=input;return {text:'Không. Người Kinh thuộc dân tộc đa số ở Việt Nam.'};}});
 const r=response();await h(request(),r);
 assert.equal(r.status,200);assert.equal(r.data.reviewRequired,true);assert.deepEqual(r.data.sources,[]);
 assert.match(received.config.systemInstruction,/Không bị giới hạn trong 25 trạm/);
 assert.equal(received.contents,'Người Kinh có phải dân tộc thiểu số?');
 assert.doesNotMatch(JSON.stringify(r),/test-only|GEMINI_API_KEY/);
});
test('bounds provider usage, input size and failure output',async()=>{
 let calls=0;
 const h=createEducationAssistant({env,auth,generate:async()=>{calls++;return {text:'Kiến thức tham khảo.'};}});
 await assert.rejects(h(request('POST',{question:'x'.repeat(601)}),response()),{status:400});
 for(let i=0;i<10;i++)await h(request(),response());
 await assert.rejects(h(request(),response()),{status:429});assert.equal(calls,10);
 const broken=createEducationAssistant({env,auth,generate:async()=>{throw Error('secret-provider-detail');}});
 await assert.rejects(broken(request(),response()),e=>e.status===503&&!e.message.includes('secret-provider-detail'));
});
