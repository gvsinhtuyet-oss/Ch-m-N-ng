import React, { useEffect, useMemo, useState } from 'react';
import { Station, ExplorationHotspot } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService, NarrationState } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { RewardClaimModal } from '../common/RewardClaimModal';
import { DEFAULT_APP_BACKGROUND_DATA_URL } from '../../assets/defaultAppBackground';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  LockKeyhole,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  X,
} from 'lucide-react';

interface Props {
  station: Station;
  onCompleteStage: () => void;
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const HoiAnStage1Exploration: React.FC<Props> = ({ station, onCompleteStage }) => {
  const { currentUser, role, language, setAssistantHotspot } = useApp();
  const studentId = currentUser?.id || 'guest';
  const readOnly = role !== 'student';

  const [index, setIndex] = useState(0);
  const [narrationState, setNarrationState] = useState<NarrationState>('idle');
  const [narrationCompleted, setNarrationCompleted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [showVr, setShowVr] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [sessionCompletedHotspotIds, setSessionCompletedHotspotIds] = useState<string[]>(() =>
    progressService.getStationProgress(studentId, station.id).exploredHotspotIds
  );

  const hotspot: ExplorationHotspot = station.hotspots[index] || station.hotspots[0];
  const previewHotspot: ExplorationHotspot =
    station.hotspots[previewIndex ?? index] || hotspot;
  const progress = progressService.getStationProgress(studentId, station.id);
  const options = useMemo(() => shuffle(hotspot.interaction?.options || []), [hotspot]);
  const completedHotspotIds = new Set([
    ...progress.exploredHotspotIds,
    ...sessionCompletedHotspotIds,
  ]);
  const explored = completedHotspotIds.has(hotspot.id);
  const remainingHotspotCount = station.hotspots.filter(item => !completedHotspotIds.has(item.id)).length;
  const freeReview = progress.stage1Completed || progress.stationCompleted || progress.stampReceived;
  const firstIncompleteIndex = station.hotspots.findIndex(item => !completedHotspotIds.has(item.id));
  const activeUnlockIndex = firstIncompleteIndex === -1 ? station.hotspots.length - 1 : firstIncompleteIndex;
  const canAccessHotspot = (itemIndex: number) =>
    freeReview || completedHotspotIds.has(station.hotspots[itemIndex]?.id) || itemIndex === activeUnlockIndex;
  const playing = narrationState === 'playing';
  const paused = narrationState === 'paused';

  useEffect(() => {
    setAssistantHotspot(hotspot);
    return () => setAssistantHotspot(null);
  }, [hotspot.id, setAssistantHotspot]);

  useEffect(() => audioService.subscribeState(setNarrationState), []);

  useEffect(() => {
    backgroundMusic.setForegroundSource('station-vr360', showVr);
    return () => backgroundMusic.setForegroundSource('station-vr360', false);
  }, [showVr]);

  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setCorrect(false);
    setLockMessage('');
    setNarrationCompleted(false);
    audioService.stopNarration();
  }, [index]);

  const openImagePreview = (itemIndex: number) => {
    setPreviewIndex(itemIndex);
    setShowImage(true);
  };

  const speak = () => {
    const text =
      language === 'en' && hotspot.narrationEn
        ? hotspot.narrationEn
        : hotspot.narrationVi;
    setNarrationCompleted(false);
    audioService.speakNarration(
      text,
      language === 'en' ? 'en-US' : 'vi-VN',
      () => setNarrationCompleted(true)
    );
  };

  const speakPreview = () => {
    const text =
      language === 'en' && previewHotspot.narrationEn
        ? previewHotspot.narrationEn
        : previewHotspot.narrationVi;
    audioService.speakNarration(text, language === 'en' ? 'en-US' : 'vi-VN');
  };

  const choose = (id: string) => {
    if (submitted) return;
    audioService.playSfx('click');
    setSelected(id);
  };

