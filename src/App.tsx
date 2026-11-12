import { AppFullscreenProvider } from './components/common/AppFullscreen';
import { FeatureLoadBoundary, recoverApplicationAssets } from './components/common/FeatureLoadBoundary';
import { effectivenessService } from './services/EffectivenessService';
import type { Student } from './types';
import { backgroundMusic } from './services/BackgroundMusic';
import { audioService } from './services/AudioService';
import { AppBackground } from './components/common/AppBackground';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingView } from './features/landing/LandingView';
import { StudentJourneyView } from './features/student/StudentJourneyView';

const StudentPassportView = lazy(() => import('./features/passport/StudentPassportView').then(module => ({ default: module.StudentPassportView })));
const StudentJourneyMapsView = lazy(() => import('./features/student/StudentJourneyMapsView').then(module => ({ default: module.StudentJourneyMapsView })));
const StudentMemoriesView = lazy(() => import('./features/student/StudentMemoriesView').then(module => ({ default: module.StudentMemoriesView })));
const StudentProfileView = lazy(() => import('./features/student/StudentProfileView').then(module => ({ default: module.StudentProfileView })));
const StationView = lazy(() => import('./features/stations/StationView').then(module => ({ default: module.StationView })));
const TeacherDashboard = lazy(() => import('./features/teacher/TeacherDashboard').then(module => ({ default: module.TeacherDashboard })));
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ClassroomPresentationMode = lazy(() => import('./features/teacher/ClassroomPresentationMode').then(module => ({ default: module.ClassroomPresentationMode })));
import { WifiOff } from 'lucide-react';
const DanangAssistantChat = lazy(() => import('./components/common/DanangAssistantChat').then(module => ({ default: module.DanangAssistantChat })));

