import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Station } from '../../types';
import { progressService } from '../../services/ProgressService';
import { Compass, Award, CheckCircle2, Play, Sparkles, BookOpen, Clock } from 'lucide-react';

export const StudentJourneyView: React.FC = () => {
  const {
    currentUser,
    currentGrade,
    setCurrentGrade,
    allStationsInCurrentGrade,
    openStation,
    t,
  } = useApp();

  const studentId = currentUser?.id || 'guest';
  const stations: Station[] = allStationsInCurrentGrade;
  const gradeProgress = progressService.getGradeProgress(studentId, stations.map(s => s.id));

  const allDone = gradeProgress.completedStations === stations.length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 space-y-8">
      {/* Grade Selector & Overview Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-extrabold text-xs">
                Chương Trình GDĐP TP Đà Nẵng
              </span>
              <span className="text-xs text-sky-200">Khối Lớp {currentGrade}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Hành Trình Khám Phá Quê Hương
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl leading-relaxed">
              Chào mừng em đến với 5 trạm học tập kỳ thú của Khối {currentGrade}. Em có thể chọn khám phá bất kỳ trạm nào em yêu thích!
            </p>
          </div>

          {/* Completion Counter */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-center shrink-0 w-full md:w-auto">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {gradeProgress.completedStations} / {stations.length}
            </div>
            <div className="text-xs font-semibold text-sky-100 mt-1">
              Trạm đã hoàn thành
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(gradeProgress.completedStations / stations.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grade Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-sky-200 font-semibold mr-2 shrink-0">Chọn khối học:</span>
          {[1, 2, 3, 4, 5].map((g) => (
            <button
              key={g}
              onClick={() => setCurrentGrade(g)}
              className={`px-4 py-1.5 rounded-xl font-extrabold text-xs transition shrink-0 ${
                currentGrade === g
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Khối {g}
            </button>
          ))}
        </div>
      </div>

      {/* Celebration Banner when 5/5 stations completed */}
      {allDone && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
              🏆
            </div>
            <div>
              <h3 className="text-lg font-black">Chúc mừng! Em đã hoàn thành hành trình Khối {currentGrade}!</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Em đã xuất sắc lưu dấu toàn bộ 5 con dấu di sản vào Hộ chiếu số. Hãy mở trang HỘ CHIẾU để chiêm ngưỡng nhé!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5 Stations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600" />
            <span>5 Trạm Học Tập Khối {currentGrade}</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            (Có thể học tự do, không bắt buộc theo thứ tự)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => {
            const prog = progressService.getStationProgress(studentId, station.id);
            const isCompleted = prog.stationCompleted || prog.stampReceived;
            const isInProgress = prog.stage1Completed || prog.exploredHotspotIds.length > 0;

            let statusLabel = 'CHƯA KHÁM PHÁ';
            let statusBadge = 'bg-slate-100 text-slate-600';
            if (isCompleted) {
              statusLabel = 'ĐÃ HOÀN THÀNH';
              statusBadge = 'bg-emerald-100 text-emerald-800 font-bold';
            } else if (isInProgress) {
              statusLabel = 'ĐANG KHÁM PHÁ';
              statusBadge = 'bg-amber-100 text-amber-800 font-bold';
            }

            return (
              <div
                key={station.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Cover */}
                <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                  <img
                    src={station.coverImage}
                    alt={station.titleVi}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-sky-600/90 backdrop-blur-md text-white font-black text-xs">
                      Trạm {station.number}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl backdrop-blur-md text-xs font-semibold ${statusBadge}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Stamp mark if completed */}
                  {isCompleted && (
                    <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-lg animate-pulse">
                      ★ DẤU
                    </div>
                  )}

                  {/* Subtitle overlay on bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                      {station.themeNameVi}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-sky-600 transition leading-snug">
                      {station.titleVi}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {station.subtitleVi}
                    </p>
                  </div>

                  {/* Pedagogy goals snippet */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div>
                      <strong className="text-sky-700">Biết:</strong> {station.pedagogyGoals.knowGoalVi.slice(0, 80)}...
                    </div>
                  </div>

                  {/* Progress info & CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{station.totalPeriods} tiết GDĐP</span>
                    </div>

                    <button
                      onClick={() => openStation(station)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isCompleted ? 'Học lại' : 'Khám phá'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
