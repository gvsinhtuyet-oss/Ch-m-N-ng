import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { progressService } from '../../services/ProgressService';
import { RotateCcw, HelpCircle, Gamepad2, Sparkles } from 'lucide-react';

const MISSIONS = [
  { icon: '🧭', title: 'Quét la bàn', prompt: 'Tìm manh mối chính xác để la bàn sáng lên.' },
  { icon: '🗝️', title: 'Mở rương bí mật', prompt: 'Chạm vào rương để lật mở đáp án, rồi chọn báu vật đúng.' },
  { icon: '🌉', title: 'Chọn lối vượt qua', prompt: 'Chọn con đường an toàn để tiến đến điểm tiếp theo.' },
  { icon: '🧩', title: 'Khôi phục bản đồ', prompt: 'Tìm mảnh ghép phù hợp để hoàn thiện dấu tích.' },
  { icon: '🏆', title: 'Thử thách cuối', prompt: 'Vượt qua câu hỏi cuối để nhận chìa khóa hành trình.' },
] as const;

const OPTION_ICONS = ['🔎', '✨', '🪶'];

const WORDWALL_EMBED_URLS: Record<string, string> = {
  '120604647': 'https://wordwall.net/embed/9bf5318dbfc94898902ef662795c3973?themeId=65&ref=oembed',
  '120605543': 'https://wordwall.net/embed/998e4ceb735f4333b8e89dc347a8ac33?themeId=46&ref=oembed',
  '120606175': 'https://wordwall.net/embed/2c3810ecb9834a54b8196a88658f54c6?themeId=62&ref=oembed',
  '120606516': 'https://wordwall.net/embed/9c87d7fd21d84cc5a27008f055576960?themeId=49&ref=oembed',
  '120607731': 'https://wordwall.net/embed/5e9f990113d24b5bac54f5738b1f9915?themeId=1&ref=oembed',
};

function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface Props {
  station: Station;
  onCompleteStage: () => void;
}

