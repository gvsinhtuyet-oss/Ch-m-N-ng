import React, { useState, useEffect } from 'react';
import { Station, ExplorationHotspot } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService, NarrationState } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sparkles,
  ChevronRight,
  ExternalLink,
  X,
  Info,
} from 'lucide-react';

interface Props {
  station: Station;
  onCompleteStage: () => void;
}

export const Stage1Exploration: React.FC<Props> = ({ station, onCompleteStage }) => {
  const { currentUser, isOnline, language } = useApp();
  const [currentHotspotIdx, setCurrentHotspotIdx] = useState(0);
  const [narrationState, setNarrationState] = useState<NarrationState>('idle');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showVrModal, setShowVrModal] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const hotspot: ExplorationHotspot = station.hotspots[currentHotspotIdx] || station.hotspots[0];

  // Subscribe to audio service state
  useEffect(() => {
    const unsubscribe = audioService.subscribeState((state) => {
      setNarrationState(state);
    });
    return () => {
      unsubscribe();
      audioService.stopNarration();
    };
  }, []);

  // Hotspot change handler
  useEffect(() => {
    setSelectedOptionId(null);
    setAnswerSubmitted(false);
    setIsCorrect(false);
    setIframeError(false);
    audioService.stopNarration();
  }, [currentHotspotIdx]);

  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);
  const isExplored = progress.exploredHotspotIds.includes(hotspot.id);

  // Audio Playback Controls
  const handlePlayAudio = () => {
    const textToSpeak = language === 'en' && hotspot.narrationEn ? hotspot.narrationEn : hotspot.narrationVi;
    audioService.speakNarration(textToSpeak, language === 'en' ? 'en-US' : 'vi-VN');
  };

  const handlePauseAudio = () => {
    audioService.pauseNarration();
  };

  const handleResumeAudio = () => {
    audioService.resumeNarration();
  };

  const handleRestartAudio = () => {
    audioService.stopNarration();
    handlePlayAudio();
  };

  const handleSelectOption = (optId: string) => {
    if (answerSubmitted) return;
    audioService.playSfx('click');
    setSelectedOptionId(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !hotspot.interaction) return;
    const chosen = hotspot.interaction.options.find(o => o.id === selectedOptionId);
    const correct = !!chosen?.isCorrect;
    setIsCorrect(correct);
    setAnswerSubmitted(true);

    if (correct) {
      audioService.playSfx('correct');
      progressService.completeHotspot(studentId, station.id, hotspot.id);
    } else {
      audioService.playSfx('wrong');
    }
  };

  const changeHotspot = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < station.hotspots.length) {
      audioService.playSfx('transition');
      setCurrentHotspotIdx(newIndex);
    }
  };

  const handleNextHotspot = () => {
    audioService.playSfx('click');
    progressService.completeHotspot(studentId, station.id, hotspot.id);

    if (currentHotspotIdx < station.hotspots.length - 1) {
      changeHotspot(currentHotspotIdx + 1);
    } else {
      const rw = station.rewards.find(r => r.stage === 1);
      progressService.completeStage1(studentId, station.id, rw?.id);
      audioService.playSfx('reward');
      onCompleteStage();
    }
  };

  const totalHotspots = station.hotspots.length;
  const isLastHotspot = currentHotspotIdx === totalHotspots - 1;
  const isPlaying = narrationState === 'playing';
  const isPaused = narrationState === 'paused';

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-sm border border-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-sky-600 to-amber-500 text-white shadow-xs">
              Điểm chạm {currentHotspotIdx + 1} / {totalHotspots}
            </span>
            {isExplored && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã khám phá
              </span>
            )}
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">• Chặng 1: Giải mã điểm đến</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {hotspot.titleVi}
          </h2>
          {hotspot.subtitleVi && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{hotspot.subtitleVi}</p>
          )}
        </div>

        {/* Hotspot Step Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
          {station.hotspots.map((h, idx) => {
            const explored = progress.exploredHotspotIds.includes(h.id);
            const isCurrent = idx === currentHotspotIdx;
            return (
              <button
                key={h.id}
                onClick={() => changeHotspot(idx)}
                className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                  isCurrent
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105'
                    : explored
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title={h.titleVi}
              >
                <span>{idx + 1}</span>
                {explored && <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Station-Level VR360 Total Experience Card */}
      {(station.id === 'g2-station-4' || station.vr360Experience) && (
        <div className="bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-2xs">
                <Globe className="w-5 h-5" />
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {station.vr360Experience?.titleVi || 'KHÁM PHÁ HỘI AN 360°'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Xoay để quan sát toàn cảnh và chạm các điểm khám phá trong không gian di sản.
            </p>
          </div>

          <div className="shrink-0">
            {station.vr360Experience?.verified && station.vr360Experience?.url ? (
              <button
                onClick={() => {
                  audioService.playSfx('click');
                  setShowVrModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/30 transition transform hover:scale-105 active:scale-95"
              >
                <Globe className="w-4 h-4" />
                <span>🌐 BẮT ĐẦU KHÁM PHÁ 360°</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 text-amber-900 border border-amber-200 text-xs font-bold shadow-2xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Trải nghiệm Hội An 360° đang được cập nhật từ nguồn đã kiểm chứng.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Hotspot Stage Canvas (4 Outside-VR Learning Hotspots) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Showcase (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 flex flex-col group">
          <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-950 overflow-hidden">
            <img
              src={hotspot.image}
              alt={hotspot.titleVi}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/30 pointer-events-none" />

            {/* Top Badge */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-black shadow-md border border-white/20">
                {hotspot.mediaRights === 'ALLOWED' && !hotspot.mediaCredit?.includes('minh họa')
                  ? 'Ảnh thực tế di sản'
                  : 'Ảnh minh họa đang cập nhật'}
              </span>
            </div>

            {/* Audio Playback Hero Pill (Positioned Prominently at Bottom Left) */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
                {!isPlaying && !isPaused ? (
                  <button
                    onClick={handlePlayAudio}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black text-xs shadow-md transition transform hover:scale-102 active:scale-95"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>NGHE THUYẾT MINH</span>
                  </button>
                ) : isPlaying ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePauseAudio}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition"
                    >
                      <Pause className="w-4 h-4 fill-slate-950" />
                      <span>Tạm dừng</span>
                    </button>
                    <button
                      onClick={handleRestartAudio}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs transition"
                      title="Nghe lại từ đầu"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    {/* Animated sound wave bars */}
                    <div className="flex items-center gap-1 px-2">
                      <span className="w-1 h-4 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-6 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-3 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="w-1 h-5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResumeAudio}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs transition"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Tiếp tục nghe</span>
                    </button>
                    <button
                      onClick={handleRestartAudio}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs transition"
                      title="Nghe lại từ đầu"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Media source and copyright credit */}
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
            <span>Nguồn ảnh: {hotspot.mediaCredit || 'Hình ảnh minh họa đang cập nhật'}</span>
            <span className="text-slate-600 font-medium">Tư liệu đang chuẩn hóa</span>
          </div>
        </div>

        {/* Narrative, Key Fact & Knowledge Interaction (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Narration Box with Speech Aura Highlight */}
          <div
            className={`bg-white rounded-3xl p-6 shadow-sm border transition-all duration-500 ${
              isPlaying
                ? 'border-sky-400 ring-4 ring-sky-100 bg-sky-50/30'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Câu Chuyện Điểm Đến
              </span>
              <button
                onClick={isPlaying ? handlePauseAudio : isPaused ? handleResumeAudio : handlePlayAudio}
                className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
              >
                {isPlaying ? 'Tạm dừng đọc' : isPaused ? 'Tiếp tục' : 'Phát âm thanh'}
              </button>
            </div>

            {/* Transcript text with subtle highlight when playing */}
            <p
              className={`text-base sm:text-lg leading-relaxed font-medium transition-colors duration-300 ${
                isPlaying ? 'text-slate-950' : 'text-slate-700'
              }`}
            >
              {hotspot.narrationVi}
            </p>

            {/* Key Fact Highlight Card */}
            {hotspot.keyFactVi && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs mt-0.5">
                    ★
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-amber-900 uppercase tracking-wide block">
                      Điều thú vị cần nhớ:
                    </span>
                    <p className="text-xs sm:text-sm text-amber-950 font-bold mt-1 leading-snug">
                      {hotspot.keyFactVi}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Touchpoint Question */}
          {hotspot.interaction && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-extrabold">
                  ?
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">Khám phá tương tác</h3>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                {hotspot.interaction.questionVi}
              </p>

              {/* Options */}
              <div className="space-y-2.5">
                {hotspot.interaction.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let optClass = 'border-slate-200 hover:bg-slate-50 text-slate-700';

                  if (answerSubmitted) {
                    if (opt.isCorrect) {
                      optClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-300';
                    } else if (isSelected && !opt.isCorrect) {
                      optClass = 'border-rose-400 bg-rose-50 text-rose-900';
                    }
                  } else if (isSelected) {
                    optClass = 'border-sky-500 bg-sky-50 text-sky-950 font-bold ring-2 ring-sky-300';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={answerSubmitted}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between gap-3 ${optClass}`}
                    >
                      <span>{opt.textVi}</span>
                      {answerSubmitted && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {answerSubmitted && (
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                      : 'bg-amber-50 text-amber-950 border border-amber-200'
                  }`}
                >
                  <p className="font-extrabold text-sm mb-1">
                    {isCorrect
                      ? 'Chính xác! Em đã phát hiện thêm một điều thú vị về điểm đến này.'
                      : 'Chưa đúng rồi. Em xem lại hình ảnh hoặc nghe lại thuyết minh nhé!'}
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {hotspot.interaction.explanationVi}
                  </p>
                </div>
              )}

              {/* Control Buttons */}
              <div className="pt-2">
                {!answerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOptionId}
                    className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm shadow-md transition active:scale-98"
                  >
                    Kiểm tra câu trả lời
                  </button>
                ) : !isCorrect ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAnswerSubmitted(false);
                        setSelectedOptionId(null);
                      }}
                      className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition"
                    >
                      Thử lại
                    </button>
                    <button
                      onClick={handleNextHotspot}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      Tiếp tục khám phá
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleNextHotspot}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>{isLastHotspot ? 'Hoàn thành Chặng 1 – Nhận phần thưởng!' : 'Khám phá điểm tiếp theo'}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Station Total VR360 Modal */}
      {showVrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
          <div className="w-full max-w-5xl h-[88vh] bg-slate-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-700">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-800/90 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-amber-400 animate-spin-slow" />
                <div>
                  <h3 className="font-extrabold text-sm">
                    {station.vr360Experience?.titleVi || 'Khám phá Hội An 360°'}
                  </h3>
                  <span className="text-[11px] text-slate-400">Không gian thực tế ảo di sản</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {station.vr360Experience?.url && (
                  <a
                    href={station.vr360Experience.fallbackUrl || station.vr360Experience.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>MỞ TAB MỚI</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => setShowVrModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1"
                  title="Đóng cửa sổ 360°"
                >
                  <X className="w-4 h-4" />
                  <span>ĐÓNG</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
              {!isOnline ? (
                <div className="text-center p-8 text-slate-300 max-w-md">
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Nội dung 360° cần kết nối Internet</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Trải nghiệm ảnh toàn cảnh thực tế ảo 360° yêu cầu dữ liệu trực tuyến. Em hãy kết nối mạng để thưởng ngoạn nhé!
                  </p>
                </div>
              ) : iframeError || !station.vr360Experience?.url ? (
                <div className="text-center p-8 text-slate-300 max-w-md space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center mx-auto">
                    <Info className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Nguồn 360° đang cập nhật</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Nguồn 360° không cho phép nhúng trực tiếp hoặc đang được thẩm định từ nguồn chính thức. Em có thể mở trải nghiệm trong tab mới khi có URL kiểm chứng.
                    </p>
                  </div>
                  {station.vr360Experience?.url ? (
                    <a
                      href={station.vr360Experience.fallbackUrl || station.vr360Experience.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl"
                    >
                      <span>MỞ TAB MỚI</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setShowVrModal(false)}
                      className="px-6 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs"
                    >
                      Đã hiểu
                    </button>
                  )}
                </div>
              ) : (
                <iframe
                  src={station.vr360Experience.url}
                  title={station.vr360Experience.titleVi}
                  className="w-full h-full border-0"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  onError={() => setIframeError(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