  const check = () => {
    if (!selected || !hotspot.interaction) return;
    const ok = !!hotspot.interaction.options.find(option => option.id === selected)?.isCorrect;
    setCorrect(ok);
    setSubmitted(true);
    audioService.playSfx(ok ? 'correct' : 'wrong');
    if (ok) {
      setSessionCompletedHotspotIds(current =>
        current.includes(hotspot.id) ? current : [...current, hotspot.id]
      );
      if (!readOnly) {
        progressService.completeHotspot(studentId, station.id, hotspot.id);
      }

      if (!freeReview) {
        window.setTimeout(() => {
          if (index < station.hotspots.length - 1) {
            setIndex(index + 1);
          } else {
            if (!readOnly) {
              progressService.completeStage1(studentId, station.id);
            }
            setShowReward(true);
          }
        }, 900);
      }
    }
  };

  const go = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= station.hotspots.length) return;

    // Khóa tuyệt đối chiều tiến trong lần học đầu:
    // dù đi bằng thẻ điểm, ảnh lớn hay nút Tiếp, học sinh phải trả lời đúng
    // câu hỏi của điểm hiện tại trước khi sang điểm sau.
    if (nextIndex > index && !freeReview && !explored) {
      setLockMessage(`Em hãy trả lời đúng câu hỏi ở Điểm ${index + 1} trước khi sang Điểm ${nextIndex + 1} nhé!`);
      audioService.playSfx('wrong');
      return;
    }

    if (!canAccessHotspot(nextIndex)) {
      const requiredIndex = Math.max(0, activeUnlockIndex);
      setLockMessage(`Em hãy trả lời đúng câu hỏi ở Điểm ${requiredIndex + 1} trước để mở Điểm ${nextIndex + 1} nhé!`);
      audioService.playSfx('wrong');
      return;
    }
    setLockMessage('');
    audioService.playSfx('transition');
    setIndex(nextIndex);
  };

  const next = () => {
    // Giữ đúng luồng tuần tự: Điểm 1 -> 2 -> 3 -> 4.
    // Không tự bỏ qua một điểm chỉ vì điểm đó đã có dữ liệu hoàn thành từ lần thử trước.
    if (index < station.hotspots.length - 1) {
      setLockMessage('');
      audioService.playSfx('transition');
      setIndex(index + 1);
      return;
    }

    const allCompleted = station.hotspots.every(item =>
      new Set([
        ...progressService.getStationProgress(studentId, station.id).exploredHotspotIds,
        ...sessionCompletedHotspotIds,
        hotspot.id,
      ]).has(item.id)
    );

    if (!allCompleted) {
      const firstMissingIndex = station.hotspots.findIndex(item =>
        !new Set([
          ...progressService.getStationProgress(studentId, station.id).exploredHotspotIds,
          ...sessionCompletedHotspotIds,
          hotspot.id,
        ]).has(item.id)
      );
      if (firstMissingIndex >= 0) {
        setLockMessage(`Em còn Điểm ${firstMissingIndex + 1} chưa hoàn thành.`);
        setIndex(firstMissingIndex);
      }
      return;
    }

    if (!readOnly) {
      progressService.completeStage1(studentId, station.id);
    }
    setShowReward(true);
  };

  return (
    <div className="min-h-0">
      <section className="overflow-hidden rounded-[2rem] border border-orange-200/90 bg-white/92 p-3 shadow-[0_18px_55px_rgba(154,52,18,0.16)] backdrop-blur-xl">
        <div className="grid min-h-[500px] gap-3 lg:h-[calc(100dvh-310px)] lg:min-h-[500px] lg:grid-cols-[1.72fr_1fr]">
          {/* LEFT: immersive visual explorer */}
          <div className="flex min-h-0 flex-col gap-3">
            <div className="relative min-h-[350px] flex-1 overflow-hidden rounded-[1.65rem] border-2 border-orange-200 bg-slate-950 shadow-xl">
              <button
                type="button"
                onClick={() => openImagePreview(index)}
                className="group absolute inset-0 z-0 h-full w-full cursor-zoom-in"
                aria-label="Xem ảnh lớn"
              >
                <img
                  src={hotspot.image}
                  alt={hotspot.titleVi}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  onError={event => {
                    const img = event.currentTarget;
                    if (img.dataset.fallback === 'default') return;
                    if (img.dataset.fallback !== 'cover' && hotspot.image !== station.coverImage) {
                      img.dataset.fallback = 'cover';
                      img.src = station.coverImage;
                      return;
                    }
                    img.dataset.fallback = 'default';
                    img.src = DEFAULT_APP_BACKGROUND_DATA_URL;
                  }}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-slate-950/62 via-transparent to-slate-950/10" />
              </button>

              <button
                type="button"
                onClick={() => openImagePreview(index)}
                className="absolute left-4 top-4 z-20 max-w-[62%] rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-left shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-orange-50"
                aria-label={`Khám phá bức tranh ${station.titleVi} ở chế độ ảnh lớn`}
              >
                <div className="flex items-center gap-2 text-orange-600">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate text-sm font-black">Khám phá bức tranh</span>
                </div>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-600">
                  Chạm để xem ảnh lớn và quan sát kĩ từng chi tiết.
                </p>
              </button>

              <div className="absolute right-4 top-4 z-20">
                {station.vr360Experience?.verified && station.vr360Experience.url && (
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playSfx('click');
                      setShowVr(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-white/90 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 px-5 py-2.5 text-xs font-black text-white shadow-[0_10px_28px_rgba(249,115,22,0.35)] ring-2 ring-orange-200/70 transition hover:-translate-y-0.5 hover:scale-[1.02]"
                  >
                    <Globe className="h-4 w-4" />
                    KHÁM PHÁ 360°
                  </button>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-950/74 p-1.5 backdrop-blur-md">
                  {!playing && !paused && (
                    <button
                      type="button"
                      onClick={speak}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-xs font-black text-white"
                    >
                      <Volume2 className="h-4 w-4" />
                      {narrationCompleted ? 'ĐÃ NGHE THUYẾT MINH' : 'NGHE THUYẾT MINH'}
                      {narrationCompleted && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  )}

                  {playing && (
                    <>
                      <button
                        type="button"
                        onClick={() => audioService.pauseNarration()}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-2.5 text-xs font-black text-slate-950"
                      >
                        <Pause className="h-4 w-4" />
                        TẠM DỪNG
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          audioService.stopNarration();
                          speak();
                        }}
                        className="rounded-xl bg-white/15 p-2.5 text-white"
                        title="Nghe lại từ đầu"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {paused && (
                    <button
                      type="button"
                      onClick={() => audioService.resumeNarration()}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-xs font-black text-white"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      TIẾP TỤC NGHE
                    </button>
                  )}
                </div>

                <div className="rounded-full bg-white/94 px-3 py-1.5 text-[10px] font-black text-slate-700 shadow-lg">
                  Điểm chạm {index + 1}/{station.hotspots.length}
                </div>
              </div>
            </div>

            {/* hotspot shortcut cards */}
            <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
              {station.hotspots.map((item, itemIndex) => {
                const done = completedHotspotIds.has(item.id);
                const active = itemIndex === index;
                const unlocked = canAccessHotspot(itemIndex);
                const isCurrentOpen = !done && unlocked;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (freeReview) {
                        go(itemIndex);
                      } else {
                        audioService.playSfx('click');
                        openImagePreview(itemIndex);
                      }
                    }}
                    aria-disabled={false}
                    className={`group relative flex min-w-0 items-center gap-2 overflow-hidden rounded-2xl border p-2 text-left transition ${
                      active
                        ? 'border-orange-500 bg-orange-50 shadow-lg ring-2 ring-orange-300'
                        : done
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm hover:bg-emerald-100'
                          : isCurrentOpen
                            ? 'border-sky-400 bg-sky-50 shadow-sm hover:bg-sky-100'
                            : 'border-slate-300 bg-slate-100/95 text-slate-500 hover:border-orange-300 hover:bg-orange-50/70'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt=""
                      className={`h-12 w-14 shrink-0 rounded-xl object-cover ${!unlocked && !freeReview ? 'opacity-70' : ''}`}
                      onError={event => {
                        const img = event.currentTarget;
                        img.onerror = null;
                        img.src = station.coverImage || DEFAULT_APP_BACKGROUND_DATA_URL;
                      }}
                    />
                    <span className="min-w-0">
                      <span className={`flex items-center gap-1 text-[9px] font-black uppercase ${
                        done ? 'text-emerald-700' : isCurrentOpen ? 'text-sky-700' : 'text-slate-400'
                      }`}>
                        Điểm {itemIndex + 1}
                        {done ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        ) : !unlocked ? (
                          <LockKeyhole className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3 fill-current" />
                        )}
                      </span>
                      <span className={`mt-0.5 line-clamp-2 block text-[11px] font-black leading-4 ${
                        !unlocked ? 'text-slate-400' : 'text-slate-800'
                      }`}>
                        {item.titleVi}
                      </span>
                      <span className={`mt-0.5 block text-[9px] font-bold ${
                        done ? 'text-emerald-600' : isCurrentOpen ? 'text-sky-600' : 'text-slate-400'
                      }`}>
                        {done ? 'Hoàn thành' : isCurrentOpen ? 'Đang khám phá' : freeReview ? 'Sẵn sàng' : 'Xem ảnh trước'}
                      </span>
                    </span>
                    {!unlocked && freeReview && <span className="absolute inset-0 bg-white/15" />}
                  </button>
                );
              })}
            </div>
            {lockMessage && (
              <div className="shrink-0 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800 shadow-sm">
                {lockMessage}
              </div>
            )}
          </div>

          {/* RIGHT: information rail */}
          <aside className="hoi-an-right-rail flex h-full min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain pr-2 pb-2 lg:max-h-full">
            <div className="shrink-0 rounded-[1.5rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50/70 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                      Điểm chạm {index + 1}
                    </span>
                    {explored && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        ĐÃ KHÁM PHÁ
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-xl font-black leading-tight text-slate-950">
                    {hotspot.titleVi}
                  </h2>
                  {hotspot.subtitleVi && (
                    <p className="mt-1 text-xs font-bold text-orange-700">
                      {hotspot.subtitleVi}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-3 pr-1 text-[13px] font-semibold leading-6 text-slate-700 sm:text-[14px]">
                {hotspot.narrationVi}
              </p>

              {hotspot.keyFactVi && (
                <div className="mt-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 p-3 shadow-sm shadow-amber-100/60">
                  <p className="text-[9px] font-black uppercase tracking-wide text-amber-700">
                    Điều thú vị cần nhớ
                  </p>
                  <p className="mt-1 text-[11px] font-black leading-4 text-slate-800">
                    {hotspot.keyFactVi}
                  </p>
                </div>
              )}
            </div>

            {hotspot.interaction ? (
              <div className="shrink-0 rounded-[1.5rem] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50/70 p-4 shadow-sm shadow-sky-100/50">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-black text-white shadow-sm shadow-sky-300/60">
                    ?
                  </span>
                  <h3 className="text-[15px] font-black text-slate-950 sm:text-base">Thử tài quan sát</h3>
                </div>

                <p className="text-[13px] font-black leading-6 text-slate-800 sm:text-[14px]">
                  {hotspot.interaction.questionVi}
                </p>

                <div className="mt-3 space-y-2">
                  {options.map(option => {
                    const active = selected === option.id;
                    let className =
                      'border-sky-100 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50';

                    if (submitted && correct && option.isCorrect) {
                      className =
                        'border-emerald-400 bg-emerald-50 text-emerald-800';
                    } else if (submitted && !correct && active) {
                      className = 'border-rose-400 bg-rose-50 text-rose-700';
                    } else if (active) {
                      className =
                        'border-sky-500 bg-sky-100 text-sky-900 ring-2 ring-sky-200';
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={submitted}
                        onClick={() => choose(option.id)}
                        className={`w-full rounded-xl border px-3.5 py-3 text-left text-[13px] font-bold leading-5 transition sm:text-[14px] ${className}`}
                      >
                        {option.textVi}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <p
                    className={`mt-2 rounded-xl p-3 text-[13px] font-bold leading-5 sm:text-[14px] ${correct
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-800'}`}
                  >
                    {correct
                      ? (index < station.hotspots.length - 1
                          ? `Chính xác! Em đã mở Điểm ${index + 2}. Hãy tiếp tục khám phá nhé!`
                          : 'Chính xác! Em đã hoàn thành câu hỏi ở điểm cuối.')
                      : 'Chưa đúng rồi. Em nhìn lại ảnh hoặc nghe thuyết minh nhé!'}
                  </p>
                )}

                <div className="mt-3">
                  {!submitted && (
                    <button
                      type="button"
                      disabled={!selected}
                      onClick={check}
                      className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-black !text-white shadow-md shadow-orange-200/70 transition hover:from-orange-600 hover:to-amber-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                    >
                      KIỂM TRA
                    </button>
                  )}

                  {submitted && !correct && (
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setSelected(null);
                      }}
                      className="w-full rounded-xl bg-amber-400 py-3.5 text-sm font-black text-slate-950"
                    >
                      THỬ LẠI
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div />
            )}

            <div className="sticky bottom-0 z-20 shrink-0 rounded-[1.5rem] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-3 shadow-[0_-8px_24px_rgba(15,118,110,0.10)] backdrop-blur-md">
              <p className="text-[10px] font-black text-emerald-700">NHÀ PHIÊU LƯU ƠI!</p>
              <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-600">
                {freeReview
                  ? 'Em đã hoàn thành Chặng 1. Bây giờ có thể chọn xem lại bất kỳ điểm nào.'
                  : 'Em có thể xem trước các ảnh. Muốn đi tiếp hành trình, hãy đóng ảnh và trả lời đúng câu hỏi của điểm hiện tại.'}
              </p>

              {submitted && correct && freeReview ? (
                <>
                  {remainingHotspotCount > 0 && (
                    <p className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-[11px] font-bold leading-4 text-sky-800 ring-1 ring-sky-200">
                      Tốt lắm! Em còn {remainingHotspotCount} điểm trước khi hoàn thành Chặng 1.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={next}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20"
                  >
                    {index === station.hotspots.length - 1 && remainingHotspotCount === 0
                      ? 'HOÀN THÀNH CHẶNG 1'
                      : `KHÁM PHÁ ĐIỂM ${Math.min(index + 2, station.hotspots.length)}`}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="mt-2 flex items-center gap-1.5">
                  {station.hotspots.map((item, itemIndex) => (
                    <span
                      key={item.id}
                      className={`h-2 flex-1 rounded-full ${itemIndex === index
                        ? 'bg-orange-500'
                        : completedHotspotIds.has(item.id)
                          ? 'bg-emerald-400'
                          : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {showImage && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-md sm:p-6">
          <div className="grid h-[92dvh] max-h-[92dvh] min-h-0 w-full max-w-6xl overflow-hidden rounded-[2rem] border border-orange-200 bg-[#fffaf2] shadow-2xl lg:grid-cols-[1.55fr_.75fr]">
            <div className="relative min-h-0 bg-slate-950">
              <img
                src={previewHotspot.image}
                alt={previewHotspot.titleVi}
                className="h-full w-full object-cover"
                onError={event => {
                  const img = event.currentTarget;
                  if (img.dataset.fallback === 'default') return;
                  if (img.dataset.fallback !== 'cover' && previewHotspot.image !== station.coverImage) {
                    img.dataset.fallback = 'cover';
                    img.src = station.coverImage;
                    return;
                  }
                  img.dataset.fallback = 'default';
                  img.src = DEFAULT_APP_BACKGROUND_DATA_URL;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
              {freeReview && (
                <div className="absolute bottom-5 left-5 right-5 flex justify-between">
                  <button
                    type="button"
                    disabled={(previewIndex ?? index) === 0}
                    onClick={() => {
                      const nextPreview = Math.max(0, (previewIndex ?? index) - 1);
                      setPreviewIndex(nextPreview);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-slate-700 shadow disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={(previewIndex ?? index) === station.hotspots.length - 1}
                    onClick={() => {
                      const nextPreview = Math.min(station.hotspots.length - 1, (previewIndex ?? index) + 1);
                      setPreviewIndex(nextPreview);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-orange-700 shadow disabled:opacity-40"
                  >
                    Tiếp
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative h-full min-h-0 overflow-y-auto overscroll-contain p-5 pb-8 sm:p-7 sm:pb-9">
              <button
                type="button"
                onClick={() => {
                  audioService.stopNarration();
                  setShowImage(false);
                  setPreviewIndex(null);
                }}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                aria-label="Đóng ảnh lớn"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pr-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-[10px] font-black uppercase text-orange-700">
                  <MapPin className="h-3.5 w-3.5" />
                  Điểm nổi bật
                </span>
                <h3 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-[28px]">
                  {previewHotspot.titleVi}
                </h3>
                {previewHotspot.subtitleVi && (
                  <p className="mt-1 text-sm font-bold text-orange-700">
                    {previewHotspot.subtitleVi}
                  </p>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-orange-100 bg-white p-4">
                <p className="text-sm font-semibold leading-6 text-slate-700">
                  {previewHotspot.narrationVi}
                </p>
              </div>

              {previewHotspot.keyFactVi && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-[10px] font-black uppercase text-orange-700">
                    Điều thú vị cần nhớ
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-800">
                    {previewHotspot.keyFactVi}
                  </p>
                </div>
              )}

              <div className="sticky bottom-0 mt-5 bg-gradient-to-t from-[#fffaf2] via-[#fffaf2]/95 to-transparent pt-3">
                <button
                  type="button"
                  onClick={speakPreview}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3.5 text-sm font-black !text-white shadow-lg shadow-orange-200/60"
                >
                  <Volume2 className="h-4 w-4" />
                  NGHE THUYẾT MINH
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVr && station.vr360Experience?.url && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-md sm:p-6">
          <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-orange-200 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/95 px-4 py-3 text-white sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">
                    {station.vr360Experience.titleVi || `Khám phá ${station.titleVi} 360°`}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Không gian thực tế ảo • Khám phá điểm đến
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={station.vr360Experience.fallbackUrl || station.vr360Experience.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black text-white hover:bg-white/15 sm:inline-flex"
                >
                  MỞ TAB MỚI
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowVr(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-rose-500"
                  aria-label="Đóng trải nghiệm 360 độ"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-slate-950">
              <iframe
                src={station.vr360Experience.url}
                title={station.vr360Experience.titleVi || `Khám phá ${station.titleVi} 360°`}
                className="h-full w-full border-0"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 px-4 py-2 text-[10px] font-bold text-white/85 backdrop-blur-md">
                Kéo để quan sát • Chạm để khám phá không gian 360°
              </div>
            </div>
          </div>
        </div>
      )}

      {showReward && (
        <RewardClaimModal
          reward={station.rewards.find(reward => reward.stage === 1) || station.rewards[0]}
          stage={1}
          alreadyClaimed={
            !readOnly &&
            progress.rewardsCollected.includes(
              station.rewards.find(reward => reward.stage === 1)?.id || ''
            )
          }
          onClaim={() => {
            if (!readOnly) {
              const reward = station.rewards.find(item => item.stage === 1);
              if (reward) {
                progressService.claimReward(studentId, station.id, reward.id);
              }
            }
          }}
          onContinue={() => {
            setShowReward(false);
            onCompleteStage();
          }}
        />
      )}
    </div>
  );
};
