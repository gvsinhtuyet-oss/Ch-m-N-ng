import React, { useState, useMemo, useEffect } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import { CheckCircle2, XCircle, RotateCcw, Award, ChevronRight, HelpCircle, ExternalLink, Gamepad2 } from 'lucide-react';
import { RewardClaimModal } from '../common/RewardClaimModal';


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
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [externalGameOpened, setExternalGameOpened] = useState<boolean>(false);

  const [useInternalChallenge, setUseInternalChallenge] = useState(false);
  const [embedRound, setEmbedRound] = useState(0);
  const resourceId = challenge.externalGame?.url.match(/\/resource\/(\d+)/)?.[1];
  const embedUrl = resourceId ? WORDWALL_EMBED_URLS[resourceId] : undefined;

  useEffect(() => {
    if (!isOnline && challenge.externalGame) setUseInternalChallenge(true);
  }, [isOnline, challenge]);

  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);
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
          progressService.completeStage2(studentId, station.id);
        }
        setShowRewardModal(true);
      } else {
        audioService.playSfx('wrong');
      }
    }
  };

  const handleExternalGameComplete = () => {
    audioService.playSfx('correct');
    if (!isReadOnly) {
      progressService.completeStage2(studentId, station.id);
    }
    setPassed(true);
    setIsSubmitted(true);
    setShowRewardModal(true);
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
            {challenge.externalGame && isOnline && !useInternalChallenge && Boolean(embedUrl)
              ? 'Có kết nối Internet: em sẽ thực hiện trò chơi Wordwall. Nếu mất mạng, hệ thống tự chuyển sang thử thách nội bộ.'
              : challenge.instructionsVi}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
          <Award className="w-7 h-7" />
        </div>
      </div>

      {challenge.externalGame && isOnline && !useInternalChallenge && Boolean(embedUrl) ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-violet-200 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wide mb-1">
                Đang có mạng • Chơi Wordwall
              </span>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                {challenge.externalGame.titleVi}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Bấm “Bắt đầu thử thách” để chơi. Sau khi hoàn thành trò chơi, em chọn “Xác nhận đã hoàn thành” để nhận phần thưởng Chặng 2.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-bold">
            {!externalGameOpened && passed !== true && (
              <span className="text-slate-600">Trạng thái: Chưa bắt đầu thử thách</span>
            )}
            {externalGameOpened && passed !== true && (
              <span className="text-violet-700">Trạng thái: Đang thực hiện thử thách</span>
            )}
            {passed === true && (
              <span className="text-emerald-700 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Trạng thái: Đã hoàn thành thử thách
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                audioService.playSfx('click');
                setExternalGameOpened(true);
                setPassed(null);
                setIsSubmitted(false);
                setEmbedRound(round => round + 1);
              }}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-md transition inline-flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>{externalGameOpened ? 'Chơi lại thử thách' : 'Bắt đầu thử thách'}</span>
            </button>

            <button
              type="button"
              onClick={handleExternalGameComplete}
              disabled={!externalGameOpened || passed === true}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm shadow-md transition inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {passed === true
                  ? 'Đã hoàn thành thử thách'
                  : externalGameOpened
                  ? 'Xác nhận đã hoàn thành'
                  : 'Hoàn thành sau khi chơi'}
              </span>
            </button>
          </div>

          {externalGameOpened && embedUrl && (
            <div className="overflow-hidden rounded-2xl border border-violet-200 bg-slate-50">
              <iframe
                key={`${station.id}-${embedRound}`}
                src={embedUrl}
                title={challenge.externalGame.titleVi}
                className="w-full h-[520px] sm:h-[640px] border-0"
                allow="fullscreen"
                allowFullScreen
                onError={() => setUseInternalChallenge(true)}
              />
            </div>
          )}

          {externalGameOpened && (
            <a
              href={challenge.externalGame.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-violet-700 underline"
            >
              <ExternalLink className="w-4 h-4" />
              Nếu trò chơi chưa hiển thị, mở trong cửa sổ riêng
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              audioService.playSfx('click');
              handleRetry();
              setShowRewardModal(false);
              setUseInternalChallenge(true);
            }}
            className="w-full px-5 py-3 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-sm"
          >
            Trò chơi gặp sự cố? Làm 5 câu hỏi trong app
          </button>

          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-xs text-sky-800">
            Khi mất mạng, hệ thống sẽ tự chuyển sang thử thách nội bộ để em vẫn hoàn thành bài học.
          </div>
        </div>
      ) : (
        <>
          {challenge.externalGame && !isOnline && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold">
              <span className="font-black">Đang ngoại tuyến:</span> Wordwall cần kết nối Internet, vì vậy hệ thống đã chuyển sang thử thách nội bộ.
            </div>
          )}

          {challenge.externalGame && isOnline && (useInternalChallenge || !embedUrl) && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-sm font-semibold">
              Em làm 5 câu hỏi trong app để tiếp tục hành trình và nhận phần thưởng nhé!
            </div>
          )}

          {!isSubmitted ? (
            /* Offline / fallback internal challenge */
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
            /* Internal challenge success */
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-200 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                  Đã vượt qua thử thách
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">Xuất sắc! Em đã vượt qua thử thách.</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Em đã hoàn thành thử thách nội bộ và mở khóa phần thưởng Chặng 2.
                </p>
              </div>
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
                  const correct = q.options.find(option => option.isCorrect);
                  return (
                    <div key={q.id} className="rounded-2xl border border-rose-100 bg-rose-50 p-4 space-y-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        Câu {questions.findIndex(question => question.id === q.id) + 1}: {q.questionVi}
                      </h4>
                      <p className="text-sm text-rose-800">Em đã chọn: {chosen?.textVi || 'Chưa trả lời'}</p>
                      <p className="text-sm font-semibold text-emerald-800">Đáp án đúng: {correct?.textVi}</p>
                      <p className="text-sm text-sky-900">
                        {q.hintVi || 'Em hãy đọc lại câu chuyện ở Chặng 1 và đối chiếu với đáp án đúng nhé.'}
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

      {/* Stage 2 Reward Claim Modal */}
      {showRewardModal && (
        <RewardClaimModal
          reward={station.rewards.find(r => r.stage === 2) || station.rewards[1]}
          stage={2}
          alreadyClaimed={!isReadOnly && progress.rewardsCollected.includes(station.rewards.find(r => r.stage === 2)?.id || '')}
          onClaim={() => {
            if (!isReadOnly) {
              const rw2 = station.rewards.find(r => r.stage === 2);
              if (rw2) {
                progressService.claimReward(studentId, station.id, rw2.id);
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

