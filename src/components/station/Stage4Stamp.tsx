import React, { useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import confetti from 'canvas-confetti';
import { Award, Compass, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

interface Props {
  station: Station;
  onReviewJourney: () => void;
  onExploreNext: () => void;
}

export const Stage4Stamp: React.FC<Props> = ({ station, onReviewJourney, onExploreNext }) => {
  const { currentUser } = useApp();
  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);

  const [stamped, setStamped] = useState<boolean>(progress.stampReceived || progress.stationCompleted);

  const handleStamp = () => {
    audioService.playSfx('stamp');
    setTimeout(() => {
      audioService.playSfx('victory');
    }, 200);

    // Confetti effect 2.5s
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);
    } catch {
      // ignore
    }

    setStamped(true);
    progressService.completeStage4(studentId, station.id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-extrabold text-xs uppercase tracking-wider inline-block mb-2">
            Chặng 4: Lưu Dấu Hành Trình
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">{station.titleVi}</h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-2 max-w-lg mx-auto font-medium">
            Em đã hoàn thành xuất sắc các chặng khám phá và chinh phục trọn vẹn mục tiêu bài học!
          </p>
        </div>
      </div>

      {/* Rewards Collection Showcase */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-extrabold text-xs sm:text-sm text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Bộ 3 Kỉ Niệm Đã Thu Thập:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {station.rewards.map((rw) => (
            <div
              key={rw.id}
              className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                {rw.stage === 1 ? '🏮' : rw.stage === 2 ? '🧭' : '💖'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Chặng {rw.stage}</span>
                <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{rw.nameVi}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stamp Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center space-y-6">
        {!stamped ? (
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-dashed border-sky-300 bg-sky-50/50 flex flex-col items-center justify-center text-sky-500">
              <Award className="w-12 h-12 stroke-[1.5]" />
              <span className="text-[11px] font-bold mt-1">Con dấu chờ đóng</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Sẵn sàng lưu dấu vào Hộ chiếu?</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Nhấn vào nút bên dưới để đóng dấu chứng nhận hoàn thành trạm học tập này.
              </p>
            </div>

            <button
              onClick={handleStamp}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-5 h-5" />
              <span>ĐÓNG DẤU HOÀN THÀNH</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* The Actual Stamped Stamp with Animation */}
            <div className="inline-block relative p-2">
              <div className="animate-stamp w-40 h-40 sm:w-44 sm:h-44 rounded-full border-4 border-double border-red-700 bg-red-50/80 p-3 flex flex-col items-center justify-center text-red-700 shadow-xl shadow-red-500/20 rotate-[-4deg]">
                <div className="w-full h-full rounded-full border border-red-600/70 p-2 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-red-800">
                    SỞ GDĐT ĐÀ NẴNG
                  </span>
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center my-1">
                    <Compass className="w-5 h-5 text-red-700" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tight text-red-900 px-1 leading-tight">
                    {station.stamp.nameVi}
                  </span>
                  <span className="text-[8px] font-bold text-red-600 mt-0.5">
                    ★ ĐÃ HOÀN THÀNH ★
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Chúc mừng nhà khám phá! Em đã hoàn thành trạm</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">{station.titleVi}</h3>
              <p className="text-xs text-slate-500 italic mt-1 max-w-md mx-auto">
                "{station.stamp.quoteVi}"
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={onReviewJourney}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>XEM LẠI HÀNH TRÌNH</span>
              </button>

              <button
                onClick={onExploreNext}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <span>KHÁM PHÁ TRẠM TIẾP THEO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
