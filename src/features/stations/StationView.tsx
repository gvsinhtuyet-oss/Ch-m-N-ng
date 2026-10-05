import React, { useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { progressService } from '../../services/ProgressService';
import { offlineService } from '../../services/OfflineService';
import { Stage1Exploration } from '../../components/station/Stage1Exploration';
import { Stage2Challenge } from '../../components/station/Stage2Challenge';
import { Stage3CheckIn } from '../../components/station/Stage3CheckIn';
import { Stage4Stamp } from '../../components/station/Stage4Stamp';
import { ArrowLeft, Download, CheckCircle2, Compass, Award, Heart, Sparkles, BookOpen } from 'lucide-react';

interface Props {
  station: Station;
  onBack: () => void;
}

export const StationView: React.FC<Props> = ({ station, onBack }) => {
  const { currentUser, currentStage, setCurrentStage } = useApp();
  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);

  const [downloading, setDownloading] = useState(false);
  const [offlinePkg, setOfflinePkg] = useState(offlineService.getPackage(station.id));

  // If completed once or stamp received, student can freely navigate stages
  const isUnlockedAllStages = progress.stationCompleted || progress.stampReceived;

  const handleDownload = async () => {
    setDownloading(true);
    const pkg = await offlineService.downloadStation(station.id);
    setOfflinePkg(pkg);
    setDownloading(false);
  };

  const stages = [
    { num: 1, title: 'Chặng 1', name: 'Giải mã điểm đến', icon: Compass },
    { num: 2, title: 'Chặng 2', name: 'Chinh phục thử thách', icon: Award },
    { num: 3, title: 'Chặng 3', name: 'Check-in cảm xúc', icon: Heart },
    { num: 4, title: 'Chặng 4', name: 'Lưu dấu hành trình', icon: Sparkles },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Station Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
            title="Quay lại danh sách trạm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">
                Trạm {station.number}
              </span>
              <span className="text-xs text-slate-400 font-medium">Khối {station.grade}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {station.titleVi}
            </h1>
          </div>
        </div>

        {/* Offline Download button */}
        <div className="flex items-center gap-2">
          {offlinePkg ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã tải offline ({offlinePkg.sizeMb}MB)</span>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Đang tải...' : 'TẢI TRẠM ĐỂ HỌC OFFLINE'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Stages Navigation (only unlocked if completed or in replay mode) */}
      {isUnlockedAllStages ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/70 p-1.5 rounded-2xl">
          {stages.map((st) => {
            const Icon = st.icon;
            const isActive = currentStage === st.num;
            return (
              <button
                key={st.num}
                onClick={() => setCurrentStage(st.num as any)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  isActive
                    ? 'bg-white text-sky-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span className="truncate">{st.num}. {st.name}</span>
              </button>
            );
          })}
        </div>
      ) : (
        /* First time flow stepper */
        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Hành trình lần đầu:</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                  currentStage === step
                    ? 'bg-sky-600 text-white shadow-xs'
                    : currentStage > step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <span>Chặng {step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Views */}
      {currentStage === 1 && (
        <Stage1Exploration
          station={station}
          onCompleteStage={() => setCurrentStage(2)}
        />
      )}

      {currentStage === 2 && (
        <Stage2Challenge
          station={station}
          onCompleteStage={() => setCurrentStage(3)}
        />
      )}

      {currentStage === 3 && (
        <Stage3CheckIn
          station={station}
          onCompleteStage={() => setCurrentStage(4)}
        />
      )}

      {currentStage === 4 && (
        <Stage4Stamp
          station={station}
          onReviewJourney={() => setCurrentStage(1)}
          onExploreNext={onBack}
        />
      )}
    </div>
  );
};
