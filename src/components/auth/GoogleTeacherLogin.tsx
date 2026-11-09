import React,{useEffect,useRef,useState} from 'react';
import {authService,StaffUser} from '../../services/AuthService';
import {fetchWithTimeout} from '../../services/NetworkService';
import {googlePopup} from '../../services/GooglePopupService';

function loginError(error:unknown){
 const code=(error as {code?:string})?.code;
 if(code==='auth/popup-closed-by-user'||code==='auth/cancelled-popup-request')return 'Bạn đã đóng đăng nhập Google. Bấm tiếp tục để chọn lại tài khoản.';
 if(code==='auth/popup-blocked')return 'Trình duyệt đang chặn cửa sổ Google. Hãy cho phép cửa sổ bật lên rồi thử lại.';
 if(code==='auth/unauthorized-domain')return 'Miền website chưa được cho phép đăng nhập Google. Vui lòng liên hệ quản trị.';
 if(code==='auth/account-exists-with-different-credential')return 'Email này đã có phương thức đăng nhập khác. Hãy dùng phương thức cũ; ứng dụng không tự gộp tài khoản.';
 return (error as Error)?.message||'Chưa đăng nhập được Google. Hãy thử lại.';
}
export function GoogleTeacherLogin({onLogin}:{onLogin:(user:StaffUser)=>void}){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[nonce,setNonce]=useState('');
 const attempt=useRef(0),running=useRef(false);
 useEffect(()=>()=>{attempt.current++;},[]);
 async function prepare(){
  if(running.current)return;
  running.current=true;const version=++attempt.current;setBusy(true);setError('');setNonce('');
  try{
   const response=await fetchWithTimeout('/api/auth/google/challenge',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}',cache:'no-store'});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Chưa chuẩn bị được đăng nhập Google.');
   if(!/^[a-f0-9]{48}$/.test(data.nonce))throw Error('Phiên đăng nhập chưa hợp lệ. Hãy thử lại.');
   if(version===attempt.current)setNonce(data.nonce);
  }catch(e){if(version===attempt.current)setError(loginError(e));}
  finally{running.current=false;if(version===attempt.current)setBusy(false);}
 }
 async function login(){
  if(running.current||!nonce)return;
  running.current=true;const version=++attempt.current;setBusy(true);setError('');
  try{
   const credential=await googlePopup(nonce);
   if(version!==attempt.current)return;
   const user=await authService.googleLogin(credential);
   if(version===attempt.current)onLogin(user);
  }catch(e){if(version===attempt.current)setError(loginError(e));}
  finally{running.current=false;if(version===attempt.current){setBusy(false);setNonce('');}}
 }
 return <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
  <p className="font-bold">Giáo viên toàn thành phố</p>
  <p className="text-xs text-slate-600">Dùng Google để tạo không gian riêng. Tài khoản mới không có quyền quản trị.</p>
  <div data-testid="google-signin-host" className="flex w-full min-w-0 justify-center" aria-busy={busy}>
   <button type="button" disabled={busy} onClick={()=>void (nonce?login():prepare())} className="min-h-12 w-full rounded-xl bg-white p-3 font-bold text-emerald-800 disabled:opacity-60">{busy?'Đang xử lý…':nonce?'Chọn tài khoản Google':'Tiếp tục với Google'}</button>
  </div>
  {nonce&&<p className="text-xs text-slate-600">Bấm chọn tài khoản, sau đó xác thực trong cửa sổ Google.</p>}
  {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
 </div>;
}
