import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Station } from '../../types';
import { progressService } from '../../services/ProgressService';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import { Compass, Award, CheckCircle2, Play, Sparkles, BookOpen, Clock } from 'lucide-react';

export const StudentJourneyView: React.FC = () => {
  const {
    currentUser,
    role,
    currentGrade,
    setCurrentGrade,
    allStationsInCurrentGrade,
    openStation,
    t,
  } = useApp();

  const studentId = currentUser?.id || 'guest';
  const stations: Station[] = allStationsInCurrentGrade;
  const demoStations = stations.filter(station => DEMO_STATION_IDS.has(station.id));
  const displayStations = [...stations].sort((a, b) => {
    const aDemo = DEMO_STATION_IDS.has(a.id);
    const bDemo = DEMO_STATION_IDS.has(b.id);
    if (aDemo === bDemo) return 0;
    return aDemo ? -1 : 1;
  });
  const gradeProgress = progressService.getGradeProgress(
    studentId,
    demoStations.map(station => station.id),
    currentGrade
  );

  const allDone =
    demoStations.length > 0 &&
    gradeProgress.completedStations === demoStations.length;

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
              {role === 'student' ? `Chào Nhà phiêu lưu ${(currentUser as any)?.displayName || currentUser?.name || ''}!` : 'Hành Trình Khám Phá Quê Hương'}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl leading-relaxed">
              Khám phá bài học demo của Khối {currentGrade}. Các nội dung còn lại đang tiếp tục được hoàn thiện.
            </p>
          </div>

          {/* Completion Counter */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-center shrink-0 w-full md:w-auto">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {gradeProgress.completedStations} / {demoStations.length || 1}
            </div>
            <div className="text-xs font-semibold text-sky-100 mt-1">
              Bài demo đã hoàn thành
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(gradeProgress.completedStations / Math.max(1, demoStations.length)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grade Selector Tabs */}
        {role !== 'student' && <div className="mt-6 pt-5 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1">
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
        </div>}
      </div>

      {/* Celebration Banner when the demo lesson is completed */}
      {allDone && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
              🏆
            </div>
            <div>
              <h3 className="text-lg font-black">Chúc mừng! Em đã hoàn thành bài học demo của Khối {currentGrade}!</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Dấu hành trình của bài demo đã được lưu vào Hộ chiếu số.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grade lessons: one open demo + four lessons in development */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600" />
            <span>Các bài học Khối {currentGrade}</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            01 bài demo đang mở • 04 bài đang phát triển
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayStations.map((station) => {
            const isDemoReady = DEMO_STATION_IDS.has(station.id);
            const prog = isDemoReady
              ? progressService.getStationProgress(studentId, station.id)
              : null;
            const isCompleted = !!prog && (prog.stationCompleted || prog.stampReceived);
            const isInProgress = !!prog && (prog.stage1Completed || prog.exploredHotspotIds.length > 0);

            let statusLabel = isDemoReady ? 'CHƯA KHÁM PHÁ' : '🔒 ĐANG PHÁT TRIỂN';
            let statusBadge = isDemoReady
              ? 'bg-slate-100 text-slate-600'
              : 'bg-slate-800/90 text-white font-bold';
            if (isDemoReady && isCompleted) {
              statusLabel = 'ĐÃ HOÀN THÀNH';
              statusBadge = 'bg-emerald-100 text-emerald-800 font-bold';
            } else if (isDemoReady && isInProgress) {
              statusLabel = 'ĐANG KHÁM PHÁ';
              statusBadge = 'bg-amber-100 text-amber-800 font-bold';
            }

            return (
              <div
                key={station.id}
                className={`bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs transition-all duration-300 flex flex-col group ${
                  isDemoReady ? 'hover:shadow-xl' : 'opacity-75 cursor-not-allowed'
                }`}
              >
                {/* Image Cover */}
                <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                  <img loading="lazy" decoding="async"
                    src={station.coverImage}
                    alt={station.titleVi}
                    className={`w-full h-full object-cover transition duration-500 ${
                      isDemoReady ? 'group-hover:scale-105' : 'grayscale-[25%]'
                    }`}
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

                  {isDemoReady && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-[10px] shadow-md">
                      TRẢI NGHIỆM DEMO
                    </div>
                  )}

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
                    <h3 className={`text-base sm:text-lg font-black text-slate-900 transition leading-snug ${
                      isDemoReady ? 'group-hover:text-sky-600' : ''
                    }`}>
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

                  {!isDemoReady ? (
                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5">
                      <span>🔒</span>
                      <span>Nội dung đang được hoàn thiện từ nguồn đã kiểm chứng.</span>
                    </div>
                  ) : !station.isFullyVerified ? (
                    <div className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <span>Nội dung demo đang được hoàn thiện và kiểm duyệt nguồn.</span>
                    </div>
                  ) : null}

                  {/* Progress info & CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{station.totalPeriods} tiết GDĐP</span>
                    </div>

                    {isDemoReady ? (
                      <button
                        onClick={() => openStation(station)}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{isCompleted ? 'HỌC LẠI' : 'BẮT ĐẦU KHÁM PHÁ'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed"
                      >
                        ĐANG PHÁT TRIỂN
                      </button>
                    )}
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

