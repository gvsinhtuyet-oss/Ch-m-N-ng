import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Award, Compass, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/80 backdrop-blur-xs py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-[10px]">
            CĐN
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight">CHẠM ĐÀ NẴNG</span>
          <span className="text-slate-300">© 2026</span>
        </div>

        {/* Units and authors */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px]">
          <div>
            <span className="text-slate-400">Đơn vị thực hiện: </span>
            <span className="font-semibold text-slate-700">{t.schoolName}</span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div>
            <span className="text-slate-400">Nhóm tác giả: </span>
            <span className="font-semibold text-slate-700">{t.authors}</span>
          </div>
        </div>

        {/* Pedagogy badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-[11px] font-medium border border-sky-200">
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>Giáo dục địa phương Tiểu học</span>
        </div>
      </div>
    </footer>
  );
};
