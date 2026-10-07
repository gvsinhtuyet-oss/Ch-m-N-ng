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

const ExplorerKid: React.FC<{ avatar?: string; name: string }> = ({ avatar, name }) => {
  if (avatar) {
    return (
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[2rem] border-4 border-white/90 bg-white shadow-xl sm:h-32 sm:w-32">
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className="relative flex h-28 w-28 shrink-0 items-end justify-center overflow-hidden rounded-[2rem] border-4 border-white/90 bg-gradient-to-br from-amber-100 via-orange-50 to-sky-100 shadow-xl sm:h-32 sm:w-32"
      aria-label="Minh họa Nhà phiêu lưu"
    >
      <svg viewBox="0 0 180 180" className="h-[118%] w-[118%]" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="hat" x1="0" x2="1">
            <stop offset="0%" stopColor="#f4b942" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="shirt" x1="0" x2="1">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
        </defs>
        <ellipse cx="92" cy="160" rx="55" ry="30" fill="#0ea5e9" opacity=".16" />
        <path d="M47 74c0-34 18-55 46-55 29 0 48 22 48 56 0 31-21 47-48 47S47 105 47 74Z" fill="#3f2a21" />
        <circle cx="94" cy="72" r="36" fill="#ffd7bd" />
        <path d="M61 63c6-23 19-33 36-33 20 0 35 13 39 35-12-9-24-13-38-13-14 0-25 3-37 11Z" fill="#3f2a21" />
        <ellipse cx="80" cy="75" rx="4" ry="5" fill="#1e293b" />
        <ellipse cx="108" cy="75" rx="4" ry="5" fill="#1e293b" />
        <path d="M84 92c7 6 14 6 21 0" fill="none" stroke="#e87979" strokeWidth="4" strokeLinecap="round" />
        <path d="M52 46c7-27 24-38 44-38 23 0 41 12 49 38-32 8-63 8-93 0Z" fill="url(#hat)" />
        <ellipse cx="98" cy="46" rx="58" ry="13" fill="#fbbf24" />
        <path d="M55 116c13-12 26-17 40-17 15 0 31 6 44 18l13 55H40Z" fill="url(#shirt)" />
        <path d="M67 115c-8 12-14 29-17 49" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
        <path d="M124 115c9 12 15 29 18 49" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
        <path d="M137 124c14 0 25-8 31-20" fill="none" stroke="#ffd7bd" strokeWidth="11" strokeLinecap="round" />
        <circle cx="169" cy="101" r="7" fill="#ffd7bd" />
      </svg>
    </div>
  );
};

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

  const studentName =
    (currentUser as { displayName?: string } | null)?.displayName ||
    currentUser?.name ||
    'Nhà phiêu lưu';

  const studentAvatar = (currentUser as { avatar?: string } | null)?.avatar;
  const completed = gradeProgress.completedStations;
  const total = Math.max(1, displayStations.length);
  const progressPercent = Math.round((completed / total) * 100);

  const stats = [
    { label: 'Trạm', value: `${completed}/${total}`, icon: CheckCircle2, accent: 'text-orange-600 bg-orange-100' },
    { label: 'Chìa khóa', value: String(keysCollected), icon: KeyRound, accent: 'text-amber-700 bg-amber-100' },
    { label: 'Bản đồ', value: String(mapsCollected), icon: Map, accent: 'text-emerald-700 bg-emerald-100' },
    { label: 'Dấu hộ chiếu', value: String(stampsCollected), icon: Stamp, accent: 'text-rose-600 bg-rose-100' },
  ];

  const heroImage = nextStation?.coverImage || displayStations[0]?.coverImage;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-70px)] max-w-[1600px] flex-col gap-3 px-3 py-3 sm:px-5 lg:px-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/82 shadow-[0_18px_55px_rgba(124,45,18,0.16)] backdrop-blur-xl">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/96 via-orange-50/91 to-amber-100/72" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-orange-100/35 to-transparent" />

        <div className="relative z-10 grid items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <ExplorerKid avatar={studentAvatar} name={studentName} />

          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-[2.15rem]">
              {role === 'student' ? (
                <>Chào Nhà phiêu lưu <span className="text-orange-600">{studentName}!</span></>
              ) : (
                'Hành trình khám phá quê hương'
              )}
            </h1>
            <p className="mt-1 text-sm font-extrabold text-slate-700">
              Khối {currentGrade} <span className="mx-2 text-orange-300">•</span> {completed}/{total} trạm hoàn thành
            </p>

            <div className="mt-3 flex max-w-xl items-center gap-3">
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/90 p-1 shadow-inner ring-1 ring-slate-200/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="min-w-[3rem] text-sm font-black text-slate-700">{progressPercent}%</span>
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

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            {nextStation && (
              <button
                type="button"
                onClick={() => openStation(nextStation)}
                className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4 fill-current" />
                Tiếp tục
                <span aria-hidden="true">→</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setCurrentView('student-maps')}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-2xl border-2 border-orange-400 bg-white/90 px-5 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-50"
            >
              <MapPinned className="h-4 w-4" />
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
              className="flex items-center gap-3 rounded-2xl border border-white/90 bg-white/92 px-4 py-3 shadow-md shadow-orange-950/5 backdrop-blur-lg"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-black leading-none text-slate-950">{item.value}</div>
                <div className="mt-1 truncate text-xs font-bold text-slate-500">{item.label}</div>
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
                      Trạm {station.number}
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
                        {isCompleted ? 'Xem lại' : isInProgress ? 'Tiếp tục' : 'Bắt đầu'}
                        <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="mt-1 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-300 to-slate-400 px-3 py-3 text-xs font-black text-white opacity-80"
                      >
                        <LockKeyhole className="h-4 w-4" />
                        Bắt đầu
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
