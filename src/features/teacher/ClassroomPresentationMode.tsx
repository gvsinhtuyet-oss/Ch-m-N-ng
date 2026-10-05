import React, { useState } from 'react';
import { Station, ExplorationHotspot } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { Volume2, VolumeX, Eye, ChevronLeft, ChevronRight, X, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  station: Station;
  onExit: () => void;
}

export const ClassroomPresentationMode: React.FC<Props> = ({ station, onExit }) => {
  const { isOnline, soundEnabled } = useApp();
  const [activeHotspotIndex, setActiveHotspotIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showVrModal, setShowVrModal] = useState(false);

  const hotspot = station.hotspots[activeHotspotIndex] || station.hotspots[0];

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      audioService.stopNarration();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      audioService.speakNarration(hotspot.narrationVi, 'vi-VN', () => {
        setIsSpeaking(false);
      });
    }
  };

  const handlePrev = () => {
    if (activeHotspotIndex > 0) {
      audioService.stopNarration();
      setIsSpeaking(false);
      setShowAnswer(false);
      setActiveHotspotIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeHotspotIndex < station.hotspots.length - 1) {
      audioService.stopNarration();
      setIsSpeaking(false);
      setShowAnswer(false);
      setActiveHotspotIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col select-none">
      {/* Top Presentation Bar */}
      <div className="px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
            Chế Độ Trình Chiếu Lớp Học
          </span>
          <span className="text-sm font-bold text-slate-300">
            {station.titleVi} • Điểm {activeHotspotIndex + 1} / {station.hotspots.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSpeak}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            <span>{isSpeaking ? 'Dừng đọc' : 'Phát thuyết minh'}</span>
          </button>

          <button
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/80 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>THOÁT TRÌNH CHIẾU</span>
          </button>
        </div>
      </div>

      {/* Main Big Slide Presentation Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Big Visual Projection */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl overflow-hidden relative flex items-center justify-center border border-slate-800 shadow-2xl">
          <img
            src={hotspot.image}
            alt={hotspot.titleVi}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

          {/* 360 Button on big screen */}
          {hotspot.vr360 && (
            <button
              onClick={() => setShowVrModal(true)}
              className="absolute bottom-6 right-6 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl transition flex items-center gap-2 active:scale-95"
            >
              <Eye className="w-5 h-5" />
              <span>Mở 360° Cho Cả Lớp Xem</span>
            </button>
          )}

          {/* Big Hotspot title on projection */}
          <div className="absolute bottom-6 left-6 max-w-xl text-white">
            <h2 className="text-2xl sm:text-3xl font-black drop-shadow-md">
              {hotspot.titleVi}
            </h2>
            {hotspot.subtitleVi && (
              <p className="text-sm text-slate-200 mt-1 drop-shadow-md">
                {hotspot.subtitleVi}
              </p>
            )}
          </div>
        </div>

        {/* Narrative & Teacher Facilitation Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 overflow-y-auto">
          {/* Big Text Narration */}
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Nội Dung Hướng Dẫn & Thuyết Minh</span>
            </div>
            <p className="text-lg sm:text-xl text-slate-100 leading-relaxed font-medium">
              {hotspot.narrationVi}
            </p>

            {hotspot.keyFactVi && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
                <span className="text-xs font-bold uppercase tracking-wider block">Ghi nhớ trọng tâm:</span>
                <p className="text-base text-amber-100 font-bold mt-1 leading-snug">
                  {hotspot.keyFactVi}
                </p>
              </div>
            )}
          </div>

          {/* Big Classroom Interactive Question */}
          {hotspot.interaction && (
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  Câu hỏi thảo luận toàn lớp
                </span>
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án chuẩn'}
                </button>
              </div>

              <p className="text-base sm:text-lg font-bold text-white">
                {hotspot.interaction.questionVi}
              </p>

              <div className="space-y-2 pt-1">
                {hotspot.interaction.options.map(opt => (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-2xl border text-sm font-semibold flex items-center justify-between ${
                      showAnswer && opt.isCorrect
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-black'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300'
                    }`}
                  >
                    <span>{opt.textVi}</span>
                    {showAnswer && opt.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide Controller Next/Prev */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePrev}
              disabled={activeHotspotIndex === 0}
              className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-extrabold text-sm transition flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Điểm trước</span>
            </button>
            <button
              onClick={handleNext}
              disabled={activeHotspotIndex === station.hotspots.length - 1}
              className="flex-1 py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-30 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30"
            >
              <span>Điểm kế tiếp</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* VR 360 Fullscreen modal */}
      {showVrModal && hotspot.vr360 && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-sm text-amber-300">{hotspot.vr360.title}</span>
            <button
              onClick={() => setShowVrModal(false)}
              className="px-4 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
            >
              Đóng 360°
            </button>
          </div>
          <div className="flex-1 mt-3 rounded-2xl overflow-hidden">
            {isOnline ? (
              <iframe src={hotspot.vr360.url} className="w-full h-full border-0" allowFullScreen />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-center">
                Cần kết nối Internet để tải dữ liệu 360°.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
