import React, { useEffect, useMemo, useState } from 'react';
import { ALL_25_STATIONS } from '../../data/allStations';
import { AdminExperienceShell, type AdminExperiencePage } from './AdminExperienceShell';
import { AdminExperienceAnalytics } from './AdminExperienceAnalytics';
import { ASSISTANT_QUALITY_CASES, evaluateAssistantQualityCase } from '../admin/assistantQualityEngine';

type Learner = { id: string; name: string; completed: number; stars: number; feedback: string };
type Classroom = { id: string; name: string; grade: number; students: Learner[] };
type Sandbox = { classes: Classroom[]; notes: Record<string, string>; published: string[]; plan: string };

const KEY = 'cham-teacher-admin-experience-v1';
const newId = () => String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
const makeStudents = (prefix: string, count: number): Learner[] =>
  Array.from({ length: count }, (_, index) => ({
    id: prefix + '-' + (index + 1),
    name: 'Học sinh ' + String(index + 1).padStart(2, '0'),
    completed: index % 6,
    stars: index % 4 === 0 ? 0 : 4 + (index % 2),
    feedback: index === 2 ? 'Em thích hình ảnh và trò chơi khám phá.' : ''
  }));
const seed = (): Sandbox => ({
  classes: [
    { id: 'demo-class-224', name: '2/24 (trải nghiệm)', grade: 2, students: makeStudents('a', 8) },
    { id: 'demo-class-225', name: '2/25 (trải nghiệm)', grade: 2, students: makeStudents('b', 6) }
  ],
  notes: {},
  published: [],
  plan: 'Mục tiêu: học sinh khám phá quê hương qua bốn chặng; kết nối nội dung GDĐP với bộ sách Kết nối tri thức với cuộc sống.'
});
function readSandbox(): Sandbox {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (data && Array.isArray(data.classes) && data.classes.length <= 40 &&
      data.classes.every((c: Classroom) => c && typeof c.id === 'string' && Array.isArray(c.students) && c.students.length <= 100) &&
      data.notes && typeof data.notes === 'object' && Array.isArray(data.published) && typeof data.plan === 'string') {
      // Rename untouched legacy demo labels without modifying user-entered class or student names.
      const normalized = data as Sandbox;
      return { ...normalized, classes: normalized.classes.map(c => {
        if (c.id !== 'demo-class-224' && c.id !== 'demo-class-225') return c;
        const oldClass = c.id === 'demo-class-224' ? '2/24 (mẫu)' : '2/25 (mẫu)';
        const newClass = c.id === 'demo-class-224' ? '2/24 (trải nghiệm)' : '2/25 (trải nghiệm)';
        return { ...c, name: c.name === oldClass ? newClass : c.name,
          students: c.students.map(student => ({
            ...student,
            name: /^Học sinh mẫu \d{2}$/.test(student.name)
              ? student.name.replace('Học sinh mẫu ', 'Học sinh ')
              : student.name,
          })) };
      }) };
    }
  } catch { /* Missing, corrupt or disabled local storage: use an isolated sample. */ }
  return seed();
}
const field = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900';
const button = 'min-h-11 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50';
const muted = 'rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950';

