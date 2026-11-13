import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useApp} from '../../contexts/AppContext';
import type {GddpRecord} from '../../services/GddpService';
import {workspaceRequest,importPlan,downloadPlanTemplate,type TeacherWorkspace as Workspace} from '../../services/TeacherWorkspaceService';
import {GddpTeacherLookup} from './GddpTeacherLookup';
import {matchGddpResources} from '../../services/GddpResourceMatcher';
import {authService} from '../../services/AuthService';
import {reviewGddpTextbookAddress} from '../../../gddp-textbook-review.mjs';
import {
  availableSuggestions,lessonResources,makeEmptyWorkspace,makePrivateRecord,
  withWorkspaceDefaults,DEFAULT_BOOK,DEFAULT_SCHOOL,DEFAULT_YEAR,MAX_PLAN_RECORDS,
  textbookSuggestions,
} from './TeacherIntegrationPlanner';
import {exportTeacherPlanExcel,exportTeacherPlanWord} from './TeacherPlanExportService';

const field='min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-offset-2 focus:border-blue-600';
const mainButton='min-h-11 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed';
const outlineButton='min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50';
const ownKey=(uid:string)=>'cham-teacher-integration-drafts-v2:'+uid;
const planKey=(workspace:Pick<Workspace,'grade'|'year'>)=>workspace.year+'|'+workspace.grade;
const newId=()=> 'private-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9));

