import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, ArrowRight, KeyRound, ZoomIn, X, Stamp } from 'lucide-react';
import './journey-stages.css';

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

  const saveMapAndStamp = () => {
    if (!canExchange || stamped || exchanging.current) return;
    exchanging.current = true;
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
        exchanging.current = false;
        return;
      }
      setGiftClaimed(true);
      setStamped(true);
      setSaveMessage('✓ Bản đồ đã lưu • Đã nhận 1 mảnh chìa khóa • Hộ chiếu đã được đóng dấu.');
    }

    exchanging.current = false;
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


    return (
      <div className="journey-stage stage-four" aria-label="Dấu ấn hành trình">
        <style>{`
          @keyframes journeyStampDrop {
            0% { opacity:0; transform: translateY(-90px) scale(2.2) rotate(-25deg); }
            65% { opacity:1; transform: translateY(7px) scale(.86) rotate(-13deg); }
            85% { transform: translateY(-4px) scale(1.05) rotate(-13deg); }
            100% { opacity:1; transform: translateY(0) scale(1) rotate(-13deg); }
          }
          @media (prefers-reduced-motion:reduce) { .journey-stamp { animation:none !important; } }
        `}</style>
        <h2 className="journey-station-title">{station.titleVi}</h2>
        <div className="stamp-layout">
          <section aria-label="Bản đồ tri thức" className="journey-map-panel">
            <div className="mb-1 flex shrink-0 items-center justify-between gap-2 px-1">
              <h3 className="truncate text-xs font-black text-[#704315] sm:text-sm">🗺️ BẢN ĐỒ TRI THỨC</h3>
              <button type="button" disabled={!station.journeyMap?.image || mapImageFailed} onClick={() => { audioService.playSfx('click'); setMapZoomed(true); }} className="flex shrink-0 items-center gap-1 rounded-lg bg-sky-700 px-2 py-1.5 text-[10px] font-black text-white disabled:opacity-50 sm:text-xs"><ZoomIn className="h-3.5 w-3.5" /> Phóng to</button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-amber-200 bg-white">
              {station.journeyMap?.image && !mapImageFailed ? <img src={station.journeyMap.image} alt={"Bản đồ tri thức " + station.titleVi} onError={() => setMapImageFailed(true)} className="h-full w-full object-contain" /> : <div className="px-3 text-center text-sm font-bold text-amber-900">Chưa tải được ảnh bản đồ tri thức của trạm.</div>}
            </div>
          </section>
          <section aria-label="Hộ chiếu hành trình" className="journey-passport-panel">
            <div className="sr-only">
              <p className="text-[10px] font-black tracking-wider text-[#96621c] sm:text-xs">CHẠM ĐÀ NẴNG</p>
              <h3 className="text-sm font-black text-[#683917] sm:text-lg">📖 HỘ CHIẾU HÀNH TRÌNH</h3>
              <p className="mt-1 text-[10px] font-semibold text-[#704e30] sm:text-xs">{`Khối ${station.grade} · ${station.titleVi}`}</p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1">
              <p className="text-center text-[10px] font-bold text-[#78542d] sm:text-xs">{stamped ? 'Dấu ấn đã lưu trong hộ chiếu' : 'Vị trí chờ đóng dấu hoàn thành'}</p>
              <div className="relative flex aspect-square w-[min(100%,170px)] max-h-[60%] items-center justify-center rounded-full border-2 border-dashed border-[#bb9569] bg-white/35">
                {stamped ? (
                  <div className="journey-stamp flex aspect-square w-[94%] flex-col items-center justify-center rounded-full border-[5px] border-double border-red-700 bg-red-50/30 p-1 text-center text-red-800 shadow-lg" style={{animation:'journeyStampDrop .7s cubic-bezier(.2,.85,.25,1.1) both'}}>
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
        <div className="journey-controls">
          <button type="button" disabled={!station.journeyMap?.image || mapImageFailed} onClick={() => { audioService.playSfx('click'); setMapZoomed(true); }} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-sky-300 bg-gradient-to-b from-sky-100 to-sky-300 px-1 py-2 text-[10px] font-black text-sky-950 shadow sm:text-sm disabled:opacity-50"><ZoomIn className="h-4 w-4 shrink-0" />Phóng to bản đồ</button>
          <button type="button" disabled={!canExchange || stamped} onClick={() => { saveMapAndStamp(); }} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-yellow-500 bg-gradient-to-b from-yellow-100 to-amber-400 px-1 py-2 text-[10px] font-black text-amber-950 shadow sm:text-sm disabled:opacity-50"><Award className="h-4 w-4 shrink-0" />{stamped ? 'Đã nhận dấu ấn' : 'Nhận dấu ấn'}</button>
          <button type="button" onClick={() => { audioService.playSfx('click'); onExploreNext(); }} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-100 to-lime-300 px-1 py-2 text-[10px] font-black text-emerald-950 shadow sm:text-sm"><ArrowRight className="h-4 w-4 shrink-0" />Trạm tiếp theo</button>
        </div>
        <div className="journey-footer">
          <button type="button" onClick={onReviewJourney} className="rounded-lg bg-white/95 px-3 py-2 text-sm font-bold text-sky-950"><RotateCcw className="mr-1 inline h-4 w-4" />Học lại</button>
          {isReadOnly && <span>Chế độ xem thử: không lưu phần thưởng.</span>}
        </div>
        {mapZoomed && station.journeyMap?.image && !mapImageFailed && (
          <div role="dialog" aria-modal="true" aria-label="Bản đồ tri thức phóng to" onKeyDown={event => { if (event.key === 'Escape') setMapZoomed(false); }} className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-3" onClick={() => setMapZoomed(false)}>
            <button autoFocus type="button" onClick={() => setMapZoomed(false)} aria-label="Đóng bản đồ" className="absolute right-4 top-4 z-10 rounded-xl bg-white p-2 text-slate-900"><X className="h-6 w-6" /></button>
            <img src={station.journeyMap.image} alt={"Bản đồ tri thức " + station.titleVi + " phóng to"} className="max-h-full max-w-full object-contain" onClick={event => event.stopPropagation()} />
          </div>
        )}
      </div>
    );
};
