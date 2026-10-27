import {useApp} from '../../contexts/AppContext';
import React,{useState} from 'react';
import type {GddpRecord} from '../../services/GddpService';
import {createLessonPlan,restoreLessonPlan,lessonPlanBlob,totalMinutes,LessonPlan} from '../../services/LessonPlanService';
export function LessonPlanEditor({record,sourceLabel,storageVariant,integrationMinutes=5,selectedResources=[]}:{record:GddpRecord;sourceLabel?:string;storageVariant?:string;integrationMinutes?:5|10;selectedResources?:{stationTitle:string;hotspotTitle:string}[]}){
  const {currentUser}=useApp();
  const [plan,setPlan]=useState<LessonPlan>(()=>({...createLessonPlan(record),school:(currentUser as any)?.schoolName||'',teacher:currentUser?.name||'',...(sourceLabel?{source:sourceLabel}:{})}));
  const [opened,setOpened]=useState(false);
  const [aiSuggestion,setAiSuggestion]=useState<{outcomes:string;teachingSuggestion:string;topicLink?:{stationId:string;stationTitle:string}|null;textbook?:{status:string;note:string}}|null>(null);
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [reviewed,setReviewed]=useState(false);const [saved,setSaved]=useState('');
  const key=`cham-khbd-v2:${currentUser?.id||'guest'}:${record.id}${storageVariant?':'+storageVariant:''}`;
  const update=(field:keyof LessonPlan,value:string)=>{setPlan(p=>({...p,[field]:value}));setReviewed(false);setSaved('');};
  const field=(name:keyof LessonPlan,label:string,multiline=true)=><label className="block text-sm font-semibold">{label}{multiline?<textarea rows={4} maxLength={20000} className="mt-1 w-full rounded-lg border p-3 font-normal" value={String(plan[name])} onChange={e=>update(name,e.target.value)}/>:<input maxLength={500} className="mt-1 w-full rounded-lg border p-3 font-normal" value={String(plan[name])} onChange={e=>update(name,e.target.value)}/>}</label>;
  const download=async()=>{setBusy(true);setError('');try{if(!reviewed)throw new Error('Hãy duyệt nội dung trước khi xuất Word.');const blob=await lessonPlanBlob(plan);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`KHBD_lop_${plan.grade}_${plan.lesson.replace(/[^\p{L}\p{N}]+/gu,'_').slice(0,80)}.docx`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch(e){setError(e instanceof Error?e.message:'Không xuất được Word.');}finally{setBusy(false);}};
  const suggest=async()=>{
    setBusy(true);setError('');setSaved('');
    try{
      const response=await fetch('/api/teacher/gddp/lesson-suggestion',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:record.id})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Không tạo được gợi ý AI.');
      if(typeof data.outcomes!=='string'||typeof data.teachingSuggestion!=='string')throw new Error('Dữ liệu gợi ý chưa hợp lệ.');
      setAiSuggestion({outcomes:data.outcomes,teachingSuggestion:data.teachingSuggestion,topicLink:data.topicLink,textbook:data.textbook});
      setReviewed(false);
    }catch(e){setError(e instanceof Error?e.message:'Không kết nối được AI.');}
    finally{setBusy(false);}
  };
  const applySuggestion=()=>{
    if(!aiSuggestion)return;
    setPlan(p=>({...p,objectives:aiSuggestion.outcomes,
      activities:p.activities.map((a,i)=>i===1?{...a,teacher:a.teacher+'\\nGợi ý AI (giáo viên kiểm chứng):\\n'+aiSuggestion.teachingSuggestion}:a)}));
    setAiSuggestion(null);setReviewed(false);setSaved('Đã đưa gợi ý vào KHBD. Vui lòng kiểm tra và chỉnh sửa trước khi xuất Word.');
  };
  const [linkQuestions,setLinkQuestions]=useState<string[]>([]);
  const [questionsEdited,setQuestionsEdited]=useState(false);
  const resourceNames=selectedResources.map(r=>r.hotspotTitle);
  const questionContext=resourceNames.join(', ');
  const draftQuestions=integrationMinutes===5
    ? [`Qua nội dung ${questionContext||record.lesson}, em học được điều gì về quê hương Đà Nẵng?`]
    : [`Em hãy nêu một điều em biết về ${questionContext||record.lesson}.`,`Em có thể làm gì để giữ gìn hoặc giới thiệu giá trị của ${questionContext||'địa phương mình'}?`];
  const insertIntegration=()=>{
    if(!selectedResources.length){setError('Hãy chọn ít nhất một điểm kiến thức đã đối chiếu trước khi đưa vào giáo án.');return;}
    const questions=questionsEdited?linkQuestions:draftQuestions;
    const block=`TÍCH HỢP GDĐP (${integrationMinutes} PHÚT)\\nĐiểm khám phá: ${selectedResources.map(r=>r.stationTitle+' – '+r.hotspotTitle).join('; ')}\\nCâu hỏi liên hệ (giáo viên duyệt):\\n${questions.map((q,i)=>(i+1)+'. '+q).join('\\n')}`;
    setPlan(p=>({...p,integration:p.integration+'\\n\\n'+block,activities:p.activities.map((a,i)=>i===1?{...a,teacher:a.teacher+'\\n\\n'+block}:a)}));
    setReviewed(false);setSaved('Đã thêm nội dung vào bản nháp. Kiểm tra thời lượng và câu hỏi trước khi xuất Word.');setError('');
  };
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(plan));setSaved('Đã lưu bản nháp trên trình duyệt này.');setError('');}catch{setError('Không lưu được bản nháp. Hãy xuất Word để giữ nội dung.');}};
  const restore=()=>{try{const raw=localStorage.getItem(key);if(!raw)throw new Error('Chưa có bản nháp đã lưu cho bài này.');const p=restoreLessonPlan(raw,record);setPlan(p);setReviewed(false);setSaved('Đã mở bản nháp của bài này.');setError('');}catch(e){setError(e instanceof Error?e.message:'Không mở được bản nháp.');}};
  if(!opened)return <button type="button" onClick={()=>setOpened(true)} className="rounded-lg bg-sky-700 px-5 py-3 font-bold text-white">Tạo hoặc mở KHBD của bài này</button>;
  return <div className="space-y-4 rounded-xl border bg-white p-4"><h4 className="text-lg font-bold">Soạn kế hoạch bài dạy</h4><p className="text-sm text-slate-600">Bản dự thảo theo cấu trúc tiết học, dùng nội dung GDĐP của bài đã chọn. Cô bổ sung mục tiêu, nhiệm vụ và bài tập theo SGK, rồi duyệt trước khi sử dụng. Bản nháp lưu trên trình duyệt này.</p>
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-3">
      <h5 className="font-bold text-emerald-900">Nội dung tích hợp đã chọn · {integrationMinutes} phút</h5>
      <p className="text-sm">{resourceNames.length?resourceNames.join(' · '):'Chưa chọn điểm kiến thức Chặng 1 ở phía trên.'}</p>
      <p className="text-xs text-slate-700">Câu hỏi liên hệ mẫu được tạo ngay trên thiết bị, không tốn lượt AI. Giáo viên chỉnh sửa để phù hợp SGK; AI chỉ nên gọi khi thực sự cần.</p>
      {(questionsEdited?linkQuestions:draftQuestions).map((q,i)=><label key={i} className="block text-sm font-semibold">Câu hỏi {i+1}<textarea rows={2} maxLength={1000} className="mt-1 w-full rounded-lg border bg-white p-2 font-normal" value={q} onChange={e=>{const next=[...(questionsEdited?linkQuestions:draftQuestions)];next[i]=e.target.value;setLinkQuestions(next);setQuestionsEdited(true);setReviewed(false);}}/></label>)}
      <button type="button" disabled={!selectedResources.length} onClick={insertIntegration} className="rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white disabled:opacity-50">Đưa nội dung và câu hỏi vào KHBD</button>
    </section>
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 space-y-2">
      <button type="button" disabled={busy} onClick={()=>void suggest()} className="rounded-lg bg-sky-700 px-4 py-2 font-bold text-white disabled:opacity-50">{busy?'AI đang gợi ý…':'✨ AI gợi ý hoạt động 5 phút (tùy chọn)'}</button>
      <p className="text-xs text-slate-600">Chức năng AI hiện có chỉ đề xuất kịch bản 5 phút, chưa hỗ trợ tự động soạn theo lựa chọn 10 phút và từng điểm kiến thức. Có thể sử dụng câu hỏi liên hệ miễn phí ở phía trên. AI đề xuất kịch bản tích hợp 5 phút (2 phút khám phá, 2 phút tương tác, 1 phút vận dụng) từ địa chỉ GDĐP đang có: lời dẫn, câu hỏi, trả lời dự kiến và lời chốt. Tên bài/tuần trong bảng chưa chứng minh đã đối chiếu toàn văn SGK hiện hành; không tự nhận có trang SGK hoặc học liệu chưa xác minh. Giáo viên cần duyệt trước khi sử dụng.</p>
      {aiSuggestion&&<div className="space-y-2 rounded-lg bg-white p-3 text-sm"><p className="font-bold">Gợi ý AI — chưa áp dụng</p><p className="text-amber-800"><strong>Trạng thái đối chiếu SGK:</strong> {aiSuggestion.textbook?.note||'Chưa xác minh SGK hiện hành.'}</p><p><strong>Học liệu học sinh:</strong> {aiSuggestion.topicLink?`${aiSuggestion.topicLink.stationTitle} (trạm ${aiSuggestion.topicLink.stationId}, mới khớp chủ đề GDĐP)`:'Chưa có liên kết học liệu được kiểm chứng cho bài này.'}</p><p className="whitespace-pre-wrap"><strong>Yêu cầu cần đạt:</strong> {aiSuggestion.outcomes}</p><p className="whitespace-pre-wrap"><strong>Tổ chức hoạt động:</strong> {aiSuggestion.teachingSuggestion}</p><div className="flex gap-2"><button type="button" onClick={applySuggestion} className="rounded bg-emerald-700 px-3 py-2 text-white">Đưa vào KHBD để chỉnh sửa</button><button type="button" onClick={()=>setAiSuggestion(null)} className="rounded border px-3 py-2">Bỏ gợi ý</button></div></div>}
    </div>
    <div className="grid gap-3 sm:grid-cols-2">{field('school','Trường',false)}{field('teacher','Giáo viên',false)}{field('className','Lớp dạy',false)}{field('date','Ngày dạy',false)}</div>
    {field('objectives','I. Yêu cầu cần đạt')}{field('competencies','Năng lực')}{field('qualities','Phẩm chất')}{field('materials','II. Đồ dùng dạy học')}{field('integration','Nội dung tích hợp GDĐP')}
    <h5 className="font-bold">III. Các hoạt động dạy học · Tổng {totalMinutes(plan)} phút</h5>
    {plan.activities.map((a,i)=><div key={i} className="space-y-2 rounded-lg border p-3"><div className="flex gap-3"><input aria-label={`Tên hoạt động ${i+1}`} className="min-w-0 flex-1 rounded border p-2" value={a.title} onChange={e=>{setPlan(p=>({...p,activities:p.activities.map((v,j)=>j===i?{...v,title:e.target.value}:v)}));setReviewed(false);}}/><label className="text-sm">Phút<input type="number" min={1} max={120} className="block w-20 rounded border p-2" value={a.minutes} onChange={e=>{setPlan(p=>({...p,activities:p.activities.map((v,j)=>j===i?{...v,minutes:Math.max(1,Math.min(120,Number(e.target.value)||1))}:v)}));setReviewed(false);setSaved('');}}/></label></div>{(['teacher','student','evidence'] as const).map((k)=><label key={k} className="block text-sm">{{teacher:'Hoạt động của giáo viên',student:'Hoạt động của học sinh',evidence:'Sản phẩm và đánh giá'}[k]}<textarea rows={3} maxLength={20000} className="mt-1 w-full rounded border p-2" value={a[k]} onChange={e=>{setPlan(p=>({...p,activities:p.activities.map((v,j)=>j===i?{...v,[k]:e.target.value}:v)}));setReviewed(false);setSaved('');}}/></label>)}</div>)}
    {field('adjustments','IV. Điều chỉnh sau bài dạy')}{field('source','Nguồn học liệu')}
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>Tôi đã rà soát yêu cầu cần đạt, nội dung, thời lượng và nguồn học liệu phù hợp với bài dạy.</label>
    {error&&<p role="alert" className="text-rose-700">{error}</p>}{saved&&<p role="status" className="text-emerald-700">{saved}</p>}
    <div className="flex flex-wrap gap-2"><button type="button" onClick={save} className="rounded-lg border px-4 py-2">Lưu bản nháp</button><button type="button" onClick={restore} className="rounded-lg border px-4 py-2">Mở bản nháp đã lưu</button><button type="button" disabled={busy||!reviewed} onClick={()=>void download()} className="rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white disabled:opacity-50">{busy?'Đang xuất…':'Tải Word (.docx)'}</button></div>
  </div>;
}
