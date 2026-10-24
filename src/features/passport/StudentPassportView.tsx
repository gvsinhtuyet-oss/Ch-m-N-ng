import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { progressService } from '../../services/ProgressService';
import { Award, Compass, Shield, Bookmark } from 'lucide-react';

export const StudentPassportView: React.FC = () => {
  const { currentUser, currentGrade, allStationsInCurrentGrade, openStation } = useApp();
  const studentId = currentUser?.id || 'guest';
  const stations = allStationsInCurrentGrade;

  return (
    <div className="passport-page mx-auto w-full max-w-[1800px] px-3 sm:px-5 py-3 space-y-3">
      {/* Passport Book Cover Header */}
      <div className="bg-gradient-to-r from-red-800 via-red-900 to-amber-950 text-amber-100 rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-black text-xs uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5" />
              <span>HỘ CHIẾU KHÁM PHÁ ĐÀ NẴNG</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-200 tracking-normal uppercase leading-tight">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h1>
            <p className="text-xs text-amber-300/80 uppercase tracking-wider font-semibold">
              Hành Trình Giáo Dục Địa Phương Số – TP Đà Nẵng
            </p>

            {/* Student Info Box */}
            <div className="mt-2 pt-2 border-t border-amber-400/20 flex flex-wrap gap-3 text-xs font-semibold text-amber-100">
              <div>
                <span className="text-amber-400/70">Họ và tên: </span>
                <span className="font-extrabold text-white">{(currentUser as any)?.displayName || currentUser?.name || 'Khách Thám Hiểm'}</span>
              </div>
              <div>
                <span className="text-amber-400/70">Lớp: </span>
                <span className="font-extrabold text-white">{(currentUser as any)?.className || `Khối ${currentGrade}`}</span>
              </div>
              <div>
                <span className="text-amber-400/70">Trường: </span>
                <span className="font-extrabold text-white">TH Trần Đại Nghĩa</span>
              </div>
            </div>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-400/50 bg-amber-950/40 p-1 flex items-center justify-center shadow-inner shrink-0">
            <div className="w-full h-full border border-dashed border-amber-400/40 rounded-xl flex flex-col items-center justify-center p-2 text-center">
              <Compass className="w-6 h-6 text-amber-400 mb-1" />
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-tighter">
                ĐÀ NẴNG 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stamp Pages Grid */}
      <div className="bg-amber-50/40 border border-amber-200/80 rounded-3xl p-3 sm:p-4 shadow-inner space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-amber-200">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-red-700" />
              <span>Trang Thu Thập Dấu Ấn – Khối {currentGrade}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Hoàn thành từng trạm để sưu tập đủ {stations.length} dấu ấn hành trình.
            </p>
          </div>
        </div>

        <div className="passport-stamps-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {stations.map((station) => {
            const prog = progressService.getStationProgress(studentId, station.id);
            const hasStamp = prog.stampReceived || prog.stationCompleted;

            return (
              <div
                key={station.id}
                className="bg-white rounded-2xl p-3 border border-amber-200 shadow-xs flex flex-col items-center justify-center text-center relative group min-h-[190px] min-w-0"
              >
                {hasStamp ? (
                  /* Stamped Badge */
                  <div className="space-y-2 min-w-0 w-full">
                    <div className="w-20 h-20 mx-auto rounded-full border-4 border-double border-red-700 bg-red-50 p-2 flex flex-col items-center justify-center text-red-700 shadow-md rotate-[-3deg] transition group-hover:rotate-0">
                      <div className="w-full h-full rounded-full border border-red-600/60 p-1.5 flex flex-col items-center justify-center">
                        <span className="text-[7px] font-black uppercase tracking-widest text-red-900">
                          CHẠM ĐÀ NẴNG
                        </span>
                        <Award className="w-5 h-5 text-red-700 my-0.5" />
                        <span className="text-[9px] font-black uppercase text-red-800 leading-tight">
                          {station.stamp.nameVi}
                        </span>
                        <span className="text-[7px] font-bold text-red-600">
                          {prog.completedAt ? new Date(prog.completedAt).toLocaleDateString('vi-VN') : 'ĐÃ ĐÓNG DẤU'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2">{station.titleVi}</h4>
                      <p className="text-[10px] text-slate-500 italic mt-0.5">"{station.stamp.quoteVi}"</p>
                    </div>

                    <button
                      onClick={() => openStation(station, 4)}
                      className="text-[11px] font-bold text-sky-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Xem lại con dấu</span>
                    </button>
                  </div>
                ) : (
                  /* Empty Stamp Slot */
                  <div className="space-y-2 min-w-0 w-full opacity-70 group-hover:opacity-100 transition">
                    <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                      <Award className="w-8 h-8 stroke-1" />
                      <span className="text-[10px] font-bold mt-1">Chưa đóng</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-700 line-clamp-2">{station.titleVi}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Hoàn thành để nhận con dấu</p>
                    </div>

                    <button
                      onClick={() => openStation(station)}
                      className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition"
                    >
                      Bắt đầu khám phá
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
