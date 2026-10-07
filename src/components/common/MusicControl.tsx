import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { useApp } from '../../contexts/AppContext';

export const MusicControl: React.FC = () => {
  const { soundEnabled, toggleSound } = useApp();
  const [musicState, setMusicState] = useState(backgroundMusic.state());
  const [open, setOpen] = useState(false);

  useEffect(() => backgroundMusic.subscribe(() => setMusicState(backgroundMusic.state())), []);

  const handleMasterToggle = () => {
    const willEnable = !soundEnabled;
    toggleSound();

    // Một nút duy nhất điều khiển âm thanh chung.
    // Khi bật lại âm thanh, đảm bảo nhạc nền cũng được bật và thử phát lại
    // sau thao tác người dùng để tránh chính sách chặn autoplay của trình duyệt.
    if (willEnable) {
      if (!musicState.enabled) backgroundMusic.toggle();
      else void backgroundMusic.unlock();
    }
  };

  const percent = Math.round(musicState.volume * 100);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
        title="Điều chỉnh âm thanh"
        aria-label="Điều chỉnh âm thanh"
        aria-expanded={open}
      >
        {soundEnabled ? (
          <Volume2 className="h-4.5 w-4.5 text-sky-600" />
        ) : (
          <VolumeX className="h-4.5 w-4.5 text-slate-400" />
        )}
        <span
          className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
            soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[70] w-64 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-slate-800">Âm thanh</p>
              <p className="text-[11px] text-slate-500">
                {soundEnabled ? 'Đang bật' : 'Đang tắt'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleMasterToggle}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                soundEnabled
                  ? 'bg-sky-600 text-white hover:bg-sky-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            </button>
          </div>

          <div className={`rounded-xl bg-slate-50 p-3 transition ${
            soundEnabled ? '' : 'opacity-50'
          }`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Nhạc nền</span>
              <span className="text-[11px] font-bold text-sky-700">{percent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicState.volume}
              onChange={event => backgroundMusic.setVolume(Number(event.target.value))}
              disabled={!soundEnabled}
              aria-label="Âm lượng nhạc nền"
              className="w-full cursor-pointer accent-sky-600 disabled:cursor-not-allowed"
            />
            <p className="mt-2 text-[10px] leading-4 text-slate-500">
              Nhạc nền sẽ tự tạm dừng khi có thuyết minh, video hoặc hiệu ứng âm thanh khác.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
