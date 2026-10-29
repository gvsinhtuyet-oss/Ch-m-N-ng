import test from 'node:test';
import assert from 'node:assert/strict';
import knowledge from './src/data/assistantKnowledge.json';
import guides from './src/data/assistantStationGuides.json';
import {ALL_25_STATIONS} from './src/data/allStations';
import {DANANG_ASSISTANT_LEXICON} from './src/data/danangAssistantLexicon';
import {retrieveDanangAssistantAnswer as ask, getDanangAssistantQuickPrompts} from './src/services/DanangAssistantRetrievalService';

test('46 sourced expansions have unique identities, verified HTTPS attribution, and teaching examples',()=>{
 assert.equal(knowledge.length,46);
 assert.equal(new Set(knowledge.map(c=>c.id)).size,knowledge.length);
 for(const c of knowledge){assert.ok(c.answer.length>40);assert.ok(c.teachingExample.length>30);assert.ok(c.followUp.endsWith('?'));assert.equal(new URL(c.source.url).protocol,'https:');assert.match(c.reviewedOn,/^2026-10-(29|30)$/);}
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

test('teacher vocabulary extends to crafts and science with distinction preserved',()=>{
 assert.match(ask('Gươl là gì?',{audience:'teacher'}).answer,/cộng đồng/);
 assert.match(ask('Khí hậu khác thời tiết thế nào?',{audience:'teacher'}).answer,/thời gian dài/);
 assert.match(ask('Hợp kim là gì?',{audience:'teacher'}).answer,/ít nhất một kim loại/);
 assert.match(ask('Ươm tơ là gì?',{audience:'teacher'}).answer,/khác với dệt/);
});

test('adversarial questions do not receive incidental quiz answers or noun collisions',()=>{
 const ctx={audience:'teacher' as const,stations:ALL_25_STATIONS};
 const tree=ask('Cây nêu là gì?',ctx);
 assert.ok(!tree.found || /cây nêu/i.test(tree.answer));
 assert.doesNotMatch(tree.answer,/Suối Tiên|dòng thác/);
 const rain=ask('Vì sao trời mưa?',ctx);
 assert.ok(!rain.found || /ngưng tụ|giọt nước|hơi nước/.test(rain.answer));
 assert.doesNotMatch(rain.answer,/đổi kế hoạch/);
 assert.match(ask('Ai xây Chùa Cầu?',ctx).answer,/người Nhật.*Minh Hương/);
 assert.equal(ask('Nhà Gươl được xây dựng năm nào?',ctx).found,false);
 assert.match(ask('Thời tiết khác khí hậu thế nào?',ctx).answer,/thời gian dài/);
 assert.match(ask('Cho ví dụ về bảo tồn',ctx).answer,/Bảo tồn là/);
});

test('direct local-language and causal FAQs answer the requested fact with sources',()=>{
 const r=ask('Chùa Cầu ở mô?');assert.match(r.answer,/nối đường Trần Phú/);assert.ok(r.answer.length<170);assert.doesNotMatch(r.answer,/Mô.*nghĩa/);assert.ok(r.sources?.[0].url);
 const rain=ask('Vì sao trời mưa?',{audience:'teacher'});assert.match(rain.answer,/ngưng tụ/);assert.ok(rain.sources?.[0].url?.includes('noaa.gov'));
});

test('student challenge quick prompts invite learning rather than asking for blocked quiz facts',()=>{
 const station=ALL_25_STATIONS.find(s=>s.id==='g2-station-4')!;
 const p=getDanangAssistantQuickPrompts({station,stage:2,audience:'student'});
 assert.equal(p.length,3);assert.ok(p.every(q=>!/UNESCO|năm nào|đáp án/i.test(q)));
 assert.ok(getDanangAssistantQuickPrompts({station,stage:2,audience:'teacher'}).some(q=>/UNESCO/.test(q)));
});
