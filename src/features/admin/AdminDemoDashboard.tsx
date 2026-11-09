import React, {useEffect,useState} from 'react';
import {LayoutDashboard, BookOpen, Settings, Eye, Menu, ChevronDown} from 'lucide-react';
import {useApp} from '../../contexts/AppContext';
import {ContentEditor} from './ContentEditor';
import {ThemeEditor} from './ThemeEditor';
import {localLearningSummary} from './localLearningSummary';

export const AdminDemoDashboard: React.FC = () => {
  const {allStationsInCurrentGrade, currentGrade, setCurrentGrade, openStation} = useApp();
  const [tab,setTab] = useState('reports');
  const [menuOpen,setMenuOpen] = useState(false);
  const [summary,setSummary] = useState(() => localLearningSummary());
  const tabs = [
    {id:'reports',name:'Tổng quan',icon:LayoutDashboard,description:'Tiến độ học tập được lưu trên thiết bị này'},
    {id:'content',name:'Quản lý 25 trạm',icon:BookOpen,description:'Xem thử ảnh và học liệu, chỉ lưu trên thiết bị'},
    {id:'theme',name:'Giao diện',icon:Settings,description:'Thử nền màn hình và ảnh trên thiết bị này'},
    {id:'preview',name:'Xem thử bài học',icon:Eye,description:'Xem trước học liệu từ hành trình học tập'},
  ] as const;
  const current=tabs.find(t=>t.id===tab)!;
  const navigate=(id:typeof tabs[number]['id'])=>{
    setTab(id);setMenuOpen(false);
    if(id==='reports')setSummary(localLearningSummary());
  };
  useEffect(()=>{
    const openPage=(event:Event)=>{
      const page=(event as CustomEvent<{page:string}>).detail?.page;
      if(page==='reports'||page==='content'||page==='theme')navigate(page);
    };
    window.addEventListener('cham-admin-open-page',openPage);
    return()=>window.removeEventListener('cham-admin-open-page',openPage);
  },[]);
  return <div className="cham-staff admin-workspace mx-auto grid max-w-[1500px] grid-cols-1 items-start gap-4 px-3 py-4 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6 lg:py-6">
    <aside className="admin-sidebar self-start rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-20">
      <div className="admin-sidebar-brand hidden items-center gap-2 px-3 py-3 lg:flex"><BookOpen className="h-5 w-5"/><span>KHÔNG GIAN QUẢN TRỊ</span></div>
      <button type="button" aria-expanded={menuOpen} aria-controls="admin-demo-navigation" onClick={()=>setMenuOpen(v=>!v)} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-bold text-blue-950 lg:hidden">
        <Menu className="h-5 w-5"/>Quản trị trải nghiệm<span className="ml-auto text-xs font-medium">{current.name}</span><ChevronDown className="h-4 w-4"/>
      </button>
      <nav id="admin-demo-navigation" aria-label="Điều hướng quản trị trải nghiệm" className={`${menuOpen?'block':'hidden'} lg:block`}>
        <ul className="space-y-1">{tabs.map(({id,name,icon:Icon})=><li key={id}><button type="button" aria-current={tab===id?'page':undefined} onClick={()=>navigate(id)}
          className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold ${tab===id?'bg-orange-50 text-orange-950':'text-slate-700 hover:bg-slate-100'}`}>
          <Icon className="h-4 w-4 shrink-0"/>{name}
        </button></li>)}</ul>
      </nav>
      <p className="hidden px-3 py-3 text-xs text-slate-600 lg:block">Bản trải nghiệm · Không có quyền quản trị máy chủ</p>
    </aside>
    <div className="min-w-0 space-y-4">
      <header className="admin-page-hero rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-xs font-bold text-blue-800">CHẠM ĐÀ NẴNG · Quản trị trải nghiệm</p>
        <h1 className="mt-1 text-xl font-black text-blue-950 sm:text-2xl">{current.name}</h1>
        <p className="mt-1 text-sm text-slate-700">{current.description}</p>
        <p role="note" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-950">
          Chế độ trải nghiệm: không đăng nhập, không xem báo cáo toàn trường và không thể xuất bản dữ liệu chung. Các thay đổi chỉ được lưu trên thiết bị này.
        </p>
      </header>
    {tab==='theme' && <ThemeEditor localOnly/>}
    {tab==='content' && <ContentEditor localOnly/>} 
    {tab==='preview' && <section className="rounded-2xl bg-white p-5 space-y-4">
      <label>Khối <select value={currentGrade} onChange={e=>setCurrentGrade(Number(e.target.value))} className="ml-2 rounded-lg border p-2">{[1,2,3,4,5].map(g=><option key={g} value={g}>{g}</option>)}</select></label>
      <div className="grid gap-3 sm:grid-cols-2">{allStationsInCurrentGrade.map(s=><button key={s.id} onClick={()=>openStation(s)} className="rounded-xl border p-4 text-left font-bold">{s.titleVi} →</button>)}</div>
    </section>}
    {tab==='reports' && <section className="space-y-4 rounded-2xl bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Tiến độ thực lưu trên thiết bị này</h2><button onClick={()=>setSummary(localLearningSummary())} className="rounded-xl border px-4 py-2">Làm mới số liệu</button></div>
      {summary.error && <p role="alert" className="text-rose-700">{summary.error}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[
        ['Học sinh có tiến độ',summary.students.length], ['Lượt bắt đầu trạm',summary.started],
        ['Lượt hoàn thành trạm',summary.completed], ['Tỉ lệ hoàn thành trạm',`${summary.rate}%`]
      ].map(([name,value])=><div key={name} className="rounded-xl bg-sky-50 p-4"><p className="text-sm">{name}</p><strong className="text-2xl">{value}</strong></div>)}</div>
      <p className="text-sm text-slate-600">Mỗi học sinh–trạm được tính một lần; đây không phải số lượt đăng nhập hay lượt truy cập website. Tỉ lệ hoàn thành = trạm hoàn thành / trạm đã bắt đầu. Chỉ số này thể hiện tiến độ, chưa chứng minh mức tăng kiến thức.</p>
      {!summary.students.length && <p className="rounded-xl bg-amber-50 p-4">Chưa có tiến độ học sinh trên máy này. Cho học sinh vào học bằng tên và lớp, hoàn thành hoạt động, rồi mở lại báo cáo. Không tự tạo số liệu minh họa.</p>}
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Học sinh / mã lưu','Trạm đã bắt đầu','Trạm hoàn thành','Con dấu','Check-in cảm xúc','Hoạt động gần nhất'].map(h=><th key={h} className="border-b p-3">{h}</th>)}</tr></thead><tbody>{summary.students.map(s=><tr key={s.id}><td className="p-3">{s.name}</td><td className="p-3">{s.started}</td><td className="p-3">{s.completed}</td><td className="p-3">{s.stamps}</td><td className="p-3">{s.checkIns}</td><td className="p-3">{s.lastVisitedAt ? new Date(s.lastVisitedAt).toLocaleString('vi-VN') : '—'}</td></tr>)}</tbody></table></div>
    </section>}
    </div>
  </div>;
};
