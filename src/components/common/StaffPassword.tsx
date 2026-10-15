import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { authService } from '../../services/AuthService';
export const StaffPassword: React.FC = () => {
  const {currentUser,logout}=useApp();
  const [open,setOpen]=useState(false), [busy,setBusy]=useState(false);
  const [current,setCurrent]=useState(''), [next,setNext]=useState(''), [confirm,setConfirm]=useState(''), [message,setMessage]=useState('');
  if((currentUser as any)?.authProvider==='google' || !currentUser || currentUser.role==='student' || ['teacher-demo','admin-demo'].includes(currentUser.id)) return null;
  return <>
    <button type="button" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50" onClick={()=>setOpen(!open)}>Đổi mật khẩu</button>
    {open && createPortal(<div role="dialog" aria-modal="true" aria-label="Đổi mật khẩu" className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><form className="max-h-[90dvh] w-full max-w-[420px] overflow-y-auto rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl space-y-3" onSubmit={async e=>{
      e.preventDefault();if(busy) return;
      if(next!==confirm) {setMessage('Hai mật khẩu mới chưa khớp.');return;}
      setBusy(true);setMessage('');
      try {await authService.changePassword(current,next);setCurrent('');setNext('');setConfirm('');await logout();}
      catch(error) {setMessage((error as Error).message);} finally {setBusy(false);}
    }}>
      <div className="flex items-center justify-between"><h2 className="text-lg font-black">Đổi mật khẩu</h2><button type="button" aria-label="Đóng" onClick={()=>{setOpen(false);setCurrent('');setNext('');setConfirm('');setMessage('');}} className="rounded-full px-3 py-1 hover:bg-slate-100">×</button></div><p className="text-xs text-slate-500">Đổi mật khẩu thành công sẽ yêu cầu đăng nhập lại.</p>
      <label className="block text-sm">Mật khẩu hiện tại<input required type="password" maxLength={128} autoComplete="current-password" value={current} onChange={e=>setCurrent(e.target.value)} className="block border rounded-xl p-2 w-full" /></label>
      <label className="block text-sm">Mật khẩu mới<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={next} onChange={e=>setNext(e.target.value)} className="block border rounded-xl p-2 w-full" /></label>
      <label className="block text-sm">Nhập lại mật khẩu mới<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="block border rounded-xl p-2 w-full" /></label>
      <button disabled={busy} className="bg-sky-700 text-white rounded-xl p-2">{busy ? 'Đang lưu…' : 'Lưu mật khẩu'}</button>
      {message && <p role="alert">{message}</p>}
    </form></div>, document.body)}
  </>;
};
