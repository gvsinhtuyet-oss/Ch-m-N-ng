import {stage1Options} from '../../features/stations/stage1Options';
import {RealPhotoGallery} from '../RealPhotoGallery';
import {allHotspotsAnswered} from '../../features/stations/stageAccess';
import { contentService } from '../../services/ContentService';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Station, ExplorationHotspot } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService, NarrationState } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import { backgroundMusic } from '../../services/BackgroundMusic';
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
import { RewardClaimModal } from '../common/RewardClaimModal';
import { DEFAULT_APP_BACKGROUND_DATA_URL } from '../../assets/defaultAppBackground';
import { gradeOneNarration } from './gradeOneNarration';


// Shuffle a copy so option IDs and correctness stay unchanged.
function shuffleOptions<T>(options: readonly T[]): T[] {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface Props {
  station: Station;
  onCompleteStage: () => void;
}

export const Stage1Exploration: React.FC<Props> = ({ station, onCompleteStage }) => {
  const { currentUser, role, isOnline, language, setAssistantHotspot } = useApp();
  const isReadOnly = role !== 'student';
  const [answeredIds,setAnsweredIds]=useState<string[]>(()=>progressService.getStationProgress(currentUser?.id||'guest',station.id).exploredHotspotIds);
  const [currentHotspotIdx, setCurrentHotspotIdx] = useState(0);
  const [narrationState, setNarrationState] = useState<NarrationState>('idle');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [wrongLocked, setWrongLocked] = useState(false);
  const wrongTimerRef = useRef<number | null>(null);
  const [showVrModal, setShowVrModal] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [vrTimeoutReached, setVrTimeoutReached] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showGrade2NatureMap, setShowGrade2NatureMap] = useState(false);
  const [natureMapPoint, setNatureMapPoint] = useState<'cham' | 'sontra'>('cham');

  const hotspot: ExplorationHotspot = station.hotspots[currentHotspotIdx] || station.hotspots[0];

  const displayedOptions = useMemo(
    () => shuffleOptions(stage1Options(hotspot.interaction)),
    [hotspot],
  );

  // Share the currently visible hotspot with the local assistant.
  useEffect(() => {
    setAssistantHotspot(hotspot);
    return () => setAssistantHotspot(null);
  }, [station.id, hotspot.id, setAssistantHotspot]);

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
    setWrongLocked(false);
    if (wrongTimerRef.current !== null) window.clearTimeout(wrongTimerRef.current);
    audioService.stopNarration();
  }, [currentHotspotIdx]);

  useEffect(() => () => {
    if (wrongTimerRef.current !== null) window.clearTimeout(wrongTimerRef.current);
  }, []);

  // VR timeout handler
  useEffect(() => {
    let timer: any;
    if (showVrModal) {
      setIframeLoaded(false);
      setIframeError(false);
      setVrTimeoutReached(false);
      timer = setTimeout(() => {
        setVrTimeoutReached(true);
      }, 7000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showVrModal]);

  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);
  const freeReview=progress.stage1Completed||progress.stationCompleted||progress.stampReceived;
  const isExplored = progress.exploredHotspotIds.includes(hotspot.id);

  // Audio Playback Controls
  const handlePlayAudio = () => {
    const recorded = gradeOneNarration(station, hotspot, language);
    if (recorded) { audioService.playRecordedNarration(recorded); return; }
    const textToSpeak = language === 'en' && hotspot.narrationEn ? hotspot.narrationEn : hotspot.narrationVi;
    audioService.speakNarration(textToSpeak, language === 'en' && hotspot.narrationEn ? 'en-US' : 'vi-VN');
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
    if (answerSubmitted || wrongLocked) return;
    setAnswerSubmitted(false);
    setIsCorrect(false);
    audioService.playSfx('click');
    setSelectedOptionId(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !hotspot.interaction || wrongLocked || answerSubmitted) return;
    const chosen = hotspot.interaction.options.find(o => o.id === selectedOptionId);
    const correct = !!chosen?.isCorrect;
    setIsCorrect(correct);
    setAnswerSubmitted(true);
    if (!correct) {
      setWrongLocked(true);
      if (wrongTimerRef.current !== null) window.clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = window.setTimeout(() => {
        setWrongLocked(false);
        setAnswerSubmitted(false);
        setSelectedOptionId(null);
        wrongTimerRef.current = null;
      }, 2000);
    }

    if (correct) {
      setAnsweredIds(ids=>ids.includes(hotspot.id)?ids:[...ids,hotspot.id]);
      audioService.playSfx('correct');
      if (!isReadOnly) {
        progressService.completeHotspot(studentId, station.id, hotspot.id);
      }
    } else {
      audioService.playSfx('wrong');
    }
  };

  const changeHotspot = (newIndex: number) => {
    if(!freeReview&&newIndex>currentHotspotIdx&&!station.hotspots.slice(0,newIndex).every(h=>answeredIds.includes(h.id)))return;
    if (newIndex >= 0 && newIndex < station.hotspots.length) {
      audioService.playSfx('transition');
      setCurrentHotspotIdx(newIndex);
    }
  };

  const handleNextHotspot = () => {
    if(!freeReview&&(!answerSubmitted||!isCorrect||!answeredIds.includes(hotspot.id)))return;
    audioService.playSfx('click');
    if (!isReadOnly) {
      progressService.completeHotspot(studentId, station.id, hotspot.id);
    }

    if (currentHotspotIdx < station.hotspots.length - 1) {
      changeHotspot(currentHotspotIdx + 1);
    } else {
      if(!freeReview&&!allHotspotsAnswered(station.hotspots,answeredIds))return;
      if (!isReadOnly) {
        progressService.completeStage1(studentId, station.id);
      }
      setShowRewardModal(true);
    }
  };

  // Đúng: tự chuyển điểm sau một nhịp phản hồi, không cần nút đi tiếp.
  useEffect(() => {
    if (!answerSubmitted || !isCorrect || freeReview) return;
    const timer = window.setTimeout(() => handleNextHotspot(), 950);
    return () => window.clearTimeout(timer);
  }, [answerSubmitted, isCorrect, currentHotspotIdx, freeReview]);

  const totalHotspots = station.hotspots.length;
  const isLastHotspot = currentHotspotIdx === totalHotspots - 1;
  const isPlaying = narrationState === 'playing';
  const isPaused = narrationState === 'paused';

  return (
    <div className="stage-one-map-surface space-y-6">
      {contentService.resources(station.id).length > 0 && (
        <section className="bg-white rounded-3xl p-5 border border-sky-200 space-y-3">
          <h3 className="font-black text-sky-950">Học liệu của trạm</h3>
          {contentService.resources(station.id).map(resource => (
            <div key={resource.id} className="rounded-xl bg-sky-50 p-3 space-y-2">
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sky-800 font-bold underline">{resource.title}</a>
              {resource.kind === 'image' && <img src={resource.url} alt={resource.title} loading="lazy" decoding="async" className="max-h-80 w-full object-contain rounded-xl" />}
              {resource.kind === 'audio' && <audio
                controls
                preload="none"
                src={resource.url}
                className="w-full"
                onPlay={() => backgroundMusic.setForegroundSource(`media-${resource.id}`, true)}
                onPause={() => backgroundMusic.setForegroundSource(`media-${resource.id}`, false)}
                onEnded={() => backgroundMusic.setForegroundSource(`media-${resource.id}`, false)}
              />}
              {resource.kind === 'video' && (resource.url.startsWith('data:video/') || /\.(mp4|webm|ogg)(\?|$)/i.test(resource.url)) && <video
                controls
                preload="none"
                src={resource.url}
                className="max-h-96 w-full rounded-xl"
                onPlay={() => backgroundMusic.beginForegroundAudio()}
                onPause={() => backgroundMusic.endForegroundAudio()}
                onEnded={() => backgroundMusic.endForegroundAudio()}
              />}
              {resource.kind === 'document' && <p className="text-xs text-slate-600">Bấm tên học liệu để mở tài liệu.</p>}
            </div>
          ))}
        </section>
      )}
      {/* Optional geographic exploration for grade 2, station 4 only. No progress changes. */}
      {station.id === 'g2-station-2' && (
        <section className="overflow-hidden rounded-3xl border border-teal-200 bg-gradient-to-br from-sky-950 via-teal-900 to-emerald-800 text-white shadow-xl">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="space-y-2">
              <span className="inline-flex rounded-full border border-amber-200/40 bg-amber-300/15 px-3 py-1 text-[11px] font-black tracking-wide text-amber-200">🗺️ BẢN ĐỒ KHÁM PHÁ • TRẠM 4</span>
              <h3 className="text-xl font-black sm:text-2xl">Cù Lao Chàm ở đâu? Sơn Trà ở đâu?</h3>
              <p className="max-w-xl text-sm leading-relaxed text-sky-100">Quan sát hai địa danh trên bản đồ thật. Chạm vào từng địa điểm để tìm hiểu biển, đảo và rừng xanh quê hương.</p>
            </div>
            <button type="button" onClick={() => { audioService.playSfx('click'); setShowGrade2NatureMap(value => !value); }} aria-expanded={showGrade2NatureMap} className="shrink-0 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:bg-amber-200">
              {showGrade2NatureMap ? 'Thu gọn bản đồ' : '📍 Khám phá trên bản đồ'}
            </button>
          </div>
          {showGrade2NatureMap && (
            <div className="space-y-4 border-t border-white/20 bg-white/95 p-4 text-slate-900 sm:p-6">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { audioService.playSfx('click'); setNatureMapPoint('cham'); }} aria-pressed={natureMapPoint === 'cham'} className={`rounded-xl px-3 py-3 text-xs font-black transition sm:text-sm ${natureMapPoint === 'cham' ? 'bg-sky-700 text-white shadow-md' : 'bg-sky-50 text-sky-900 hover:bg-sky-100'}`}>🏝️ Cù Lao Chàm</button>
                <button type="button" onClick={() => { audioService.playSfx('click'); setNatureMapPoint('sontra'); }} aria-pressed={natureMapPoint === 'sontra'} className={`rounded-xl px-3 py-3 text-xs font-black transition sm:text-sm ${natureMapPoint === 'sontra' ? 'bg-emerald-700 text-white shadow-md' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>🌳 Bán đảo Sơn Trà</button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-sky-100 bg-sky-50">
                <iframe
                  key={natureMapPoint}
                  title={natureMapPoint === 'cham' ? 'Bản đồ Cù Lao Chàm' : 'Bản đồ bán đảo Sơn Trà'}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-[280px] w-full border-0 sm:h-[380px]"
                  src={natureMapPoint === 'cham'
                    ? 'https://www.openstreetmap.org/export/embed.html?bbox=108.440%2C15.900%2C108.580%2C16.020&layer=mapnik&marker=15.950%2C108.510'
                    : 'https://www.openstreetmap.org/export/embed.html?bbox=108.220%2C16.065%2C108.340%2C16.160&layer=mapnik&marker=16.115%2C108.295'}
                />
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="text-base font-black text-slate-900">{natureMapPoint === 'cham' ? '🏝️ Cù Lao Chàm – Hòn Lao là đảo chính' : '🌳 Bán đảo Sơn Trà – rừng gặp biển'}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{natureMapPoint === 'cham'
                  ? 'Cù Lao Chàm là một quần đảo gồm 8 hòn đảo nhỏ; Hòn Lao là đảo chính. Khu dự trữ sinh quyển Cù Lao Chàm – Hội An được UNESCO công nhận năm 2009.'
                  : 'Sơn Trà là bán đảo có rừng và biển, nơi sinh sống của nhiều loài động vật, thực vật; trong đó có voọc chà vá chân nâu cần được bảo vệ.'}</p>
                <button type="button" onClick={() => audioService.speakNarration(natureMapPoint === 'cham' ? 'Cù Lao Chàm gồm tám hòn đảo nhỏ. Hòn Lao là đảo chính. Hãy cùng bảo vệ biển đảo quê hương.' : 'Sơn Trà là bán đảo có rừng và biển. Đây là nơi sinh sống của voọc chà vá chân nâu. Chúng ta cần bảo vệ thiên nhiên.', 'vi-VN')} className="mt-3 rounded-xl bg-sky-700 px-4 py-2.5 text-xs font-black text-white hover:bg-sky-800">🔊 Nghe giới thiệu</button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>Bản đồ © OpenStreetMap contributors • Cần kết nối mạng</span>
                <a href={natureMapPoint === 'cham' ? 'https://www.openstreetmap.org/?mlat=15.950&mlon=108.510#map=12/15.950/108.510' : 'https://www.openstreetmap.org/?mlat=16.115&mlon=108.295#map=12/16.115/108.295'} target="_blank" rel="noopener noreferrer" className="font-bold text-sky-700 underline">Mở bản đồ lớn ↗</a>
              </div>
            </div>
          )}
        </section>
      )}
      {/* Station-level verified VR360 preview */}
      {station.vr360Experience?.verified && station.vr360Experience.url && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Mở trải nghiệm ${station.vr360Experience.titleVi}`}
          onClick={() => {
            audioService.playSfx('click');
            setShowVrModal(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              audioService.playSfx('click');
              setShowVrModal(true);
            }
          }}
          className="relative w-full min-h-[200px] sm:min-h-[270px] rounded-3xl overflow-hidden shadow-md group cursor-pointer border border-amber-300/60 focus:outline-none focus:ring-4 focus:ring-amber-400/80 transition-all transform active:scale-[0.99] select-none flex flex-col justify-end p-5 sm:p-7"
        >
          {/* Background Image with Zoom Effect on Hover */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              backgroundImage: `url(${station.vr360PreviewImage || station.coverImage || DEFAULT_APP_BACKGROUND_DATA_URL})`,
            }}
          />

          {/* Dark Gradient Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent pointer-events-none" />

          {/* Badge at Top Left */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 font-black text-xs uppercase tracking-wider border border-amber-400/40 shadow-sm">
              <Globe className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Không gian 360°</span>
            </span>
          </div>

          {/* Content on Image */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-xl text-white">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-2">
                <span>🌐 {station.vr360Experience.titleVi.toUpperCase()}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow leading-relaxed">
                Mở không gian 360° để quan sát điểm đến và khám phá tư liệu trực quan.
              </p>
              <p className="text-[11px] text-amber-300/90 font-medium drop-shadow-xs">
                Nguồn trải nghiệm: {station.vr360Experience.sourceName || 'Nguồn 360° đã kiểm chứng'}
              </p>
            </div>

            {/* Call To Action Button (non-nested interactive) */}
            <div className="shrink-0 pt-2 sm:pt-0">
              <span className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-transform duration-200 group-hover:scale-105 active:scale-95 pointer-events-none">
                <Globe className="w-4 h-4 text-slate-950" />
                <span>BẮT ĐẦU KHÁM PHÁ 360°</span>
              </span>
            </div>
          </div>
        </div>
      )}

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
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">• Chặng 1: Đánh thức điểm đến</span>
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

      {/* Main Hotspot Stage Canvas (4 Outside-VR Learning Hotspots) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Showcase (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 flex flex-col group">
          <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-950 overflow-hidden">
            <img
              src={hotspot.image}
              alt={hotspot.titleVi}
              className={`w-full h-full object-contain`}
              onError={(e) => {
                const image = e.currentTarget;
                if (image.src.endsWith('/adventure-background.svg')) return;
                image.src = '/adventure-background.svg';
              }}
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/30 pointer-events-none" />

            {/* Top Badge */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-black shadow-md border border-white/20">
                {hotspot.mediaRights === 'ALLOWED' && !hotspot.mediaCredit?.includes('minh họa')
                  ? 'Ảnh chụp thực tế'
                  : 'Tranh minh họa học tập'}
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

          <RealPhotoGallery stationId={station.id} index={station.hotspots.findIndex(p=>p.id===hotspot.id)}/>
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
                {displayedOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let optClass = 'border-slate-200 hover:bg-slate-50 text-slate-700';

                  if (answerSubmitted) {
                    if (isCorrect && opt.isCorrect) {
                      optClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-300';
                    } else if (!isCorrect && isSelected) {
                      optClass = 'border-rose-400 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-300';
                    }
                  } else if (isSelected) {
                    optClass = 'border-sky-500 bg-sky-50 text-sky-950 font-bold ring-2 ring-sky-300';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={answerSubmitted || wrongLocked}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between gap-3 ${optClass}`}
                    >
                      <span>{opt.textVi}</span>
                      {answerSubmitted && isCorrect && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {(answerSubmitted || isCorrect) && (
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  <p className="font-extrabold text-sm mb-1">
                    {isCorrect
                      ? 'Chính xác! Em đã phát hiện thêm một điều thú vị về điểm đến này.'
                      : 'Chưa đúng rồi. Em xem lại hình ảnh hoặc nghe lại thuyết minh nhé!'}
                  </p>
                  {!isCorrect && (
                    <p className="text-[12px] font-semibold mt-1">Gợi ý: Em nghe lại lời thuyết minh ngay phía trên nhé. Đợi 2 giây rồi chọn đáp án khác!</p>
                  )}
                  {isCorrect && (
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {hotspot.interaction.explanationVi}
                    </p>
                  )}
                </div>
              )}

              {/* Control Buttons */}
              <div className="pt-2">
                {!answerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOptionId || wrongLocked}
                    className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm shadow-md transition active:scale-98"
                  >
                    Kiểm tra câu trả lời
                  </button>
) : (
                  <button
                    onClick={handleNextHotspot}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>{isLastHotspot ? 'Hoàn thành Chặng 1 – Nhận phần thưởng!' : 'ĐI TIẾP'}</span>
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
                    {station.vr360Experience?.titleVi || 'Khám phá 360°'}
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
            <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden">
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
                <div className="text-center p-8 text-slate-200 max-w-md space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                    <Globe className="w-9 h-9" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-1">
                      Trải nghiệm 360° cần mở trong cửa sổ riêng.
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Nguồn 360° này có thể hoạt động tối ưu hơn khi được mở trong cửa sổ riêng của trình duyệt.
                    </p>
                  </div>
                  <a
                    href={station.vr360Experience?.fallbackUrl || station.vr360Experience?.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/30 transition transform hover:scale-105 active:scale-95"
                  >
                    <span>MỞ 360° TRONG TAB MỚI</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <>
                  <iframe
                    src={station.vr360Experience.url}
                    title={station.vr360Experience.titleVi || 'Khám phá 360°'}
                    className="w-full h-full border-0"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    onLoad={() => setIframeLoaded(true)}
                    onError={() => setIframeError(true)}
                  />

                  {/* Loading & Timeout Overlay */}
                  {!iframeLoaded && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                      <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-200">Đang mở không gian 360°...</p>
                        <p className="text-xs text-slate-400">Nguồn: {station.vr360Experience?.sourceName || 'Nguồn 360° đã kiểm chứng'}</p>
                      </div>

                      {vrTimeoutReached && (
                        <div className="pt-3 space-y-3 animate-fade-in max-w-sm">
                          <p className="text-xs text-amber-300 font-semibold">
                            Trải nghiệm 360° cần mở trong cửa sổ riêng.
                          </p>
                          <a
                            href={station.vr360Experience?.fallbackUrl || station.vr360Experience?.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-105"
                          >
                            <span>MỞ 360° TRONG TAB MỚI</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Stage 1 Reward Claim Modal */}
      {showRewardModal && (
        <RewardClaimModal
          reward={station.rewards.find(r => r.stage === 1) || station.rewards[0]}
          stage={1}
          alreadyClaimed={!isReadOnly && progress.rewardsCollected.includes(station.rewards.find(r => r.stage === 1)?.id || '')}
          onClaim={() => {
            if (!isReadOnly) {
              const rw1 = station.rewards.find(r => r.stage === 1);
              if (rw1) {
                progressService.claimReward(studentId, station.id, rw1.id);
              }
            }
          }}
          onContinue={() => {
            if(!freeReview&&!allHotspotsAnswered(station.hotspots,answeredIds))return;
            setShowRewardModal(false);
            onCompleteStage();
          }}
        />
      )}
    </div>
  );
};

