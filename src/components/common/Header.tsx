import { AppFullscreenButton } from './AppFullscreen';
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { MusicControl } from './MusicControl';
import { PWAInstallButton } from './PWAInstallButton';
import { StaffPassword } from './StaffPassword';
import { Wifi, WifiOff, User, Compass, Award, Heart, Map as MapIcon, Home, BookOpen, ChevronDown, LogOut, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, role, isOnline, currentView, currentGrade, setCurrentGrade, setCurrentView, logout, t } = useApp();
  const student = role === 'student';
  const adminArea = role === 'admin' && currentView === 'admin-view';
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
  return <header className={`app-touch-header sticky top-0 z-40 border-b border-orange-100 bg-[#fffdf9]/95 shadow-sm backdrop-blur-xl ${adminArea ? 'cham-admin-topbar' : ''}`}>
    <div className={`header-bar-inner mx-auto flex ${adminArea ? 'h-[60px]' : currentView === 'station-view' ? 'h-[52px] sm:h-[56px]' : 'h-[68px]'} max-w-[1500px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6`}>
      <button type="button" onClick={() => setCurrentView(home)} className="header-brand flex min-w-0 items-center gap-2.5 text-left" aria-label="CHẠM ĐÀ NẴNG – trang chính">
        <span className="header-brand-icon flex h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-blue-600 shadow-sm" aria-hidden="true"><img src="/cham-brand-icon.svg" alt="" width="40" height="40" className="h-full w-full object-cover" loading="eager" /></span>
        <span className="header-brand-copy block min-w-0"><span className="header-brand-title block whitespace-nowrap text-base font-black tracking-tight text-orange-600 lg:text-lg">CHẠM ĐÀ NẴNG</span><span className="header-brand-subtitle hidden truncate text-[10px] font-medium text-slate-500 sm:block">{adminArea ? "Hệ thống quản trị giáo dục địa phương" : t.schoolName}</span></span>
      </button>
      {!adminArea && <nav aria-label="Điều hướng chính" className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto rounded-2xl bg-orange-50/70 p-1 lg:flex">{nav.map(item => {
        const Icon = item.icon; const active = currentView === item.view || (item.view === 'student-journey' && currentView === 'station-view');
        return <button type="button" key={item.view} onClick={() => setCurrentView(item.view)} className={`flex shrink-0 items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold transition ${active ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-600 hover:bg-white'}`}><Icon className="h-4 w-4" />{item.label}</button>;
      })}</nav>}
      <div className="header-actions flex shrink-0 items-center gap-1.5 sm:gap-2">
        {adminArea ? <details className="header-role-switch-menu relative">
          <summary aria-label="Xem giao diện Giáo viên hoặc Học sinh" className="header-role-switch flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-white/50 bg-white/15 px-3 text-sm font-bold text-white [&::-webkit-details-marker]:hidden">
            <Compass className="h-4 w-4"/><span className="header-role-switch-full">Xem giao diện</span><span className="header-role-switch-short hidden">Xem</span><ChevronDown className="h-4 w-4"/>
          </summary>
          <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-sky-100 bg-white p-2 text-blue-950 shadow-xl">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold hover:bg-blue-50"><Home className="h-4 w-4"/>Học sinh</a>
            <a href="/teacher-preview.html" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold hover:bg-blue-50"><BookOpen className="h-4 w-4"/>Giáo viên <span className="ml-auto text-xs text-slate-500">Demo</span></a>
          </div>
        </details> : <>
          <span title={isOnline ? t.online : t.offline} className={`hidden items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold md:flex ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}<span className="hidden lg:inline">{isOnline ? t.online : t.offline}</span></span>
        </>}
        {student && <span className="hidden rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700 sm:block">Khối {currentGrade}</span>}
        {!adminArea && <div className="header-audio-control"><MusicControl /></div>}
        <button type="button" className="header-touch-assistant rounded-xl border border-sky-200 bg-sky-50 px-2 text-xs font-bold text-sky-900" aria-label="Mở Trợ lý khám phá Đà Nẵng" onClick={()=>window.dispatchEvent(new Event('cham-open-assistant'))}><Sparkles className="header-assistant-icon h-4 w-4" aria-hidden="true"/><span className="header-assistant-label">Trợ lý</span></button>
        <details className="header-account-menu relative">
          <summary className="header-account-toggle flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-full border border-orange-200 bg-white px-2.5 text-xs font-bold text-slate-700 hover:bg-orange-50 [&::-webkit-details-marker]:hidden" aria-label="Menu tài khoản"><User className="h-4 w-4 text-orange-600" /><span className="header-account-name hidden max-w-28 truncate md:block">{name}</span><ChevronDown className="header-account-chevron h-3.5 w-3.5" /></summary>
          <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-orange-100 bg-white p-3 shadow-xl">
            <div className="mb-2 border-b border-slate-100 px-2 pb-3"><p className="truncate text-sm font-bold text-slate-800">{name}</p><p className="mt-1 text-xs text-slate-500">{roleLabel}{student ? ` · Khối ${currentGrade}` : ''}</p></div>
            {adminArea ? <>
              <button type="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50" onClick={event => {
                event.currentTarget.closest('details')?.removeAttribute('open');
                window.dispatchEvent(new Event('cham-open-assistant'));
              }}>Mở Trợ lý khám phá</button>
            </> : nav.map(item => <button type="button" key={item.view} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50" onClick={e => { e.currentTarget.closest('details')?.removeAttribute('open'); setCurrentView(item.view); }}>{item.label}</button>)}
            {student && <button type="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-orange-50" onClick={e => {e.currentTarget.closest('details')?.removeAttribute('open');setCurrentView('student-profile');}}>Hồ sơ của em</button>}
            {!student && <div className="my-2 border-t border-slate-100 px-2 pt-3"><p className="mb-2 text-xs font-semibold text-slate-500">Chọn khối lớp</p><div className="flex gap-1.5">{[1,2,3,4,5].map(grade => <button type="button" key={grade} onClick={()=>setCurrentGrade(grade)} aria-pressed={currentGrade===grade} className={`h-8 w-8 rounded-lg text-xs font-bold ${currentGrade===grade ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>{grade}</button>)}</div></div>}
            <AppFullscreenButton className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50" />
            <StaffPassword />
            <div className="px-2 py-1"><PWAInstallButton /></div>
            <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" />{student ? 'Thoát hành trình' : 'Đăng xuất'}</button>
          </div>
        </details>
      </div>
    </div>
  </header>;
};
