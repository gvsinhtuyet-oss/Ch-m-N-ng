import test from 'node:test';
import assert from 'node:assert/strict';
import {searchTeacherLessons} from './src/services/TeacherLessonSearch';
import {bundledGddpCatalog} from './src/services/GddpBundledCatalog';
import type {Station} from './src/types';

const records=bundledGddpCatalog.records;
const stations=[{id:'hoi-an',grade:2,titleVi:'Di sản văn hóa thế giới Hội An'},
  {id:'nam-o',grade:3,titleVi:'Nước mắm Nam Ô'}] as Station[];
test('teacher can find an accented or unaccented textbook title and exact integration address',()=>{
  for(const query of ['Mở bài Em yêu quê hương lớp 2','mo bai em yeu que huong lop 2','Em yêu quê hương']){
    const result=searchTeacherLessons(query,records,stations,2);
    const first=result?.hits[0];
    assert.equal(first?.kind,'integration',query);
    if(first?.kind==='integration'){
      assert.equal(first.record.id,'gddp-2026-2-04');
      assert.match(first.record.content,/Hội An/);
      assert.match(first.record.subject,/Đạo đức/);
    }
  }
});
test('topic search returns related integration records and a direct local lesson',()=>{
  const result=searchTeacherLessons('Tìm bài tích hợp về Hội An',records,stations,2)!;
  assert.ok(result.hits.some(hit=>hit.kind==='station'&&hit.station.id==='hoi-an'));
  assert.ok(result.hits.some(hit=>hit.kind==='integration'&&hit.record.id==='gddp-2026-2-04'));
});
test('class, subject aliases and week are strict constraints',()=>{
  for(const query of ['Tìm bài lớp 2 môn TNXH tuần 2','Tìm bài lớp 2 môn Tự nhiên và xã hội tuần 2']){
    const result=searchTeacherLessons(query,records,stations)!;
    assert.equal(result.total,1,query);
    const hit=result.hits[0];
    assert.equal(hit.kind,'integration');
    if(hit.kind==='integration')assert.equal(hit.record.id,'gddp-2026-2-07');
  }
  const none=searchTeacherLessons('Tìm bài Em yêu quê hương lớp 5',records,stations)!;
  assert.equal(none.total,0);
});
test('topic matching does not substitute incidental generic city words',()=>{
  const result=searchTeacherLessons('Tìm bài về khảo cổ Sao Hỏa',records,stations)!;
  assert.equal(result.total,0);
});
test('ordinary knowledge and question-writing requests stay with the knowledge assistant',()=>{
  for(const query of ['San hô là động vật hay thực vật?','Hội An được UNESCO công nhận năm nào?',
    'Đà Nẵng có làng nghề gì?','Soạn 3 câu trắc nghiệm về Hội An có đáp án','Vì sao có mưa?']){
    assert.equal(searchTeacherLessons(query,records,stations),null,query);
  }
});
test('duplicate titles remain separate choices with class and subject intact',()=>{
  const rows=[2,3].map(grade=>({id:'dup-'+grade,grade,lesson:'Em yêu quê hương',subject:grade===2?'Đạo đức':'Tiếng Việt',week:'1',content:'Hội An',activity:'Khởi động',integrationType:'Bộ phận'}));
  const result=searchTeacherLessons('Em yêu quê hương',rows,[],3)!;
  assert.equal(result.total,2);
  const first=result.hits[0];
  assert.equal(first.kind==='integration'&&first.record.grade,3);
  assert.equal(searchTeacherLessons('Mở bài Em yêu quê hương lớp 2',rows,[],3)?.total,1);
});
test('live published catalog is authoritative, including a deliberately empty catalog',()=>{
  assert.equal(searchTeacherLessons('Mở bài Em yêu quê hương',[],stations)?.total,0);
  const live=[{...records[0],id:'live-new',lesson:'Một bài mới do giáo viên đặt tên'}];
  assert.equal(searchTeacherLessons('Mở bài Một bài mới do giáo viên đặt tên',live,[])?.hits[0].kind,'integration');
});
test('broad results are bounded and invite the teacher to narrow the search',()=>{
  const result=searchTeacherLessons('Tìm bài lớp 3',records,stations)!;
  assert.ok(result.total>6);
  assert.equal(result.hits.length,6);
  assert.match(result.message,/thêm lớp, môn hoặc tuần/);
});
