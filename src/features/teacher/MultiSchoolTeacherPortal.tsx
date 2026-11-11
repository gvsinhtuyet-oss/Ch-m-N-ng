import React, {useState} from 'react';
import {multiSchoolConfigured,multiSchoolService,TeacherSession,SchoolClassroom,SchoolStudent} from '../../services/MultiSchoolService';

/** Isolated preview: no changes to legacy teacher/admin sessions. */
export function MultiSchoolTeacherPortal() {
  const [session,setSession]=useState<TeacherSession|null>(null);
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState('');
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [classes,setClasses]=useState<SchoolClassroom[]>([]);
  const [selected,setSelected]=useState('');
  const [students,setStudents]=useState<SchoolStudent[]>([]);
  const [className,setClassName]=useState(''),[grade,setGrade]=useState(1);
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  async function load(token:string) { setClasses(await multiSchoolService.listClasses(token)); }
  async function submit(e:React.FormEvent) {
    e.preventDefault();setBusy(true);setNotice('');
    try {
      if(mode==='register'){
        const registered=await multiSchoolService.registerTeacher(email.trim(),password);
        if(registered.access_token && registered.user?.id) {
          await multiSchoolService.saveTeacherProfile(registered.access_token,{user_id:registered.user.id,display_name:name.trim(),school_id:null});
          setSession(registered);await load(registered.access_token);
        } else setNotice('Đã gửi yêu cầu đăng ký. Hãy xác nhận email rồi đăng nhập.');
      } else {
        const logged=await multiSchoolService.signInTeacher(email.trim(),password);
        const profile=await multiSchoolService.getTeacherProfile(logged.access_token,logged.user.id);
        if(!profile.length) throw new Error('Chưa có hồ sơ giáo viên. Vui lòng liên hệ quản trị.');
        setSession(logged);await load(logged.access_token);
      }
    }catch(err){setNotice((err as Error).message);}finally{setBusy(false);}
  }
  async function create(e:React.FormEvent){
    e.preventDefault();if(!session)return;setBusy(true);setNotice('');
    try {await multiSchoolService.createClass(session.access_token,session.user.id,className,grade);await load(session.access_token);setClassName('');setNotice('Đã tạo lớp thành công.');}
    catch(err){setNotice((err as Error).message);}finally{setBusy(false);}
  }
  async function choose(id:string){
    setSelected(id);setStudents([]);if(!session || !id)return;setBusy(true);
    try {setStudents(await multiSchoolService.listStudents(session.access_token,id));}
    catch(err){setNotice((err as Error).message);}finally{setBusy(false);}
  }
  if(!multiSchoolConfigured)return <p role="status">Chưa cấu hình kết nối Supabase dành riêng cho CHẠM ĐÀ NẴNG.</p>;
  return <section className="mx-auto max-w-3xl space-y-5 rounded-3xl bg-white p-5 text-slate-900">
    <h2 className="text-2xl font-black">Không gian giáo viên – nhiều trường</h2>
    {!session?<form onSubmit={e=>void submit(e)} className="space-y-3">
      <div className="flex gap-3"><button type="button" onClick={()=>setMode('login')} aria-pressed={mode==='login'} className="rounded-xl border p-2">Đăng nhập</button><button type="button" onClick={()=>setMode('register')} aria-pressed={mode==='register'} className="rounded-xl border p-2">Đăng ký</button></div>
      {mode==='register'&&<label className="block">Họ tên giáo viên<input className="block w-full rounded-xl border p-3" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label>}
      <label className="block">Email<input type="email" autoComplete="email" className="block w-full rounded-xl border p-3" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label className="block">Mật khẩu<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={8} className="block w-full rounded-xl border p-3" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <button disabled={busy} className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">{busy?'Đang xử lý…':mode==='login'?'Đăng nhập':'Tạo tài khoản'}</button>
    </form>:<>
      <div className="flex justify-between gap-2"><p>Giáo viên: {session.user.email}</p><button className="rounded-xl border px-3" onClick={()=>{setSession(null);setClasses([]);setStudents([]);setPassword('');}}>Đăng xuất</button></div>
      <form onSubmit={e=>void create(e)} className="flex flex-wrap items-end gap-3">
        <label>Tên lớp<input className="block rounded-xl border p-3" required maxLength={100} value={className} onChange={e=>setClassName(e.target.value)} placeholder="Ví dụ: 2/1"/></label>
        <label>Khối<select className="block rounded-xl border p-3" value={grade} onChange={e=>setGrade(Number(e.target.value))}>{[1,2,3,4,5].map(g=><option key={g} value={g}>{g}</option>)}</select></label>
        <button disabled={busy} className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white">Tạo lớp</button>
      </form>
      <label className="block">Lớp học của tôi<select className="block w-full rounded-xl border p-3" value={selected} onChange={e=>void choose(e.target.value)}><option value="">Chọn lớp</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name} – Khối {c.grade}</option>)}</select></label>
      {selected&&<><p>Mã lớp: <strong className="font-mono">{classes.find(c=>c.id===selected)?.join_code}</strong></p><h3 className="font-bold">Danh sách học sinh ({students.length})</h3>{students.length?students.map(s=><p key={s.id}>{s.display_name}</p>):<p>Chưa có học sinh. Chức năng học sinh tham gia bằng mã lớp đang chờ hoàn thiện xác thực an toàn.</p>}</>}
    </>}
    {notice&&<p role="status" className="rounded-xl bg-slate-100 p-3">{notice}</p>}
    <p className="text-xs text-slate-500">Bản thử nghiệm riêng, chưa dành cho học sinh sử dụng chính thức.</p>
  </section>;
}
