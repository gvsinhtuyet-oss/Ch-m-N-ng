import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, RotateCcw, ArrowRight, Map, KeyRound, Gift, ZoomIn, X, Stamp } from 'lucide-react';
import { RewardBadge } from '../common/RewardBadge';

interface Props {
  station: Station;
  onReviewJourney: () => void;
  onExploreNext: () => void;
}

export const Stage4Stamp: React.FC<Props> = ({ station, onReviewJourney, onExploreNext }) => {
  const { currentUser, role } = useApp();
  const isReadOnly = role !== 'student';
  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);

  const [stamped, setStamped] = useState<boolean>(progress.stampReceived || progress.stationCompleted);
  const [giftClaimed, setGiftClaimed] = useState<boolean>(
    progress.journeyMapReceived && progress.keyFragmentReceived
  );
  const [showGiftReveal, setShowGiftReveal] = useState(false);
  const [mapZoomed, setMapZoomed] = useState(false);
  const [mapImageFailed, setMapImageFailed] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const canExchange = isReadOnly || (
    progress.stage1Completed &&
    progress.stage2Completed &&
    progress.stage3Completed
  );

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const exchanging = useRef(false);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
  }, []);

  const schedule = (callback: () => void, delay: number) => {
    timers.current.push(setTimeout(callback, delay));
  };

  const celebrate = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 105,
        startVelocity: 46,
        origin: { y: 0.38 },
        zIndex: 10000,
        disableForReducedMotion: true,
      });
      schedule(() => {
        confetti({ particleCount: 35, angle: 60, spread: 78, origin: { x: 0, y: 0.65 }, zIndex: 10000, disableForReducedMotion: true });
        confetti({ particleCount: 35, angle: 120, spread: 78, origin: { x: 1, y: 0.65 }, zIndex: 10000, disableForReducedMotion: true });
      }, 280);
    } catch {
      // Hiệu ứng chỉ là phần trang trí, không ảnh hưởng luồng học tập.
    }
  };

  const handleJourneyGift = () => {
    if (!canExchange || exchanging.current) return;
    exchanging.current = true;

    setSaveMessage('');
    setMapImageFailed(false);
    setMapZoomed(false);
    setShowGiftReveal(true);

    audioService.playSfx('map');
    schedule(() => audioService.playSfx('victory'), 180);
    schedule(() => audioService.playSfx('treasure'), 650);
    celebrate();

    exchanging.current = false;
  };

  const saveMapAndStamp = () => {
    setSaveMessage('');
    audioService.playSfx('stamp');

    if (isReadOnly) {
      setGiftClaimed(true);
      setStamped(true);
      setSaveMessage('Bản xem thử – hiệu ứng hoàn thành được mô phỏng, dữ liệu không lưu vào tài khoản.');
    } else {
      const updated = progressService.finalizeJourneyAndStamp(studentId, station.id);
      if (
        !updated.journeyMapReceived ||
        !updated.keyFragmentReceived ||
        !updated.stage4Completed ||
        !updated.stationCompleted ||
        !updated.stampReceived
      ) {
        setSaveMessage('Chưa thể hoàn thành. Em hãy hoàn thành đủ 3 chặng trước rồi thử lại.');
        return;
      }
      setGiftClaimed(true);
      setStamped(true);
      setSaveMessage('✓ Bản đồ đã lưu • Đã nhận 1 mảnh chìa khóa • Hộ chiếu đã được đóng dấu.');
    }

    try {
      confetti({
        particleCount: 100,
        spread: 105,
        startVelocity: 48,
        origin: { y: 0.5 },
        zIndex: 10000,
        disableForReducedMotion: true,
      });
      schedule(() => audioService.playSfx('victory'), 240);
      schedule(() => audioService.playSfx('treasure'), 700);
    } catch {
      // Hiệu ứng chỉ là trang trí.
    }
  };

  // Pilot only: Lụa Mã Châu, grade 5. Other stations retain their original Stage 4.
  if (true) {
    return (
      <div className="relative flex h-[calc(100dvh-190px)] min-h-[420px] w-full flex-col overflow-hidden rounded-[1.5rem] border-[3px] border-amber-500 bg-[url(/images/stage4-journey-background.svg)] bg-cover bg-center p-2 shadow-2xl sm:p-3">
        <style>{`
          @keyframes journeyStampDrop {
            0% { opacity:0; transform: translateY(-90px) scale(2.2) rotate(-25deg); }
            65% { opacity:1; transform: translateY(7px) scale(.86) rotate(-13deg); }
            85% { transform: translateY(-4px) scale(1.05) rotate(-13deg); }
            100% { opacity:1; transform: translateY(0) scale(1) rotate(-13deg); }
          }
          @media (prefers-reduced-motion:reduce) { .journey-stamp { animation:none !important; } }
        `}</style>
        <header className="mb-2 flex shrink-0 items-center justify-between gap-2 rounded-xl border-2 border-amber-300 bg-[#fff1ce]/95 px-3 py-1.5 shadow-md">
          <div className="min-w-0">
            <p className="text-[10px] font-black tracking-wide text-amber-900">DẤU ẤN HÀNH TRÌNH</p>
            <h2 className="truncate text-base font-black text-red-800 sm:text-xl">✨ {station.titleVi}</h2>
          </div>
          <span className="hidden rounded-full bg-white/80 px-3 py-1 text-xs font-black text-emerald-800 sm:inline">Khám phá · Ghi nhớ · Lưu dấu</span>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] gap-2 sm:gap-3">
          <section aria-label="Bản đồ tri thức" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border-[3px] border-[#ad7737] bg-[#fff3d4] p-1.5 shadow-[0_8px_20px_rgba(74,43,12,.22)] sm:p-2">
            <div className="mb-1 flex shrink-0 items-center justify-between gap-2 px-1">
              <h3 className="truncate text-xs font-black text-[#704315] sm:text-sm">🗺️ BẢN ĐỒ TRI THỨC</h3>
              <button type="button" disabled={!station.journeyMap?.image || mapImageFailed} onClick={() => { audioService.playSfx('click'); setMapZoomed(true); }} className="flex shrink-0 items-center gap-1 rounded-lg bg-sky-700 px-2 py-1.5 text-[10px] font-black text-white disabled:opacity-50 sm:text-xs"><ZoomIn className="h-3.5 w-3.5" /> Phóng to</button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-amber-200 bg-white">
              {station.journeyMap?.image && !mapImageFailed ? <img src={station.journeyMap.image} alt={"Bản đồ tri thức " + station.titleVi} onError={() => setMapImageFailed(true)} className="h-full w-full object-contain" /> : <div className="px-3 text-center text-sm font-bold text-amber-900">Chưa tải được ảnh bản đồ tri thức của trạm.</div>}
            </div>
          </section>
          <section aria-label="Hộ chiếu hành trình" className="relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border-[3px] border-[#9b6538] bg-gradient-to-br from-[#fff9e9] via-[#f8e5bb] to-[#eac58e] p-2 shadow-[0_8px_20px_rgba(74,43,12,.25)] sm:p-3">
            <div className="shrink-0 border-b-2 border-dashed border-[#cba978] pb-2 text-center">
              <p className="text-[10px] font-black tracking-wider text-[#96621c] sm:text-xs">CHẠM ĐÀ NẴNG</p>
              <h3 className="text-sm font-black text-[#683917] sm:text-lg">📖 HỘ CHIẾU HÀNH TRÌNH</h3>
              <p className="mt-1 text-[10px] font-semibold text-[#704e30] sm:text-xs">{`Khối ${station.grade} · ${station.titleVi}`}</p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1">
              <p className="text-center text-[10px] font-bold text-[#78542d] sm:text-xs">{stamped ? 'Dấu ấn đã lưu trong hộ chiếu' : 'Vị trí chờ đóng dấu hoàn thành'}</p>
              <div className="relative flex aspect-square w-[min(100%,170px)] max-h-[60%] items-center justify-center rounded-full border-2 border-dashed border-[#bb9569] bg-white/35">
                {stamped ? (
                  <div className="ma-chau-stamp flex aspect-square w-[94%] flex-col items-center justify-center rounded-full border-[5px] border-double border-red-700 bg-red-50/30 p-1 text-center text-red-800 shadow-lg" style={{animation:'maChauStampDrop .7s cubic-bezier(.2,.85,.25,1.1) both'}}>
                    <span className="text-[8px] font-black sm:text-[10px]">CHẠM ĐÀ NẴNG</span>
                    <Stamp className="my-1 h-6 w-6 sm:h-9 sm:w-9" />
                    <span className="text-[10px] font-black leading-tight sm:text-xs">{station.stamp?.nameVi || station.titleVi}</span>
                    <span className="text-[8px] font-black sm:text-[10px]">ĐÃ HOÀN THÀNH</span>
                  </div>
                ) : <div className="flex flex-col items-center gap-2 text-[#b99a75]"><Stamp className="h-10 w-10 opacity-50" /><span className="text-[10px] font-bold">CHƯA ĐÓNG DẤU</span></div>}
              </div>
              <div className="flex items-center justify-center gap-1 rounded-xl bg-white/70 px-2 py-1 text-center text-[10px] font-bold text-[#765023] sm:text-xs"><KeyRound className="h-4 w-4 shrink-0 text-amber-700" />{giftClaimed ? 'Đã nhận 1 mảnh chìa khóa' : 'Phần thưởng: 1 mảnh chìa khóa'}</div>
              {saveMessage && <p role="status" className="line-clamp-2 text-center text-[10px] font-bold text-emerald-900">{saveMessage}</p>}
            </div>
          </section>
        </div>
        <div className="mt-2 grid shrink-0 grid-cols-3 gap-1.5 sm:gap-2">
          <button type="button" disabled={!station.journeyMap?.image || mapImageFailed} onClick={() => { audioService.playSfx('click'); setMapZoomed(true); }} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-sky-300 bg-gradient-to-b from-sky-100 to-sky-300 px-1 py-2 text-[10px] font-black text-sky-950 shadow sm:text-sm disabled:opacity-50"><ZoomIn className="h-4 w-4 shrink-0" />Phóng to bản đồ</button>
          <button type="button" disabled={!canExchange || stamped} onClick={() => { saveMapAndStamp(); }} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-yellow-500 bg-gradient-to-b from-yellow-100 to-amber-400 px-1 py-2 text-[10px] font-black text-amber-950 shadow sm:text-sm disabled:opacity-50"><Award className="h-4 w-4 shrink-0" />{stamped ? 'Đã nhận dấu ấn' : 'Nhận dấu ấn'}</button>
          <button type="button" onClick={() => { audioService.playSfx('click'); onExploreNext(); }} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-100 to-lime-300 px-1 py-2 text-[10px] font-black text-emerald-950 shadow sm:text-sm"><ArrowRight className="h-4 w-4 shrink-0" />Trạm tiếp theo</button>
        </div>
        {isReadOnly && <p className="mt-1 text-center text-[10px] font-semibold text-amber-950">Chế độ xem thử: không lưu phần thưởng.</p>}
        {mapZoomed && station.journeyMap?.image && !mapImageFailed && (
          <div role="dialog" aria-modal="true" aria-label="Bản đồ tri thức phóng to" className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-3" onClick={() => setMapZoomed(false)}>
            <button type="button" onClick={() => setMapZoomed(false)} aria-label="Đóng bản đồ" className="absolute right-4 top-4 z-10 rounded-xl bg-white p-2 text-slate-900"><X className="h-6 w-6" /></button>
            <img src={station.journeyMap.image} alt={"Bản đồ tri thức " + station.titleVi + " phóng to"} className="max-h-full max-w-full object-contain" onClick={event => event.stopPropagation()} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="station-stage-four max-w-5xl mx-auto space-y-4 animate-fade-in">
      <style>{`
        @keyframes journey-map-reveal {
          from { opacity: 0; transform: translateY(40px) scale(.72) rotate(-4deg); }
          to { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
        }
        @keyframes passport-stamp-hit {
          0% { opacity: 0; transform: translate(18%, 18%) scale(1.8) rotate(-20deg); }
          65% { opacity: 1; transform: translate(0, 0) scale(.92) rotate(-11deg); }
          100% { opacity: 1; transform: translate(0, 0) scale(1) rotate(-11deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .journey-map-reveal, .passport-stamp-hit { animation: none !important; }
        }
      `}</style>

      {showGiftReveal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Phần thưởng bản đồ hành trình"
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#f9edcf] to-[#e7c48c] border-[5px] border-[#9f6a30] p-5 sm:p-8 text-center shadow-2xl space-y-5"
          >
            <button
              type="button"
              onClick={() => setShowGiftReveal(false)}
              className="absolute top-3 right-3 h-10 w-10 rounded-xl bg-white/80 text-slate-600 flex items-center justify-center hover:bg-white"
              aria-label="Đóng phần thưởng"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="inline-flex rounded-full bg-amber-200 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-900">
                Phần thưởng cuối hành trình
              </span>
              <h3 className="mt-2 text-2xl font-black text-sky-950">🎉 Em đã mở khóa Bản đồ hành trình!</h3>
            </div>

            <div
              className="journey-map-reveal rounded-2xl border-2 border-amber-400 bg-amber-100 p-4 shadow-lg"
              style={{ animation: 'journey-map-reveal .7s ease-out both' }}
            >
              <h4 className="font-black text-lg text-amber-950">
                {station.journeyMap?.titleVi || 'Bản đồ hành trình ' + station.titleVi}
              </h4>

              {station.journeyMap?.image && !mapImageFailed ? (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setMapZoomed(true)}
                    className="group relative mx-auto block max-w-sm overflow-hidden rounded-xl border border-amber-300 bg-white shadow-sm"
                    aria-label="Phóng to bản đồ hành trình"
                  >
                    <img
                      loading="eager"
                      decoding="async"
                      src={station.journeyMap.image}
                      alt={'Bản đồ hành trình ' + station.titleVi}
                      onError={() => setMapImageFailed(true)}
                      className="max-h-[52vh] w-auto max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    {stamped && (
                      <div
                        className="passport-stamp-hit pointer-events-none absolute bottom-[8%] right-[4%] flex aspect-square w-[50%] max-w-[190px] items-center justify-center rounded-full border-[6px] border-double border-red-700/90 bg-red-50/20 text-red-700 shadow-lg backdrop-blur-[1px]"
                        style={{ animation: 'passport-stamp-hit .55s cubic-bezier(.2,.9,.25,1.25) both' }}
                      >
                        <div className="flex h-[86%] w-[86%] flex-col items-center justify-center rounded-full border-2 border-red-700/75 px-2 text-center">
                          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.16em]">CHẠM ĐÀ NẴNG</span>
                          <Award className="my-1 h-7 w-7 sm:h-9 sm:w-9" />
                          <span className="text-[10px] sm:text-xs font-black uppercase leading-tight">{station.stamp.nameVi}</span>
                          <span className="mt-1 text-[8px] sm:text-[10px] font-black">ĐÃ HOÀN THÀNH</span>
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-slate-950/75 px-2 py-1 text-[11px] font-bold text-white">
                      <ZoomIn className="h-3.5 w-3.5" /> Phóng to
                    </span>
                  </button>
                </div>
) : (
                <div className="mt-3 flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-amber-700/50 bg-[#f5e6c4] px-5 text-center text-amber-950">
                  <Map className="h-12 w-12 opacity-60" />
                  <p className="text-base font-black">KHUNG BẢN ĐỒ KIẾN THỨC</p>
                  <p className="text-xs">Bản đồ của trạm sẽ xuất hiện tại đây khi được bổ sung.</p>
                </div>
              )}

            </div>

            <div className="mx-auto flex items-center justify-center gap-3 rounded-2xl bg-amber-200 p-4 text-amber-950">
              <KeyRound className="w-11 h-11 shrink-0" />
              <div className="text-left">
                <p className="font-black">
                  {stamped ? 'Hoàn thành! Em đã nhận 1 mảnh chìa khóa.' : 'Lưu bản đồ và đóng dấu để nhận 1 mảnh chìa khóa'}
                </p>
                <p className="text-xs">
                  {stamped
                    ? `Sưu tập đủ 5 mảnh để mở rương kho báu Khối ${station.grade}.`
                    : 'Chỉ cần bấm một lần: bản đồ sẽ được lưu và Hộ chiếu sẽ được đóng dấu.'}
                </p>
              </div>
            </div>

            {!stamped ? (
              <button
                type="button"
                onClick={saveMapAndStamp}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 py-4 text-slate-950 font-black inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <Map className="w-5 h-5" />
                <Stamp className="w-5 h-5" />
                LƯU BẢN ĐỒ & ĐÓNG DẤU HỘ CHIẾU
              </button>
            ) : (
              <button
                autoFocus
                type="button"
                onClick={() => setShowGiftReveal(false)}
                className="w-full rounded-2xl bg-emerald-700 py-3.5 text-white font-black inline-flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                HOÀN THÀNH TRẠM
              </button>
            )}

            {saveMessage && (
              <p role="status" className="text-sm font-semibold text-sky-900">{saveMessage}</p>
            )}
          </div>
        </div>
      )}

      {mapZoomed && station.journeyMap?.image && !mapImageFailed && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/95 p-3 sm:p-6 flex items-center justify-center"
          onClick={() => setMapZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setMapZoomed(false)}
            className="absolute top-4 right-4 z-10 h-11 w-11 rounded-xl bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
            aria-label="Đóng ảnh phóng to"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={station.journeyMap.image}
            alt={'Bản đồ hành trình phóng to ' + station.titleVi}
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            onClick={event => event.stopPropagation()}
            onError={() => {
              setMapImageFailed(true);
              setMapZoomed(false);
            }}
          />
        </div>
      )}

      <section className="station-stage-four-card relative isolate overflow-hidden rounded-[2rem] border-[5px] border-[#b67c31] bg-[#173a4c] p-3 text-center shadow-[0_20px_65px_rgba(16,34,46,.32)] sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{background:'radial-gradient(ellipse at 70% 8%, rgba(255,224,139,.45), transparent 38%),linear-gradient(150deg,#14374a 0%,#366473 33%,#6a4930 65%,#2c211e 100%)'}} />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 right-0 h-[32%] -z-10 opacity-80" style={{background:'repeating-linear-gradient(0deg,transparent 0 32px,rgba(32,18,10,.35) 33px 35px),linear-gradient(90deg,#624027,#95663b,#624027)'}} />
        <div className="mx-auto mb-4 max-w-3xl rounded-2xl border-2 border-[#eac579] bg-gradient-to-b from-[#704524] to-[#3c251d] px-3 py-3 text-[#ffe8aa] shadow-xl sm:px-8">
          <p className="text-xs font-black uppercase tracking-[.16em]">CHẶNG 4 / 4 · HỘ CHIẾU HÀNH TRÌNH</p>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-wide sm:text-3xl">DẤU ẤN NHÀ KHÁM PHÁ</h2>
          <p className="mt-1 text-sm font-bold text-amber-100">{station.titleVi}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(230px,1fr)]">
          <div className="relative min-w-0 rounded-[1.5rem] border-[5px] border-[#b17b3d] bg-[#ead4a4] p-3 shadow-[0_12px_30px_rgba(0,0,0,.35)] sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-2 text-left text-[#61401e]">
              <p className="text-sm font-black uppercase">🧭 Bản đồ kiến thức</p>
              {station.journeyMap?.image && !mapImageFailed && <button type="button" onClick={() => setMapZoomed(true)} className="inline-flex items-center gap-1 rounded-lg bg-[#714722] px-3 py-2 text-xs font-bold text-white"><ZoomIn className="h-4 w-4"/> Phóng to</button>}
            </div>
            {station.journeyMap?.image && !mapImageFailed ? (
              <button type="button" onClick={() => setMapZoomed(true)} className="block w-full overflow-hidden rounded-xl border-2 border-[#c9a56a] bg-[#fbf1d9]" aria-label="Phóng to bản đồ kiến thức">
                <img src={station.journeyMap.image} onError={() => setMapImageFailed(true)} alt={'Bản đồ kiến thức '+station.titleVi} className="aspect-[16/9] w-full object-contain" />
              </button>
            ) : (
              <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#b08b51] bg-[#f7ecd1] px-4 text-[#75552d]">
                <Map className="h-10 w-10 opacity-60 sm:h-14 sm:w-14" />
                <p className="text-sm font-black uppercase sm:text-lg">Khung bản đồ kiến thức</p>
                <p className="text-xs sm:text-sm">Bản đồ của trạm sẽ được bổ sung tại đây</p>
              </div>
            )}
            <p className="mt-2 text-xs font-semibold text-[#765329]">Nhìn lại những điều em đã khám phá tại trạm</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative flex-1 rounded-[1.5rem] border-[5px] border-[#9a6138] bg-gradient-to-br from-[#fff0c7] to-[#e4bf85] p-4 text-[#68401f] shadow-[0_12px_30px_rgba(0,0,0,.3)]">
              <p className="text-sm font-black uppercase tracking-wide">HỘ CHIẾU HÀNH TRÌNH</p>
              <div className={`passport-stamp-hit mx-auto my-4 flex aspect-square w-36 max-w-full flex-col items-center justify-center rounded-full border-[6px] border-double p-3 sm:w-44 ${stamped?'border-red-800 text-red-800':'border-dashed border-[#bca67e] text-[#a28a63]'}`} style={stamped?{transform:'rotate(-10deg)'}:undefined}>
                <Stamp className="mb-2 h-10 w-10" />
                <p className="text-xs font-black uppercase">{stamped?'HOÀN THÀNH TRẠM':'CHỜ ĐÓNG DẤU'}</p>
                <p className="mt-1 text-[11px] font-black">{stamped?station.stamp.nameVi:station.titleVi}</p>
              </div>
              <div className="border-t border-[#c7a979] pt-3">
                <div className="flex items-center justify-center gap-2"><KeyRound className="h-7 w-7 text-[#a87413]"/><span className="text-sm font-black">{giftClaimed?'Đã nhận 1 mảnh chìa khóa':'Phần thưởng: 1 mảnh chìa khóa'}</span></div>
                <p className="mt-1 text-xs">Đủ 5 mảnh để mở kho báu của khối {station.grade}</p>
              </div>
            </div>
            <button type="button" disabled={!canExchange} onClick={handleJourneyGift} className="rounded-2xl border-2 border-[#fff1b1] bg-gradient-to-b from-[#ffe99a] via-[#ffc84c] to-[#d38a1d] px-4 py-4 text-base font-black text-[#53300c] shadow-[0_7px_0_#8b531d] transition hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-50">
              <Stamp className="mr-2 inline h-6 w-6" />{stamped?'XEM LẠI BẢN ĐỒ':'ĐÓNG DẤU HOÀN THÀNH'}
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {station.rewards.map(reward => <div key={reward.id} className="flex items-center gap-2 rounded-xl border border-amber-200/50 bg-[#f8e5ba]/95 px-3 py-2 text-xs font-bold text-[#69441e]"><RewardBadge template={reward.template} size="sm" muted={!isReadOnly&&!progress.rewardsCollected.includes(reward.id)}/><span>{reward.nameVi}</span></div>)}
        </div>
        {isReadOnly && <p className="mt-3 text-xs font-semibold text-amber-100">Chế độ xem thử: không lưu phần thưởng và con dấu.</p>}
        {stamped && <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onReviewJourney} className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-5 py-3 text-sm font-black text-[#274455]"><RotateCcw className="h-4 w-4"/> Học lại</button>
          <button type="button" onClick={onExploreNext} className="inline-flex items-center gap-2 rounded-xl bg-[#0d6465] px-5 py-3 text-sm font-black text-white"><ArrowRight className="h-4 w-4"/> Khám phá trạm tiếp theo</button>
        </div>}
      </section>
    </div>
  );
};
