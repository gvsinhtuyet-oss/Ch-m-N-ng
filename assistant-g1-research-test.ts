import test from 'node:test';
import assert from 'node:assert/strict';
import pack from './src/data/assistantGrade1Research.json';
import {ALL_25_STATIONS} from './src/data/allStations';
import {retrieveDanangAssistantAnswer as ask} from './src/services/DanangAssistantRetrievalService';

const station=ALL_25_STATIONS.find(s=>s.id===pack.stationId)!;

test('51 source-linked answers, 157 authored formulations, 4 real points and no duplicate ID',()=>{
  assert.equal(pack.entries.length,51);
  assert.equal(pack.entries.reduce((n,row)=>n+row.variants.length+1,0),157);
  assert.equal(new Set(pack.entries.map(r=>r.id)).size,51);
  assert.deepEqual(new Set(pack.entries.map(r=>r.pointId)),new Set(station.hotspots.map(h=>h.id)));
  for(const entry of pack.entries){
    assert.ok(entry.answer.length>=40,entry.id);
    assert.ok(entry.followUp.endsWith('?'),entry.id);
    for(const id of entry.sources)assert.ok(pack.sources.some(s=>s.id===id),entry.id+' unknown source '+id);
  }
});

test('every authored wording retrieves its specific question and shows source, without pretending teacher approval',()=>{
  for(const row of pack.entries)for(const question of [row.question,...row.variants]){
    const hotspot=station.hotspots.find(h=>h.id===row.pointId);
    const result=ask(question,{station,hotspot,audience:row.audience as 'student'|'teacher'});
    assert.equal(result.matchedEntryId,row.id,row.id+': '+question+' => '+result.answer);
    assert.ok(result.sources?.length,row.id);
    assert.ok(result.followUp?.endsWith('?'),row.id);
  }
  assert.match(pack.reviewStatus,/pending_teacher_signoff/);
});

test('student must never access teacher-only research answers',()=>{
  for(const row of pack.entries.filter(r=>r.audience==='teacher')){
    const r=ask(row.question,{station,audience:'student'});
    assert.notEqual(r.matchedEntryId,row.id,row.id);
  }
});

test('specific station context prevents pollution from grade 1 QA',()=>{
  const other=ALL_25_STATIONS.find(s=>s.id==='g1-station-4')!;
  const r=ask('Vì sao tên xã hoặc phường có thể thay đổi?',{station:other});
  assert.notEqual(r.matchedEntryId,'g1s1-q008');
});

test('guard for Stage 2 quiz remains ahead of source-linked QA',()=>{
  const r=ask('Xã và phường là gì?',{station,audience:'student',stage:2});
  assert.equal(r.layer,'help');
  assert.doesNotMatch(r.answer,/những tên gọi của đơn vị hành chính/);
});

test('no invented personal location, no old school treated as current',()=>{
  const location=ask('Em ở phường nào?',{station,audience:'student'});
  assert.equal(location.matchedEntryId,'g1s1-q003');
  assert.match(location.answer,/không biết chính xác/i);
  const school=ask('Thông tin Trường Tiểu học Kim Đồng ở Tam Kỳ trong bài còn dùng được không?',{station,audience:'teacher'});
  assert.equal(school.matchedEntryId,'g1s1-q022');
  assert.match(school.answer,/26\/08\/2026/);
  assert.ok(school.sources?.some(x=>x.url?.includes('tamky.danang.gov.vn')));
});

test('challenging unlisted questions never match an unrelated authored FAQ',()=>{
  for(const q of ['Nhà Gươl được xây năm nào?','Cầu Rồng xây năm bao nhiêu?','Chợ Hàn bán bao nhiêu mặt hàng?',
    'Ở Tam Kỳ hiện có mấy trạm y tế?','Đà Nẵng có bao nhiêu quận năm 1997?']){
    const r=ask(q,{station,audience:'student'});
    assert.ok(!r.matchedEntryId?.startsWith('g1s1-'),q+' returned wrong researched answer '+r.matchedEntryId);
  }
});
