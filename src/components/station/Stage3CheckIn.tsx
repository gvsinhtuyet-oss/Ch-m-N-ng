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
  const { currentUser, role } = useApp();
  const isReadOnly = role !== 'student';
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

    if (!isReadOnly) {
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
    }
    setShowRewardModal(true);
  };

  const isValid =
    selectedEmotion !== '' &&
    selectedRememberIds.length > 0 &&
    selectedActionIds.length > 0;

  return (
    <div className="relative isolate mx-auto flex min-h-[530px] w-full flex-col overflow-hidden rounded-[1.4rem] border-2 border-amber-300 bg-[#f4e2b7] shadow-xl lg:h-[calc(100dvh-195px)] lg:min-h-[520px]" style={{ backgroundImage: "url('/images/stage3-checkin-cam-xuc.webp'), url('/images/stage3-checkin-background.svg')", backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      {!isSubmitted ? (
        <div className="relative z-10 grid min-h-[530px] flex-1 grid-rows-[minmax(0,1fr)_minmax(0,3fr)_auto] gap-1.5 px-[5%] pb-[3%] pt-[15%] sm:gap-2 sm:px-[6%] sm:pt-[14.7%] lg:min-h-0">
          <section aria-label="Cảm xúc của em" className="flex min-h-0 items-center justify-center gap-2 overflow-hidden px-1">
            <span className="hidden shrink-0 rounded-lg bg-amber-50/85 px-2 py-1 text-[11px] font-black text-rose-900 xl:block">Cảm xúc của em</span>
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:gap-3">
              {checkIn.emotions.map(em => (
                <button type="button" key={em.id} aria-pressed={selectedEmotion === em.id}
                  onClick={() => { audioService.playSfx('click'); setSelectedEmotion(em.id); }}
                  className={`flex min-h-9 items-center justify-center gap-1 rounded-xl border-2 px-1 py-1 text-center text-[10px] font-black leading-tight shadow-sm transition sm:min-h-11 sm:text-sm ${selectedEmotion === em.id ? 'border-rose-500 bg-rose-100 text-rose-900 ring-2 ring-rose-400' : 'border-amber-200 bg-white/90 text-amber-950 hover:bg-amber-50'}`}>
                  <span className="text-base sm:text-2xl">{em.emoji}</span><span>{em.labelVi}</span>
                </button>
              ))}
            </div>
          </section>
          <div className="grid min-h-0 grid-cols-2 gap-[5%]">
            <section aria-label="Điều em nhớ nhất" className="flex min-h-0 min-w-0 flex-col overflow-hidden px-[3%] pb-1 pt-[10%] sm:pt-[8%]">
              <h3 className="sr-only">Điều em nhớ nhất</h3>
              <p className="mb-1 line-clamp-2 shrink-0 rounded-md bg-amber-50/80 px-1 py-1 text-[10px] font-bold text-amber-950 sm:text-xs">{checkIn.rememberPromptVi}</p>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {checkIn.rememberOptions.map(opt => {
                  const active = selectedRememberIds.includes(opt.id);
                  return <button type="button" key={opt.id} aria-pressed={active} onClick={() => toggleRemember(opt.id)}
                    className={`flex min-h-9 w-full items-center justify-between gap-1 rounded-lg border px-2 py-1 text-left text-[10px] font-bold leading-snug shadow-sm sm:min-h-10 sm:text-xs lg:text-sm ${active ? 'border-orange-600 bg-orange-200/95 text-orange-950' : 'border-orange-200 bg-white/90 text-slate-900 hover:bg-amber-50'}`}>
                    <span>{opt.textVi}</span><span className="shrink-0 text-base">{active ? '✓' : '○'}</span>
                  </button>;
                })}
              </div>
            </section>
            <section aria-label="Việc em sẽ làm" className="flex min-h-0 min-w-0 flex-col overflow-hidden px-[3%] pb-1 pt-[10%] sm:pt-[8%]">
              <h3 className="sr-only">Việc em sẽ làm</h3>
              <p className="mb-1 line-clamp-2 shrink-0 rounded-md bg-green-50/80 px-1 py-1 text-[10px] font-bold text-emerald-950 sm:text-xs">{checkIn.actionPromptVi}</p>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {checkIn.actionOptions.map(opt => {
                  const active = selectedActionIds.includes(opt.id);
                  return <button type="button" key={opt.id} aria-pressed={active} onClick={() => toggleAction(opt.id)}
                    className={`flex min-h-9 w-full items-center justify-between gap-1 rounded-lg border px-2 py-1 text-left text-[10px] font-bold leading-snug shadow-sm sm:min-h-10 sm:text-xs lg:text-sm ${active ? 'border-emerald-600 bg-emerald-200/95 text-emerald-950' : 'border-emerald-200 bg-white/90 text-slate-900 hover:bg-green-50'}`}>
                    <span>{opt.textVi}</span><span className="shrink-0 text-base">{active ? '✓' : '○'}</span>
                  </button>;
                })}
              </div>
            </section>
          </div>
          <button type="button" onClick={handleSubmit} disabled={!isValid}
            className="mx-auto flex min-h-10 w-fit max-w-full shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-yellow-600 bg-gradient-to-b from-yellow-200 to-amber-500 px-4 py-2 text-xs font-black text-amber-950 shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-11 sm:px-8 sm:text-sm">
            <Sparkles className="h-4 w-4 shrink-0" /> Hoàn thành check-in – Sang Chặng 4 <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      ) : (
        <div className="relative z-10 flex min-h-[450px] flex-1 flex-col items-center justify-center gap-4 bg-amber-50/90 p-5 text-center">
          <span className="text-6xl">{checkIn.emotions.find(e => e.id === selectedEmotion)?.emoji || '❤️'}</span>
          <h3 className="text-xl font-black text-emerald-950">Cảm ơn em đã chia sẻ!</h3>
          <p className="max-w-lg text-sm text-slate-700">Em đã hoàn thành chặng cảm xúc và chọn việc ý nghĩa để thực hiện.</p>
          <button type="button" onClick={onCompleteStage} className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white">Sang Chặng 4 – Dấu ấn hành trình <ChevronRight className="inline h-4 w-4" /></button>
        </div>
      )}
      {/* Stage 3 Reward Claim Modal */}
      {showRewardModal && (
        <RewardClaimModal
          reward={station.rewards.find(r => r.stage === 3) || station.rewards[2]}
          stage={3}
          alreadyClaimed={!isReadOnly && progress.rewardsCollected.includes(station.rewards.find(r => r.stage === 3)?.id || '')}
          onClaim={() => {
            if (!isReadOnly) {
              const rw3 = station.rewards.find(r => r.stage === 3);
              if (rw3) {
                progressService.claimReward(studentId, station.id, rw3.id);
              }
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
