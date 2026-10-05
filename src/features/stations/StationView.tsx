import React, { useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { progressService } from '../../services/ProgressService';
import { offlineService } from '../../services/OfflineService';
import { audioService } from '../../services/AudioService';
import { Stage1Exploration } from '../../components/station/Stage1Exploration';
import { Stage2Challenge } from '../../components/station/Stage2Challenge';
import { Stage3CheckIn } from '../../components/station/Stage3CheckIn';
import { Stage4Stamp } from '../../components/station/Stage4Stamp';
import { ArrowLeft, Download, CheckCircle2, Compass, Award, Heart, Sparkles } from 'lucide-react';

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
    audioService.playSfx('click');
    setDownloading(true);
    const pkg = await offlineService.downloadStation(station.id);
    setOfflinePkg(pkg);
    setDownloading(false);
    audioService.playSfx('reward');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              audioService.playSfx('click');
              onBack();
            }}
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition shadow-2xs shrink-0"
            title="Quay lại danh sách trạm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-2xs">
                Trạm {station.number}
              </span>
              <span className="text-xs text-slate-400 font-bold">Khối {station.grade}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-amber-700 font-semibold">{station.themeNameVi}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
              {station.titleVi}
            </h1>
          </div>
        </div>

        {/* Offline Download button */}
        <div className="flex items-center gap-2 shrink-0">
          {offlinePkg ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã tải offline ({offlinePkg.sizeMb}MB)</span>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-black border border-sky-200 transition shadow-2xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>{downloading ? 'Đang tải...' : 'TẢI TRẠM ĐỂ HỌC OFFLINE'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Verification notice if draft */}
      {!station.isFullyVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-medium flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
          <span>
            <strong>Lưu ý:</strong> Nội dung đang được hoàn thiện từ nguồn đã kiểm chứng của Sở Giáo dục và Đào tạo TP Đà Nẵng.
          </span>
        </div>
      )}

      {/* 4 Stages Navigation */}
      {isUnlockedAllStages ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
          {stages.map((st) => {
            const Icon = st.icon;
            const isActive = currentStage === st.num;
            return (
              <button
                key={st.num}
                onClick={() => {
                  audioService.playSfx('click');
                  setCurrentStage(st.num as any);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  isActive
                    ? 'bg-white text-sky-950 shadow-md font-black scale-102'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span className="truncate">{st.num}. {st.name}</span>
              </button>
            );
          })}
        </div>
      ) : (
        /* First time flow stepper */
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-500">
          <span className="text-slate-700">Hành trình lần đầu (hoàn thành tuần tự):</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { num: 1, label: 'Chặng 1: Khám phá' },
              { num: 2, label: 'Chặng 2: Thử thách' },
              { num: 3, label: 'Chặng 3: Check-in' },
              { num: 4, label: 'Chặng 4: Lưu dấu' },
            ].map((step) => (
              <div
                key={step.num}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  currentStage === step.num
                    ? 'bg-sky-600 text-white shadow-xs'
                    : currentStage > step.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Views with subtle container transition */}
      <div className="transition-all duration-300">
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
    </div>
  );
};
