import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_25_STATIONS } from '../../data/allStations';
import { useApp } from '../../contexts/AppContext';
import {
  ASSISTANT_QUALITY_CASES, QUALITY_DIMENSIONS,
  calculateQualityScore, evaluateAssistantQualityCase,
  type QualityDimension, type QualityRating, type QualityResult,
} from './assistantQualityEngine';

const pill = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900';
const dimensionIds=Object.keys(QUALITY_DIMENSIONS) as QualityDimension[];
const QA_HISTORY_KEY = 'cham-danang-chatbot-quality-history:v1:';
const MAX_AUDITS = 8;
type SavedAudit = {
  id:string;createdAt:string;grade:number;stationId:string;
  results:Record<string,QualityResult>;ratings:Record<string,QualityRating>;
};
function loadHistory(userId:string):SavedAudit[] {
  if (!userId) return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(QA_HISTORY_KEY+userId)||'[]') as unknown;
    if (!Array.isArray(stored)) return [];
    return stored.filter((x):x is SavedAudit => Boolean(x && typeof x==='object'
      && typeof x.id==='string' && typeof x.createdAt==='string'
      && x.results && x.ratings)).slice(0,MAX_AUDITS);
  } catch { return []; }
}

function saveJson(filename:string, data:unknown):void {
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url; link.download=filename;
  document.body.appendChild(link);link.click();link.remove();
  URL.revokeObjectURL(url);
}

