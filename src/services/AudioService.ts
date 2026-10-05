// Audio & Sound Effects Engine (Web Audio API + SpeechSynthesis)

export type NarrationState = 'idle' | 'playing' | 'paused';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private stateChangeListeners: Set<(state: NarrationState) => void> = new Set();
  private currentState: NarrationState = 'idle';

  constructor() {
    const saved = localStorage.getItem('cham_danang_sound_enabled');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('cham_danang_sound_enabled', String(this.soundEnabled));
    if (!this.soundEnabled) {
      this.stopNarration();
    }
    return this.soundEnabled;
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
  public playSfx(type: 'click' | 'correct' | 'wrong' | 'unlock' | 'reward' | 'stamp' | 'victory' | 'transition') {
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
        gain.connect(this.audioCtx.destination);
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
          gain.connect(this.audioCtx!.destination);
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
          gain.connect(this.audioCtx!.destination);
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
        gain.connect(this.audioCtx.destination);
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
          gain.connect(this.audioCtx!.destination);
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
        gain.connect(this.audioCtx.destination);
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
          gain.connect(this.audioCtx!.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      }
    } catch {
      // AudioContext policy silently catches if blocked before user gesture
    }
  }

  // TTS Narration with browser SpeechSynthesis
  public speakNarration(text: string, lang: 'vi-VN' | 'en-US' = 'vi-VN', onEnd?: () => void) {
    if (!this.soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.notifyState('idle');
      if (onEnd) onEnd();
      return;
    }

    this.stopNarration();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95; // Slightly slower for primary students
      utterance.pitch = 1.05;

      // Find suitable Vietnamese voice if available
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      utterance.onstart = () => {
        this.notifyState('playing');
      };

      utterance.onpause = () => {
        this.notifyState('paused');
      };

      utterance.onresume = () => {
        this.notifyState('playing');
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        this.notifyState('idle');
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        this.notifyState('idle');
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.notifyState('idle');
      if (onEnd) onEnd();
    }
  }

  public pauseNarration() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      this.notifyState('idle');
    }
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
