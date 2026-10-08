const BACKGROUND_MUSIC_URL = '/audio/cham-danang-background.mp3';

class BackgroundMusic {
  private audio: HTMLAudioElement | null = null;
  private sceneAllowed = true;
  private unlocked = false;
  private enabled = true;
  private volume = .28;
  private foregroundLocks = 0;
  private foregroundSources = new Set<string>();
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
    audio.preload = 'auto';
    audio.volume = this.volume;
    audio.addEventListener('play', () => this.notify());
    audio.addEventListener('pause', () => this.notify());
    audio.addEventListener('ended', () => {
      // loop=true is the primary behavior; this is a defensive fallback.
      if (this.canPlay()) {
        audio.currentTime = 0;
        void audio.play().catch(() => this.notify());
      }
      this.notify();
    });
    audio.addEventListener('error', () => this.notify());
    this.audio = audio;
  }

  state = () => ({
    playing: !!this.audio && !this.audio.paused,
    enabled: this.enabled,
    volume: this.volume,
    ducked: this.foregroundLocks > 0 || this.foregroundSources.size > 0,
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
      !document.hidden;
  }

  private effectiveVolume() {
    const hasForegroundAudio = this.foregroundLocks > 0 || this.foregroundSources.size > 0;
    return this.volume * (hasForegroundAudio ? 0.24 : 1);
  }

  private applyVolume() {
    if (this.audio) this.audio.volume = this.effectiveVolume();
    this.notify();
  }

  setScene(allowed: boolean) {
    this.sceneAllowed = allowed;
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
    this.applyVolume();
    try { localStorage.setItem('cham_music_volume', String(this.volume)); } catch {}
    this.notify();
  }

  async play() {
    if (!this.canPlay()) return;
    try {
      this.ensureAudio();
      if (!this.audio || !this.audio.paused) return;
      this.audio.volume = this.effectiveVolume();
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
    this.foregroundLocks += 1;
    this.applyVolume();
  }

  setForegroundSource(sourceId: string, active: boolean) {
    if (!sourceId) return;
    if (active) this.foregroundSources.add(sourceId);
    else this.foregroundSources.delete(sourceId);
    this.applyVolume();
    if (this.canPlay()) void this.play();
  }

  endForegroundAudio() {
    this.foregroundLocks = Math.max(0, this.foregroundLocks - 1);
    this.applyVolume();
    if (this.canPlay()) void this.play();
  }

  stop() {
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
