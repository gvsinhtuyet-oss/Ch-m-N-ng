import { AppBackground } from './components/common/AppBackground';
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingView } from './features/landing/LandingView';
import { StudentJourneyView } from './features/student/StudentJourneyView';
import { StudentPassportView } from './features/passport/StudentPassportView';
import { StudentJourneyMapsView } from './features/student/StudentJourneyMapsView';
import { StudentMemoriesView } from './features/student/StudentMemoriesView';
import { StudentProfileView } from './features/student/StudentProfileView';
import { StationView } from './features/stations/StationView';
import { TeacherDashboard } from './features/teacher/TeacherDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { ClassroomPresentationMode } from './features/teacher/ClassroomPresentationMode';
import { WifiOff } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, currentStation, isOnline, closeStation, exitPresentationMode } = useApp();

  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    const notify = () => setStorageWarning(true);
    window.addEventListener('cham-progress-storage-error', notify);
    return () => window.removeEventListener('cham-progress-storage-error', notify);
  }, []);

  // If in Presentation Mode, render full-screen projection without header/footer
  if (currentView === 'presentation-view' && currentStation) {
    return <ClassroomPresentationMode key={currentStation.id} station={currentStation} onExit={exitPresentationMode} />;
  }

  // If on Landing Cover Page, render full-screen immersive cover
  if (currentView === 'landing') {
    return <LandingView />;
  }

  return (
    <div className="game-shell min-h-screen flex flex-col text-slate-800">
      <Header />

      <main className="game-content flex-1">
        {currentView === 'student-journey' && <StudentJourneyView />}
        {currentView === 'student-passport' && <StudentPassportView />}
        {currentView === 'student-maps' && <StudentJourneyMapsView />}
        {currentView === 'student-memories' && <StudentMemoriesView />}
        {currentView === 'student-profile' && <StudentProfileView />}
        {currentView === 'station-view' && currentStation && (
          <StationView key={currentStation.id} station={currentStation} onBack={closeStation} />
        )}
        {currentView === 'teacher-view' && <TeacherDashboard />}
        {currentView === 'admin-view' && <AdminDashboard />}
      </main>

      <Footer />

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
      <AppContent />
    </AppProvider>
  );
}

export default App;

