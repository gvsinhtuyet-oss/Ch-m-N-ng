import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Gift,
  KeyRound,
  Lock,
  Map as MapIcon,
  Sparkles,
  Star,
  X,
  ZoomIn,
} from 'lucide-react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import { progressService } from '../../services/ProgressService';
import { audioService } from '../../services/AudioService';
import { DEFAULT_APP_BACKGROUND_DATA_URL } from '../../assets/defaultAppBackground';

const GRADE_TREASURES: Record<number, { name: string; icon: string }> = {
  1: { name: 'Ngôi sao Người giữ quê hương', icon: '⭐' },
  2: { name: 'Viên ngọc Di sản', icon: '💎' },
  3: { name: 'Ngọn đuốc Khai trí', icon: '🔥' },
  4: { name: 'Kính lúp Người bảo tồn', icon: '🔎' },
  5: { name: 'La bàn Nhà thám hiểm Đà Nẵng', icon: '🧭' },
};

function buildMapNodes(station: Station) {
  if (station.journeyMap?.summaryNodes?.length) {
    return station.journeyMap.summaryNodes.slice(0, 4);
  }

  return station.hotspots.slice(0, 4).map((hotspot, index) => ({
    id: hotspot.id,
    titleVi: hotspot.titleVi.replace(/^\d+\.\s*/, ''),
    textVi: hotspot.keyFactVi,
    icon: ['📍', '🔎', '💡', '🌱'][index] ?? '✨',
  }));
}

