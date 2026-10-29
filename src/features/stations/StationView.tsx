import '../../components/station/station-exploration-tools.css';
import './station-stage1-compact.css';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { progressService } from '../../services/ProgressService';
import { offlineService } from '../../services/OfflineService';
import { audioService } from '../../services/AudioService';
import {StationExplorationTools} from '../../components/station/StationExplorationTools';
import {stationHasExplorationTools} from './explorationResources';
import { Stage1Exploration } from '../../components/station/Stage1Exploration';
import { HoiAnStage1Exploration } from '../../components/station/HoiAnStage1Exploration';
import { Stage2Challenge } from '../../components/station/Stage2Challenge';
import { Stage3CheckIn } from '../../components/station/Stage3CheckIn';
import { Stage4Stamp } from '../../components/station/Stage4Stamp';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import { unlockedStage,visibleStage } from './stageAccess';
import { ArrowLeft, Download, CheckCircle2, Compass, Award, Heart, Sparkles, Maximize2, LockKeyhole } from 'lucide-react';

interface Props {
  station: Station;
  onBack: () => void;
}

export const StationView: React.FC<Props> = ({ station, onBack }) => {
  const { currentUser, role, currentStage: requestedStage, setCurrentStage } = useApp();
  const isReadOnly = role !== 'student';
  const studentId = currentUser?.id || 'guest';
  const [, refreshProgress] = useState(0);
  useEffect(() => {
    const refresh = () => refreshProgress(value => value + 1);
    window.addEventListener('cham-progress-changed', refresh);
    return () => window.removeEventListener('cham-progress-changed', refresh);
  }, []);
  const progress = progressService.getStationProgress(studentId, station.id);
  const isPolishedJourney = DEMO_STATION_IDS.has(station.id);

  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [isLessonFullscreen, setIsLessonFullscreen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toggleLessonFullscreen = async () => {
    const element = fullscreenRef.current;
    if (!element) return;
    try {
      if (document.fullscreenElement === element) await document.exitFullscreen();
      else if (!document.fullscreenElement && element.requestFullscreen) await element.requestFullscreen();
      else setIsLessonFullscreen(v => !v);
    } catch { setIsLessonFullscreen(v => !v); }
  };
  useEffect(() => {
    const sync = () => setIsLessonFullscreen(document.fullscreenElement === fullscreenRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const lessonPanelRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [offlinePkg, setOfflinePkg] = useState(offlineService.getPackage(station.id));

  // If completed once or stamp received, student can freely navigate stages
  const [sessionUnlockedStage,setSessionUnlockedStage]=useState(()=>unlockedStage(progress));
  const highestAccessibleStage=Math.max(sessionUnlockedStage,unlockedStage(progress,isReadOnly));
  const currentStage=visibleStage(requestedStage,progress,highestAccessibleStage);
  // The lesson panel can retain a scroll position from Stage 1. Start the new
  // grade 2, 4 and 5 games at the top so the artwork title and controls are visible.
  useLayoutEffect(() => {
    if (currentStage === 2 && (station.grade === 2 || station.grade === 4 || station.grade === 5)) {
      if (lessonPanelRef.current) {
        lessonPanelRef.current.scrollTop = 0;
        if (window.innerWidth < 1024) {
          const headerHeight = document.querySelector('header')?.getBoundingClientRect().height || 0;
          lessonPanelRef.current.style.scrollMarginTop = `${headerHeight}px`;
          lessonPanelRef.current.scrollIntoView({block:'start',behavior:'instant'});
        }
      }
    }
  }, [currentStage, station.id, station.grade]);
  const isUnlockedAllStages=progress.stationCompleted||progress.stampReceived;
  const finishStage=(stage:1|2|3)=>{
    if(stage>highestAccessibleStage)return;
    const next=(stage+1) as 2|3|4;
    if (!isReadOnly) setSessionUnlockedStage(highest=>Math.max(highest,next));
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
    { num: 1, title: 'Chặng 1', name: 'Khám phá điểm đến', icon: Compass },
    { num: 2, title: 'Chặng 2', name: 'Vượt qua thử thách', icon: Award },
    { num: 3, title: 'Chặng 3', name: 'Check-in cảm xúc', icon: Heart },
    { num: 4, title: 'Chặng 4', name: 'Dấu ấn hành trình', icon: Sparkles },
  ];

  const shortNames = ['Khám phá', 'Thử thách', 'Cảm xúc', 'Dấu ấn'];
  const renderStageTabs = (label: string) => (
    <nav aria-label={label} className="station-stage-tabs">
      {stages.map(st => {
        const active = currentStage === st.num;
        const done = !isReadOnly && (isUnlockedAllStages || st.num < highestAccessibleStage);
        const clickable = st.num <= highestAccessibleStage;
        const status = done ? 'Đã hoàn thành' : clickable ? 'Chưa hoàn thành' : 'Chưa mở';
        return <button key={st.num} type="button" disabled={!clickable}
          aria-label={`${st.title}: ${st.name} – ${status}`}
          aria-current={active ? 'step' : undefined} title={`${st.name} – ${status}`}
          onClick={() => {
            audioService.playSfx('click');
            setCurrentStage(st.num as 1|2|3|4);
            lessonPanelRef.current?.scrollTo({top: 0});
          }}
          className={`station-stage-tab ${active ? 'is-active' : ''} ${done ? 'is-complete' : ''}`}>
          <span className="station-stage-tab-title">{!clickable ? <LockKeyhole aria-hidden="true" /> : <st.icon aria-hidden="true" />}{done && <CheckCircle2 className="station-stage-complete-mark" aria-hidden="true" />}</span>
          <span className="station-stage-tab-name">{st.name}</span>
        </button>;
      })}
    </nav>
  );

  return (
    <div ref={fullscreenRef} data-stage={currentStage} className={`station-immersive-root ${currentStage === 1 ? "station-stage1-compact" : ""} ${isLessonFullscreen ? "station-immersive-active" : ""} ${isPolishedJourney ? "station-viewport mx-auto max-w-[1600px] px-2 py-2 sm:px-4 space-y-3" : "station-viewport max-w-7xl mx-auto px-3 sm:px-5 py-4 space-y-4"}`}>
            {/* Top Station Header bar */}
      <div className="station-compact-header relative z-10">
        <button type="button" onClick={() => { audioService.playSfx('click'); onBack(); }} aria-label="Quay lại danh sách trạm" className="station-compact-back"><ArrowLeft aria-hidden="true" /></button>
        <h1 className="station-compact-title" title={station.titleVi}>{station.titleVi}</h1>
        {renderStageTabs("Bốn chặng hành trình")}
        
        <div className="station-compact-actions">
          <button type="button" onClick={toggleLessonFullscreen} aria-label={isLessonFullscreen ? 'Thu nhỏ bài học' : 'Toàn màn hình'} title="Toàn màn hình" className="station-compact-action"><Maximize2 aria-hidden="true" /></button>
          <button type="button" onClick={handleDownload} disabled={downloading || Boolean(offlinePkg)} title={offlinePkg ? 'Demo offline đã lưu' : 'Tải demo offline'} aria-label="Tải demo offline" className="station-compact-action"><Download aria-hidden="true" /></button>
        </div>
      </div>

      <div ref={lessonPanelRef} className="station-lesson-panel min-h-0 flex-1 overflow-y-auto space-y-3">
      <div className={currentStage === 1 && stationHasExplorationTools(station) ? 'station-exploration-layout' : ''}>

      {/* Keep the lesson mounted so dismissing a tool preserves its point and answer. */}
      <div className="transition-all duration-300" inert={toolsOpen || undefined}>
        {currentStage === 1 && (
          isPolishedJourney ? (
            <HoiAnStage1Exploration station={station} onToolsOpenChange={setToolsOpen} onCompleteStage={() => finishStage(1)} />
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
      </div>
    </div>
  );
};
