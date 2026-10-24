import React, { useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { progressService } from '../../services/ProgressService';
import { offlineService } from '../../services/OfflineService';
import { audioService } from '../../services/AudioService';
import { InteractiveGeoMap } from '../../components/station/InteractiveGeoMap';
import { Stage1Exploration } from '../../components/station/Stage1Exploration';
import { HoiAnStage1Exploration } from '../../components/station/HoiAnStage1Exploration';
import { Stage2Challenge } from '../../components/station/Stage2Challenge';
import { Stage3CheckIn } from '../../components/station/Stage3CheckIn';
import { Stage4Stamp } from '../../components/station/Stage4Stamp';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import { unlockedStage,visibleStage } from './stageAccess';
import { ArrowLeft, Download, CheckCircle2, Compass, Award, Heart, Sparkles } from 'lucide-react';

// Curated geographic places. Search links resolve the actual place in Google Maps;
// never fabricate a coordinate or place a map pin on an illustration.
const GEO_LESSON_POINTS: Record<string, {name:string;lat:number;lon:number;description:string;accuracy:'approximate'}[]> = {
  'g1-station-4': [{name:'Thành Điện Hải',lat:16.0758,lon:108.2227,description:'Di tích lịch sử tại trung tâm Đà Nẵng',accuracy:'approximate'}],
  'g2-station-4': [{name:'Phố cổ Hội An',lat:15.8801,lon:108.3380,description:'Khu phố cổ Hội An',accuracy:'approximate'}],
  'g2-station-1': [{name:'Làng chiếu Cẩm Nê',lat:15.984,lon:108.162,description:'Khu vực làng nghề Cẩm Nê',accuracy:'approximate'},{name:'Làng chiếu Bàn Thạch',lat:15.825,lon:108.280,description:'Khu vực làng nghề Bàn Thạch',accuracy:'approximate'}],
  'g3-station-1': [{name:'Bãi biển Mỹ Khê',lat:16.060,lon:108.247,description:'Bãi biển Mỹ Khê',accuracy:'approximate'},{name:'Bãi biển Bàn Than',lat:15.483,lon:108.667,description:'Khu vực Bàn Than – Tam Hải',accuracy:'approximate'}],
  'g3-station-4': [{name:'Làng nước mắm Nam Ô',lat:16.124,lon:108.126,description:'Khu vực làng nghề Nam Ô',accuracy:'approximate'}],
  'g3-station-5': [{name:'Bán đảo Sơn Trà',lat:16.115,lon:108.295,description:'Khu vực bán đảo Sơn Trà',accuracy:'approximate'}],
};

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
  const [otherMapOpen, setOtherMapOpen] = useState(false);
  const [otherMapSelected, setOtherMapSelected] = useState(0);
  const [geoMapSelected, setGeoMapSelected] = useState(0);
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

      {station.id !== 'g2-station-2' && currentStage === 1 && (
        <section className="overflow-hidden rounded-[1.6rem] border border-sky-200 bg-gradient-to-br from-sky-950 via-blue-900 to-teal-800 shadow-lg">
          <div className="flex flex-col gap-3 p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <span className="text-[11px] font-black tracking-wider text-amber-300">🗺️ BẢN ĐỒ KHÁM PHÁ • KHỐI {station.grade} • TRẠM {station.number}</span>
              <h3 className="mt-1 text-xl font-black">{station.titleVi}</h3>
              <p className="mt-1 text-xs text-sky-100">Khám phá các điểm chạm trong bài học, xem hình ảnh và nghe giới thiệu.</p>
            </div>
            <button type="button" aria-expanded={otherMapOpen} onClick={() => { audioService.playSfx('click'); setOtherMapOpen(v => !v); }} className="shrink-0 rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-200">{otherMapOpen ? 'Thu gọn bản đồ' : '📍 Khám phá trên bản đồ'}</button>
          </div>
          {otherMapOpen && (
            <div className="space-y-4 bg-white p-4 sm:p-5">
              {GEO_LESSON_POINTS[station.id] && (
                <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50 p-3">
                  <h4 className="text-base font-black text-slate-900">📍 Địa danh trên bản đồ địa lý</h4>
                  <p className="text-xs text-slate-600">Chạm vào địa danh để chuyển bản đồ; dùng + / − để thay đổi mức phóng to. Vị trí hiện là tọa độ tham khảo và cần đối chiếu trước khi sử dụng dẫn đường.</p>
                  <InteractiveGeoMap points={GEO_LESSON_POINTS[station.id]} selected={geoMapSelected} onSelect={setGeoMapSelected} />
                </div>
              )}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#e9f3ed]">
                <div className="absolute left-3 top-3 z-10 rounded-xl bg-white/95 px-3 py-2 text-xs font-black text-slate-800 shadow-md">🧭 Bản đồ chủ đề • Minh họa, không phải bản đồ định vị</div>
                <div className="relative min-h-[260px] overflow-hidden bg-gradient-to-br from-[#c7e9f3] via-[#d4e9d5] to-[#f4edd6] sm:min-h-[330px]">
                  <div className="absolute -left-12 top-10 h-64 w-64 rotate-[-22deg] rounded-[40%] border-[16px] border-white/75 bg-[#b8d6a4] shadow-inner" />
                  <div className="absolute -right-16 -top-20 h-64 w-80 rotate-12 rounded-[40%] border-[14px] border-white/70 bg-[#aad9eb]" />
                  <div className="absolute bottom-6 left-1/3 h-20 w-[70%] rotate-[-12deg] rounded-full border-[10px] border-white/80 bg-[#e8e1c8]" />
                  <div className="relative z-10 flex min-h-[260px] flex-wrap items-center justify-center gap-3 px-5 pb-8 pt-20 sm:min-h-[330px]">
                    {station.hotspots.map((point,index) => (
                      <button key={point.id} type="button" aria-pressed={otherMapSelected === index} onClick={() => { audioService.playSfx('click'); setOtherMapSelected(index); }} className={`max-w-[180px] rounded-2xl border-2 px-3 py-3 text-center text-xs font-black shadow-lg transition hover:-translate-y-1 ${otherMapSelected === index ? 'border-amber-400 bg-white text-sky-900 ring-4 ring-amber-300/40' : 'border-white bg-white/90 text-slate-700'}`}>
                        <span className="mb-1 block text-2xl">{otherMapSelected === index ? '📍' : '🧭'}</span>
                        <span className="line-clamp-2">{point.titleVi.replace(/^\d+\.\s*/, '')}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-500">Các thẻ là điểm học tập, không thể hiện tọa độ địa lý.</div>
              </div>
              {station.hotspots[otherMapSelected] && (
                <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:grid-cols-[180px_1fr]">
                  <img src={station.hotspots[otherMapSelected].image} alt={station.hotspots[otherMapSelected].titleVi} loading="lazy" className="h-36 w-full rounded-xl bg-white object-cover" onError={e => { e.currentTarget.src = '/adventure-background.svg'; }} />
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-slate-900">{station.hotspots[otherMapSelected].titleVi}</h4>
                    <p className="text-sm leading-relaxed text-slate-700">{station.hotspots[otherMapSelected].keyFactVi}</p>
                    <button type="button" onClick={() => audioService.speakNarration(station.hotspots[otherMapSelected].narrationVi, 'vi-VN')} className="rounded-xl bg-sky-700 px-4 py-2 text-xs font-black text-white hover:bg-sky-800">🔊 Nghe giới thiệu</button>
                  </div>
                </div>
              )}
              <p className="text-[11px] text-slate-500">Sơ đồ học tập dùng dữ liệu điểm chạm của bài, không gắn vị trí địa lý chưa xác minh. Hoạt động tự do, không ảnh hưởng tiến trình và phần thưởng.</p>
            </div>
          )}
        </section>
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
              <InteractiveGeoMap points={[{name:'Cù Lao Chàm',lat:15.950,lon:108.510,accuracy:'approximate'},{name:'Bán đảo Sơn Trà',lat:16.115,lon:108.295,accuracy:'approximate'}]} selected={naturePlace === 'cham' ? 0 : 1} onSelect={index => setNaturePlace(index === 0 ? 'cham' : 'sontra')} />
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#e5f2f6] shadow-inner">
                <div className="absolute left-3 top-3 z-10 rounded-xl border border-white bg-white/95 px-3 py-2 text-xs font-black text-slate-800 shadow-lg">🧭 Bản đồ khám phá Đà Nẵng</div>
                <svg viewBox="0 0 900 470" role="img" aria-label="Bản đồ minh họa phong cách địa lý về đất liền Đà Nẵng, bán đảo Sơn Trà và Cù Lao Chàm, không theo tỉ lệ" className="block h-auto w-full">
                  <defs>
                    <linearGradient id="g2Sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c7eaf4"/><stop offset="100%" stopColor="#91d0e8"/></linearGradient>
                    <pattern id="g2Blocks" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M0 18H36M18 0V36" stroke="#fff" strokeWidth="2" opacity=".48"/></pattern>
                    <filter id="g2Shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity=".22"/></filter>
                  </defs>
                  <rect width="900" height="470" fill="url(#g2Sea)"/>
                  <path d="M0 0H338Q345 53 330 94Q320 137 354 180Q377 216 348 263Q322 315 344 356Q361 404 397 470H0Z" fill="#f2f0e6" stroke="#ffffff" strokeWidth="8"/>
                  <path d="M0 0H220Q253 75 198 122Q150 165 180 220Q224 260 171 319Q130 378 192 470H0Z" fill="#c7e6b8" opacity=".9"/>
                  <path d="M338 97Q378 65 422 79Q460 98 446 137Q423 160 353 150Z" fill="#b8dba8" stroke="#ffffff" strokeWidth="7"/>
                  <path d="M338 97Q378 65 422 79Q460 98 446 137Q423 160 353 150Z" fill="url(#g2Blocks)" opacity=".4"/>
                  <path d="M0 90Q100 117 177 87T328 115M0 243Q102 212 209 238T351 228M0 372Q145 355 215 382T364 391" stroke="#fff" strokeWidth="13" fill="none" opacity=".9"/>
                  <path d="M80 0Q105 128 72 250T114 470M235 0Q215 115 252 224T272 470" stroke="#fff" strokeWidth="8" fill="none" opacity=".9"/>
                  <path d="M0 90Q100 117 177 87T328 115M0 243Q102 212 209 238T351 228M0 372Q145 355 215 382T364 391" stroke="#e6d8b5" strokeWidth="2" fill="none"/>
                  <path d="M235 0Q215 115 252 224T272 470" stroke="#e6d8b5" strokeWidth="2" fill="none"/>
                  <path d="M602 301Q638 276 680 291Q713 307 710 341Q692 374 647 369Q610 360 602 331Z" fill="#c4dfa9" stroke="#fff" strokeWidth="7"/>
                  <path d="M745 351Q764 343 776 355Q777 366 757 369Z M561 357Q572 345 582 357Q576 370 562 367Z M709 395Q721 388 727 397Q721 407 710 403Z" fill="#c4dfa9" stroke="#fff" strokeWidth="3"/>
                  <path d="M625 322Q649 300 682 324M631 346Q664 337 687 352" stroke="#8dbb81" strokeWidth="5" fill="none" opacity=".65"/>
                  <text x="165" y="175" fontSize="24" fontWeight="800" fill="#52675c" textAnchor="middle">ĐÀ NẴNG</text>
                  <text x="180" y="206" fontSize="14" fill="#6e8277" textAnchor="middle">Đất liền</text>
                  <text x="715" y="145" fontSize="27" fontWeight="800" fill="#70a9c3" opacity=".85" textAnchor="middle">BIỂN ĐÔNG</text>
                  <text x="290" y="423" fontSize="15" fontWeight="700" fill="#758577" textAnchor="middle">Hướng về Hội An ↓</text>
                  <g opacity={naturePlace === 'sontra' ? 1 : .72} filter="url(#g2Shadow)">
                    <path d="M399 92C399 69 363 69 363 92C363 109 381 128 381 128S399 109 399 92Z" fill={naturePlace === 'sontra' ? '#ea4335' : '#256b66'} stroke="#fff" strokeWidth="3"/>
                    <circle cx="381" cy="91" r="6" fill="white"/>
                  </g>
                  <rect x="415" y="78" width="160" height="37" rx="12" fill="white" stroke="#e2e8f0" filter="url(#g2Shadow)"/>
                  <text x="495" y="102" fontSize="18" fontWeight="800" fill="#233c4c" textAnchor="middle">🌳 Sơn Trà</text>
                  <g opacity={naturePlace === 'cham' ? 1 : .72} filter="url(#g2Shadow)">
                    <path d="M678 319C678 293 638 293 638 319C638 337 658 360 658 360S678 337 678 319Z" fill={naturePlace === 'cham' ? '#ea4335' : '#256b66'} stroke="#fff" strokeWidth="3"/>
                    <circle cx="658" cy="317" r="7" fill="white"/>
                  </g>
                  <rect x="565" y="380" width="190" height="39" rx="12" fill="white" stroke="#e2e8f0" filter="url(#g2Shadow)"/>
                  <text x="660" y="405" fontSize="18" fontWeight="800" fill="#233c4c" textAnchor="middle">🏝️ Cù Lao Chàm</text>
                </svg>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-700">📍 {naturePlace === 'cham' ? 'Cù Lao Chàm: quần đảo ngoài khơi Hội An' : 'Sơn Trà: bán đảo nối với đất liền Đà Nẵng'}</p>
                  <a href={naturePlace === 'cham' ? 'https://www.google.com/maps/search/?api=1&query=Cu+Lao+Cham+Da+Nang' : 'https://www.google.com/maps/search/?api=1&query=Son+Tra+Peninsula+Da+Nang'} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-blue-700">📍 Xem vị trí trên Google Maps ↗</a>
                </div>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-slate-700">
                <h4 className="font-black text-slate-900">{naturePlace === 'cham' ? '🏝️ Cù Lao Chàm – Hòn Lao là đảo chính' : '🌳 Sơn Trà – rừng gặp biển'}</h4>
                <p className="mt-2">{naturePlace === 'cham' ? 'Cù Lao Chàm có 8 hòn đảo nhỏ, Hòn Lao là đảo chính. Khu dự trữ sinh quyển Cù Lao Chàm – Hội An được UNESCO công nhận năm 2009.' : 'Bán đảo Sơn Trà có rừng và biển, là nơi sinh sống của nhiều loài sinh vật, trong đó có voọc chà vá chân nâu.'}</p>
                <button type="button" onClick={() => audioService.speakNarration(naturePlace === 'cham' ? 'Cù Lao Chàm có tám hòn đảo nhỏ. Hòn Lao là đảo chính. Chúng ta hãy bảo vệ biển đảo quê hương.' : 'Bán đảo Sơn Trà có rừng và biển. Đây là nơi sinh sống của voọc chà vá chân nâu. Chúng ta hãy bảo vệ thiên nhiên.', 'vi-VN')} className="mt-3 rounded-xl bg-sky-700 px-4 py-2 text-xs font-black text-white">🔊 Nghe giới thiệu</button>
              </div>
              <p className="text-[11px] text-slate-500">Bản đồ minh họa phong cách địa lý, không theo tỉ lệ. Liên kết Google Maps cần Internet. Không ảnh hưởng tiến trình học.</p>
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
