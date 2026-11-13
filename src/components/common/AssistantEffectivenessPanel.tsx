import React,{useEffect,useMemo,useRef,useState} from 'react';
import knowledge from '../../data/assistantKnowledge.json';
import {learningAssessmentBank,learningProfiles,learningExplanation,presentAssessmentQuestion} from '../../services/AssistantLearningEngine';
import {readEffectiveness,saveEffectiveness,summarizeEffectiveness,effectivenessCSV,type EffectivenessMeasure,type LearningMeasure,type TeacherMeasure} from '../../services/AssistantEffectivenessService';

interface Props {open:boolean;onClose:()=>void;audience:'student'|'teacher';grade:number;scope:string;initialTopic?:string;}
type Item=typeof learningAssessmentBank[number];
interface Session {id:string;topicId:string;grade:number;items:Item[];}
export default function AssistantEffectivenessPanel({open,onClose,audience,grade,scope,initialTopic}:Props){
  const teacher=audience==='teacher';
  const [topic,setTopic]=useState('');
  const [rows,setRows]=useState<EffectivenessMeasure[]>([]);
  const [phase,setPhase]=useState<'idle'|'pre'|'study'|'post'|'done'>('idle');
  const [session,setSession]=useState<Session|null>(null);
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<(number|null)[]>([null,null,null,null]);
  const [completed,setCompleted]=useState<LearningMeasure|null>(null);
  const [saved,setSaved]=useState(false);
  const [error,setError]=useState('');
  const [timer,setTimer]=useState<{start:number;grade:number;topicId:string}|null>(null);
  const [elapsed,setElapsed]=useState<number|null>(null);
  const [baseline,setBaseline]=useState('');
  const [edits,setEdits]=useState<TeacherMeasure['edits']|''>('');
  const panel=useRef<HTMLDivElement>(null);
  const inputClass='mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-base';
  const button='min-h-11 rounded-xl bg-sky-800 px-4 py-3 text-sm font-bold text-white disabled:opacity-40';
  useEffect(()=>{
    setRows(readEffectiveness(localStorage,scope));setSession(null);setPhase('idle');setCompleted(null);setSaved(false);setError('');setTimer(null);setElapsed(null);setEdits('');setBaseline('');
    const card=knowledge.find(card=>card.term===initialTopic);setTopic(card?.id||'');
  },[scope]);
  useEffect(()=>{if(!open)return;const previous=document.activeElement as HTMLElement|null;panel.current?.focus();return()=>previous?.focus();},[open]);
  const summary=useMemo(()=>summarizeEffectiveness(rows),[rows]);
  const topics=knowledge.filter(card=>teacher||learningAssessmentBank.some(item=>item.topicId===card.id));
  const selected=knowledge.find(card=>card.id===topic);
  const activeCard=session?knowledge.find(card=>card.id===session.topicId):undefined;
  const profile=session?learningProfiles.find(profile=>profile.id===session.topicId):undefined;
  const activeIndex=phase==='post'?index+2:index;
  const activeQuestion=session?.items[activeIndex];
  const store=(row:EffectivenessMeasure)=>{
    try{saveEffectiveness(localStorage,scope,row);setRows(readEffectiveness(localStorage,scope));setSaved(true);setError('');}
    catch{setError('Thiết bị chưa lưu được kết quả. Hãy giữ màn hình này để xem; kết quả chưa được đồng bộ lên máy chủ.');}
  };
  const startStudent=()=>{
    if(!selected)return;
    const id=crypto.randomUUID();
    const items=['pre','post'].flatMap(form=>['understanding','application'].map(domain=>learningAssessmentBank.find(item=>item.topicId===topic&&item.form===form&&item.domain===domain)!));
    if(items.some(item=>!item)){setError('Chủ đề này chưa có đủ hai bộ câu hỏi đối chiếu.');return;}
    setSession({id,grade,topicId:topic,items:items.map(item=>presentAssessmentQuestion(item,id+item.id))});
    setAnswers([null,null,null,null]);setIndex(0);setPhase('pre');setSaved(false);setCompleted(null);setError('');
  };
  const next=()=>{
    if(!session||answers[activeIndex]===null)return;
    if(index===0){setIndex(1);return;}
    if(phase==='pre'){setPhase('study');setIndex(0);return;}
    const score=(i:number):0|1=>answers[i]===session.items[i].correctIndex?1:0;
    setCompleted({version:1,id:session.id,kind:'student',at:new Date().toISOString(),grade:session.grade,topicId:session.topicId,preUnderstanding:score(0),preApplication:score(1),postUnderstanding:score(2),postApplication:score(3)});
    setPhase('done');
  };
  if(!open)return null;
  return <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Theo dõi hiệu quả học tập" className="fixed inset-0 z-[75] overflow-y-auto bg-slate-950/60 p-3 sm:p-6" onKeyDown={event=>{
    if(event.key==='Escape'){event.stopPropagation();onClose();}
    if(event.key==='Tab'){
      const controls=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')||[]).filter(element=>element.getClientRects().length);
      const first=controls[0],last=controls.slice(-1)[0];
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===panel.current)){event.preventDefault();first?.focus();}
    }
  }}>
    <section className="mx-auto max-w-3xl space-y-4 rounded-2xl bg-white p-4 sm:p-6">
      <header className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black text-sky-950">{teacher?'Ghi nhận hiệu quả chuẩn bị bài':'Em học được gì trước và sau?'}</h2><p className="mt-1 text-xs text-slate-600">Chỉ lưu trên thiết bị theo tài khoản đang dùng. Không nhập tên hoặc thông tin cá nhân học sinh.</p></div><button type="button" className="min-h-11 shrink-0 rounded-xl border px-3 py-2 font-bold" onClick={onClose}>Quay lại</button></header>
      {error&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {(teacher||phase==='idle')&&<label className="block text-sm font-bold">Chủ đề<select aria-label="Chủ đề đo hiệu quả" className={inputClass} value={topic} disabled={!!timer} onChange={event=>{setTopic(event.target.value);setElapsed(null);setSaved(false);}}><option value="">Chọn chủ đề</option>{topics.map(card=><option key={card.id} value={card.id}>{card.term}</option>)}</select></label>}
      {teacher?<>
        <p className="text-sm">Bấm bắt đầu, quay lại chatbox để chuẩn bị bài, rồi mở lại mục này và bấm kết thúc. Đồng hồ tính cả thời gian rời bảng này; hãy dùng cho một công việc liên tục.</p>
        {!timer&&elapsed===null&&<button type="button" className={button} disabled={!topic} onClick={()=>{setTimer({start:Date.now(),grade,topicId:topic});setSaved(false);setEdits('');setError('');}}>Bắt đầu chuẩn bị bài</button>}
        {timer&&elapsed===null&&<div className="space-y-2 rounded-xl bg-sky-50 p-3"><p role="status">Đang ghi thời gian chuẩn bị. Có thể quay lại chatbox rồi mở lại.</p><button type="button" className={button} onClick={()=>{setElapsed(Math.max(1,Math.round((Date.now()-timer.start)/1000)));}}>Kết thúc chuẩn bị</button></div>}
        {elapsed!==null&&<div className="space-y-3 rounded-xl border p-3">
          <p>Thời gian thực đo: <strong>{elapsed} giây</strong> ({(elapsed/60).toFixed(2)} phút).</p>
          <label className="block text-sm">Thời gian chuẩn bị bài tương tự trước đây, phút (tự ghi, có thể bỏ trống)<input aria-label="Thời gian đối chiếu tự ghi" className={inputClass} type="number" min="0.1" max="1440" step="0.1" value={baseline} onChange={event=>setBaseline(event.target.value)} disabled={saved}/></label>
          <label className="block text-sm">Mức chỉnh sửa trước khi sử dụng<select aria-label="Mức chỉnh sửa" className={inputClass} value={edits} disabled={saved} onChange={event=>setEdits(event.target.value as TeacherMeasure['edits'])}><option value="">Chọn mức chỉnh sửa</option><option value="none">Dùng được ngay</option><option value="light">Chỉnh sửa ít</option><option value="major">Chỉnh sửa nhiều</option><option value="unusable">Chưa dùng được</option></select></label>
          <button type="button" className={button} disabled={saved||!edits||!!baseline&&(!Number.isFinite(Number(baseline))||Number(baseline)<=0||Number(baseline)>1440)} onClick={()=>{
            if(!timer||!edits)return;
            store({version:1,id:crypto.randomUUID(),kind:'teacher',at:new Date().toISOString(),grade:timer.grade,topicId:timer.topicId,elapsedSeconds:elapsed,edits,...(baseline?{baselineMinutes:Number(baseline)}:{})});
          }}>{saved?'Đã lưu trên thiết bị':'Lưu lượt chuẩn bị'}</button>
          {saved&&<button type="button" className="ml-2 min-h-11 rounded-xl border p-3 text-sm font-bold" onClick={()=>{setTimer(null);setElapsed(null);setSaved(false);setEdits('');setBaseline('');}}>Ghi lượt mới</button>}
        </div>}
      </>:<>
        {phase==='idle'&&<><p className="text-sm">Lớp {grade} · Hai câu trước khi ôn, đọc phần giải thích, rồi làm hai câu sau. Mỗi lượt có một câu hiểu bài và một câu vận dụng. Hãy làm lượt trước khi đọc phần ôn. Nếu em đã gặp những câu này, kết quả chỉ dùng để theo dõi luyện tập. Đây là bài luyện ngắn, không thay cho đánh giá của giáo viên.</p><button type="button" className={button} disabled={!selected} onClick={startStudent}>Bắt đầu kiểm tra trước khi ôn</button></>}
        {(phase==='pre'||phase==='post')&&activeQuestion&&<section className="space-y-3 rounded-xl border border-sky-200 p-4" aria-label="Câu hỏi đo trước sau"><p className="text-xs font-bold text-sky-800">{phase==='pre'?'Trước khi ôn':'Sau khi ôn'} · Câu {index+1}/2 · {activeQuestion.domain==='understanding'?'Hiểu bài':'Vận dụng'}</p><h3 className="font-bold">{activeQuestion.question}</h3>{activeQuestion.options.map((option,i)=><button type="button" key={option} className={`min-h-11 w-full rounded-xl border px-3 py-3 text-left text-sm ${answers[activeIndex]===i?'border-sky-700 bg-sky-100':'bg-white'}`} aria-pressed={answers[activeIndex]===i} onClick={()=>setAnswers(previous=>previous.map((answer,j)=>j===activeIndex?i:answer))}>{option}</button>)}<button type="button" className={button} disabled={answers[activeIndex]===null} onClick={next}>Tiếp tục</button></section>}
        {phase==='study'&&session&&activeCard&&<section className="space-y-3 rounded-xl bg-sky-50 p-4"><h3 className="font-bold">Cùng ôn: {activeCard.term}</h3><p>{learningExplanation(activeCard.id,session.grade)}</p><p>Ví dụ: {profile?.example}</p><p className="text-xs">Nguồn: <a className="underline" href={activeCard.source.url} target="_blank" rel="noopener noreferrer">{activeCard.source.label}</a></p><button type="button" className={button} onClick={()=>{setPhase('post');setIndex(0);}}>Làm kiểm tra sau khi ôn</button></section>}
        {phase==='done'&&completed&&session&&<section className="space-y-3 rounded-xl bg-emerald-50 p-4"><h3 className="font-bold">Kết quả của lượt này</h3><table className="w-full text-left text-sm"><thead><tr><th>Nội dung</th><th>Trước</th><th>Sau</th></tr></thead><tbody><tr><td>Hiểu bài</td><td>{completed.preUnderstanding}/1</td><td>{completed.postUnderstanding}/1</td></tr><tr><td>Vận dụng</td><td>{completed.preApplication}/1</td><td>{completed.postApplication}/1</td></tr></tbody></table><p className="text-xs">Chỉ có một câu mỗi nội dung ở mỗi lần đo. Chênh lệch này chưa chứng minh tác động của app hay khả năng ghi nhớ lâu dài.</p><details><summary className="cursor-pointer py-2 font-bold">Đối chiếu đáp án và giải thích</summary>{session.items.map((item,i)=><div className="mb-3 text-sm" key={item.id}><p className="font-bold">{i<2?'Trước':'Sau'} · {item.question}</p><p>Đáp án: {item.options[item.correctIndex]}</p><p>{item.explanation}</p></div>)}</details><button type="button" className={button} disabled={saved} onClick={()=>store(completed)}>{saved?'Đã lưu trên thiết bị':'Lưu kết quả của lượt này'}</button><button type="button" className="ml-2 min-h-11 rounded-xl border p-3 text-sm font-bold" onClick={()=>{setPhase('idle');setSaved(false);}}>Chọn lượt khác</button></section>}
      </>}
      <section className="space-y-2 border-t pt-3"><h3 className="font-bold">Nhật ký đã ghi nhận trên thiết bị</h3>
        {!rows.length?<p className="text-sm text-slate-600">Chưa có lượt đo được lưu. Số liệu chỉ xuất hiện sau khi hoàn thành và bấm lưu.</p>:<>
          <p className="text-sm">{teacher?`${summary.teacherSessions} lượt chuẩn bị; trung vị ${summary.medianSeconds===null?'chưa có':summary.medianSeconds+' giây'}.`:`${summary.studentSessions} lượt luyện trước–sau; đây là số lượt, không phải số học sinh.`}</p>
          {teacher&&<p className="text-xs">Dùng ngay: {summary.editCounts.none}; chỉnh ít: {summary.editCounts.light}; chỉnh nhiều: {summary.editCounts.major}; chưa dùng được: {summary.editCounts.unusable}. Thời gian đối chiếu do người dùng tự ghi, không phải phép đo độc lập.</p>}
          <ul className="space-y-2 text-xs">{rows.slice(-5).reverse().map(row=><li key={row.id} className="rounded-lg bg-slate-50 p-2">
            <strong>{knowledge.find(card=>card.id===row.topicId)?.term || row.topicId}</strong> · Lớp {row.grade} · {new Date(row.at).toLocaleDateString('vi-VN')}
            {row.kind==='student'?<p>Hiểu: {row.preUnderstanding}/1 → {row.postUnderstanding}/1; vận dụng: {row.preApplication}/1 → {row.postApplication}/1.</p>:<p>Thực đo {row.elapsedSeconds} giây. {row.baselineMinutes!==undefined?`Đối chiếu tự ghi: ${row.baselineMinutes} phút; chênh lệch ${Math.round(row.baselineMinutes*60-row.elapsedSeconds)} giây (số dương là ít thời gian hơn).`:'Chưa có thời gian đối chiếu.'}</p>}
          </li>)}</ul>
          <button type="button" className="min-h-11 rounded-xl border px-3 py-2 text-sm font-bold" onClick={()=>{const url=URL.createObjectURL(new Blob([effectivenessCSV(rows)],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='nhat-ky-hieu-qua-chatbox.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Tải nhật ký CSV</button>
        </>}
      </section>
    </section>
  </div>;
}