export const Stage2Challenge: React.FC<Props> = ({ station, onCompleteStage }) => {
  const { currentUser, role, isOnline } = useApp();
  const isReadOnly = role !== 'student';
  const challenge = station.challenge;
  const questions = useMemo(
    () => (challenge.questions || []).map(question => ({ ...question, options: shuffled(question.options) })),
    [challenge],
  );
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [retryQuestionIds, setRetryQuestionIds] = useState<string[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [openedChests, setOpenedChests] = useState<string[]>([]);
  const [answerFeedback, setAnswerFeedback] = useState<boolean | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const answerTimerRef = useRef<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [externalGameOpened, setExternalGameOpened] = useState(false);
  const [externalGameReadyToComplete, setExternalGameReadyToComplete] = useState(false);
  const [externalGameCountdown, setExternalGameCountdown] = useState(45);
  const [useInternalChallenge, setUseInternalChallenge] = useState(false);
  const [embedRound, setEmbedRound] = useState(0);

  const resourceId = challenge.externalGame?.url.match(/\/resource\/(\d+)/)?.[1];
  const embedUrl = resourceId ? WORDWALL_EMBED_URLS[resourceId] : undefined;
  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);
  const mainReward = station.rewards.find(reward => reward.stage === 2) || station.rewards[1];
  const bonusRewardId = `${station.id}-wordwall-star`;
  const bonusAlreadyClaimed = progress.rewardsCollected.includes(bonusRewardId) || bonusClaimed;
  const activeQuestions = retryQuestionIds === null
    ? questions
    : retryQuestionIds.map(id => questions.find(question => question.id === id)).filter((question): question is typeof questions[number] => !!question);
  const currentQ = activeQuestions[currentQIndex];
  const missionIndex = currentQ ? Math.max(0, questions.findIndex(question => question.id === currentQ.id)) : 0;
  const mission = MISSIONS[missionIndex % MISSIONS.length];
  const correctCount = questions.filter(question =>
    question.options.some(option => option.isCorrect && option.id === selectedAnswers[question.id]),
  ).length;
  const wrongQuestions = questions.filter(question =>
    !question.options.some(option => option.isCorrect && option.id === selectedAnswers[question.id]),
  );

  useEffect(() => {
    if (!isOnline && challenge.externalGame) setUseInternalChallenge(true);
  }, [isOnline, challenge]);

  useEffect(() => () => {
    if (answerTimerRef.current !== null) window.clearTimeout(answerTimerRef.current);
  }, []);

  useEffect(() => {
    if (passed) {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion) confetti({ particleCount: 90, spread: 72, startVelocity: 34, origin: { y: 0.68 }, colors: ['#f59e0b', '#fb7185', '#34d399', '#38bdf8'] });
    }
  }, [passed]);

  useEffect(() => {
    if (!externalGameOpened || useInternalChallenge || !isOnline || !embedUrl) return;
    backgroundMusic.setForegroundSource('wordwall', true);
    return () => backgroundMusic.setForegroundSource('wordwall', false);
  }, [externalGameOpened, useInternalChallenge, isOnline, embedUrl]);

  useEffect(() => {
    if (!externalGameOpened || useInternalChallenge || !isOnline || !embedUrl) return;
    setExternalGameReadyToComplete(false);
    setExternalGameCountdown(45);
    const timer = window.setInterval(() => {
      setExternalGameCountdown(value => {
        if (value <= 1) {
          window.clearInterval(timer);
          setExternalGameReadyToComplete(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.origin !== 'string' || !/wordwall\.net$/i.test(new URL(event.origin).hostname)) return;
      let payload = '';
      try { payload = typeof event.data === 'string' ? event.data : JSON.stringify(event.data); } catch { payload = ''; }
      if (/complete|completed|finish|finished|result|score/i.test(payload)) {
        setExternalGameReadyToComplete(true);
        setExternalGameCountdown(0);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('message', handleMessage);
    };
  }, [externalGameOpened, useInternalChallenge, isOnline, embedUrl, embedRound]);

  const finishChallenge = (answers: Record<string, string>) => {
    const passedAll = questions.every(question =>
      question.options.some(option => option.isCorrect && option.id === answers[question.id]),
    );
    setPassed(passedAll);
    setIsSubmitted(true);
    setIsAnswerLocked(false);
    setAnswerFeedback(null);
    if (passedAll) {
      if (!isReadOnly) progressService.completeStage2(studentId, station.id, mainReward?.id);
      audioService.playSfx('reward');
    }
  };

  const handleSelect = (questionId: string, optionId: string) => {
    if (isSubmitted || isAnswerLocked || !currentQ || currentQ.id !== questionId || selectedAnswers[questionId]) return;
    const option = currentQ.options.find(item => item.id === optionId);
    if (!option) return;
    const nextAnswers = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(nextAnswers);
    if (missionIndex === 1 && !openedChests.includes(optionId)) {
      setOpenedChests(previous => [...previous, optionId]);
    }
    const isCorrect = option.isCorrect;
    setAnswerFeedback(isCorrect);
    setIsAnswerLocked(true);
    audioService.playSfx(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion) confetti({ particleCount: 22, spread: 48, startVelocity: 22, origin: { y: 0.78 }, colors: ['#f59e0b', '#34d399', '#38bdf8'] });
    }
    answerTimerRef.current = window.setTimeout(() => {
      setAnswerFeedback(null);
      setIsAnswerLocked(false);
      if (currentQIndex < activeQuestions.length - 1) setCurrentQIndex(index => index + 1);
      else finishChallenge(nextAnswers);
    }, 1250);
  };

  const handleRetry = () => {
    audioService.playSfx('click');
    const wrongIds = wrongQuestions.map(question => question.id);
    setRetryQuestionIds(wrongIds);
    setSelectedAnswers(previous => {
      const retained = { ...previous };
      wrongIds.forEach(id => delete retained[id]);
      return retained;
    });
    setOpenedChests(previous => previous.filter(id => !wrongIds.some(questionId => id.startsWith(questionId))));
    setCurrentQIndex(0);
    setIsAnswerLocked(false);
    setAnswerFeedback(null);
    setIsSubmitted(false);
    setPassed(null);
  };

  const handleExternalGameComplete = () => {
    if (!externalGameReadyToComplete || bonusAlreadyClaimed) return;
    audioService.playSfx('treasure');
    if (!isReadOnly) progressService.claimReward(studentId, station.id, bonusRewardId);
    setBonusClaimed(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-br from-[#fff8e7] via-white to-orange-50 p-5 shadow-xl shadow-orange-950/5 sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-10 text-[9rem] opacity-[0.08]" aria-hidden="true">🗺️</div>
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-900">
              <Sparkles className="h-3.5 w-3.5" /> Chặng 2 · Chinh phục thử thách
            </span>
            <h2 className="mt-2 text-xl font-black leading-tight text-slate-950 sm:text-2xl">{challenge.titleVi}</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              {challenge.instructionsVi || 'Hoàn thành 5 nhiệm vụ để ghép lại bản đồ và nhận chìa khóa hành trình.'}
            </p>
          </div>
          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-4xl shadow-lg shadow-orange-500/25 sm:flex" aria-hidden="true">🧭</div>
        </div>

        <div className="relative mt-5 rounded-2xl border border-amber-100 bg-white/80 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Bản đồ thử thách</p>
              <p className="text-sm font-extrabold text-slate-800">Tìm đủ {questions.length} mảnh dấu ấn</p>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-black text-white">{correctCount}/{questions.length} đã mở khóa</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const isCorrect = question.options.some(option => option.isCorrect && option.id === selectedAnswers[question.id]);
              const isCurrent = currentQ?.id === question.id && !isSubmitted;
              return (
                <div key={question.id} className="flex min-w-0 flex-col items-center gap-1.5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-lg transition sm:h-14 sm:w-14 sm:text-2xl ${isCorrect ? 'border-emerald-300 bg-emerald-100 shadow-md shadow-emerald-900/10' : isCurrent ? 'border-amber-400 bg-amber-100 ring-4 ring-amber-100 animate-pulse' : 'border-slate-200 bg-slate-50'}`}>
                    {isCorrect ? '🧩' : isCurrent ? mission.icon : '🔒'}
                  </div>
                  <span className={`truncate text-[9px] font-extrabold sm:text-[10px] ${isCorrect ? 'text-emerald-700' : isCurrent ? 'text-amber-800' : 'text-slate-400'}`}>
                    {isCorrect ? 'Đã tìm' : `Mảnh ${index + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {!isSubmitted ? (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="flex flex-col gap-3 bg-gradient-to-r from-sky-950 via-sky-800 to-cyan-700 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl">{mission.icon}</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                  {retryQuestionIds !== null ? 'Nhiệm vụ cần thử lại' : `Nhiệm vụ ${missionIndex + 1} / ${questions.length}`}
                </p>
                <h3 className="text-lg font-black sm:text-xl">{mission.title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto" aria-label={`Nhiệm vụ ${currentQIndex + 1} trên ${activeQuestions.length}`}>
              {activeQuestions.map((question, index) => {
                const answered = Boolean(selectedAnswers[question.id]);
                return <span key={question.id} className={`h-2.5 rounded-full transition-all ${index === currentQIndex ? 'w-8 bg-amber-300' : answered ? 'w-3 bg-emerald-300' : 'w-3 bg-white/35'}`} />;
              })}
              <span className="ml-2 text-[11px] font-bold text-cyan-50">Chọn một đáp án · tự sang câu</span>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_250px]">
            <div className="space-y-5">
              {!currentQ ? (
                <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-950">
                  Trạm này chưa có câu hỏi thử thách. Em hãy báo giáo viên bổ sung câu hỏi trong phần Quản trị.
                </div>
              ) : (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">{mission.prompt}</p>
                    <h4 className="text-base font-extrabold leading-relaxed text-slate-950 sm:text-lg">{currentQ.questionVi}</h4>
                  </div>

                  <div className={missionIndex === 2 ? 'grid gap-3 sm:grid-cols-3' : 'grid gap-3'}>
                    {currentQ.options.map((option, optionIndex) => {
                      const isSelected = selectedAnswers[currentQ.id] === option.id;
                      const chestIsOpen = openedChests.includes(option.id);
                      const isChest = missionIndex === 1;
                      const isHidden = isChest && !chestIsOpen && !isSelected;
                      const pathStyle = missionIndex === 2;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelect(currentQ.id, option.id)}
                          aria-pressed={isSelected}
                          className={`group flex min-h-[68px] w-full items-center gap-3 border-2 px-4 py-3 text-left font-semibold transition active:scale-[0.98] ${pathStyle ? 'rounded-full' : 'rounded-2xl'} ${isSelected && isAnswerLocked && answerFeedback === true ? 'border-emerald-400 bg-emerald-50 text-emerald-950 ring-4 ring-emerald-100 shadow-md' : isSelected && isAnswerLocked && answerFeedback === false ? 'border-rose-400 bg-rose-50 text-rose-950 ring-4 ring-rose-100 shadow-md' : isSelected ? 'border-amber-400 bg-amber-50 text-amber-950 ring-4 ring-amber-100 shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50'}`}
                        >
                          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${isSelected ? 'bg-amber-200' : isChest && !chestIsOpen ? 'bg-amber-100' : 'bg-slate-100 group-hover:bg-sky-100'}`}>
                            {isChest && !chestIsOpen ? '🎁' : pathStyle ? '👣' : OPTION_ICONS[optionIndex % OPTION_ICONS.length]}
                          </span>
                          <span className="flex-1 text-sm leading-relaxed">
                            {isHidden ? 'Rương bí mật · chạm để mở' : option.textVi}
                          </span>
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-black ${isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                            {isSelected ? '✓' : String.fromCharCode(65 + optionIndex)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {answerFeedback !== null && (
                    <div role="status" aria-live="polite" className={`flex items-center gap-3 rounded-2xl p-3 text-sm font-extrabold animate-pulse ${answerFeedback ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-rose-200 bg-rose-50 text-rose-800'}`}>
                      <span className="text-2xl" aria-hidden="true">{answerFeedback ? '✨' : '💡'}</span>
                      <span>{answerFeedback ? 'Chính xác! Một mảnh bản đồ đã mở khóa.' : `Chưa đúng, mình sẽ thử lại câu này sau. ${currentQ.hintVi || 'Hãy nhớ manh mối vừa khám phá nhé.'}`}</span>
                    </div>
                  )}
                  {currentQ.hintVi && answerFeedback === null && (
                    <div className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">
                      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                      <span><strong>Gợi ý nhà thám hiểm:</strong> {currentQ.hintVi}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <aside className="flex flex-row items-center gap-3 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 lg:flex-col lg:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">{mission.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-wide text-amber-800">Mục tiêu</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">Chọn đúng manh mối để nhận một mảnh bản đồ. Trả lời sai, em chỉ cần làm lại nhiệm vụ đó.</p>
              </div>
              <div className="hidden w-full rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-center text-[11px] font-black text-amber-900 lg:block">
                🗺️ {correctCount} / {questions.length} mảnh bản đồ
              </div>
            </aside>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-center text-xs font-bold text-slate-500 sm:px-7">
            Chạm chọn đáp án một lần · hiệu ứng và âm thanh sẽ báo kết quả
          </div>
        </section>
      ) : passed ? (
        <section className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 text-center shadow-xl shadow-emerald-950/5 sm:p-9">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-5xl shadow-lg">🗺️</div>
          <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-800">Đã ghép đủ bản đồ</span>
          <h3 className="mt-2 text-2xl font-black text-slate-950">Xuất sắc, Nhà phiêu lưu!</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">Em đã hoàn thành đủ {questions.length} nhiệm vụ. Chìa khóa và phần thưởng Chặng 2 đã được lưu vào hành trình.</p>

          {challenge.externalGame && isOnline && embedUrl && (
            <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-violet-200 bg-violet-50/70 p-4 text-left sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Gamepad2 className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wide text-violet-700">Chơi thêm · không bắt buộc</p>
                  <h4 className="font-black text-slate-900">Thử sức Wordwall để nhận ⭐</h4>
                  <p className="mt-1 text-xs text-slate-600">Phần chơi chính đã hoàn tất trong app. Wordwall là trò chơi mở rộng.</p>
                </div>
              </div>
              {!externalGameOpened && !bonusAlreadyClaimed && (
                <button type="button" onClick={() => { audioService.playSfx('click'); setExternalGameOpened(true); setExternalGameReadyToComplete(false); setExternalGameCountdown(45); setEmbedRound(round => round + 1); }} className="mt-4 w-full rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-md hover:bg-violet-700">CHƠI THÊM WORDWALL</button>
              )}
              {externalGameOpened && !bonusAlreadyClaimed && (
                <div className="mt-4 space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-violet-200 bg-white">
                    <iframe key={`bonus-${station.id}-${embedRound}`} src={embedUrl} title={challenge.externalGame.titleVi} className="h-[480px] w-full border-0 sm:h-[600px]" allow="fullscreen" allowFullScreen />
                  </div>
                  {externalGameReadyToComplete
                    ? <button type="button" onClick={handleExternalGameComplete} className="w-full rounded-2xl bg-amber-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-md hover:bg-amber-600">⭐ NHẬN NGÔI SAO KHÁM PHÁ</button>
                    : <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-[11px] font-bold text-amber-800">Hãy chơi thêm một chút nhé{externalGameCountdown > 0 ? ` · còn ${externalGameCountdown}s` : ''}.</p>}
                </div>
              )}
              {bonusAlreadyClaimed && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center font-black text-amber-900">⭐ Đã nhận Ngôi sao khám phá!</p>}
            </div>
          )}

          <button type="button" onClick={onCompleteStage} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:brightness-110">
            MỞ CHẶNG 3 · CHECK-IN CẢM XÚC →
          </button>
        </section>
      ) : (
        <section className="space-y-5 rounded-[2rem] border border-rose-200 bg-white p-6 shadow-xl shadow-rose-950/5 sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-4xl">💡</div>
            <h3 className="mt-3 text-xl font-black text-slate-950">Còn {wrongQuestions.length} manh mối cần tìm lại</h3>
            <p className="mx-auto mt-1 max-w-lg text-sm text-slate-600">Em đã tìm đúng {questions.length - wrongQuestions.length}/{questions.length} mảnh. Những mảnh đúng được giữ lại; mình cùng thử lại phần còn thiếu nhé.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2" role="status" aria-live="polite">
            {wrongQuestions.map(question => {
              const chosen = question.options.find(option => option.id === selectedAnswers[question.id]);
              return (
                <article key={question.id} className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wide text-rose-700">Manh mối {questions.findIndex(item => item.id === question.id) + 1}</p>
                  <h4 className="mt-1 text-sm font-extrabold leading-relaxed text-slate-900">{question.questionVi}</h4>
                  <p className="mt-2 text-xs text-rose-800">Em đã chọn: {chosen?.textVi || 'Chưa trả lời'}</p>
                  <p className="mt-2 text-xs leading-relaxed text-sky-900"><strong>Gợi ý:</strong> {question.hintVi || 'Em hãy xem lại nội dung khám phá rồi thử lại nhé.'}</p>
                </article>
              );
            })}
          </div>
          <button type="button" onClick={handleRetry} className="mx-auto flex items-center gap-2 rounded-2xl bg-amber-400 px-7 py-3.5 text-sm font-black text-slate-950 shadow-md transition hover:bg-amber-500 active:scale-95">
            <RotateCcw className="h-4 w-4" /> CHỈ LÀM LẠI {wrongQuestions.length} NHIỆM VỤ
          </button>
        </section>
      )}
    </div>
  );
};
