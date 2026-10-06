import React from 'react';
import { Reward } from '../../types';
import { audioService } from '../../services/AudioService';
import { Sparkles, Award, Map } from 'lucide-react';
import { RewardBadge } from './RewardBadge';

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
  if (!reward) return null;

  const handleClaimAndContinue = () => {
    audioService.playSfx('reward');
    onClaim();
    onContinue();
  };

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
          <RewardBadge template={reward.template} size="lg" className="animate-pulse-glow" />
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

        {/* Single-step action: receive item, then show the shared journey map */}
        <div className="relative z-10 pt-2">
          {alreadyClaimed ? (
            <button
              onClick={onContinue}
              className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-lg shadow-sky-600/30 transition transform hover:scale-102 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Map className="w-5 h-5" />
              <span>XEM BẢN ĐỒ TIẾN TRÌNH</span>
            </button>
          ) : (
            <button
              onClick={handleClaimAndContinue}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 transition transform hover:scale-102 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-5 h-5" />
              <span>NHẬN VẬT PHẨM</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

