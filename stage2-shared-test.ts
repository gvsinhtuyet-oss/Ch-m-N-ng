import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {gameReducer as reduce,initialState,connectPair,isCorrectMatch} from './src/games/stage2/state';
import {validateConfig} from './src/games/stage2/types';
import {hoangDieuConfig as config} from './src/games/stage2/hoangDieu';
import {rolloutDrafts,rolloutBatches} from './src/games/stage2/rollout';
const answer=(s:ReturnType<typeof initialState>,correct:boolean)=>reduce(reduce(s,{type:'answer',correct}),{type:'advance'});
test('all correct earns exactly five items and victory; premature actions ignored',()=>{
 let s=initialState();assert.deepEqual(reduce(s,{type:'advance'}),s);s=reduce(s,{type:'start'});
 for(let i=0;i<5;i++){s=reduce(s,{type:'answer',correct:true});assert.equal(s.earned.length,i+1);assert.deepEqual(reduce(s,{type:'answer',correct:true}),s);s=reduce(s,{type:'advance'});}
 assert.equal(s.phase,'victory');assert.equal(s.earned.length,5);assert.deepEqual(reduce(s,{type:'restart'}),initialState());
});
test('first-pass failures review only missed questions, wrong retry persists, rewards never disappear',()=>{
 let s=reduce(initialState(),{type:'start'});for(let i=0;i<5;i++)s=answer(s,i!==0&&i!==3);
 assert.equal(s.phase,'review');assert.deepEqual(s.earned,[1,2,4]);assert.deepEqual(s.missed,[0,3]);
 s=reduce(s,{type:'review'});assert.equal(s.index,0);s=answer(s,false);assert.equal(s.index,0);
 s=answer(s,true);assert.equal(s.index,3);assert.deepEqual(s.earned,[1,2,4,0]);
 s=answer(s,true);assert.equal(s.phase,'victory');assert.equal(new Set(s.earned).size,5);
});
test('one-to-one matching, reconnect and confirm correctness',()=>{
 let p={};p=connectPair(p,0,1);p=connectPair(p,1,1);assert.deepEqual(p,{1:1});
 p=connectPair(p,0,2);assert.equal(isCorrectMatch([1,2,0],p),false);
 assert.equal(isCorrectMatch([1,2,0],{0:1,1:2,2:0}),true);
});
test('preserve all approved prompts, choices, hints and answers, local assets',()=>{
 validateConfig(config);
 const html=readFileSync('public/games/grade3-hoang-dieu-phan-chau-trinh/v18/index.html','utf8');
 const original=JSON.parse(html.match(/const tasks=(\[.*?\]);/s)![1]);
 config.questions.forEach((q,i)=>{assert.equal(q.prompt,original[i].q);assert.equal(q.hint,original[i].hint);if(q.kind!=='match'){assert.deepEqual(q.options.map(o=>o.text),original[i].a);assert.equal(q.answer,original[i].right);}});
 for(const path of [config.background,config.victoryBackground,...config.questions.flatMap(q=>q.kind==='image'?q.options.map(o=>o.image!):[])])assert.ok(existsSync('public'+path));
 const invalid={...config,questions:config.questions.slice(1)};assert.throws(()=>validateConfig(invalid));
});
test('24 drafts in batches 5/5/5/5/4, never automatically activated',()=>{
 assert.equal(rolloutDrafts.length,24);assert.equal(new Set(rolloutDrafts.map(s=>s.stationId)).size,24);
 assert.deepEqual(rolloutBatches.map(b=>b.length),[5,5,5,5,4]);assert.ok(rolloutDrafts.every(s=>!s.enabled&&s.questions===null));
});
test('shared audio mute stops every source, persisted preference and cues serialize',async()=>{
 const storage=new Map<string,string>();const started:number[]=[];let stopped=0;
 class Source {onended:()=>void=()=>{};frequency={value:0};type='sine';connect(){}disconnect(){}start(t:number){started.push(t);}stop(){stopped++;}}
 class Gain {disconnect(){}gain={value:1,setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}};connect(){}}
 class Context {state='running';currentTime=0;destination={};createGain(){return new Gain();}createOscillator(){return new Source();}resume(){return Promise.resolve();}}
 Object.assign(globalThis,{window:{AudioContext:Context},localStorage:{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v)}});
 const {SharedGameAudio}=await import('./src/games/stage2/audio');const a=new SharedGameAudio();
 a.play('select');a.play('right');a.play('key');assert.ok(started[2]>started[1]);assert.ok(started[5]>started[4]);
 a.setMuted(true);const count=started.length;for(const cue of ['tap','select','confirm','connect','next','retry','key','right','wrong','victory','unlock'] as const)a.play(cue);
 assert.equal(started.length,count);assert.ok(stopped>=count);assert.equal(storage.get('cham_danang_sound_enabled'),'false');assert.equal(new SharedGameAudio().isMuted(),true);
 a.setMuted(false);a.play('victory');assert.ok(started.length>count);a.stop();
});

