import { FeatureLoadBoundary } from './components/common/FeatureLoadBoundary';
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
const AdminDemoDashboard = lazy(() => import('./features/admin/AdminDemoDashboard').then(module => ({ default: module.AdminDemoDashboard })));
const ClassroomPresentationMode = lazy(() => import('./features/teacher/ClassroomPresentationMode').then(module => ({ default: module.ClassroomPresentationMode })));
import { WifiOff } from 'lucide-react';
const DanangAssistantChat = lazy(() => import('./components/common/DanangAssistantChat').then(module => ({ default: module.DanangAssistantChat })));

const AppContent: React.FC = () => {
  const { currentUser, role, currentView, currentStation, currentAssistantHotspot, currentStage, isOnline, closeStation, exitPresentationMode } = useApp();

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

  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    const notify = () => setStorageWarning(true);
    window.addEventListener('cham-progress-storage-error', notify);
    return () => window.removeEventListener('cham-progress-storage-error', notify);
  }, []);

  if (!currentUser && currentView !== 'landing') return <LandingView />;

  // If in Presentation Mode, render full-screen projection without header/footer
  if (currentView === 'presentation-view' && currentStation && (role === 'teacher' || role === 'admin')) {
    return <><ClassroomPresentationMode key={currentStation.id} station={currentStation} onExit={exitPresentationMode} /><FeatureLoadBoundary fallback={null}><Suspense fallback={null}><DanangAssistantChat audience="teacher" station={currentStation} hotspot={currentAssistantHotspot} /></Suspense></FeatureLoadBoundary></>;
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
        {currentView === 'admin-view' && role === 'admin' && (currentUser?.id === 'admin-demo' ? <AdminDemoDashboard /> : <AdminDashboard />)}
      </main>

      {currentView !== 'student-journey' && currentView !== 'station-view' && <Footer />}

      {(role === 'student' || role === 'teacher' || role === 'admin') && currentUser && currentView !== 'presentation-view' && (
        <FeatureLoadBoundary fallback={null}><Suspense fallback={null}><DanangAssistantChat docked={currentView === 'student-journey'} audience={role === 'student' ? 'student' : 'teacher'} stage={currentView === 'station-view' ? currentStage : undefined} compactGame={currentView === 'station-view' && (currentStage === 1 || currentStage === 2)} station={currentView === 'station-view' ? currentStation : null} hotspot={currentView === 'station-view' ? currentAssistantHotspot : null} /></Suspense></FeatureLoadBoundary>
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
      <AppBackground />
      <FeatureLoadBoundary><Suspense fallback={<div role="status" className="relative z-10 flex min-h-screen items-center justify-center bg-amber-50 p-6 text-lg font-bold text-sky-900">Đang mở hành trình…</div>}>
        <AppContent />
      </Suspense></FeatureLoadBoundary>
    </AppProvider>
  );
}

export default App;


