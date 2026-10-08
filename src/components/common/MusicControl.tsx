import React, { useEffect, useRef, useState } from 'react';
import { Music2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { audioService } from '../../services/AudioService';
import { useApp } from '../../contexts/AppContext';

export const MusicControl: React.FC = () => {
  const { soundEnabled, toggleSound } = useApp();
  const [musicState, setMusicState] = useState(backgroundMusic.state());
  const [effectsVolume, setEffectsVolume] = useState(audioService.getEffectsVolume());
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => backgroundMusic.subscribe(() => setMusicState(backgroundMusic.state())), []);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const musicPercent = Math.round(musicState.volume * 100);
  const effectsPercent = Math.round(effectsVolume * 100);
  const anySound = musicState.enabled || soundEnabled;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-700 shadow-sm transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300"
        title="Điều chỉnh âm thanh"
        aria-label="Điều chỉnh âm thanh"
        aria-expanded={open}
      >
        {anySound ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5 text-slate-400" />}
        <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
          anySound ? 'bg-emerald-500' : 'bg-slate-300'
        }`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[70] w-72 rounded-2xl border border-orange-100 bg-white p-3.5 shadow-2xl">
          <div className="mb-3">
            <p className="text-sm font-extrabold text-slate-900">Âm thanh</p>
            <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
              Nhạc nền và hiệu ứng hoạt động độc lập.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Music2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-slate-800">Nhạc nền</p>
                    <p className="text-[10px] text-slate-500">Phát xuyên suốt hành trình</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => backgroundMusic.toggle()}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black transition ${
                    musicState.enabled ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {musicState.enabled ? 'BẬT' : 'TẮT'}
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicState.volume}
                  onChange={event => backgroundMusic.setVolume(Number(event.target.value))}
                  disabled={!musicState.enabled}
                  aria-label="Âm lượng nhạc nền"
                  className="w-full cursor-pointer accent-orange-500 disabled:cursor-not-allowed"
                />
                <span className="w-9 text-right text-[10px] font-black text-orange-700">{musicPercent}%</span>
              </div>
              <p className="mt-2 text-[9px] leading-4 text-slate-500">
                Khi có thuyết minh hoặc video, nhạc chỉ tự giảm nhẹ chứ không dừng.
              </p>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-slate-800">Âm thanh hiệu ứng</p>
                    <p className="text-[10px] text-slate-500">Đúng/sai, mở khóa, thuyết minh</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black transition ${
                    soundEnabled ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {soundEnabled ? 'BẬT' : 'TẮT'}
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={effectsVolume}
                  onChange={event => {
                    const value = Number(event.target.value);
                    setEffectsVolume(value);
                    audioService.setEffectsVolume(value);
                  }}
                  disabled={!soundEnabled}
                  aria-label="Âm lượng âm thanh hiệu ứng"
                  className="w-full cursor-pointer accent-sky-600 disabled:cursor-not-allowed"
                />
                <span className="w-9 text-right text-[10px] font-black text-sky-700">{effectsPercent}%</span>
              </div>
              <p className="mt-2 text-[9px] leading-4 text-slate-500">
                Hiệu ứng ngắn phát chồng lên nhạc nền; nhạc nền không bị ngắt.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
