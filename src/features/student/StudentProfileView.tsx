import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { progressService } from '../../services/ProgressService';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import { ShieldCheck, LogOut } from 'lucide-react';

export const StudentProfileView: React.FC = () => {
  const { currentUser, currentGrade, allStationsInCurrentGrade, logout } = useApp();
  const student = currentUser as any;
  const demoStations = allStationsInCurrentGrade.filter(station => DEMO_STATION_IDS.has(station.id));
  const gradeProg = progressService.getGradeProgress(
    student?.id || 'guest',
    demoStations.map(station => station.id),
    currentGrade
  );

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black mx-auto shadow-md shadow-sky-500/20">
          {student?.displayName ? student.displayName.charAt(0) : 'E'}
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {student?.displayName || student?.name || 'Học sinh khám phá'}
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wide">
              Dữ liệu minh họa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mã định danh: {student?.studentCode || 'HS_DEMO_2026'} • Lớp {student?.className || `Khối ${currentGrade}`}
          </p>
        </div>

        {/* Security and Privacy Notice */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block">Phiên bản demo – dữ liệu cục bộ:</strong>
            Tên hiển thị, mã lớp và tiến độ học được dùng cho phiên trải nghiệm trên trình duyệt. Ứng dụng demo không yêu cầu số điện thoại, địa chỉ hay thông tin cá nhân nhạy cảm.
          </div>
        </div>

        {/* Progress summary card */}
        <div className="grid grid-cols-3 gap-3 pt-3">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-center">
            <span className="text-2xl font-black text-sky-700">{gradeProg.completedStations}</span>
            <span className="text-[11px] font-bold text-slate-500 block mt-1">Trạm hoàn thành</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
            <span className="text-2xl font-black text-amber-700">{gradeProg.totalStamps}</span>
            <span className="text-[11px] font-bold text-slate-500 block mt-1">Con dấu đạt được</span>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
            <span className="text-2xl font-black text-rose-700">{gradeProg.totalRewards}</span>
            <span className="text-[11px] font-bold text-slate-500 block mt-1">Kỉ niệm thu thập</span>
          </div>
        </div>

        {/* Explicit exit: role changes happen again from the landing entry screen */}
        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Về trang đầu / Đổi vai trò</span>
          </button>
        </div>
      </div>
    </div>
  );
};
