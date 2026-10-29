import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, KeyRound, Stamp, Star } from 'lucide-react';
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
  const [photoFailed, setPhotoFailed] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const ratingStorageKey = `cham_danang_journey_rating_v2:${studentId}:${station.id}`;
  const readRating = ():number => {
    try {
      const value = JSON.parse(localStorage.getItem(ratingStorageKey) || 'null');
      return Number.isInteger(value?.stars) && value.stars >= 1 && value.stars <= 5 ? value.stars : 0;
    } catch { return 0; }
  };
  const [rating, setRating] = useState<number>(readRating);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingStatus, setRatingStatus] = useState('');
  useEffect(() => { setRating(readRating()); setRatingStatus(''); }, [ratingStorageKey]);
  const setJourneyRating = (stars:number) => {
    if(isReadOnly) { setRatingStatus('Chế độ xem thử không lưu đánh giá.'); return; }
    setRating(stars);
    setRatingSaving(true);
    setRatingStatus('');
    try {
      localStorage.setItem(ratingStorageKey, JSON.stringify({studentId,stationId:station.id,grade:station.grade,stars,updatedAt:new Date().toISOString()}));
      setRatingStatus('Đã lưu ✓');
    } catch { setRatingStatus('Chưa lưu được · Chạm sao để thử lại'); }
    finally { setRatingSaving(false); }
  };

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
    setKeyVisible(true);

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
      confetti({particleCount:120,spread:90,origin:{y:.55},disableForReducedMotion:true});
      schedule(()=>audioService.playSfx('victory'),240);
    } catch { /* Decorative effect only. */ }
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

        <div className="stamp-layout">
          <section aria-label="Ảnh điểm đến" className="journey-map-panel journey-photo-panel">
            <div className="journey-map-surface journey-photo-surface">
              {(station.journeyMap?.image || station.coverImage) && !photoFailed ? <img src={station.journeyMap?.image || station.coverImage} alt={`Bản đồ hành trình ${station.titleVi}`} onError={() => setPhotoFailed(true)} className="journey-photo-main" decoding="async" /> :
                <div className="journey-map-fallback"><h3>ĐIỂM ĐẾN CỦA EM</h3><strong>{station.titleVi}</strong></div>}
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
              {stamped && <div className="flex w-full flex-col items-center gap-1 rounded-xl bg-amber-50/85 px-2 py-2 text-amber-950">
                <span className="inline-flex items-center gap-1 text-xs font-black"><KeyRound className="h-5 w-5 text-amber-700" /> Đã nhận chìa khóa ✓</span>
                <span className="text-[11px] font-semibold">Em thích hành trình này chứ?</span>
                <div role="group" aria-label="Mức độ yêu thích hành trình" className="flex gap-1">
                  {[1,2,3,4,5].map(stars=><button type="button" key={stars} aria-label={`${stars} sao`} aria-pressed={rating===stars} onClick={()=>setJourneyRating(stars)} className="rounded p-0.5" ><Star className={`h-6 w-6 ${stars<=rating?'fill-amber-400 text-amber-500':'text-amber-400'}`}/></button>)}
                </div>
                {ratingStatus && <span role="status" className="text-[10px] font-bold text-emerald-800">{ratingSaving?'Đang lưu…':ratingStatus}</span>}
              </div>}
              {saveMessage && <p role="status" className="line-clamp-2 text-center text-[10px] font-bold text-emerald-900">{saveMessage}</p>}
            </div>
          </section>
        </div>
        <div className="journey-controls">
          <button type="button" onClick={() => { audioService.playSfx('click'); onReviewJourney(); }} className="journey-control-review"><RotateCcw className="h-5 w-5 shrink-0" />Khám phá lại</button>
          <button type="button" disabled={!canExchange || stamped} onClick={saveMapAndStamp} className="journey-control-stamp"><Stamp className="h-5 w-5 shrink-0" />{stamped ? '✓ Đã đóng dấu' : 'Đóng dấu hành trình'}</button>
          <button type="button" onClick={() => { audioService.playSfx('click'); onExploreNext(); }} className="journey-control-next"><ArrowRight className="h-5 w-5 shrink-0" />Khám phá thêm</button>
        </div>
        {isReadOnly && <p className="journey-preview-note">Chế độ xem thử: không lưu phần thưởng.</p>}

      </div>
    );
};