export const StudentJourneyMapsView: React.FC = () => {
  const {
    currentUser,
    role,
    currentGrade,
    setCurrentGrade,
    allStationsInCurrentGrade,
  } = useApp();

  const studentId = currentUser?.id || 'guest';
  const isReadOnly = role !== 'student';
  const stations = allStationsInCurrentGrade;
  const stationIds = stations.map(station => station.id);

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapZoomed, setMapZoomed] = useState(false);
  const [previewTreasure, setPreviewTreasure] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const gradeSummary = useMemo(
    () => progressService.getGradeProgress(studentId, stationIds, currentGrade),
    [studentId, currentGrade, stationIds.join('|'), refreshKey]
  );

  const treasureProgress = useMemo(
    () => progressService.getGradeTreasureProgress(studentId, currentGrade),
    [studentId, currentGrade, refreshKey]
  );

  const gradeTreasure = GRADE_TREASURES[currentGrade] ?? GRADE_TREASURES[2];

  const openMap = (station: Station) => {
    const progress = progressService.getStationProgress(studentId, station.id);
    const canPreview = isReadOnly && DEMO_STATION_IDS.has(station.id);
    if (!progress.journeyMapReceived && !canPreview) return;
    audioService.playSfx('map');
    setMapZoomed(false);
    setSelectedStation(station);
  };

  const celebrateTreasure = () => {
    audioService.playSfx('treasure');
    try {
      confetti({ particleCount: 150, spread: 100, startVelocity: 42, origin: { y: 0.62 } });
      setTimeout(() => {
        confetti({ particleCount: 90, angle: 60, spread: 75, origin: { x: 0, y: 0.65 } });
        confetti({ particleCount: 90, angle: 120, spread: 75, origin: { x: 1, y: 0.65 } });
      }, 320);
    } catch {
      // Visual celebration is optional.
    }
  };

  const handleOpenTreasure = () => {
    if (isReadOnly) {
      setPreviewTreasure(true);
      celebrateTreasure();
      return;
    }

    const result = progressService.openGradeTreasure(studentId, currentGrade, stationIds);
    if (result.chestOpened) {
      setPreviewTreasure(true);
      setRefreshKey(value => value + 1);
      celebrateTreasure();
    }
  };

  const handlePreviewTreasure = () => {
    setPreviewTreasure(true);
    celebrateTreasure();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-sky-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-20 -right-10 w-80 h-80 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-black">
              <MapIcon className="w-4 h-4" />
              <span>BỘ SƯU TẬP HÀNH TRÌNH</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">Bản đồ hành trình</h1>
            <p className="max-w-2xl text-sm text-sky-100 leading-relaxed">
              Mỗi bài hoàn thành mở khóa một Bản đồ hành trình và một Mảnh chìa khóa.
              Thu thập đủ 5 bản đồ của một khối để mở Rương Kho báu.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/15 p-4 min-w-[220px]">
            <div className="text-xs text-sky-100 font-semibold">Tiến độ Khối {currentGrade}</div>
            <div className="text-3xl font-black text-amber-300 mt-1">{gradeSummary.totalJourneyMaps}/5</div>
            <div className="text-xs text-sky-100">Bản đồ đã thu thập</div>
            <div className="mt-3 h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-300 transition-all"
                style={{ width: `${Math.min(100, (gradeSummary.totalJourneyMaps / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {role !== 'student' && <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-sky-200 font-semibold mr-1 shrink-0">Chọn khối:</span>
          {[1, 2, 3, 4, 5].map(grade => (
            <button
              key={grade}
              onClick={() => {
                setCurrentGrade(grade);
                setSelectedStation(null);
                setPreviewTreasure(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 ${
                currentGrade === grade
                  ? 'bg-amber-300 text-slate-950'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Khối {grade}
            </button>
          ))}
        </div>}
      </section>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-950 leading-relaxed">
        <strong>Phiên bản demo:</strong> hiện mở 1/5 bài của mỗi khối. Rương Kho báu chỉ được mở thật khi học sinh hoàn thành đủ 5 bài,
        nhận đủ 5 Bản đồ hành trình và 5 Mảnh chìa khóa. Nút xem trước bên dưới chỉ minh họa thiết kế phần thưởng cuối khối.
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-black text-xl text-slate-900">Bản đồ Khối {currentGrade}</h2>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>{gradeSummary.totalKeyFragments}/5 Mảnh chìa khóa</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {stations.map(station => {
            const progress = progressService.getStationProgress(studentId, station.id);
            const isDemo = DEMO_STATION_IDS.has(station.id);
            const canGuestPreview = isReadOnly && isDemo;
            const unlocked = progress.journeyMapReceived || canGuestPreview;

            return (
              <button
                type="button"
                key={station.id}
                onClick={() => openMap(station)}
                disabled={!unlocked}
                className={`text-left rounded-3xl overflow-hidden border transition relative ${
                  unlocked
                    ? 'bg-white border-sky-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-slate-100 border-slate-200 opacity-75 cursor-not-allowed'
                }`}
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-200">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={unlocked ? (station.journeyMap?.image || station.coverImage) : station.coverImage}
                    alt={unlocked ? `Bản đồ hành trình ${station.titleVi}` : ''}
                    className={`w-full h-full ${unlocked ? 'object-contain bg-white' : 'object-cover grayscale blur-[1px]'}`}
                    onError={event => {
                      const img = event.currentTarget;
                      if (img.dataset.fallback === 'default') return;
                      if (img.dataset.fallback !== 'cover' && img.src !== station.coverImage) {
                        img.dataset.fallback = 'cover';
                        img.src = station.coverImage;
                        return;
                      }
                      img.dataset.fallback = 'default';
                      img.src = DEFAULT_APP_BACKGROUND_DATA_URL;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-white/90 text-slate-900 text-[10px] font-black">
                    BẢN ĐỒ {station.number}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="font-black text-sm leading-tight">{station.titleVi}</div>
                  </div>
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950/75 text-white flex items-center justify-center">
                        <Lock className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {progress.journeyMapReceived ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-black">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ĐÃ THU THẬP</span>
                    </div>
                  ) : canGuestPreview ? (
                    <div className="text-amber-700 text-xs font-black">XEM THỬ BẢN ĐỒ DEMO</div>
                  ) : (
                    <div className="text-slate-500 text-xs font-bold">
                      Hoàn thành bài và Đổi quà để mở
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-xl flex items-center justify-center text-6xl shrink-0">
            {treasureProgress.chestOpened ? '✨' : '🧰'}
          </div>
          <div className="flex-1 text-center lg:text-left space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-amber-700">Thử thách cuối khối</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Rương Kho báu Khối {currentGrade}</h2>
            <p className="text-sm text-slate-600">
              {gradeSummary.treasureChestEligible
                ? 'Em đã đủ điều kiện! 5 mảnh chìa khóa đã sẵn sàng ghép thành Chìa khóa Kho báu.'
                : `Cần đủ 5/5 bài, 5/5 bản đồ và 5/5 mảnh chìa khóa. Hiện tại: ${gradeSummary.totalJourneyMaps}/5 bản đồ.`}
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full lg:w-auto">
            {gradeSummary.treasureChestEligible ? (
              <button
                type="button"
                onClick={handleOpenTreasure}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm shadow-lg hover:scale-103 active:scale-95 transition inline-flex items-center justify-center gap-2"
              >
                <KeyRound className="w-5 h-5" />
                <span>{treasureProgress.chestOpened ? 'XEM LẠI KHO BÁU' : 'MỞ RƯƠNG KHO BÁU'}</span>
              </button>
            ) : (
              <div className="px-5 py-3 rounded-2xl bg-slate-200 text-slate-600 text-xs font-black text-center inline-flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>RƯƠNG ĐANG KHÓA</span>
              </div>
            )}

            {!gradeSummary.treasureChestEligible && (
              <button
                type="button"
                onClick={handlePreviewTreasure}
                className="px-5 py-2.5 rounded-xl border border-amber-300 bg-white text-amber-800 text-xs font-black hover:bg-amber-50 transition"
              >
                XEM TRƯỚC QUÀ CUỐI KHỐI (DEMO)
              </button>
            )}
          </div>
        </div>
      </section>

      {selectedStation && mapZoomed && (
        <div className="fixed inset-0 z-[70] bg-slate-950/95 p-3 sm:p-6 flex items-center justify-center" onClick={() => setMapZoomed(false)}>
          <button
            type="button"
            onClick={() => setMapZoomed(false)}
            className="absolute top-4 right-4 z-10 h-11 w-11 rounded-xl bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
            aria-label="Đóng ảnh phóng to"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedStation.journeyMap?.image || selectedStation.coverImage}
            alt={'Bản đồ hành trình phóng to ' + selectedStation.titleVi}
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            onClick={event => event.stopPropagation()}
            onError={event => {
              const img = event.currentTarget;
              if (img.src !== selectedStation.coverImage) img.src = selectedStation.coverImage;
            }}
          />
        </div>
      )}

      {selectedStation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden my-3">
            <div className="relative min-h-[260px] bg-slate-900">
              <img loading="lazy" decoding="async" src={selectedStation.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-br from-sky-950/90 via-indigo-950/75 to-amber-900/55" />
              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative z-10 p-7 sm:p-10 text-white text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black">
                  <MapIcon className="w-4 h-4" />
                  <span>BẢN ĐỒ HÀNH TRÌNH • KHỐI {selectedStation.grade}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mt-4">{selectedStation.titleVi}</h2>
                <p className="text-sm text-sky-100 mt-2 max-w-2xl mx-auto">{selectedStation.subtitleVi}</p>
                {isReadOnly && (
                  <div className="mt-4 inline-block px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-bold">
                    BẢN XEM THỬ • Không lưu vào hồ sơ
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-7">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMapZoomed(true)}
                  className="group mx-auto block max-w-[220px] sm:max-w-[260px] rounded-2xl border-4 border-amber-100 bg-white overflow-hidden shadow-xl relative z-10"
                  aria-label="Phóng to bản đồ hành trình"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={selectedStation.journeyMap?.image || selectedStation.coverImage}
                    alt="Bản đồ hành trình"
                    className="w-full max-h-80 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-slate-950/75 px-2 py-1 text-[11px] font-bold text-white">
                    <ZoomIn className="h-3.5 w-3.5" /> Phóng to
                  </span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {buildMapNodes(selectedStation).map((node, index) => (
                    <div key={node.id} className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0">
                        {node.icon ?? ['📍', '🔎', '💡', '🌱'][index] ?? '✨'}
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900">{node.titleVi}</div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed">{node.textVi}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
                  <div className="text-xs font-black text-sky-700 uppercase">Em đã biết</div>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {selectedStation.journeyMap?.knowVi ?? selectedStation.pedagogyGoals.knowGoalVi}
                  </p>
                </div>
                <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
                  <div className="text-xs font-black text-violet-700 uppercase">Em đã hiểu</div>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {selectedStation.journeyMap?.understandVi ?? selectedStation.pedagogyGoals.understandGoalVi}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <div className="text-xs font-black text-emerald-700 uppercase">Em sẽ ứng xử</div>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {selectedStation.journeyMap?.actVi ?? selectedStation.pedagogyGoals.behaviorGoalVi}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-amber-300 font-black uppercase">Dấu hành trình</div>
                  <div className="font-black mt-1">{selectedStation.stamp.nameVi}</div>
                  <div className="text-xs text-slate-300 mt-1">“{selectedStation.stamp.quoteVi}”</div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-xs font-bold">
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span>+ 1 Mảnh chìa khóa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewTreasure && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden my-4">
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 p-6 sm:p-8 text-slate-950 text-center relative">
              <button
                type="button"
                onClick={() => setPreviewTreasure(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/10 hover:bg-black/15 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-6xl">🎁</div>
              <div className="mt-2 text-xs font-black uppercase tracking-widest">Rương Kho báu Khối {currentGrade}</div>
              <h2 className="text-3xl font-black mt-2">
                {treasureProgress.chestOpened ? 'Kho báu đã được mở!' : 'Xem trước phần thưởng cuối khối'}
              </h2>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {!treasureProgress.chestOpened && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 font-semibold text-center">
                  Đây là bản xem trước của phiên bản demo, không làm thay đổi tiến độ hay phần thưởng của học sinh.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
                  <Award className="w-9 h-9 text-indigo-700 mx-auto" />
                  <div className="font-black text-slate-900 mt-2">Huy hiệu hoàn thành Khối {currentGrade}</div>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center">
                  <div className="text-4xl">{gradeTreasure.icon}</div>
                  <div className="font-black text-slate-900 mt-2">{gradeTreasure.name}</div>
                </div>
              </div>

              <div className="rounded-3xl border-4 border-double border-amber-300 bg-gradient-to-br from-white via-amber-50 to-sky-50 p-6 sm:p-8 text-center shadow-inner">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <Star className="w-5 h-5" />
                  <span className="font-black tracking-widest text-xs">CHẠM ĐÀ NẴNG</span>
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4">CHỨNG NHẬN NHÀ KHÁM PHÁ</h3>
                <p className="text-sm sm:text-base text-slate-700 mt-4 leading-relaxed">
                  Bạn đã hoàn thành hành trình khám phá quê hương lớp {currentGrade} trong <strong>CHẠM ĐÀ NẴNG</strong>.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs">
                  <div className="rounded-xl bg-white/80 border border-slate-200 p-3">
                    <strong>Nhà khám phá:</strong><br />
                    {isReadOnly
                      ? 'Xem trước phần thưởng'
                      : (currentUser as any)?.displayName || currentUser?.name || 'Học sinh'}
                  </div>
                  <div className="rounded-xl bg-white/80 border border-slate-200 p-3">
                    <strong>Thành tích:</strong><br />
                    Hoàn thành 5/5 bài học • 5/5 Bản đồ
                  </div>
                </div>

                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-amber-300 font-black text-xs">
                  <Compass className="w-4 h-4" />
                  <span>NHÀ KHÁM PHÁ ĐÀ NẴNG – KHỐI {currentGrade}</span>
                </div>

                <p className="text-xs text-slate-600 italic mt-5">
                  “Tiếp tục khám phá, trân trọng và lan tỏa những giá trị đẹp của quê hương Đà Nẵng.”
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJourneyMapsView;

