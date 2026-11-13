import {gddpService} from '../../services/GddpService';
import React, {useEffect,useState} from 'react';
import {authService,LearningProposal} from '../../services/AuthService';
import {summarizeRatings,formatRating} from './ratingSummary';
import {OFFICIAL_25_CATALOG} from '../../data/curriculumCatalog';

export const ProposalInbox:React.FC<{initialStationId?:string}>=({initialStationId})=>{
 const [records,setRecords]=useState<LearningProposal[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(true);
 const [grade,setGrade]=useState(0),[statusFilter,setStatusFilter]=useState('');
 const [stationId,setStationId]=useState(initialStationId ?? '');
 // Open the full inbox by default. A deep-link from a station intentionally sets its filter.
 useEffect(()=>{if(initialStationId!==undefined){setStationId(initialStationId);setGrade(0);}},[initialStationId]);
 const [ratings,setRatings]=useState<Record<string,number[]>>({});
 const [ratingsWarning,setRatingsWarning]=useState('');
 const [ratingsError,setRatingsError]=useState('');
 const [ratingsStatus,setRatingsStatus]=useState<number|null>(null);
 const [ratingsBusy,setRatingsBusy]=useState(true);
 const load=async()=>{setBusy(true);setError('');try{setRecords(await authService.proposals());}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 const loadRatings=async()=>{
  setRatingsBusy(true);
  setRatingsError('');
  setRatingsStatus(null);
  try{
   const response=await authService.stationRatingsReport();
   setRatings(response.ratings);setRatingsWarning(response.warning||'');
  } catch(error){
   const status=(error as {status?:number})?.status;
   setRatings({});
   setRatingsStatus(typeof status==='number'?status:0);
   if(status===404) setRatingsError('Dữ liệu thống kê sao chưa được đồng bộ từ máy chủ.');
   else if(status===401) setRatingsError('Phiên đăng nhập đã hết hạn. Đăng nhập lại để xem đánh giá sao.');
   else if(status===403) setRatingsError('Tài khoản hiện tại chưa có quyền xem thống kê sao.');
   else setRatingsError('Chưa kết nối được số liệu đánh giá. Bạn có thể thử tải lại.');
  }
  finally{setRatingsBusy(false);}
 };
 useEffect(()=>{void load();void loadRatings();},[]);
 const catalog=OFFICIAL_25_CATALOG.filter(station=>!grade||station.grade===grade);
 const selectedStation=OFFICIAL_25_CATALOG.find(station=>station.id===stationId);
 const scopedRecords=records.filter(record=>(!stationId||record.stationId===stationId)&&(!grade||record.grade===grade));
 const visibleRecords=scopedRecords.filter(record=>!statusFilter||record.status===statusFilter);
 const summary=summarizeRatings(ratings,stationId?[stationId]:catalog.map(station=>station.id));
 const {counts,total,average}=summary;
 const waiting=scopedRecords.filter(record=>record.status==='pending').length;
 const ratingAvailable=!ratingsBusy&&!ratingsError&&summary.available;
 const gradeSummaries=[1,2,3,4,5].map(value=>({
  grade:value,summary:summarizeRatings(ratings,OFFICIAL_25_CATALOG.filter(station=>station.grade===value).map(station=>station.id)),
 }));
 const highestGradeTotal=Math.max(1,...gradeSummaries.map(({summary:gradeSummary})=>gradeSummary.total));
 const openStation=(id:string)=>{setStationId(id);setStatusFilter('');};
 return <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-5">
  <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-blue-900 to-sky-800 px-5 py-6 text-white sm:px-7">
   <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border-[23px] border-white/10" aria-hidden="true"/>
   <p className="relative text-xs font-extrabold uppercase tracking-[.18em] text-sky-200">CHẠM ĐÀ NẴNG · LẮNG NGHE NGƯỜI KHÁM PHÁ</p>
   <h2 className="relative mt-2 text-2xl font-black sm:text-3xl">{selectedStation?selectedStation.titleVi:'Đánh giá và góp ý toàn ứng dụng'}</h2>
   <p className="relative mt-2 max-w-2xl text-sm leading-6 text-sky-100">Tổng hợp các lượt đánh giá sao và ý kiến đã được máy chủ tiếp nhận, gồm người khám phá tự do và học sinh đăng nhập.</p>
  </header>
  {stationId&&<button type="button" className="text-sm font-semibold text-sky-800 underline underline-offset-4" onClick={()=>{setStationId('');setGrade(0);setStatusFilter('');}}>← Xem toàn bộ 25 bài học</button>}
  <div className="flex flex-wrap items-end gap-3">
   <label className="min-w-0 w-full sm:max-w-md">
    <span className="block text-sm font-semibold mb-1">Chọn bài học</span>
    <select value={stationId} onChange={event=>openStation(event.target.value)} className="w-full rounded-xl border bg-white px-3 py-2">
     <option value="">Tất cả bài học</option>
     {[1,2,3,4,5].filter(value=>!grade||value===grade).map(grade=><optgroup key={grade} label={`Khối ${grade}`}>
      {OFFICIAL_25_CATALOG.filter(station=>station.grade===grade).map(station=><option key={station.id} value={station.id}>{station.titleVi}</option>)}
     </optgroup>)}
    </select>
   </label>
   <label className="text-sm font-semibold">Khối lớp<select value={grade} onChange={event=>{setGrade(Number(event.target.value));setStationId('');}} className="mt-1 block rounded-xl border bg-white px-3 py-2"><option value={0}>Tất cả khối</option>{[1,2,3,4,5].map(value=><option key={value} value={value}>Khối {value}</option>)}</select></label>
   <button type="button" disabled={busy||ratingsBusy} onClick={()=>{void load();void loadRatings();}} className="border rounded-xl px-4 py-2">
    {busy||ratingsBusy?'Đang tải…':'Làm mới'}
   </button>
  </div>
  {ratingsWarning&&<p role="status" className="rounded-xl bg-amber-50 p-3 text-amber-950">{ratingsWarning}</p>}
  <button type="button" className="rounded-xl border px-4 py-2 text-sm font-bold" onClick={()=>window.dispatchEvent(new CustomEvent('cham-admin-open-page',{detail:{page:'effectiveness'}}))}>Xem tên khách và đánh giá theo thời điểm</button>
  <div className="grid gap-3 sm:grid-cols-3" aria-label="Tổng hợp đánh giá và góp ý">
    <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
      <p className="text-sm font-semibold text-amber-900">Sao trung bình</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{ratingAvailable ? total ? '★ '+formatRating(average)+' / 5' : 'Chưa có' : '—'}</p>
      <p className="text-xs text-slate-600">Trải nghiệm cả hành trình</p>
    </div>
    <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
      <p className="text-sm font-semibold text-sky-900">Lượt đánh giá</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{ratingAvailable ? total.toLocaleString('vi-VN') : '—'}</p>
      <p className="text-xs text-slate-600">Khám phá tự do + học sinh đăng nhập</p>
    </div>
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
      <p className="text-sm font-semibold text-emerald-900">Góp ý</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{!busy&&!error ? scopedRecords.length.toLocaleString('vi-VN') : '—'}</p>
      <p className="text-xs text-slate-600">{!busy&&!error?`${waiting} góp ý chờ xử lý`:"Đang kiểm tra dữ liệu"}</p>
    </div>
  </div>
  <section className="rounded-2xl border border-amber-200 bg-white p-4 sm:p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-extrabold text-slate-900">{stationId?'Phân bố đánh giá của bài':'Phân bố đánh giá chung'}</h3>
      <span className="text-xs text-slate-600">Đánh giá cả bài · 1 đến 5 sao</span>
    </div>
    {ratingsBusy?<p role="status" className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Đang tải số liệu đánh giá…</p>
    :ratingsError?<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p role="status" className="text-sm font-bold text-slate-800">{ratingsStatus===404 ? 'Thống kê sao đang chờ đồng bộ' : 'Chưa có số liệu đánh giá được xác minh'}</p>
          <p className="mt-1 text-sm text-slate-600">Các lượt đánh giá vẫn cần dữ liệu từ máy chủ để tổng hợp chính xác. Phần góp ý bên dưới được quản lý riêng.</p>
        </div>
        <button type="button" disabled={ratingsBusy} onClick={()=>void loadRatings()}
          className="min-h-10 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50">
          Tải lại thống kê
        </button>
      </div>
      <details className="mt-3 text-xs text-slate-500">
        <summary className="cursor-pointer font-medium">Chi tiết trạng thái dữ liệu dành cho quản trị</summary>
        <p className="mt-2">{ratingsError}{ratingsStatus===404?' Máy chủ chưa có API tổng hợp đánh giá (HTTP 404).':ratingsStatus?' Mã phản hồi: '+ratingsStatus+'.':''} Không coi dữ liệu chưa truy xuất được là 0 đánh giá.</p>
      </details>
    </div>
    :!summary.available?<p role="status" className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Dữ liệu đánh giá của trạm này chưa được trả về. Vui lòng kiểm tra lại bộ lọc.</p>
    :<div className="space-y-2" aria-label="Phân bố đánh giá từ 5 sao tới 1 sao">
      {!total&&<p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Chưa có lượt đánh giá nào được ghi nhận cho lựa chọn này.</p>}
      {[4,3,2,1,0].map(index=><div key={index} className="grid grid-cols-[4.5rem_minmax(0,1fr)_4rem] items-center gap-2 text-sm">
        <span className="whitespace-nowrap font-bold text-amber-800">{index+1} ★</span>
        <div className="h-4 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label={`${index+1} sao`}
          aria-valuemin={0} aria-valuemax={Math.max(1,total)} aria-valuenow={counts[index]}>
          <div className="h-full rounded-full bg-amber-400" style={{width:`${counts[index]/Math.max(1,total)*100}%`}}/>
        </div>
        <span className="text-right tabular-nums text-slate-700">{counts[index].toLocaleString('vi-VN')}</span>
      </div>)}
      {total>0&&<p className="pt-2 text-sm font-semibold text-amber-900">{formatRating(average)}/5 sao từ {total.toLocaleString('vi-VN')} lượt đánh giá thực tế</p>}
    </div>}
  </section>
  {!stationId&&<section aria-label="Thống kê đánh giá theo khối lớp" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
   <h3 className="font-extrabold text-slate-900">Đánh giá theo 5 khối lớp</h3>
   <p className="mb-4 mt-1 text-xs text-slate-600">Mỗi khối tổng hợp từ 5 bài học, theo lượt đánh giá đã lưu trên máy chủ.</p>
   <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
    {gradeSummaries.map(({grade:value,summary:gradeSummary})=><button key={value} type="button"
      onClick={()=>{setGrade(value);setStationId('');setStatusFilter('');}}
      className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 text-left transition hover:border-sky-300 hover:bg-sky-50">
      <span className="block text-xs font-bold uppercase tracking-wide text-slate-600">Khối {value}</span>
      <span className="mt-1 block text-2xl font-black tabular-nums text-slate-900">{ratingAvailable&&gradeSummary.available?gradeSummary.total.toLocaleString('vi-VN'):'—'}</span>
      <span className="block text-xs text-slate-600">lượt đánh giá</span>
      <div className="my-3 h-2 overflow-hidden rounded-full bg-slate-200">
       <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
         style={{width:`${ratingAvailable&&gradeSummary.available?gradeSummary.total/highestGradeTotal*100:0}%`}}/>
      </div>
      <span className="text-sm font-bold text-amber-800">{ratingAvailable&&gradeSummary.available?(gradeSummary.total?'★ '+formatRating(gradeSummary.average)+'/5':'Chưa có đánh giá'):'Chờ số liệu'}</span>
    </button>)}
   </div>
  </section>}
  {!stationId&&<section aria-label="Đánh giá theo 25 bài học" className="space-y-3">
   <div className="flex flex-wrap items-baseline justify-between gap-2">
    <h3 className="text-lg font-extrabold text-slate-900">Chi tiết theo bài học</h3>
    <span className="text-xs text-slate-500">{catalog.length} bài · Chọn để xem đánh giá và góp ý</span>
   </div>
   {catalog.map(station=>{const stats=summarizeRatings(ratings,[station.id]);const feedback=records.filter(record=>record.stationId===station.id);return <button key={station.id} type="button" onClick={()=>openStation(station.id)} className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-sky-300 hover:bg-sky-50">
    <span className="min-w-0 flex-1 basis-52"><strong className="block break-words">{station.titleVi}</strong><span className="text-xs text-slate-500">Khối {station.grade}</span></span>
    <span className="text-sm"><strong className="text-amber-800">{ratingAvailable&&stats.available?stats.total?'★ '+formatRating(stats.average)+'/5':'Chưa có đánh giá':'—'}</strong><span className="block text-xs text-slate-600">{ratingAvailable&&stats.available?`${stats.total} lượt đánh giá`:'Chưa có số liệu xác minh'}</span></span>
    <span className="text-xs text-slate-600">{!busy&&!error?`${feedback.length} góp ý · ${feedback.filter(record=>record.status==='pending').length} chờ xử lý`:'Đang tải góp ý'} →</span>
   </button>;})}
  </section>}
  <section className="space-y-3">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <h3 className="font-bold">{stationId?'Góp ý cho bài':'Góp ý toàn ứng dụng'}{!busy&&!error&&` (${visibleRecords.length})`}</h3>
  <label className="text-sm">Trạng thái góp ý<select value={statusFilter} onChange={event=>setStatusFilter(event.target.value)} className="ml-2 rounded-lg border bg-white p-2"><option value="">Tất cả trạng thái</option><option value="pending">Chờ xử lý</option><option value="accepted">Đã tiếp nhận</option><option value="rejected">Cần chỉnh sửa</option></select></label>
  </div>
  {error&&<div role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
    <p className="font-semibold">Chưa tải được danh sách góp ý. Bạn có thể thử lại bằng nút Làm mới.</p>
    <details className="mt-1 text-xs text-slate-500"><summary className="cursor-pointer">Chi tiết kết nối</summary><p className="mt-1">{error}</p></details>
   </div>}
  {!busy&&!error&&!visibleRecords.length&&<p>{stationId?'Trạm này chưa có góp ý.':'Chưa có góp ý hoặc đề xuất.'}</p>}
  {visibleRecords.map(r=><article key={r.id} className="border rounded-xl p-4 space-y-2">
   <h3 className="font-bold">{r.stationName} · Khối {r.grade}</h3>
   <p className="text-sm text-slate-500">{r.actorKind==='guest'?'Người khám phá tự do':r.actorKind==='student'?'Học sinh đăng nhập':r.teacherName} · {new Date(r.createdAt).toLocaleString('vi-VN')}</p>
   {r.category&&<p className="text-xs font-bold text-emerald-800">{r.category}</p>}
   {/^\[Chặng [1-4]\]/.test(r.text)&&<p className="text-xs font-bold text-sky-800">{r.text.match(/^\[(Chặng [1-4])\]/)?.[1]}</p>}
   <p className="whitespace-pre-wrap break-words text-sm">{r.text.replace(/^\[Chặng [1-4]\]\s*/, '')}</p>
   {r.source&&<p className="break-words text-xs">Nguồn minh chứng: {/^https?:\/\//i.test(r.source)?<a href={r.source} target="_blank" rel="noopener noreferrer" className="underline">{r.source}</a>:r.source}</p>}
   {r.workspace&&<details><summary className="cursor-pointer font-bold">Xem đủ {r.workspace.records.length} bài</summary>{r.workspace.records.map(x=><div key={x.id} className="border-t py-2 text-sm"><strong>{x.subject} · {x.lesson}</strong><p>{x.activity}</p><p className="whitespace-pre-wrap">{x.content}</p></div>)}</details>}
   <span className="text-xs text-amber-800">{r.status==='accepted'?'Đã tiếp nhận':r.status==='rejected'?'Cần chỉnh sửa':'Chờ quản trị xem xét'}</span>
   {r.status==='pending'&&<div className="flex gap-3"><button disabled={busy} className="rounded-xl border p-2" onClick={async()=>{setBusy(true);try{if(r.workspace){if(r.workspace.year!=='2026-2027')throw Error('Kho chung hiện hỗ trợ năm 2026-2027.');const {catalog}=await gddpService.adminCatalog();const additions=r.workspace.records.map((x,i)=>({...x,id:`proposal-${r.id}-${i}`}));const ids=new Set(additions.map(x=>x.id));await gddpService.saveDraft({...catalog,records:[...catalog.records.filter(x=>!ids.has(x.id)),...additions]});}await authService.reviewProposal(r.id,'accepted');await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>{r.workspace?'Tiếp nhận vào bản nháp kho chung':'Tiếp nhận để rà soát'}</button><button disabled={busy} className="rounded-xl border p-2" onClick={async()=>{setBusy(true);try{await authService.reviewProposal(r.id,'rejected');await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>Yêu cầu chỉnh sửa</button></div>}
   {r.status==='accepted'&&r.workspace&&<p className="text-xs">Đã đưa vào bản nháp. Mở Tích hợp GDĐP để kiểm tra và xuất bản.</p>}
  </article>)}
  </section>
 </section>;
};
