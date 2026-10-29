import React from 'react';
import { Pause, Play, Volume2 } from 'lucide-react';
import type { NarrationState } from '../../services/AudioService';

export function NarrationButton({ state, onClick }: { state: NarrationState; onClick: () => void }) {
  const Icon = state === 'playing' ? Pause : state === 'paused' ? Play : Volume2;
  return <button type="button" data-stage1-narration onClick={onClick}
    className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-2xl border border-white/70 bg-gradient-to-b from-sky-500 to-sky-700 px-4 py-2 text-sm font-bold text-white shadow-[0_3px_0_#075985,0_5px_12px_#0284c733] transition hover:brightness-110 active:translate-y-0.5 active:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700">
    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
    {state === 'playing' ? 'Tạm dừng' : state === 'paused' ? 'Tiếp tục' : 'Nghe thuyết minh'}
  </button>;
}
