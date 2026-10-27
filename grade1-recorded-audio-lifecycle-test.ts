import {test} from 'node:test';import assert from 'node:assert/strict';
Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null,setItem:()=>{}},configurable:true});
Object.defineProperty(globalThis,'window',{value:{},configurable:true});
class Player { static last:Player; paused=true; ended=false; src:string; onplaying?:()=>void; onpause?:()=>void; onended?:()=>void; onerror?:()=>void; volume=1; preload=''; constructor(src:string){this.src=src;Player.last=this;} play(){this.paused=false;this.onplaying?.();return Promise.resolve();} pause(){this.paused=true;this.onpause?.();} removeAttribute(){this.src='';} load(){} }
Object.defineProperty(globalThis,'Audio',{value:Player,configurable:true});
const {audioService}=await import('./src/services/AudioService');
test('recorded audio play pause resume complete and stale completion',async()=>{
 let completed=0;audioService.playRecordedNarration('/a.mp3',()=>completed++);const first=Player.last;assert.equal(audioService.getNarrationState(),'playing');audioService.pauseNarration();assert.equal(audioService.getNarrationState(),'paused');audioService.resumeNarration();assert.equal(audioService.getNarrationState(),'playing');audioService.playRecordedNarration('/b.mp3',()=>completed++);first.onended?.();assert.equal(completed,0);Player.last.onended?.();assert.equal(completed,1);assert.equal(audioService.getNarrationState(),'idle');
});
