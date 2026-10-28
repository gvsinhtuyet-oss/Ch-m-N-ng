import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { MusicControl } from './MusicControl';
import { PWAInstallButton } from './PWAInstallButton';
import { StaffPassword } from './StaffPassword';
import { Globe, Wifi, WifiOff, User, Compass, Award, Heart, Map as MapIcon, Home, ChevronDown, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, role, isOnline, language, currentView, currentGrade, setCurrentGrade, toggleLanguage, setCurrentView, logout, t } = useApp();
  const student = role === 'student';
  const name = (currentUser as { displayName?: string } | null)?.displayName || currentUser?.name || 'Nhà phiêu lưu';
  const roleLabel = student ? 'Nhà phiêu lưu' : role === 'teacher' ? 'Giáo viên' : 'Quản trị';
  const home = student ? 'student-journey' : role === 'teacher' ? 'teacher-view' : 'admin-view';
  const nav = [
    { label: 'Trang chủ', icon: Home, view: 'landing' },
    { label: 'Hành trình', icon: Compass, view: 'student-journey' },
    { label: 'Hộ chiếu', icon: Award, view: 'student-passport' },
    { label: 'Bản đồ', icon: MapIcon, view: 'student-maps' },
    { label: 'Bộ sưu tập', icon: Heart, view: 'student-memories' },
  ] as const;
  return <header className="sticky top-0 z-40 border-b border-orange-100 bg-[#fffdf9]/95 shadow-sm backdrop-blur-xl">
    <div className={`mx-auto flex ${currentView === 'station-view' ? 'h-[52px] sm:h-[56px]' : 'h-[68px]'} max-w-[1500px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6`}>
      <button type="button" onClick={() => setCurrentView(home)} className="flex min-w-0 items-center gap-2.5 text-left" aria-label="CHẠM ĐÀ NẴNG – trang chính">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-md shadow-orange-200/60"><Compass className="h-6 w-6" /></span>
        <span className="hidden min-w-0 sm:block"><span className="block whitespace-nowrap text-base font-black tracking-tight text-orange-600 lg:text-lg">CHẠM ĐÀ NẴNG</span><span className="block truncate text-[10px] font-medium text-slate-500">{t.schoolName}</span></span>
      </button>
      {<nav aria-label="Điều hướng chính" className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto rounded-2xl bg-orange-50/70 p-1 lg:flex">{nav.map(item => {
        const Icon = item.icon; const active = currentView === item.view || (item.view === 'student-journey' && currentView === 'station-view');
        return <button type="button" key={item.view} onClick={() => setCurrentView(item.view)} className={`flex shrink-0 items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold transition ${active ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-600 hover:bg-white'}`}><Icon className="h-4 w-4" />{item.label}</button>;
      })}</nav>}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <span title={isOnline ? t.online : t.offline} className={`hidden items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold md:flex ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}<span className="hidden lg:inline">{isOnline ? t.online : t.offline}</span></span>
        <button type="button" onClick={toggleLanguage} aria-label="Đổi ngôn ngữ VI / EN" className="flex h-9 items-center gap-1 rounded-full px-2 text-xs font-bold text-slate-600 hover:bg-orange-50"><Globe className="h-4 w-4" />{language.toUpperCase()}</button>
        {student && <span className="hidden rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700 sm:block">Khối {currentGrade}</span>}
        <MusicControl />
        <details className="relative">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-full border border-orange-200 bg-white px-2.5 text-xs font-bold text-slate-700 hover:bg-orange-50 [&::-webkit-details-marker]:hidden" aria-label="Menu tài khoản"><User className="h-4 w-4 text-orange-600" /><span className="hidden max-w-28 truncate md:block">{student ? name : roleLabel}</span><ChevronDown className="h-3.5 w-3.5" /></summary>
          <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-orange-100 bg-white p-3 shadow-xl">
            <div className="mb-2 border-b border-slate-100 px-2 pb-3"><p className="truncate text-sm font-bold text-slate-800">{name}</p><p className="mt-1 text-xs text-slate-500">{roleLabel}{student ? ` · Khối ${currentGrade}` : ''}</p></div>
            {nav.map(item => <button type="button" key={item.view} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50" onClick={e => { e.currentTarget.closest('details')?.removeAttribute('open'); setCurrentView(item.view); }}>{item.label}</button>)}
            {student && <button type="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-orange-50" onClick={e => {e.currentTarget.closest('details')?.removeAttribute('open');setCurrentView('student-profile');}}>Hồ sơ của em</button>}
            {!student && <div className="my-2 border-t border-slate-100 px-2 pt-3"><p className="mb-2 text-xs font-semibold text-slate-500">Chọn khối lớp</p><div className="flex gap-1.5">{[1,2,3,4,5].map(grade => <button type="button" key={grade} onClick={()=>setCurrentGrade(grade)} aria-pressed={currentGrade===grade} className={`h-8 w-8 rounded-lg text-xs font-bold ${currentGrade===grade ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>{grade}</button>)}</div></div>}
            <StaffPassword />
            <div className="px-2 py-1"><PWAInstallButton /></div>
            <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" />{student ? 'Thoát hành trình' : 'Đăng xuất'}</button>
          </div>
        </details>
      </div>
    </div>
  </header>;
};
