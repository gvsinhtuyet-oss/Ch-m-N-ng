import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Station } from '../../types';
import { progressService } from '../../services/ProgressService';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import {
  Award,
  CheckCircle2,
  Compass,
  KeyRound,
  LockKeyhole,
  Map,
  MapPinned,
  Play,
  RotateCcw,
  Sparkles,
  Stamp,
} from 'lucide-react';

export const StudentJourneyView: React.FC = () => {
  const {
    currentUser,
    role,
    currentGrade,
    setCurrentGrade,
    setCurrentView,
    allStationsInCurrentGrade,
    openStation,
  } = useApp();

  const studentId = currentUser?.id || 'guest';
  const stations: Station[] = allStationsInCurrentGrade;
  const demoStations = stations.filter(station => DEMO_STATION_IDS.has(station.id));
  const displayStations = [...stations].sort((a, b) => {
    const aDemo = DEMO_STATION_IDS.has(a.id);
    const bDemo = DEMO_STATION_IDS.has(b.id);
    if (aDemo === bDemo) return a.number - b.number;
    return aDemo ? -1 : 1;
  });

  const gradeProgress = progressService.getGradeProgress(
    studentId,
    demoStations.map(station => station.id),
    currentGrade
  );

  const progressByStation = demoStations.map(station => ({
    station,
    progress: progressService.getStationProgress(studentId, station.id),
  }));

  const mapsCollected = progressByStation.filter(item => item.progress.journeyMapReceived).length;
  const keysCollected = progressByStation.filter(item => item.progress.keyFragmentReceived).length;
  const stampsCollected = progressByStation.filter(item => item.progress.stampReceived).length;

  const nextStation =
    progressByStation.find(item =>
      !item.progress.stationCompleted &&
      (item.progress.stage1Completed || item.progress.exploredHotspotIds.length > 0)
    )?.station ||
    progressByStation.find(item => !item.progress.stationCompleted)?.station ||
    demoStations[0];

  const allDone =
    demoStations.length > 0 &&
    gradeProgress.completedStations === demoStations.length;

  const studentName =
    (currentUser as { displayName?: string } | null)?.displayName ||
    currentUser?.name ||
    'Nhà phiêu lưu';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* HERO: lời chào + tiến độ hành trình */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-sky-500 via-blue-700 to-violet-800 p-6 sm:p-8 lg:p-10 text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-8 bottom-5 hidden lg:block opacity-15">
          <Compass className="h-44 w-44" />
        </div>

        <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-extrabold backdrop-blur-md">
                Chương trình GDĐP TP Đà Nẵng
              </span>
              <span className="rounded-full bg-amber-300 px-3 py-1.5 text-[11px] font-black text-slate-900">
                Khối {currentGrade}
              </span>
            </div>

            <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              {role === 'student'
                ? `Chào Nhà phiêu lưu ${studentName}!`
                : 'Hành trình khám phá quê hương'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50 sm:text-base">
              Cùng khám phá những điểm đến thú vị của Đà Nẵng, hoàn thành từng trạm để sưu tầm
              chìa khóa, bản đồ và dấu hộ chiếu.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {nextStation && (
                <button
                  type="button"
                  onClick={() => openStation(nextStation)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/15 transition hover:-translate-y-0.5 hover:bg-amber-200 active:translate-y-0"
                >
                  <Play className="h-4 w-4 fill-current" />
                  KHÁM PHÁ TIẾP
                </button>
              )}
              <button
                type="button"
                onClick={() => setCurrentView('student-maps')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/14 px-5 py-3 text-sm font-extrabold text-white backdrop-blur-md transition hover:bg-white/22"
              >
                <MapPinned className="h-4 w-4" />
                XEM BẢN ĐỒ HÀNH TRÌNH
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/20 bg-white/12 p-5 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[9px] border-white/15 bg-slate-950/15 shadow-inner">
              <div>
                <div className="text-3xl font-black text-amber-300">
                  {gradeProgress.completedStations}/{Math.max(1, demoStations.length)}
                </div>
                <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white/80">
                  trạm
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm font-black">Tiến độ hành trình</p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-amber-300 transition-all duration-700"
                style={{
                  width: `${(gradeProgress.completedStations / Math.max(1, demoStations.length)) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-sky-100">
              Mỗi trạm hoàn thành sẽ mở thêm một dấu ấn mới.
            </p>
          </div>
        </div>

        {role !== 'student' && (
          <div className="relative z-10 mt-7 flex items-center gap-2 overflow-x-auto border-t border-white/15 pt-5">
            <span className="mr-1 shrink-0 text-xs font-bold text-sky-100">Chọn khối:</span>
            {[1, 2, 3, 4, 5].map(grade => (
              <button
                key={grade}
                type="button"
                onClick={() => setCurrentGrade(grade)}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black transition ${
                  currentGrade === grade
                    ? 'bg-amber-300 text-slate-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Khối {grade}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Dải thành tích nhanh */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: 'Trạm đã qua',
            value: `${gradeProgress.completedStations}/${Math.max(1, demoStations.length)}`,
            icon: CheckCircle2,
            box: 'from-emerald-50 to-white border-emerald-200',
            iconBox: 'bg-emerald-100 text-emerald-700',
          },
          {
            label: 'Mảnh chìa khóa',
            value: `${keysCollected}/${Math.max(1, demoStations.length)}`,
            icon: KeyRound,
            box: 'from-amber-50 to-white border-amber-200',
            iconBox: 'bg-amber-100 text-amber-700',
          },
          {
            label: 'Bản đồ đã lưu',
            value: String(mapsCollected),
            icon: Map,
            box: 'from-sky-50 to-white border-sky-200',
            iconBox: 'bg-sky-100 text-sky-700',
          },
          {
            label: 'Dấu hộ chiếu',
            value: String(stampsCollected),
            icon: Stamp,
            box: 'from-violet-50 to-white border-violet-200',
            iconBox: 'bg-violet-100 text-violet-700',
          },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${item.box}`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.iconBox}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">{item.value}</div>
                <div className="text-[11px] font-bold text-slate-500">{item.label}</div>
              </div>
            </div>
          );
        })}
      </section>

      {allDone && (
        <section className="flex items-center gap-4 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white shadow-lg">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-black sm:text-lg">
              Chúc mừng! Em đã hoàn thành hành trình đang mở của Khối {currentGrade}!
            </h3>
            <p className="mt-1 text-xs text-emerald-50">
              Bản đồ, chìa khóa và dấu hộ chiếu của em đã được lưu.
            </p>
          </div>
        </section>
      )}

      {/* Các trạm */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-sky-600" />
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                Hành trình khám phá Khối {currentGrade}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Hoàn thành từng trạm để nhận chìa khóa, bản đồ và con dấu hộ chiếu.
            </p>
          </div>
          <span className="rounded-full border border-sky-100 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-slate-500 shadow-sm">
            {String(demoStations.length).padStart(2, '0')} trạm đang mở • {String(Math.max(0, stations.length - demoStations.length)).padStart(2, '0')} trạm đang phát triển
          </span>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-6 right-6 top-8 hidden border-t-2 border-dashed border-sky-200 lg:block" />

          <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayStations.map(station => {
              const isDemoReady = DEMO_STATION_IDS.has(station.id);
              const progress = isDemoReady
                ? progressService.getStationProgress(studentId, station.id)
                : null;
              const isCompleted = !!progress && (progress.stationCompleted || progress.stampReceived);
              const isInProgress =
                !!progress &&
                !isCompleted &&
                (progress.stage1Completed || progress.exploredHotspotIds.length > 0);

              const statusLabel = isCompleted
                ? 'ĐÃ HOÀN THÀNH'
                : isInProgress
                  ? 'ĐANG KHÁM PHÁ'
                  : isDemoReady
                    ? 'SẴN SÀNG KHÁM PHÁ'
                    : 'ĐANG PHÁT TRIỂN';

              const statusStyle = isCompleted
                ? 'bg-emerald-500 text-white'
                : isInProgress
                  ? 'bg-amber-300 text-slate-950'
                  : isDemoReady
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-900/75 text-white';

              return (
                <article
                  key={station.id}
                  className={`group overflow-hidden rounded-[1.75rem] border bg-white/95 shadow-md transition-all duration-300 ${
                    isDemoReady
                      ? 'border-white hover:-translate-y-1 hover:shadow-2xl'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={station.coverImage}
                      alt={station.titleVi}
                      className={`h-full w-full object-cover transition duration-700 ${
                        isDemoReady ? 'group-hover:scale-105' : 'scale-105 blur-[1px] grayscale-[20%]'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/12 to-transparent" />

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-sky-800 shadow">
                        TRẠM {station.number}
                      </span>
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black shadow ${statusStyle}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {!isDemoReady && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-slate-950/45 text-white backdrop-blur-md">
                          <LockKeyhole className="h-6 w-6" />
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="absolute right-3 top-3 rotate-[-8deg] rounded-full border-4 border-rose-100/80 bg-rose-600 px-3 py-3 text-center text-[9px] font-black leading-tight text-white shadow-xl">
                        <Stamp className="mx-auto mb-0.5 h-4 w-4" />
                        ĐÃ ĐÓNG DẤU
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">
                        {station.themeNameVi}
                      </span>
                      <h3 className="mt-1 text-xl font-black leading-tight text-white">
                        {station.titleVi}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <p className="min-h-[2.5rem] text-xs leading-5 text-slate-600">
                      {station.subtitleVi}
                    </p>

                    {isDemoReady ? (
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>Phần thưởng: chìa khóa + bản đồ + dấu</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold text-slate-500">
                        Hoàn thành nội dung và kiểm duyệt nguồn để mở trạm này.
                      </div>
                    )}

                    {isDemoReady ? (
                      <button
                        type="button"
                        onClick={() => openStation(station)}
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black text-white shadow-sm transition active:scale-[0.99] ${
                          isCompleted
                            ? 'bg-slate-700 hover:bg-slate-800'
                            : isInProgress
                              ? 'bg-amber-500 hover:bg-amber-600'
                              : 'bg-sky-600 hover:bg-sky-700'
                        }`}
                      >
                        {isCompleted ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 fill-current" />
                        )}
                        {isCompleted
                          ? 'XEM LẠI HÀNH TRÌNH'
                          : isInProgress
                            ? 'TIẾP TỤC KHÁM PHÁ'
                            : 'BẮT ĐẦU HÀNH TRÌNH'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-200 px-4 py-3 text-xs font-black text-slate-500"
                      >
                        <LockKeyhole className="h-4 w-4" />
                        ĐANG PHÁT TRIỂN
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