const AppContent: React.FC = () => {
  const { currentUser, role, currentView, currentStation, currentAssistantHotspot, currentStage, currentGrade, setCurrentGrade, openStation, isOnline, closeStation, exitPresentationMode } = useApp();
  const [assistantOpenRequest, setAssistantOpenRequest] = useState(0);
  useEffect(() => {
    // Preserve the first tap while the lazily loaded chatbot bundle is still downloading.
    const requestOpen = () => setAssistantOpenRequest(count => count + 1);
    window.addEventListener('cham-open-assistant', requestOpen);
    return () => window.removeEventListener('cham-open-assistant', requestOpen);
  }, []);

  useEffect(() => {
    const unlock = () => { void backgroundMusic.unlock(); };
    const keyUnlock = (event: KeyboardEvent) => { if (!event.ctrlKey && !event.metaKey && !event.altKey) unlock(); };
    const visibility = () => backgroundMusic.refreshVisibility();
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', keyUnlock);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', keyUnlock);
      document.removeEventListener('visibilitychange', visibility);
      backgroundMusic.stop();
    };
  }, []);
  useEffect(() => {
    // Nhạc nền là một lớp độc lập: tiếp tục xuyên suốt mọi màn hình.
    backgroundMusic.setScene(true);
  }, [currentView]);

  // Feedback for standard UI controls. Stage 2 games have their own audio engine.
  useEffect(() => {
    const soundOnActivation = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest('button, [role="button"], a[href]');
      if (!control || control.matches(':disabled, [aria-disabled="true"]')) return;
      if (control.closest('[data-shared-stage2], .stage-two, [data-stage="2"]')) return;
      // Respect mute controls: do not play a click after the user disables sound.
      if (control.matches('[aria-label*="âm thanh"], [aria-label*="sound"]')) return;
      audioService.playSfx('click');
    };
    document.addEventListener('click', soundOnActivation);
    return () => document.removeEventListener('click', soundOnActivation);
  }, []);

  const analyticsAudience = currentUser && role !== 'student' ? 2
    : currentUser && !(currentUser as Student).isGuest ? 1 : 0;
  useEffect(() => {
    effectivenessService.visit(analyticsAudience);
  }, [analyticsAudience]);
  useEffect(() => {
    const visible = () => {
      if (document.visibilityState === 'hidden') effectivenessService.flush();
      else effectivenessService.refreshVisit();
    };
    window.addEventListener('online', effectivenessService.flush);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('online', effectivenessService.flush);
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);

  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    const notify = () => setStorageWarning(true);
    window.addEventListener('cham-progress-storage-error', notify);
    return () => window.removeEventListener('cham-progress-storage-error', notify);
  }, []);

  const assistantLoading = assistantOpenRequest > 0
    ? <div role="status" className="fixed bottom-4 left-3 right-3 z-[80] mx-auto max-w-sm rounded-2xl bg-sky-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">Đang mở Trợ lý khám phá…</div>
    : null;
  const assistantUnavailable = assistantOpenRequest > 0
    ? <div role="alert" className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-3 right-3 z-[80] mx-auto max-w-sm rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg">
        <p className="font-bold">Trợ lý khám phá chưa tải được.</p>
        <p className="mt-1 text-xs">Safari có thể đang dùng tệp ứng dụng cũ hoặc chưa tải xong. Khắc phục chỉ làm mới tệp ứng dụng, không xóa thông tin học sinh hay tiến trình.</p>
        <button type="button" className="mt-3 min-h-11 w-full rounded-xl bg-sky-700 px-3 py-2 font-bold text-white" onClick={() => void recoverApplicationAssets()}>Khắc phục và tải bản mới</button>
      </div>
    : null;

  if (!currentUser && currentView !== 'landing') return <LandingView />;

  // If in Presentation Mode, render full-screen projection without header/footer
  if (currentView === 'presentation-view' && currentStation && (role === 'teacher' || role === 'admin')) {
    return <><ClassroomPresentationMode key={currentStation.id} station={currentStation} onExit={exitPresentationMode} /><FeatureLoadBoundary fallback={assistantUnavailable}><Suspense fallback={assistantLoading}><DanangAssistantChat openRequestId={assistantOpenRequest} storageScope={currentUser?role+':'+currentUser.id:''} currentGrade={currentGrade} onOpenTeacherStation={station=>{setCurrentGrade(station.grade);openStation(station,1);}} audience="teacher" station={currentStation} hotspot={currentAssistantHotspot} /></Suspense></FeatureLoadBoundary></>;
  }

  // If on Landing Cover Page, render full-screen immersive cover
  if (currentView === 'landing') {
    return <LandingView />;
  }

  return (
    <div className={`game-shell min-h-screen flex flex-col text-slate-800 ${currentView === 'station-view' ? 'station-screen-fixed' : currentView === 'student-journey' ? 'journey-screen-fixed' : ''}`}>
      {currentView !== 'station-view' && <Header />}

      <main className="game-content flex-1">
        {currentView === 'student-journey' && <StudentJourneyView />}
        {currentView === 'student-passport' && <StudentPassportView />}
        {currentView === 'student-maps' && <StudentJourneyMapsView />}
        {currentView === 'student-memories' && <StudentMemoriesView />}
        {currentView === 'student-profile' && <StudentProfileView />}
        {currentView === 'station-view' && currentStation && (
          <StationView key={currentStation.id} station={currentStation} onBack={closeStation} />
        )}
        {currentView === 'teacher-view' && role === 'teacher' && <TeacherDashboard />}
        {currentView === 'admin-view' && role === 'admin' && <AdminDashboard />}
      </main>

      {currentView !== 'student-journey' && currentView !== 'station-view' && <Footer />}

      {(role === 'student' || role === 'teacher' || role === 'admin') && currentUser && currentView !== 'presentation-view' && (
        <FeatureLoadBoundary fallback={assistantUnavailable}><Suspense fallback={assistantLoading}><DanangAssistantChat openRequestId={assistantOpenRequest} storageScope={currentUser?role+':'+currentUser.id:''} currentGrade={currentGrade} onOpenTeacherStation={role === 'student' ? undefined : station=>{setCurrentGrade(station.grade);openStation(station,1);}} docked={currentView === 'student-journey'} audience={currentView === 'admin-view' && role === 'admin' ? 'admin' : role === 'student' ? 'student' : 'teacher'} stage={currentView === 'station-view' ? currentStage : undefined} compactGame={currentView === 'station-view' && (currentStage === 1 || currentStage === 2)} station={currentView === 'station-view' ? currentStation : null} hotspot={currentView === 'station-view' ? currentAssistantHotspot : null} /></Suspense></FeatureLoadBoundary>
      )}

      {storageWarning && (
        <div role="alert" className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl bg-amber-100 border border-amber-400 p-4 text-sm text-amber-950 shadow-xl">
          <p>Máy chưa lưu được tiến trình. Đừng đóng app; hãy giải phóng bộ nhớ hoặc nhờ thầy cô hỗ trợ.</p>
          <button type="button" onClick={() => setStorageWarning(false)} className="mt-2 font-bold underline">Đã hiểu</button>
        </div>
      )}

      {/* Non-intrusive Offline Floating Toast */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-xl border border-amber-300">
          <WifiOff className="w-4 h-4 text-slate-950" />
          <span>Chế độ Ngoại tuyến – Đang sử dụng dữ liệu đã lưu trong bộ nhớ máy.</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppFullscreenProvider>
        <AppBackground />
        <FeatureLoadBoundary><Suspense fallback={<div role="status" className="relative z-10 flex min-h-screen items-center justify-center bg-amber-50 p-6 text-lg font-bold text-sky-900">Đang mở hành trình…</div>}>
          <AppContent />
        </Suspense></FeatureLoadBoundary>
      </AppFullscreenProvider>
    </AppProvider>
  );
}

export default App;