export const ExperienceWorkspace: React.FC<{ teacherPanel: React.ReactNode }> = ({ teacherPanel }) => {
  const [data, setData] = useState<Sandbox>(readSandbox);
  const [area, setArea] = useState<'teacher' | 'admin'>('teacher');
  const [teacherPage, setTeacherPage] = useState<'teaching' | 'classes' | 'results'>('teaching');
  const [adminPage, setAdminPage] = useState<AdminExperiencePage>('overview');
  const [qualityGrade, setQualityGrade] = useState(0);
  const [qualityChecks, setQualityChecks] = useState<Record<string, 'pass'|'flag'|'review'>>({});
  const [selectedId, setSelectedId] = useState('demo-class-224');
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState(2);
  const [names, setNames] = useState('');
  const [saveError, setSaveError] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(ALL_25_STATIONS[0]?.id || '');

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); setSaveError(''); }
    catch { setSaveError('Thiết bị không cho phép lưu dữ liệu trải nghiệm. Thay đổi chỉ còn trong phiên đang mở.'); }
  }, [data]);

  const classroom = data.classes.find(c => c.id === selectedId) || data.classes[0];
  const students = data.classes.flatMap(c => c.students);
  const evaluated = students.filter(s => s.stars > 0);
  const completed = students.filter(s => s.completed === 5).length;
  const average = evaluated.length ? evaluated.reduce((sum, s) => sum + s.stars, 0) / evaluated.length : null;
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({ stars, count: evaluated.filter(s => s.stars === stars).length }));
  const comments = data.classes.flatMap(c => c.students.filter(s => s.feedback.trim()).map(s => ({ className: c.name, student: s.name, note: s.feedback })));
  const selectedAsset = ALL_25_STATIONS.find(s => s.id === selectedAssetId) || ALL_25_STATIONS[0];
  const countsByGrade = useMemo(() => [1, 2, 3, 4, 5].map(grade => ({
    grade, classes: data.classes.filter(c => c.grade === grade).length,
    students: data.classes.filter(c => c.grade === grade).reduce((sum, c) => sum + c.students.length, 0)
  })), [data.classes]);

  const changeClass = (id: string, fn: (c: Classroom) => Classroom) =>
    setData(old => ({ ...old, classes: old.classes.map(c => c.id === id ? fn(c) : c) }));
  const changeStudent = (id: string, fn: (student: Learner) => Learner) => {
    if (!classroom) return;
    changeClass(classroom.id, c => ({ ...c, students: c.students.map(s => s.id === id ? fn(s) : s) }));
  };
  const appendStudents = () => {
    if (!classroom) return;
    const parsed = names.split(/\r?\n/).map(n => n.trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 100 - classroom.students.length);
    if (!parsed.length) return;
    changeClass(classroom.id, c => ({
      ...c, students: [...c.students, ...parsed.map(name => ({ id: newId(), name: name.slice(0, 60), completed: 0, stars: 0, feedback: '' }))]
    }));
    setNames('');
  };
  const exportClass = () => {
    if (!classroom) return;
    const rows = [['Họ và tên', 'Lớp', 'Chặng hoàn thành', 'Đánh giá sao']].concat(
      classroom.students.map(s => [s.name, classroom.name, String(s.completed), s.stars ? String(s.stars) : ''])
    );
    const csv = '\ufeff' + rows.map(row => row.map(cell => '"' + cell.replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'lop-trai-nghiem.csv'; link.click();
    URL.revokeObjectURL(url);
  };

  const classesPanel = <div className="space-y-4">
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-black text-blue-950">Lớp của tôi · Dữ liệu trên thiết bị</h2>
      <p className="mt-1 text-sm text-slate-600">Tạo lớp, nhập học sinh và điều chỉnh kết quả để thử quy trình. Không cấp mã QR hoặc ghi dữ liệu lên máy chủ.</p>
      <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_9rem_auto]" onSubmit={e => {
        e.preventDefault(); const name = className.trim().slice(0, 60); if (!name || data.classes.length >= 40) return;
        const id = newId(); setData(old => ({ ...old, classes: [...old.classes, { id, name, grade: classGrade, students: [] }] }));
        setSelectedId(id); setClassName('');
      }}>
        <input className={field} value={className} onChange={e => setClassName(e.target.value)} maxLength={60} placeholder="Tên lớp mới, ví dụ 2/24" aria-label="Tên lớp mới" />
        <select className={field} value={classGrade} onChange={e => setClassGrade(Number(e.target.value))} aria-label="Khối lớp">{[1,2,3,4,5].map(g => <option key={g} value={g}>Khối {g}</option>)}</select>
        <button type="submit" className={button} disabled={!className.trim() || data.classes.length >= 40}>+ Tạo lớp</button>
      </form>
    </div>
    {classroom ? <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="demo-class-selector" className="text-sm font-semibold">Chọn lớp</label>
        <select id="demo-class-selector" className={field + ' sm:w-auto'} value={classroom.id} onChange={e => setSelectedId(e.target.value)}>
          {data.classes.map(c => <option key={c.id} value={c.id}>{c.name} · {c.students.length} học sinh</option>)}
        </select>
        <button type="button" className="min-h-11 rounded-xl border px-3 text-sm font-semibold" onClick={exportClass}>Xuất CSV</button>
        <button type="button" className="min-h-11 rounded-xl border border-rose-200 px-3 text-sm font-semibold text-rose-700" onClick={() => {
          if (!window.confirm('Xóa lớp này khỏi dữ liệu trải nghiệm trên thiết bị?')) return;
          setData(old => ({ ...old, classes: old.classes.filter(c => c.id !== classroom.id) })); setSelectedId('');
        }}>Xóa lớp</button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <textarea className={field + ' min-h-[80px]'} value={names} onChange={e => setNames(e.target.value)}
          placeholder="Thêm học sinh: mỗi dòng một tên" aria-label="Danh sách tên học sinh" />
        <button className={button} type="button" disabled={!names.trim() || classroom.students.length >= 100} onClick={appendStudents}>Thêm vào lớp</button>
      </div>
      <p className="mt-2 text-xs text-amber-800">Nếu dùng thiết bị chung, không nhập tên thật của trẻ. Các tên nhập ở đây chỉ được lưu cục bộ và có thể xóa.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[690px] w-full text-left text-sm">
          <thead className="border-b bg-sky-50 text-sky-950"><tr><th className="p-2">Họ tên</th><th className="p-2">Trạm hoàn thành</th><th className="p-2">Sao</th><th className="p-2">Góp ý</th><th className="p-2">Xóa</th></tr></thead>
          <tbody>{classroom.students.map(s => <tr key={s.id} className="border-b align-top">
            <td className="p-2"><input className={field} aria-label={'Tên học sinh ' + s.name} value={s.name} maxLength={60}
              onChange={e => changeStudent(s.id, old => ({ ...old, name: e.target.value }))} /></td>
            <td className="p-2"><select aria-label={'Số trạm đã hoàn thành ' + s.name} className={field} value={s.completed}
              onChange={e => changeStudent(s.id, old => ({ ...old, completed: Number(e.target.value) }))}>
              {[0,1,2,3,4,5].map(v => <option key={v} value={v}>{v}/5</option>)}
            </select></td>
            <td className="p-2"><select aria-label={'Đánh giá sao ' + s.name} className={field} value={s.stars}
              onChange={e => changeStudent(s.id, old => ({ ...old, stars: Number(e.target.value) }))}>
              {[0,1,2,3,4,5].map(v => <option key={v} value={v}>{v ? v + ' sao' : 'Chưa đánh giá'}</option>)}
            </select></td>
            <td className="p-2"><input className={field} aria-label={'Góp ý ' + s.name} value={s.feedback} maxLength={200}
              onChange={e => changeStudent(s.id, old => ({ ...old, feedback: e.target.value }))} /></td>
            <td className="p-2"><button type="button" aria-label={'Xóa ' + s.name} className="min-h-11 rounded-lg px-2 font-bold text-rose-700" onClick={() =>
              changeClass(classroom.id, c => ({ ...c, students: c.students.filter(v => v.id !== s.id) }))}>Xóa</button></td>
          </tr>)}</tbody>
        </table>
        {!classroom.students.length && <p className="py-4 text-sm text-slate-500">Lớp chưa có học sinh. Nhập danh sách phía trên.</p>}
      </div>
    </div> : <p className="rounded-xl bg-white p-4">Chưa có lớp. Hãy tạo lớp ở trên.</p>}
  </div>;

  const resultsPanel = <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        ['Lớp đang có', data.classes.length],
        ['Học sinh', students.length],
        ['Hoàn thành 5 trạm', completed]
      ].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-5">
        <p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-3xl font-black text-blue-800">{value}</p>
      </div>)}
    </div>
    <div className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-black text-slate-900">Kết quả theo lớp</h2>
      <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[450px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Lớp</th><th className="p-2">Khối</th><th className="p-2">Học sinh</th><th className="p-2">Hoàn thành</th></tr></thead><tbody>
        {data.classes.map(c => <tr key={c.id} className="border-b"><td className="p-2">{c.name}</td><td className="p-2">{c.grade}</td><td className="p-2">{c.students.length}</td><td className="p-2">{c.students.filter(s => s.completed===5).length}</td></tr>)}
      </tbody></table></div>
    </div>
  </div>;

  const adminOverview = <div className="space-y-4">
    <AdminExperienceAnalytics mode="overview" />
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><p className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">NĂM HỌC 2026–2027</p>
        <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">Các lớp bạn đang tạo trên thiết bị</h2>
        <p className="text-xs text-slate-500">Thông tin lớp được quản lý trên thiết bị và tính riêng với bảng số liệu tổng quan.</p>
      </div>
      <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-950">Dữ liệu cục bộ · Không dùng Firestore</span>
    </div>
    <div aria-label="Lối tắt quản trị trải nghiệm" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {([
        ['reports','Xem kết quả lớp'],
        ['proposals','Xem đánh giá sao và góp ý'],
        ['stations','Sửa nội dung trạm'],
        ['effectiveness','Biểu đồ sử dụng và hiệu quả'],
      ] as const).map(([id,label])=><button type="button" key={id} onClick={()=>setAdminPage(id)}
        className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-indigo-900 hover:bg-indigo-50">{label}</button>)}
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
      {[
        ['Giáo viên', 1],
        ['Lớp học', data.classes.length],
        ['Học sinh', students.length],
        ['Trạm GDĐP', ALL_25_STATIONS.length],
        ['Đánh giá sao', evaluated.length],
        ['Điểm sao trung bình', average === null ? '—' : average.toFixed(1)]
      ].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-600">{label}</p><p className="mt-2 text-2xl font-black text-indigo-900">{value}</p>
      </div>)}
    </div>
    <div className="rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-black text-slate-900">Triển khai theo khối</h2>
      <div className="mt-3 space-y-3">{countsByGrade.map(g => <div key={g.grade}>
        <div className="flex justify-between text-sm"><span>Khối {g.grade} · {g.classes} lớp</span><strong>{g.students} học sinh</strong></div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-sky-600" style={{width: students.length ? (g.students/students.length*100)+'%' : '0%'}} /></div>
      </div>)}</div>
    </div>
    <div className={muted}>Các lớp tự tạo được lưu trên thiết bị và tính riêng với thống kê chung; không sử dụng dữ liệu Production hay Firestore.</div>
  </div>;

  const ratingsPanel = <div className="space-y-5">
    <AdminExperienceAnalytics mode="ratings" />
    <section className="space-y-3">
      <h3 className="text-lg font-black text-slate-900">Đánh giá của lớp bạn tự tạo trên thiết bị</h3>
      <p className="text-xs text-slate-600">Đánh giá của các lớp bạn tự tạo trên thiết bị được tổng hợp riêng với bảng phía trên.</p>
      <div className="grid gap-4 lg:grid-cols-2">
    <section className="rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-black">Đánh giá sao theo lớp</h2>
      <p className="mt-2 text-3xl font-black text-indigo-800">{average === null ? '—' : average.toFixed(1)} <span className="text-base font-normal">/ 5 · {evaluated.length} lượt</span></p>
      <div className="mt-4 space-y-3">{ratingCounts.map(item => <div key={item.stars} className="flex items-center gap-3 text-sm">
        <span className="w-14 shrink-0">{item.stars} sao</span><div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-amber-400" style={{width: evaluated.length ? (item.count/evaluated.length*100)+'%' : '0%'}} /></div>
        <strong>{item.count}</strong></div>)}</div>
    </section>
    <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-black">Góp ý của lớp</h2>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">{comments.map((c, i) => <article key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
        <p className="font-bold">{c.student} · {c.className}</p><p className="mt-1">{c.note}</p>
      </article>)}
      {!comments.length && <p className="text-sm text-slate-500">Chưa có góp ý.</p>}</div>
    </section>
      </div>
    </section>
  </div>;

  const assetsPanel = <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section className="rounded-2xl border bg-white p-4">
      <h2 className="text-lg font-black">Quản lý 25 trạm</h2>
      <p className="mb-3 mt-1 text-sm text-slate-600">Chọn trạm để soạn nháp, xuất bản thử trên thiết bị.</p>
      <div className="max-h-[440px] space-y-1 overflow-y-auto">{ALL_25_STATIONS.map(s =>
        <button type="button" key={s.id} onClick={() => setSelectedAssetId(s.id)}
          className={'flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ' + (selectedAsset?.id === s.id ? 'bg-indigo-100 font-bold text-indigo-900' : 'hover:bg-slate-50')}>
          <span>{s.titleVi}</span><span className="shrink-0 text-xs">{data.published.includes(s.id) ? 'Đã thử' : 'Nháp'}</span>
        </button>
      )}</div>
    </section>
    {selectedAsset && <section className="rounded-2xl border bg-white p-4">
      <h2 className="text-lg font-black">{selectedAsset.titleVi}</h2>
      <p className="mt-2 text-sm text-slate-600">Khối {selectedAsset.grade} · Trạm {selectedAsset.id}</p>
      <label className="mt-4 block text-sm font-semibold" htmlFor="experience-editor">Ghi chú, điều chỉnh nội dung thử nghiệm</label>
      <textarea id="experience-editor" className={field + ' mt-2 min-h-[180px]'} value={data.notes[selectedAsset.id] || ''}
        onChange={e => setData(old => ({ ...old, notes: { ...old.notes, [selectedAsset.id]: e.target.value.slice(0, 4000) } }))} />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={button} onClick={() => setData(old => ({...old, published: old.published.includes(selectedAsset.id) ? old.published : [...old.published, selectedAsset.id]}))}>Xuất bản thử trên thiết bị</button>
        <button type="button" className="min-h-11 rounded-xl border px-3 font-bold" onClick={() => setData(old => ({...old, published: old.published.filter(id => id !== selectedAsset.id)}))}>Lưu nháp</button>
      </div>
      <p className="mt-3 text-xs text-amber-900">Không sửa học liệu thật, không gửi yêu cầu lên API hoặc Firestore.</p>
    </section>}
  </div>;

  const settingsPanel = <section className="max-w-2xl rounded-2xl border bg-white p-5">
    <h2 className="text-lg font-black">Cài đặt chế độ trải nghiệm</h2>
    <p className="mt-2 text-sm">Năm học 2026–2027 · Trường Tiểu học Trần Đại Nghĩa · Sách Kết nối tri thức với cuộc sống</p>
    <p className="mt-2 text-sm text-slate-600">Dữ liệu lớp, ghi chú và đánh giá chỉ nằm trên trình duyệt này. Khi xóa dữ liệu trang web, thông tin sẽ mất.</p>
    <label htmlFor="experience-plan" className="mt-4 block text-sm font-bold">Kế hoạch tích hợp GDĐP (bản nháp cục bộ)</label>
    <textarea id="experience-plan" className={field + ' mt-2 min-h-[160px]'} maxLength={3000} value={data.plan}
      onChange={e => setData(old => ({ ...old, plan: e.target.value }))} />
    <button type="button" className="mt-4 min-h-11 rounded-xl border border-rose-300 px-4 font-bold text-rose-800" onClick={() => {
      if (window.confirm('Xóa toàn bộ chỉnh sửa trải nghiệm trên thiết bị và khôi phục dữ liệu trải nghiệm?')) {
        setData(seed()); setSelectedId('demo-class-224'); setSelectedAssetId(ALL_25_STATIONS[0]?.id || '');
      }
    }}>Đặt lại bản trải nghiệm</button>
  </section>;


  const trackingPanel = <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <h2 className="text-lg font-black text-slate-900">Sổ theo dõi triển khai GDĐP toàn trường</h2>
    <p className="mt-1 text-xs text-slate-600">Theo dõi tiến độ khám phá theo từng lớp. Chức năng ghi ngày/tiết dạy thật chỉ dành cho tài khoản đã đăng nhập.</p>
    <div className="mt-4 overflow-x-auto"><table className="min-w-[550px] w-full text-left text-sm">
      <thead className="border-y bg-slate-50 text-slate-600"><tr><th className="p-3">Lớp</th><th className="p-3">Khối</th><th className="p-3">Học sinh</th><th className="p-3">Lượt hoàn thành trạm</th><th className="p-3">Ghi nhận</th></tr></thead>
      <tbody>{data.classes.map(c=><tr key={c.id} className="border-b">
        <td className="p-3 font-bold">{c.name}</td><td className="p-3">{c.grade}</td><td className="p-3">{c.students.length}</td>
        <td className="p-3">{c.students.reduce((n,s)=>n+s.completed,0)}</td><td className="p-3 text-amber-800">Trải nghiệm cục bộ</td>
      </tr>)}</tbody></table></div>
  </section>;

  const effectivenessPanel = <AdminExperienceAnalytics mode="effectiveness" />;

  const usersPanel = <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="text-lg font-black">Tài khoản và phân quyền</h2>
    <p className="mt-1 text-sm text-slate-600">Sơ đồ vai trò tương tự Admin thật; không cấp quyền quản trị, không tạo tài khoản thật và không xem dữ liệu người dùng Production.</p>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {[
        ['Quản trị','Trải nghiệm giao diện quản lý, kiểm định và báo cáo'],
        ['Giáo viên','Tạo lớp và quản lý học liệu trên thiết bị'],
        ['Học sinh',students.length+' hồ sơ trải nghiệm trong '+data.classes.length+' lớp'],
      ].map(([label,description])=><div key={label} className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
        <h3 className="font-bold text-indigo-950">{label}</h3><p className="mt-2 text-sm text-slate-700">{description}</p>
      </div>)}
    </div>
  </section>;

  const themePanel = <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="text-lg font-black">Giao diện ứng dụng</h2>
    <p className="mt-1 text-sm text-slate-600">Xem phong cách giao diện trong chế độ trải nghiệm. Thay đổi nền, logo và giao diện thật cần đăng nhập quản trị chính thức.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-orange-100 via-white to-sky-100 p-6 text-center shadow-sm">
        <p className="text-xl font-black tracking-wider text-orange-600">CHẠM ĐÀ NẴNG</p>
        <p className="mt-2 text-sm text-blue-950">Hành trình số khám phá quê hương</p>
        <div className="mx-auto mt-5 max-w-xs rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white">Chạm để khám phá</div>
      </div>
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 text-center shadow-sm">
        <p className="text-xl font-black text-indigo-950">Quản trị CHẠM ĐÀ NẴNG</p>
        <p className="mt-2 text-sm text-slate-600">Không gian quản lý · 5 nhóm chức năng</p>
        <div className="mx-auto mt-5 max-w-xs rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-bold">Tổng quan</div>
      </div>
    </div>
  </section>;

  const qualityCases = ASSISTANT_QUALITY_CASES.filter(c=>
    !qualityGrade || ALL_25_STATIONS.some(st=>st.id===c.stationId && st.grade===qualityGrade));
  const qualityChecked = qualityCases.filter(c=>qualityChecks[c.id]);
  const qualityFlagged = qualityChecked.filter(c=>qualityChecks[c.id]==='flag');
  const qualityPassed = qualityChecked.filter(c=>qualityChecks[c.id]==='pass');
  const qualityPanel = <section className="space-y-4">
    <div className="rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-black">Kiểm định Trợ lý khám phá · 25 trạm</h2>
      <p className="mt-1 text-sm text-slate-600">Chạy kiểm tra cục bộ bộ truy hồi câu trả lời đã có sẵn, không gửi câu hỏi cho AI/API. Các trường hợp phải đối chiếu kiến thức vẫn cần giáo viên kiểm duyệt.</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label htmlFor="experience-qa-grade" className="text-sm font-bold">Khối lớp</label>
        <select id="experience-qa-grade" className={field+' sm:w-auto'} value={qualityGrade} onChange={e=>setQualityGrade(Number(e.target.value))}>
          <option value={0}>Tất cả 5 khối</option>{[1,2,3,4,5].map(g=><option key={g} value={g}>Khối {g}</option>)}
        </select>
        <button type="button" className={button} onClick={()=>{
          const selected=qualityCases.filter(c=>['context','guard','unknown'].includes(c.check));
          const results:Record<string,'pass'|'flag'|'review'>={};
          for (const row of selected) {
            try { results[row.id]=evaluateAssistantQualityCase(row).autoStatus; }
            catch { results[row.id]='flag'; }
          }
          setQualityChecks(old=>({...old,...results}));
        }}>Kiểm tra bộ tình huống cục bộ</button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[['Đã kiểm',qualityChecked.length],['Đạt kỹ thuật',qualityPassed.length],['Cần xem lại',qualityFlagged.length]].map(([label,n])=>
          <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-600">{label}</p><strong className="text-xl text-indigo-900">{n}</strong></div>)}
      </div>
    </div>
    <div className="rounded-2xl border bg-white p-4">
      <h3 className="font-black">Tình huống cần kiểm tra</h3>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
        {qualityCases.filter(c=>qualityChecks[c.id]==='flag').slice(0,15).map(c=>
          <div key={c.id} className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm">
            <p className="font-bold">{c.question}</p><p className="mt-1 text-slate-600">{c.note}</p>
          </div>)}
        {!qualityFlagged.length&&<p className="text-sm text-slate-600">Chưa có tình huống lỗi được xác nhận. Có thể nhấn kiểm tra để xem kết quả kỹ thuật.</p>}
      </div>
      <p className="mt-3 text-xs text-amber-900">Kiểm thử kỹ thuật không chứng minh chatbot hiểu hội thoại tự nhiên, cũng không chứng minh mọi câu trả lời đúng. Không lưu kết quả vào Admin thật.</p>
    </div>
  </section>;


  const teacherMenu = [
    {id:'teaching',name:'Dạy học & học liệu'},
    {id:'classes',name:'Tạo lớp · Danh sách'},
    {id:'results',name:'Kết quả học tập'}
  ] as const;
  return <div className="min-w-0 bg-[#f7f9fd] pb-8">
    <div className="mx-auto max-w-[1500px] px-3 pt-5 sm:px-6">
      <div className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-wide text-blue-700">CHẠM ĐÀ NẴNG · Không cần đăng nhập</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-xl font-black text-blue-950">Không gian Giáo viên / Quản trị trải nghiệm</h1>
            <p className="mt-1 text-sm text-slate-600">Thao tác thử đầy đủ trên thiết bị, không thay đổi dữ liệu và quyền truy cập thật.</p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Chuyển đổi vai trò trải nghiệm">
            <button type="button" className={area === 'teacher' ? button : 'min-h-11 rounded-xl border px-4 font-bold'} aria-pressed={area==='teacher'} onClick={()=>setArea('teacher')}>Giáo viên</button>
            <button type="button" className={area === 'admin' ? button : 'min-h-11 rounded-xl border px-4 font-bold'} aria-pressed={area==='admin'} onClick={()=>setArea('admin')}>Quản trị</button>
          </div>
        </div>
        <p role="status" className="mt-3 text-xs font-semibold text-slate-700">CHẾ ĐỘ TRẢI NGHIỆM · SỐ LIỆU GIẢ ĐỊNH — Không phải lượt truy cập hay đánh giá thực tế</p>
      </div>
      {saveError && <p role="alert" className={'mt-3 ' + muted}>{saveError}</p>}
      {area === 'teacher' && <nav className="my-4 flex flex-wrap gap-2" aria-label="Chức năng giáo viên trải nghiệm">
        {teacherMenu.map(item => <button type="button" key={item.id} aria-current={teacherPage===item.id ? 'page' : undefined}
          className={teacherPage === item.id ? button : 'min-h-11 rounded-xl border bg-white px-3 text-sm font-bold text-slate-800'}
          onClick={()=>setTeacherPage(item.id)}>{item.name}</button>)}
      </nav>}
    </div>
    {area === 'teacher' && (teacherPage === 'teaching' ? teacherPanel :
      <div className="mx-auto max-w-[1500px] space-y-4 px-3 sm:px-6">
        {teacherPage === 'classes' && classesPanel}
        {teacherPage === 'results' && resultsPanel}
      </div>)}
    {area === 'admin' && <AdminExperienceShell activePage={adminPage} onPageChange={setAdminPage}
      pages={{
        overview: adminOverview,
        tracking: trackingPanel,
        reports: resultsPanel,
        stations: assetsPanel,
        gddp: settingsPanel,
        effectiveness: effectivenessPanel,
        proposals: ratingsPanel,
        users: usersPanel,
        theme: themePanel,
        'assistant-qa': qualityPanel,
      }} />}
  </div>;
};
