import React, {useState} from 'react';
import {useApp} from '../../contexts/AppContext';
import {ContentEditor} from './ContentEditor';
import {ThemeEditor} from './ThemeEditor';
import {localLearningSummary} from './localLearningSummary';

export const AdminDemoDashboard: React.FC = () => {
  const {allStationsInCurrentGrade, currentGrade, setCurrentGrade, openStation} = useApp();
  const [tab,setTab] = useState('reports');
  const [summary,setSummary] = useState(() => localLearningSummary());
  const tabs = [{id:'reports',name:'Số liệu học tập trên máy'}, {id:'content',name:'Ảnh và học liệu'}, {id:'theme',name:'Giao diện'}, {id:'preview',name:'Xem thử bài học'}];
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
    <div className="rounded-3xl bg-indigo-800 p-6 text-white">
      <h1 className="text-2xl font-black">Quản trị trải nghiệm miễn phí</h1>
      <p className="mt-2 text-sm">Chỉnh nền, tải ảnh, thêm học liệu và xem tiến độ lưu trên thiết bị này. Không cần tài khoản.</p>
      <p className="mt-2 text-sm text-indigo-100">Dữ liệu này không phải báo cáo toàn trường. Cấp tài khoản giáo viên và xuất bản học liệu chung cần quản trị thật.</p>
      <div className="mt-4 flex flex-wrap gap-2">{tabs.map(t=><button key={t.id} onClick={()=>{setTab(t.id);if(t.id==='reports')setSummary(localLearningSummary());}} className={`rounded-xl px-4 py-2 font-bold ${tab===t.id?'bg-white text-indigo-900':'bg-indigo-700'}`}>{t.name}</button>)}</div>
    </div>
    {tab==='theme' && <ThemeEditor localOnly />}
    {tab==='content' && <ContentEditor localOnly />}
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
  </div>;
};
