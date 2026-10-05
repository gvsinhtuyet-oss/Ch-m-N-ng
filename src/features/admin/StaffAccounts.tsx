import React, { useEffect, useState } from 'react';
import { authService, StaffUser } from '../../services/AuthService';
export const StaffAccounts: React.FC = () => {
  const [users,setUsers]=useState<(StaffUser & {active:boolean})[]>([]);
  const [email,setEmail]=useState(''), [name,setName]=useState(''), [password,setPassword]=useState('');
  const [message,setMessage]=useState(''), [busy,setBusy]=useState(false);
  const load=async()=>setUsers(await authService.users());
  useEffect(()=>{ void load().catch(e=>setMessage(e.message)); },[]);
  const perform=async(action:()=>Promise<void>)=>{
    if(busy) return; setBusy(true); setMessage('');
    try { await action(); await load(); setMessage('Đã cập nhật tài khoản.'); }
    catch(error) { setMessage((error as Error).message); } finally { setBusy(false); }
  };
  return <section className="rounded-3xl bg-white border p-5 space-y-4">
    <h2 className="text-xl font-black">Tài khoản quản trị và giáo viên</h2>
    <p className="text-sm text-slate-600">Tài khoản giáo viên do quản trị cấp. Khóa hoặc đặt lại mật khẩu sẽ kết thúc các phiên đăng nhập cũ.</p>
    <form className="grid sm:grid-cols-2 gap-3" onSubmit={e=>{e.preventDefault();void perform(async()=>{
      await authService.createTeacher(email,name,password);setPassword('');setEmail('');setName('');
    });}}>
      <label className="text-sm">Họ tên giáo viên<input required maxLength={100} value={name} onChange={e=>setName(e.target.value)} className="block border rounded-xl p-3 w-full" /></label>
      <label className="text-sm">Email<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} className="block border rounded-xl p-3 w-full" /></label>
      <label className="text-sm">Mật khẩu cấp cho giáo viên<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="block border rounded-xl p-3 w-full" /></label>
      <button disabled={busy} className="self-end rounded-xl bg-indigo-700 text-white p-3 font-bold disabled:opacity-50">Tạo tài khoản giáo viên</button>
    </form>
    <p className="text-xs text-slate-500">Mật khẩu tối thiểu 12 ký tự. Gửi riêng cho người nhận và đề nghị đổi mật khẩu sau khi đăng nhập.</p>
    <div className="space-y-3">{users.map(user=><div key={user.id} className="border rounded-xl p-3 flex flex-wrap items-center gap-3">
      <div className="flex-1"><strong>{user.name}</strong><p className="text-sm">{user.email} · {user.role==='admin' ? 'Quản trị' : 'Giáo viên'} · {user.active ? 'Đang hoạt động' : 'Đã khóa'}</p></div>
      {user.role==='teacher' && <>
        <button disabled={busy} className="border rounded-xl p-2" onClick={()=>void perform(()=>authService.updateTeacher(user.email,!user.active))}>{user.active ? 'Khóa' : 'Mở khóa'}</button>
        <button disabled={busy} className="border rounded-xl p-2" onClick={()=>{
          const next=prompt('Nhập mật khẩu mới (tối thiểu 12 ký tự). Gửi riêng cho giáo viên sau khi đặt lại.');
          if(next) void perform(()=>authService.updateTeacher(user.email,user.active,next));
        }}>Đặt lại mật khẩu</button>
      </>}
    </div>)}</div>
    {message && <p role="status" className="p-3 bg-slate-100 rounded-xl">{message}</p>}
  </section>;
};
