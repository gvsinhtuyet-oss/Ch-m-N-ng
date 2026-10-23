// Audio & Sound Effects Engine (Web Audio API + SpeechSynthesis)
import { backgroundMusic } from './BackgroundMusic';

export type NarrationState = 'idle' | 'playing' | 'paused';
export type NarrationError = 'muted' | 'unsupported' | 'voice-unavailable' | 'playback-failed';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private effectsGain: GainNode | null = null;
  private soundEnabled: boolean = true;
  private effectsVolume: number = 0.8;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private stateChangeListeners: Set<(state: NarrationState) => void> = new Set();
  private currentState: NarrationState = 'idle';
  private narrationGeneration = 0;
  private clearPendingNarration: (() => void) | null = null;

  constructor() {
    // Server-rendered lesson previews have no browser storage.
    if (typeof localStorage === 'undefined') return;
    const saved = localStorage.getItem('cham_danang_sound_enabled');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    }
    const savedVolume = localStorage.getItem('cham_danang_effects_volume');
    if (savedVolume !== null && Number.isFinite(Number(savedVolume))) {
      this.effectsVolume = Math.max(0, Math.min(1, Number(savedVolume)));
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.effectsGain = this.audioCtx.createGain();
        this.effectsGain.gain.value = this.effectsVolume;
        this.effectsGain.connect(this.audioCtx.destination);
      }
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('cham_danang_sound_enabled', String(this.soundEnabled));
    if (!this.soundEnabled) this.stopNarration();
    return this.soundEnabled;
  }

  public getEffectsVolume(): number {
    return this.effectsVolume;
  }

  public setEffectsVolume(value: number) {
    this.effectsVolume = Math.max(0, Math.min(1, value));
    if (this.effectsGain) this.effectsGain.gain.value = this.effectsVolume;
    try { localStorage.setItem('cham_danang_effects_volume', String(this.effectsVolume)); } catch {}
  }

  public subscribeState(listener: (state: NarrationState) => void): () => void {
    this.stateChangeListeners.add(listener);
    listener(this.currentState);
    return () => this.stateChangeListeners.delete(listener);
  }

  private notifyState(state: NarrationState) {
    this.currentState = state;
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(state);
      } catch (err) {
        console.warn('Audio state listener error:', err);
      }
    });
  }

  // Play procedural sound effects using Web Audio API
  public playSfx(type: 'click' | 'correct' | 'wrong' | 'unlock' | 'reward' | 'stamp' | 'victory' | 'transition' | 'map' | 'treasure') {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === 'click') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(this.effectsGain || this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'transition') {
        // Soft airy chime/whoosh between hotspots
        [440, 587.33, 880].forEach((freq, i) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.08, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(this.effectsGain || this.audioCtx!.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.2);
        });
      } else if (type === 'correct') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.15, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);
          osc.connect(gain);
          gain.connect(this.effectsGain || this.audioCtx!.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.18);
        });
      } else if (type === 'wrong') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.22);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.effectsGain || this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'reward' || type === 'unlock') {
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.09);
          gain.gain.setValueAtTime(0.18, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.25);
          osc.connect(gain);
          gain.connect(this.effectsGain || this.audioCtx!.destination);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.25);
        });
      } else if (type === 'stamp') {
        // Deep satisfying thud + resonance
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.28);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.effectsGain || this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.2, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
          osc.connect(gain);
          gain.connect(this.effectsGain || this.audioCtx!.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      } else if (type === 'map') {
        [392, 523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.16, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(this.effectsGain || this.audioCtx!.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      } else if (type === 'treasure') {
        [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();
          osc.type = idx < 3 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.18, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.42);
          osc.connect(gain);
          gain.connect(this.effectsGain || this.audioCtx!.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.42);
        });
      }
    } catch {
      // AudioContext policy silently catches if blocked before user gesture
    }
  }

  // Only a matching language voice may read the reviewed text. Failure is not completion.
  public speakNarration(text: string, lang: 'vi-VN' | 'en-US' = 'vi-VN', onEnd?: () => void, onError?: (reason:NarrationError)=>void) {
    this.stopNarration();
    const generation=this.narrationGeneration;
    const fail=(reason:NarrationError)=>{
      if(generation!==this.narrationGeneration)return;
      this.currentUtterance=null;
      backgroundMusic.setForegroundSource('narration',false);
      this.notifyState('idle');
      onError?.(reason);
    };
    if(!this.soundEnabled){fail('muted');return;}
    if(typeof window==='undefined'||!('speechSynthesis' in window)||!text.trim()){fail('unsupported');return;}
    const synth=window.speechSynthesis;
    const speakNow=()=>{
      if(generation!==this.narrationGeneration)return;
      this.clearPendingNarration?.();this.clearPendingNarration=null;
      try{
        const prefix=lang.split('-')[0].toLowerCase();
        const voices=synth.getVoices();
        const voice=voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().split(/[-_]/)[0]===prefix);
        if(!voice){fail('voice-unavailable');return;}
        const utterance=new SpeechSynthesisUtterance(text.trim());
        utterance.lang=lang;utterance.voice=voice;utterance.rate=0.92;utterance.pitch=1.03;utterance.volume=this.effectsVolume;
        const active=()=>generation===this.narrationGeneration&&this.currentUtterance===utterance;
        utterance.onstart=()=>{if(!active())return;backgroundMusic.setForegroundSource('narration',true);this.notifyState('playing');};
        utterance.onpause=()=>{if(active())this.notifyState('paused');};
        utterance.onresume=()=>{if(!active())return;backgroundMusic.setForegroundSource('narration',true);this.notifyState('playing');};
        utterance.onend=()=>{if(!active())return;this.currentUtterance=null;backgroundMusic.setForegroundSource('narration',false);this.notifyState('idle');onEnd?.();};
        utterance.onerror=()=>{if(active())fail('playback-failed');};
        this.currentUtterance=utterance;
        try{synth.resume();}catch{}
        backgroundMusic.setForegroundSource('narration',true);
        synth.speak(utterance);
      }catch{fail('playback-failed');}
    };
    // A generation and cancellable listeners prevent an old request from starting after navigation.
    const hasMatchingVoice=()=>synth.getVoices().some(v=>v.lang.toLowerCase().split(/[-_]/)[0]===lang.split('-')[0]);
    if(!hasMatchingVoice()){
      let timer:number;
      const begin=()=>{if(hasMatchingVoice())speakNow();};
      timer=window.setTimeout(speakNow,1000);
      synth.addEventListener('voiceschanged',begin);
      this.clearPendingNarration=()=>{window.clearTimeout(timer);synth.removeEventListener('voiceschanged',begin);};
    }else{
      const timer=window.setTimeout(speakNow,60);
      this.clearPendingNarration=()=>window.clearTimeout(timer);
    }
  }

  public pauseNarration() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      backgroundMusic.setForegroundSource('narration', false);
      this.notifyState('paused');
    }
  }

  public resumeNarration() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.notifyState('playing');
    }
  }

  public stopNarration() {
    this.narrationGeneration++;
    this.clearPendingNarration?.();this.clearPendingNarration=null;
    this.currentUtterance=null;
    if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();
    backgroundMusic.setForegroundSource('narration',false);
    this.notifyState('idle');
  }

  public getNarrationState(): NarrationState {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) return 'paused';
      if (window.speechSynthesis.speaking) return 'playing';
    }
    return 'idle';
  }

  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
    }
    return false;
  }
}

export const audioService = new AudioService();
