import React,{useEffect,useRef,useState} from 'react';
import {authService} from '../../services/AuthService';
import {Station,Student} from '../../types';
import {useApp} from '../../contexts/AppContext';
import {FEEDBACK_CATEGORIES,FeedbackCategory,learningFeedbackService} from '../../services/LearningFeedbackService';
export function LearningFeedbackForm({station,onClose}:{station:Station;onClose:()=>void}) {
  const {currentUser,role}=useApp();
  const [category,setCategory]=useState<FeedbackCategory>('Kiến thức'),[text,setText]=useState(''),[source,setSource]=useState('');
  const [busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState('');
  const dialog=useRef<HTMLDialogElement>(null),sending=useRef(false);
  useEffect(()=>{const element=dialog.current;element?.showModal();return()=>element?.close();},[]);
  return <dialog ref={dialog} onCancel={e=>{e.preventDefault();if(!sending.current)onClose();}} aria-labelledby="feedback-title" className="m-auto max-h-[90dvh] w-[min(94vw,440px)] overflow-y-auto rounded-2xl border-0 bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/60">
    <h2 id="feedback-title" className="text-lg font-bold">Góp ý cho trạm</h2><p className="mb-3 text-xs text-slate-600">Khối {station.grade} · {station.titleVi}</p>
    {sent?<><p role="status" className="py-4 text-sm font-bold text-emerald-800">Cảm ơn bạn! Góp ý đã được ghi nhận.</p><button autoFocus type="button" onClick={onClose} className="rounded-lg bg-emerald-700 px-4 py-2 text-white">Đóng</button></>:<form className="space-y-3" onSubmit={async e=>{e.preventDefault();if(sending.current)return;sending.current=true;setBusy(true);setError('');try{await learningFeedbackService.propose({stationId:station.id,category,text,source},currentUser?.id,role==='student' && !!currentUser && !(currentUser as Student).isGuest);setSent(true);}catch(err){
        if((err as {status?:number}).status===404 && (role==='teacher'||role==='admin') && currentUser?.id!=='teacher-demo'){
          try{await authService.submitProposal({stationId:station.id,stationName:station.titleVi,grade:station.grade,text:`[${category}] ${text}${source?'\nNguồn: '+source:''}`});setSent(true);}catch(fallback){setError((fallback as Error).message);}
        }else setError((err as {status?:number}).status===404?'Góp ý của khách/học sinh chưa được máy chủ hỗ trợ. Chưa gửi hoặc lưu góp ý.':(err as Error).message);
      }finally{sending.current=false;setBusy(false);}}}>
      <label className="block text-sm font-semibold">Loại góp ý<select value={category} onChange={e=>setCategory(e.target.value as FeedbackCategory)} className="mt-1 w-full rounded-lg border p-2">{FEEDBACK_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
      <label className="block text-sm font-semibold">Nội dung góp ý<textarea required minLength={5} maxLength={3000} rows={4} value={text} onChange={e=>setText(e.target.value)} placeholder="Em muốn góp ý điều gì để trạm học thú vị hơn?" className="mt-1 w-full rounded-lg border p-2"/></label>
      <label className="block text-sm font-semibold">Nguồn tham khảo (không bắt buộc)<input maxLength={1000} value={source} onChange={e=>setSource(e.target.value)} placeholder="Đường dẫn website hoặc tên tài liệu tham khảo" className="mt-1 w-full rounded-lg border p-2"/></label>
      <p className="text-xs text-slate-500">Em không cần ghi tên hay thông tin cá nhân. Thầy cô và quản trị viên sẽ xem xét góp ý.</p>
      {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2">Hủy</button><button disabled={busy} className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">{busy?'Đang gửi…':'Gửi góp ý'}</button></div>
    </form>}
  </dialog>;
}
