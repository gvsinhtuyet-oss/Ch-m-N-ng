import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { authService } from '../../services/AuthService';
export const StaffPassword: React.FC = () => {
  const {currentUser,logout}=useApp();
  const [open,setOpen]=useState(false), [busy,setBusy]=useState(false);
  const [current,setCurrent]=useState(''), [next,setNext]=useState(''), [confirm,setConfirm]=useState(''), [message,setMessage]=useState('');
  if(!currentUser || currentUser.role==='student' || ['teacher-demo','admin-demo'].includes(currentUser.id)) return null;
  return <div className="mx-auto max-w-7xl px-4 py-2">
    <button className="text-sm font-bold underline" onClick={()=>setOpen(!open)}>Đổi mật khẩu của tôi</button>
    {open && <form className="mt-3 rounded-2xl bg-white border p-4 space-y-3 max-w-lg" onSubmit={async e=>{
      e.preventDefault();if(busy) return;
      if(next!==confirm) {setMessage('Hai mật khẩu mới chưa khớp.');return;}
      setBusy(true);setMessage('');
      try {await authService.changePassword(current,next);setCurrent('');setNext('');setConfirm('');await logout();}
      catch(error) {setMessage((error as Error).message);} finally {setBusy(false);}
    }}>
      <p className="text-sm">Đổi mật khẩu thành công sẽ yêu cầu đăng nhập lại.</p>
      <label className="block text-sm">Mật khẩu hiện tại<input required type="password" maxLength={128} autoComplete="current-password" value={current} onChange={e=>setCurrent(e.target.value)} className="block border rounded-xl p-2 w-full" /></label>
      <label className="block text-sm">Mật khẩu mới<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={next} onChange={e=>setNext(e.target.value)} className="block border rounded-xl p-2 w-full" /></label>
      <label className="block text-sm">Nhập lại mật khẩu mới<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="block border rounded-xl p-2 w-full" /></label>
      <button disabled={busy} className="bg-sky-700 text-white rounded-xl p-2">{busy ? 'Đang lưu…' : 'Lưu mật khẩu'}</button>
      {message && <p role="alert">{message}</p>}
    </form>}
  </div>;
};
