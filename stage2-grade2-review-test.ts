import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {GRADE_2_STATIONS} from './src/data/grade2Stations';
import {grade2SharedConfigs} from './src/games/stage2/grade2';
import {validateConfig} from './src/games/stage2/types';
import {gameReducer,initialState,isCorrectMatch} from './src/games/stage2/state';

test('all five curriculum stations have isolated preview configs',()=>{
 assert.deepEqual(Object.keys(grade2SharedConfigs).sort(),GRADE_2_STATIONS.map(s=>s.id).sort());
});
for(const [id,c] of Object.entries(grade2SharedConfigs)){
 test(id+' has five curriculum-based questions and local assets',()=>{
  validateConfig(c);assert.equal(c.layout,'safe-v1');
  for(const p of [c.background,c.victoryBackground,...c.questions.flatMap(q=>q.kind==='image'?q.options.map(o=>o.image!):[])])assert.ok(existsSync('public'+p),p);
 });
 test(id+' supports all wrong answers, review, victory and replay',()=>{
  let state=gameReducer(initialState(),{type:'start'});
  for(let n=0;n<5;n++) state=gameReducer(gameReducer(state,{type:'answer',correct:false}),{type:'advance'});
  assert.equal(state.phase,'review');state=gameReducer(state,{type:'review'});
  for(let n=0;n<5;n++)state=gameReducer(gameReducer(state,{type:'answer',correct:true}),{type:'advance'});
  assert.equal(state.phase,'victory');assert.equal(state.earned.length,5);assert.deepEqual(gameReducer(state,{type:'restart'}),initialState());
  const q=c.questions[3];assert.equal(q.kind,'match');if(q.kind==='match'){assert.equal(isCorrectMatch(q.solution,{0:q.solution[0],1:q.solution[1],2:q.solution[2]}),true);assert.equal(isCorrectMatch(q.solution,{0:q.solution[1],1:q.solution[0],2:q.solution[2]}),false);}
 });
}

test('ten background assets are optimized 16:9 WebP',async()=>{
 const sharp=(await import('sharp')).default;
 const {statSync}=await import('node:fs');
 for(const c of Object.values(grade2SharedConfigs)) for(const url of [c.background,c.victoryBackground]){
  const path='public'+url,meta=await sharp(path).metadata();assert.equal(meta.format,'webp');assert.equal(meta.width,1600);assert.equal(meta.height,900);assert.ok(statSync(path).size<600_000);
 }
});
test('official grade 2 routes select shared games only for matching ids',async()=>{
 const {readFileSync}=await import('node:fs');
 const router=readFileSync('src/components/station/Stage2Challenge.tsx','utf8');assert.ok(router.includes('station.grade === 2 && grade2SharedConfigs[station.id]'));assert.ok(router.includes('config={grade2SharedConfigs[station.id]} embedded'));assert.ok(router.indexOf('station.grade === 2 && grade2SharedConfigs[station.id]') < router.indexOf("station.id === 'g1-station-3'")); 
});

test('matching cards do not repeat the exact correct answers of other questions',()=>{
 const normalize=(s:string)=>s.toLocaleLowerCase('vi').trim().replace(/[.!?]/g,'');
 for(const [id,c] of Object.entries(grade2SharedConfigs)){
  const matching=c.questions[3];assert.equal(matching.kind,'match');if(matching.kind!=='match')continue;
  const labels=[...matching.left,...matching.right].map(normalize);
  for(const q of [c.questions[1],c.questions[2],c.questions[4]])if(q.kind!=='match')assert.ok(!labels.includes(normalize(q.options[q.answer].text)),`${id}: ${q.id}`);
 }
});
