import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, KeyRound, Stamp, Star, Heart, X } from 'lucide-react';
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
  const [keyVisible, setKeyVisible] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [ratings, setRatings] = useState<[number,number,number]>([0,0,0]);
  const [ratingNote, setRatingNote] = useState('');
  const [showRatingNote, setShowRatingNote] = useState(false);
  const ratingStorageKey = `cham_danang_journey_rating_v1:${studentId}:${station.id}`;
  const saveRating = () => {
    if (ratings.some(score => score === 0)) return;
    try {
      localStorage.setItem(ratingStorageKey, JSON.stringify({ stationId: station.id, grade: station.grade,
        knowledge: ratings[0], games: ratings[1], exploreMore: ratings[2], note: ratingNote.trim().slice(0,240),
        updatedAt: new Date().toISOString() }));
      audioService.playSfx('reward');
      setShowRating(false);
    } catch {
      setSaveMessage('Không thể lưu cảm nhận trên máy này. Em vẫn có thể khám phá tiếp.');
    }
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
    /* The key is revealed after stamping; the collection animation runs on tap. */
  };

  const collectKey = () => {
    if (!stamped || giftClaimed) return;
    setGiftClaimed(true);
    try {
      if (!localStorage.getItem(ratingStorageKey)) setShowRating(true);
    } catch { setShowRating(true); }
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
              {station.coverImage && !photoFailed ? <img src={station.coverImage} alt={`Ảnh điểm đến ${station.titleVi}`} onError={() => setPhotoFailed(true)} className="journey-photo-main" decoding="async" /> :
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
              {stamped && (giftClaimed || keyVisible) && <button type="button" disabled={giftClaimed} onClick={collectKey} className="journey-key-claim"><KeyRound className="h-7 w-7" />{giftClaimed ? '✓ Đã thu thập' : 'Thu thập chìa khóa'}</button>}
              {saveMessage && <p role="status" className="line-clamp-2 text-center text-[10px] font-bold text-emerald-900">{saveMessage}</p>}
            </div>
          </section>
        </div>
        <div className="journey-controls">
          <button type="button" onClick={() => { audioService.playSfx('click'); onReviewJourney(); }} className="journey-control-review"><RotateCcw className="h-5 w-5 shrink-0" />Khám phá lại</button>
          <button type="button" disabled={!canExchange || stamped} onClick={saveMapAndStamp} className="journey-control-stamp"><Stamp className="h-5 w-5 shrink-0" />{stamped ? '✓ Đã đóng dấu' : 'Đóng dấu hành trình'}</button>
          <button type="button" onClick={() => { audioService.playSfx('click'); onExploreNext(); }} className="journey-control-next"><ArrowRight className="h-5 w-5 shrink-0" />Khám phá thêm</button>
        </div>
        {showRating && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#20180d]/55 p-3 backdrop-blur-[3px]" role="presentation">
          <section role="dialog" aria-modal="true" aria-label="Đánh giá hành trình" className="relative w-full max-w-[370px] max-h-[92dvh] overflow-y-auto rounded-[24px] border-[3px] border-amber-300 bg-gradient-to-b from-[#fff9e7] via-[#ffedc7] to-[#ffe1a2] p-3.5 shadow-[0_20px_70px_#27140890]">
            <div className="absolute -top-12 right-5 h-28 w-28 rounded-full bg-amber-300/40 blur-2xl" aria-hidden="true" />
            <button type="button" onClick={() => setShowRating(false)} aria-label="Để lần sau" className="absolute right-2 top-2 rounded-full bg-white/70 p-1.5 text-amber-950"><X className="h-4 w-4" /></button>
            <div className="relative mb-3 pr-5 text-center"><Heart className="mx-auto h-6 w-6 fill-rose-500 text-rose-500" /><h3 className="text-base font-black text-amber-950">Em thấy hành trình thế nào?</h3><p className="text-[11px] text-amber-800">Cảm nhận của em giúp hành trình thú vị hơn!</p></div>
            <div className="space-y-2">
              {(['Kiến thức thú vị','Trò chơi hấp dẫn','Muốn khám phá tiếp'] as const).map((label,index) => (
                <div key={label} className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white/75 px-2 py-2">
                  <span className="min-w-0 text-[11px] font-bold text-amber-950 sm:text-xs">{label}</span>
                  <div className="flex shrink-0 gap-0.5" role="group" aria-label={label}>
                    {[1,2,3,4,5].map(score => <button key={score} type="button" aria-label={`${label}: ${score} sao`} aria-pressed={ratings[index]===score} onClick={() => {audioService.playSfx('click');setRatings(prev=>prev.map((v,i)=>i===index?score:v) as [number,number,number]);}} className="rounded p-0.5"><Star className={`h-[19px] w-[19px] ${score <= ratings[index] ? 'fill-amber-400 text-amber-500' : 'text-amber-300'}`} /></button>)}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setShowRatingNote(v=>!v)} className="mt-2 w-full text-left text-[11px] font-bold text-amber-800">{showRatingNote?'▴ Ẩn lời nhắn':'▾ Thêm lời nhắn (không bắt buộc)'}</button>
            {showRatingNote && <textarea aria-label="Lời nhắn của em" rows={2} maxLength={240} value={ratingNote} onChange={e=>setRatingNote(e.target.value)} placeholder="Em thích nhất…" className="mt-1 w-full rounded-xl border border-amber-300 bg-white p-2 text-sm text-amber-950" />}
            <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => setShowRating(false)} className="min-h-10 rounded-xl border border-amber-300 bg-white text-xs font-bold text-amber-900">Để lần sau</button><button type="button" disabled={ratings.some(v=>v===0)} onClick={saveRating} className="min-h-10 rounded-xl bg-gradient-to-b from-orange-400 to-orange-600 text-xs font-black text-white shadow-[0_3px_0_#9a3412] disabled:opacity-55">Gửi cảm nhận ★</button></div>
            <p className="mt-2 text-center text-[10px] text-amber-800">Cảm nhận lưu trên thiết bị này; chưa gửi tới giáo viên.</p>
          </section>
        </div>}
        {isReadOnly && <p className="journey-preview-note">Chế độ xem thử: không lưu phần thưởng.</p>}

      </div>
    );
};
