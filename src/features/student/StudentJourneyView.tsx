import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Station } from '../../types';
import { progressService } from '../../services/ProgressService';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Map,
  MapPinned,
  Play,
  RotateCcw,
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
  const displayStations = [...stations].sort((a, b) => a.number - b.number);

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

  const completed = gradeProgress.completedStations;
  const total = Math.max(1, displayStations.length);
  const progressPercent = Math.round((completed / total) * 100);

  const stats = [
    { label: 'Điểm đến', value: `${completed}/${total}`, icon: CheckCircle2, accent: 'text-orange-600 bg-orange-100' },
    { label: 'Chìa khóa', value: String(keysCollected), icon: KeyRound, accent: 'text-amber-700 bg-amber-100' },
    { label: 'Mảnh bản đồ', value: String(mapsCollected), icon: Map, accent: 'text-emerald-700 bg-emerald-100' },
    { label: 'Con dấu', value: String(stampsCollected), icon: Stamp, accent: 'text-rose-600 bg-rose-100' },
  ];

  const heroImage = nextStation?.coverImage || displayStations[0]?.coverImage;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] max-w-[1600px] flex-col gap-3 px-3 py-3 sm:px-5 lg:px-7">
      <section className="relative overflow-hidden rounded-[1.65rem] border border-white/80 bg-white/86 shadow-[0_12px_34px_rgba(124,45,18,0.12)] backdrop-blur-xl">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12]"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/98 via-orange-50/94 to-amber-50/88" />

        <div className="relative z-10 flex min-h-[86px] flex-col justify-center gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="truncate text-[21px] font-black tracking-tight text-slate-950 sm:text-[23px]">
                Hành trình Nhà phiêu lưu <span className="text-orange-600">– Khối {currentGrade}</span>
              </h1>
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black text-orange-700">
                Đã chinh phục {completed}/{total} điểm đến
              </span>
            </div>

            <div className="mt-2 flex max-w-2xl items-center gap-2.5">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200/90">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="min-w-[2.25rem] text-[11px] font-black text-slate-700">{progressPercent}%</span>
            </div>

            {role !== 'student' && (
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto">
                {[1, 2, 3, 4, 5].map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setCurrentGrade(grade)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black transition ${
                      currentGrade === grade
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-white/85 text-slate-700 hover:bg-orange-50'
                    }`}
                  >
                    Khối {grade}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {nextStation && (
              <button
                type="button"
                onClick={() => openStation(nextStation)}
                className="inline-flex h-10 min-w-[124px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 text-[12px] font-black text-white shadow-md shadow-orange-500/20 transition hover:-translate-y-0.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Tiếp tục hành trình
                <span aria-hidden="true">→</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setCurrentView('student-maps')}
              className="inline-flex h-10 min-w-[116px] items-center justify-center gap-1.5 rounded-xl border-2 border-orange-300 bg-white/92 px-4 text-[12px] font-black text-orange-700 transition hover:bg-orange-50"
            >
              <MapPinned className="h-3.5 w-3.5" />
              Bản đồ
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {stats.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex min-h-[52px] items-center gap-2.5 rounded-2xl border border-white/90 bg-white/92 px-3 py-2 shadow-md shadow-orange-950/5 backdrop-blur-lg"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.accent}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-black leading-none text-slate-950">{item.value}</div>
                <div className="mt-0.5 truncate text-[10px] font-bold text-slate-500">{item.label}</div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="relative flex min-h-0 flex-1 flex-col rounded-[2rem] border border-white/80 bg-white/40 p-2.5 shadow-xl shadow-orange-950/5 backdrop-blur-md sm:p-3">
        <div className="relative min-h-0 flex-1">
          <div className="pointer-events-none absolute bottom-2 left-8 right-8 hidden border-t-2 border-dashed border-white/90 xl:block" />

          <div className="relative grid h-full min-h-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                ? 'Đã chinh phục'
                : isInProgress
                  ? 'Đang khám phá'
                  : isDemoReady
                    ? 'Sẵn sàng'
                    : 'Chưa mở';

              const statusStyle = isCompleted
                ? 'bg-emerald-100 text-emerald-700'
                : isInProgress
                  ? 'bg-sky-100 text-sky-700'
                  : isDemoReady
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600';

              const stationBadge = isCompleted
                ? 'bg-orange-500'
                : isInProgress
                  ? 'bg-sky-500'
                  : isDemoReady
                    ? 'bg-slate-600'
                    : 'bg-slate-500';

              return (
                <article
                  key={station.id}
                  className={`group flex min-h-0 flex-col overflow-hidden rounded-[1.65rem] border-4 bg-white/96 shadow-xl transition-all duration-300 ${
                    isDemoReady
                      ? 'border-white hover:-translate-y-1 hover:shadow-2xl'
                      : 'border-white/90'
                  }`}
                >
                  <div className="relative min-h-[185px] flex-[1.2] overflow-hidden bg-slate-900 xl:min-h-0">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={station.coverImage}
                      alt={station.titleVi}
                      className={`h-full w-full object-cover transition duration-700 ${
                        isDemoReady ? 'group-hover:scale-105' : 'scale-105 grayscale-[15%]'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/38 via-transparent to-slate-950/10" />
                    <div className={`absolute left-3 top-3 rounded-full px-4 py-1.5 text-xs font-black text-white shadow ${stationBadge}`}>
                      Điểm đến {station.number}
                    </div>
                    {!isDemoReady && (
                      <div className="absolute inset-0 bg-slate-900/8" />
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2.5 p-3.5">
                    <h3 className="line-clamp-2 min-h-[2.6rem] text-[17px] font-black leading-5 text-slate-950">
                      {station.titleVi}
                    </h3>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black ${statusStyle}`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : isInProgress || isDemoReady ? (
                          <Play className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <LockKeyhole className="h-3.5 w-3.5" />
                        )}
                        {statusLabel}
                      </span>
                      {isCompleted && <Stamp className="h-6 w-6 rotate-[-10deg] text-rose-500" />}
                    </div>

                    {isDemoReady ? (
                      <button
                        type="button"
                        onClick={() => openStation(station)}
                        className={`mt-1 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-black text-white shadow-sm transition active:scale-[0.99] ${
                          isCompleted
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600'
                            : isInProgress
                              ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                        }`}
                      >
                        {isCompleted ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                        {isCompleted ? 'Khám phá lại' : isInProgress ? 'Tiếp tục hành trình' : 'Bắt đầu khám phá'}
                        <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="mt-1 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-300 to-slate-400 px-3 py-3 text-xs font-black text-white opacity-80"
                      >
                        <LockKeyhole className="h-4 w-4" />
                        Bắt đầu khám phá
                        <span aria-hidden="true">→</span>
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
