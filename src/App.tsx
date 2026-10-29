import { FeatureLoadBoundary } from './components/common/FeatureLoadBoundary';
import { backgroundMusic } from './services/BackgroundMusic';
import { AppBackground } from './components/common/AppBackground';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingView } from './features/landing/LandingView';
const StudentJourneyView = lazy(() => import('./features/student/StudentJourneyView').then(module => ({ default: module.StudentJourneyView })));
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

  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    const notify = () => setStorageWarning(true);
    window.addEventListener('cham-progress-storage-error', notify);
    return () => window.removeEventListener('cham-progress-storage-error', notify);
  }, []);

  if (!currentUser && currentView !== 'landing') return <LandingView />;

  // If in Presentation Mode, render full-screen projection without header/footer
  if (currentView === 'presentation-view' && currentStation && (role === 'teacher' || role === 'admin')) {
    return <ClassroomPresentationMode key={currentStation.id} station={currentStation} onExit={exitPresentationMode} />;
  }

  // If on Landing Cover Page, render full-screen immersive cover
  if (currentView === 'landing') {
    return <LandingView />;
  }

  return (
    <div className={`game-shell min-h-screen flex flex-col text-slate-800 ${currentView === 'station-view' ? 'station-screen-fixed' : ''}`}>
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

      {role === 'student' && currentUser && currentView !== 'presentation-view' && (
        <Suspense fallback={null}><DanangAssistantChat compactGame={currentView === 'station-view' && (currentStage === 1 || (currentStage === 2 && (currentStation?.grade === 2 || currentStation?.grade === 4 || currentStation?.grade === 5)))} station={currentView === 'station-view' ? currentStation : null} hotspot={currentView === 'station-view' ? currentAssistantHotspot : null} /></Suspense>
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


