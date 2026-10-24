import React from 'react';
import { useApp } from '../../contexts/AppContext';

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="mt-auto px-3 py-1.5 text-center text-[9px] font-medium text-slate-500 sm:px-4 sm:text-[10px]">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        <span className="font-black tracking-tight text-slate-700">CHẠM ĐÀ NẴNG</span>
        <span className="text-slate-400">© 2026</span>
        <span className="hidden text-slate-300 sm:inline">•</span>
        <span>
          <span className="text-slate-400">Người phát triển: </span>
          <span className="font-semibold text-slate-600">{t.authors}</span>
        </span>
      </div>
    </footer>
  );
};
