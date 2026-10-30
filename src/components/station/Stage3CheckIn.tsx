import React, { useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import { Sparkles, ChevronRight } from 'lucide-react';
import './journey-stages.css';
import { RewardClaimModal } from '../common/RewardClaimModal';

interface Props {
  station: Station;
  onCompleteStage: () => void;
  readOnly?: boolean;
}

export const Stage3CheckIn: React.FC<Props> = ({ station, onCompleteStage, readOnly = false }) => {
  const { currentUser, role } = useApp();
  const isReadOnly = readOnly || role !== 'student';
  const checkIn = station.checkIn;

  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [selectedRememberIds, setSelectedRememberIds] = useState<string[]>([]);
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
  const [otherEmotion, setOtherEmotion] = useState('');
  const [otherRemember, setOtherRemember] = useState('');
  const [otherAction, setOtherAction] = useState('');
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
          otherEmotionText: otherEmotion.trim().slice(0,300),
          otherRememberText: otherRemember.trim().slice(0,300),
          otherActionText: otherAction.trim().slice(0,300),
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
    <div className="journey-stage stage-three" aria-label="Check-in cảm xúc">
      {!isSubmitted ? (
        <div className="checkin-layout">
          <p className="checkin-emotion-prompt">Em cảm thấy thế nào sau hành trình khám phá?</p>
          <section aria-label="Cảm xúc của em" className="checkin-emotions">

            <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:gap-3">
              {checkIn.emotions.map(em => (
                <button type="button" key={em.id} aria-pressed={selectedEmotion === em.id}
                  onClick={() => { audioService.playSfx('click'); setSelectedEmotion(em.id); }}
                  className={`flex min-h-9 items-center justify-center gap-1 rounded-xl border-2 px-1 py-1 text-center text-sm font-black leading-tight shadow-sm transition sm:min-h-11 sm:text-base ${selectedEmotion === em.id ? 'border-rose-500 bg-rose-100 text-rose-900 ring-2 ring-rose-400' : 'border-amber-200 bg-white/90 text-amber-950 hover:bg-amber-50'}`}>
                  <span className="text-base sm:text-2xl">{em.emoji}</span><span>{em.labelVi}</span>
                </button>
              ))}
            </div>
            <label className="checkin-other-field"><span>✏️ Cảm xúc khác (không bắt buộc)</span><input value={otherEmotion} onChange={e=>setOtherEmotion(e.target.value)} maxLength={300} placeholder="Em còn cảm thấy…" /></label>
          </section>
          <div className="checkin-pages">
            <section aria-label="Điều em nhớ nhất" className="checkin-page">
              <h3 className="checkin-section-title sr-only">Điều em nhớ nhất</h3>
              <p className="mb-1 line-clamp-2 shrink-0 rounded-md bg-amber-50/80 px-1 py-1 text-[10px] font-bold text-amber-950 sm:text-xs">{checkIn.rememberPromptVi}</p>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {checkIn.rememberOptions.map(opt => {
                  const active = selectedRememberIds.includes(opt.id);
                  return <button type="button" key={opt.id} aria-pressed={active} onClick={() => toggleRemember(opt.id)}
                    className={`flex min-h-9 w-full items-center justify-between gap-1 rounded-lg border px-2 py-1 text-left text-sm font-bold leading-snug shadow-sm sm:min-h-10 lg:text-base ${active ? 'border-orange-600 bg-orange-200/95 text-orange-950' : 'border-orange-200 bg-white/90 text-slate-900 hover:bg-amber-50'}`}>
                    <span>{opt.textVi}</span><span className="shrink-0 text-base">{active ? '✓' : '○'}</span>
                  </button>;
                })}
              </div>
              <label className="checkin-other-field"><span>✏️ Khác (không bắt buộc)</span><input value={otherRemember} onChange={e=>setOtherRemember(e.target.value)} maxLength={300} placeholder="Em còn nhớ…" /></label>
            </section>
            <section aria-label="Việc em sẽ làm" className="checkin-page">
              <h3 className="checkin-section-title sr-only">Việc em sẽ làm</h3>
              <p className="mb-1 line-clamp-2 shrink-0 rounded-md bg-green-50/80 px-1 py-1 text-[10px] font-bold text-emerald-950 sm:text-xs">{checkIn.actionPromptVi}</p>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {checkIn.actionOptions.map(opt => {
                  const active = selectedActionIds.includes(opt.id);
                  return <button type="button" key={opt.id} aria-pressed={active} onClick={() => toggleAction(opt.id)}
                    className={`flex min-h-9 w-full items-center justify-between gap-1 rounded-lg border px-2 py-1 text-left text-sm font-bold leading-snug shadow-sm sm:min-h-10 lg:text-base ${active ? 'border-emerald-600 bg-emerald-200/95 text-emerald-950' : 'border-emerald-200 bg-white/90 text-slate-900 hover:bg-green-50'}`}>
                    <span>{opt.textVi}</span><span className="shrink-0 text-base">{active ? '✓' : '○'}</span>
                  </button>;
                })}
              </div>
              <label className="checkin-other-field"><span>✏️ Khác (không bắt buộc)</span><input value={otherAction} onChange={e=>setOtherAction(e.target.value)} maxLength={300} placeholder="Em sẽ…" /></label>
            </section>
          </div>
          <button type="button" onClick={handleSubmit} disabled={!isValid}
            className="checkin-submit mx-auto flex min-h-10 w-fit max-w-full shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-yellow-600 bg-gradient-to-b from-yellow-200 to-amber-500 px-4 py-2 text-xs font-black text-amber-950 shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-11 sm:px-8 sm:text-sm">
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
