import React, { useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { progressService } from '../../services/ProgressService';
import { offlineService } from '../../services/OfflineService';
import { audioService } from '../../services/AudioService';
import { Stage1Exploration } from '../../components/station/Stage1Exploration';
import { HoiAnStage1Exploration } from '../../components/station/HoiAnStage1Exploration';
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
  const isGrade2Journey = station.grade === 2;

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
    { num: 1, title: 'Chặng 1', name: 'Đánh thức điểm đến', icon: Compass },
    { num: 2, title: 'Chặng 2', name: 'Giải mã điểm đến', icon: Award },
    { num: 3, title: 'Chặng 3', name: 'Chinh phục thử thách', icon: Heart },
    { num: 4, title: 'Chặng 4', name: 'Lưu dấu hành trình', icon: Sparkles },
  ];

  return (
    <div className={isGrade2Journey ? "mx-auto max-w-[1600px] px-2 py-2 sm:px-4 space-y-3" : "max-w-7xl mx-auto px-3 sm:px-5 py-4 space-y-4"}>
            {/* Top Station Header bar */}
      <div className={isGrade2Journey ? "flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/94 backdrop-blur-xl px-4 py-3 rounded-[1.5rem] border border-orange-200 shadow-lg shadow-orange-950/5" : "flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/96 backdrop-blur-md px-4 py-3.5 sm:px-5 sm:py-4 rounded-[1.6rem] border border-white/80 shadow-[0_10px_32px_rgba(15,23,42,0.08)]"}>
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              audioService.playSfx('click');
              onBack();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition shadow-2xs shrink-0"
            title="Quay lại danh sách trạm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black text-white shadow-2xs ${isGrade2Journey ? "bg-gradient-to-r from-orange-500 to-amber-400" : "bg-gradient-to-r from-sky-600 to-sky-700"}`}>
                Trạm {station.number}
              </span>
              <span className="text-xs text-slate-400 font-bold">Khối {station.grade}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-amber-700 font-semibold">{station.themeNameVi}</span>
            </div>
            <h1 className={isGrade2Journey ? "text-xl sm:text-2xl lg:text-[1.7rem] font-black text-slate-950 leading-tight mt-0.5" : "text-[22px] sm:text-[24px] font-black text-slate-950 leading-tight mt-0.5 tracking-tight"}>
              {station.titleVi}
            </h1>
          </div>
        </div>

        {/* Offline Download button */}
        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          {offlinePkg ? (
            <div className={isGrade2Journey ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200" : "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs"}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isGrade2Journey ? 'OFFLINE ĐÃ SẴN SÀNG' : `Demo offline đã lưu cục bộ (${offlinePkg.sizeMb}MB)`}</span>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-black border border-sky-200 transition shadow-2xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>{downloading ? 'Đang lưu demo...' : 'DEMO TẢI OFFLINE'}</span>
            </button>
          )}
          {!isGrade2Journey && <span className="text-[10px] text-slate-400 font-medium">
            Phiên bản demo – dữ liệu được lưu cục bộ trên thiết bị, chưa phải gói offline hoàn chỉnh.
          </span>}
        </div>
      </div>

      {/* Verification notice if draft */}
      {!station.isFullyVerified && (
        <div className={isGrade2Journey ? "px-3 py-2 rounded-xl bg-amber-50/95 border border-amber-200 text-amber-950 text-[10px] font-semibold flex items-center gap-2" : "px-3 py-2 rounded-xl bg-amber-50/95 border border-amber-200 text-amber-950 text-[10px] sm:text-[11px] font-medium flex items-center gap-2"}>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
          <span>
            <strong>Lưu ý:</strong> Nội dung đang được hoàn thiện từ nguồn đã kiểm chứng của Sở Giáo dục và Đào tạo TP Đà Nẵng.
          </span>
        </div>
      )}

      {/* 4 Stages Navigation */}
      {isGrade2Journey ? (
        <div className="rounded-[1.6rem] border border-orange-200 bg-white/92 p-2.5 shadow-lg shadow-orange-950/5 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {stages.map((st) => {
              const Icon = st.icon;
              const active = currentStage === st.num;
              const done = currentStage > st.num || isUnlockedAllStages;
              const clickable = isUnlockedAllStages || st.num <= currentStage;
              return (
                <button
                  key={st.num}
                  type="button"
                  disabled={!clickable}
                  onClick={() => {
                    if (!clickable) return;
                    audioService.playSfx('click');
                    setCurrentStage(st.num as 1 | 2 | 3 | 4);
                  }}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/25'
                      : done
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-400'
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                      active
                        ? 'border-white/70 bg-white/15'
                        : done
                          ? 'border-emerald-300 bg-white text-emerald-600'
                          : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    {done && !active ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-black uppercase tracking-wide opacity-80">Chặng {st.num}</span>
                    <span className="block truncate text-xs font-black sm:text-sm">{st.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : isUnlockedAllStages ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
          {stages.map((st) => {
            const Icon = st.icon;
            const isActive = currentStage === st.num;
            return (
              <button
                key={st.num}
                onClick={() => {
                  audioService.playSfx('click');
                  setCurrentStage(st.num as 1 | 2 | 3 | 4);
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
        <div className="bg-white/94 backdrop-blur-md px-3 py-2.5 rounded-2xl border border-white/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs font-bold text-slate-500">
          <span className="text-slate-700 whitespace-nowrap">Hành trình lần đầu:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { num: 1, label: 'Chặng 1: Đánh thức điểm đến' },
              { num: 2, label: 'Chặng 2: Giải mã điểm đến' },
              { num: 3, label: 'Chặng 3: Chinh phục thử thách' },
              { num: 4, label: 'Chặng 4: Lưu dấu hành trình' },
            ].map((step) => (
              <div
                key={step.num}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-[12px] font-bold whitespace-nowrap transition ${
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
          station.grade === 2 ? (
            <HoiAnStage1Exploration station={station} onCompleteStage={() => setCurrentStage(2)} />
          ) : (
            <Stage1Exploration station={station} onCompleteStage={() => setCurrentStage(2)} />
          )
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
