import React,{useEffect,useRef,useState} from 'react';
import {authService,StaffUser} from '../../services/AuthService';
import {fetchWithTimeout} from '../../services/NetworkService';
let scriptReady:Promise<void>|undefined;
function loadGoogle(){
 if((window as any).google?.accounts?.id)return Promise.resolve();
 return scriptReady ||= new Promise<void>((resolve,reject)=>{
  const script=document.createElement('script');
  let timer:ReturnType<typeof setTimeout>;
  const fail=()=>{clearTimeout(timer);scriptReady=undefined;script.remove();reject(new Error('Chưa tải được Google. Hãy kiểm tra mạng hoặc tiện ích chặn nội dung rồi thử lại.'));};
  script.src='https://accounts.google.com/gsi/client';script.async=true;
  script.onload=()=>{clearTimeout(timer);if((window as any).google?.accounts?.id)resolve();else fail();};
  script.onerror=fail;timer=setTimeout(fail,12000);document.head.appendChild(script);
 });
}
export function GoogleTeacherLogin({onLogin}:{onLogin:(user:StaffUser)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
 const attempt=useRef(0),preparing=useRef(false),renderTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 useEffect(()=>()=>{attempt.current++;clearTimeout(renderTimer.current);},[]);
 async function prepare(){
  if(preparing.current)return;
  preparing.current=true;const version=++attempt.current;
  clearTimeout(renderTimer.current);setBusy(true);setError('');setReady(false);
  try{
   const [,configResponse]=await Promise.all([loadGoogle(),fetchWithTimeout('/api/auth/google/config',{cache:'no-store'})]);
   const config=await configResponse.json();
   if(!configResponse.ok||typeof config.clientId!=='string')throw Error('Chưa tải được cấu hình đăng nhập Google. Hãy thử lại.');
   const response=await fetchWithTimeout('/api/auth/google/challenge',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}',cache:'no-store'});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Chưa chuẩn bị được đăng nhập Google.');
   if(version!==attempt.current)return;
   if(!/^[a-f0-9]{48}$/.test(data.nonce))throw Error('Phiên đăng nhập chưa hợp lệ. Hãy thử lại.');
   const host=ref.current;
   if(!host)throw Error('Chưa mở được nút Google. Hãy đóng và mở lại khung đăng nhập.');
   const google=(window as any).google.accounts.id;
   google.initialize({client_id:config.clientId,nonce:data.nonce,ux_mode:'popup',callback:async({credential}:{credential:string})=>{
    if(version!==attempt.current)return;
    setBusy(true);setError('');
    try{const user=await authService.googleLogin(credential);if(version===attempt.current)onLogin(user);}
    catch(e){if(version===attempt.current){setError((e as Error).message);setReady(false);host.replaceChildren();}}
    finally{if(version===attempt.current)setBusy(false);}
   }});
   // Keep this host mounted before preparation: swapping the button for a ref
   // and rendering on a zero-delay timer could leave an empty sign-in panel.
   host.replaceChildren();
   google.renderButton(host,{theme:'outline',size:'large',text:'signin_with',locale:'vi',width:Math.min(300,host.clientWidth||300)});
   setReady(true);
   renderTimer.current=setTimeout(()=>{
    if(version===attempt.current&&!host.querySelector('iframe')){
     setReady(false);setError('Nút Google chưa hiển thị. Hãy thử lại; nếu vẫn lỗi, kiểm tra tiện ích chặn nội dung của trình duyệt.');
    }
   },8000);
  }catch(e){if(version===attempt.current){setReady(false);setError((e as Error).message);}}
  finally{preparing.current=false;if(version===attempt.current)setBusy(false);}
 }
 return <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
  <p className="font-bold">Giáo viên toàn thành phố</p>
  <p className="text-xs text-slate-600">Dùng Google để tạo không gian riêng. Tài khoản mới không có quyền quản trị.</p>
  <div ref={ref} data-testid="google-signin-host" className="flex w-full min-w-0 justify-center" aria-busy={busy}/>
  <button type="button" disabled={busy} onClick={()=>void prepare()} className="w-full rounded-xl bg-white p-3 font-bold text-emerald-800 disabled:opacity-60">{busy?'Đang chuẩn bị…':ready?'Tải lại nút Google':'Tiếp tục với Google'}</button>
  {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
 </div>;
}
