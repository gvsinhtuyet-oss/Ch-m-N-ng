import {test} from 'node:test';import assert from 'node:assert/strict';
import {recordsFromRows} from './src/services/TeacherWorkspaceService';
test('Vietnamese headers map independently of column order',()=>{const rows=recordsFromRows([['Tiêu đề'],['Tuần','Tên bài học','Môn học','Địa chỉ tích hợp','Nội dung tích hợp','Mức độ'],['3','Bài hiện hành','Tiếng Việt','Luyện tập','Hội An','Liên hệ']],2);assert.equal(rows[0].lesson,'Bài hiện hành');assert.equal(rows[0].activity,'Luyện tập');assert.equal(rows[0].content,'Hội An');assert.deepEqual(rows[0].resourceLinks,[]);});
test('ambiguous/incomplete rows require teacher correction',()=>{assert.throws(()=>recordsFromRows([['Tên bài','Nội dung']],2));assert.throws(()=>recordsFromRows([['Tên bài','Môn học','Nội dung'],['Bài','','Hội An']],2));});

import {SCHOOL_NAME,TEXTBOOK_NAME,SCHOOL_YEAR,blankLocalPlan,localPlanKey,loadLocalPlan,storeLocalPlan,validateLocalPlan} from './src/services/LocalTeacherPlan';
import {readFile} from 'node:fs/promises';
test('standard school and textbook stay fixed; drafts are isolated by teacher and grade without network',()=>{
 assert.equal(SCHOOL_NAME,'Trường Tiểu học Trần Đại Nghĩa');
 assert.equal(TEXTBOOK_NAME,'Kết nối tri thức với cuộc sống');assert.equal(SCHOOL_YEAR,'2026-2027');
 const data=new Map<string,string>();
 const storage={getItem:(key:string)=>data.get(key)||null,setItem:(key:string,value:string)=>{data.set(key,value);}};
 const plan={...blankLocalPlan(2),school:'Sai trường',book:'Sai sách',records:[{id:'private-1',grade:2,subject:'Tự nhiên và Xã hội',week:'6',lesson:'Bài địa phương',integrationType:'Liên hệ',activity:'Khám phá',content:'Tìm hiểu Đà Nẵng',outcomes:'Biết bảo vệ di tích',teachingSuggestion:'Quan sát và nói',resourceLinks:[{stationId:'g2-station-1',hotspotId:'h1'}]}]};
 storeLocalPlan('teacher-a',plan,storage);
 const saved=loadLocalPlan('teacher-a',2,storage);
 assert.equal(saved.school,SCHOOL_NAME);assert.equal(saved.book,TEXTBOOK_NAME);
 assert.equal(saved.records[0].outcomes,'Biết bảo vệ di tích');
 assert.equal(saved.records[0].resourceLinks?.length,1);
 assert.equal(loadLocalPlan('teacher-b',2,storage).records.length,0);
 assert.equal(loadLocalPlan('teacher-a',3,storage).records.length,0);
 assert.notEqual(localPlanKey('teacher-a',2),localPlanKey('teacher-b',2));
 assert.throws(()=>validateLocalPlan(plan,3),/khối khác/i);
});
test('Excel roundtrip columns preserve required outcomes and suggested teaching without server',()=>{
 const rows=recordsFromRows([
 ['Trường','Trường Tiểu học Trần Đại Nghĩa'],
 ['Bộ sách','Kết nối tri thức với cuộc sống'],
 ['Môn học','Tuần','Tên bài','Nội dung tích hợp','Địa chỉ tích hợp','Mức độ','Yêu cầu cần đạt','Gợi ý tổ chức'],
 ['TNXH','8','Bài thử','Bản sắc Đà Nẵng','Vận dụng','Liên hệ','Giữ gìn di sản','Quan sát hình ảnh']
 ],2);
 assert.equal(rows.length,1);
 assert.equal(rows[0].outcomes,'Giữ gìn di sản');
 assert.equal(rows[0].teachingSuggestion,'Quan sát hình ảnh');
});
test('offline integration screen never calls Firestore or server-backed planning endpoints',async()=>{
 const source=await readFile(new URL('./src/features/teacher/TeacherWorkspace.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(source,/workspaceRequest|authService|\/api\/teacher\/workspace|\/api\/teacher\/proposals|fetch\s*\(/);
 assert.match(source,/storeLocalPlan/);
 assert.match(source,/downloadLocalExcel/);
 assert.match(source,/reviewGddpTextbookAddress/);
});
