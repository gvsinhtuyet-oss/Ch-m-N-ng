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
    <div className="relative isolate w-full min-h-[560px] lg:h-[calc(100dvh-180px)] lg:min-h-[520px] overflow-hidden rounded-[1.6rem] border-2 border-white/70 bg-gradient-to-br from-sky-200 via-emerald-100 to-amber-100 shadow-xl">
      {/* Decorative 3D-inspired landscape uses CSS only: no external image, no auth changes. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_5%,rgba(255,255,255,.9),transparent_42%),radial-gradient(ellipse_at_90%_80%,rgba(16,185,129,.3),transparent_48%)]" />
      <div className="relative z-10 flex h-full min-h-0 flex-col gap-2 p-2.5 sm:p-3 lg:p-4">
        <header className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/95 px-3 py-2 shadow-md">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-700">Chặng 3 / 4</p>
            <h2 className="truncate text-lg font-black text-amber-950 sm:text-xl">❤️ Checkin cảm xúc</h2>
          </div>
          <span className="hidden text-xs font-semibold text-amber-900 sm:block">Cảm nhận và hành động sau khám phá</span>
        </header>
        {!isSubmitted ? (
          <>
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
              <section aria-label="Cảm xúc của em" className="flex min-h-0 flex-col gap-2 rounded-2xl border-2 border-white/80 bg-white/92 p-2.5 shadow-lg sm:p-3">
                <h3 className="shrink-0 text-sm font-black text-rose-800 sm:text-base">💗 Cảm xúc của em</h3>
                <p className="shrink-0 text-xs font-semibold text-slate-700">Em cảm thấy thế nào sau hành trình?</p>
                <div className="grid shrink-0 grid-cols-3 gap-1.5">
                  {checkIn.emotions.map(em => (
                    <button type="button" key={em.id} aria-pressed={selectedEmotion === em.id}
                      onClick={() => { audioService.playSfx('click'); setSelectedEmotion(em.id); }}
                      className={`flex min-h-14 flex-col items-center justify-center rounded-xl border-2 px-1 py-1 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 ${selectedEmotion === em.id ? 'border-rose-500 bg-rose-100 shadow-sm' : 'border-rose-100 bg-white hover:bg-rose-50'}`}>
                      <span className="text-xl sm:text-2xl">{em.emoji}</span><span className="text-[10px] font-bold leading-tight text-slate-800 sm:text-xs">{em.labelVi}</span>
                    </button>
                  ))}
                </div>
                <h4 className="shrink-0 text-xs font-black text-sky-900">{checkIn.rememberPromptVi}</h4>
                <div className="grid min-h-0 flex-1 content-start gap-1.5">
                  {checkIn.rememberOptions.map(opt => {
                    const active = selectedRememberIds.includes(opt.id);
                    return <button type="button" key={opt.id} aria-pressed={active} onClick={() => toggleRemember(opt.id)}
                      className={`flex min-h-9 items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5 text-left text-xs font-semibold leading-snug sm:text-sm ${active ? 'border-sky-500 bg-sky-100 text-sky-950' : 'border-slate-200 bg-white/95 text-slate-800 hover:bg-sky-50'}`}>
                      <span>{opt.textVi}</span><span className="shrink-0">{active ? '✓' : '○'}</span>
                    </button>;
                  })}
                </div>
              </section>
              <section aria-label="Việc em sẽ làm" className="flex min-h-0 flex-col gap-2 rounded-2xl border-2 border-white/80 bg-white/92 p-2.5 shadow-lg sm:p-3">
                <h3 className="shrink-0 text-sm font-black text-emerald-800 sm:text-base">🌱 Việc em sẽ làm</h3>
                <p className="shrink-0 text-xs font-semibold text-slate-700">{checkIn.actionPromptVi}</p>
                <div className="grid min-h-0 flex-1 content-start gap-2">
                  {checkIn.actionOptions.map(opt => {
                    const active = selectedActionIds.includes(opt.id);
                    return <button type="button" key={opt.id} aria-pressed={active} onClick={() => toggleAction(opt.id)}
                      className={`flex min-h-12 items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left text-xs font-bold leading-snug sm:text-sm ${active ? 'border-emerald-500 bg-emerald-100 text-emerald-950 shadow-sm' : 'border-emerald-100 bg-white/95 text-slate-800 hover:bg-emerald-50'}`}>
                      <span>{opt.textVi}</span><span className="shrink-0">{active ? '✓' : '○'}</span>
                    </button>;
                  })}
                </div>
                <p className="shrink-0 text-[11px] font-semibold text-emerald-900">Chọn ít nhất một việc em muốn thực hiện.</p>
              </section>
            </div>
            <button type="button" onClick={handleSubmit} disabled={!isValid}
              className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-emerald-600 px-4 py-2 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45">
              <Sparkles className="h-4 w-4" /> Hoàn thành checkin – Nhận dấu ấn
            </button>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-white bg-white/90 p-5 text-center">
            <span className="text-6xl">{checkIn.emotions.find(e => e.id === selectedEmotion)?.emoji || '❤️'}</span>
            <h3 className="text-xl font-black text-emerald-950">Cảm ơn em đã chia sẻ!</h3>
            <p className="max-w-lg text-sm text-slate-700">Em đã hoàn thành chặng cảm xúc và chọn một việc ý nghĩa để thực hiện.</p>
            <button type="button" onClick={onCompleteStage} className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white">Sang chặng 4 – Dấu ấn hành trình <ChevronRight className="inline h-4 w-4" /></button>
          </div>
        )}
      </div>
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
