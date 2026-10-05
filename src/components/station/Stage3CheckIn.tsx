import React, { useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import { Heart, Sparkles, Check, ChevronRight } from 'lucide-react';
import { RewardClaimModal } from '../common/RewardClaimModal';

interface Props {
  station: Station;
  onCompleteStage: () => void;
}

export const Stage3CheckIn: React.FC<Props> = ({ station, onCompleteStage }) => {
  const { currentUser } = useApp();
  const checkIn = station.checkIn;

  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [selectedRememberIds, setSelectedRememberIds] = useState<string[]>([]);
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);

  const toggleRemember = (id: string) => {
    audioService.playSfx('click');
    setSelectedRememberIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAction = (id: string) => {
    audioService.playSfx('click');
    setSelectedActionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedEmotion === '' || selectedRememberIds.length === 0 || selectedActionIds.length === 0) return;
    setIsSubmitted(true);

    progressService.completeStage3(
      studentId,
      station.id,
      {
        emotionId: selectedEmotion,
        rememberOptionIds: selectedRememberIds,
        actionOptionIds: selectedActionIds,
        submittedAt: new Date().toISOString(),
      }
    );
    setShowRewardModal(true);
  };

  const isValid =
    selectedEmotion !== '' &&
    selectedRememberIds.length > 0 &&
    selectedActionIds.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 flex items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 mb-2 inline-block">
            Chặng 3: Check-in Cảm xúc
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Chia sẻ cảm nhận & Lời hứa hành động</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Không có câu trả lời đúng hay sai – hãy chia sẻ cảm xúc chân thật nhất của em nhé!
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 shrink-0">
          <Heart className="w-7 h-7 fill-white" />
        </div>
      </div>

      {!isSubmitted ? (
        <div className="space-y-6">
          {/* Step 1: Emotion selection */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">1</span>
              Cảm xúc của em lúc này về chuyến khám phá?
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {checkIn.emotions.map((em) => {
                const isSelected = selectedEmotion === em.id;
                return (
                  <button
                    key={em.id}
                    onClick={() => {
                      audioService.playSfx('click');
                      setSelectedEmotion(em.id);
                    }}
                    className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/80 ring-2 ring-rose-300 scale-102 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">{em.emoji}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-rose-900' : 'text-slate-700'}`}>
                      {em.labelVi}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: What I remember most */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold">2</span>
              {checkIn.rememberPromptVi}
            </h3>
            <p className="text-xs text-slate-400 mb-3">(Em có thể chọn 1 hoặc nhiều điều)</p>

            <div className="space-y-2.5">
              {checkIn.rememberOptions.map((opt) => {
                const isChecked = selectedRememberIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleRemember(opt.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'border-sky-500 bg-sky-50 text-sky-950 font-semibold ring-1 ring-sky-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{opt.textVi}</span>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Action plan */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">3</span>
              {checkIn.actionPromptVi}
            </h3>
            <p className="text-xs text-slate-400 mb-3">(Chọn những hành động em muốn thực hiện)</p>

            <div className="space-y-2.5">
              {checkIn.actionOptions.map((opt) => {
                const isChecked = selectedActionIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleAction(opt.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{opt.textVi}</span>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <div className="text-center pt-2">
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-sky-600 hover:from-rose-600 hover:to-sky-700 disabled:opacity-40 text-white font-extrabold text-sm shadow-lg shadow-rose-500/25 transition active:scale-95 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Gửi Check-in & Mở khóa Chặng 4: Lưu Dấu Hành Trình</span>
            </button>
          </div>
        </div>
      ) : (
        /* Submitted view */
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-rose-200 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-4xl shadow-inner">
            {checkIn.emotions.find(e => e.id === selectedEmotion)?.emoji || '❤️'}
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">Cảm ơn em đã gửi lời cảm nhận!</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Những cảm xúc đẹp và cam kết bảo vệ quê hương của em đã được lưu lại trong Hộ chiếu Hành trình số.
            </p>
          </div>

          <div>
            <button
              onClick={onCompleteStage}
              className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-lg shadow-sky-600/30 transition active:scale-95 inline-flex items-center gap-2"
            >
              <span>Tiến vào Chặng 4: Đóng Dấu Hoàn Thành</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 3 Reward Claim Modal */}
      {showRewardModal && (
        <RewardClaimModal
          reward={station.rewards.find(r => r.stage === 3) || station.rewards[2]}
          stage={3}
          alreadyClaimed={progress.rewardsCollected.includes(station.rewards.find(r => r.stage === 3)?.id || '')}
          onClaim={() => {
            const rw3 = station.rewards.find(r => r.stage === 3);
            if (rw3) {
              progressService.claimReward(studentId, station.id, rw3.id);
            }
          }}
          onContinue={() => {
            setShowRewardModal(false);
            onCompleteStage();
          }}
        />
      )}
    </div>
  );
};
