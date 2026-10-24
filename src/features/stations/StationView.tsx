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
import { DEMO_STATION_IDS } from '../../data/demoStations';
import { unlockedStage,visibleStage } from './stageAccess';
import { ArrowLeft, Download, CheckCircle2, Compass, Award, Heart, Sparkles } from 'lucide-react';

interface Props {
  station: Station;
  onBack: () => void;
}

export const StationView: React.FC<Props> = ({ station, onBack }) => {
  const { currentUser, currentStage: requestedStage, setCurrentStage } = useApp();
  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);
  const isPolishedJourney = DEMO_STATION_IDS.has(station.id);

  const [natureMapOpen, setNatureMapOpen] = useState(false);
  const [naturePlace, setNaturePlace] = useState<'cham' | 'sontra'>('cham');
  const [downloading, setDownloading] = useState(false);
  const [offlinePkg, setOfflinePkg] = useState(offlineService.getPackage(station.id));

  // If completed once or stamp received, student can freely navigate stages
  const [sessionUnlockedStage,setSessionUnlockedStage]=useState(()=>unlockedStage(progress));
  const highestAccessibleStage=Math.max(sessionUnlockedStage,unlockedStage(progress));
  const currentStage=visibleStage(requestedStage,progress,sessionUnlockedStage);
  const isUnlockedAllStages=progress.stationCompleted||progress.stampReceived;
  const finishStage=(stage:1|2|3)=>{
    if(stage>highestAccessibleStage)return;
    const next=(stage+1) as 2|3|4;
    setSessionUnlockedStage(highest=>Math.max(highest,next));
    setCurrentStage(next);
  };

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
    { num: 2, title: 'Chặng 2', name: 'Chinh phục thử thách', icon: Award },
    { num: 3, title: 'Chặng 3', name: 'Check-in cảm xúc', icon: Heart },
    { num: 4, title: 'Chặng 4', name: 'Hộ chiếu hành trình', icon: Sparkles },
  ];

  return (
    <div className={isPolishedJourney ? "mx-auto max-w-[1600px] px-2 py-2 sm:px-4 space-y-3" : "max-w-7xl mx-auto px-3 sm:px-5 py-4 space-y-4"}>
            {/* Top Station Header bar */}
      <div className={isPolishedJourney ? "flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/94 backdrop-blur-xl px-4 py-3 rounded-[1.5rem] border border-orange-200 shadow-lg shadow-orange-950/5" : "flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/96 backdrop-blur-md px-4 py-3.5 sm:px-5 sm:py-4 rounded-[1.6rem] border border-white/80 shadow-[0_10px_32px_rgba(15,23,42,0.08)]"}>
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
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black text-white shadow-2xs ${isPolishedJourney ? "bg-gradient-to-r from-orange-500 to-amber-400" : "bg-gradient-to-r from-sky-600 to-sky-700"}`}>
                Trạm {station.number}
              </span>
              <span className="text-xs text-slate-400 font-bold">Khối {station.grade}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-amber-700 font-semibold">{station.themeNameVi}</span>
            </div>
            <h1 className={isPolishedJourney ? "text-xl sm:text-2xl lg:text-[1.7rem] font-black text-slate-950 leading-tight mt-0.5" : "text-[22px] sm:text-[24px] font-black text-slate-950 leading-tight mt-0.5 tracking-tight"}>
              {station.titleVi}
            </h1>
          </div>
        </div>

        {/* Offline Download button */}
        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          {offlinePkg ? (
            <div className={isPolishedJourney ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200" : "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs"}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isPolishedJourney ? 'OFFLINE ĐÃ SẴN SÀNG' : `Demo offline đã lưu cục bộ (${offlinePkg.sizeMb}MB)`}</span>
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
          {!isPolishedJourney && <span className="text-[10px] text-slate-400 font-medium">
            Phiên bản demo – dữ liệu được lưu cục bộ trên thiết bị, chưa phải gói offline hoàn chỉnh.
          </span>}
        </div>
      </div>

      {/* Verification notice if draft */}
      {!station.isFullyVerified && (
        <div className={isPolishedJourney ? "px-3 py-2 rounded-xl bg-amber-50/95 border border-amber-200 text-amber-950 text-[10px] font-semibold flex items-center gap-2" : "px-3 py-2 rounded-xl bg-amber-50/95 border border-amber-200 text-amber-950 text-[10px] sm:text-[11px] font-medium flex items-center gap-2"}>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
          <span>
            <strong>Lưu ý:</strong> {station.grade>=3?'Học liệu tham khảo theo đề cương dự thảo và nguồn chuyên môn; chờ giáo viên duyệt, chưa gắn kế hoạch tích hợp mới.':'Nội dung đang được hoàn thiện từ nguồn đã kiểm chứng của Sở Giáo dục và Đào tạo TP Đà Nẵng.'}
          </span>
        </div>
      )}

      {/* 4 Stages Navigation */}
      {isPolishedJourney ? (
        <div className="rounded-[1.6rem] border border-orange-200 bg-white/92 p-2.5 shadow-lg shadow-orange-950/5 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {stages.map((st) => {
              const Icon = st.icon;
              const active = currentStage === st.num;
              const done = st.num < highestAccessibleStage || isUnlockedAllStages;
              const clickable = st.num <= highestAccessibleStage;
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
              { num: 2, label: 'Chặng 2: Chinh phục thử thách' },
              { num: 3, label: 'Chặng 3: Check-in cảm xúc' },
              { num: 4, label: 'Chặng 4: Hộ chiếu hành trình' },
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

      {station.id === 'g2-station-2' && currentStage === 1 && (
        <section className="overflow-hidden rounded-[1.6rem] border border-teal-200 bg-gradient-to-br from-sky-950 via-teal-900 to-emerald-800 shadow-lg">
          <div className="flex flex-col gap-3 p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <span className="text-[11px] font-black tracking-wider text-amber-300">🗺️ BẢN ĐỒ KHÁM PHÁ • TRẠM 4</span>
              <h3 className="mt-1 text-xl font-black">Cù Lao Chàm ở đâu? Sơn Trà ở đâu?</h3>
              <p className="mt-1 text-xs text-sky-100">Chạm để khám phá vị trí biển đảo và bán đảo trên bản đồ thật.</p>
            </div>
            <button type="button" aria-expanded={natureMapOpen} onClick={() => { audioService.playSfx('click'); setNatureMapOpen(v => !v); }} className="shrink-0 rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-200">{natureMapOpen ? 'Thu gọn bản đồ' : '📍 Khám phá trên bản đồ'}</button>
          </div>
          {natureMapOpen && (
            <div className="space-y-3 bg-white p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" aria-pressed={naturePlace === 'cham'} onClick={() => { audioService.playSfx('click'); setNaturePlace('cham'); }} className={`rounded-xl p-3 text-xs font-black sm:text-sm ${naturePlace === 'cham' ? 'bg-sky-700 text-white' : 'bg-sky-50 text-sky-800'}`}>🏝️ Cù Lao Chàm</button>
                <button type="button" aria-pressed={naturePlace === 'sontra'} onClick={() => { audioService.playSfx('click'); setNaturePlace('sontra'); }} className={`rounded-xl p-3 text-xs font-black sm:text-sm ${naturePlace === 'sontra' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800'}`}>🌳 Sơn Trà</button>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-100 via-cyan-100 to-sky-300 p-3 sm:p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-sky-900">🧭 Sơ đồ vị trí tương đối</span>
                  <span className="text-[11px] font-semibold text-sky-900">Minh họa, không theo tỉ lệ</span>
                </div>
                <svg viewBox="0 0 700 380" role="img" aria-label="Sơ đồ minh họa đất liền Đà Nẵng, bán đảo Sơn Trà và quần đảo Cù Lao Chàm" className="h-auto w-full rounded-xl bg-[#b9e8f1]">
                  <defs>
                    <linearGradient id="natureSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c5f2f3"/><stop offset="100%" stopColor="#64bfd8"/></linearGradient>
                    <linearGradient id="natureLand" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d9eab4"/><stop offset="100%" stopColor="#79b98d"/></linearGradient>
                  </defs>
                  <rect width="700" height="380" fill="url(#natureSea)"/>
                  <path d="M0 0H265Q235 40 250 86T230 158Q255 202 230 246T265 380H0Z" fill="url(#natureLand)" stroke="#e9f7d5" strokeWidth="7"/>
                  <path d="M250 87Q295 51 344 68Q374 95 355 125Q313 146 255 122Z" fill="#6cad79" stroke="#f3ffe7" strokeWidth="5"/>
                  <path d="M453 250Q490 215 546 238Q575 273 546 310Q502 337 461 299Z" fill="#70b783" stroke="#f3ffe7" strokeWidth="5"/>
                  <ellipse cx="600" cy="310" rx="13" ry="7" fill="#6aad80"/><ellipse cx="425" cy="293" rx="11" ry="6" fill="#6aad80"/>
                  <path d="M350 160Q402 205 458 240" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="8 8" opacity=".7"/>
                  <text x="72" y="190" fill="#215d43" fontSize="23" fontWeight="bold" textAnchor="middle">ĐẤT LIỀN</text>
                  <text x="72" y="219" fill="#215d43" fontSize="18" fontWeight="bold" textAnchor="middle">ĐÀ NẴNG</text>
                  <text x="530" y="100" fill="#18769a" fontSize="23" fontWeight="bold" textAnchor="middle">BIỂN ĐÔNG</text>
                  <circle cx="308" cy="94" r={naturePlace === 'sontra' ? 19 : 13} fill={naturePlace === 'sontra' ? '#f59e0b' : '#0f766e'} stroke="white" strokeWidth="5"/>
                  <text x="380" y="53" fill="#064e3b" fontSize="22" fontWeight="bold" textAnchor="middle">Sơn Trà</text>
                  <path d="M365 61L323 87" stroke="#064e3b" strokeWidth="3"/>
                  <circle cx="502" cy="271" r={naturePlace === 'cham' ? 19 : 13} fill={naturePlace === 'cham' ? '#f59e0b' : '#0f766e'} stroke="white" strokeWidth="5"/>
                  <text x="555" y="353" fill="#064e3b" fontSize="22" fontWeight="bold" textAnchor="middle">Cù Lao Chàm</text>
                  <path d="M532 330L510 292" stroke="#064e3b" strokeWidth="3"/>
                </svg>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-sky-950">📍 {naturePlace === 'cham' ? 'Cù Lao Chàm: quần đảo ngoài khơi Hội An' : 'Sơn Trà: bán đảo nối với đất liền Đà Nẵng'}</p>
                  <a href={naturePlace === 'cham' ? 'https://www.openstreetmap.org/?mlat=15.950&mlon=108.510#map=12/15.950/108.510' : 'https://www.openstreetmap.org/?mlat=16.115&mlon=108.295#map=12/16.115/108.295'} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-sky-700 px-4 py-2 text-xs font-black text-white hover:bg-sky-800">🌐 Xem bản đồ địa lý thực ↗</a>
                </div>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-slate-700">
                <h4 className="font-black text-slate-900">{naturePlace === 'cham' ? '🏝️ Cù Lao Chàm – Hòn Lao là đảo chính' : '🌳 Sơn Trà – rừng gặp biển'}</h4>
                <p className="mt-2">{naturePlace === 'cham' ? 'Cù Lao Chàm có 8 hòn đảo nhỏ, Hòn Lao là đảo chính. Khu dự trữ sinh quyển Cù Lao Chàm – Hội An được UNESCO công nhận năm 2009.' : 'Bán đảo Sơn Trà có rừng và biển, là nơi sinh sống của nhiều loài sinh vật, trong đó có voọc chà vá chân nâu.'}</p>
                <button type="button" onClick={() => audioService.speakNarration(naturePlace === 'cham' ? 'Cù Lao Chàm có tám hòn đảo nhỏ. Hòn Lao là đảo chính. Chúng ta hãy bảo vệ biển đảo quê hương.' : 'Bán đảo Sơn Trà có rừng và biển. Đây là nơi sinh sống của voọc chà vá chân nâu. Chúng ta hãy bảo vệ thiên nhiên.', 'vi-VN')} className="mt-3 rounded-xl bg-sky-700 px-4 py-2 text-xs font-black text-white">🔊 Nghe giới thiệu</button>
              </div>
              <p className="text-[11px] text-slate-500">Sơ đồ minh họa hoạt động không cần tải bản đồ bên ngoài. Liên kết bản đồ địa lý thực cần Internet. Không ảnh hưởng tiến trình học.</p>
            </div>
          )}
        </section>
      )}

      {/* Stage Views with subtle container transition */}
      <div className="transition-all duration-300">
        {currentStage === 1 && (
          isPolishedJourney ? (
            <HoiAnStage1Exploration station={station} onCompleteStage={() => finishStage(1)} />
          ) : (
            <Stage1Exploration station={station} onCompleteStage={() => finishStage(1)} />
          )
        )}

        {currentStage === 2 && (
          <Stage2Challenge
            station={station}
            onCompleteStage={() => finishStage(2)}
          />
        )}

        {currentStage === 3 && (
          <Stage3CheckIn
            station={station}
            onCompleteStage={() => finishStage(3)}
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