type LocalLibrary=Record<string,Workspace>;
function readDrafts(uid:string):LocalLibrary {
  try{
    const raw=localStorage.getItem(ownKey(uid));
    const value=raw?JSON.parse(raw):null;
    if(value&&typeof value==='object'&&!Array.isArray(value)){
      const entries=Object.entries(value).slice(0,30)
        .filter((item):item is [string,Workspace]=>Boolean(item[1]&&typeof item[1]==='object'
          &&Array.isArray((item[1] as Workspace).records)
          &&(item[1] as Workspace).records.length<=MAX_PLAN_RECORDS));
      return Object.fromEntries(entries.map(([key,v])=>[key,withWorkspaceDefaults(v,v.grade)]));
    }
    // Migrate a demo draft once without moving it to any real teacher account.
    if(uid==='teacher-demo'){
      const legacy=localStorage.getItem('cham-teacher-demo-workspace-v1');
      const value=legacy?JSON.parse(legacy):null;
      if(value&&Array.isArray(value.records)&&value.records.length<=MAX_PLAN_RECORDS&&value.grade>=1&&value.grade<=5){
        const safe=withWorkspaceDefaults(value,value.grade);
        return {[planKey(safe)]:safe};
      }
    }
  }catch{/* Corrupt/disabled storage: permit in-session editing. */}
  return {};
}
function initialPlan(lib:LocalLibrary,grade:number):Workspace {
  return lib[DEFAULT_YEAR+'|'+grade]||Object.values(lib).find(p=>p.grade===grade)||makeEmptyWorkspace(grade);
}
function stablePlan(plan:Workspace) {
  const {school,book,year,grade,records}=plan;
  return JSON.stringify({school:school.trim(),book:book.trim(),year,grade,records});
}
function saveJson(plan:Workspace){
  const url=URL.createObjectURL(new Blob([JSON.stringify(plan,null,2)],{type:'application/json;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='ke-hoach-tich-hop-khoi-'+plan.grade+'.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
const recordFields=[
  {key:'subject',label:'Môn học',rows:1},
  {key:'week',label:'Tuần dự kiến',rows:1},
  {key:'lesson',label:'Tên bài trong SGK',rows:1},
  {key:'outcomes',label:'Yêu cầu cần đạt',rows:2},
  {key:'activity',label:'Vị trí / hoạt động tích hợp',rows:2},
  {key:'integrationType',label:'Hình thức tích hợp',rows:1},
  {key:'content',label:'Nội dung GDĐP',rows:3},
  {key:'teachingSuggestion',label:'Gợi ý tổ chức, câu hỏi, đánh giá',rows:3},
] as const;

export function TeacherWorkspace({onOpenClassroom}:{onOpenClassroom?:()=>void}={}){
  const {currentUser,currentGrade,allStationsInCurrentGrade,setCurrentGrade,openStation}=useApp();
  const uid=currentUser?.id||'teacher-anonymous';
  const demo=uid==='teacher-demo';
  const initial=useMemo(()=>readDrafts(uid),[uid]);
  const [drafts,setDrafts]=useState<LocalLibrary>(()=>initial);
  const [plan,setPlan]=useState<Workspace>(()=>initialPlan(initial,currentGrade));
  const [busy,setBusy]=useState(false);
  const [ready,setReady]=useState(demo);
  const [remote,setRemote]=useState<Workspace|null>(null);
  const [serverChecked,setServerChecked]=useState(demo);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [confirmed,setConfirmed]=useState(false);
  const [subject,setSubject]=useState('');
  const [query,setQuery]=useState('');
  const [selectedSuggestionId,setSelectedSuggestionId]=useState('');
  const [pendingImport,setPendingImport]=useState<{name:string;records:GddpRecord[]}|null>(null);
  const [expandedId,setExpandedId]=useState('');
  const [teachId,setTeachId]=useState('');
  const [sharing,setSharing]=useState(false);
  const [page,setPage]=useState<'suggest'|'plan'>('suggest');
  const touched=useRef(false);
  const loadedLocalWithContent=useRef(Object.values(initial).some(p=>p.records.length>0));

  useEffect(()=>{
    let active=true;
    setError('');setNotice('');setReady(demo);setServerChecked(demo);setRemote(null);
    if(!demo){
      workspaceRequest().then(result=>{
        if(!active)return;
        const normalized=result?withWorkspaceDefaults(result,result.grade):null;
        setRemote(normalized);
        // Never silently replace local draft edits or save to Firestore on load.
        if(normalized&&!loadedLocalWithContent.current&&!touched.current){
          setPlan(normalized);setCurrentGrade(normalized.grade);
        }
        setReady(true);setServerChecked(true);
      }).catch(()=>{
        if(!active)return;
        setReady(true);setServerChecked(false);
        setNotice('Máy chủ chưa tải được kế hoạch. Bạn vẫn soạn và xuất bản nháp trên thiết bị; chưa thể đồng bộ tài khoản.');
      });
    }
    return()=>{active=false;};
  },[uid,demo]);
  useEffect(()=>{
    if(!ready)return;
    setDrafts(old=>({...old,[planKey(plan)]:plan}));
  },[plan,ready]);
  useEffect(()=>{
    if(!ready)return;
    try{localStorage.setItem(ownKey(uid),JSON.stringify(drafts));}
    catch{setNotice('Trình duyệt không thể giữ bản nháp; hãy tải bản sao Word hoặc Excel để tránh mất dữ liệu.');}
  },[drafts,uid,ready]);

  function edit(patch:Partial<Workspace>){
    touched.current=true;
    setPlan(old=>({...old,...patch}));
    setConfirmed(false);setNotice('');setTeachId('');
  }
  function switchPlan(year:string,grade:number){
    if(year===plan.year&&grade===plan.grade)return;
    const library={...drafts,[planKey(plan)]:plan};
    const selected=library[year+'|'+grade]||
      {...makeEmptyWorkspace(grade),school:plan.school,book:plan.book,year};
    touched.current=true;
    setDrafts({...library,[planKey(selected)]:selected});
    setPlan(selected);setConfirmed(false);setPendingImport(null);
    setExpandedId('');setSelectedSuggestionId('');setTeachId('');
    setCurrentGrade(grade);setNotice('Đã chuyển bản nháp theo khối và năm học. Bản trước vẫn được giữ trên thiết bị.');
  }
  function addRecord(record:GddpRecord){
    if(plan.records.length>=MAX_PLAN_RECORDS){setError('Kế hoạch đã đạt tối đa 100 bài.');return;}
    edit({records:[...plan.records,record]});setExpandedId(record.id);
    setPage('plan');setNotice('Đã thêm bài vào bản nháp. Hãy đối chiếu SGK và xác nhận điểm chạm trước khi lưu tài khoản.');
  }
  const suggestions=useMemo(()=>availableSuggestions(plan.grade,subject,query),[plan.grade,subject,query]);
  const subjects=useMemo(()=>[...new Set(textbookSuggestions.filter(r=>r.grade===plan.grade).map(r=>r.subject))].sort(),[plan.grade]);
  const chosen=suggestions.find(r=>r.id===selectedSuggestionId)||null;
  const resources=useMemo(()=>chosen?lessonResources(chosen,allStationsInCurrentGrade):[],[chosen,allStationsInCurrentGrade]);
  const incomplete=plan.records.filter(r=>!r.subject.trim()||!r.lesson.trim()||!r.content.trim()).length;
  const linked=plan.records.filter(r=>r.resourceLinks?.length).length;
  const validYear=/^20\d{2}-20\d{2}$/.test(plan.year);
  const synced=remote!==null&&stablePlan(remote)===stablePlan(plan);
  const saveAllowed=!demo&&serverChecked&&ready&&!busy&&!!plan.records.length&&!incomplete&&confirmed&&validYear;

  async function syncAccount(){
    if(!saveAllowed)return;
    if(synced){setNotice('Kế hoạch đã khớp bản lưu trên tài khoản; không phát sinh lần ghi mới.');return;}
    if(remote?.records?.length && !window.confirm('Tài khoản hiện có một kế hoạch riêng trên máy chủ. Lưu kế hoạch này sẽ thay kế hoạch đang dùng. Bạn đã tải bản sao kế hoạch cũ chưa?'))return;
    setBusy(true);setError('');
    try{
      const saved=await workspaceRequest('PUT',plan);
      setRemote(withWorkspaceDefaults(saved||plan,plan.grade));
      setConfirmed(false);
      setNotice('Đã đồng bộ vào tài khoản. Chỉ gửi dữ liệu khi bạn chủ động bấm lưu.');
    }catch(e){setError((e as Error).message+' · Bản nháp trên thiết bị vẫn còn.');}
    finally{setBusy(false);}
  }
  async function importFile(file:File){
    setBusy(true);setError('');setPendingImport(null);
    try{const records=await importPlan(file,plan.grade);setPendingImport({name:file.name,records});setPage('plan');}
    catch(e){setError((e as Error).message);}
    finally{setBusy(false);}
  }
  async function exportAs(format:'word'|'excel'){
    setBusy(true);setError('');
    try{if(format==='word')await exportTeacherPlanWord(plan);else await exportTeacherPlanExcel(plan);}
    catch(e){setError('Không xuất được file: '+(e as Error).message);}
    finally{setBusy(false);}
  }
  const yearChoices=[...new Set([DEFAULT_YEAR,plan.year,'2027-2028','2028-2029'])];
  return <section className="space-y-5 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-6">
    <header className="rounded-2xl bg-gradient-to-br from-blue-950 via-indigo-900 to-sky-800 px-4 py-5 text-white sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-sky-200">CHẠM ĐÀ NẴNG · Không gian Giáo viên</p>
      <h2 className="mt-2 text-2xl font-black">Kế hoạch tích hợp của tôi</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
        Chọn bài từ nguồn đã đối chiếu tên SGK Kết nối tri thức, xem yêu cầu cần đạt,
        lựa chọn điểm chạm và xây dựng kế hoạch phù hợp với tiết dạy.
      </p>
      <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white">
        <span>{demo?'Giáo viên tự do · Chế độ trải nghiệm':'Giáo viên đăng nhập'}</span>
        <span>·</span><span>Bản nháp tự lưu trên thiết bị</span>
        <span>·</span><span>Chỉ đồng bộ khi chủ động bấm lưu</span>
      </div>
    </header>

    {error&&<p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
    {notice&&<p role="status" className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-900">{notice}</p>}
    {!ready&&<p role="status" className="text-sm text-slate-700">Đang kiểm tra kế hoạch đã có trên tài khoản…</p>}
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-slate-800">Trường
        <input className={field+' mt-1'} value={plan.school} maxLength={200}
          onChange={e=>edit({school:e.target.value})}/>
      </label>
      <label className="text-sm font-semibold text-slate-800">Bộ sách
        <input className={field+' mt-1 bg-slate-100'} readOnly aria-readonly="true" value={DEFAULT_BOOK}
          title="Kho gợi ý đã đối chiếu theo bộ Kết nối tri thức với cuộc sống"/>
      </label>
      <label className="text-sm font-semibold text-slate-800">Năm học
        <select className={field+' mt-1'} value={plan.year} onChange={e=>switchPlan(e.target.value,plan.grade)}>
          {yearChoices.map(year=><option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-800">Khối lớp
        <select className={field+' mt-1'} value={plan.grade} onChange={e=>switchPlan(plan.year,Number(e.target.value))}>
          {[1,2,3,4,5].map(grade=><option key={grade} value={grade}>Khối {grade}</option>)}
        </select>
      </label>
      {plan.book!==DEFAULT_BOOK && <div className="sm:col-span-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
        Kế hoạch cũ ghi bộ sách khác: “{plan.book}”. Kho gợi ý chỉ dùng Kết nối tri thức với cuộc sống.
        Dữ liệu cũ vẫn giữ nguyên cho đến khi bạn chủ động thay thế.
        <button type="button" className="ml-2 underline font-semibold" onClick={()=>edit({book:DEFAULT_BOOK})}>Dùng bộ sách đã thống nhất</button>
      </div>}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
      <div>
        <h3 className="font-black text-blue-950">Mã QR học sinh nằm ở “Lớp của tôi · Mã QR”</h3>
        <p className="mt-1 text-xs text-slate-700">Tạo/chọn lớp → lưu danh sách → cấp mã cho học sinh → tải thẻ PNG hoặc ZIP. Chế độ trải nghiệm dùng thẻ thử riêng.</p>
      </div>
      {onOpenClassroom && <button type="button" className={mainButton} onClick={onOpenClassroom}>Mở Lớp của tôi · Mã QR</button>}
    </div>

    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {[['Bài đã chọn',plan.records.length],['Có liên kết điểm chạm',linked],['Cần hoàn thiện',incomplete]].map(([label,value])=>
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-semibold text-slate-600">{label}</p>
          <strong className="mt-1 block text-2xl font-black text-blue-900">{value}</strong>
        </div>)}
    </div>

    <nav className="flex flex-wrap gap-2" aria-label="Bước lập kế hoạch">
      <button type="button" aria-current={page==='suggest'?'page':undefined} onClick={()=>setPage('suggest')}
        className={page==='suggest'?mainButton:outlineButton}>1. Chọn bài và gợi ý tích hợp</button>
      <button type="button" aria-current={page==='plan'?'page':undefined} onClick={()=>setPage('plan')}
        className={page==='plan'?mainButton:outlineButton}>2. Duyệt và quản lý kế hoạch ({plan.records.length})</button>
    </nav>

    {page==='suggest'&&<div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-3 sm:p-5">
      <div>
        <h3 className="text-lg font-black text-slate-900">Chọn bài trong chương trình</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Các bài dưới đây đã được đối chiếu tên với nguồn SGK Kết nối tri thức;
          tuần dạy, yêu cầu cần đạt và vị trí tích hợp vẫn do giáo viên kiểm tra trước khi sử dụng.
          Không gợi ý máy móc cho mọi bài.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">Môn học
          <select className={field+' mt-1'} value={subject} onChange={e=>{setSubject(e.target.value);setSelectedSuggestionId('');}}>
            <option value="">Tất cả môn trong khối</option>
            {subjects.map(name=><option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">Tìm bài hoặc nội dung
          <input className={field+' mt-1'} value={query} onChange={e=>{setQuery(e.target.value);setSelectedSuggestionId('');}}
            placeholder="Ví dụ: cảnh đẹp, nghề truyền thống…" />
        </label>
      </div>
      <p className="text-xs text-slate-600">{suggestions.length} địa chỉ tích hợp phù hợp với bộ lọc · Khối {plan.grade}</p>
      <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
        {suggestions.map(r=><button type="button" key={r.id}
          aria-pressed={selectedSuggestionId===r.id}
          className={'min-h-14 rounded-xl border p-3 text-left text-sm transition '+
            (selectedSuggestionId===r.id?'border-blue-600 bg-blue-100':'border-slate-200 bg-white hover:border-blue-300')}
          onClick={()=>setSelectedSuggestionId(r.id)}>
          <span className="block font-bold text-slate-900">{r.lesson}</span>
          <span className="mt-1 block text-xs text-slate-600">{r.subject} · {r.week||'Tuần theo kế hoạch trường'}</span>
        </button>)}
      </div>
      {!suggestions.length&&<p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Chưa có bài đã đối chiếu phù hợp. Bạn có thể thêm thủ công trong bước 2 và đối chiếu SGK trước khi sử dụng.</p>}
      {chosen&&<article className="space-y-3 rounded-2xl border border-emerald-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="text-lg font-black text-slate-900">{chosen.lesson}</h4>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Đã đối chiếu tên bài SGK</span>
        </div>
        <p className="text-sm"><strong>Yêu cầu cần đạt:</strong> {chosen.outcomes||'Chưa có mô tả; giáo viên bổ sung từ SGK'}</p>
        <p className="text-sm"><strong>Vị trí tích hợp:</strong> {chosen.activity}</p>
        <p className="text-sm"><strong>Nội dung địa phương:</strong> {chosen.content}</p>
        <p className="text-sm"><strong>Gợi ý tổ chức:</strong> {chosen.teachingSuggestion||'Giáo viên thiết kế hoạt động 3–5 phút phù hợp yêu cầu cần đạt.'}</p>
        <div className="rounded-xl bg-slate-50 p-3">
          <strong className="text-sm text-slate-900">Điểm chạm đề xuất</strong>
          {resources.length?<ul className="mt-2 space-y-1 text-sm">{resources.map(item=>
            <li key={item.station.id+item.hotspot.id}>• {item.station.titleVi} · {item.hotspot.titleVi}
              <span className="ml-1 text-xs text-slate-600">({item.reason})</span>
            </li>)}</ul>:<p className="mt-1 text-xs text-slate-600">Không có điểm chạm đủ căn cứ. Không tự liên kết ngẫu nhiên.</p>}
        </div>
        {reviewGddpTextbookAddress(chosen).source&&<a href={reviewGddpTextbookAddress(chosen).source||undefined}
          target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-bold text-blue-800 underline">
          Mở nguồn đối chiếu tên bài
        </a>}
        <p className="text-xs text-amber-800">Đây là gợi ý có nguồn; giáo viên quyết định nội dung, hoạt động và kiểm tra điểm chạm trước khi tổ chức.</p>
        <button type="button" className={mainButton} disabled={plan.records.length>=MAX_PLAN_RECORDS}
          onClick={()=>addRecord(makePrivateRecord(chosen,allStationsInCurrentGrade,newId()))}>
          + Thêm vào kế hoạch để duyệt
        </button>
      </article>}
    </div>}

    {page==='plan'&&<div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-lg font-black">Bảng kế hoạch tích hợp</h3>
        <p className="mt-1 text-xs text-slate-600">Được giữ riêng theo khối và năm học. Giáo viên chỉnh sửa/duyệt trước khi đồng bộ tài khoản; không tự gửi dữ liệu lên Firestore.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={outlineButton} disabled={plan.records.length>=MAX_PLAN_RECORDS}
            onClick={()=>addRecord({id:newId(),grade:plan.grade,subject:'',week:'',lesson:'',content:'',integrationType:'Liên hệ',activity:'',outcomes:'',teachingSuggestion:'',resourceLinks:[]})}>+ Thêm bài thủ công</button>
          <button type="button" className={outlineButton} onClick={()=>void downloadPlanTemplate().catch(e=>setError((e as Error).message))}>Tải mẫu Excel</button>
          <label className={outlineButton+' cursor-pointer'}>Nhập Word / Excel
            <input type="file" accept=".docx,.xlsx" className="sr-only"
              onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void importFile(file);}}/>
          </label>
        </div>
      </div>

      {pendingImport&&<div className="space-y-2 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
        <h4 className="font-black text-amber-950">Xem trước dữ liệu nhập: {pendingImport.name}</h4>
        <p className="text-sm text-amber-900">{pendingImport.records.length} bài · Khối {plan.grade}.
          Bảng hiện tại sẽ không bị thay đổi nếu bạn hủy.</p>
        <ul className="list-disc pl-5 text-sm text-slate-800">
          {pendingImport.records.slice(0,5).map(r=><li key={r.id}>{r.subject} · {r.lesson}</li>)}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={mainButton} onClick={()=>{
            if(plan.records.length&&!window.confirm('Thay '+plan.records.length+' bài đang chỉnh bằng '+pendingImport.records.length+' bài vừa nhập? Hãy tải bản sao trước khi tiếp tục.'))return;
            edit({records:pendingImport.records});setPendingImport(null);setExpandedId('');
            setNotice('Đã nhập bảng. Hãy rà soát môn, tên bài, yêu cầu cần đạt và liên kết học liệu.');
          }}>Dùng bảng đã xem</button>
          <button type="button" className={outlineButton} onClick={()=>setPendingImport(null)}>Hủy nhập</button>
        </div>
      </div>}

      {!plan.records.length&&<div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
        Chưa có bài. Chọn một bài ở bước 1 hoặc thêm thủ công.
      </div>}
      <div className="space-y-3">
        {plan.records.map((r,index)=>{
          const open=expandedId===r.id;
          const candidates=matchGddpResources(r,allStationsInCurrentGrade);
          const checked=(r.resourceLinks||[]).length;
          return <article key={r.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={()=>setExpandedId(open?'':r.id)}
                aria-expanded={open}>
                <span className="block text-sm font-black text-blue-950">{index+1}. {r.lesson||'Bài chưa đặt tên'}</span>
                <span className="mt-1 block text-xs text-slate-600">{r.subject||'Chưa chọn môn'} · {r.week||'Chưa xếp tuần'} · {checked} điểm chạm</span>
              </button>
              <button type="button" className={outlineButton} onClick={()=>{setTeachId(r.id);setExpandedId('');}}>Dạy bài này</button>
              <button type="button" className="min-h-11 rounded-xl px-3 text-sm font-bold text-rose-700 hover:bg-rose-50"
                onClick={()=>{if(window.confirm('Xóa bài này khỏi bản nháp?'))edit({records:plan.records.filter(v=>v.id!==r.id)});}}>Xóa</button>
            </div>
            {open&&<div className="space-y-3 border-t border-slate-100 bg-slate-50/70 p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {recordFields.map(({key,label,rows})=><label key={key} className={'text-sm font-semibold '+(rows===3?'sm:col-span-2':'')}>
                  {label}<textarea className={field+' mt-1 font-normal'} rows={rows} maxLength={key==='content'?10000:3000}
                    value={r[key]||''} onChange={e=>edit({records:plan.records.map(row=>row.id===r.id
                      ?{...row,[key]:e.target.value,
                        ...(key==='lesson'||key==='content'||key==='subject'?{resourceLinks:[]}:{}),
                      }:row)})}/>
                </label>)}
              </div>
              <div className="rounded-xl border border-emerald-100 bg-white p-3">
                <h4 className="font-bold text-emerald-900">Liên kết điểm khám phá (chọn sau khi đối chiếu)</h4>
                <p className="mt-1 text-xs text-slate-600">Chỉ hiển thị điểm khớp nội dung hoặc đã gắn từ nguồn. Không tự xác nhận thay giáo viên.</p>
                {candidates.length?<div className="mt-3 space-y-2">{candidates.slice(0,10).map(item=>{
                  const included=(r.resourceLinks||[]).some(link=>link.stationId===item.station.id&&link.hotspotId===item.hotspot.id);
                  return <label key={item.station.id+':'+item.hotspot.id} className="flex min-h-10 items-start gap-2 text-sm">
                    <input className="mt-1 h-4 w-4" type="checkbox" checked={included} onChange={e=>edit({records:plan.records.map(row=>row.id!==r.id?row:{
                      ...row,resourceLinks:e.target.checked
                        ?[...(row.resourceLinks||[]),{stationId:item.station.id,hotspotId:item.hotspot.id}]
                        :(row.resourceLinks||[]).filter(link=>link.stationId!==item.station.id||link.hotspotId!==item.hotspot.id)
                    })})}/>
                    <span>{item.station.titleVi} · {item.hotspot.titleVi}<span className="ml-1 text-xs text-slate-500">({item.reason})</span></span>
                  </label>;
                })}</div>:<p className="mt-2 text-sm text-amber-900">Không có đề xuất đủ căn cứ. Có thể tự chọn một trạm trong Danh mục 25 trạm sau khi đối chiếu.</p>}
              </div>
            </div>}
          </article>;
        })}
      </div>
    </div>}

    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black text-slate-900">Lưu và xuất kế hoạch</h3>
        <span className="text-xs text-slate-600">{demo?'Chỉ lưu trên thiết bị':'Tài khoản thật · Đồng bộ thủ công'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy||!plan.records.length} className={outlineButton} onClick={()=>void exportAs('excel')}>Tải Excel</button>
        <button type="button" disabled={busy||!plan.records.length} className={outlineButton} onClick={()=>void exportAs('word')}>Tải Word</button>
        <button type="button" className={outlineButton} onClick={()=>saveJson(plan)}>Tải bản sao JSON</button>
        {!demo&&remote&&<button type="button" className={outlineButton} disabled={busy} onClick={()=>{
          if(plan.records.length&&!window.confirm('Mở lại kế hoạch trên tài khoản sẽ thay bản đang xem. Hãy tải bản sao nếu bạn vừa chỉnh trên thiết bị.'))return;
          setPlan(withWorkspaceDefaults(remote,remote.grade));setCurrentGrade(remote.grade);
          setConfirmed(false);setNotice('Đã mở kế hoạch đang lưu trên tài khoản.');
        }}>Mở bản đang lưu trên tài khoản</button>}
      </div>
      <label className="flex items-start gap-2 text-sm text-slate-800">
        <input className="mt-1 h-4 w-4" type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>
        <span>Tôi đã đối chiếu tên bài, yêu cầu cần đạt, vị trí tích hợp, nội dung và học liệu với SGK đang dùng; kiểm tra độ phù hợp trước khi triển khai.</span>
      </label>
      {demo
        ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
          Kế hoạch tự lưu trên thiết bị. Các nút nhập, sửa, xuất Word/Excel, mở bài vẫn dùng được; không phát sinh ghi Firestore.
        </p>
        : <div className="space-y-2">
            <button type="button" className={mainButton} disabled={!saveAllowed} onClick={()=>void syncAccount()}>
              {busy?'Đang lưu…':synced?'Kiểm tra bản lưu (không ghi lại)':'Lưu kế hoạch vào tài khoản'}
            </button>
            {!serverChecked&&<p className="text-xs text-amber-800">Tạm khóa đồng bộ vì chưa xác nhận được bản kế hoạch hiện có trên máy chủ; tránh ghi đè dữ liệu.</p>}
            {(!plan.records.length||incomplete>0||!confirmed)&&<p className="text-xs text-slate-600">Cần có bài đủ môn, tên bài, nội dung GDĐP và tích chọn đã đối chiếu trước khi lưu lên tài khoản.</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={outlineButton} disabled={busy||!serverChecked||!remote?.records.length||sharing}
                onClick={async()=>{
                  if(!window.confirm('Gửi đề xuất này cho quản trị duyệt? Đây là thao tác ghi dữ liệu lên máy chủ.'))return;
                  setSharing(true);setError('');
                  try{
                    await authService.submitProposal({stationId:'teacher-plan',stationName:'Kế hoạch tích hợp khối '+plan.grade,
                      grade:plan.grade,text:'Đề xuất xem xét kế hoạch '+plan.school+' · '+plan.book+' · '+plan.year+'.'});
                    setNotice('Đã gửi đề xuất để quản trị xem xét.');
                  }catch(e){setError((e as Error).message);}
                  finally{setSharing(false);}
                }}>Gửi đề xuất (chỉ khi cần)</button>
            </div>
          </div>}
      <p className="text-xs text-slate-500">
        Một tài khoản máy chủ hiện lưu một kế hoạch đang dùng. Bản nháp theo khối/năm học trên thiết bị và bản sao Word/Excel
        giúp tránh mất nội dung khi thay kế hoạch. Không tự gửi dữ liệu khi sửa.
      </p>
    </section>

    {!!teachId&&<div id="teacher-plan-teach" className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black text-emerald-950">Dạy bài đã chọn</h3>
        <button type="button" className={outlineButton} onClick={()=>setTeachId('')}>Đóng</button>
      </div>
      <GddpTeacherLookup key={teachId+'-'+plan.grade}
        stations={allStationsInCurrentGrade} currentGrade={plan.grade} onGradeChange={setCurrentGrade}
        privateRecords={plan.records} privateYear={plan.year}
        privateSource={'Kế hoạch riêng · '+plan.school+' · '+plan.book+' · '+plan.year}
        initialRecordId={teachId} onOpenStudentStage1={station=>openStation(station,1)}/>
    </div>}
  </section>;
}
