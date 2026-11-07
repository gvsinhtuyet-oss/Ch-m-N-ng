import { StaffAccounts } from './StaffAccounts';
import { GddpAdminEditor } from './GddpAdminEditor';
import { ThemeEditor } from './ThemeEditor';
import { ContentEditor } from './ContentEditor';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OFFICIAL_25_CATALOG } from '../../data/curriculumCatalog';
import { authService } from '../../services/AuthService';
import { ImplementationRecord } from '../../types';
import { EffectivenessReport } from './EffectivenessReport';
import { ProposalInbox } from './ProposalInbox';
import { RealClassResults } from '../teacher/RealClassResults';
import {
  BarChart3, BookOpen, Calendar, CheckCircle2, ChevronDown, FileText, RefreshCw,
  LayoutDashboard, Menu, MessageSquareText, Settings,
} from 'lucide-react';

const adminGroups = [
  { label: 'Tổng quan', icon: LayoutDashboard, pages: [{ id: 'overview', label: 'Tổng quan' }] },
  { label: 'Dạy và học', icon: Calendar, pages: [
    { id: 'tracking', label: 'Nhật ký triển khai' }, { id: 'reports', label: 'Kết quả theo lớp' },
  ] },
  { label: 'Học liệu', icon: BookOpen, pages: [
    { id: 'stations', label: 'Quản lý 25 trạm' }, { id: 'gddp', label: 'Địa chỉ GDĐP' },
  ] },
  { label: 'Báo cáo', icon: BarChart3, pages: [
    { id: 'effectiveness', label: 'Hiệu quả sử dụng' }, { id: 'proposals', label: 'Đánh giá sao và góp ý' },
  ] },
  { label: 'Cài đặt', icon: Settings, pages: [
    { id: 'users', label: 'Tài khoản và quyền' }, { id: 'theme', label: 'Giao diện' },
    { id: 'assistant-qa', label: 'Kiểm định chatbot' },
  ] },
] as const;

type AdminPage = typeof adminGroups[number]['pages'][number]['id'];

