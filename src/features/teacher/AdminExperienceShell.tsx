import React, { useRef, useState } from 'react';
import {
  BarChart3, BookOpen, Calendar, ChevronDown, LayoutDashboard, Menu,
  MessageSquareText, Settings,
} from 'lucide-react';

/**
 * Match the real AdminDashboard information architecture and CSS hooks.
 * This shell only accepts local ReactNode panels; it never mounts the privileged
 * AdminDashboard, its authService queries or privileged API-powered children.
 */
export const experienceAdminGroups = [
  { label: 'Tổng quan', icon: LayoutDashboard, pages: [{ id: 'overview', label: 'Tổng quan' }] },
  { label: 'Dạy và học', icon: Calendar, pages: [
    { id: 'tracking', label: 'Nhật ký triển khai' },
    { id: 'reports', label: 'Kết quả theo lớp' },
  ] },
  { label: 'Học liệu', icon: BookOpen, pages: [
    { id: 'stations', label: 'Quản lý 25 trạm' },
    { id: 'gddp', label: 'Địa chỉ GDĐP' },
  ] },
  { label: 'Báo cáo', icon: BarChart3, pages: [
    { id: 'effectiveness', label: 'Hiệu quả sử dụng' },
    { id: 'proposals', label: 'Đánh giá sao và góp ý' },
  ] },
  { label: 'Cài đặt', icon: Settings, pages: [
    { id: 'users', label: 'Tài khoản và quyền' },
    { id: 'theme', label: 'Giao diện' },
    { id: 'assistant-qa', label: 'Kiểm định chatbot' },
  ] },
] as const;

export type AdminExperiencePage = typeof experienceAdminGroups[number]['pages'][number]['id'];

type Props = {
  activePage: AdminExperiencePage;
  onPageChange: (page: AdminExperiencePage) => void;
  pages: Record<AdminExperiencePage, React.ReactNode>;
};

export const AdminExperienceShell: React.FC<Props> = ({ activePage, onPageChange, pages }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const activeGroup = experienceAdminGroups.find(group => group.pages.some(p => p.id === activePage))!;
  const active = activeGroup.pages.find(page => page.id === activePage)!;
  const navigate = (page: AdminExperiencePage, keepMenuOpen = false) => {
    onPageChange(page);
    setMenuOpen(keepMenuOpen);
    if (!keepMenuOpen) {
      requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
    }
  };

  return <div className="cham-staff admin-workspace mx-auto grid max-w-[1500px] gap-4 px-3 py-4 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6 lg:py-6">
    <aside className="admin-sidebar self-start rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-20">
      <button type="button" className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 lg:hidden"
        aria-expanded={menuOpen} aria-controls="admin-experience-navigation"
        onClick={() => setMenuOpen(value => !value)}>
        <Menu className="h-5 w-5" aria-hidden="true" />
        Quản trị
        <span className="ml-auto text-xs font-medium text-slate-600">{activeGroup.label}</span>
        <ChevronDown className={'h-4 w-4 ' + (menuOpen ? 'rotate-180' : '')} />
      </button>
      <nav id="admin-experience-navigation" aria-label="Điều hướng Quản trị trải nghiệm"
        className={(menuOpen ? 'block' : 'hidden') + ' lg:block'}>
        <ul className="space-y-1">
          {experienceAdminGroups.map(group => {
            const Icon = group.icon;
            const isActive = group === activeGroup;
            const hasChildren = group.pages.length > 1;
            return <li key={group.label}>
              <button type="button"
                onClick={() => navigate(isActive ? activePage : group.pages[0].id, hasChildren && menuOpen)}
                aria-current={isActive ? (hasChildren ? 'true' : 'page') : undefined}
                className={'flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-bold ' +
                  (isActive ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100')}>
                <Icon className="h-4 w-4 shrink-0" />
                {group.label}
              </button>
              {isActive && hasChildren &&
                <ul className="mb-2 ml-5 mt-1 space-y-1 border-l border-indigo-100 pl-2">
                  {group.pages.map(page => <li key={page.id}>
                    <button type="button" onClick={() => navigate(page.id)}
                      aria-current={activePage === page.id ? 'page' : undefined}
                      className={'min-h-10 w-full rounded-lg px-2 py-1.5 text-left text-sm ' +
                        (activePage === page.id ? 'bg-indigo-50 font-semibold text-indigo-900' : 'text-slate-700 hover:bg-slate-100')}>
                      {page.label}
                    </button>
                  </li>)}
                </ul>}
            </li>;
          })}
        </ul>
      </nav>
      <p className="hidden border-t border-slate-100 px-3 py-3 text-xs leading-relaxed text-amber-900 lg:block">
        Chế độ trải nghiệm · Các chỉ số và thay đổi chỉ lưu trên thiết bị
      </p>
    </aside>
    <div className="min-w-0 space-y-4">
      <header className="admin-page-hero rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
        <p className="text-xs font-semibold text-indigo-800">
          Quản trị CHẠM ĐÀ NẴNG · Trải nghiệm
          {activeGroup.label !== active.label && ' · ' + activeGroup.label}
        </p>
        <h1 ref={title} tabIndex={-1} className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{active.label}</h1>
      </header>
      <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-950">
        DỮ LIỆU MINH HỌA · Chế độ cục bộ, không phản ánh lượt truy cập thật và không sử dụng quyền Admin thực
      </p>
      {pages[activePage]}
    </div>
  </div>;
};
