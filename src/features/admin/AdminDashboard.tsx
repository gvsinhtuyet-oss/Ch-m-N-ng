import { StaffAccounts } from './StaffAccounts';
import { GddpAdminEditor } from './GddpAdminEditor';
import { ThemeEditor } from './ThemeEditor';
import { ContentEditor } from './ContentEditor';
import React, { useEffect, useRef, useState } from 'react';
import { authService } from '../../services/AuthService';
import { ImplementationRecord } from '../../types';
import { EffectivenessReport } from './EffectivenessReport';
import { ProposalInbox } from './ProposalInbox';
import { RealClassResults } from '../teacher/RealClassResults';
import {
  BarChart3, BookOpen, Calendar, CheckCircle2, ChevronDown, FileText, Filter,
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
  const [editorDirty,setEditorDirty] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<number>(0); // 0 = all

  const [implementations,setImplementations]=useState<ImplementationRecord[]>([]);
  const [counts,setCounts]=useState({teachers:0,active:0,classes:0,students:0,proposals:0,pending:0});
  const [available,setAvailable]=useState({implementations:false,classes:false,users:false,proposals:false});
  const [workflowError,setWorkflowError]=useState('');
  const [loading,setLoading]=useState(false);
  const [healthLoading,setHealthLoading]=useState(false);
  const [health,setHealth]=useState<{connected:boolean;ready:boolean;writable:boolean}|null>(null);
  const checkHealth=async()=>{
    setHealthLoading(true);
    try {
      const status=await authService.health();
      setHealth({
        connected:status.firestore==='connected',
        ready:status.auth?.ready===true,
        writable:status.firestoreWrite==='connected',
      });
    } catch {
      setHealth({connected:false,ready:false,writable:false});
    } finally {setHealthLoading(false);}
  };
  const load=async()=>{
    setLoading(true);setWorkflowError('');
    // An unavailable endpoint must not hide the other successfully loaded reports,
    // or turn unknown school data into a misleading zero.
    const [implementationResult,classResult,userResult,proposalResult]=await Promise.allSettled([
      authService.implementations(),authService.classes(),authService.users(),authService.proposals(),
    ]);
    const ready={
      implementations:implementationResult.status==='fulfilled',
      classes:classResult.status==='fulfilled',
      users:userResult.status==='fulfilled',
      proposals:proposalResult.status==='fulfilled',
    };
    setAvailable(ready);
    const unavailable:string[]=[];
    if(implementationResult.status==='fulfilled')setImplementations(implementationResult.value);
    else {setImplementations([]);unavailable.push('nhật ký triển khai');}
    if(classResult.status==='fulfilled')setCounts(prev=>({...prev,classes:classResult.value.length,students:classResult.value.reduce((sum,room)=>sum+room.totalStudents,0)}));
    else unavailable.push('danh sách lớp');
    if(userResult.status==='fulfilled'){
      const teachers=userResult.value.filter(user=>user.role==='teacher');
      setCounts(prev=>({...prev,teachers:teachers.length,active:teachers.filter(user=>user.active).length}));
    }else unavailable.push('tài khoản giáo viên');
    if(proposalResult.status==='fulfilled')setCounts(prev=>({...prev,proposals:proposalResult.value.length,pending:proposalResult.value.filter(record=>record.status==='pending').length}));
    else unavailable.push('góp ý và đề xuất');
    setWorkflowError(unavailable.length
      ? 'Chưa tải được: '+unavailable.join(', ')+'. Các chỉ số chưa xác minh hiển thị “—”, không tính là 0.'
      : '');
    setLoading(false);
  };
  const showOverviewData = activeTab === 'overview' || activeTab === 'tracking';
  useEffect(()=>{if(showOverviewData)void load();},[activeTab]);
  useEffect(()=>{if(activeTab==='overview')void checkHealth();},[activeTab]);

  const filteredImplementations = gradeFilter === 0
    ? implementations
    : implementations.filter(i => i.grade === gradeFilter);

  const activeGroup = adminGroups.find(group => group.pages.some(page => page.id === activeTab))!;
  const activePage = activeGroup.pages.find(page => page.id === activeTab)!;

  const navigate = (page: AdminPage, stationId?: string, keepMenuOpen = false) => {
    if (activeTab==='stations' && page!=='stations' && editorDirty &&
        !window.confirm('Bạn có nội dung trạm chưa lưu. Rời trang sẽ bỏ các chỉnh sửa đó. Vẫn tiếp tục?')) return;
    setFeedbackStation(stationId);
    setActiveTab(page);
    setMenuOpen(keepMenuOpen);
    if (!keepMenuOpen) {
      pageTitle.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  useEffect(()=>{
    const openPage=(event:Event)=>{
      const page=(event as CustomEvent<{page:string}>).detail?.page;
      if(page==='assistant-qa'||page==='effectiveness'||page==='reports')navigate(page);
    };
    window.addEventListener('cham-admin-open-page',openPage);
    return()=>window.removeEventListener('cham-admin-open-page',openPage);
  },[activeTab,editorDirty]);

  return (
    <div className="cham-staff admin-workspace mx-auto grid max-w-[1500px] gap-4 px-3 py-4 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6 lg:py-6">
      <aside className="admin-sidebar self-start rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-20">
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
                  className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-bold ${isActive ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'}`}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {group.label}
                </button>
                {isActive && hasChildren && <ul className="mb-2 ml-5 mt-1 space-y-1 border-l border-indigo-100 pl-2">
                  {group.pages.map(page => <li key={page.id}>
                    <button type="button" onClick={() => navigate(page.id)} aria-current={page.id === activeTab ? 'page' : undefined}
                      className={`min-h-10 w-full rounded-lg px-2 py-1.5 text-left text-sm ${page.id === activeTab ? 'bg-indigo-50 font-semibold text-indigo-900' : 'text-slate-700 hover:bg-slate-100'}`}>
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
        <header className="admin-page-hero rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
          <p className="text-xs font-semibold text-indigo-800">Quản trị CHẠM ĐÀ NẴNG{activeGroup.label !== activePage.label && ` · ${activeGroup.label}`}</p>
          <h1 ref={pageTitle} tabIndex={-1} className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{activePage.label}</h1>
        </header>

        {showOverviewData && <>
          {workflowError&&<p role="alert" className="bg-rose-50 text-rose-700 rounded-xl p-3">{workflowError}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={loading} onClick={()=>void load()} className="border rounded-xl bg-white px-4 py-2 text-sm font-semibold">{loading?'Đang tải dữ liệu…':'Làm mới dữ liệu máy chủ'}</button>
            {activeTab==='overview' && <button type="button" disabled={healthLoading} onClick={()=>void checkHealth()} className="border rounded-xl bg-white px-4 py-2 text-sm font-semibold">{healthLoading?'Đang kiểm tra kết nối…':'Kiểm tra kết nối máy chủ'}</button>}
          </div>
        </>}
        {activeTab === 'assistant-qa' && <React.Suspense fallback={<p role="status" className="rounded-2xl bg-white p-5">Đang mở bảng kiểm định chatbot…</p>}><AssistantQualityDashboard /></React.Suspense>}
        {activeTab === 'proposals' && <ProposalInbox initialStationId={feedbackStation} />}
        {activeTab === 'effectiveness' && <EffectivenessReport
          openProgress={() => navigate('reports')}
          openFeedback={stationId => navigate('proposals', stationId)}
        />}
        {activeTab === 'theme' && <ThemeEditor />}
        {activeTab === 'gddp' && <GddpAdminEditor />}

        {/* TAB 1: TỔNG QUAN */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Tổng Quan Toàn Trường (Năm học 2026–2027)</h2>
              <span role="status" className={`px-2.5 py-1 rounded-full text-xs font-bold ${health?.connected && health.ready && health.writable ? 'bg-emerald-100 text-emerald-800' : !health || healthLoading ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-800'}`}>
                {!health || healthLoading ? 'Đang kiểm tra kho dữ liệu' : health.connected && health.ready && health.writable ? 'Kho dữ liệu: sẵn sàng' : 'Kho dữ liệu: cần kiểm tra'}
              </span>
            </div>

            <div aria-label="Lối tắt quản trị" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <button type="button" onClick={() => navigate('reports')} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-indigo-900 hover:bg-indigo-50">
                <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />Xem kết quả lớp
              </button>
              <button type="button" onClick={() => navigate('proposals', '')} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-indigo-900 hover:bg-indigo-50">
                <MessageSquareText className="h-4 w-4 shrink-0" aria-hidden="true" />Xem góp ý mới
                {!loading && available.proposals && counts.pending > 0 && <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900" aria-label={`${counts.pending} góp ý chờ xử lý`}>{counts.pending}</span>}
              </button>
              <button type="button" onClick={() => navigate('stations')} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-indigo-900 hover:bg-indigo-50">
                <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />Sửa nội dung trạm
              </button>
              <button type="button" onClick={() => navigate('effectiveness')} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-indigo-900 hover:bg-indigo-50">
                <BarChart3 className="h-4 w-4 shrink-0" aria-hidden="true" />Xem biểu đồ hiệu quả
              </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Giáo viên</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{loading?'…':available.users?counts.teachers:'—'}</div>
                <span className="text-[10px] text-emerald-600 font-semibold">{available.users?counts.active.toLocaleString('vi-VN'):'—'} tài khoản đang hoạt động</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Lớp học</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{loading?'…':available.classes?counts.classes:'—'}</div>
                <span className="text-[10px] text-slate-500">Khối 1 đến Khối 5</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Học sinh</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{loading?'…':available.classes?counts.students:'—'}</div>
                <span className="text-[10px] text-sky-600 font-semibold">Theo danh sách lớp đã lưu</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Trạm GDĐP</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">25</div>
                <span className="text-[10px] text-emerald-600 font-semibold">5 trạm / khối</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Lượt triển khai</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{loading?'…':available.implementations?implementations.length:'—'}</div>
                <span className="text-[10px] text-slate-500">Nhật ký đã được máy chủ lưu</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Đề xuất học liệu</span>
                <div className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">{loading?'…':available.proposals?counts.proposals:'—'}</div>
                <span className="text-[10px] text-emerald-600 font-semibold">{loading||!available.proposals?'Chưa có dữ liệu xác minh':`${counts.pending} chờ quản trị rà soát`}</span>
              </div>
            </div>

            {/* Quick Summary Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
                  <span>Triển khai theo khối lớp</span>
                  <span className="text-xs text-slate-400 font-medium">Theo nhật ký đã tải</span>
                </h3>
                <div className="space-y-3">
                  {!available.implementations && <p className="text-sm text-amber-900">Chưa tải được nhật ký triển khai. Không thể tính tỷ lệ theo khối.</p>}
                  {available.implementations && [1,2,3,4,5].map(grade=>{const taught=new Set(implementations.filter(r=>r.grade===grade).map(r=>r.stationId)).size;return {grade,percent:Math.min(100,taught/5*100),label:`Khối ${grade}: ${taught} bài có nhật ký triển khai`};}).map((item) => (
                    <div key={item.grade} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="text-sky-700 font-bold">{item.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-600 h-full rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
                  <span>Hoạt động triển khai gần đây</span>
                  <span className="text-xs text-emerald-700 font-bold">Theo nhật ký máy chủ</span>
                </h3>
                <div className="space-y-3">
                  {!available.implementations && <p className="text-sm text-amber-900">Chưa tải được hoạt động từ máy chủ.</p>}
                  {available.implementations && implementations.length===0 && <p className="text-sm text-slate-600">Chưa có nhật ký triển khai.</p>}
                  {available.implementations && implementations.slice(0, 4).map(imp => (
                    <div key={imp.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{imp.teacherName}</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="text-emerald-700 font-bold">{imp.className}</span>
                        <p className="text-slate-500 mt-0.5">{imp.stationName}</p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{imp.implementationDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THEO DÕI TRIỂN KHAI */}
        {activeTab === 'tracking' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Sổ Theo Dõi Triển Khai GDĐP Toàn Trường</h2>
                <p className="text-xs text-slate-500">
                  Minh chứng chuyên môn phục vụ công tác thanh kiểm tra của Phòng và Sở GDĐT
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={0}>Tất cả khối lớp</option>
                  <option value={1}>Khối 1</option>
                  <option value={2}>Khối 2</option>
                  <option value={3}>Khối 3</option>
                  <option value={4}>Khối 4</option>
                  <option value={5}>Khối 5</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase border-y border-slate-100 font-bold">
                  <tr>
                    <th className="py-3 px-4">Giáo viên</th>
                    <th className="py-3 px-4">Lớp</th>
                    <th className="py-3 px-4">Bài / Trạm</th>
                    <th className="py-3 px-4">Ngày</th>
                    <th className="py-3 px-4">Buổi / Tiết</th>
                    <th className="py-3 px-4">Hình thức</th>
                    <th className="py-3 px-4">Ghi chú</th>
                    <th className="py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredImplementations.map(imp => (
                    <tr key={imp.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{imp.teacherName}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">{imp.className}</td>
                      <td className="py-3 px-4 font-semibold text-sky-900">{imp.stationName}</td>
                      <td className="py-3 px-4 font-mono">{imp.implementationDate}</td>
                      <td className="py-3 px-4">{imp.session}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {imp.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{imp.note || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Đã xác nhận
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stations' && <ContentEditor onDirtyChange={setEditorDirty} />}

        {/* A single real station editor above; no static publish-status badges.
            Published state must come from a successful server write. */}
        {activeTab === 'users' && <StaffAccounts />}

        {/* TAB 5: BÁO CÁO */}
        {activeTab === 'reports' && <RealClassResults />}
      </div>
    </div>
  );
};

