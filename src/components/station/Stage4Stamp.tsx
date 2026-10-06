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

  const saveMapToCollection = () => {
    setSaveMessage('');

    if (isReadOnly) {
      setGiftClaimed(true);
      setSaveMessage('Bản xem thử – bản đồ và mảnh chìa khóa chưa được lưu vào tài khoản.');
      audioService.playSfx('reward');
      return;
    }

    const updated = progressService.claimJourneyGift(studentId, station.id);
    if (!updated.journeyMapReceived || !updated.keyFragmentReceived) {
      setSaveMessage('Chưa thu thập được bản đồ. Em hãy hoàn thành đủ 3 chặng trước rồi thử lại.');
      return;
    }

    setGiftClaimed(true);
    setSaveMessage('✓ Bản đồ đã được lưu vào menu BẢN ĐỒ và em nhận 1 mảnh chìa khóa.');
    audioService.playSfx('reward');
  };

  const handleStamp = () => {
    if (!giftClaimed) return;

    audioService.playSfx('stamp');
    setStamped(true);

    if (!isReadOnly) {
      progressService.completeStage4(studentId, station.id);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.58 },
        zIndex: 10000,
        disableForReducedMotion: true,
      });
    } catch {
      // Không ảnh hưởng việc hoàn thành trạm.
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <style>{`
        @keyframes journey-map-reveal {
          from { opacity: 0; transform: translateY(40px) scale(.72) rotate(-4deg); }
          to { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .journey-map-reveal { animation: none !important; }
        }
      `}</style>

      {showGiftReveal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Phần thưởng bản đồ hành trình"
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-amber-50 to-sky-50 border-4 border-amber-300 p-5 sm:p-8 text-center shadow-2xl space-y-5"
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
                {(station.journeyMap?.summaryNodes || station.hotspots.map(h => ({
                  id: h.id,
                  titleVi: h.titleVi,
                  textVi: h.keyFactVi,
                }))).slice(0, 4).map((node, i) => (
                  <div key={node.id} className="rounded-xl bg-white/80 p-2 text-xs text-amber-950">
                    <strong>{i + 1}. {node.titleVi}</strong>
                    <p className="mt-1">{node.textVi}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto flex items-center justify-center gap-3 rounded-2xl bg-amber-200 p-4 text-amber-950">
              <KeyRound className="w-11 h-11 shrink-0" />
              <div className="text-left">
                <p className="font-black">
                  {giftClaimed ? 'Em đã nhận 1 mảnh chìa khóa!' : 'Thu thập bản đồ để nhận 1 mảnh chìa khóa'}
                </p>
                <p className="text-xs">
                  {giftClaimed
                    ? `Sưu tập đủ 5 mảnh để mở rương kho báu Khối ${station.grade}.`
                    : 'Bản đồ sẽ được lưu vào menu BẢN ĐỒ của em.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={saveMapToCollection}
              disabled={giftClaimed}
              className="w-full rounded-2xl bg-amber-400 py-3.5 text-amber-950 font-black inline-flex items-center justify-center gap-2 disabled:bg-emerald-100 disabled:text-emerald-800"
            >
              <Map className="w-5 h-5" />
              {giftClaimed ? '✓ ĐÃ THU THẬP BẢN ĐỒ' : 'THU THẬP BẢN ĐỒ'}
            </button>

            {saveMessage && (
              <p role="status" className="text-sm font-semibold text-sky-900">{saveMessage}</p>
            )}

            {giftClaimed && (
              <button
                autoFocus
                type="button"
                onClick={() => setShowGiftReveal(false)}
                className="w-full rounded-2xl bg-sky-700 py-3.5 text-white font-black inline-flex items-center justify-center gap-2"
              >
                <Stamp className="w-5 h-5" />
                TIẾP TỤC ĐÓNG DẤU HỘ CHIẾU
              </button>
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

      <section className="rounded-3xl bg-white border border-amber-200 shadow-sm p-5 sm:p-7 space-y-6 text-center">
        <div>
          <span className="text-xs font-black text-sky-700 uppercase">Chặng 4 · Dấu ấn cuối hành trình</span>
          <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{station.titleVi}</h2>
          <p className="mt-2 text-sm text-slate-600">Ba vật phẩm em đã sưu tập trong hành trình</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {station.rewards.map(reward => {
            const received = isReadOnly || progress.rewardsCollected.includes(reward.id);
            return (
              <div
                key={reward.id}
                className={`rounded-2xl border p-3 ${received ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}
              >
                <div className="mb-2 flex justify-center">
                  <RewardBadge template={reward.template} size="sm" muted={!received} />
                </div>
                <p className="text-xs font-bold text-slate-900">{reward.nameVi}</p>
                <p className={`text-[11px] mt-1 ${received ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {received ? '✓ Đã nhận' : 'Chưa nhận'}
                </p>
              </div>
            );
          })}
        </div>

        <div className={`rounded-3xl border p-5 sm:p-6 ${giftClaimed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50'}`}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-200 text-amber-900">
            {giftClaimed ? <CheckCircle2 className="w-7 h-7 text-emerald-700" /> : <Gift className="w-6 h-6" />}
          </div>
          <p className="text-xs font-black uppercase tracking-wider text-amber-700">Đổi quà cuối hành trình</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            {giftClaimed ? 'Bản đồ hành trình đã được thu thập' : 'Mở khóa phần thưởng đặc biệt'}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {giftClaimed
              ? 'Bản đồ đã nằm trong menu BẢN ĐỒ và em đã nhận 1 mảnh chìa khóa.'
              : 'Dùng thành tích từ 3 chặng trước để mở Bản đồ hành trình và nhận mảnh chìa khóa.'}
          </p>

          <button
            type="button"
            disabled={!canExchange}
            onClick={handleJourneyGift}
            className={`mt-4 w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
              giftClaimed
                ? 'bg-sky-700 text-white'
                : 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950'
            }`}
          >
            {giftClaimed ? <Map className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
            {giftClaimed ? 'XEM LẠI BẢN ĐỒ' : 'NHẬN PHẦN THƯỞNG'}
          </button>

          {!canExchange && (
            <p className="mt-3 text-xs text-slate-500">Em cần hoàn thành đủ 3 chặng trước để nhận phần thưởng.</p>
          )}
        </div>

        <div className={`rounded-3xl border p-5 sm:p-6 transition ${
          giftClaimed
            ? stamped
              ? 'border-red-200 bg-gradient-to-br from-red-50 to-amber-50'
              : 'border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50'
            : 'border-slate-200 bg-slate-50 opacity-65'
        }`}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Stamp className={`w-6 h-6 ${giftClaimed ? 'text-red-700' : 'text-slate-400'}`} />
          </div>
          <p className="text-xs font-black uppercase tracking-wider text-red-700">Đóng dấu hộ chiếu</p>

          {!giftClaimed ? (
            <>
              <h3 className="mt-1 text-lg font-black text-slate-700">Thu thập bản đồ để mở bước cuối</h3>
              <p className="mt-2 text-sm text-slate-500">Sau khi nhận bản đồ và mảnh chìa khóa, em sẽ được đóng dấu hoàn thành trạm.</p>
            </>
          ) : !stamped ? (
            <>
              <h3 className="mt-1 text-lg font-black text-slate-950">Sẵn sàng đóng dấu hoàn thành</h3>
              <p className="mt-2 text-sm text-slate-600">Dấu ấn của trạm sẽ được lưu vào menu HỘ CHIẾU.</p>
              <button
                type="button"
                onClick={handleStamp}
                className="mt-4 w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-700 to-amber-700 text-white font-black shadow-lg inline-flex items-center justify-center gap-2"
              >
                <Stamp className="w-5 h-5" />
                ĐÓNG DẤU HOÀN THÀNH TRẠM
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-28 h-28 rounded-full border-4 border-double border-red-700 bg-red-50 p-2 flex flex-col items-center justify-center text-red-700 shadow-md rotate-[-3deg]">
                <div className="w-full h-full rounded-full border border-red-600/60 p-1.5 flex flex-col items-center justify-center">
                  <span className="text-[7px] font-black uppercase tracking-widest text-red-900">CHẠM ĐÀ NẴNG</span>
                  <Award className="w-5 h-5 text-red-700 my-1" />
                  <span className="text-[9px] font-black uppercase text-red-800 leading-tight">{station.stamp.nameVi}</span>
                  <span className="text-[7px] font-bold text-red-600">ĐÃ HOÀN THÀNH</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">🏅 Hoàn thành trạm!</h3>
                <p className="mt-1 text-sm text-slate-600">Dấu ấn đã được lưu vào HỘ CHIẾU của em.</p>
              </div>
            </div>
          )}
        </div>

        {isReadOnly && (
          <p className="text-xs text-amber-800">Bản xem thử – phần thưởng và dấu ấn không lưu vào tài khoản.</p>
        )}

        {stamped && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center border-t pt-5">
            <button
              type="button"
              onClick={onReviewJourney}
              className="rounded-xl bg-slate-100 px-4 py-3 text-slate-700 font-bold text-sm inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Học lại
            </button>
            <button
              type="button"
              onClick={onExploreNext}
              className="rounded-xl bg-sky-700 px-5 py-3 text-white font-bold text-sm inline-flex items-center justify-center gap-2"
            >
              Khám phá trạm tiếp theo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
