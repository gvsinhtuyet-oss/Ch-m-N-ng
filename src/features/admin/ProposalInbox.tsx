import {gddpService} from '../../services/GddpService';
import React, {useEffect,useState} from 'react';
import {authService,LearningProposal} from '../../services/AuthService';
import {OFFICIAL_25_CATALOG} from '../../data/curriculumCatalog';

export const ProposalInbox:React.FC<{initialStationId?:string}>=({initialStationId})=>{
 const [records,setRecords]=useState<LearningProposal[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(true);
 const [stationId,setStationId]=useState(initialStationId ?? OFFICIAL_25_CATALOG[0].id);
 const [ratings,setRatings]=useState<Record<string,number[]>>({});
 const [ratingsError,setRatingsError]=useState('');
 const [ratingsBusy,setRatingsBusy]=useState(true);
 const load=async()=>{setBusy(true);setError('');try{setRecords(await authService.proposals());}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 const loadRatings=async()=>{
  setRatingsBusy(true);
  setRatingsError('');
  try{setRatings(await authService.stationRatings());}
  catch(error){
   const status=(error as {status?:number})?.status;
   if(status===404) setRatingsError('Máy chủ chưa có bản cập nhật thống kê sao. Mục góp ý được tải riêng bên dưới.');
   else if(status===401) setRatingsError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem đánh giá sao.');
   else if(status===403) setRatingsError('Chỉ tài khoản quản trị mới xem được đánh giá sao.');
   else setRatingsError('Chưa tải được đánh giá sao từ máy chủ. Vui lòng thử lại.');
  }
  finally{setRatingsBusy(false);}
 };
 useEffect(()=>{void load();void loadRatings();},[]);
 const visibleRecords=stationId?records.filter(record=>record.stationId===stationId):records;
 const counts=ratings[stationId];
 const total=counts?.reduce((sum,count)=>sum+count,0)||0;
 const average=total?counts.reduce((sum,count,index)=>sum+count*(index+1),0)/total:0;
 return <section className="rounded-3xl bg-white border p-6 space-y-4">
  <h2 className="text-xl font-bold">Đánh giá và góp ý theo trạm</h2>
  <div className="flex flex-wrap items-end gap-3">
   <label className="min-w-0 w-full sm:max-w-md">
    <span className="block text-sm font-semibold mb-1">Chọn trạm</span>
    <select value={stationId} onChange={event=>setStationId(event.target.value)} className="w-full rounded-xl border bg-white px-3 py-2">
     <option value="">Tất cả góp ý và đề xuất</option>
     {[1,2,3,4,5].map(grade=><optgroup key={grade} label={`Khối ${grade}`}>
      {OFFICIAL_25_CATALOG.filter(station=>station.grade===grade).map(station=><option key={station.id} value={station.id}>{station.titleVi}</option>)}
     </optgroup>)}
    </select>
   </label>
   <button type="button" disabled={busy||ratingsBusy} onClick={()=>{void load();void loadRatings();}} className="border rounded-xl px-4 py-2">
    {busy||ratingsBusy?'Đang tải…':'Làm mới'}
   </button>
  </div>
  {stationId&&<section className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
   <h3 className="font-bold">Đánh giá ở Chặng 4</h3>
   {ratingsBusy?<p role="status" className="text-sm">Đang tải đánh giá…</p>
    :ratingsError?<p role="alert" className="text-sm text-rose-700">{ratingsError}</p>
    :!counts?<p role="alert" className="text-sm text-rose-700">Máy chủ chưa trả dữ liệu cho trạm này.</p>
    :!total?<p className="text-sm">Trạm này chưa có đánh giá sao.</p>
    :<>
      <p className="font-bold">{average.toLocaleString('vi-VN',{maximumFractionDigits:2})}/5 sao · {total.toLocaleString('vi-VN')} lượt đánh giá</p>
      <ul aria-label="Số lượt theo mức sao" className="flex flex-wrap gap-2 text-sm">
       {counts.map((count,index)=><li key={index} className="rounded-lg border border-amber-200 bg-white px-2 py-1">{index+1} sao · {count.toLocaleString('vi-VN')} lượt</li>)}
      </ul>
     </>}
  </section>}
  <h3 className="font-bold">{stationId?'Góp ý cho trạm':'Tất cả góp ý và đề xuất'}{!busy&&!error&&` (${visibleRecords.length})`}</h3>
  {error&&<p role="alert" className="text-rose-700">{error}</p>}
  {!busy&&!error&&!visibleRecords.length&&<p>{stationId?'Trạm này chưa có góp ý.':'Chưa có góp ý hoặc đề xuất.'}</p>}
  {visibleRecords.map(r=><article key={r.id} className="border rounded-xl p-4 space-y-2">
   <h3 className="font-bold">{r.stationName} · Khối {r.grade}</h3>
   <p className="text-sm text-slate-500">{r.teacherName} · {new Date(r.createdAt).toLocaleString('vi-VN')}</p>
   {r.category&&<p className="text-xs font-bold text-emerald-800">{r.category}</p>}
   <p className="whitespace-pre-wrap break-words text-sm">{r.text}</p>
   {r.source&&<p className="break-words text-xs">Nguồn minh chứng: {/^https?:\/\//i.test(r.source)?<a href={r.source} target="_blank" rel="noopener noreferrer" className="underline">{r.source}</a>:r.source}</p>}
   {r.workspace&&<details><summary className="cursor-pointer font-bold">Xem đủ {r.workspace.records.length} bài</summary>{r.workspace.records.map(x=><div key={x.id} className="border-t py-2 text-sm"><strong>{x.subject} · {x.lesson}</strong><p>{x.activity}</p><p className="whitespace-pre-wrap">{x.content}</p></div>)}</details>}
   <span className="text-xs text-amber-800">{r.status==='accepted'?'Đã tiếp nhận':r.status==='rejected'?'Cần chỉnh sửa':'Chờ quản trị xem xét'}</span>
   {r.status==='pending'&&<div className="flex gap-3"><button disabled={busy} className="rounded-xl border p-2" onClick={async()=>{setBusy(true);try{if(r.workspace){if(r.workspace.year!=='2026-2027')throw Error('Kho chung hiện hỗ trợ năm 2026-2027.');const {catalog}=await gddpService.adminCatalog();const additions=r.workspace.records.map((x,i)=>({...x,id:`proposal-${r.id}-${i}`}));const ids=new Set(additions.map(x=>x.id));await gddpService.saveDraft({...catalog,records:[...catalog.records.filter(x=>!ids.has(x.id)),...additions]});}await authService.reviewProposal(r.id,'accepted');await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>{r.workspace?'Tiếp nhận vào bản nháp kho chung':'Tiếp nhận để rà soát'}</button><button disabled={busy} className="rounded-xl border p-2" onClick={async()=>{setBusy(true);try{await authService.reviewProposal(r.id,'rejected');await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>Yêu cầu chỉnh sửa</button></div>}
   {r.status==='accepted'&&r.workspace&&<p className="text-xs">Đã đưa vào bản nháp. Mở Tích hợp GDĐP để kiểm tra và xuất bản.</p>}
  </article>)}
 </section>;
};
