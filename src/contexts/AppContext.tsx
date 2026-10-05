import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Teacher, Admin, Station, UserRole } from '../types';
import { DEMO_STUDENTS, DEMO_TEACHER, DEMO_ADMIN } from '../data/mockUsers';
import { getStationsForGrade } from '../data/allStations';
import { CANONICAL_HOI_AN_STATION } from '../data/canonicalHoiAn';
import { audioService } from '../services/AudioService';
import { progressService } from '../services/ProgressService';
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
  setRole: (role: UserRole) => void;
  loginAsStudent: (student: Student) => void;
  loginAsTeacher: (teacher: Teacher) => void;
  loginAsAdmin: (admin: Admin) => void;
  loginAsGuest: () => void;
  logout: () => void;
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
  const [currentGrade, setCurrentGrade] = useState<number>(2);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('vi');

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

  const setRole = (newRole: UserRole) => {
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
    setCurrentGrade(student.grade);
    setCurrentStation(null);
    setCurrentStage(1);
    setCurrentView('student-journey');
  };

  const loginAsTeacher = (teacher: Teacher) => {
    audioService.playSfx('unlock');
    setCurrentUser(teacher);
    setRoleState('teacher');
    setCurrentGrade(2);
    setCurrentStation(null);
    setCurrentStage(1);
    setCurrentView('teacher-view');
  };

  const loginAsAdmin = (admin: Admin) => {
    audioService.playSfx('unlock');
    setCurrentUser(admin);
    setRoleState('admin');
    setCurrentView('admin-view');
  };

  const loginAsGuest = () => {
    audioService.playSfx('unlock');
    setCurrentUser({ id: 'guest', role: 'guest', name: 'Nhà phiêu lưu' });
    setRoleState('guest');
    setCurrentGrade(2);
    setCurrentStation(null);
    setCurrentStage(1);
    setCurrentView('student-journey');
  };

  const logout = () => {
    audioService.playSfx('click');
    setCurrentUser(null);
    setCurrentStation(null);
    setCurrentView('landing');
  };

  const openStation = (station: Station, initialStage: 1 | 2 | 3 | 4 = 1) => {
    audioService.playSfx('click');
    setCurrentStation(station);
    setCurrentStage(initialStage);
    setCurrentView('station-view');

    // Register station start in progress engine
    if (currentUser && role !== 'guest') {
      progressService.startStation(currentUser.id, station.id);
    }
  };

  const closeStation = () => {
    audioService.playSfx('click');
    audioService.stopNarration();
    setCurrentStation(null);
    if (role === 'teacher') {
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
    audioService.playSfx('click');
    setCurrentStation(station);
    setCurrentStage(1);
    setCurrentView('presentation-view');
  };

  const exitPresentationMode = () => {
    audioService.playSfx('click');
    audioService.stopNarration();
    setCurrentView('teacher-view');
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
        loginAsAdmin,
        loginAsGuest,
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
