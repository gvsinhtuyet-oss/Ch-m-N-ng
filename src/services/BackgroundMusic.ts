const BACKGROUND_MUSIC_URL =
  'https://drive.google.com/uc?export=download&id=10gje9w4Mjz2wNRXFG8iDt2UcZ6eVxwT0';

class BackgroundMusic {
  private audio: HTMLAudioElement | null = null;
  private sceneAllowed = true;
  private soundAllowed = true;
  private unlocked = false;
  private enabled = true;
  private volume = .35;
  private foregroundLocks = 0;
  private foregroundSources = new Set<string>();
  private resumeTimer: number | null = null;
  private listeners = new Set<() => void>();

  constructor() {
    try {
      this.enabled = localStorage.getItem('cham_music_enabled') !== 'false';
      const saved = localStorage.getItem('cham_music_volume');
      if (saved !== null && Number.isFinite(Number(saved))) {
        this.volume = Math.max(0, Math.min(1, Number(saved)));
      }
    } catch {}
  }

  private ensureAudio() {
    if (this.audio || typeof window === 'undefined') return;
    const audio = new Audio(BACKGROUND_MUSIC_URL);
    audio.loop = true;
    audio.preload = 'metadata';
    audio.volume = this.volume;
    audio.addEventListener('play', () => this.notify());
    audio.addEventListener('pause', () => this.notify());
    audio.addEventListener('ended', () => this.notify());
    audio.addEventListener('error', () => this.notify());
    this.audio = audio;
  }

  state = () => ({
    playing: !!this.audio && !this.audio.paused,
    enabled: this.enabled,
    volume: this.volume,
  });

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  private canPlay() {
    return this.unlocked &&
      this.enabled &&
      this.sceneAllowed &&
      this.soundAllowed &&
      this.foregroundLocks === 0 &&
      this.foregroundSources.size === 0 &&
      !document.hidden;
  }

  setScene(allowed: boolean, soundAllowed: boolean) {
    this.sceneAllowed = allowed;
    this.soundAllowed = soundAllowed;
    if (!this.canPlay()) this.pause();
    else void this.play();
  }

  async unlock() {
    this.unlocked = true;
    await this.play();
  }

  toggle() {
    this.enabled = !this.enabled;
    try { localStorage.setItem('cham_music_enabled', String(this.enabled)); } catch {}
    if (this.enabled) void this.unlock();
    else this.pause();
    this.notify();
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.audio) this.audio.volume = this.volume;
    try { localStorage.setItem('cham_music_volume', String(this.volume)); } catch {}
    this.notify();
  }

  async play() {
    if (!this.canPlay()) return;
    try {
      this.ensureAudio();
      if (!this.audio || !this.audio.paused) return;
      this.audio.volume = this.volume;
      await this.audio.play();
    } catch {
      // Trình duyệt có thể chặn autoplay; lần chạm tiếp theo sẽ thử lại.
      this.notify();
    }
  }

  private pause() {
    if (this.audio && !this.audio.paused) this.audio.pause();
    this.notify();
  }

  beginForegroundAudio() {
    if (this.resumeTimer !== null) {
      window.clearTimeout(this.resumeTimer);
      this.resumeTimer = null;
    }
    this.foregroundLocks += 1;
    this.pause();
  }

  setForegroundSource(sourceId: string, active: boolean) {
    if (!sourceId) return;
    if (active) {
      this.foregroundSources.add(sourceId);
      this.pause();
      return;
    }
    this.foregroundSources.delete(sourceId);
    if (this.canPlay()) void this.play();
  }

  endForegroundAudio() {
    this.foregroundLocks = Math.max(0, this.foregroundLocks - 1);
    if (this.foregroundLocks === 0 && this.canPlay()) void this.play();
  }

  muteFor(durationMs: number) {
    if (this.resumeTimer === null) {
      this.beginForegroundAudio();
    } else {
      window.clearTimeout(this.resumeTimer);
    }
    this.resumeTimer = window.setTimeout(() => {
      this.resumeTimer = null;
      this.endForegroundAudio();
    }, Math.max(80, durationMs));
  }

  stop() {
    if (this.resumeTimer !== null) {
      window.clearTimeout(this.resumeTimer);
      this.resumeTimer = null;
    }
    this.foregroundLocks = 0;
    this.foregroundSources.clear();
    this.pause();
    if (this.audio) {
      this.audio.currentTime = 0;
    }
  }

  refreshVisibility() {
    if (document.hidden) this.pause();
    else if (this.canPlay()) void this.play();
  }
}

export const backgroundMusic = new BackgroundMusic();