const AssistantQualityDashboard = React.lazy(() => import('./AssistantQualityDashboard').then(module => ({ default: module.AssistantQualityDashboard })));

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminPage>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitle = useRef<HTMLHeadingElement>(null);
  const [feedbackStation, setFeedbackStation] = useState<string>();
  const [editorDirty, setEditorDirty] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<number>(0); // 0 = all

  const [implementations,setImplementations]=useState<ImplementationRecord[]>([]);
  const [counts,setCounts]=useState({teachers:0,active:0,classes:0,students:0,proposals:0,pending:0});
  const [workflowError,setWorkflowError]=useState('');
  const [loading,setLoading]=useState(true);
  const [readiness,setReadiness]=useState({implementations:false,classes:false,users:false,proposals:false});
  const load=async()=>{
    setLoading(true);setWorkflowError('');
    try {
      const [i,c,u,p]=await Promise.allSettled([
        authService.implementations(),authService.classes(),authService.users(),authService.proposals(),
      ]);
      const ok={implementations:i.status==='fulfilled',classes:c.status==='fulfilled',users:u.status==='fulfilled',proposals:p.status==='fulfilled'};
      setReadiness(ok);
      const records=i.status==='fulfilled'?i.value:[];
      const classes=c.status==='fulfilled'?c.value:[];
      const users=u.status==='fulfilled'?u.value:[];
      const proposals=p.status==='fulfilled'?p.value:[];
      setImplementations(records);
      const teachers=users.filter(user=>user.role==='teacher');
      setCounts({teachers:teachers.length,active:teachers.filter(user=>user.active).length,
        classes:classes.length,students:classes.reduce((n,room)=>n+room.totalStudents,0),
        proposals:proposals.length,pending:proposals.filter(item=>item.status==='pending').length});
      if(Object.values(ok).some(value=>!value))setWorkflowError('Một số chỉ số chưa tải được. Dữ liệu thiếu được hiển thị bằng dấu —; vui lòng thử Làm mới.');
    } catch(error){setWorkflowError((error as Error).message);}
    finally{setLoading(false);}
  };
  const showOverviewData = activeTab === 'overview' || activeTab === 'tracking';
  useEffect(()=>{void load();},[]);

  const recent = useMemo(() => [...implementations].sort((a, b) =>
    b.implementationDate.localeCompare(a.implementationDate)), [implementations]);
  const weekly = useMemo(() => {
    const dayMs = 86_400_000;
    const today = Math.floor((Date.now() + 7 * 3_600_000) / dayMs) * dayMs;
    const monday = today - ((new Date(today).getUTCDay() + 6) % 7) * dayMs;
    const counts = [0, 0, 0, 0, 0, 0];
    const first = monday - 35 * dayMs;
    for (const row of implementations) {
      const day = Date.parse(row.implementationDate.slice(0, 10));
      if (day >= first && day <= today) counts[Math.floor((day - first) / (7 * dayMs))]++;
    }
    return counts.map((count, index) => ({
      count,
      date: new Date(first + index * 7 * dayMs).toISOString().slice(0, 10),
    }));
  }, [implementations]);
  const [logPage, setLogPage] = useState(0);
  const journal = gradeFilter ? recent.filter(row => row.grade === gradeFilter) : recent;
  const pageSize = 12;
  const lastPage = Math.max(0, Math.ceil(journal.length / pageSize) - 1);
  const currentPage = Math.min(logPage, lastPage);

  const activeGroup = adminGroups.find(group => group.pages.some(page => page.id === activeTab))!;
  const activePage = activeGroup.pages.find(page => page.id === activeTab)!;

  const navigate = (page: AdminPage, stationId?: string, keepMenuOpen = false) => {
    if (activeTab === 'stations' && page !== 'stations' && editorDirty) {
      if (!window.confirm('Bạn đang có thay đổi học liệu chưa lưu. Rời trang và bỏ những thay đổi này?')) return;
      setEditorDirty(false);
    }
    setFeedbackStation(stationId);
    setActiveTab(page);
    setMenuOpen(keepMenuOpen);
    if (!keepMenuOpen) {
      pageTitle.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <div className="cham-staff admin-workspace mx-auto grid max-w-[1500px] gap-4 px-3 py-4 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6 lg:py-6">
      <aside className="admin-sidebar self-start rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-20">
        <div className="admin-sidebar-brand hidden px-3 py-3 lg:flex"><BookOpen className="h-5 w-5" aria-hidden="true" /><span>KHÔNG GIAN QUẢN TRỊ</span></div>
        <button type="button" className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 lg:hidden"
          aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(open => !open)}>
          <Menu className="h-5 w-5" aria-hidden="true" />
          Quản trị
          <span className="ml-auto text-xs font-medium text-slate-600">{activeGroup.label}</span>
          <ChevronDown className={`h-4 w-4 ${menuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <nav id="admin-navigation" aria-label="Điều hướng quản trị" className={`${menuOpen ? 'block' : 'hidden'} lg:block`}>
          <ul className="space-y-1">
            {adminGroups.map(group => {
              const Icon = group.icon;
              const isActive = group === activeGroup;
              const hasChildren = group.pages.length > 1;
              return <li key={group.label}>
                <button type="button" onClick={() => navigate(isActive ? activeTab : group.pages[0].id, isActive ? feedbackStation : undefined, hasChildren && menuOpen)}
                  aria-current={isActive ? (hasChildren ? 'true' : 'page') : undefined}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-bold ${isActive ? 'bg-orange-50 text-orange-900' : 'text-slate-700 hover:bg-slate-100'}`}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {group.label}
                </button>
                {isActive && hasChildren && <ul className="mb-2 ml-5 mt-1 space-y-1 border-l border-indigo-100 pl-2">
                  {group.pages.map(page => <li key={page.id}>
                    <button type="button" onClick={() => navigate(page.id)} aria-current={page.id === activeTab ? 'page' : undefined}
                      className={`min-h-10 w-full rounded-lg px-2 py-1.5 text-left text-sm ${page.id === activeTab ? 'bg-orange-50 font-semibold text-orange-900' : 'text-slate-700 hover:bg-slate-100'}`}>
                      {page.label}
                    </button>
                  </li>)}
                </ul>}
              </li>;
            })}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 space-y-4">
        <header className="admin-page-hero flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div>
            <p className="text-xs font-semibold text-sky-800">Quản trị CHẠM ĐÀ NẴNG · {activeGroup.label}</p>
            <h1 ref={pageTitle} tabIndex={-1} className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{activePage.label}</h1>
          </div>
          {showOverviewData && <button type="button" disabled={loading} onClick={() => void load()} className="staff-button">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />{loading ? 'Đang tải…' : 'Làm mới'}
          </button>}
        </header>
        {showOverviewData && workflowError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-800">{workflowError}</p>}
        {activeTab === 'assistant-qa' && <React.Suspense fallback={<p role="status" className="rounded-2xl bg-white p-5">Đang mở bảng kiểm định chatbot…</p>}><AssistantQualityDashboard /></React.Suspense>}
        {activeTab === 'proposals' && <ProposalInbox initialStationId={feedbackStation} />}
        {activeTab === 'effectiveness' && <EffectivenessReport
          openProgress={() => navigate('reports')}
          openFeedback={stationId => navigate('proposals', stationId)}
        />}
        {activeTab === 'theme' && <ThemeEditor />}
        {activeTab === 'gddp' && <GddpAdminEditor />}

        {activeTab === 'overview' && <div className="space-y-4">
          <section className="staff-hero rounded-2xl border border-sky-100 p-5 sm:p-6">
            <p className="text-xs font-bold text-sky-800">NĂM HỌC 2026–2027</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Bàn làm việc chuyên môn</h2>
            <p className="mt-1 text-sm text-slate-600">Theo dõi triển khai, kết quả lớp và học liệu toàn trường.</p>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Lối tắt quản trị">
              <button type="button" onClick={() => navigate('tracking')} className="staff-button staff-primary"><Calendar className="h-4 w-4" aria-hidden="true" />Xem nhật ký</button>
              <button type="button" onClick={() => navigate('reports')} className="staff-button"><FileText className="h-4 w-4" aria-hidden="true" />Kết quả lớp</button>
              <button type="button" onClick={() => navigate('proposals', '')} className="staff-button"><MessageSquareText className="h-4 w-4" aria-hidden="true" />Góp ý mới{readiness.proposals && counts.pending > 0 && <strong>({counts.pending})</strong>}</button>
              <button type="button" onClick={() => navigate('stations')} className="staff-button"><BookOpen className="h-4 w-4" aria-hidden="true" />Nội dung trạm</button>
            </div>
          </section>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {[
              ['Giáo viên', counts.teachers], ['Lớp học', counts.classes], ['Học sinh', counts.students],
              ['Trạm GDĐP', OFFICIAL_25_CATALOG.length], ['Lượt triển khai', implementations.length], ['Góp ý & đề xuất', counts.proposals],
            ].map(([label, value]) => <div key={label} className="staff-panel p-3">
              <dt className="text-xs font-semibold text-slate-600">{label}</dt>
              <dd className="mt-1 text-2xl font-black text-slate-900">{label === 'Trạm GDĐP' || (!loading && (label === 'Giáo viên' ? readiness.users : label === 'Lớp học' || label === 'Học sinh' ? readiness.classes : label === 'Lượt triển khai' ? readiness.implementations : readiness.proposals)) ? value : '—'}</dd>
            </div>)}
          </dl>
          <div className="grid gap-4 xl:grid-cols-2">
            <section className="staff-panel p-4 sm:p-5">
              <h2 className="font-bold">Triển khai 6 tuần gần nhất</h2>
              <p className="mt-1 text-xs text-slate-600">Mỗi dòng tính số bản ghi trong tuần bắt đầu vào thứ Hai.</p>
              {!loading && readiness.implementations && (weekly.some(row => row.count) ? <ul className="mt-4 space-y-2">
                {weekly.map(row => <li key={row.date} className="staff-bar-row">
                  <time dateTime={row.date}>{row.date.slice(5).split('-').reverse().join('/')}</time>
                  <progress aria-label={`Tuần bắt đầu ${row.date}`} value={row.count} max={Math.max(...weekly.map(item => item.count))} />
                  <strong>{row.count}</strong>
                </li>)}
              </ul> : <p className="staff-empty mt-4">Chưa có tiết dạy trong 6 tuần gần nhất.</p>)}
            </section>
            <section className="staff-panel p-4 sm:p-5">
              <h2 className="font-bold">Tiết dạy gần đây</h2>
              {!loading && readiness.implementations && (recent.length ? <ul className="mt-3 divide-y divide-slate-100">
                {recent.slice(0, 4).map(row => <li key={row.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <div className="min-w-0"><strong className="break-words">{row.stationName}</strong><p className="text-xs text-slate-600">{row.className} · {row.teacherName}</p></div>
                  <time className="text-xs text-slate-600">{row.implementationDate}</time>
                </li>)}
              </ul> : <p className="staff-empty mt-4">Chưa có nhật ký được lưu.</p>)}
            </section>
          </div>
        </div>}

        {activeTab === 'tracking' && <section className="staff-panel space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="font-bold">Sổ triển khai GDĐP</h2><p className="mt-1 text-sm text-slate-600">Mở từng tiết để xem giáo viên, hình thức tổ chức và ghi chú.</p></div>
            <label className="text-sm font-semibold">Khối lớp
              <select value={gradeFilter} onChange={event => {setGradeFilter(Number(event.target.value));setLogPage(0);}} className="staff-field">
                <option value={0}>Tất cả khối</option>
                {[1,2,3,4,5].map(grade => <option key={grade} value={grade}>Khối {grade}</option>)}
              </select>
            </label>
          </div>
          <button type="button" className="staff-button" onClick={() => navigate('reports')}>Xem kết quả theo lớp</button>
          {loading ? <p role="status">Đang tải nhật ký…</p> : readiness.implementations && !journal.length && <p className="staff-empty">Chưa ghi nhận tiết dạy trong khối đã chọn.</p>}
          {!loading && readiness.implementations && journal.length > 0 && <>
            <p className="text-sm text-slate-600">{journal.length} tiết đã ghi nhận</p>
            <div className="space-y-2">
              {journal.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map(row => <details key={row.id} className="rounded-xl border border-slate-200 bg-white">
                <summary className="cursor-pointer break-words p-3 text-sm">
                  <strong>{row.stationName}</strong>
                  <span className="ml-2 text-slate-600">{row.className} · {row.implementationDate}</span>
                </summary>
                <dl className="grid gap-2 border-t border-slate-100 p-3 text-sm sm:grid-cols-2">
                  <div><dt className="font-semibold">Giáo viên</dt><dd>{row.teacherName}</dd></div>
                  <div><dt className="font-semibold">Buổi / tiết</dt><dd>{row.session}</dd></div>
                  <div><dt className="font-semibold">Hình thức</dt><dd>{row.method}</dd></div>
                  <div><dt className="font-semibold">Trạng thái</dt><dd className="text-emerald-800">Đã xác nhận</dd></div>
                  <div className="sm:col-span-2"><dt className="font-semibold">Ghi chú</dt><dd className="whitespace-pre-wrap break-words">{row.note || '—'}</dd></div>
                </dl>
              </details>)}
            </div>
            {lastPage > 0 && <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="staff-button" disabled={currentPage === 0} onClick={() => setLogPage(currentPage - 1)}>Trang trước</button>
              <span className="text-sm">Trang {currentPage + 1}/{lastPage + 1}</span>
              <button type="button" className="staff-button" disabled={currentPage === lastPage} onClick={() => setLogPage(currentPage + 1)}>Trang sau</button>
            </div>}
          </>}
        </section>}

        {activeTab === 'stations' && <ContentEditor onDirtyChange={setEditorDirty} />}

        {activeTab === 'users' && <StaffAccounts />}

        {/* TAB 5: BÁO CÁO */}
        {activeTab === 'reports' && <RealClassResults />}
      </div>
    </div>
  );
};

