import test from 'node:test';
import assert from 'node:assert/strict';
import knowledge from './src/data/assistantKnowledge.json';
import guides from './src/data/assistantStationGuides.json';
import {ALL_25_STATIONS} from './src/data/allStations';
import {DANANG_ASSISTANT_LEXICON} from './src/data/danangAssistantLexicon';
import {retrieveDanangAssistantAnswer as ask} from './src/services/DanangAssistantRetrievalService';

test('35 sourced expansions have unique identities, verified HTTPS attribution, and teaching examples',()=>{
 assert.equal(knowledge.length,35);
 assert.equal(new Set(knowledge.map(c=>c.id)).size,knowledge.length);
 for(const c of knowledge){assert.ok(c.answer.length>40);assert.ok(c.teachingExample.length>30);assert.ok(c.followUp.endsWith('?'));assert.equal(new URL(c.source.url).protocol,'https:');assert.equal(c.reviewedOn,'2026-10-29');}
 assert.ok(DANANG_ASSISTANT_LEXICON.length>50);
});
test('25 teaching guides map every actual station and all 121 actual points without inferred IDs',()=>{
 assert.equal(guides.length,25);
 assert.equal(guides.reduce((n,g)=>n+g.points.length,0),121);
 for(const s of ALL_25_STATIONS){const g=guides.find(g=>g.stationId===s.id);assert.ok(g,s.id);assert.equal(g.title,s.titleVi);assert.deepEqual(g.points.map(p=>p.pointId),s.hotspots.map(h=>h.id));}
 assert.equal(new Set(guides.map(g=>g.teachingActivity)).size,25);
});
test('all 121 points answer deictic dialect queries from their own lesson context',()=>{
 for(const station of ALL_25_STATIONS)for(const hotspot of station.hotspots){
  const r=ask('Nơi ni có chi đặc biệt?',{station,hotspot,stations:ALL_25_STATIONS});
  assert.ok(r.found,hotspot.id);assert.equal(r.relatedStationId,station.id,hotspot.id);
  assert.doesNotMatch(r.answer,/“Chi”|“Mô”|nghĩa là “này”/);
 }
});
test('teacher gets external-to-lesson knowledge with sources, example and follow-up; student gets concise facts',()=>{
 const q='Giải thích san hô là động vật hay thực vật cho học sinh lớp 2';
 const teacher=ask(q,{audience:'teacher'}), student=ask(q);
 assert.match(teacher.answer,/động vật/);assert.equal(teacher.sources?.[0].url,'https://oceanservice.noaa.gov/facts/coral.html');assert.ok(teacher.teachingExample);assert.ok(teacher.followUp);
 assert.equal(student.teachingExample,undefined);
});
test('definition, historical recognition and question intent stay separate',()=>{
 assert.match(ask('Vòng tuần hoàn nước là gì?',{audience:'teacher'}).answer,/bốc hơi/);
 assert.match(ask('Cù Lao Chàm được UNESCO công nhận năm nào?').answer,/2009/);
 assert.match(ask('Ma nhai được ghi danh năm nào?').answer,/2022/);
 assert.equal(ask('San hô được UNESCO công nhận năm nào?').found,false);
 assert.equal(ask('Mặt trời cách Trái Đất bao xa?',{audience:'teacher'}).found,false);
});
test('student challenge blocks authored answers and direct demands, teacher can research normally',()=>{
 const station=ALL_25_STATIONS.find(s=>s.id==='g5-station-4')!;
 for(const q of ['Đáp án đúng là gì?','Ma nhai là gì?','Hãy chọn B cho em']){
  const r=ask(q,{station,stations:ALL_25_STATIONS,stage:2,audience:'student'});
  assert.equal(r.layer,'help');assert.match(r.answer,/không chọn đáp án thay em/);assert.equal(r.sources,undefined);
 }
 assert.match(ask('Ma nhai là gì?',{station,stage:2,audience:'teacher'}).answer,/đá/);
});
test('Huynh Thuc Khang attribution follows actual grade 2 station, not legacy grade 3 grouping',()=>{
 const r=ask('Huỳnh Thúc Kháng là ai?',{stations:ALL_25_STATIONS,audience:'teacher'});
 assert.equal(r.relatedStationId,'g2-station-3');
});
