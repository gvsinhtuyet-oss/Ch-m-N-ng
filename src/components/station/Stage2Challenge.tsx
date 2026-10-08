import React, { useState, useMemo, useEffect } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { progressService } from '../../services/ProgressService';
import { CheckCircle2, XCircle, RotateCcw, Award, ChevronRight, HelpCircle, Gamepad2 } from 'lucide-react';


// Shuffle a copy so option IDs and correctness stay unchanged.
function shuffleOptions<T>(options: readonly T[]): T[] {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Official embed URLs returned by Wordwall's oEmbed API.
const WORDWALL_EMBED_URLS: Record<string, string> = {
  "120604647": "https://wordwall.net/embed/9bf5318dbfc94898902ef662795c3973?themeId=65&ref=oembed",
  "120605543": "https://wordwall.net/embed/998e4ceb735f4333b8e89dc347a8ac33?themeId=46&ref=oembed",
  "120606175": "https://wordwall.net/embed/2c3810ecb9834a54b8196a88658f54c6?themeId=62&ref=oembed",
  "120606516": "https://wordwall.net/embed/9c87d7fd21d84cc5a27008f055576960?themeId=49&ref=oembed",
  "120607731": "https://wordwall.net/embed/5e9f990113d24b5bac54f5738b1f9915?themeId=1&ref=oembed"
};

interface Props {
  station: Station;
  onCompleteStage: () => void;
}

export const Stage2Challenge: React.FC<Props> = ({ station, onCompleteStage }) => {
  const { currentUser, role, isOnline } = useApp();
  const isReadOnly = role !== 'student';
  const challenge = station.challenge;
  const [shuffleRound, setShuffleRound] = useState(0);
  const questions = useMemo(
    () => (challenge.questions || []).map(question => ({
      ...question,
      options: shuffleOptions(question.options),
    })),
    [challenge, shuffleRound],
  );

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(false);
  const [externalGameOpened, setExternalGameOpened] = useState<boolean>(false);
  const [externalGameReadyToComplete, setExternalGameReadyToComplete] = useState(false);
  const [externalGameCountdown, setExternalGameCountdown] = useState(45);
  const [useInternalChallenge, setUseInternalChallenge] = useState(false);
  const [embedRound, setEmbedRound] = useState(0);
  const resourceId = challenge.externalGame?.url.match(/\/resource\/(\d+)/)?.[1];
  const embedUrl = resourceId ? WORDWALL_EMBED_URLS[resourceId] : undefined;

  useEffect(() => {
    if (!isOnline && challenge.externalGame) setUseInternalChallenge(true);
  }, [isOnline, challenge]);

  useEffect(() => {
    if (!externalGameOpened || useInternalChallenge || !isOnline || !embedUrl) return;
    backgroundMusic.setForegroundSource('wordwall', true);
    return () => backgroundMusic.setForegroundSource('wordwall', false);
  }, [externalGameOpened, useInternalChallenge, isOnline, embedUrl]);

  useEffect(() => {
    if (!externalGameOpened || useInternalChallenge || !isOnline || !embedUrl) return;

    setExternalGameReadyToComplete(false);
    setExternalGameCountdown(45);

    const countdownTimer = window.setInterval(() => {
      setExternalGameCountdown(value => {
        if (value <= 1) {
          window.clearInterval(countdownTimer);
          setExternalGameReadyToComplete(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    const handleWordwallMessage = (event: MessageEvent) => {
      if (typeof event.origin !== 'string' || !/wordwall\.net$/i.test(new URL(event.origin).hostname)) return;
      let payload = '';
      try {
        payload = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
      } catch {
        payload = '';
      }
      if (/complete|completed|finish|finished|result|score/i.test(payload)) {
        setExternalGameReadyToComplete(true);
        setExternalGameCountdown(0);
      }
    };

    window.addEventListener('message', handleWordwallMessage);
    return () => {
      window.clearInterval(countdownTimer);
      window.removeEventListener('message', handleWordwallMessage);
    };
  }, [externalGameOpened, useInternalChallenge, isOnline, embedUrl, embedRound]);


  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);
  const mainReward = station.rewards.find(r => r.stage === 2) || station.rewards[1];
  const bonusRewardId = `${station.id}-wordwall-star`;
  const wordwallBonusAlreadyClaimed = progress.rewardsCollected.includes(bonusRewardId) || bonusClaimed;
  const currentQ = questions[currentQIndex];

  const handleSelect = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    audioService.playSfx('click');
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNextOrFinish = () => {
    if (currentQIndex < questions.length - 1) {
      audioService.playSfx('click');
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Evaluate all answers
      let correctCount = 0;
      questions.forEach(q => {
        const picked = selectedAnswers[q.id];
        const correctOpt = q.options.find(o => o.isCorrect);
        if (picked === correctOpt?.id) {
          correctCount++;
        }
      });

      const pass = correctCount === questions.length;
      setPassed(pass);
      setIsSubmitted(true);

      if (pass) {
        audioService.playSfx('correct');
        if (!isReadOnly) {
          progressService.completeStage2(studentId, station.id, mainReward?.id);
        }
        audioService.playSfx('reward');
      } else {
        audioService.playSfx('wrong');
      }
    }
  };

  const handleExternalGameComplete = () => {
    if (!externalGameOpened || !externalGameReadyToComplete || wordwallBonusAlreadyClaimed) return;
    audioService.playSfx('treasure');
    if (!isReadOnly) {
      progressService.claimReward(studentId, station.id, bonusRewardId);
    }
    setBonusClaimed(true);
  };

  const wrongQuestions = questions.filter(q =>
    !q.options.some(option => option.isCorrect && option.id === selectedAnswers[q.id]),
  );

  const handleRetry = () => {
    audioService.playSfx('click');
    setShuffleRound(round => round + 1);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
    setPassed(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Challenge Title Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 mb-2 inline-block">
            Chặng 2: Chinh phục thử thách
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{challenge.titleVi}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {challenge.instructionsVi || 'Hoàn thành các câu hỏi trong app để vượt qua Chặng 2.'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
          <Award className="w-7 h-7" />
        </div>
      </div>

      <>
          {!isSubmitted ? (
            /* Main in-app challenge */
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-extrabold text-sm text-sky-700">
                  Câu hỏi {currentQIndex + 1} / {questions.length}
                </span>
                <div className="flex gap-1.5">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-2 rounded-full transition ${
                        i === currentQIndex
                          ? 'bg-sky-600'
                          : selectedAnswers[questions[i]?.id]
                          ? 'bg-emerald-400'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {currentQ && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentQ.questionVi}
                  </h3>

                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt) => {
                      const isSelected = selectedAnswers[currentQ.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(currentQ.id, opt.id)}
                          className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50/80 text-sky-950 font-bold ring-2 ring-sky-300 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{opt.textVi}</span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                              isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {currentQ.hintVi && (
                    <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-sky-800 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span><strong>Gợi ý:</strong> {currentQ.hintVi}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex items-center justify-end">
                <button
                  onClick={handleNextOrFinish}
                  disabled={!currentQ || !selectedAnswers[currentQ.id]}
                  className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm shadow-md transition flex items-center gap-2 active:scale-98"
                >
                  <span>{currentQIndex === questions.length - 1 ? 'Nộp bài thử thách' : 'Câu tiếp theo'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : passed ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                  Đã vượt qua thử thách
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">Xuất sắc! Em đã vượt qua thử thách.</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
                  ✓ Phần thưởng Chặng 2 đã được tự động lưu vào hành trình.
                </p>
              </div>

              {challenge.externalGame && isOnline && embedUrl && (
                <div className="rounded-3xl border border-violet-200 bg-violet-50/70 p-4 sm:p-5 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-violet-700">Thử thách mở rộng</p>
                      <h4 className="font-black text-slate-900">Thử sức thêm nhé!</h4>
                      <p className="mt-1 text-xs text-slate-600">
                        Chơi thêm Wordwall để nhận ⭐ Ngôi sao khám phá. Phần này không bắt buộc để qua chặng.
                      </p>
                    </div>
                  </div>

                  {!externalGameOpened && !wordwallBonusAlreadyClaimed && (
                    <button
                      type="button"
                      onClick={() => {
                        audioService.playSfx('click');
                        setExternalGameOpened(true);
                        setExternalGameReadyToComplete(false);
                        setExternalGameCountdown(45);
                        setEmbedRound(round => round + 1);
                      }}
                      className="mt-4 w-full rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-md hover:bg-violet-700"
                    >
                      CHƠI THÊM WORDWALL
                    </button>
                  )}

                  {externalGameOpened && !wordwallBonusAlreadyClaimed && (
                    <div className="mt-4 space-y-3">
                      <div className="overflow-hidden rounded-2xl border border-violet-200 bg-white">
                        <iframe
                          key={`bonus-${station.id}-${embedRound}`}
                          src={embedUrl}
                          title={challenge.externalGame.titleVi}
                          className="w-full h-[480px] sm:h-[600px] border-0"
                          allow="fullscreen"
                          allowFullScreen
                        />
                      </div>
                      {externalGameReadyToComplete ? (
                        <button
                          type="button"
                          onClick={handleExternalGameComplete}
                          className="w-full rounded-2xl bg-amber-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-md hover:bg-amber-600"
                        >
                          ⭐ NHẬN NGÔI SAO KHÁM PHÁ
                        </button>
                      ) : (
                        <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-[11px] font-bold text-amber-800">
                          Hãy chơi thêm một chút nhé
                          {externalGameCountdown > 0 ? ` • còn ${externalGameCountdown}s` : ''}.
                        </p>
                      )}
                    </div>
                  )}

                  {wordwallBonusAlreadyClaimed && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                      <p className="font-black text-amber-900">⭐ Đã nhận Ngôi sao khám phá!</p>
                      <p className="mt-1 text-[11px] text-amber-700">Mỗi trạm chỉ nhận phần thưởng mở rộng này một lần.</p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={onCompleteStage}
                className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-sky-600/20 transition hover:from-sky-700 hover:to-emerald-700"
              >
                TIẾP TỤC HÀNH TRÌNH →
              </button>
            </div>
          ) : (
            /* Internal challenge failure */
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-rose-200 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Em chưa vượt qua thử thách lần này. Hãy thử lại nhé!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Em có thể thử lại ngay hoặc xem lại phần khám phá ở Chặng 1.
                </p>
              </div>
              <div className="space-y-3 text-left" role="status" aria-live="polite">
                <p className="text-sm font-bold text-slate-700">
                  Em đã trả lời đúng {questions.length - wrongQuestions.length}/{questions.length} câu.
                  Cùng xem lại những câu sau nhé:
                </p>
                {wrongQuestions.map(q => {
                  const chosen = q.options.find(option => option.id === selectedAnswers[q.id]);
                  return (
                    <div key={q.id} className="rounded-2xl border border-rose-100 bg-rose-50 p-4 space-y-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        Câu {questions.findIndex(question => question.id === q.id) + 1}: {q.questionVi}
                      </h4>
                      <p className="text-sm text-rose-800">Em đã chọn: {chosen?.textVi || 'Chưa trả lời'}</p>
                      <p className="text-sm text-sky-900">
                        <strong>Gợi ý:</strong> {q.hintVi || 'Em hãy xem lại nội dung khám phá ở Chặng 1 rồi thử lại nhé.'}
                      </p>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleRetry}
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>THỬ LẠI THỬ THÁCH</span>
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

