import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
import {grade45SharedConfigs,grade45Batches} from './src/games/stage2/grade45';
import {GRADE45_CONTENT} from './src/data/grade45Content';
import {validateConfig} from './src/games/stage2/types';
import {gameReducer,initialState,isCorrectMatch} from './src/games/stage2/state';
test('two batches cover all ten real curriculum ids and never replace production games',()=>{
 assert.deepEqual(grade45Batches.map(b=>b.length),[5,5]);
 assert.deepEqual(Object.keys(grade45SharedConfigs).sort(),GRADE45_CONTENT.map(l=>l.id).sort());
 const router=readFileSync('src/components/station/Stage2Challenge.tsx','utf8');
 assert.ok(!router.includes('grade45SharedConfigs'));
 for(const path of ['src/components/station/Stage2Challenge.tsx','src/data/grade45Content.ts','src/data/grade45Stations.ts','src/games/stage2/SharedChallengeGame.tsx','src/games/stage2/safe-layout.css'])assert.deepEqual(readFileSync(path),execFileSync('git',['show',`39ddc40:${path}`],{maxBuffer:10e6}),path);
});
for(const [id,c]of Object.entries(grade45SharedConfigs)){
 test(id+': complete configuration, real local photos, themed rewards',()=>{
  validateConfig(c);assert.equal(c.layout,'safe-v1');assert.equal(c.questions.map(q=>q.level).join(','),'Nhận biết,Nhận biết,Thông hiểu,Thông hiểu,Vận dụng');
  for(const p of [c.background,c.victoryBackground,c.collectible.image!,...c.questions.flatMap(q=>q.kind==='image'?q.options.map(o=>o.image!):[])])assert.ok(existsSync('public'+p),p);
  const photo=c.questions[0];assert.notEqual(photo.kind,'match');if(photo.kind!=='match')assert.equal(new Set(photo.options.map(o=>o.image)).size,3);
 });
 test(id+': all wrong, review all correct, five unique rewards, replay',()=>{
  let s=gameReducer(initialState(),{type:'start'});
  for(let i=0;i<5;i++)s=gameReducer(gameReducer(s,{type:'answer',correct:false}),{type:'advance'});
  assert.equal(s.phase,'review');assert.equal(s.missed.length,5);s=gameReducer(s,{type:'review'});
  for(let i=0;i<5;i++)s=gameReducer(gameReducer(s,{type:'answer',correct:true}),{type:'advance'});
  assert.equal(s.phase,'victory');assert.equal(new Set(s.earned).size,5);assert.deepEqual(gameReducer(s,{type:'restart'}),initialState());
  const match=c.questions[3];assert.equal(match.kind,'match');if(match.kind==='match')assert.equal([[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]].filter(p=>isCorrectMatch(match.solution,{0:p[0],1:p[1],2:p[2]})).length,1);
 });
}
test('twenty distinct optimized WebP backgrounds, all exactly 16:9',async()=>{
 const hashes=new Set<string>();
 for(const c of Object.values(grade45SharedConfigs))for(const url of [c.background,c.victoryBackground]){
  const path='public'+url;const m=await sharp(path).metadata();assert.equal(m.width,1600);assert.equal(m.height,900);assert.equal(m.format,'webp');assert.ok(statSync(path).size<600*1024,url);hashes.add(createHash('sha256').update(readFileSync(path)).digest('hex'));
 }
 assert.equal(hashes.size,20);
});
