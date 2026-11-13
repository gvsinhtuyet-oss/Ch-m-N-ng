import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {retrieveDanangAssistantAnswer} from './src/services/DanangAssistantRetrievalService';
import {ALL_25_STATIONS} from './src/data/allStations';
import {staffAssistantAnswer} from './src/services/StaffAssistantAnswers';
const queries={
 student:['Phố cổ Hội An có gì đặc biệt?','San hô là động vật hay thực vật?','Vòng tuần hoàn nước là gì?'],
 teacher:['Gợi ý 3 câu hỏi cho học sinh lớp 2 tìm hiểu Hội An','Thiết kế hoạt động 5 phút về bảo vệ san hô cho lớp 2','Vòng tuần hoàn nước là gì?'],
 admin:['Tổng quan hiệu quả sử dụng hiện có những số liệu nào?','Xem kết quả học tập từng lớp ở đâu?','Làm sao kiểm định chatbot của 25 trạm?'],
} as const;
for(const role of ['student','teacher'] as const)for(const question of queries[role])test(role+': '+question,()=>{
 const result=retrieveDanangAssistantAnswer(question,{audience:role,grade:2,stations:ALL_25_STATIONS});assert.equal(result.found,true,result.answer);assert.ok(result.answer.length>60);
});
for(const [i,q] of queries.admin.entries())test('admin: '+q,async()=>{const result=await staffAssistantAnswer(q,true);assert.ok(result);assert.equal(result.adminPage,['effectiveness','reports','assistant-qa'][i]);if(i===0){assert.match(result.answer,/267.*312.*210/);assert.match(result.answer,/giả định/);}});
test('real admin navigation never presents experience numbers as verified school data',async()=>{const result=await staffAssistantAnswer(queries.admin[0],false);assert.ok(result);assert.doesNotMatch(result.answer,/267|312|210/);});
test('experience role affects chatbot only, real Admin authentication is unchanged',()=>{const app=readFileSync('src/App.tsx','utf8'),experience=readFileSync('src/features/teacher/ExperienceWorkspace.tsx','utf8');assert.match(app,/currentUser\?\.id!=='teacher-demo'/);assert.match(app,/audience=\{assistantAudience\}/);assert.match(experience,/cham-experience-assistant-role/);assert.match(experience,/cham-admin-open-page/);assert.match(app,/currentView === 'admin-view' && role === 'admin' && <AdminDashboard \/>/);});
