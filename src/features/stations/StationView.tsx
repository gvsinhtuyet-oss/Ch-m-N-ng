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
import { ArrowLeft, Download, CheckCircle2, Compass, Award, Heart, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  station: Station;
  onBack: () => void;
}

export const StationView: React.FC<Props> = ({ station, onBack }) => {
  const { currentUser, currentStage, setCurrentStage } = useApp();
  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);

  const [completedStagePreview, setCompletedStagePreview] = useState<number | null>(null);
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
      {completedStagePreview !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-lg flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Bản đồ hành trình"
            className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl border border-white/70"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-cyan-700 to-emerald-700 px-5 py-6 sm:px-8 sm:py-7 text-white">
              <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-8 h-44 w-44 rounded-full bg-amber-300/15 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-sky-50">
                    <Compass className="h-3.5 w-3.5" />
                    Hành trình khám phá
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Bản đồ hành trình</h2>
                  <p className="mt-1 text-sm font-semibold text-sky-100">
                    Hoàn thành Chặng {completedStagePreview} • Chặng {completedStagePreview + 1} đang chờ em
                  </p>
                </div>
                <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 shadow-lg">
                  <Sparkles className="h-7 w-7 text-amber-200" />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <div className="relative">
                <div className="absolute left-6 right-6 top-7 hidden h-1 rounded-full bg-slate-100 sm:block" />
                <div
                  className="absolute left-6 top-7 hidden h-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 sm:block"
                  style={{ width: `calc((100% - 3rem) * ${Math.max(0, completedStagePreview - 1)} / 3)` }}
                />

                <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-4">
                  {stages.map(step => {
                    const Icon = step.icon;
                    const done = step.num <= completedStagePreview;
                    const next = step.num === completedStagePreview + 1;

                    return (
                      <div
                        key={step.num}
                        className={`relative flex items-center gap-3 rounded-2xl border p-3.5 transition-all sm:flex-col sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0 sm:text-center ${
                          done
                            ? 'border-emerald-200 bg-emerald-50'
                            : next
                            ? 'border-amber-300 bg-amber-50 shadow-sm ring-1 ring-amber-200'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div
                          className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 shadow-sm transition-all ${
                            done
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : next
                              ? 'border-amber-400 bg-gradient-to-br from-amber-300 to-orange-400 text-amber-950 shadow-amber-300/40'
                              : 'border-slate-200 bg-white text-slate-400'
                          }`}
                        >
                          {done ? <CheckCircle2 className="h-7 w-7" /> : <Icon className="h-6 w-6" />}
                          {next && (
                            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-4 ring-white animate-pulse" />
                          )}
                        </div>

                        <div className="min-w-0 sm:pt-1">
                          <p className={`text-[10px] font-black uppercase tracking-wider ${
                            done ? 'text-emerald-700' : next ? 'text-amber-700' : 'text-slate-400'
                          }`}>
                            {done ? 'Đã hoàn thành' : next ? 'Tiếp theo' : 'Chưa mở'}
                          </p>
                          <p className={`mt-0.5 text-xs font-extrabold leading-snug ${
                            done ? 'text-emerald-950' : next ? 'text-slate-950' : 'text-slate-500'
                          }`}>
                            {step.num}. {step.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 text-left">
                <p className="text-[11px] font-black uppercase tracking-wider text-sky-700">Điểm đến tiếp theo</p>
                <p className="mt-1 text-base font-black text-slate-950">
                  Chặng {completedStagePreview + 1}: {stages[completedStagePreview]?.name}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Em đã nhận vật phẩm của chặng vừa rồi. Tiếp tục hành trình để mở thêm dấu ấn mới.
                </p>
              </div>

              <button
                autoFocus
                type="button"
                onClick={() => {
                  audioService.playSfx('click');
                  setCurrentStage((completedStagePreview + 1) as 1 | 2 | 3 | 4);
                  setCompletedStagePreview(null);
                }}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-cyan-700/20 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 inline-flex items-center justify-center gap-2"
              >
                <span>TIẾP TỤC CHẶNG {completedStagePreview + 1}</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
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
        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          {offlinePkg ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Demo offline đã lưu cục bộ ({offlinePkg.sizeMb}MB)</span>
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
          <span className="text-[10px] text-slate-400 font-medium">
            Phiên bản demo – dữ liệu được lưu cục bộ trên thiết bị, chưa phải gói offline hoàn chỉnh.
          </span>
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
          station.id === 'g2-station-4' ? (
            <HoiAnStage1Exploration station={station} onCompleteStage={() => setCompletedStagePreview(1)} />
          ) : (
            <Stage1Exploration station={station} onCompleteStage={() => setCompletedStagePreview(1)} />
          )
        )}

        {currentStage === 2 && (
          <Stage2Challenge
            station={station}
            onCompleteStage={() => setCompletedStagePreview(2)}
          />
        )}

        {currentStage === 3 && (
          <Stage3CheckIn
            station={station}
            onCompleteStage={() => setCompletedStagePreview(3)}
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
