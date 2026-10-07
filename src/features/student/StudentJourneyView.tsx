import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Station } from '../../types';
import { progressService } from '../../services/ProgressService';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import {
  CheckCircle2,
  Compass,
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

  const studentName =
    (currentUser as { displayName?: string } | null)?.displayName ||
    currentUser?.name ||
    'Nhà phiêu lưu';

  const completed = gradeProgress.completedStations;
  const total = Math.max(1, demoStations.length);
  const progressPercent = Math.round((completed / total) * 100);

  const stats = [
    { label: 'Trạm', value: `${completed}/${total}`, icon: CheckCircle2, accent: 'text-orange-600 bg-orange-100' },
    { label: 'Chìa khóa', value: String(keysCollected), icon: KeyRound, accent: 'text-amber-700 bg-amber-100' },
    { label: 'Bản đồ', value: String(mapsCollected), icon: Map, accent: 'text-emerald-700 bg-emerald-100' },
    { label: 'Dấu hộ chiếu', value: String(stampsCollected), icon: Stamp, accent: 'text-rose-600 bg-rose-100' },
  ];

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-112px)] max-w-[1600px] flex-col gap-3 px-3 py-3 sm:px-5 lg:px-7">
      {/* Compact hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-orange-200/70 bg-white/78 px-4 py-4 shadow-[0_16px_45px_rgba(154,52,18,0.15)] backdrop-blur-xl sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-50/95 via-white/78 to-amber-50/80" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="relative z-10 grid items-center gap-4 lg:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700">
                GDĐP Đà Nẵng
              </span>
              <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black text-slate-900">
                Khối {currentGrade}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-2">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  {role === 'student'
                    ? <>Chào Nhà phiêu lưu <span className="text-orange-600">{studentName}!</span></>
                    : 'Hành trình khám phá quê hương'}
                </h1>
                <p className="mt-1 text-xs font-bold text-slate-600 sm:text-sm">
                  Khối {currentGrade} &nbsp;•&nbsp; {completed}/{total} trạm hoàn thành
                </p>
              </div>

              <div className="hidden min-w-[220px] flex-1 items-center gap-2 sm:flex lg:max-w-sm">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200/90">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-black text-orange-700">{progressPercent}%</span>
              </div>
            </div>

            {role !== 'student' && (
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto">
                {[1, 2, 3, 4, 5].map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setCurrentGrade(grade)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-black transition ${
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
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4 fill-current" />
                TIẾP TỤC
              </button>
            )}
            <button
              type="button"
              onClick={() => setCurrentView('student-maps')}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-orange-300 bg-white/90 px-4 py-2.5 text-sm font-black text-orange-700 transition hover:bg-orange-50"
            >
              <MapPinned className="h-4 w-4" />
              BẢN ĐỒ
            </button>
          </div>
        </div>
      </section>

      {/* Compact stat chips */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/88 px-3 py-2 shadow-md shadow-orange-950/5 backdrop-blur-lg"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.accent}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-black leading-none text-slate-950">{item.value}</div>
                <div className="mt-1 truncate text-[10px] font-bold text-slate-500">{item.label}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Stations are the main focus */}
      <section className="flex min-h-0 flex-1 flex-col rounded-[2rem] border border-orange-200/60 bg-white/42 p-3 shadow-xl shadow-orange-950/5 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 sm:text-lg">
                Hành trình khám phá Khối {currentGrade}
              </h2>
              <p className="hidden text-[10px] font-semibold text-slate-500 sm:block">
                Chạm vào một trạm để bắt đầu hoặc tiếp tục hành trình.
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-white/80 px-3 py-1 text-[10px] font-black text-orange-700 sm:inline">
            {demoStations.length} trạm đang mở
          </span>
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="pointer-events-none absolute bottom-3 left-4 right-4 hidden border-t-2 border-dashed border-orange-300/80 xl:block" />

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
                ? 'Hoàn thành'
                : isInProgress
                  ? 'Đang học'
                  : isDemoReady
                    ? 'Mở'
                    : 'Khóa';

              const statusStyle = isCompleted
                ? 'bg-emerald-100 text-emerald-700'
                : isInProgress
                  ? 'bg-sky-100 text-sky-700'
                  : isDemoReady
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-200 text-slate-600';

              return (
                <article
                  key={station.id}
                  className={`group flex min-h-0 flex-col overflow-hidden rounded-[1.55rem] border bg-white/96 shadow-lg transition-all duration-300 ${
                    isDemoReady
                      ? 'border-orange-100 hover:-translate-y-1 hover:border-orange-300 hover:shadow-2xl'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="relative min-h-[150px] flex-[1.15] overflow-hidden bg-slate-900 sm:min-h-[165px] xl:min-h-0">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={station.coverImage}
                      alt={station.titleVi}
                      className={`h-full w-full object-cover transition duration-700 ${
                        isDemoReady ? 'group-hover:scale-105' : 'scale-105 blur-[1px] grayscale-[25%]'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/8" />

                    <div className="absolute left-2.5 top-2.5 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black text-white shadow">
                      Trạm {station.number}
                    </div>

                    {!isDemoReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/15">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-slate-500 shadow-lg backdrop-blur">
                          <LockKeyhole className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 p-3">
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-black leading-5 text-slate-950">
                      {station.titleVi}
                    </h3>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ${statusStyle}`}>
                        {statusLabel}
                      </span>
                      {isCompleted && <Stamp className="h-5 w-5 rotate-[-10deg] text-rose-500" />}
                    </div>

                    {isDemoReady ? (
                      <button
                        type="button"
                        onClick={() => openStation(station)}
                        className={`mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-black text-white shadow-sm transition active:scale-[0.99] ${
                          isCompleted
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600'
                            : isInProgress
                              ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                        }`}
                      >
                        {isCompleted ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                        {isCompleted ? 'XEM LẠI' : isInProgress ? 'TIẾP TỤC' : 'BẮT ĐẦU'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="mt-1 flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-slate-200 px-3 py-2.5 text-[11px] font-black text-slate-500"
                      >
                        <LockKeyhole className="h-3.5 w-3.5" />
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