export const AssistantQualityDashboard:React.FC=()=>{
  const {role,currentUser}=useApp();
  const [grade,setGrade]=useState(0);
  const [stationId,setStationId]=useState('all');
  const [dimension,setDimension]=useState<QualityDimension|'all'>('all');
  const [resultFilter,setResultFilter]=useState<'all'|'flag'|'pass'|'review'|'pending'>('all');
  const [results,setResults]=useState<Record<string,QualityResult>>({});
  const [ratings,setRatings]=useState<Record<string,QualityRating>>({});
  const [busy,setBusy]=useState(false);
  const [processed,setProcessed]=useState(0);
  const [targetCount,setTargetCount]=useState(0);
  const [limit,setLimit]=useState(12);
  const [history,setHistory]=useState<SavedAudit[]>([]);
  const [historyError,setHistoryError]=useState('');
  const [attentionLimit,setAttentionLimit]=useState(12);
  useEffect(()=>{setHistory(loadHistory(currentUser?.id||''));setHistoryError('');},[currentUser?.id]);
  const stopRef=useRef(false);
  useEffect(()=>()=>{stopRef.current=true;},[]);
  const accessible=role==='admin' && currentUser?.role==='admin';

  const availableStations=useMemo(()=>ALL_25_STATIONS.filter(s=>!grade||s.grade===grade),[grade]);
  const scopeCases=useMemo(()=>ASSISTANT_QUALITY_CASES.filter(c=>
    (!grade||ALL_25_STATIONS.some(s=>s.id===c.stationId&&s.grade===grade))
    &&(stationId==='all'||c.stationId===stationId)),[grade,stationId]);
  const testCases=useMemo(()=>scopeCases.filter(c=>dimension==='all'||c.dimension===dimension),[scopeCases,dimension]);
  const visibleCases=useMemo(()=>testCases.filter(c=>{
    const status=results[c.id]?.autoStatus;
    return resultFilter==='all'||(resultFilter==='pending'?!status:status===resultFilter);
  }),[testCases,resultFilter,results]);
  const summary=useMemo(()=>calculateQualityScore(scopeCases,ratings),[scopeCases,ratings]);
  const evaluated=scopeCases.filter(c=>results[c.id]);
  const passCount=evaluated.filter(c=>results[c.id].autoStatus==='pass').length;
  const flagCount=evaluated.filter(c=>results[c.id].autoStatus==='flag').length;
  const reviewCount=evaluated.filter(c=>results[c.id].autoStatus==='review').length;
  const routeTotal=scopeCases.filter(c=>c.check==='context').length;
  const routePass=scopeCases.filter(c=>c.check==='context'&&results[c.id]?.autoStatus==='pass').length;
  const completedRoute=scopeCases.filter(c=>c.check==='context'&&results[c.id]).length;
  const evidenceTotal=scopeCases.filter(c=>c.check==='evidence').length;
  const evidenceChecked=scopeCases.filter(c=>c.check==='evidence'&&results[c.id]).length;
  const evidenceFound=scopeCases.filter(c=>c.check==='evidence'&&results[c.id]?.autoStatus==='review').length;
  const allCases=ASSISTANT_QUALITY_CASES;
  const inspectedStations=new Set(allCases.filter(c=>results[c.id]).map(c=>c.stationId)).size;
  const gradeStats=useMemo(()=>[1,2,3,4,5].map(gradeNumber=>{
    const ids=new Set(ALL_25_STATIONS.filter(st=>st.grade===gradeNumber).map(st=>st.id));
    const rows=allCases.filter(c=>ids.has(c.stationId));
    const technical=rows.filter(c=>results[c.id] && ['context','guard','unknown'].includes(c.check));
    const passed=technical.filter(c=>results[c.id].autoStatus==='pass').length;
    const reviewed=rows.filter(c=>ratings[c.id]!==undefined);
    const correct=reviewed.filter(c=>ratings[c.id]===2).length;
    const flagged=rows.filter(c=>results[c.id]?.autoStatus==='flag'||ratings[c.id]===0).length;
    const stationsTested=new Set(rows.filter(c=>results[c.id]).map(c=>c.stationId)).size;
    return {grade:gradeNumber,stationsTested,passed,checked:technical.length,
      technicalPct:technical.length?Math.round(100*passed/technical.length):null,
      reviewed:reviewed.length,correct,expertPct:reviewed.length?Math.round(100*correct/reviewed.length):null,flagged};
  }),[allCases,results,ratings]);
  const attention=useMemo(()=>allCases.filter(c=>
    Boolean(results[c.id]) && (results[c.id].autoStatus==='flag'||ratings[c.id]===0||ratings[c.id]===1)
  ),[allCases,results,ratings]);
  const hasAnyResult=Object.keys(results).length>0;

  function storeHistory(nextResults:Record<string,QualityResult>,nextRatings:Record<string,QualityRating>,scopeGrade=grade,scopeStation=stationId) {
    if(!accessible||!currentUser?.id||Object.keys(nextResults).length===0)return;
    const audit:SavedAudit={id:Date.now()+'-'+Math.random().toString(36).slice(2,8),
      createdAt:new Date().toISOString(),grade:scopeGrade,stationId:scopeStation,
      results:nextResults,ratings:nextRatings};
    const updated=[audit,...history].slice(0,MAX_AUDITS);
    try {
      window.localStorage.setItem(QA_HISTORY_KEY+currentUser.id,JSON.stringify(updated));
      setHistory(updated);setHistoryError('');
    } catch {setHistoryError('Thiết bị không lưu được lịch sử. Hãy xuất báo cáo JSON để giữ kết quả.');}
  }
  function restoreAudit(audit:SavedAudit) {
    if(!accessible)return;
    setResults(audit.results);setRatings(audit.ratings);
    setGrade(audit.grade);setStationId(audit.stationId);setDimension('all');
    setResultFilter('all');setLimit(12);setAttentionLimit(12);
  }

  async function runChecks(entireProgram=false){
    if(busy||!accessible)return;
    const selected=entireProgram?allCases:testCases;
    stopRef.current=false;
    setBusy(true);setProcessed(0);setTargetCount(selected.length);
    const next:Record<string,QualityResult>={};
    try{
      for(let i=0;i<selected.length;i++){
        if(stopRef.current)break;
        const item=selected[i];
        try{next[item.id]=evaluateAssistantQualityCase(item);}
        catch(error){
          next[item.id]={caseId:item.id,answer:'',sources:[],found:false,layer:'error',confidence:'low',
            durationMs:0,autoStatus:'flag',diagnostic:'Lỗi kiểm định: '+(error instanceof Error?error.message:String(error))};
        }
        if(i%6===5||i===selected.length-1){
          setResults(old=>({...old,...next}));
          setProcessed(i+1);
          // Yield to rendering on mobile rather than blocking the main thread.
          await new Promise<void>(resolve=>window.setTimeout(resolve,0));
        }
      }
      if(!stopRef.current && Object.keys(next).length){
        // Each complete run becomes a dated local audit. Save again after manual grading.
        storeHistory({...results,...next},ratings,entireProgram?0:grade,entireProgram?'all':stationId);
      }
    }finally{if(!stopRef.current)setBusy(false);}
  }
  const download=()=>{
    if(!accessible)return;
    const exported=scopeCases.filter(c=>results[c.id]).map(c=>({
      ...c,station:ALL_25_STATIONS.find(s=>s.id===c.stationId)?.titleVi,
      output:results[c.id],manualRating:ratings[c.id]??null,
    }));
    saveJson('cham-danang-chatbot-qa-'+new Date().toISOString().slice(0,10)+'.json',{
      generatedAt:new Date().toISOString(),kind:'LOCAL_ADMIN_DIAGNOSTIC',
      note:'Báo cáo chỉ phản ánh những ca đã chạy và đã được chấm. Khớp từ khóa/đúng tuyến không đồng nghĩa câu trả lời đúng khoa học.',
      filter:{grade,stationId},summary,automatic:{evaluated:evaluated.length,pass:passCount,flag:flagCount,review:reviewCount},
      cases:exported,
    });
  };

  if(!accessible) return <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">Chỉ tài khoản Admin thật mới xem được kiểm định chatbot.</p>;
  return <section aria-label="Kiểm định chất lượng chatbot" className="space-y-4">
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:p-5">
      <h2 className="text-xl font-black text-indigo-950">Kiểm định chất lượng Trợ lý khám phá</h2>
      <p className="mt-2 text-sm text-slate-700">
        Chạy trực tiếp công cụ truy hồi nội bộ, không gọi AI/API và không ghi dữ liệu học sinh.
        Kiểm thử đúng tuyến 121 điểm khám phá chỉ là kiểm tra kỹ thuật.
        Bộ đối chiếu bổ sung kiểm tra sự liên hệ giữa câu trả lời và lời thuyết minh ở đủ 121 điểm.
        Câu hỏi kiến thức, phương ngữ và hỗ trợ giáo viên vẫn cần được thẩm định thủ công.
      </p>
      <p className="mt-2 text-xs text-indigo-900">Kết quả kiểm định tự lưu tối đa 8 phiên trên trình duyệt Admin hiện tại. Không lưu lên máy chủ/Firestore; hãy xuất báo cáo JSON khi cần chuyển máy hoặc lưu hồ sơ lâu dài.</p>
    </div>
    <div className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1 text-xs font-bold">Khối lớp
        <select className={pill} disabled={busy} value={grade} onChange={e=>{setGrade(Number(e.target.value));setStationId('all');setLimit(12);}}>
          <option value={0}>Tất cả khối</option>
          {[1,2,3,4,5].map(g=><option key={g} value={g}>Khối {g}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-bold">Trạm
        <select className={pill} disabled={busy} value={stationId} onChange={e=>{setStationId(e.target.value);setLimit(12);}}>
          <option value="all">Tất cả trạm</option>
          {availableStations.map(s=><option key={s.id} value={s.id}>{s.titleVi}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-bold">Tiêu chí
        <select className={pill} disabled={busy} value={dimension} onChange={e=>{setDimension(e.target.value as QualityDimension|'all');setLimit(12);}}>
          <option value="all">Tất cả tiêu chí</option>
          {dimensionIds.map(id=><option key={id} value={id}>{QUALITY_DIMENSIONS[id].label}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-bold">Kết quả tự động
        <select className={pill} value={resultFilter} onChange={e=>{setResultFilter(e.target.value as typeof resultFilter);setLimit(12);}}>
          <option value="all">Tất cả</option><option value="flag">Có dấu hiệu lỗi</option>
          <option value="review">Cần đọc thẩm định</option><option value="pass">Đạt kiểm tra kỹ thuật</option>
          <option value="pending">Chưa chạy</option>
        </select>
      </label>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={busy||!testCases.length} onClick={()=>void runChecks()}
        className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
        {busy?'Đang kiểm tra '+processed+'/'+targetCount:'Chạy '+testCases.length+' ca theo bộ lọc'}
      </button>
      <button type="button" disabled={busy} onClick={()=>void runChecks(true)}
        className="rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Kiểm tra toàn bộ 25 trạm</button>
      <button type="button" disabled={busy||!hasAnyResult} onClick={()=>storeHistory(results,ratings)}
        className="rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm font-bold text-sky-800 disabled:opacity-50">Lưu kết quả sau khi chấm</button>
      <button type="button" disabled={busy||!evaluated.length} onClick={download}
        className="rounded-xl border border-indigo-300 bg-white px-4 py-2.5 text-sm font-bold text-indigo-800 disabled:opacity-50">Xuất báo cáo JSON</button>
      {busy&&<span role="status" className="self-center text-xs text-slate-600">Đang xử lý trên thiết bị này, không gửi dữ liệu ra máy chủ.</span>}
    </div>
    {historyError&&<p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{historyError}</p>}
    <p className="text-xs text-slate-600">Kiểm tra toàn bộ gồm tất cả 25 trạm, các điểm khám phá và câu hỏi mẫu. Lịch sử tự lưu sau mỗi lượt chạy trên <strong>trình duyệt đang dùng</strong>; sau khi giáo viên chấm, bấm “Lưu kết quả sau khi chấm”. Chưa đồng bộ lịch sử lên tài khoản hoặc máy chủ.</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        ['Ca đã chạy',evaluated.length+'/'+scopeCases.length],
        ['Đạt kiểm tra kỹ thuật',passCount],
        ['Có dấu hiệu lỗi',flagCount],
        ['Cần đọc thẩm định',reviewCount],
      ].map(([name,value])=><div key={name} className="rounded-xl border bg-white p-4">
        <div className="text-xs text-slate-600">{name}</div><div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
      </div>)}
    </div>
    <div className="rounded-2xl border bg-white p-4 sm:p-5 space-y-3">
      <h3 className="font-extrabold text-slate-900">Biểu đồ chất lượng theo 5 khối</h3>
      <p className="text-xs text-slate-600">Cột màu xanh biểu thị <strong>đạt kiểm tra kỹ thuật</strong> trên số ca đã chạy. Điểm chuyên môn chỉ tính các câu đã được giáo viên chấm; không gộp hai tỷ lệ làm một.</p>
      <p className="text-sm font-bold text-sky-800">Đã kiểm tra {inspectedStations}/25 trạm</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {gradeStats.map(g=><div key={g.grade} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex justify-between gap-2 text-sm font-extrabold"><span>Khối {g.grade}</span><span>{g.stationsTested}/5 trạm</span></div>
          <p className="mt-3 text-xs text-slate-600">Kỹ thuật: {g.technicalPct===null?'Chưa chạy':g.technicalPct+'%'} ({g.passed}/{g.checked} ca)</p>
          <div role="img" aria-label={`Khối ${g.grade}: ${g.technicalPct===null?'chưa kiểm tra':g.technicalPct+' phần trăm ca kỹ thuật đạt'}`}
            className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-sky-600" style={{width:(g.technicalPct??0)+'%'}}/>
          </div>
          <p className="mt-3 text-xs text-slate-600">Chuyên môn: {g.expertPct===null?'Chưa chấm':g.expertPct+'%'} ({g.correct}/{g.reviewed} câu đúng)</p>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600" style={{width:(g.expertPct??0)+'%'}}/></div>
          <p className="mt-2 text-xs font-semibold text-rose-700">Cần xem lại: {g.flagged} ca</p>
        </div>)}
      </div>
    </div>
    <div className="rounded-2xl border bg-white p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-extrabold">Kiểm tra ngữ cảnh 121 điểm</h3>
        <span className="font-bold text-indigo-800">{routePass}/{completedRoute} ca đã chạy đúng tuyến</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-indigo-600" style={{width:(completedRoute?routePass/completedRoute*100:0)+'%'}}/>
      </div>
      <p className="text-xs text-slate-500">Có {routeTotal} ca theo bộ lọc. Đúng tuyến không xác nhận tính đúng đắn của kiến thức.</p>
    </div>
    <div className="rounded-2xl border bg-white p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-extrabold">Đối chiếu học liệu 121 điểm khám phá</h3>
        <span className="font-bold text-amber-800">{evidenceFound}/{evidenceChecked} ca có đoạn bám học liệu</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-amber-500" style={{width:(evidenceChecked?evidenceFound/evidenceChecked*100:0)+'%'}}/>
      </div>
      <p className="text-xs text-slate-600">Có {evidenceTotal} điểm theo bộ lọc. Bài kiểm tra chỉ tìm đoạn nội dung có liên hệ với lời thuyết minh, không xác nhận nguồn gốc hay sự chính xác của dữ kiện. Các trường hợp khớp được đánh dấu <strong>Cần kiểm duyệt</strong>, không tự động công nhận đạt chuyên môn.</p>
    </div>
    <div className="rounded-2xl border bg-white p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-extrabold">Chấm chuyên môn theo 6 tiêu chí</h3>
        <span className="text-lg font-black text-indigo-800">{summary.score===null?'Chưa đủ đánh giá':summary.score+'/100 (tạm tính)'}</span>
      </div>
      <p className="text-xs text-slate-600">Điểm tạm tính chỉ xuất hiện khi mỗi tiêu chí có ít nhất một câu được người kiểm duyệt chấm. Không phải điểm kiểm định chính thức của 25 trạm.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {summary.dimensions.map(d=><div key={d.id} className="rounded-xl bg-slate-50 p-3 text-sm">
          <div className="flex justify-between gap-2"><strong>{d.label}</strong><span>{d.weight} điểm</span></div>
          <p className="text-xs text-slate-600">{d.reviewed}/{d.total} câu đã chấm {d.average===null?'':('· trung bình '+(d.average*100).toFixed(0)+'%')}</p>
        </div>)}
      </div>
      <p className="text-xs text-slate-500">Quy ước: Đúng 2 điểm, một phần 1 điểm, sai 0 điểm. Cần đối chiếu nguồn trước khi chấm.</p>
    </div>
    <div className="space-y-3 rounded-2xl border border-rose-100 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-extrabold text-slate-900">Danh sách câu trả lời cần sửa / cần đối chiếu</h3>
        <span className="rounded-lg bg-rose-50 px-3 py-1 text-sm font-bold text-rose-700">{attention.length} ca</span>
      </div>
      <p className="text-xs text-slate-600">Gồm ca tự động báo lỗi hoặc được người kiểm duyệt chấm Sai/Một phần. Báo lỗi kỹ thuật chưa chắc là sai kiến thức; cần đọc nguồn và sửa học liệu trước khi xác nhận.</p>
      {attention.length===0?<p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{hasAnyResult?'Chưa phát hiện ca cần sửa trong số ca đã chạy; các câu chưa chấm vẫn cần giáo viên đối chiếu.':'Chưa có kết quả. Hãy chạy kiểm định trước.'}</p>
        :attention.slice(0,attentionLimit).map(c=>{
          const answer=results[c.id];
          const station=ALL_25_STATIONS.find(s=>s.id===c.stationId);
          return <article key={c.id} className="min-w-0 rounded-xl border border-rose-200 bg-rose-50/40 p-3">
            <div className="flex flex-wrap gap-2 text-xs font-bold text-rose-800"><span>Khối {station?.grade} · {station?.titleVi}</span><span>· {ratings[c.id]===0?'Giáo viên chấm Sai':ratings[c.id]===1?'Giáo viên chấm Một phần':'Tự động phát hiện dấu hiệu lỗi'}</span></div>
            <p className="mt-1 break-words text-sm font-bold text-slate-900">{c.question}</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{answer?.answer||'(Không có câu trả lời)'}</p>
            <p className="mt-1 break-words text-xs text-slate-500">{answer?.diagnostic}</p>
          </article>;
        })}
      {attentionLimit<attention.length&&<button type="button" onClick={()=>setAttentionLimit(n=>n+12)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-800">Xem thêm 12 ca</button>}
    </div>
    <div className="space-y-3 rounded-2xl border bg-white p-4 sm:p-5">
      <h3 className="text-lg font-extrabold">Lịch sử kiểm định trên thiết bị này</h3>
      <p className="text-xs text-slate-600">Tự lưu tối đa {MAX_AUDITS} phiên gần nhất trong trình duyệt hiện tại, theo tài khoản Admin. Muốn lưu lâu dài hoặc chuyển máy, xuất báo cáo JSON. Xóa dữ liệu trình duyệt sẽ mất lịch sử tại đây.</p>
      {history.length===0?<p className="text-sm text-slate-500">Chưa có lượt kiểm định nào được lưu.</p>
        :<div className="grid gap-2 sm:grid-cols-2">{history.map(h=>{
          const done=Object.keys(h.results).length;
          const reviewed=Object.keys(h.ratings).length;
          const failed=allCases.filter(c=>h.results[c.id]?.autoStatus==='flag'||h.ratings[c.id]===0).length;
          return <div key={h.id} className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl border bg-slate-50 p-3">
            <div><p className="text-sm font-bold text-slate-900">{new Date(h.createdAt).toLocaleString('vi-VN')}</p>
              <p className="text-xs text-slate-600">{done} ca đã chạy · {reviewed} câu đã chấm · {failed} ca cần kiểm tra</p>
            </div>
            <button type="button" onClick={()=>restoreAudit(h)} disabled={busy} className="min-h-10 rounded-lg bg-sky-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Xem lại</button>
          </div>;
        })}</div>}
    </div>
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-extrabold">Chi tiết từng câu kiểm định</h3>
        <span className="text-xs text-slate-600">Hiển thị {Math.min(limit,visibleCases.length)}/{visibleCases.length} ca</span>
      </div>
      {visibleCases.slice(0,limit).map(row=>{
        const r=results[row.id];
        const station=ALL_25_STATIONS.find(s=>s.id===row.stationId);
        return <article key={row.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-800">Khối {station?.grade} · {station?.titleVi} · {QUALITY_DIMENSIONS[row.dimension].label}</span>
            <span className={'rounded-md px-2 py-1 text-xs font-bold '+(!r?'bg-slate-100 text-slate-700':r.autoStatus==='flag'?'bg-rose-100 text-rose-800':r.autoStatus==='pass'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-900')}>
              {!r?'Chưa chạy':r.autoStatus==='flag'?'Cần kiểm tra lỗi':r.autoStatus==='pass'?'Đạt kỹ thuật':'Cần kiểm duyệt'}
            </span>
          </div>
          <p className="font-semibold text-slate-900">{row.question}</p>
          <p className="text-xs text-slate-600">Mục đích: {row.note}</p>
          {r&&<div className="space-y-2 rounded-xl bg-slate-50 p-3">
            <p className="whitespace-pre-wrap break-words text-sm text-slate-800">{r.answer||'(Không có câu trả lời)'}</p>
            <p className="text-xs text-slate-600">{r.diagnostic} · {r.durationMs} ms (truy hồi nội bộ)</p>
            {r.sources.length>0&&<div className="flex flex-wrap gap-2 text-xs">
              {r.sources.map((source,i)=>source.url?.startsWith('https://')
                ? <a key={i} href={source.url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline">{source.label}</a>
                : <span key={i} className="text-slate-500">{source.label}</span>)}
            </div>}
          </div>}
          <label className="flex flex-wrap items-center gap-2 text-xs font-bold">Giáo viên/Admin chấm sau đối chiếu
            <select className={pill} value={ratings[row.id]===undefined?'':String(ratings[row.id])}
              onChange={e=>{
                const value=e.target.value;
                setRatings(old=>{
                  const updated={...old};
                  if(value==='')delete updated[row.id];
                  else updated[row.id]=Number(value) as QualityRating;
                  return updated;
                });
              }}>
              <option value="">Chưa chấm</option><option value="2">Đúng</option>
              <option value="1">Một phần</option><option value="0">Sai / thiếu căn cứ</option>
            </select>
          </label>
        </article>;
      })}
      {limit<visibleCases.length&&<button type="button" onClick={()=>setLimit(n=>n+12)} className="rounded-xl border bg-white px-4 py-2 text-sm font-bold">Hiện thêm 12 câu</button>}
    </div>
  </section>;
};
