import React, { useEffect, useMemo, useState } from 'react';
import { ALL_25_STATIONS } from '../../data/allStations';

type Learner = { id: string; name: string; completed: number; stars: number; feedback: string };
type Classroom = { id: string; name: string; grade: number; students: Learner[] };
type Sandbox = { classes: Classroom[]; notes: Record<string, string>; published: string[]; plan: string };

const KEY = 'cham-teacher-admin-experience-v1';
const newId = () => String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
const makeStudents = (prefix: string, count: number): Learner[] =>
  Array.from({ length: count }, (_, index) => ({
    id: prefix + '-' + (index + 1),
    name: 'Học sinh mẫu ' + String(index + 1).padStart(2, '0'),
    completed: index % 6,
    stars: index % 4 === 0 ? 0 : 4 + (index % 2),
    feedback: index === 2 ? 'Em thích hình ảnh và trò chơi khám phá.' : ''
  }));
const seed = (): Sandbox => ({
  classes: [
    { id: 'demo-class-224', name: '2/24 (mẫu)', grade: 2, students: makeStudents('a', 8) },
    { id: 'demo-class-225', name: '2/25 (mẫu)', grade: 2, students: makeStudents('b', 6) }
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
      return data as Sandbox;
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
  const [adminPage, setAdminPage] = useState<'overview' | 'classes' | 'ratings' | 'assets' | 'settings'>('overview');
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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[
        ['Lớp học', data.classes.length],
        ['Học sinh mẫu', students.length],
        ['Đánh giá mẫu', evaluated.length],
        ['Điểm sao trung bình', average === null ? '—' : average.toFixed(1) + '/5']
      ].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-600">{label}</p><p className="mt-2 text-2xl font-black text-indigo-900">{value}</p>
      </div>)}
    </div>
    <div className="rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-black text-slate-900">Triển khai theo khối</h2>
      <div className="mt-3 space-y-3">{countsByGrade.map(g => <div key={g.grade}>
        <div className="flex justify-between text-sm"><span>Khối {g.grade} · {g.classes} lớp</span><strong>{g.students} học sinh mẫu</strong></div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-sky-600" style={{width: students.length ? (g.students/students.length*100)+'%' : '0%'}} /></div>
      </div>)}</div>
    </div>
    <div className={muted}>Các số liệu trên được tính từ bản trải nghiệm tại thiết bị này, KHÔNG phải truy cập, đánh giá hay kết quả thật trên hệ thống. Chưa kết nối Firestore hoặc báo cáo Production.</div>
  </div>;

  const ratingsPanel = <div className="grid gap-4 lg:grid-cols-2">
    <section className="rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-black">Đánh giá 1–5 sao · Dữ liệu minh họa</h2>
      <p className="mt-2 text-3xl font-black text-indigo-800">{average === null ? '—' : average.toFixed(1)} <span className="text-base font-normal">/ 5 · {evaluated.length} lượt mẫu</span></p>
      <div className="mt-4 space-y-3">{ratingCounts.map(item => <div key={item.stars} className="flex items-center gap-3 text-sm">
        <span className="w-14 shrink-0">{item.stars} sao</span><div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-amber-400" style={{width: evaluated.length ? (item.count/evaluated.length*100)+'%' : '0%'}} /></div>
        <strong>{item.count}</strong></div>)}</div>
    </section>
    <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-black">Góp ý minh họa</h2>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">{comments.map((c, i) => <article key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
        <p className="font-bold">{c.student} · {c.className}</p><p className="mt-1">{c.note}</p>
      </article>)}
      {!comments.length && <p className="text-sm text-slate-500">Chưa có góp ý.</p>}</div>
    </section>
  </div>;

  const assetsPanel = <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section className="rounded-2xl border bg-white p-4">
      <h2 className="text-lg font-black">Quản lý 25 trạm · Bản trải nghiệm</h2>
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
      if (window.confirm('Xóa toàn bộ chỉnh sửa trải nghiệm trên thiết bị và khôi phục dữ liệu mẫu?')) {
        setData(seed()); setSelectedId('demo-class-224'); setSelectedAssetId(ALL_25_STATIONS[0]?.id || '');
      }
    }}>Đặt lại bản trải nghiệm</button>
  </section>;

  const teacherMenu = [
    {id:'teaching',name:'Dạy học & học liệu'},
    {id:'classes',name:'Tạo lớp · Danh sách'},
    {id:'results',name:'Kết quả học tập'}
  ] as const;
  const adminMenu = [
    {id:'overview',name:'Tổng quan'},
    {id:'classes',name:'Quản lý lớp'},
    {id:'ratings',name:'Đánh giá sao'},
    {id:'assets',name:'Quản lý học liệu'},
    {id:'settings',name:'Cài đặt & kế hoạch'}
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
        <p role="status" className="mt-3 text-xs font-bold text-amber-900">CHẾ ĐỘ TRẢI NGHIỆM · DỮ LIỆU MINH HỌA (lưu cục bộ, không phải số liệu thật)</p>
      </div>
      {saveError && <p role="alert" className={'mt-3 ' + muted}>{saveError}</p>}
      <nav className="my-4 flex flex-wrap gap-2" aria-label={'Chức năng ' + (area === 'teacher' ? 'giáo viên' : 'quản trị') + ' trải nghiệm'}>
        {area === 'teacher' ? teacherMenu.map(item => <button type="button" key={item.id} aria-current={teacherPage===item.id ? 'page' : undefined}
          className={teacherPage === item.id ? button : 'min-h-11 rounded-xl border bg-white px-3 text-sm font-bold text-slate-800'} onClick={()=>setTeacherPage(item.id)}>{item.name}</button>)
          : adminMenu.map(item => <button type="button" key={item.id} aria-current={adminPage===item.id ? 'page' : undefined}
          className={adminPage === item.id ? button : 'min-h-11 rounded-xl border bg-white px-3 text-sm font-bold text-slate-800'} onClick={()=>setAdminPage(item.id)}>{item.name}</button>)}
      </nav>
    </div>
    {area === 'teacher' && teacherPage === 'teaching' ? teacherPanel :
      <div className="mx-auto max-w-[1500px] space-y-4 px-3 sm:px-6">
        {area === 'teacher' && teacherPage === 'classes' && classesPanel}
        {area === 'teacher' && teacherPage === 'results' && resultsPanel}
        {area === 'admin' && adminPage === 'overview' && adminOverview}
        {area === 'admin' && adminPage === 'classes' && classesPanel}
        {area === 'admin' && adminPage === 'ratings' && ratingsPanel}
        {area === 'admin' && adminPage === 'assets' && assetsPanel}
        {area === 'admin' && adminPage === 'settings' && settingsPanel}
      </div>}
  </div>;
};
