import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
import sharp from 'sharp';
import {GRADE_1_STATIONS} from './src/data/grade1Stations';
import {grade1SharedConfigs} from './src/games/stage2/grade1';
import {validateConfig} from './src/games/stage2/types';
import {gameReducer,initialState} from './src/games/stage2/state';
import {rewardSlots} from './src/games/stage2/rewards';
import {selectImage} from './src/games/stage2/multiImage';
import {isCorrectMatch} from './src/games/stage2/state';

test('five grade 1 stations use four questions with required levels',()=>{
 assert.deepEqual(Object.keys(grade1SharedConfigs).sort(),GRADE_1_STATIONS.map(s=>s.id).sort());
 for(const c of Object.values(grade1SharedConfigs)){validateConfig(c);assert.deepEqual(c.questions.map(q=>q.kind),['image','choice','match','choice']);assert.equal(c.questions[1].kind==='choice'&&c.questions[1].options.length,2);assert.deepEqual(c.questions.map(q=>q.level),['Nhận biết','Thông hiểu','Thông hiểu','Vận dụng']);for(const q of c.questions)if(q.kind==='image')for(const o of q.options)assert.ok(existsSync('public'+o.image),String(o.image));}
});
for(const [id,c] of Object.entries(grade1SharedConfigs))test(id+' four wrong answers are revisited and four correct answers win',()=>{
 let s=gameReducer(initialState(),{type:'start',count:4});for(let i=0;i<4;i++){s=gameReducer(s,{type:'answer',correct:false});s=gameReducer(s,{type:'advance'});}assert.equal(s.phase,'review');assert.deepEqual(s.missed,[0,1,2,3]);
 s=gameReducer(s,{type:'review'});for(let i=0;i<4;i++){s=gameReducer(s,{type:'answer',correct:true});s=gameReducer(s,{type:'advance'});}assert.equal(s.phase,'victory');assert.equal(s.earned.length,4);assert.deepEqual(gameReducer(s,{type:'restart'}),initialState());
});
test('ten grade 1 backgrounds are 16:9 optimized WebP',async()=>{for(const c of Object.values(grade1SharedConfigs))for(const p of [c.background,c.victoryBackground]){const path='public'+p;assert.ok(existsSync(path),path);const m=await sharp(path).metadata();assert.equal(m.width,1600);assert.equal(m.height,900);assert.equal(m.format,'webp');assert.ok(statSync(path).size<600_000);}});

test('four items: one per correct answer including review and replay',()=>{
 let s=initialState();assert.deepEqual(rewardSlots(s,4,false),[false,false,false,false]);
 s=gameReducer(s,{type:'start',count:4});assert.equal(rewardSlots(s,4,false).filter(Boolean).length,0);
 for(let i=0;i<4;i++){s=gameReducer(s,{type:'answer',correct:i!==2});s=gameReducer(s,{type:'advance'});}
 assert.equal(s.phase,'review');assert.equal(rewardSlots(s,4,false).filter(Boolean).length,3);
 s=gameReducer(s,{type:'review'});s=gameReducer(s,{type:'answer',correct:true});s=gameReducer(s,{type:'advance'});
 assert.equal(s.phase,'victory');assert.deepEqual(rewardSlots(s,4,false),[true,true,true,true]);
 s=gameReducer(s,{type:'restart'});assert.equal(rewardSlots(s,4,false).filter(Boolean).length,0);
});

test('reviewed grade 1 questions use two unambiguous pairs and valid image selections',()=>{
 for(const c of Object.values(grade1SharedConfigs)){
  const q1=c.questions[0],q3=c.questions[2];assert.ok(q1.kind==='image');assert.ok(q3.kind==='match');
  assert.equal(q3.left.length,2);assert.equal(q3.right.length,2);assert.deepEqual([...q3.solution].sort(),[0,1]);
  if(q1.answers){assert.equal(c.stationId,'g1-station-2');assert.deepEqual(q1.answers,[0,1]);}
 }
});

test('folk games requires both correct images and allows retry after a wrong image',()=>{let r=selectImage([0,1],[],2);assert.equal(r.wrong,true);assert.deepEqual(r.selected,[]);r=selectImage([0,1],r.selected,0);assert.equal(r.complete,false);r=selectImage([0,1],r.selected,2);assert.equal(r.wrong,true);assert.deepEqual(r.selected,[0]);r=selectImage([0,1],r.selected,1);assert.equal(r.complete,true);});
test('every station has the specified valid two-pair solution and non-overlapping choices',()=>{for(const c of Object.values(grade1SharedConfigs)){const q=c.questions[2];assert.equal(q.kind,'match');if(q.kind!=='match')continue;assert.equal(isCorrectMatch(q.solution,{0:1,1:0}),true);assert.equal(isCorrectMatch(q.solution,{0:0,1:1}),false);assert.equal(isCorrectMatch(q.solution,{0:1}),false);const last=c.questions[3];assert.equal(last.kind,'choice');if(last.kind==='choice')assert.equal(new Set(last.options.map(o=>o.text)).size,3);}});
