import { MusicControl } from './MusicControl';
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { Volume2, VolumeX, Globe, Wifi, WifiOff, User, Compass, Award, Heart, Presentation, Map as MapIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    role,
    isOnline,
    soundEnabled,
    language,
    currentView,
    currentGrade,
    setCurrentGrade,
    toggleSound,
    toggleLanguage,
    setCurrentView,
    logout,
    enterTeacherDemo,
    t,
  } = useApp();

  const [showRoleModal, setShowRoleModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
        {/* Top utility bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 border-b border-slate-100/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 hidden sm:inline">{t.schoolName}</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.verifiedSource}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Online / Offline status */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[11px] ${
                isOnline ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3 text-sky-600" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
              <span>{isOnline ? t.online : t.offline}</span>
            </div>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
              title="Đổi ngôn ngữ VI | EN"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="p-1 rounded-md text-slate-600 hover:bg-slate-100 transition"
              title={soundEnabled ? t.soundOn : t.soundOff}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Role indicator & switcher */}
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs transition"
            >
              <User className="w-3 h-3" />
              <span className="font-bold">
                {role === 'teacher'
                  ? 'Giáo viên'
                  : role === 'admin'
                  ? 'Quản trị'
                  : (currentUser as any)?.isGuest ? 'Nhà phiêu lưu tự do' : `HS: ${(currentUser as any)?.displayName || 'Lớp ' + currentGrade}`}
              </span>
            </button>
          </div>
        </div>

        {currentView !== 'station-view' && currentView !== 'presentation-view' && <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-2 flex justify-end"><MusicControl /></div>}
        {/* Main Brand & Navigation */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div
            onClick={() => {
              if (role === 'admin') setCurrentView('admin-view');
              else if (role === 'teacher') setCurrentView('teacher-view');
              else setCurrentView('student-journey');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-amber-400 flex items-center justify-center p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Compass className="w-6 h-6 text-amber-400 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-700 via-sky-600 to-amber-600 bg-clip-text text-transparent">
                  CHẠM ĐÀ NẴNG
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Khối {currentGrade}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Hành trình số khám phá quê hương</p>
            </div>
          </div>

          {/* Role Navigation */}
          {role === 'student' ? (
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentView('landing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  currentView === 'landing'
                    ? 'bg-sky-100 text-sky-800 shadow-inner'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Quay lại trang bìa mở đầu"
              >
                <span>TRANG BÌA</span>
              </button>
              <button
                onClick={() => setCurrentView('student-journey')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  currentView === 'student-journey' || currentView === 'station-view'
                    ? 'bg-sky-100 text-sky-800 shadow-inner'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4 text-sky-600" />
                <span>HÀNH TRÌNH</span>
              </button>
              <button
                onClick={() => setCurrentView('student-passport')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  currentView === 'student-passport' ? 'bg-sky-100 text-sky-800 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>HỘ CHIẾU</span>
              </button>
              <button
                onClick={() => setCurrentView('student-maps')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  currentView === 'student-maps' ? 'bg-sky-100 text-sky-800 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MapIcon className="w-4 h-4 text-emerald-600" />
                <span>BẢN ĐỒ</span>
              </button>
              <button
                onClick={() => setCurrentView('student-memories')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  currentView === 'student-memories' ? 'bg-sky-100 text-sky-800 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>KỈ NIỆM</span>
              </button>
              <button
                onClick={() => setCurrentView('student-profile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  currentView === 'student-profile' ? 'bg-sky-100 text-sky-800 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4 text-indigo-500" />
                <span>HỒ SƠ</span>
              </button>
            </nav>
          ) : role === 'teacher' ? (
            <nav className="flex items-center gap-1 sm:gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                Cổng Giáo Viên
              </span>
            </nav>
          ) : null}
        </div>
      </header>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1 text-center">Chọn Vai Trò Trải Nghiệm</h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Chọn vai trò để khám phá:
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  logout();
                }}
                className={`flex items-center gap-4 p-3.5 rounded-2xl border text-left transition ${
                  role === 'student' ? 'border-sky-500 bg-sky-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">HỌC SINH (Tiểu học)</div>
                  <div className="text-xs text-slate-500">Trở về trang đầu để đăng nhập/chọn học sinh rõ ràng</div>
                </div>
              </button>

              <button
                onClick={async () => {
                  try { await enterTeacherDemo(); setShowRoleModal(false); }
                  catch (error) { alert((error as Error).message); }
                }}
                className={`flex items-center gap-4 p-3.5 rounded-2xl border text-left transition ${
                  role === 'teacher' ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">GIÁO VIÊN</div>
                  <div className="text-xs text-slate-500">Trải nghiệm giáo viên không cần đăng nhập</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowRoleModal(false);
                  logout();
                }}
                className={`flex items-center gap-4 p-3.5 rounded-2xl border text-left transition ${
                  role === 'admin' ? 'border-amber-500 bg-amber-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">QUẢN TRỊ</div>
                  <div className="text-xs text-slate-500">Quản lý giao diện, hình ảnh và học liệu</div>
                </div>
              </button>

            </div>

            {/* Grade Selector */}
            {(role !== 'student' || (currentUser as any)?.isGuest) && <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Đổi khối lớp:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(g => (
                  <button
                    key={g}
                    onClick={() => setCurrentGrade(g)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      currentGrade === g ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setCurrentView('landing');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-sky-600 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>← Trở về Trang bìa mở đầu</span>
              </button>
            </div>

            <button
              onClick={() => setShowRoleModal(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};
