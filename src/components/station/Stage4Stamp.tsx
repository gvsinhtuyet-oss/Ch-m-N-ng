import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import confetti from 'canvas-confetti';
import { Award, Compass, Sparkles, CheckCircle2, RotateCcw, ArrowRight, Map, KeyRound, Gift, ZoomIn, X } from 'lucide-react';
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
  const canExchange = isReadOnly || (progress.stage1Completed && progress.stage2Completed && progress.stage3Completed);

  const saveMapToCollection = () => {
    setSaveMessage('');
    if (isReadOnly) {
      setSaveMessage('Bản xem thử – bản đồ chưa được lưu vào tài khoản.');
      return;
    }

    const updated = progressService.claimJourneyGift(studentId, station.id);
    if (!updated.journeyMapReceived || !updated.keyFragmentReceived) {
      setSaveMessage('Chưa lưu được bản đồ. Em hãy thử lại.');
      return;
    }

    setGiftClaimed(true);
    setSaveMessage('✓ Đã lưu bản đồ vào menu BẢN ĐỒ và nhận 1 mảnh chìa khóa.');
    audioService.playSfx('reward');
  };

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const exchanging = useRef(false);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
  const schedule = (callback: () => void, delay: number) => {
    timers.current.push(setTimeout(callback, delay));
  };
  const handleStamp = () => {
    audioService.playSfx('stamp');
    setStamped(true);
    if (!isReadOnly) progressService.completeStage4(studentId, station.id);
  };

  const handleJourneyGift = () => {
    if (!canExchange || exchanging.current || giftClaimed) return;
    exchanging.current = true;
    if (!stamped) handleStamp();

    setSaveMessage('');
    setMapImageFailed(false);
    setMapZoomed(false);

    audioService.playSfx('map');
    schedule(() => audioService.playSfx('victory'), 180);
    schedule(() => audioService.playSfx('treasure'), 760);

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
      schedule(() => {
        confetti({ particleCount: 45, spread: 100, startVelocity: 34, origin: { x: 0.5, y: 0.28 }, zIndex: 10000, disableForReducedMotion: true });
      }, 650);
    } catch {
      // Celebration is optional if the browser blocks canvas effects.
    }

    setShowGiftReveal(true);
    exchanging.current = false;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <style>{`
        @keyframes journey-map-reveal {
          from { opacity: 0; transform: translateY(50px) scale(.65) rotate(-8deg); }
          to { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
        }
        @keyframes journey-key-flight {
          0% { opacity: 0; transform: translate(-130px, 120px) scale(.25) rotate(-100deg); }
          35% { opacity: 1; transform: translate(30px, -35px) scale(1.3) rotate(20deg); }
          65% { transform: translate(-10px, -15px) scale(1.05) rotate(-10deg); }
          100% { opacity: 1; transform: translate(0, 0) scale(1) rotate(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .journey-map-reveal, .journey-key-flight { animation: none !important; }
        }
      `}</style>
      {showGiftReveal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-label="Bản đồ và chìa khóa hành trình" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-amber-50 to-sky-50 border-4 border-amber-300 p-5 sm:p-8 text-center shadow-2xl space-y-5">
            <h3 className="text-2xl font-black text-sky-950">🎉 Quà hành trình của em!</h3>
            <div className="journey-map-reveal rounded-2xl border-2 border-amber-400 bg-amber-100 p-4 shadow-lg" style={{ animation: 'journey-map-reveal .8s ease-out both' }}>
              <h4 className="font-black text-lg text-amber-950">{station.journeyMap?.titleVi || 'Bản đồ hành trình ' + station.titleVi}</h4>
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
                      className="max-h-[44vh] w-auto max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-slate-950/75 px-2 py-1 text-[11px] font-bold text-white">
                      <ZoomIn className="h-3.5 w-3.5" /> Phóng to
                    </span>
                  </button>
                </div>
              ) : (
                <svg viewBox="0 0 480 240" role="img" aria-label={'Bản đồ khám phá ' + station.titleVi} className="w-full mt-3 rounded-xl bg-amber-50">
                  <path d="M65 65 C140 0 320 0 405 65 S340 230 250 175 S80 260 65 65" fill="none" stroke="#b45309" strokeWidth="5" strokeDasharray="10 8" />
                  {[[65,65],[405,65],[405,175],[65,175]].map(([x,y],i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="27" fill="#0284c7" stroke="white" strokeWidth="4" />
                      <text x={x} y={y+8} textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">{i+1}</text>
                    </g>
                  ))}
                  <text x="240" y="105" textAnchor="middle" fontSize="34">🧭</text>
                  <text x="240" y="140" textAnchor="middle" fill="#92400e" fontSize="18" fontWeight="bold">CHẠM ĐÀ NẴNG</text>
                </svg>
              )}
              <div className="grid grid-cols-2 gap-2 mt-3 text-left">
                {(station.journeyMap?.summaryNodes || station.hotspots.map(h => ({ id: h.id, titleVi: h.titleVi, textVi: h.keyFactVi }))).slice(0,4).map((node,i) => (
                  <div key={node.id} className="rounded-xl bg-white/80 p-2 text-xs text-amber-950">
                    <strong>{i+1}. {node.titleVi}</strong>
                    <p className="mt-1">{node.textVi}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="journey-key-flight mx-auto flex items-center justify-center gap-3 rounded-2xl bg-amber-300 p-4 text-amber-950 shadow-lg" style={{ animation: 'journey-key-flight 1.5s .25s ease-out both' }}>
              <KeyRound className="w-14 h-14 shrink-0" />
              <div className="text-left">
                <p className="font-black">{giftClaimed ? 'Em đã nhận 1 mảnh chìa khóa!' : '1 mảnh chìa khóa đang chờ em lưu!'}</p>
                <p className="text-xs">{giftClaimed ? `Sưu tập đủ 5 mảnh để mở rương kho báu Khối ${station.grade}.` : 'Bấm LƯU BẢN ĐỒ để cất bản đồ và mảnh chìa khóa vào bộ sưu tập.'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={saveMapToCollection}
              disabled={giftClaimed && !isReadOnly}
              className="w-full rounded-2xl bg-amber-400 py-3 text-amber-950 font-black inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Map className="w-5 h-5" />{giftClaimed && !isReadOnly ? 'ĐÃ LƯU VÀO BẢN ĐỒ' : 'LƯU BẢN ĐỒ'}
            </button>
            {saveMessage && <p role="status" className="text-sm text-sky-900">{saveMessage}</p>}
            <button autoFocus type="button" onClick={() => setShowGiftReveal(false)} className="w-full rounded-2xl bg-sky-700 py-3 text-white font-black">
              CẤT QUÀ VÀO BỘ SƯU TẬP
            </button>
          </div>
        </div>
      )}
      {mapZoomed && station.journeyMap?.image && !mapImageFailed && (
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
            src={station.journeyMap.image}
            alt={'Bản đồ hành trình phóng to ' + station.titleVi}
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            onClick={event => event.stopPropagation()}
            onError={() => { setMapImageFailed(true); setMapZoomed(false); }}
          />
        </div>
      )}
      <section className="rounded-3xl bg-white border border-amber-200 shadow-sm p-5 sm:p-7 space-y-5 text-center">
        <span className="text-xs font-black text-sky-700 uppercase">Chặng 4 · Dấu ấn cuối hành trình</span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{station.titleVi}</h2>
        <p className="text-sm text-slate-600">Những kỉ niệm em đã sưu tập</p>
        <div className="grid grid-cols-3 gap-2">
          {station.rewards.map(reward => {
            const received = isReadOnly || progress.rewardsCollected.includes(reward.id);
            return (
              <div key={reward.id} className={`rounded-2xl border p-3 ${received ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="mb-2 flex justify-center"><RewardBadge template={reward.template} size="sm" muted={!received} /></div>
                <p className="text-xs font-bold text-slate-900">{reward.nameVi}</p>
                <p className="text-[11px] mt-1 text-emerald-700">{received ? '✓ Đã nhận' : 'Chưa nhận'}</p>
              </div>
            );
          })}
        </div>
        {!giftClaimed ? (
          <>
            <p className="text-sm text-slate-700">Đổi quà để nhận <strong>bản đồ hành trình</strong> và <strong>1 mảnh chìa khóa</strong>.</p>
            <button type="button" disabled={!canExchange} onClick={handleJourneyGift} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />ĐỔI QUÀ – NHẬN BẢN ĐỒ
            </button>
            {!canExchange && <p className="text-xs text-slate-500">Em cần hoàn thành 3 chặng trước để đổi quà.</p>}
          </>
        ) : (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">
            <p className="font-bold text-emerald-900">✓ Đã nhận bản đồ và 1 mảnh chìa khóa</p>
            <button type="button" onClick={() => { setSaveMessage(''); setMapImageFailed(false); setMapZoomed(false); setShowGiftReveal(true); }} className="rounded-xl bg-sky-700 px-5 py-3 text-white font-bold inline-flex items-center gap-2"><Map className="w-4 h-4" />XEM VÀ LƯU BẢN ĐỒ</button>
          </div>
        )}
        {isReadOnly && <p className="text-xs text-amber-800">Bản xem thử – phần thưởng không lưu vào tài khoản.</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center border-t pt-4">
          <button type="button" onClick={onReviewJourney} className="rounded-xl bg-slate-100 px-4 py-3 text-slate-700 font-bold text-sm inline-flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />Học lại</button>
          <button type="button" onClick={onExploreNext} className="rounded-xl bg-sky-700 px-5 py-3 text-white font-bold text-sm inline-flex items-center justify-center gap-2">Khám phá trạm tiếp theo<ArrowRight className="w-4 h-4" /></button>
        </div>
      </section>
    </div>
  );
};

