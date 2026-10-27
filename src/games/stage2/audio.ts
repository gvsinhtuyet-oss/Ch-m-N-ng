import { patterns } from './audioPatterns';
export type GameSound = 'tap'|'select'|'confirm'|'connect'|'next'|'retry'|'key'|'right'|'wrong'|'victory'|'unlock';
const storageKey = 'cham_danang_sound_enabled';
const samples: Partial<Record<GameSound,string>> = {right:'/games/shared/v1/approved-3.mp3',wrong:'/games/shared/v1/approved-4.mp3',victory:'/games/shared/v1/approved-2.mp3'};
/** One owner, context, gain and serialized timeline. No document-wide click listeners. */
export class SharedGameAudio {
  private ctx: AudioContext|null = null;
  private master: GainNode|null = null;
  private sources = new Set<AudioScheduledSourceNode>();
  private buffers = new Map<string,AudioBuffer>();
  private levels = new Map<string,number>();
  private nextAt = 0;
  private muted = false;
  constructor(private readonly responsive=false) { try {this.muted=localStorage.getItem(storageKey)==='false';} catch {} }
  isMuted = () => this.muted;
  /** Synchronize the shared preference when switching between approved and preview games. */
  syncPreference = () => {
    try {const value=localStorage.getItem(storageKey);if(value!==null){this.muted=value==='false';if(this.muted)this.stop();if(this.master)this.master.gain.value=this.muted?0:0.65;}} catch {}
    return this.muted;
  };
  unlock = () => {
    try {
      const AC=window.AudioContext || (window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;
      if(!AC) return;
      if(!this.ctx) {this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:0.65;this.master.connect(this.ctx.destination);}
      if(this.ctx.state==='suspended') void this.ctx.resume().catch(()=>{});
    } catch { /* Unsupported audio remains playable without sound. */ }
  };
  async preload() {
    this.unlock();
    const ctx=this.ctx;if(!ctx) return;
    await Promise.all(Object.entries(samples).map(async ([name,url])=>{
      try {const response=await fetch(url);if(!response.ok)return;const buffer=await ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(name,buffer);let peak=0;for(let ch=0;ch<buffer.numberOfChannels;ch++){const data=buffer.getChannelData(ch);for(let i=0;i<data.length;i++)peak=Math.max(peak,Math.abs(data[i]));}this.levels.set(name,peak?Math.min(1,0.28/peak):0.28);} catch { /* Offline synthesis below. */ }
    }));
  }
  setMuted(value:boolean) {
    this.muted=value;
    try {localStorage.setItem(storageKey,String(!value));} catch {}
    if(value) this.stop();
    if(this.master) this.master.gain.value=value?0:0.65;
    if(!value) this.unlock();
  }
  stop = () => { for(const source of this.sources) {try{source.stop();}catch{}} this.sources.clear();this.nextAt=0; };
  private track(source:AudioScheduledSourceNode,gain:GainNode) {this.sources.add(source);source.onended=()=>{this.sources.delete(source);source.disconnect();gain.disconnect();};}
  play = (name:GameSound) => {
    if(this.muted) return;
    this.unlock();const c=this.ctx,master=this.master;if(!c||!master)return;
    // Preview grade 4/5: the latest action must never wait behind earlier taps.
    if(this.responsive)this.stop();
    const start=this.responsive?c.currentTime+.005:Math.max(c.currentTime+.005,this.nextAt);
    const buffer=this.buffers.get(name);
    if(buffer) {
      const source=c.createBufferSource();source.buffer=buffer;
      const gain=c.createGain();gain.gain.value=this.levels.get(name)??0.28;source.connect(gain);gain.connect(master);
      // Short cues never delay the next question; preserve the full approved victory music.
      const duration=name==='victory'?buffer.duration:Math.min(buffer.duration,this.responsive?.8:.42);
      gain.gain.setValueAtTime(gain.gain.value,start);if(this.responsive)gain.gain.setValueAtTime(gain.gain.value,start+Math.max(0,duration-.04));gain.gain.linearRampToValueAtTime(0,start+duration);
      this.track(source,gain);source.start(start,0,duration);this.nextAt=start+duration+.02;return;
    }
    const p=patterns[name==='unlock'?'next':name]||patterns.tap;
    for(const [freq,offset,duration,type,volume] of p) {
      const osc=c.createOscillator(),gain=c.createGain();osc.type=type;osc.frequency.value=freq;
      const t=start+offset;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(this.responsive?Math.min(volume*3.5,.2):volume,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
      osc.connect(gain);gain.connect(master);this.track(osc,gain);osc.start(t);osc.stop(t+duration+.015);
    }
    this.nextAt=start+Math.max(...p.map(n=>n[1]+n[2]))+.02;
  };
}
export const sharedGameAudio = new SharedGameAudio();
export const responsiveSharedGameAudio = new SharedGameAudio(true);
