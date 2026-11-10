import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {constrainAssistantPosition,compactAssistantPosition} from './src/utils/assistantPosition';
import {DanangAssistantChat,buildAssistantFollowUps,maskStudentPrivateQuestion} from './src/components/common/DanangAssistantChat';

test('dragged assistant stays fully visible on phone and desktop, including after rotation',()=>{
 for(const [width,height] of [[390,844],[844,390],[1920,1080]]){
  for(const point of [{x:-100,y:-100},{x:9999,y:9999},{x:24,y:500}]){
   const p=constrainAssistantPosition(point,width,height);
   assert.ok(p.x>=8&&p.y>=8);
   assert.ok(p.x+156<=width-8&&p.y+122<=height-8);
  }
 }
});
test('round exploration launcher stays visible and easy to tap on phones',()=>{
 const previous=(globalThis as any).window;
 (globalThis as any).window={innerWidth:390,innerHeight:844};
 try{
  const html=renderToStaticMarkup(<DanangAssistantChat/>);
  assert.match(html,/Trợ lý Khám phá<\/span>/);
  assert.match(html,/discovery-chat-launcher/);
  assert.match(html,/rounded-full/);
  assert.match(html,/h-12 w-12/);
  assert.doesNotMatch(html,/discovery-robot|discovery-assistant-button|rounded-none/);
  assert.match(html,/aria-expanded="false"/);
  assert.match(html,/touch-action:manipulation/);
  assert.match(html,/Trợ lý<\/span>/);
  assert.match(html,/right:max\(12px/);
  assert.doesNotMatch(html,/group-hover:flex/);
 }finally{(globalThis as any).window=previous;}
});

test("compact game assistant clears the mobile victory buttons",()=>{
 for(const [width,height] of [[320,568],[375,812],[390,844],[412,915]]){
  const p=compactAssistantPosition(width,height,2);
  assert.ok(p.x>=8 && p.x+48<=width-8);
  assert.ok(p.y+48<=height-84);
 }
});

test('desktop Stage 2 launcher stays to the left of the answer panel',()=>{
 for(const [width,height] of [[1024,540],[1366,610],[1920,1080]]){
  const p=compactAssistantPosition(width,height,2);
  assert.ok(p.x+48<width*.1);
 }
});


test('natural quick prompts are contextual, short, and quiz-safe',()=>{
 const teacher=buildAssistantFollowUps({audience:'teacher',topic:'san hô'});
 assert.equal(teacher.length,3);
 assert.equal(teacher[0].label,'Gợi ý vài câu hỏi cho lớp nhé!');
 assert.match(teacher[0].query,/Tạo 3 câu hỏi kèm đáp án về san hô/);
 assert.match(teacher[1].query,/hoạt động 5 phút về san hô/i);
 const teacherHome=buildAssistantFollowUps({audience:'teacher'});
 assert.ok(teacherHome.every(item=>!item.draft&&!!item.query));
 assert.ok(teacherHome.every(item=>item.label.length<60));
 const student=buildAssistantFollowUps({audience:'student',topic:'Hội An'});
 assert.equal(student.length,3);
 assert.match(student[2].query,/kiểm tra về Hội An/);
 assert.doesNotMatch(student.map(item=>item.query).join(' '),/Tạo 3 câu hỏi kèm đáp án/);
 const stage1=buildAssistantFollowUps({audience:'student',stage:1,stationTitle:'Thành Điện Hải',hotspotTitle:'2. Hào thành'});
 assert.equal(stage1[0].label,'Nơi ni có chi hay vậy?');
 assert.equal(stage1[0].query,'Nơi ni có chi đặc biệt?');
 assert.ok(stage1.slice(1).every(item=>item.query.includes('Hào thành')));
 const stage34=buildAssistantFollowUps({audience:'student',stage:4,topic:'Cù Lao Chàm'});
 assert.match(stage34[0].query,/Cù Lao Chàm/);
 assert.equal(stage34[2].query,'Em nên làm gì để giữ gìn quê hương?');
 const quiz=buildAssistantFollowUps({audience:'student',stage:2,topic:'Hội An'});
 assert.equal(quiz.length,3);
 assert.doesNotMatch(quiz.map(item=>item.query).join(' '),/Đáp án|1999|giải bài/);
 const unknown=buildAssistantFollowUps({audience:'teacher',topic:'Hội An',unknown:true});
 assert.ok(unknown.every(item=>!!item.query&&!item.draft));
 assert.ok(unknown.every(item=>!!item.label)); // safe, explicit sample questions after unknown input
 const localized=buildAssistantFollowUps({audience:'student',stationTitle:'Cù Lao Chàm',hotspotTitle:'2. San hô'});
 assert.ok(localized.every(item=>item.query.includes('San hô')));
 for(const audience of ['student','teacher','admin'] as const){
  for(const stage of [undefined,1,2,3,4])assert.ok(buildAssistantFollowUps({audience,stage}).length<=3);
 }
 const admin=buildAssistantFollowUps({audience:'admin'});
 assert.deepEqual(admin.map(item=>item.adminPage),['assistant-qa','effectiveness','reports']);
 assert.ok(admin.every(item=>!item.query));
 assert.ok(admin.every(item=>['assistant-qa','effectiveness','reports'].includes(item.adminPage||'')));
});
test('collapsed panel retains input draft and exposes same icon for close; AI is never auto-called on missing retrieval',async()=>{
 const fs=await import('node:fs/promises');
 const source=await fs.readFile(new URL('./src/components/common/DanangAssistantChat.tsx',import.meta.url),'utf8');
 assert.match(source,/aria-label="Thu gọn Trợ lý Khám phá"/);
 assert.match(source,/event\.key === 'Escape'\) setOpen\(false\)/);
 assert.match(source,/document\.addEventListener\('pointerdown',dismiss,true\)/);
 assert.doesNotMatch(source,/setOpen\(false\);setInput\(''\)/);
 assert.doesNotMatch(source,/if\(!result\.found && aiAvailable/);
 assert.match(source,/suggestedPrompts\.slice\(0,3\)/);
});

test('pupil transcript hides sensitive input before retention but preserves ordinary learning questions',()=>{
 assert.equal(maskStudentPrivateQuestion('Địa chỉ nhà em là 123 ABC'),'Em đã nhập thông tin riêng tư (đã ẩn để bảo vệ em).');
 assert.equal(maskStudentPrivateQuestion('Mật khẩu của em là 123456'),'Em đã nhập thông tin riêng tư (đã ẩn để bảo vệ em).');
 assert.equal(maskStudentPrivateQuestion('Số điện thoại em là 0123456789'),'Em đã nhập thông tin riêng tư (đã ẩn để bảo vệ em).');
 assert.equal(maskStudentPrivateQuestion('Em tên là Nguyễn Văn A'),'Em đã nhập thông tin riêng tư (đã ẩn để bảo vệ em).');
 assert.equal(maskStudentPrivateQuestion('Thư của em là abc@example.com'),'Em đã nhập thông tin riêng tư (đã ẩn để bảo vệ em).');
 assert.equal(maskStudentPrivateQuestion('Gọi em ở 0901234567'),'Em đã nhập thông tin riêng tư (đã ẩn để bảo vệ em).');
 assert.equal(maskStudentPrivateQuestion('Thành Điện Hải được xây năm 1813?'),'Thành Điện Hải được xây năm 1813?');

});
