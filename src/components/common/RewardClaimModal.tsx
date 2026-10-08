import React, { useEffect } from 'react';
import { Reward } from '../../types';
import { audioService } from '../../services/AudioService';
import { Sparkles, Map } from 'lucide-react';
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
  useEffect(() => {
    if (!reward || alreadyClaimed) return;
    audioService.playSfx('reward');
    onClaim();
  }, [reward, alreadyClaimed, onClaim]);

  if (!reward) return null;

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

        <div className="relative z-10 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-black text-emerald-800">✓ Vật phẩm đã được tự động lưu vào hành trình.</p>
        </div>

        <div className="relative z-10 pt-1">
          <button
            onClick={onContinue}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white font-black text-sm sm:text-base shadow-xl shadow-sky-600/25 transition transform hover:scale-102 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Map className="w-5 h-5" />
            <span>TIẾP TỤC HÀNH TRÌNH</span>
          </button>
        </div>
      </div>
    </div>
  );
};

