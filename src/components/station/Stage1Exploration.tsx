import React, { useState, useEffect } from 'react';
import { Station, ExplorationHotspot } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import { Volume2, VolumeX, RotateCcw, CheckCircle2, AlertCircle, Compass, Eye, Sparkles, ChevronRight, ExternalLink } from 'lucide-react';

interface Props {
  station: Station;
  onCompleteStage: () => void;
}

export const Stage1Exploration: React.FC<Props> = ({ station, onCompleteStage }) => {
  const { currentUser, isOnline, language } = useApp();
  const [currentHotspotIdx, setCurrentHotspotIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showVrModal, setShowVrModal] = useState(false);

  const hotspot: ExplorationHotspot = station.hotspots[currentHotspotIdx] || station.hotspots[0];

  // Load progress
  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);
  const isExplored = progress.exploredHotspotIds.includes(hotspot.id);

  useEffect(() => {
    setSelectedOptionId(null);
    setAnswerSubmitted(false);
    setIsCorrect(false);
    audioService.stopNarration();
    setIsSpeaking(false);
  }, [currentHotspotIdx]);

  const handleToggleNarration = () => {
    if (isSpeaking) {
      audioService.stopNarration();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToSpeak = language === 'en' && hotspot.narrationEn ? hotspot.narrationEn : hotspot.narrationVi;
      audioService.speakNarration(textToSpeak, language === 'en' ? 'en-US' : 'vi-VN', () => {
        setIsSpeaking(false);
      });
    }
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
      // Mark hotspot explored
      progressService.completeHotspot(studentId, station.id, hotspot.id);
    } else {
      audioService.playSfx('wrong');
    }
  };

  const handleNextHotspot = () => {
    audioService.playSfx('click');
    // Ensure marked explored if passed
    progressService.completeHotspot(studentId, station.id, hotspot.id);

    if (currentHotspotIdx < station.hotspots.length - 1) {
      setCurrentHotspotIdx(prev => prev + 1);
    } else {
      // Completed all hotspots in stage 1
      const rw = station.rewards.find(r => r.stage === 1);
      progressService.completeStage1(studentId, station.id, rw?.id);
      audioService.playSfx('reward');
      onCompleteStage();
    }
  };

  const totalHotspots = station.hotspots.length;
  const isLastHotspot = currentHotspotIdx === totalHotspots - 1;

  return (
    <div className="space-y-6">
      {/* Exploration Header & Progress */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              Điểm chạm {currentHotspotIdx + 1} / {totalHotspots}
            </span>
            {isExplored && (
              <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã khám phá
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{hotspot.titleVi}</h2>
          {hotspot.subtitleVi && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{hotspot.subtitleVi}</p>}
        </div>

        {/* Hotspot thumbnail dots */}
        <div className="flex items-center gap-2">
          {station.hotspots.map((h, idx) => {
            const explored = progress.exploredHotspotIds.includes(h.id);
            return (
              <button
                key={h.id}
                onClick={() => setCurrentHotspotIdx(idx)}
                className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition ${
                  idx === currentHotspotIdx
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30 scale-105 ring-2 ring-sky-300'
                    : explored
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Exploration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Media & 360 column */}
        <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80">
          <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-900 group">
            <img
              src={hotspot.image}
              alt={hotspot.titleVi}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-102"
              onError={(e) => {
                // Fallback to placeholder image
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                Ảnh thực tế di sản
              </span>
            </div>

            {/* VR 360 CTA Button */}
            {hotspot.vr360 && (
              <button
                onClick={() => setShowVrModal(true)}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg transition active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>Mở không gian 360°</span>
              </button>
            )}

            {/* Narration quick control on image */}
            <button
              onClick={handleToggleNarration}
              className={`absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl backdrop-blur-md font-bold text-xs transition ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-white/90 hover:bg-white text-slate-800'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
              <span>{isSpeaking ? 'Tạm dừng đọc' : 'Nghe giọng đọc'}</span>
            </button>
          </div>

          {/* Media rights & credit */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{hotspot.mediaCredit || 'Ảnh tư liệu đã kiểm duyệt'}</span>
            <span className="text-emerald-700 font-medium">Bản quyền: Đã cấp phép giáo dục</span>
          </div>
        </div>

        {/* Narrative & Interaction column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Narration Box */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Lời Thuyết Minh Điểm Đến
              </span>
              <button
                onClick={handleToggleNarration}
                className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
              >
                {isSpeaking ? 'Dừng đọc' : 'Đọc lại'}
              </button>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {hotspot.narrationVi}
            </p>

            {/* Key Fact card */}
            {hotspot.keyFactVi && (
              <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    ★
                  </div>
                  <div>
                    <span className="font-bold text-xs text-amber-900 block">Điều thú vị cần nhớ:</span>
                    <p className="text-xs text-amber-950 mt-0.5 font-medium leading-normal">
                      {hotspot.keyFactVi}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive touchpoint question */}
          {hotspot.interaction && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                  ?
                </span>
                <h3 className="font-bold text-sm text-slate-900">Khám phá tương tác</h3>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-3">
                {hotspot.interaction.questionVi}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {hotspot.interaction.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let optStyle = 'border-slate-200 hover:bg-slate-50 text-slate-700';

                  if (answerSubmitted) {
                    if (opt.isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected && !opt.isCorrect) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-sky-500 bg-sky-50 text-sky-900 font-semibold ring-1 ring-sky-300';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={answerSubmitted}
                      className={`w-full p-3 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between gap-3 ${optStyle}`}
                    >
                      <span>{opt.textVi}</span>
                      {answerSubmitted && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {answerSubmitted && (
                <div
                  className={`mt-4 p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <p className="font-bold mb-1">
                    {isCorrect
                      ? 'Chính xác! Em đã phát hiện thêm một điều thú vị về điểm đến này.'
                      : 'Chưa đúng rồi. Em xem lại hình ảnh hoặc nghe lại thuyết minh nhé!'}
                  </p>
                  <p className="text-[11px] text-slate-600">{hotspot.interaction.explanationVi}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 flex items-center gap-2">
                {!answerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOptionId}
                    className="w-full py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-98"
                  >
                    Kiểm tra câu trả lời
                  </button>
                ) : !isCorrect ? (
                  <div className="flex w-full gap-2">
                    <button
                      onClick={() => {
                        setAnswerSubmitted(false);
                        setSelectedOptionId(null);
                      }}
                      className="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
                    >
                      Thử lại
                    </button>
                    <button
                      onClick={handleNextHotspot}
                      className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      Tiếp tục khám phá
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleNextHotspot}
                    className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <span>{isLastHotspot ? 'Hoàn thành Chặng 1 – Nhận phần thưởng!' : 'Khám phá điểm tiếp theo'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VR 360 Fullscreen Modal */}
      {showVrModal && hotspot.vr360 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6">
          <div className="w-full max-w-4xl h-[85vh] bg-slate-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-700">
            {/* Modal header */}
            <div className="p-4 bg-slate-800/90 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">{hotspot.vr360.title || 'Toàn cảnh VR 360°'}</span>
              </div>
              <button
                onClick={() => setShowVrModal(false)}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 bg-black relative flex items-center justify-center">
              {isOnline ? (
                <iframe
                  src={hotspot.vr360.url}
                  title="VR 360 Viewer"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-6 text-slate-300">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Nội dung này cần kết nối Internet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Chế độ không gian thực tế ảo 360° yêu cầu dữ liệu trực tuyến. Em hãy kết nối mạng để trải nghiệm nhé!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
