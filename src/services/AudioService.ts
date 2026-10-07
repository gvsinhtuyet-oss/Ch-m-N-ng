// Audio & Sound Effects Engine (Web Audio API + SpeechSynthesis)
import { backgroundMusic } from './BackgroundMusic';

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
  public playSfx(type: 'click' | 'correct' | 'wrong' | 'unlock' | 'reward' | 'stamp' | 'victory' | 'transition' | 'map' | 'treasure') {
    if (!this.soundEnabled) return;
    const muteDurations: Record<typeof type, number> = {
      click: 180,
      correct: 700,
      wrong: 450,
      unlock: 850,
      reward: 850,
      stamp: 650,
      victory: 1400,
      transition: 650,
      map: 900,
      treasure: 1700,
    };
    backgroundMusic.muteFor(muteDurations[type]);
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
      } else if (type === 'map') {
        [392, 523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.16, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(this.audioCtx!.destination);
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
          gain.connect(this.audioCtx!.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.42);
        });
      }
    } catch {
      // AudioContext policy silently catches if blocked before user gesture
    }
  }

  // TTS Narration with browser SpeechSynthesis
  public speakNarration(text: string, lang: 'vi-VN' | 'en-US' = 'vi-VN', onEnd?: () => void) {
    if (!this.soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) {
      this.notifyState('idle');
      if (onEnd) onEnd();
      return;
    }

    const synth = window.speechSynthesis;
    this.stopNarration();

    const speakNow = () => {
      try {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = lang;
        utterance.rate = 0.92;
        utterance.pitch = 1.03;
        utterance.volume = 1;

        const voices = synth.getVoices();
        const langPrefix = lang.split('-')[0].toLowerCase();
        const targetVoice =
          voices.find(v => v.lang.toLowerCase() === lang.toLowerCase()) ||
          voices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) ||
          voices.find(v => /vietnam|tiếng việt|viet/i.test(v.name));

        if (targetVoice) utterance.voice = targetVoice;

        utterance.onstart = () => {
          backgroundMusic.setForegroundSource('narration', true);
          this.notifyState('playing');
        };

        utterance.onpause = () => this.notifyState('paused');

        utterance.onresume = () => {
          backgroundMusic.setForegroundSource('narration', true);
          this.notifyState('playing');
        };

        utterance.onend = () => {
          this.currentUtterance = null;
          backgroundMusic.setForegroundSource('narration', false);
          this.notifyState('idle');
          if (onEnd) onEnd();
        };

        utterance.onerror = (event) => {
          console.warn('Speech synthesis error:', event.error);
          this.currentUtterance = null;
          backgroundMusic.setForegroundSource('narration', false);
          this.notifyState('idle');
          if (onEnd) onEnd();
        };

        this.currentUtterance = utterance;
        // Chromium-based browsers can occasionally remain paused from a previous
        // utterance. Resume first, then speak after cancel has fully settled.
        try { synth.resume(); } catch {}
        backgroundMusic.setForegroundSource('narration', true);
        synth.speak(utterance);
      } catch (error) {
        console.warn('Speech synthesis failed:', error);
        backgroundMusic.setForegroundSource('narration', false);
        this.notifyState('idle');
        if (onEnd) onEnd();
      }
    };

    // Some Chromium builds populate voices asynchronously. Wait briefly for
    // voiceschanged, but always fall back so narration never becomes a dead button.
    if (synth.getVoices().length === 0) {
      let spoken = false;
      const begin = () => {
        if (spoken) return;
        spoken = true;
        synth.removeEventListener('voiceschanged', begin);
        window.clearTimeout(fallbackTimer);
        speakNow();
      };
      const fallbackTimer = window.setTimeout(begin, 180);
      synth.addEventListener('voiceschanged', begin, { once: true });
      return;
    }

    // A short delay after cancel fixes silent first-play issues in Chrome/Cốc Cốc.
    window.setTimeout(speakNow, 60);
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const wasActive = this.currentUtterance !== null || window.speechSynthesis.speaking || window.speechSynthesis.paused;
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      if (wasActive) backgroundMusic.setForegroundSource('narration', false);
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
