import {test} from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createLessonPlan,restoreLessonPlan,totalMinutes,lessonPlanBlob} from './src/services/LessonPlanService';
const record={id:'tv2-goiban',grade:2,subject:'Tiếng Việt',week:'3',lesson:'Gọi bạn',activity:'Sau khi đọc',integrationType:'Liên hệ',content:'Học sinh chia sẻ việc làm thể hiện tình bạn tại lớp học ở Đà Nẵng.',outcomes:'Nêu được một việc làm giúp đỡ bạn.',teachingSuggestion:'Trao đổi theo cặp về cách giúp đỡ bạn.'};
test('selected source only, editable draft and genuine Word archive',async()=>{
 const p=createLessonPlan(record);assert.equal(totalMinutes(p),35);assert.equal(p.lesson,'Gọi bạn');assert.ok(p.integration.includes(record.content));assert.ok(p.activities[1].teacher.includes(record.teachingSuggestion));assert.equal(p.activities.length,4);
 p.objectives='Mục tiêu đã chỉnh sửa < & >';p.activities[0].student='Học sinh chia sẻ ý kiến đã chỉnh sửa.';
 const blob=await lessonPlanBlob(p);const bytes=Buffer.from(await blob.arrayBuffer());assert.equal(bytes.subarray(0,2).toString(),'PK');assert.ok(bytes.length>5000);
 await writeFile('/tmp/cham-khbd-test.docx',bytes);
});

test('drafts restore edits and reject another lesson, grade or corrupt timings',()=>{
 const p=createLessonPlan(record);p.materials='Đồ dùng đã sửa';
 assert.equal(restoreLessonPlan(JSON.stringify(p),record).materials,p.materials);
 assert.throws(()=>restoreLessonPlan(JSON.stringify(p),{...record,lesson:'Bài khác'}));
 assert.throws(()=>restoreLessonPlan(JSON.stringify(p),{...record,grade:3}));
 assert.throws(()=>restoreLessonPlan('null',record));
 p.activities[0].minutes=NaN;assert.throws(()=>restoreLessonPlan(JSON.stringify(p),record));
});
test('all five grades retain the selected lesson and source',()=>{
 for(let grade=1;grade<=5;grade++){
  const r={...record,grade,id:`bai-${grade}`,lesson:`Bài khối ${grade}`,content:`Nội dung riêng khối ${grade}`};
  const p=createLessonPlan(r);assert.equal(p.grade,grade);assert.equal(p.lesson,r.lesson);assert.ok(p.integration.includes(r.content));assert.equal(totalMinutes(p),35);
 }
});
