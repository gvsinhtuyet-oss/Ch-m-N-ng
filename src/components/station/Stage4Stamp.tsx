import React, { useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import confetti from 'canvas-confetti';
import { Award, Compass, Sparkles, CheckCircle2, RotateCcw, ArrowRight, Map, KeyRound, Gift } from 'lucide-react';

interface Props {
  station: Station;
  onReviewJourney: () => void;
  onExploreNext: () => void;
}

const REWARD_ICON_BY_TEMPLATE: Record<string, string> = {
  discovery_compass: '🧭',
  scholar_scroll: '📜',
  heritage_lantern: '🏮',
  nature_leaf: '🍃',
  dragon_gem: '💎',
  pottery_vase: '🏺',
  sea_pearl: '🫧',
  silk_ribbon: '🎀',
};

export const Stage4Stamp: React.FC<Props> = ({ station, onReviewJourney, onExploreNext }) => {
  const { currentUser, role } = useApp();
  const isGuest = role === 'guest';
  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);

  const [stamped, setStamped] = useState<boolean>(progress.stampReceived || progress.stationCompleted);
  const [giftClaimed, setGiftClaimed] = useState<boolean>(
    progress.journeyMapReceived && progress.keyFragmentReceived
  );

  const handleStamp = () => {
    audioService.playSfx('stamp');
    setTimeout(() => {
      audioService.playSfx('victory');
    }, 220);

    // Dynamic Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#0284c7', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
        });
      }, 350);
    } catch {
      // ignore
    }

    setStamped(true);
    if (!isGuest) {
      progressService.completeStage4(studentId, station.id);
    }
  };

  const handleJourneyGift = () => {
    if (!stamped) return;

    if (!isGuest) {
      const updated = progressService.claimJourneyGift(studentId, station.id);
      if (!updated.journeyMapReceived || !updated.keyFragmentReceived) {
        return;
      }
    }

    audioService.playSfx('map');
    setTimeout(() => audioService.playSfx('treasure'), 360);

    try {
      confetti({
        particleCount: 120,
        spread: 95,
        startVelocity: 38,
        origin: { y: 0.62 },
      });
      setTimeout(() => {
        confetti({ particleCount: 70, angle: 60, spread: 70, origin: { x: 0, y: 0.65 } });
        confetti({ particleCount: 70, angle: 120, spread: 70, origin: { x: 1, y: 0.65 } });
      }, 280);
    } catch {
      // Celebration is optional if the browser blocks canvas effects.
    }

    setGiftClaimed(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Celebratory Hero Header */}
      <div className="bg-gradient-to-r from-sky-700 via-indigo-800 to-amber-700 text-white rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-black text-xs uppercase tracking-widest border border-amber-300/30">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Chặng 4: Lưu Dấu Hành Trình</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm">
            {station.titleVi}
          </h2>

          <p className="text-sm sm:text-base text-sky-100 max-w-xl mx-auto font-medium leading-relaxed">
            Chúc mừng em đã hoàn thành xuất sắc chuyến khám phá văn hóa, di sản và phong cảnh quê hương!
          </p>
        </div>
      </div>

      {/* Collector's Showcase: 3 Stage Rewards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-base sm:text-lg text-slate-900">
              Bộ Sưu Tập Kỉ Niệm Đạt Được
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
            {station.rewards.filter(rw => progress.rewardsCollected.includes(rw.id)).length === station.rewards.length
              ? '✓ Đã nhận đủ 3 kỉ niệm'
              : `${station.rewards.filter(rw => progress.rewardsCollected.includes(rw.id)).length} / ${station.rewards.length} Kỉ niệm`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {station.rewards.map((rw) => {
            const isClaimed = progress.rewardsCollected.includes(rw.id);

            return (
              <div
                key={rw.id}
                className={`p-5 rounded-3xl border-2 shadow-xs flex flex-col items-center text-center space-y-3 relative transition ${
                  isClaimed
                    ? 'bg-gradient-to-b from-amber-50/80 via-white to-orange-50/50 border-amber-300'
                    : 'bg-slate-50 border-dashed border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md transition duration-300 ${
                    isClaimed
                      ? 'bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {REWARD_ICON_BY_TEMPLATE[rw.template] ?? '🎁'}
                </div>

                <div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${
                      isClaimed ? 'text-amber-800 bg-amber-100' : 'text-slate-500 bg-slate-200'
                    }`}
                  >
                    Chặng {rw.stage}
                  </span>
                  <h4 className="font-black text-sm text-slate-900">{rw.nameVi}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{rw.descriptionVi}</p>
                </div>

                <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-bold">
                  {isClaimed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">✓ Đã nhận</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Chưa nhận ở Chặng {rw.stage}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master Stamp Ceremony Section */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 text-center space-y-8 relative overflow-hidden">
        {!stamped ? (
          <div className="space-y-6">
            <div className="w-36 h-36 mx-auto rounded-full border-4 border-dashed border-sky-300 bg-sky-50/50 flex flex-col items-center justify-center text-sky-500 shadow-inner animate-pulse">
              <Award className="w-14 h-14 stroke-[1.5]" />
              <span className="text-xs font-black mt-2">Dấu ấn chờ đóng</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">
                Sẵn Sàng Ghi Danh Vào Hộ Chiếu?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Nhấn vào nút đỏ danh dự bên dưới để thực hiện nghi thức đóng dấu chứng nhận hoàn thành trạm học tập!
              </p>
            </div>

            <div>
              <button
                onClick={handleStamp}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-base sm:text-lg shadow-xl shadow-red-500/30 transition transform hover:scale-105 active:scale-95 inline-flex items-center gap-3 cursor-pointer"
              >
                <Award className="w-6 h-6 text-amber-300" />
                <span>ĐÓNG DẤU HOÀN THÀNH</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* The Actual Large Realistic Rubber Stamp */}
            <div className="inline-block relative">
              <div className="animate-stamp w-48 h-48 sm:w-56 sm:h-56 rounded-full border-[6px] border-double border-red-700 bg-red-50/90 p-4 flex flex-col items-center justify-center text-red-700 shadow-2xl shadow-red-500/25 rotate-[-5deg]">
                <div className="w-full h-full rounded-full border-2 border-red-600/70 p-2.5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-900">
                    CHẠM ĐÀ NẴNG
                  </span>
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center my-1.5 shadow-2xs">
                    <Compass className="w-6 h-6 text-red-700" />
                  </div>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-red-950 px-1 leading-tight">
                    {station.stamp.nameVi}
                  </span>
                  <span className="text-[9px] font-extrabold text-red-700 mt-1 uppercase tracking-wide">
                    ★ ĐÃ HOÀN THÀNH ★
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs sm:text-sm mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Chúc mừng nhà khám phá! Em đã hoàn thành trạm</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{station.titleVi}</h3>
              <p className="text-xs sm:text-sm text-slate-500 italic mt-1 max-w-lg mx-auto font-medium">
                "{station.stamp.quoteVi}"
              </p>
              {isGuest && (
                <div className="pt-2">
                  <span className="inline-block px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    Bản xem thử – đăng nhập học sinh để lưu dấu vào Hộ chiếu.
                  </span>
                </div>
              )}
            </div>

            {/* Journey Gift Exchange */}
            <div className="max-w-2xl mx-auto rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-5 sm:p-6 shadow-sm space-y-4">
              {!giftClaimed ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5 text-amber-600" />
                    <h4 className="text-lg font-black text-slate-900">Quà cuối hành trình đang chờ em</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Đổi quà sau khi hoàn thành đủ 4 chặng để nhận <strong>Bản đồ hành trình</strong> và
                    <strong> 1 Mảnh chìa khóa kho báu</strong>. Các kỉ niệm em đã nhận vẫn được giữ nguyên.
                  </p>
                  <button
                    type="button"
                    onClick={handleJourneyGift}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition transform hover:scale-103 active:scale-95 inline-flex items-center gap-2"
                  >
                    <Gift className="w-5 h-5" />
                    <span>{isGuest ? 'XEM QUÀ HÀNH TRÌNH (DEMO)' : 'ĐỔI QUÀ HÀNH TRÌNH'}</span>
                  </button>
                  {isGuest && (
                    <p className="text-[11px] text-amber-800 font-semibold">
                      Nhà phiêu lưu được xem thử cơ chế phần thưởng; hệ thống không lưu tiến độ cá nhân.
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    <Sparkles className="w-4 h-4" />
                    <span>{isGuest ? 'QUÀ DEMO ĐÃ MỞ' : 'ĐÃ ĐỔI QUÀ THÀNH CÔNG'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-sky-200 bg-white p-4 flex items-center gap-3 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0">
                        <Map className="w-6 h-6 text-sky-700" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide font-black text-sky-700">Phần thưởng 01</div>
                        <div className="font-black text-slate-900">Bản đồ hành trình</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{station.titleVi}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-white p-4 flex items-center gap-3 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                        <KeyRound className="w-6 h-6 text-amber-700" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide font-black text-amber-700">Phần thưởng 02</div>
                        <div className="font-black text-slate-900">Mảnh chìa khóa kho báu</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Sưu tập đủ 5 mảnh để mở Rương Kho báu Khối {station.grade}.</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                    {isGuest
                      ? 'Đây là bản xem thử. Hãy đăng nhập bằng vai trò Học sinh để lưu Bản đồ và Mảnh chìa khóa.'
                      : 'Bản đồ đã được lưu vào mục BẢN ĐỒ. Học lại bài sẽ không tạo phần thưởng trùng lặp.'}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={onReviewJourney}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>XEM LẠI HÀNH TRÌNH</span>
              </button>

              <button
                onClick={onExploreNext}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-black text-xs sm:text-sm shadow-xl shadow-sky-600/30 transition flex items-center justify-center gap-2 transform hover:scale-103 active:scale-95"
              >
                <span>KHÁM PHÁ TRẠM TIẾP THEO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
