import React, { useState } from 'react';
import { Reward } from '../../types';
import { audioService } from '../../services/AudioService';
import { Sparkles, CheckCircle2, ArrowRight, Award } from 'lucide-react';

interface Props {
  reward?: Reward | null;
  stage: number;
  alreadyClaimed: boolean;
  onClaim: () => void;
  onContinue: () => void;
}

export const RewardClaimModal: React.FC<Props> = ({
  reward,
  stage,
  alreadyClaimed,
  onClaim,
  onContinue,
}) => {
  const [claimed, setClaimed] = useState<boolean>(alreadyClaimed);

  if (!reward) return null;

  const handleClaim = () => {
    audioService.playSfx('reward');
    onClaim();
    setClaimed(true);
  };

  const getRewardIcon = () => {
    if (reward.template === 'heritage_lantern') return '🏮';
    if (reward.template === 'discovery_compass') return '🧭';
    if (reward.template === 'sea_pearl') return '💖';
    if (reward.template === 'scholar_scroll') return '📜';
    if (stage === 1) return '🏮';
    if (stage === 2) return '🧭';
    return '💖';
  };

  const nextStageNum = stage < 4 ? stage + 1 : 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-300 text-center relative space-y-6">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-amber-400/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Stage Badge */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Phần thưởng hoàn thành Chặng {stage}</span>
          </span>
        </div>

        {/* Large Item Visual with Glow */}
        <div className="relative z-10 flex justify-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-slate-950 flex items-center justify-center text-5xl sm:text-6xl shadow-xl shadow-amber-400/40 border-4 border-white animate-pulse-glow">
            {getRewardIcon()}
          </div>
        </div>

        {/* Item Info */}
        <div className="relative z-10 space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {reward.nameVi}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium max-w-xs mx-auto">
            {reward.descriptionVi}
          </p>
        </div>

        {/* Actions & Status */}
        <div className="relative z-10 pt-2 space-y-3">
          {!claimed ? (
            <button
              onClick={handleClaim}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 transition transform hover:scale-102 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-5 h-5" />
              <span>NHẬN VẬT PHẨM</span>
            </button>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {alreadyClaimed
                    ? 'Vật phẩm này em đã sưu tầm rồi.'
                    : `Em đã nhận được ${reward.nameVi}!`}
                </span>
              </div>

              <button
                onClick={onContinue}
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-lg shadow-sky-600/30 transition transform hover:scale-102 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>TIẾP TỤC CHẶNG {nextStageNum}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

