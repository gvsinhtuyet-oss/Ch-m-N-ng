import React, { useState, useEffect, useRef } from 'react';
import { Station, Student } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, KeyRound, Stamp } from 'lucide-react';
import './journey-stages.css';
import {JourneyRating} from './JourneyRating';

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
  const [photoFailed, setPhotoFailed] = useState(false);
  const [mapZoomOpen, setMapZoomOpen] = useState(false);
  const [mapZoomScale, setMapZoomScale] = useState(1);
  const actualMapImage = station.journeyMap?.image || station.coverImage;
  const [mapAspectRatio, setMapAspectRatio] = useState<string>('3 / 2');
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
  useEffect(() => {
    if (!mapZoomOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMapZoomOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mapZoomOpen]);

  const schedule = (callback: () => void, delay: number) => {
    timers.current.push(setTimeout(callback, delay));
  };

  const saveMapAndStamp = () => {
    if (!canExchange || stamped || exchanging.current) return;
    exchanging.current = true;
    setSaveMessage('');

    if (isReadOnly) {
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
      setStamped(true);
      setSaveMessage('✓ Bản đồ đã lưu • Đã nhận 1 mảnh chìa khóa • Hộ chiếu đã được đóng dấu.');
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    audioService.playSfx('stamp', reducedMotion ? 0 : .455);
    exchanging.current = false;
    audioService.playSfx('treasure');
    try {
      confetti({
        particleCount: 150,
        colors: ['#FFD700', '#FFC107', '#FFB300', '#FFF2A6'],
        gravity: 1.35,
        spread: 105,
        startVelocity: 48,
        origin: { y: 0.5 },
        zIndex: 10000,
        disableForReducedMotion: true,
      });
      schedule(() => audioService.playSfx('victory'), 240);
    } catch {
      // Hiệu ứng chỉ là trang trí.
    }
  };


    return (
      <div className="journey-stage stage-four" aria-label="Dấu ấn hành trình">
        <header className="mobile-journey-hero mobile-stamp-hero" aria-hidden="true"><span className="mobile-journey-hero-kicker">Chặng 4</span><strong>Dấu ấn hành trình</strong><span className="mobile-journey-hero-symbol">🔖</span></header>
        <style>{`
          @keyframes journeyStampDrop {
            0% { opacity:0; transform: translateY(-90px) scale(2.2) rotate(-25deg); }
            65% { opacity:1; transform: translateY(7px) scale(.86) rotate(-13deg); }
            85% { transform: translateY(-4px) scale(1.05) rotate(-13deg); }
            100% { opacity:1; transform: translateY(0) scale(1) rotate(-13deg); }
          }
          @media (prefers-reduced-motion:reduce) { .journey-stamp { animation:none !important; } }
        `}</style>

        <div className="stamp-layout">
          <section aria-label="Bản đồ hành trình" className="journey-map-panel journey-photo-panel">
            <h3 className="mobile-journey-section-title">🗺️ Bản đồ hành trình</h3>
            <div className="journey-map-surface journey-photo-surface" style={{ aspectRatio: mapAspectRatio }}>
              {actualMapImage && !photoFailed ? <><img src={actualMapImage} alt={`Bản đồ hành trình ${station.titleVi}`} onError={() => setPhotoFailed(true)} className="journey-photo-main" onLoad={event => { const { naturalWidth, naturalHeight } = event.currentTarget; if(naturalWidth > 0 && naturalHeight > 0) setMapAspectRatio(`${naturalWidth} / ${naturalHeight}`); }} decoding="async" /></> :
                <div className="journey-map-fallback"><h3>ĐIỂM ĐẾN CỦA EM</h3><strong>{station.titleVi}</strong></div>}
            </div>
            {actualMapImage && !photoFailed && <button type="button" className="mobile-map-zoom-trigger" onClick={() => setMapZoomOpen(true)}>⛶ Chạm để phóng to bản đồ</button>}
          </section>
          <section aria-label="Hộ chiếu hành trình" className="journey-passport-panel">
            <h3 className="mobile-journey-section-title">📘 Hộ chiếu hành trình</h3>
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
              {stamped && <div className="flex w-full flex-col items-center gap-1 rounded-xl bg-amber-50/85 p-1 text-amber-950">
                <span className="inline-flex items-center gap-1 text-xs font-bold"><KeyRound className="h-5 w-5" />{isReadOnly?'Chìa khóa xem thử':'Đã nhận chìa khóa và kỷ vật ✓'}</span>
              </div>}
              {saveMessage && <p role="status" className="line-clamp-2 text-center text-[10px] font-bold text-emerald-900">{saveMessage}</p>}
            </div>
          </section>
          {stamped && !isReadOnly && <section aria-label="Đánh giá hành trình" className="journey-rating-panel"><JourneyRating key={`${studentId}:${station.id}`} stationId={station.id} userId={currentUser?.id} requireStudent={role==='student' && !!currentUser && !(currentUser as Student).isGuest}/></section>}
        </div>
        <div className="journey-controls">
          <button type="button" onClick={() => { audioService.playSfx('click'); onReviewJourney(); }} className="journey-control-review"><RotateCcw className="h-5 w-5 shrink-0" />Khám phá lại</button>
          <button type="button" disabled={!canExchange || stamped} onClick={saveMapAndStamp} className="journey-control-stamp"><Stamp className="h-5 w-5 shrink-0" />{stamped ? '✓ Đã đóng dấu' : 'Đóng dấu hành trình'}</button>
          <button type="button" onClick={() => { audioService.playSfx('click'); onExploreNext(); }} className="journey-control-next"><ArrowRight className="h-5 w-5 shrink-0" />Khám phá thêm</button>
        </div>
        {isReadOnly && <p className="journey-preview-note">Chế độ xem thử: không lưu phần thưởng.</p>}
        {mapZoomOpen && actualMapImage && !photoFailed && <div className="mobile-map-modal" role="presentation" onClick={() => setMapZoomOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={`Bản đồ hành trình ${station.titleVi}`} className="mobile-map-modal-panel" onClick={e => e.stopPropagation()}>
            <div className="mobile-map-modal-tools">
              <button type="button" onClick={() => setMapZoomScale(v => Math.max(1, v - .5))} aria-label="Thu nhỏ bản đồ" disabled={mapZoomScale <= 1}>−</button>
              <span>{Math.round(mapZoomScale * 100)}%</span>
              <button type="button" onClick={() => setMapZoomScale(v => Math.min(3, v + .5))} aria-label="Phóng to bản đồ" disabled={mapZoomScale >= 3}>+</button>
              <button type="button" className="mobile-map-close" onClick={() => {setMapZoomOpen(false);setMapZoomScale(1);}} aria-label="Đóng bản đồ phóng to">✕ Đóng</button>
            </div>
            <div className="mobile-map-modal-scroll"><img src={actualMapImage} alt={`Bản đồ hành trình ${station.titleVi} phóng to`} style={{width:`${mapZoomScale * 100}%`}} /></div>
          </div>
        </div>}

      </div>
    );
};
