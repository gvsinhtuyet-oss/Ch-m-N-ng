import React,{useEffect,useMemo,useState} from 'react';
import {useApp} from '../../contexts/AppContext';
import type {GddpRecord} from '../../services/GddpService';
import {importPlan,downloadPlanTemplate} from '../../services/TeacherWorkspaceService';
import {GddpTeacherLookup} from './GddpTeacherLookup';
import {matchGddpResources} from '../../services/GddpResourceMatcher';
import {bundledGddpCatalog} from '../../services/GddpBundledCatalog';
import {reviewGddpTextbookAddress} from '../../../gddp-textbook-review.mjs';
import {blankLocalPlan,loadLocalPlan,storeLocalPlan,downloadLocalBackup,downloadLocalExcel,importLocalBackup,SCHOOL_NAME,TEXTBOOK_NAME,SCHOOL_YEAR} from '../../services/LocalTeacherPlan';
import type {TeacherWorkspace as Workspace} from '../../services/TeacherWorkspaceService';

// Keep local plans isolated by account. Opening this screen never calls
// /api/teacher/workspace or /api/teacher/proposals (Firestore-backed endpoints).
export function TeacherWorkspace(){
 const {currentUser}=useApp();
 return <OfflineTeacherWorkspace key={currentUser?.id||'offline-teacher'}/>;
}
function OfflineTeacherWorkspace(){
 const {currentUser,currentGrade,allStationsInCurrentGrade,setCurrentGrade}=useApp();
 const userId=currentUser?.id||'offline-teacher';
 const [plan,setPlan]=useState<Workspace>(()=>{
  try{return loadLocalPlan(userId,currentGrade);}
  catch{return blankLocalPlan(currentGrade);}
 });
 const [error,setError]=useState('');
 const [saved,setSaved]=useState(false);
 const [confirmed,setConfirmed]=useState(false);
 const [showLessonList,setShowLessonList]=useState(false);
 const [activeId,setActiveId]=useState('');
 const [subjectFilter,setSubjectFilter]=useState('');
 const [weekFilter,setWeekFilter]=useState('');
 const [catalogChoice,setCatalogChoice]=useState('');
 const [busy,setBusy]=useState(false);
 const [localReady,setLocalReady]=useState(true);
 const stations=useMemo(()=>allStationsInCurrentGrade.filter(station=>station.grade===plan.grade),[allStationsInCurrentGrade,plan.grade]);
 const candidates=useMemo(()=>bundledGddpCatalog.records
  .filter(row=>row.grade===plan.grade&&reviewGddpTextbookAddress(row).status==='title_checked')
  .sort((a,b)=>a.subject.localeCompare(b.subject,'vi')||a.lesson.localeCompare(b.lesson,'vi')),[plan.grade]);
 const subjects=useMemo(()=>[...new Set(plan.records.map(row=>row.subject).filter(Boolean))].sort(),[plan.records]);
 const weeks=useMemo(()=>[...new Set(plan.records.map(row=>row.week).filter(Boolean))]
  .sort((a,b)=>Number(a.match(/\d+/)?.[0]||0)-Number(b.match(/\d+/)?.[0]||0)),[plan.records]);
 const visible=useMemo(()=>plan.records.filter(row=>(!subjectFilter||row.subject===subjectFilter)&&(!weekFilter||row.week===weekFilter)),[plan.records,subjectFilter,weekFilter]);
 const linkedCount=plan.records.filter(row=>(row.resourceLinks?.length||0)>0).length;
 const input='w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900';
 useEffect(()=>{
  try{storeLocalPlan(userId,plan);setLocalReady(true);}
  catch{setLocalReady(false);}
 },[plan,userId]);
 function change(next:Partial<Workspace>){
  setPlan(previous=>({...previous,...next,school:SCHOOL_NAME,book:TEXTBOOK_NAME,year:SCHOOL_YEAR}));
  setSaved(false);setConfirmed(false);
 }
 function edit(id:string,fields:Partial<GddpRecord>){
  change({records:plan.records.map(row=>row.id===id?{...row,...fields}:row)});
 }
 function switchGrade(grade:number){
  if(grade===plan.grade)return;
  if(plan.records.length&&!window.confirm('Đổi khối? Bản nháp khối hiện tại vẫn được giữ trên thiết bị.'))return;
  try{setPlan(loadLocalPlan(userId,grade));setError('');}
  catch{setPlan(blankLocalPlan(grade));setError('Chưa đọc được bản nháp khối này; hãy kiểm tra bản sao dự phòng.');}
  setCurrentGrade(grade);setSubjectFilter('');setWeekFilter('');setActiveId('');setCatalogChoice('');setShowLessonList(false);setSaved(false);setConfirmed(false);
 }
 function addRecord(source?:GddpRecord){
  if(plan.records.length>=100){setError('Mỗi khối tối đa 100 bài.');return;}
  const id='private-'+crypto.randomUUID();
  const record:GddpRecord=source?{...source,id,grade:plan.grade,week:'',resourceLinks:[]}
   :{id,grade:plan.grade,subject:'',week:'',lesson:'',content:'',integrationType:'Liên hệ',activity:'Khám phá',resourceLinks:[]};
  change({records:[...plan.records,record]});setSubjectFilter('');setWeekFilter('');setActiveId(id);setCatalogChoice('');setError('');
 }
 function addLink(id:string,stationId:string,hotspotId:string){
  const row=plan.records.find(r=>r.id===id);if(!row)return;
  const links=row.resourceLinks||[];
  if(links.some(l=>l.stationId===stationId&&l.hotspotId===hotspotId))return;
  edit(id,{resourceLinks:[...links,{stationId,hotspotId}]});
 }
 async function importFile(file:File){
  if(plan.records.length&&!window.confirm('Nhập tệp sẽ thay kế hoạch khối này trên thiết bị. Bạn nên tải bản sao trước. Tiếp tục?'))return;
  setBusy(true);setError('');
  try{
   const imported=/\.json$/i.test(file.name)?await importLocalBackup(file,plan.grade)
    :{...blankLocalPlan(plan.grade),records:await importPlan(file,plan.grade)};
   change(imported);setActiveId(imported.records[0]?.id||'');setSubjectFilter('');setWeekFilter('');
  }catch(e){setError((e as Error).message);}
  finally{setBusy(false);}
 }
 async function exportExcel(){
  setBusy(true);setError('');
  try{await downloadLocalExcel(plan);}
  catch(e){setError('Chưa xuất được Excel: '+(e as Error).message);}
  finally{setBusy(false);}
 }
 function save(){
  if(!confirmed){setError('Vui lòng xác nhận đã đối chiếu bài học và điểm tích hợp.');return;}
  try{storeLocalPlan(userId,plan);setSaved(true);setError('');}
  catch{setError('Không lưu được trên thiết bị. Hãy tải bản sao JSON để tránh mất kế hoạch.');}
 }
 return <section className="space-y-4 rounded-2xl bg-white p-4 sm:p-6">
  <header className="space-y-2">
   <div className="flex flex-wrap items-center justify-between gap-2">
    <h2 className="text-xl font-black text-slate-900">Kế hoạch tích hợp của tôi</h2>
    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Không ghi Firestore</span>
   </div>
   <p className="text-sm text-slate-600">Lập kế hoạch tích hợp theo bộ sách thống nhất của trường; chọn đúng bài, trạm và hoạt động rồi mở để dạy.</p>
   <p role="status" className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
    Chế độ an toàn trước ngày thi: chỉ lưu bản nháp trong trình duyệt này, không tải kế hoạch từ máy chủ và không gửi lên Firestore. Hãy tải bản sao JSON để chuyển sang thiết bị khác.
   </p>
   {!localReady&&<p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Trình duyệt đang chặn lưu trên máy. Hãy tải bản sao JSON sau mỗi lần chỉnh sửa.</p>}
   {error&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
  </header>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm font-semibold text-slate-700">Trường
    <input readOnly aria-readonly="true" value={SCHOOL_NAME} className={input+' mt-1 bg-slate-50 font-semibold'}/>
   </label>
   <label className="text-sm font-semibold text-slate-700">Bộ sách
    <input readOnly aria-readonly="true" value={TEXTBOOK_NAME} className={input+' mt-1 bg-slate-50 font-semibold'}/>
   </label>
   <label className="text-sm font-semibold text-slate-700">Năm học
    <input readOnly aria-readonly="true" value={SCHOOL_YEAR} className={input+' mt-1 bg-slate-50'}/>
   </label>
   <label className="text-sm font-semibold text-slate-700">Khối lớp
    <select className={input+' mt-1'} value={plan.grade} onChange={e=>switchGrade(Number(e.target.value))}>
     {[1,2,3,4,5].map(grade=><option key={grade} value={grade}>Khối {grade}</option>)}
    </select>
   </label>
  </div>
  <div className="grid grid-cols-3 gap-2">
   <div className="rounded-xl bg-slate-50 p-3 text-center"><strong className="block text-xl text-slate-900">{plan.records.length}</strong><span className="text-xs text-slate-600">Bài đã nhập</span></div>
   <div className="rounded-xl bg-slate-50 p-3 text-center"><strong className="block text-xl text-slate-900">{linkedCount}</strong><span className="text-xs text-slate-600">Bài gắn trạm</span></div>
   <div className="rounded-xl bg-slate-50 p-3 text-center"><strong className="block text-xl text-slate-900">{plan.records.filter(r=>r.subject&&r.lesson&&r.content).length}</strong><span className="text-xs text-slate-600">Bài đủ thông tin</span></div>
  </div>
  <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
   <div className="flex flex-wrap gap-2">
    <button type="button" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold" onClick={()=>void downloadPlanTemplate().catch(e=>setError((e as Error).message))}>Tải mẫu Excel</button>
    <label className="cursor-pointer rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold">Nhập Word / Excel / JSON
     <input className="block max-w-full pt-2 text-xs" type="file" accept=".docx,.xlsx,.json" onChange={e=>{const file=e.target.files?.[0];if(file)void importFile(file);e.target.value='';}}/>
    </label>
    <button type="button" onClick={()=>addRecord()} disabled={plan.records.length>=100} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">+ Thêm bài</button>
    <button type="button" onClick={()=>void exportExcel()} className="rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-bold text-emerald-800">Xuất Excel</button>
    <button type="button" onClick={()=>{try{downloadLocalBackup(plan);}catch(e){setError((e as Error).message);}}} className="rounded-xl border border-sky-400 px-4 py-2.5 text-sm font-bold text-sky-800">Sao lưu JSON</button>
   </div>
   {candidates.length>0&&<div className="space-y-2 rounded-xl border border-sky-200 bg-sky-50 p-3">
    <h3 className="text-sm font-bold text-sky-950">Chọn nhanh bài từ danh mục tham khảo</h3>
    <div className="flex flex-col gap-2 sm:flex-row">
     <select value={catalogChoice} onChange={e=>setCatalogChoice(e.target.value)} className={input+' flex-1'} aria-label="Chọn bài học tham khảo">
      <option value="">Chọn bài đã đối chiếu tên trong bộ sách…</option>
      {candidates.map(row=><option key={row.id} value={row.id}>{row.subject} · {row.lesson}</option>)}
     </select>
     <button type="button" disabled={!catalogChoice||plan.records.length>=100} className="rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" onClick={()=>{const row=candidates.find(r=>r.id===catalogChoice);if(row)addRecord(row);}}>Thêm vào kế hoạch</button>
    </div>
    <p className="text-xs text-sky-800">Danh mục gợi ý chỉ dùng những tên bài đã có đối chiếu trong ứng dụng. Tuần dạy, nội dung và vị trí tích hợp vẫn cần giáo viên kiểm tra theo kế hoạch nhà trường.</p>
   </div>}
   {plan.records.length>0&&<div className="grid gap-2 sm:grid-cols-2">
    <label className="text-sm font-semibold text-slate-700">Lọc theo môn
     <select className={input+' mt-1'} value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}>
      <option value="">Tất cả môn</option>{subjects.map(subject=><option key={subject} value={subject}>{subject}</option>)}
     </select>
    </label>
    <label className="text-sm font-semibold text-slate-700">Lọc theo tuần
     <select className={input+' mt-1'} value={weekFilter} onChange={e=>setWeekFilter(e.target.value)}>
      <option value="">Tất cả tuần</option>{weeks.map(week=><option key={week} value={week}>{week}</option>)}
     </select>
    </label>
   </div>}
   <div className="space-y-2">
    {plan.records.length===0&&<p className="rounded-xl border border-dashed p-4 text-sm text-slate-600">Chưa có bài. Tải mẫu Excel để nhập hoặc bấm “Thêm bài” để tạo một bài tích hợp.</p>}
    {plan.records.length>0&&visible.length===0&&<p className="text-sm text-slate-600">Không có bài phù hợp bộ lọc đang chọn.</p>}
    {visible.map((row,index)=>{
     const expanded=activeId===row.id;
     const suggestions=matchGddpResources({...row,resourceLinks:[]},stations).slice(0,5);
     const links=row.resourceLinks||[];
     return <article key={row.id} className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-start gap-2 p-3">
       <button type="button" className="min-w-0 flex-1 text-left" aria-expanded={expanded} onClick={()=>setActiveId(expanded?'':row.id)}>
        <span className="block text-sm font-bold text-slate-900">{row.lesson||'Bài chưa đặt tên'} <span className="text-xs font-normal text-slate-500">· {row.week?'Tuần '+row.week:'Chưa chọn tuần'}</span></span>
        <span className="block text-xs text-slate-600">{row.subject||'Chưa chọn môn'} · {links.length} điểm đã chọn · {expanded?'Thu gọn':'Mở để chỉnh'}</span>
       </button>
       <button type="button" className="rounded-lg border border-rose-200 px-3 py-2 text-xs text-rose-700" onClick={()=>{if(window.confirm('Xóa bài này khỏi kế hoạch trên máy?'))change({records:plan.records.filter(r=>r.id!==row.id)});}}>Xóa</button>
      </div>
      {expanded&&<div className="space-y-3 border-t p-3">
       <div className="grid gap-3 sm:grid-cols-2">
        {(['subject','week','lesson','integrationType','activity','content','outcomes','teachingSuggestion'] as const).map((field,i)=><label key={field} className={'text-sm font-semibold text-slate-700 '+(['content','outcomes','teachingSuggestion'].includes(field)?'sm:col-span-2':'')}>
         {['Môn học','Tuần dạy','Tên bài (SGK)','Mức độ tích hợp','Hoạt động / vị trí tích hợp','Nội dung giáo dục địa phương','Yêu cầu cần đạt','Gợi ý tổ chức hoạt động'][i]}
         <textarea value={row[field]||''} onChange={e=>edit(row.id,{[field]:e.target.value})} rows={['content','outcomes','teachingSuggestion'].includes(field)?2:1} className={input+' mt-1 resize-y'}/>
        </label>)}
       </div>
       <div className="space-y-2 rounded-xl bg-emerald-50 p-3">
        <p className="text-sm font-bold text-emerald-950">Gắn điểm khám phá Chặng 1</p>
        <p className="text-xs text-emerald-900">Gợi ý dựa trên nội dung đã nhập; giáo viên chọn và duyệt trước khi dùng. Không tự động chọn toàn bộ 25 trạm.</p>
        {suggestions.length>0&&<div className="space-y-2">
         {suggestions.map(({station,hotspot,reason})=>{
          const checked=links.some(l=>l.stationId===station.id&&l.hotspotId===hotspot.id);
          return <label key={station.id+':'+hotspot.id} className="flex items-start gap-2 text-sm">
           <input className="mt-1" type="checkbox" checked={checked} onChange={e=>edit(row.id,{resourceLinks:e.target.checked?[...links,{stationId:station.id,hotspotId:hotspot.id}]:links.filter(l=>l.stationId!==station.id||l.hotspotId!==hotspot.id)})}/>
           <span><strong>{hotspot.titleVi}</strong> · {station.titleVi}<span className="block text-xs text-slate-600">{reason}</span></span>
          </label>;
         })}
        </div>}
        <select aria-label="Tự chọn điểm khám phá của khối" className={input} value="" onChange={e=>{if(!e.target.value)return;const [stationId,hotspotId]=e.target.value.split('|');addLink(row.id,stationId,hotspotId);}}>
         <option value="">Hoặc chọn thủ công một điểm phù hợp…</option>
         {stations.map(station=><optgroup label={station.titleVi} key={station.id}>
          {station.hotspots.filter(h=>h.titleVi&&h.image&&h.narrationVi&&!/đang được hoàn thiện|đang cập nhật/i.test(h.narrationVi)).map(hotspot=><option key={hotspot.id} value={station.id+'|'+hotspot.id}>{hotspot.titleVi}</option>)}
         </optgroup>)}
        </select>
        {links.map(link=>{const station=stations.find(s=>s.id===link.stationId);const hotspot=station?.hotspots.find(h=>h.id===link.hotspotId);
         return <div key={link.stationId+':'+link.hotspotId} className="flex items-center justify-between gap-2 rounded-lg bg-white p-2 text-xs">
          <span>{station?.titleVi||link.stationId} · <strong>{hotspot?.titleVi||link.hotspotId}</strong></span>
          <button type="button" className="font-bold text-rose-700" onClick={()=>edit(row.id,{resourceLinks:links.filter(l=>l.stationId!==link.stationId||l.hotspotId!==link.hotspotId)})}>Bỏ</button>
         </div>;
        })}
       </div>
      </div>}
     </article>;
    })}
   </div>
   <label className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
    <input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="mt-1"/>
    <span>Tôi đã kiểm tra tên bài, tuần, yêu cầu cần đạt và địa chỉ tích hợp theo bộ Kết nối tri thức với cuộc sống và kế hoạch giáo dục nhà trường.</span>
   </label>
   <div className="flex flex-wrap gap-2">
    <button type="button" onClick={save} disabled={!plan.records.length||!confirmed} className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">Lưu kế hoạch trên thiết bị</button>
    <button type="button" disabled={!plan.records.length} onClick={()=>setShowLessonList(v=>!v)} className="rounded-xl border border-sky-300 px-4 py-3 text-sm font-bold text-sky-800">{showLessonList?'Đóng danh sách dạy':'Mở danh sách bài để dạy'}</button>
    <button type="button" disabled={!plan.records.length} onClick={()=>void exportExcel()} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700">Chia sẻ với tổ bằng Excel</button>
   </div>
   {saved&&<p role="status" className="text-sm font-bold text-emerald-800">Đã lưu bản kế hoạch trên thiết bị này. Không ghi Firestore.</p>}
   <p className="text-xs text-slate-500">Chức năng “Đề xuất vào kho chung” tạm ngừng để bảo vệ hạn mức Firestore. Khi cần chia sẻ, hãy xuất Excel hoặc sao lưu JSON. Không nhập dữ liệu cá nhân của học sinh vào kế hoạch.</p>
  </fieldset>
  {showLessonList&&plan.records.length>0&&<GddpTeacherLookup stations={stations} currentGrade={plan.grade} onGradeChange={switchGrade} privateRecords={plan.records} privateYear={plan.year} privateSource={'Kế hoạch cá nhân trên thiết bị · '+SCHOOL_NAME+' · '+TEXTBOOK_NAME+' · '+SCHOOL_YEAR+'. Giáo viên đã kiểm tra liên kết trước khi dạy.'}/>}
 </section>;
}