import React, { useEffect, useState } from 'react';
import { Music2 } from 'lucide-react';
import { backgroundMusic } from '../../services/BackgroundMusic';
export const MusicControl: React.FC = () => {
  const [state, setState] = useState(backgroundMusic.state());
  useEffect(() => backgroundMusic.subscribe(() => setState(backgroundMusic.state())), []);
  return <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-700 text-xs">
    <button type="button" aria-pressed={state.enabled} onClick={() => backgroundMusic.toggle()} className="flex items-center gap-1.5 font-bold whitespace-nowrap" title="Bật hoặc tắt nhạc nền">
      <Music2 className="w-4 h-4" />{state.enabled ? (state.playing ? 'Nhạc đang phát' : 'Nhạc nền bật') : 'Nhạc nền tắt'}
    </button>
    <input type="range" min="0" max="1" step="0.05" value={state.volume} onChange={e => backgroundMusic.setVolume(Number(e.target.value))} aria-label="Âm lượng nhạc nền" className="w-16 accent-sky-600" />
  </div>;
};
