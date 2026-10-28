import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import phase1Baseline from './docs/stage2/phase1-source-hashes.json';
import {grade3SharedConfigs,grade3NewPreviewIds} from './src/games/stage2/grade3';
import {validateConfig} from './src/games/stage2/types';
import {initialState,gameReducer,isCorrectMatch} from './src/games/stage2/state';
import {GRADE3_CONTENT} from './src/data/grade3Content';
const advance=(s:ReturnType<typeof initialState>,correct:boolean)=>gameReducer(gameReducer(s,{type:'answer',correct}),{type:'advance'});
for(const id of grade3NewPreviewIds) {
 const c=grade3SharedConfigs[id];
 test(`${id}: five configured questions, local distinct backgrounds, five identical themed items`,()=>{
  validateConfig(c);assert.notEqual(c.background,c.victoryBackground);assert.ok(c.collectible.image);
  for(const url of [c.background,c.victoryBackground,c.collectible.image!,...c.questions.flatMap(q=>q.kind==='image'?q.options.map(o=>o.image!):[])])assert.ok(existsSync('public'+url),url);
  const lesson=GRADE3_CONTENT.find(l=>l.id===id)!;assert.equal(lesson.points.length,4);assert.ok(lesson.notes.some(s=>s.includes('LOP 3')));
 });
 test(`${id}: every choice and all six match permutations have unambiguous result`,()=>{
  for(const q of c.questions){if(q.kind==='match'){
   const permutations=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];let correct=0;
   for(const p of permutations){const ok=isCorrectMatch(q.solution,{0:p[0],1:p[1],2:p[2]});if(ok)correct++;}
   assert.equal(correct,1);assert.equal(isCorrectMatch(q.solution,{0:q.solution[0]}),false);
  }else{assert.equal(q.options.map((_,i)=>i===q.answer).filter(Boolean).length,1);assert.ok(q.hint.length>15);}}
 });
 test(`${id}: all-wrong first pass, repeated wrong review, then five rewards without duplicates`,()=>{
  let s=gameReducer(initialState(),{type:'start'});for(let i=0;i<5;i++)s=advance(s,false);
  assert.equal(s.phase,'review');assert.equal(s.earned.length,0);assert.deepEqual(s.missed,[0,1,2,3,4]);
  s=gameReducer(s,{type:'review'});s=advance(s,false);assert.equal(s.index,0);
  for(let i=0;i<5;i++){assert.equal(s.index,i);s=gameReducer(s,{type:'answer',correct:true});const twice=gameReducer(s,{type:'answer',correct:true});assert.deepEqual(twice,s);s=gameReducer(s,{type:'advance'});}
  assert.equal(s.phase,'victory');assert.equal(s.earned.length,5);assert.deepEqual(gameReducer(s,{type:'restart'}),initialState());
 });
}
test('three stations share exactly one renderer/audio adapter; no three new HTML games',()=>{
 const code=readFileSync('src/games/stage2/Preview.tsx','utf8');assert.ok(code.includes('<SharedStage2'));assert.ok(!code.includes('new Audio'));
 const configs=grade3NewPreviewIds.map(id=>grade3SharedConfigs[id]);assert.equal(new Set(configs.flatMap(c=>[c.background,c.victoryBackground])).size,6);
 assert.equal(new Set(configs.map(c=>c.collectible.image)).size,3);
});
test('approved station 1/2 source, content, art and audio patterns remain byte-identical to phase 1',()=>{
 // Frozen from the actual phase-1 commit in this repository. The old
 // 7502586 ref is absent; hashes also work in GitHub's shallow CI checkout.
 for(const [path,expected] of Object.entries(phase1Baseline.files))assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),expected,path);
});
test('content facts trace to the existing grade 3 lesson narratives',()=>{
 const lesson=(id:string)=>GRADE3_CONTENT.find(l=>l.id===id)!.points.map(p=>p.narration).join(' ');
 for(const fact of ['thổ cẩm','chim chèo bẻo','Tung tung – da dá','tôn trọng'])assert.ok(lesson('g3-station-3').includes(fact));
 for(const fact of ['cá cơm than','12 đến 18 tháng','vuột tre','ủ tiếp','không tự mở chum'])assert.ok(lesson('g3-station-4').includes(fact));
 for(const fact of ['Tre là nguyên liệu chính','thân thúng tròn','dầu rái','chống thấm','ép vành','không tự dùng'])assert.ok(lesson('g3-station-5').includes(fact));
});
test('every shared cue schedules sound while enabled and stops while muted',async()=>{
 const starts:{t:number;kind:string}[]=[];let resumed=0,stopped=0;
 class Gain{gain={value:1,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}};connect(){}disconnect(){}}
 class Source{frequency={value:0};type='sine';onended:()=>void=()=>{};connect(){}disconnect(){}start(t:number){starts.push({t,kind:this.type});}stop(){stopped++;}}
 class Ctx{state='suspended';currentTime=0;destination={};createGain(){return new Gain();}createOscillator(){return new Source();}resume(){resumed++;this.state='running';return Promise.resolve();}}
 Object.assign(globalThis,{window:{AudioContext:Ctx},localStorage:{getItem:()=>null,setItem(){}}});
 const {SharedGameAudio}=await import('./src/games/stage2/audio');const a=new SharedGameAudio();
 const cues=['tap','select','confirm','connect','next','retry','key','right','wrong','victory','unlock'] as const;
 for(const cue of cues){const before=starts.length;a.play(cue);assert.ok(starts.length>before,cue);}
 assert.equal(resumed,1);assert.ok(starts.every((s,i)=>i===0||s.t>=starts[i-1].t));a.setMuted(true);const count=starts.length;
 for(const cue of cues)a.play(cue);assert.equal(starts.length,count);assert.ok(stopped>=count);
});
