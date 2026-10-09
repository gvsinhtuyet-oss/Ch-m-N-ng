import React, {useEffect,useState} from 'react';
import {authService,LearningProposal} from '../../services/AuthService';
export const ProposalInbox:React.FC=()=>{
 const [records,setRecords]=useState<LearningProposal[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>{setBusy(true);setError('');try{setRecords(await authService.proposals());}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 useEffect(()=>{void load();},[]);
 return <section className="rounded-3xl bg-white border p-6 space-y-4">
  <h2 className="text-xl font-bold">Đề xuất học liệu từ Giáo viên</h2>
  <p className="text-sm text-slate-600">Các đề xuất đã được máy chủ lưu. Quản trị đọc và xem xét trước khi chỉnh sửa học liệu.</p>
  <button disabled={busy} onClick={()=>void load()} className="border rounded-xl px-4 py-2">{busy?'Đang tải…':'Làm mới'}</button>
  {error&&<p role="alert" className="text-rose-700">{error}</p>}
  {!busy&&!error&&!records.length&&<p>Chưa có đề xuất.</p>}
  {records.map(r=><article key={r.id} className="border rounded-xl p-4 space-y-2">
   <h3 className="font-bold">{r.stationName} · Khối {r.grade}</h3>
   <p className="text-sm text-slate-500">{r.teacherName} · {new Date(r.createdAt).toLocaleString('vi-VN')}</p>
   <p className="whitespace-pre-wrap break-words text-sm">{r.text}</p>
   <span className="text-xs text-amber-800">Chờ quản trị xem xét</span>
  </article>)}
 </section>;
};
