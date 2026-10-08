import { MusicControl } from './MusicControl';
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Globe,
  Wifi,
  WifiOff,
  User,
  Compass,
  Award,
  Heart,
  Presentation,
  Map as MapIcon,
  Home,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    role,
    isOnline,
    language,
    currentView,
    currentGrade,
    setCurrentGrade,
    toggleLanguage,
    setCurrentView,
    logout,
    enterTeacherDemo,
    t,
  } = useApp();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const studentHeader = role === 'student';
  const studentName =
    (currentUser as { displayName?: string; avatar?: string; isGuest?: boolean } | null)?.displayName ||
    currentUser?.name ||
    'Nhà phiêu lưu';
  const studentAvatar = (currentUser as { avatar?: string } | null)?.avatar;

  const studentNav = [
    { label: 'Trang chủ', icon: Home, view: 'landing', active: currentView === 'landing', iconClass: 'text-orange-500' },
    {
      label: 'Hành trình',
      icon: Compass,
      view: 'student-journey',
      active: currentView === 'student-journey' || currentView === 'station-view',
      iconClass: 'text-orange-500',
    },
    { label: 'Hộ chiếu', icon: Award, view: 'student-passport', active: currentView === 'student-passport', iconClass: 'text-orange-500' },
    { label: 'Bản đồ', icon: MapIcon, view: 'student-maps', active: currentView === 'student-maps', iconClass: 'text-orange-500' },
    { label: 'Bộ sưu tập', icon: Heart, view: 'student-memories', active: currentView === 'student-memories', iconClass: 'text-orange-500' },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-orange-100/70 bg-white/92 shadow-sm backdrop-blur-xl">
        {!studentHeader && (
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 border-b border-slate-100/80 px-3 py-2 text-xs sm:px-6">
            <div className="flex items-center gap-2">
              <span className="hidden font-semibold text-slate-500 sm:inline">{t.schoolName}</span>
              <span className="hidden text-slate-300 sm:inline">|</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                {t.verifiedSource}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  isOnline ? 'border border-sky-200 bg-sky-50 text-sky-700' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isOnline ? <Wifi className="h-3 w-3 text-sky-600" /> : <WifiOff className="h-3 w-3 text-amber-600" />}
                <span>{isOnline ? t.online : t.offline}</span>
              </div>

              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                title="Đổi ngôn ngữ VI | EN"
              >
                <Globe className="h-3.5 w-3.5 text-sky-600" />
                <span>{language.toUpperCase()}</span>
              </button>

              <MusicControl />
              <PWAInstallButton />

              <button
                onClick={() => setShowRoleModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-medium text-white shadow-xs transition hover:bg-orange-600"
              >
                <User className="h-3 w-3" />
                <span className="font-bold">{role === 'teacher' ? 'Giáo viên' : 'Quản trị'}</span>
              </button>
            </div>
          </div>
        )}

        {studentHeader ? (
          <div className="mx-auto flex min-h-[58px] max-w-[1500px] items-center gap-3.5 px-3 py-2.5 sm:px-5 lg:px-7">
            <button
              type="button"
              onClick={() => setCurrentView('student-journey')}
              className="flex shrink-0 items-center gap-2.5 text-left"
              title="CHẠM ĐÀ NẴNG"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-amber-300 to-sky-500 p-[2px] shadow-md shadow-orange-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <Compass className="h-6.5 w-6.5 text-orange-500" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="whitespace-nowrap text-[19px] font-black leading-none tracking-tight text-slate-900 lg:text-[20px]">
                  <span className="text-sky-700">CHẠM</span> <span className="text-orange-600">ĐÀ NẴNG</span>
                </div>
                <div className="mt-1 whitespace-nowrap text-[10px] font-semibold tracking-[0.01em] text-slate-500 lg:text-[10.5px]">
                  Hành trình số khám phá quê hương
                </div>
              </div>
            </button>

            <nav className="mx-auto flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto rounded-[1.15rem] border border-slate-100/90 bg-white/90 p-1.5 shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
              {studentNav.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setCurrentView(item.view as any)}
                    className={`group flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-extrabold transition sm:px-3.5 lg:text-[13px] ${
                      item.active
                        ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 shadow-sm ring-1 ring-orange-200'
                        : 'text-orange-700/90 hover:bg-orange-50 hover:text-orange-800'
                    }`}
                  >
                    <Icon className={`h-[17px] w-[17px] ${
                      item.active ? 'text-orange-500' : item.iconClass
                    }`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden md:block">
                <MusicControl />
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(true)}
                className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-2.5 py-2 shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
                title="Tài khoản học sinh"
              >
                {studentAvatar ? (
                  <img
                    src={studentAvatar}
                    alt={studentName}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-orange-100"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-sm font-black text-orange-700 ring-2 ring-orange-100">
                    {studentName.trim().charAt(0).toUpperCase() || 'N'}
                  </div>
                )}
                <span className="hidden max-w-[150px] truncate text-[12px] font-black text-slate-800 lg:block">{studentName}</span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 py-2.5 sm:px-6">
            <div
              onClick={() => {
                if (role === 'admin') setCurrentView('admin-view');
                else setCurrentView('teacher-view');
              }}
              className="group flex cursor-pointer items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-300 p-0.5 shadow-md shadow-orange-500/20 transition group-hover:scale-105 sm:h-11 sm:w-11">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-900">
                  <Compass className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-700 bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl">
                    CHẠM ĐÀ NẴNG
                  </span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">Khối {currentGrade}</span>
                </div>
                <p className="hidden text-[11px] font-medium text-slate-500 sm:block">Hành trình số khám phá quê hương</p>
              </div>
            </div>

            {role === 'teacher' && (
              <nav className="flex items-center gap-1 sm:gap-2">
                <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  Cổng Giáo Viên
                </span>
              </nav>
            )}
          </div>
        )}
      </header>

      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <h3 className="mb-1 text-center text-lg font-extrabold text-slate-900">Chọn Vai Trò Trải Nghiệm</h3>
            <p className="mb-6 text-center text-xs text-slate-500">Chọn vai trò để khám phá:</p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  logout();
                }}
                className={`flex items-center gap-4 rounded-2xl border p-3.5 text-left transition ${
                  role === 'student' ? 'border-sky-500 bg-sky-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 font-bold text-sky-600">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">HỌC SINH (Tiểu học)</div>
                  <div className="text-xs text-slate-500">Trở về trang đầu để đăng nhập/chọn học sinh rõ ràng</div>
                </div>
              </button>

              <button
                onClick={async () => {
                  try {
                    await enterTeacherDemo();
                    setShowRoleModal(false);
                  } catch (error) {
                    alert((error as Error).message);
                  }
                }}
                className={`flex items-center gap-4 rounded-2xl border p-3.5 text-left transition ${
                  role === 'teacher' ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-600">
                  <Presentation className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">GIÁO VIÊN</div>
                  <div className="text-xs text-slate-500">Trải nghiệm giáo viên không cần đăng nhập</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowRoleModal(false);
                  logout();
                }}
                className={`flex items-center gap-4 rounded-2xl border p-3.5 text-left transition ${
                  role === 'admin' ? 'border-amber-500 bg-amber-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">QUẢN TRỊ</div>
                  <div className="text-xs text-slate-500">Quản lý giao diện, hình ảnh và học liệu</div>
                </div>
              </button>
            </div>

            {(role !== 'student' || (currentUser as any)?.isGuest) && (
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-600">Đổi khối lớp:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(g => (
                    <button
                      key={g}
                      onClick={() => setCurrentGrade(g)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                        currentGrade === g ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setCurrentView('landing');
                }}
                className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-sky-600"
              >
                <span>← Trở về Trang chủ</span>
              </button>
            </div>

            <button
              onClick={() => setShowRoleModal(false)}
              className="mt-3 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};