test('responsive shared cues interrupt backlog and keep mute preference in sync',async()=>{
 const storage=new Map<string,string>();const starts:number[]=[];let stops=0;let maxVolume=0;
 class Source {onended:()=>void=()=>{};frequency={value:0};type='sine';connect(){}disconnect(){}start(t:number){starts.push(t);}stop(){stops++;}}
 class Gain {disconnect(){}gain={value:1,setValueAtTime(){},exponentialRampToValueAtTime(v:number){maxVolume=Math.max(v,maxVolume);},linearRampToValueAtTime(){}};connect(){}}
 class Context {state='running';currentTime=10;destination={};createGain(){return new Gain();}createOscillator(){return new Source();}resume(){return Promise.resolve();}}
 Object.assign(globalThis,{window:{AudioContext:Context},localStorage:{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v)}});
 const {SharedGameAudio}=await import('./src/games/stage2/audio');const a=new SharedGameAudio(true);
 a.play('select');const before=starts.length;a.play('right');assert.ok(stops>=before);assert.equal(starts[before],10.005);assert.ok(maxVolume>.1);
 a.play('wrong');assert.equal(starts[starts.length-2],10.005);a.setMuted(true);const mutedCount=starts.length;a.play('tap');assert.equal(starts.length,mutedCount);
 const b=new SharedGameAudio(true);assert.equal(b.isMuted(),true);a.setMuted(false);assert.equal(b.syncPreference(),false);b.play('tap');assert.ok(starts.length>mutedCount);
});

test('responsive correct/wrong samples start promptly and retain their audible portion',async()=>{
 let starts:{at:number;duration:number}[]=[];let fades:number[]=[];let storage=new Map<string,string>();
 class Source {buffer:unknown;onended:()=>void=()=>{};frequency={value:0};type='sine';connect(){}disconnect(){}start(at:number,_offset?:number,duration?:number){starts.push({at,duration:duration??0});}stop(){}}
 class Gain {gain={value:1,setValueAtTime(_value:number,at:number){fades.push(at);},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}};connect(){}disconnect(){}}
 class Context {state='running';currentTime=4;destination={};createGain(){return new Gain();}createBufferSource(){return new Source();}createOscillator(){return new Source();}resume(){return Promise.resolve();}decodeAudioData(){return Promise.resolve({duration:1.1,numberOfChannels:1,getChannelData(){return new Float32Array([.25,-.25]);}});}}
 Object.assign(globalThis,{window:{AudioContext:Context},localStorage:{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v)},fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)})});
 const {SharedGameAudio}=await import('./src/games/stage2/audio');const a=new SharedGameAudio(true);await a.preload();a.play('right');a.play('wrong');
 assert.deepEqual(starts,[{at:4.005,duration:.8},{at:4.005,duration:.8}]);assert.ok(fades.some(t=>t>4.7));a.stop();
});
