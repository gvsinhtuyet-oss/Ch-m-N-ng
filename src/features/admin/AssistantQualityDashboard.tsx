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
  const stopRef=useRef(false);
  useEffect(()=>()=>{stopRef.current=true;},[]);
  const accessible=role==='admin' && Boolean(currentUser) && currentUser?.id!=='admin-demo';

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

  async function runChecks(){
    if(busy||!accessible)return;
    stopRef.current=false;
    setBusy(true);setProcessed(0);setTargetCount(testCases.length);
    const next:Record<string,QualityResult>={};
    try{
      for(let i=0;i<testCases.length;i++){
        if(stopRef.current)break;
        const item=testCases[i];
        try{next[item.id]=evaluateAssistantQualityCase(item);}
        catch(error){
          next[item.id]={caseId:item.id,answer:'',sources:[],found:false,layer:'error',confidence:'low',
            durationMs:0,autoStatus:'flag',diagnostic:'Lỗi kiểm định: '+(error instanceof Error?error.message:String(error))};
        }
        if(i%6===5||i===testCases.length-1){
          setResults(old=>({...old,...next}));
          setProcessed(i+1);
          // Yield to rendering on mobile rather than blocking the main thread.
          await new Promise<void>(resolve=>window.setTimeout(resolve,0));
        }
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
        Câu hỏi kiến thức, phương ngữ và hỗ trợ giáo viên vẫn cần được thẩm định thủ công.
      </p>
      <p className="mt-2 text-xs text-indigo-900">Kết quả chỉ lưu trong phiên mở trang này; tải báo cáo JSON trước khi thoát. Không lưu vào Firestore.</p>
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
        {busy?'Đang kiểm tra '+processed+'/'+targetCount:'Chạy '+testCases.length+' ca kiểm định'}
      </button>
      <button type="button" disabled={busy||!evaluated.length} onClick={download}
        className="rounded-xl border border-indigo-300 bg-white px-4 py-2.5 text-sm font-bold text-indigo-800 disabled:opacity-50">Xuất báo cáo JSON</button>
      {busy&&<span role="status" className="self-center text-xs text-slate-600">Đang xử lý trên thiết bị này, không gửi dữ liệu ra máy chủ.</span>}
    </div>
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
