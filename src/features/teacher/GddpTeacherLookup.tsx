import React, { useEffect, useMemo, useState } from 'react';
import { gddpService, GddpRecord } from '../../services/GddpService';
import { bundledGddpCatalog } from '../../services/GddpBundledCatalog';
import { Station } from '../../types';
import {matchGddpResources,MatchedLessonResource} from '../../services/GddpResourceMatcher';
import {LessonPlanEditor} from './LessonPlanEditor';
import {GddpLessonPresentation} from './GddpLessonPresentation';
import {getGddpLessonDeck,getGddpTeachingRecord} from '../../services/GddpLessonDeckService';

interface Props {onOpenStudentStage1?: (station:Station)=>void; stations: Station[]; currentGrade: number; onGradeChange: (grade: number) => void; privateRecords?:GddpRecord[]; privateYear?:string; privateSource?:string;}
export const GddpTeacherLookup: React.FC<Props> = ({stations,currentGrade,onGradeChange,privateRecords,privateYear,privateSource,onOpenStudentStage1}) => {
  const [records, setRecords] = useState<GddpRecord[]>([]);
  const [grade, setGrade] = useState(currentGrade);
  const [subject, setSubject] = useState('');
  const [week, setWeek] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [published,setPublished]=useState(false);
  const [offlineSource,setOfflineSource]=useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [integrationMinutes,setIntegrationMinutes] = useState<5|10>(5);
  const [selectedHotspots,setSelectedHotspots] = useState<string[]>([]);
  const [manualChoice,setManualChoice] = useState(false);
  const [showLessonDetails,setShowLessonDetails]=useState(false);
  const [showPreparation,setShowPreparation]=useState(false);
  const [preparedOpen,setPreparedOpen] = useState(false);
  const [projected,setProjected] = useState<MatchedLessonResource|null>(null);
  useEffect(()=>{setGrade(currentGrade);setSubject('');setWeek('');setSelectedId('');setSelectedHotspots([]);setManualChoice(false);setProjected(null);},[currentGrade]);
  useEffect(() => {
    let active = true;
    if(privateRecords){setRecords(privateRecords);setLoading(false);setPublished(false);setOfflineSource(false);return;}
    gddpService.publicCatalog().then(data => {
      if (!active) return;
      setRecords(data.records?.length ? data.records : (data.published ? [] : bundledGddpCatalog.records));
      setPublished(!!data.published);
      setOfflineSource(!data.published && !data.records?.length);
      setError('');
      setLoading(false);
    }).catch(() => { if (active) {
      // Preview may return HTML for /api; public source data remains available locally.
      // Never treat local records as an Admin-published catalog.
      setRecords(bundledGddpCatalog.records);
      setPublished(false);
      setOfflineSource(true);
      setError('');
      setLoading(false);
    } });
    return () => {active = false;};
  }, [privateRecords]);
  const byGrade = useMemo(() => records.filter(x => x.grade === grade), [records,grade]);
  const subjects = useMemo(() => [...new Set(byGrade.map(x=>x.subject))].sort(), [byGrade]);
  const bySubject = useMemo(() => byGrade.filter(x=>!subject || x.subject===subject), [byGrade,subject]);
  const weeks = useMemo(() => [...new Set(bySubject.map(x=>x.week).filter(Boolean))].sort((a,b)=>(parseInt(a.match(/\d+/)?.[0]||'0'))-(parseInt(b.match(/\d+/)?.[0]||'0'))), [bySubject]);
  const filtered = useMemo(() => bySubject.filter(x=>!week || x.week===week), [bySubject,week]);
  const selected = filtered.find(x => x.id === selectedId) || null;
  const preparedDeck = useMemo(()=>selected?getGddpLessonDeck(selected):null,[selected]);
  const teachingRecord=selected?getGddpTeachingRecord(selected):null;
  useEffect(()=>{setPreparedOpen(false);},[selected]);
  const matchedResources = useMemo(()=>{
    if(!selected)return [];
    const links=selected.resourceLinks?.length?selected.resourceLinks:preparedDeck?.resourceLinks;
    const record=links?.length?{...selected,resourceLinks:links}:selected;
    return matchGddpResources(record,stations).filter(m=>!privateRecords||selected.resourceLinks?.some(l=>l.stationId===m.station.id&&l.hotspotId===m.hotspot.id))
      .map(m=>preparedDeck?.resourceLinks?.some(l=>l.stationId===m.station.id&&l.hotspotId===m.hotspot.id)?{...m,reason:'Liên kết theo bản đối chiếu học liệu'}:m);
  },[selected,stations,privateRecords,preparedDeck]);
  // Suggest the first verified match automatically, but keep teacher control.
  useEffect(()=>{
    if(!selected||!matchedResources.length)return;
    if(matchedResources[0].reason.includes('cần duyệt'))return;
    setSelectedHotspots(previous=>previous.length?previous:[matchedResources[0].station.id+':'+matchedResources[0].hotspot.id]);
  },[selected?.id,matchedResources]);
  const manualResources=useMemo(()=>stations.filter(station=>station.grade===grade).flatMap(station=>station.hotspots.filter(h=>Boolean(h.titleVi?.trim()&&h.image?.trim()&&h.narrationVi?.trim())&&!/đang được hoàn thiện|đang cập nhật|giới thiệu bài học/i.test(h.narrationVi)).map(hotspot=>({station,hotspot,reason:'Giáo viên tự chọn; cần đối chiếu với bài học'}))),[stations,grade]);
  const availableResources=manualChoice?manualResources:matchedResources;
  const selectedResources=availableResources.filter(({station,hotspot})=>selectedHotspots.includes(station.id+':'+hotspot.id));
  const copy = async (text:string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); }
    catch { setError('Trình duyệt không cho phép sao chép. Hãy chọn nội dung và sao chép thủ công.'); }
  };
  return <section className="space-y-3 rounded-2xl border border-emerald-100 bg-white p-3 sm:p-4 shadow-sm">
    <div>
      <h2 className="text-xl font-black text-slate-900">Tích hợp Giáo dục địa phương</h2>
      <p className="text-xs text-slate-600">Kết nối tri thức với cuộc sống · Chọn bài → mở Chặng 1 → dạy ngay. Danh sách hiện có cần đối chiếu lại theo SGK.</p>
    </div>
    {!loading && !error && records.length>0 && <p className="hidden rounded-xl bg-sky-50 p-3 text-sm text-sky-900">Đã tải {records.length} địa chỉ GDĐP {privateRecords?'trong kế hoạch riêng':'của 5 khối' }. {privateRecords?'Do giáo viên nhập và xác nhận; liên kết là học liệu bổ sung.':published?'Dữ liệu do Admin xuất bản.':offlineSource?'Chế độ dữ liệu nguồn dự phòng (không kết nối máy chủ); vẫn có thể chọn bài, soạn và xuất KHBD. Dữ liệu này chưa được xác nhận là bản mới nhất do Admin xuất bản.':'Dữ liệu nguồn cài sẵn để tra cứu và dùng Demo KHBD; chưa xác nhận Admin đã xuất bản.'}</p>}
    {false&&grade===1&&!privateRecords&&!published&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Lưu ý khối 1: bảng nguồn tìm được ghi năm học 2025–2026. Trong 13 dòng, 6 dòng thiếu nội dung nên chưa nhập; 7 dòng có nội dung đã có bản trình chiếu tham khảo; hai bài địa danh có nguồn đối chiếu riêng. Chưa có bảng 2026–2027 để xác nhận tên bài, tuần và vị trí tích hợp.</p>}
    {loading && <p role="status">Đang tải dữ liệu GDĐP…</p>}
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <label className="space-y-1 text-sm font-semibold text-slate-700">Khối lớp
        <select className="w-full rounded-xl border border-slate-300 bg-white p-3" value={grade} onChange={e=>{setGrade(Number(e.target.value));onGradeChange(Number(e.target.value));setProjected(null);setSubject('');setWeek('');setSelectedId('');}}>
          {(privateRecords?[currentGrade]:[1,2,3,4,5]).map(x=><option key={x} value={x}>Lớp {x}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-sm font-semibold text-slate-700">Môn học
        <select className="w-full rounded-xl border border-slate-300 bg-white p-3" value={subject} onChange={e=>{setSubject(e.target.value);setWeek('');setSelectedId('');}}>
          <option value="">Tất cả môn</option>{subjects.map(x=><option key={x} value={x}>{x}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-sm font-semibold text-slate-700">Tuần
        <select className="w-full rounded-xl border border-slate-300 bg-white p-3" value={week} onChange={e=>{setWeek(e.target.value);setSelectedId('');}}>
          <option value="">Tất cả tuần</option>{weeks.map(x=><option key={x} value={x}>{x}</option>)}
        </select>
      </label>
    </div>
    {!loading && !filtered.length && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Chưa có địa chỉ tích hợp phù hợp với bộ lọc đang chọn. Vui lòng liên hệ Admin nếu cần bổ sung.</p>}
    {!!filtered.length && <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
      {filtered.map(x=><button key={x.id} type="button" onClick={()=>{setSelectedId(x.id);setSelectedHotspots([]);setManualChoice(false);setShowLessonDetails(false);setShowPreparation(false);setProjected(null);setCopied(false)}} className={`w-full rounded-xl border p-3 text-left text-sm transition ${selectedId===x.id?'border-emerald-600 bg-emerald-50':'border-slate-200 hover:bg-slate-50'}`}>
        <span className="font-bold">{x.lesson}</span><span className="mt-1 block text-xs text-slate-500">{x.subject} · {x.week ? 'Tuần '+x.week : 'Chưa ghi tuần'}</span>
      </button>)}
    </div>}
    {selected && <article className="space-y-4 rounded-2xl border border-sky-200 bg-sky-50/40 p-4">
      <div><p className="text-xs font-bold uppercase text-sky-800">Địa chỉ tích hợp từ tài liệu nguồn</p><h3 className="font-black text-slate-900">{selected.lesson}</h3></div>
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 space-y-3">
        <h4 className="text-lg font-black text-emerald-950">Dạy ngay với Chặng 1 của học sinh</h4>
        <p className="text-sm text-slate-700">{matchedResources.length?'Chọn một điểm khám phá được gợi ý, xem nội dung rồi trình chiếu.':'Bài này chưa có điểm được đối chiếu. Chọn từ các trạm cùng khối và tự xác nhận nội dung phù hợp.'}</p>
        <div className="flex flex-wrap gap-2">
          {matchedResources.slice(0,4).map(resource=><button key={resource.station.id+resource.hotspot.id} type="button" onClick={()=>onOpenStudentStage1?onOpenStudentStage1(resource.station):setProjected(resource)} className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800">▶ {resource.hotspot.titleVi}</button>)}
          <button type="button" onClick={()=>{setManualChoice(true);setSelectedHotspots([]);document.getElementById('teacher-chang1-chooser')?.scrollIntoView({behavior:'smooth',block:'start'});}} className="rounded-xl border border-emerald-700 bg-white px-4 py-3 text-sm font-bold text-emerald-900">Tìm điểm Chặng 1 khác</button>
        </div>
        <p className="text-xs text-amber-900">Điểm gợi ý theo chủ đề chưa được xác nhận theo từng bài SGK. Giáo viên cần xem nội dung trước khi dạy.</p>
      </div>
      <button type="button" className="text-sm font-semibold text-sky-800 underline" onClick={()=>setShowLessonDetails(x=>!x)} aria-expanded={showLessonDetails}>{showLessonDetails?'Ẩn thông tin địa chỉ tích hợp':'Xem thông tin địa chỉ tích hợp và nguồn'}</button>
      {showLessonDetails&&<div className="space-y-3">
      <p className="text-sm"><strong>Hình thức:</strong> {selected.integrationType || 'Theo tài liệu gốc'}</p>
      <p className="text-sm"><strong>Vị trí:</strong> {selected.activity || 'Chưa ghi vị trí cụ thể'}</p>
      <div className="whitespace-pre-wrap rounded-xl bg-white p-3 text-sm text-slate-800"><strong>{preparedDeck?.teachingContent?'Nguyên văn nguồn cũ — xem bản hiệu đính phía dưới:':'Nội dung GDĐP:'}</strong>{'\n'}{selected.content}</div>
      {preparedDeck?.teachingContent&&<div className="whitespace-pre-wrap rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm"><strong>Nội dung đã đối chiếu để sử dụng trong bản nháp:</strong>{'\n'}{preparedDeck.teachingContent}</div>}
      {selected.outcomes && <div className="whitespace-pre-wrap rounded-xl border border-emerald-100 bg-white p-3 text-sm"><strong>Yêu cầu cần đạt bổ sung:</strong>{'\n'}{selected.outcomes}</div>}
      {selected.teachingSuggestion && <div className="whitespace-pre-wrap rounded-xl border border-emerald-100 bg-white p-3 text-sm"><strong>Gợi ý tổ chức tích hợp:</strong>{'\n'}{selected.teachingSuggestion}</div>}
      <button type="button" onClick={()=>void copy(`LỚP ${selected.grade} · ${selected.subject} · ${selected.week}\nBài: ${selected.lesson}\nĐịa chỉ tích hợp: ${selected.activity}\nHình thức: ${selected.integrationType}\nNội dung GDĐP: ${teachingRecord?.content || selected.content}\nYêu cầu cần đạt bổ sung: ${selected.outcomes || ''}\nGợi ý tổ chức tích hợp: ${selected.teachingSuggestion || ''}`)} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">{copied?'Đã sao chép':'Sao chép vào KHBD'}</button>
      </div>
      <button type="button" className="w-full rounded-xl border border-sky-300 bg-white px-4 py-3 text-left text-sm font-bold text-sky-900" onClick={()=>setShowPreparation(x=>!x)} aria-expanded={showPreparation}>{showPreparation?'Ẩn soạn giáo án và lựa chọn nâng cao':'Soạn câu hỏi, chọn 5–10 phút và đưa vào KHBD (tùy chọn)'}</button>
      {showPreparation&&<div className="space-y-4">
      <section id="teacher-chang1-chooser" className="rounded-xl border border-emerald-200 bg-white p-4 space-y-3" aria-label="Chuẩn bị nội dung tích hợp">
        <h4 className="font-bold text-emerald-900">Chuẩn bị nội dung tích hợp</h4>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-2 text-sm font-semibold">Thời lượng</legend>
          {([5,10] as const).map(minutes=><button type="button" key={minutes} aria-pressed={integrationMinutes===minutes} onClick={()=>setIntegrationMinutes(minutes)} className={`rounded-xl border px-5 py-2 text-sm font-bold ${integrationMinutes===minutes?'bg-emerald-700 text-white':'bg-white text-slate-800'}`}>{minutes} phút</button>)}
        </fieldset>
        <p className="text-sm text-slate-600">{integrationMinutes===5?'Gợi ý chọn một điểm khám phá và một câu hỏi liên hệ.':'Gợi ý chọn một đến hai điểm khám phá và hai câu hỏi liên hệ.'} Giáo viên có thể điều chỉnh.</p>
        <h5 className="text-sm font-semibold">Bước 1 · Chọn điểm khám phá Chặng 1 (đã gợi ý sẵn nếu có liên kết)</h5>
        {!matchedResources.length&&!manualChoice&&<div className="space-y-2 rounded-lg bg-amber-50 p-3"><p className="text-sm text-amber-900">Chưa có liên kết học liệu được đối chiếu cho bài này. Giáo viên có thể tự tìm điểm Chặng 1 phù hợp và xác nhận trước khi dùng.</p><button type="button" className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white" onClick={()=>{setManualChoice(true);setSelectedHotspots([]);}}>Chọn thủ công từ Chặng 1</button></div>}
        {!manualChoice&&matchedResources.length>0&&<button type="button" className="rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-sky-900" onClick={()=>{setManualChoice(true);setSelectedHotspots([]);}}>Tìm điểm Chặng 1 khác trong khối</button>}
        {manualChoice&&<button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={()=>{setManualChoice(false);setSelectedHotspots([]);}}>Quay lại liên kết được đối chiếu</button>}
        {manualChoice&&<p className="text-sm text-amber-900">Đang chọn thủ công: đây không phải liên kết được Admin xác nhận. Hãy mở và kiểm tra nội dung trước khi tích hợp.</p>}
        {availableResources.length===0?<p className="text-sm text-amber-800">Không có điểm Chặng 1 hoàn chỉnh thuộc khối này để lựa chọn.</p>:availableResources.map(({station,hotspot,reason})=>{
          const id=station.id+':'+hotspot.id;
          return <label key={id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
            <input type="checkbox" className="h-4 w-4" checked={selectedHotspots.includes(id)} onChange={e=>setSelectedHotspots(prev=>e.target.checked?[...prev,id]:prev.filter(x=>x!==id))}/>
            <span className="flex-1"><strong>{hotspot.titleVi}</strong><span className="block text-xs text-slate-500">{station.titleVi} · {reason}</span></span>
            <button type="button" className="rounded-lg bg-sky-700 px-3 py-2 font-semibold text-white" onClick={()=>onOpenStudentStage1?onOpenStudentStage1(station):setProjected({station,hotspot,reason})}>▶ Mở nội dung Chặng 1</button>
          </label>;
        })}
        <p className="text-sm font-semibold text-emerald-800">Bước 2 · Mở nội dung Chặng 1 để dạy; bước 3 · Duyệt câu hỏi và đưa vào KHBD bên dưới.</p>
        <p className="text-xs text-slate-600">Các điểm đã chọn sẽ được dùng làm ngữ cảnh soạn câu hỏi liên hệ. Chỉ sử dụng câu hỏi AI sau khi giáo viên kiểm tra và duyệt; không tự lấy câu hỏi trò chơi không liên quan.</p>
      </section>
      <LessonPlanEditor key={selected.id+(preparedDeck?.teachingContent?'-edited':'')} integrationMinutes={integrationMinutes} selectedResources={selectedResources.map(({station,hotspot})=>({stationTitle:station.titleVi,hotspotTitle:hotspot.titleVi,narration:hotspot.narrationVi}))} record={teachingRecord || selected} storageVariant={preparedDeck?.teachingContent?'source-corrected-2025-v1':undefined} sourceLabel={privateRecords?privateSource:preparedDeck?.mappingReview?`Bản tham khảo từ bảng ${preparedDeck.mappingReview.sourceYear}; chưa xác nhận địa chỉ năm học hiện hành.\n${preparedDeck.sources.join('\n')}`:undefined} />
      </div>

      {showPreparation&&<div className="space-y-3 rounded-xl border border-emerald-200 bg-white p-3">
        <h4 className="font-bold">Học liệu bổ sung từ các trạm</h4>
        <p className="text-xs text-slate-600">Chỉ hiện từng điểm học liệu trùng khớp với bài; không mở trọn trạm hoặc 4 chặng học sinh.</p>
        {!matchedResources.length && !preparedDeck && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Chưa tìm được học liệu có độ khớp đủ tin cậy. Không tự hiển thị nội dung trạm không liên quan; Admin có thể liên kết chính xác từng điểm học liệu.</p>}
        {matchedResources.map(({station,hotspot,reason})=><div key={station.id+':'+hotspot.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
          <div><p className="font-bold text-slate-900">{hotspot.titleVi}</p><p className="text-xs text-slate-500">{privateRecords?'Giáo viên đã xác nhận liên kết':reason} · {station.titleVi}</p></div>
          <button type="button" className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white" onClick={()=>onOpenStudentStage1?onOpenStudentStage1(station):setProjected({station,hotspot,reason})}>Mở Chặng 1 của học sinh</button>
        </div>)}
      </div>}
      <p className="text-xs text-slate-500">Nội dung nguồn cần được giáo viên đối chiếu với bài dạy và tài liệu chính thức trước khi sử dụng. KHBD Demo là bản nháp để chỉnh sửa, không thay đổi dữ liệu trường.</p>
    </article>}
    {selected && projected && <GddpLessonPresentation record={selected} resource={projected} onExit={()=>setProjected(null)} />}
  </section>;
};
