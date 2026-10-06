// Original instrumental loop: bright bell melody, plucked chords and soft bass.
class BackgroundMusic {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private buffer: AudioBuffer | null = null;
  private sceneAllowed = true;
  private soundAllowed = true;
  private unlocked = false;
  private enabled = true;
  private volume = .22;
  private listeners = new Set<() => void>();
  constructor() {
    try { this.enabled = localStorage.getItem('cham_music_enabled') !== 'false';
      const saved = localStorage.getItem('cham_music_volume');
      if (saved !== null && Number.isFinite(Number(saved))) this.volume = Math.max(0, Math.min(1, Number(saved)));
    } catch {}
  }
  state = () => ({ playing: !!this.source, enabled: this.enabled, volume: this.volume });
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private notify() { this.listeners.forEach(listener => listener()); }
  setScene(allowed: boolean, soundAllowed: boolean) {
    this.sceneAllowed = allowed; this.soundAllowed = soundAllowed;
    if (!allowed || !soundAllowed) this.stop(); else if (this.unlocked) void this.play();
  }
  async unlock() { this.unlocked = true; await this.play(); }
  toggle() {
    this.enabled = !this.enabled;
    try { localStorage.setItem('cham_music_enabled', String(this.enabled)); } catch {}
    if (this.enabled) void this.unlock(); else this.stop();
    this.notify();
  }
  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.gain && this.context) this.gain.gain.setTargetAtTime(this.volume * .4, this.context.currentTime, .05);
    try { localStorage.setItem('cham_music_volume', String(this.volume)); } catch {}
    this.notify();
  }
  private makeScore(context: AudioContext) {
    const rate = 22050, beat = 60 / 114;
    const buffer = context.createBuffer(1, Math.ceil(32 * beat * rate), rate);
    const samples = buffer.getChannelData(0);
    const note = (midi: number, start: number, duration: number, level: number, bell = false) => {
      const frequency = 440 * 2 ** ((midi - 69) / 12);
      const offset = Math.round(start * rate), count = Math.round(duration * rate);
      for (let i = 0; i < count && offset + i < samples.length; i++) {
        const t = i / rate;
        const envelope = Math.min(1, t / .008) * Math.exp(-t * (bell ? 6 : 3)) * Math.min(1, (duration - t) / .03);
        const phase = 2 * Math.PI * frequency * t;
        samples[offset + i] += level * envelope * (Math.sin(phase) + (bell ? .28 * Math.sin(phase * 2) + .1 * Math.sin(phase * 3) : .14 * Math.sin(phase * 2)));
      }
    };
    const melody = [72,76,79,76,74,72,76,79, 81,79,76,72,76,79,81,79,
      77,81,84,81,79,77,76,72, 74,79,83,79,77,76,74,71,
      72,76,79,84,83,79,76,79, 81,79,77,76,77,81,79,77,
      79,83,86,83,81,79,77,74, 76,79,84,79,76,74,72,72];
    melody.forEach((midi, i) => note(midi, (i / 2 + (i % 2 ? .035 : 0)) * beat, beat * .7, .2, true));
    const chords = [[48,60,64,67],[45,57,60,64],[41,53,57,60],[43,55,59,62],
      [48,60,64,67],[41,53,57,60],[43,55,59,62],[48,60,64,67]];
    chords.forEach((chord, bar) => {
      for (let pulse = 0; pulse < 4; pulse++) {
        note(chord[0] + (pulse % 2 ? 12 : 0), (bar * 4 + pulse) * beat, beat * .8, .16);
        chord.slice(1).forEach((midi, index) => note(midi, (bar * 4 + pulse + .5 + index * .025) * beat, beat * .4, .065));
      }
    });
    return buffer;
  }
  private async play() {
    if (!this.unlocked || !this.enabled || !this.sceneAllowed || !this.soundAllowed || document.hidden || this.source) return;
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      this.context ||= new AudioClass();
      const context = this.context!;
      if (context.state === 'suspended') await context.resume();
      // Recheck after resume: a lesson may have opened in the meantime.
      if (!this.enabled || !this.sceneAllowed || !this.soundAllowed || document.hidden || this.source) return;
      this.buffer ||= this.makeScore(context);
      this.gain = context.createGain(); this.gain.gain.value = this.volume * .4;
      this.source = context.createBufferSource(); this.source.buffer = this.buffer; this.source.loop = true;
      this.source.connect(this.gain); this.gain.connect(context.destination); this.source.start(); this.notify();
    } catch { this.stop(); }
  }
  stop() {
    if (this.source) { try { this.source.stop(); } catch {} this.source.disconnect(); this.source = null; }
    this.gain?.disconnect(); this.gain = null; this.notify();
  }
  refreshVisibility() { if (document.hidden) this.stop(); else if (this.unlocked) void this.play(); }
}
export const backgroundMusic = new BackgroundMusic();
