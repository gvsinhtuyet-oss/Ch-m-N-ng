import {gddpService} from '../../services/GddpService';
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
   {r.workspace&&<details><summary className="cursor-pointer font-bold">Xem đủ {r.workspace.records.length} bài</summary>{r.workspace.records.map(x=><div key={x.id} className="border-t py-2 text-sm"><strong>{x.subject} · {x.lesson}</strong><p>{x.activity}</p><p className="whitespace-pre-wrap">{x.content}</p></div>)}</details>}
   <span className="text-xs text-amber-800">{r.status==='accepted'?'Đã tiếp nhận':r.status==='rejected'?'Cần chỉnh sửa':'Chờ quản trị xem xét'}</span>
   {r.status==='pending'&&<div className="flex gap-3"><button disabled={busy} className="rounded-xl border p-2" onClick={async()=>{setBusy(true);try{if(r.workspace){if(r.workspace.year!=='2026-2027')throw Error('Kho chung hiện hỗ trợ năm 2026-2027.');const {catalog}=await gddpService.adminCatalog();const additions=r.workspace.records.map((x,i)=>({...x,id:`proposal-${r.id}-${i}`}));const ids=new Set(additions.map(x=>x.id));await gddpService.saveDraft({...catalog,records:[...catalog.records.filter(x=>!ids.has(x.id)),...additions]});}await authService.reviewProposal(r.id,'accepted');await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>Tiếp nhận vào bản nháp kho chung</button><button disabled={busy} className="rounded-xl border p-2" onClick={async()=>{setBusy(true);try{await authService.reviewProposal(r.id,'rejected');await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>Yêu cầu chỉnh sửa</button></div>}
   {r.status==='accepted'&&r.workspace&&<p className="text-xs">Đã đưa vào bản nháp. Mở Tích hợp GDĐP để kiểm tra và xuất bản.</p>}
  </article>)}
 </section>;
};
