import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Teacher, Admin, Station, UserRole } from '../types';
import { authService } from '../services/AuthService';
import { contentService } from '../services/ContentService';
import { ALL_25_STATIONS, getStationsForGrade } from '../data/allStations';
import { CANONICAL_HOI_AN_STATION } from '../data/canonicalHoiAn';
import { audioService } from '../services/AudioService';
import { progressService } from '../services/ProgressService';
import { studentSyncService } from '../services/StudentSyncService';
import { Language, TRANSLATIONS } from '../utils/i18n';

export type AppView =
  | 'landing'
  | 'student-journey'
  | 'student-passport'
  | 'student-maps'
  | 'student-memories'
  | 'student-profile'
  | 'station-view'
  | 'teacher-view'
  | 'admin-view'
  | 'presentation-view';

interface AppContextType {
  currentUser: User | null;
  role: UserRole;
  currentGrade: number;
  currentStation: Station | null;
  currentStage: 1 | 2 | 3 | 4;
  currentView: AppView;
  isOnline: boolean;
  soundEnabled: boolean;
  language: Language;
  t: (typeof TRANSLATIONS)['vi'];
  allStationsInCurrentGrade: Station[];
  
  // Actions
  setRole: (role: UserRole) => Promise<void>;
  loginAsStudent: (student: Student) => void;
  loginAsTeacher: (teacher: Teacher) => void;
  enterTeacherDemo: () => Promise<void>;
  loginAsAdmin: (admin: Admin) => void;
  logout: () => Promise<void>;
  setCurrentGrade: (grade: number) => void;
  openStation: (station: Station, initialStage?: 1 | 2 | 3 | 4) => void;
  closeStation: () => void;
  setCurrentStage: (stage: 1 | 2 | 3 | 4) => void;
  setCurrentView: (view: AppView) => void;
  toggleSound: () => void;
  toggleLanguage: () => void;
  enterPresentationMode: (station: Station) => void;
  exitPresentationMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>('student');
  const [selectedGrade, setGradeState] = useState<number>(2);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => audioService.isSoundEnabled());
  const [language, setLanguage] = useState<Language>('vi');

  const [, setContentRevision] = useState(0);
  useEffect(() => {
    let active = true;
    void contentService.loadShared(ALL_25_STATIONS).then(loaded => {
      if (active && loaded) setContentRevision(value => value + 1);
    });
    return () => { active = false; };
  }, []);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const t = TRANSLATIONS[language];
  const currentGrade = role === 'student' && currentUser
    ? (currentUser as Student).grade : selectedGrade;
  const setCurrentGrade = (grade: number) => {
    if ((role === 'student' && !(currentUser as Student)?.isGuest) || !Number.isInteger(grade) || grade < 1 || grade > 5) return;
    setGradeState(grade);
    if ((currentUser as Student)?.isGuest) {
      setCurrentUser({ ...currentUser, grade } as Student);
      setCurrentView('student-journey');
      try { localStorage.setItem('cham_danang_guest_grade_v1', String(grade)); } catch {}
    }
    setCurrentStation(null);
    setCurrentStage(1);
  };

  const setRole = async (newRole: UserRole) => {
    if (authService.current()) {
      try { await authService.logout(); } catch (error) { alert((error as Error).message); return; }
    }
    audioService.playSfx('click');
    setRoleState(newRole);
    setCurrentUser(null);
    setCurrentStation(null);
    setCurrentStage(1);
    setCurrentView('landing');
  };

  const loginAsStudent = (student: Student) => {
    audioService.playSfx('unlock');
    setCurrentUser(student);
    setRoleState('student');
    setGradeState(student.grade);
    setCurrentStation(null);
    setCurrentStage(1);
    setCurrentView('student-journey');
  };

  const loginAsTeacher = (teacher: Teacher) => {
    if (authService.current()?.id !== teacher.id || authService.current()?.role !== 'teacher') return;
    audioService.playSfx('unlock');
    setCurrentUser(teacher);
    setRoleState('teacher');
    setGradeState(2);
    setCurrentStation(null);
    setCurrentStage(1);
    setCurrentView('teacher-view');
  };

  const enterTeacherDemo = async () => {
    if (authService.current()) await authService.logout();
    audioService.playSfx('unlock');
    setCurrentUser({ id: 'teacher-demo', role: 'teacher', name: 'Giáo viên trải nghiệm', assignedClasses: ['class-2-24', 'class-2-25'], schoolName: 'Trường Tiểu học Trần Đại Nghĩa' } as Teacher);
    setRoleState('teacher');
    setGradeState(2);
    setCurrentStation(null);
    setCurrentStage(1);
    setCurrentView('teacher-view');
  };

  const loginAsAdmin = (admin: Admin) => {
    if (authService.current()?.id !== admin.id || authService.current()?.role !== 'admin') return;
    audioService.playSfx('unlock');
    setCurrentUser(admin);
    setRoleState('admin');
    setCurrentView('admin-view');
  };

  const logout = async () => {
    if (authService.current()) {
      try { await authService.logout(); } catch (error) { alert((error as Error).message); return; }
    }
    audioService.playSfx('click');
    setCurrentUser(null);
    setCurrentStation(null);
    setCurrentView('landing');
  };

  useEffect(() => {
    let active = true;
    const restore = async () => {
      try {
        const user = await authService.restore();
        if (!active) return;
        if (user) {
          setCurrentUser(user);
          setRoleState(user.role);
          setCurrentView(user.role === 'admin' ? 'admin-view' : 'teacher-view');
          return;
        }
      } catch {
        // Nếu máy chủ nhân sự chưa sẵn sàng, vẫn thử khôi phục học sinh cục bộ.
      }

      if (!active) return;
      try {
        const raw = localStorage.getItem('cham_danang_student_profile_v1');
        if (!raw) return;
        const saved = JSON.parse(raw);
        const inferredGrade = typeof saved?.className === 'string'
          ? Number(saved.className.split('/')[0])
          : NaN;
        const grade = Number.isInteger(Number(saved?.grade))
          ? Number(saved.grade)
          : inferredGrade;

        if (
          typeof saved?.id !== 'string' ||
          !saved.id ||
          typeof saved?.name !== 'string' ||
          !saved.name.trim() ||
          typeof saved?.className !== 'string' ||
          !/^([1-5])\/[1-9][0-9]{0,2}$/.test(saved.className) ||
          !Number.isInteger(grade) ||
          grade < 1 ||
          grade > 5
        ) return;

        const student: Student = {
          id: saved.id,
          role: 'student',
          name: saved.name.trim(),
          displayName: saved.name.trim(),
          studentCode: saved.id,
          classId: `class-${saved.className.replace('/', '-')}`,
          className: saved.className,
          grade,
          status: 'active',
          isGuest: false,
        };

        setCurrentUser(student);
        setRoleState('student');
        setGradeState(grade);
        setCurrentStation(null);
        setCurrentStage(1);
        setCurrentView('student-journey');
      } catch {
        // Hồ sơ cục bộ lỗi thì quay về trang bắt đầu, không làm mất dữ liệu tiến độ.
      }
    };
    void restore();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!currentUser || role === 'student' || currentUser.id === 'teacher-demo') return;
    let active = true;
    const check = async () => {
      try {
        const user = await authService.restore();
        if (active && !user) { setCurrentUser(null); setCurrentStation(null); setCurrentView('landing'); }
      } catch { /* A connection failure is shown by the next protected action. */ }
    };
    const timer = window.setInterval(() => void check(), 60000);
    window.addEventListener('focus', check);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', check); };
  }, [currentUser?.id, role]);

  useEffect(() => {
    if (!currentUser || role !== 'student' || (currentUser as Student).isGuest) return;

    let syncCode = '';
    try {
      const raw = localStorage.getItem('cham_danang_student_profile_v1');
      const saved = raw ? JSON.parse(raw) : null;
      if (saved?.id === currentUser.id && typeof saved?.syncCode === 'string') {
        syncCode = saved.syncCode.trim();
      }
    } catch {}
    if (!syncCode) return;

    let timer: number | undefined;
    let stopped = false;
    const push = async () => {
      if (stopped || !navigator.onLine) return;
      try {
        const records = progressService.getStudentProgressRecords(currentUser.id);
        const result = await studentSyncService.push(syncCode, records);
        if (!stopped && result?.progress) {
          progressService.mergeStudentProgressRecords(currentUser.id, result.progress);
        }
      } catch {
        // Giữ dữ liệu cục bộ; lần thay đổi hoặc lần online tiếp theo sẽ thử lại.
      }
    };
    const schedulePush = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => void push(), 700);
    };
    const handleOnline = () => schedulePush();

    window.addEventListener('cham-progress-changed', schedulePush);
    window.addEventListener('online', handleOnline);
    schedulePush();

    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('cham-progress-changed', schedulePush);
      window.removeEventListener('online', handleOnline);
    };
  }, [currentUser?.id, role]);

  const openStation = (station: Station, initialStage: 1 | 2 | 3 | 4 = 1) => {
    if (!currentUser) return;
    if (role === 'student' && station.grade !== (currentUser as Student).grade) return;
    audioService.playSfx('click');
    setCurrentStation(station);
    setCurrentStage(initialStage);
    setCurrentView('station-view');

    // Only authenticated student sessions write learning progress.
    if (currentUser && role === 'student') {
      progressService.startStation(currentUser.id, station.id);
    }
  };

  const closeStation = () => {
    audioService.playSfx('click');
    audioService.stopNarration();
    setCurrentStation(null);
    if (role === 'admin') {
      setCurrentView('admin-view');
    } else if (role === 'teacher') {
      setCurrentView('teacher-view');
    } else {
      setCurrentView('student-journey');
    }
  };

  const toggleSound = () => {
    const next = audioService.toggleSound();
    setSoundEnabled(next);
  };

  const toggleLanguage = () => {
    audioService.playSfx('click');
    setLanguage(prev => (prev === 'vi' ? 'en' : 'vi'));
  };

  const enterPresentationMode = (station: Station) => {
    if (!currentUser || (role !== 'teacher' && role !== 'admin')) return;
    audioService.playSfx('click');
    setCurrentStation(station);
    setCurrentStage(1);
    setCurrentView('presentation-view');
  };

  const exitPresentationMode = () => {
    audioService.playSfx('click');
    audioService.stopNarration();
    setCurrentStation(null);
    setCurrentStage(1);
    setCurrentView(role === 'admin' ? 'admin-view' : 'teacher-view');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        role,
        currentGrade,
        currentStation,
        currentStage,
        currentView,
        isOnline,
        soundEnabled,
        language,
        t,
        allStationsInCurrentGrade: getStationsForGrade(currentGrade),
        setRole,
        loginAsStudent,
        loginAsTeacher,
        enterTeacherDemo,
        loginAsAdmin,
        logout,
        setCurrentGrade,
        openStation,
        closeStation,
        setCurrentStage,
        setCurrentView,
        toggleSound,
        toggleLanguage,
        enterPresentationMode,
        exitPresentationMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
