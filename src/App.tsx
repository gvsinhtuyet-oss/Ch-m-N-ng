import React from 'react';
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

  // If in Presentation Mode, render full-screen projection without header/footer
  if (currentView === 'presentation-view' && currentStation) {
    return <ClassroomPresentationMode station={currentStation} onExit={exitPresentationMode} />;
  }

  // If on Landing Cover Page, render full-screen immersive cover
  if (currentView === 'landing') {
    return <LandingView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      <main className="flex-1">
        {currentView === 'student-journey' && <StudentJourneyView />}
        {currentView === 'student-passport' && <StudentPassportView />}
        {currentView === 'student-maps' && <StudentJourneyMapsView />}
        {currentView === 'student-memories' && <StudentMemoriesView />}
        {currentView === 'student-profile' && <StudentProfileView />}
        {currentView === 'station-view' && currentStation && (
          <StationView station={currentStation} onBack={closeStation} />
        )}
        {currentView === 'teacher-view' && <TeacherDashboard />}
        {currentView === 'admin-view' && <AdminDashboard />}
      </main>

      <Footer />

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
      <AppContent />
    </AppProvider>
  );
}

export default App;
