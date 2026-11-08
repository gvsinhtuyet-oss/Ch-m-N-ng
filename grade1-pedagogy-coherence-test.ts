import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GRADE1_CONTENT} from './src/data/grade1Content';
import {GRADE1_MINUTES} from './src/data/grade1MinutesAlignment';
import {GRADE_1_STATIONS} from './src/data/grade1Stations';
import {grade1SharedConfigs} from './src/games/stage2/grade1';
import {stage1Narration} from './src/components/station/stage1Narration';

const lesson = (id:string)=>GRADE1_CONTENT.find(x=>x.id===id)!;
const minutes = (id:string)=>GRADE1_MINUTES.find(x=>x.stationId===id)!;
const game = (id:string)=>grade1SharedConfigs[id];
const clean = (s:string)=>s.toLocaleLowerCase('vi').normalize('NFC');

test('Grade 1 source lessons, hotspot checks and all stage-2 games preserve stable identities',()=>{
 assert.equal(GRADE_1_STATIONS.length,5);
 assert.equal(GRADE_1_STATIONS.reduce((n,s)=>n+s.hotspots.length,0),20);
 for(const s of GRADE_1_STATIONS){
  assert.equal(s.hotspots.length,4,s.id);
  assert.equal(s.challenge.questions?.length,5,s.id);
  assert.equal(game(s.id).questions.length,4,s.id);
  assert.ok(minutes(s.id));
 }
});

test('Quê hương em stage-2 statements no longer teach unintroduced Võ Thị Sáu claims',()=>{
 const home=lesson('g1-station-1');
 const q=game('g1-station-1').questions[1];
 assert.equal(q.kind,'choice');
 assert.match(q.prompt,/tên trường.*xã hoặc phường/i);
 assert.doesNotMatch(q.prompt,/Võ Thị Sáu/);
 assert.match(home.points.find(p=>p.id==='g1-home-2')!.narration,/năm 2025/);
 assert.doesNotMatch(home.points.find(p=>p.id==='g1-home-2')!.narration,/hai trường.*Võ Thị Sáu/i);
 const walk=home.points.find(p=>p.id==='g1-home-3')!;
 assert.match(walk.q,/lời thuyết minh/i);
 assert.match(walk.answers[0],/cổng thôn, chợ và ga tàu/i);
 assert.ok(clean(walk.narration).includes(clean('cổng thôn')));
 assert.ok(clean(walk.narration).includes(clean('ga tàu')));
});

test('Food stage-2 content now covers 2025 starter dishes and the new Bánh đập practice term',()=>{
 const food=lesson('g1-station-5');
 const q=game('g1-station-5').questions;
 assert.match(q[1].prompt,/bánh sừng trâu.*bánh xèo/i);
 assert.equal(q[1].kind,'choice');if(q[1].kind==='choice')assert.equal(q[1].answer,0);
 assert.equal(q[2].kind,'match');if(q[2].kind==='match'){
  assert.ok(q[2].left.some(x=>/Mì Quảng/.test(x)));
  assert.ok(q[2].left.some(x=>/Bánh đập/.test(x)));
  assert.ok(q[2].right.some(x=>/Khám phá/.test(x)));
  assert.ok(q[2].right.some(x=>/Thực hành/.test(x)));
 }
 const official=minutes('g1-station-5').phases[0].imageSubjects!;
 for(const name of official)assert.ok(clean(food.points[0].narration).includes(clean(name)),name);
 assert.doesNotMatch(food.points[0].narration,/cao lầu|bê thui|nem nướng|cơm gà/i);
 assert.match(food.points[0].narration,/Trên màn hình là món mì Quảng/);
 assert.doesNotMatch(food.points[1].answers.join(' '),/nem nướng/);
});

test('Teacher editorial minutes cannot be shown to pupils in the Stage-1 student interface',()=>{
 const ui=readFileSync('src/components/station/Stage1Exploration.tsx','utf8');
 assert.match(ui,/station\.grade === 1 && \(role === 'teacher' \|\| role === 'admin'\)/);
 assert.match(ui,/Dành cho giáo viên.*Đối chiếu GDĐP lớp 1/);
 assert.match(ui,/grade1Minutes\.phases\.map/);
});

test('Changed voice text never triggers a stale recording, 16 unchanged points keep their recordings',()=>{
 const modified=new Set(['g1-home-2','g1-home-3','g1-food-1','g1-food-4']);
 let fresh=0,old=0;
 for(const s of GRADE_1_STATIONS)for(const h of s.hotspots){
  const result=stage1Narration(s,h,'vi');
  if(modified.has(h.id)){assert.equal(result,undefined,h.id);fresh++;}
  else {assert.ok(result,h.id);old++;}
 }
 assert.deepEqual([fresh,old],[4,16]);
});
