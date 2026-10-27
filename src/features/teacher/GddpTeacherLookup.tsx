import React, { useEffect, useMemo, useState } from 'react';
import { gddpService, GddpRecord } from '../../services/GddpService';
import { bundledGddpCatalog } from '../../services/GddpBundledCatalog';
import { Station } from '../../types';
import {matchGddpResources,MatchedLessonResource} from '../../services/GddpResourceMatcher';
import {LessonPlanEditor} from './LessonPlanEditor';
import {GddpLessonPresentation} from './GddpLessonPresentation';
import {getGddpLessonDeck,getGddpTeachingRecord} from '../../services/GddpLessonDeckService';
import {GddpPreparedPresentation} from './GddpPreparedPresentation';

interface Props {stations: Station[]; currentGrade: number; onGradeChange: (grade: number) => void; privateRecords?:GddpRecord[]; privateYear?:string; privateSource?:string;}
export const GddpTeacherLookup: React.FC<Props> = ({stations,currentGrade,onGradeChange,privateRecords,privateYear,privateSource}) => {
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
  const [preparedOpen,setPreparedOpen] = useState(false);
  const [projected,setProjected] = useState<MatchedLessonResource|null>(null);
  useEffect(()=>{setGrade(currentGrade);setSubject('');setWeek('');setSelectedId('');setSelectedHotspots([]);setProjected(null);},[currentGrade]);
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
  const copy = async (text:string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); }
    catch { setError('Trình duyệt không cho phép sao chép. Hãy chọn nội dung và sao chép thủ công.'); }
  };
  return <section className="space-y-5 rounded-3xl border border-emerald-100 bg-white p-4 sm:p-6 shadow-sm">
    <div>
      <h2 className="text-xl font-black text-slate-900">Tích hợp Giáo dục địa phương</h2>
      <p className="text-sm text-slate-600">Năm học {privateYear||'2026–2027'} · Tra cứu địa chỉ tích hợp lớp 1–5. Chọn bài để xem nội dung nguồn và thực hành soạn KHBD, kể cả khi dùng chế độ Demo.</p>
    </div>
    {!loading && !error && records.length>0 && <p className="rounded-xl bg-sky-50 p-3 text-sm text-sky-900">Đã tải {records.length} địa chỉ GDĐP {privateRecords?'trong kế hoạch riêng':'của 5 khối' }. {privateRecords?'Do giáo viên nhập và xác nhận; liên kết là học liệu bổ sung.':published?'Dữ liệu do Admin xuất bản.':offlineSource?'Chế độ dữ liệu nguồn dự phòng (không kết nối máy chủ); vẫn có thể chọn bài, soạn và xuất KHBD. Dữ liệu này chưa được xác nhận là bản mới nhất do Admin xuất bản.':'Dữ liệu nguồn cài sẵn để tra cứu và dùng Demo KHBD; chưa xác nhận Admin đã xuất bản.'}</p>}
    {grade===1&&!privateRecords&&!published&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Lưu ý khối 1: bảng nguồn tìm được ghi năm học 2025–2026. Trong 13 dòng, 6 dòng thiếu nội dung nên chưa nhập; 7 dòng có nội dung đã có bản trình chiếu tham khảo; hai bài địa danh có nguồn đối chiếu riêng. Chưa có bảng 2026–2027 để xác nhận tên bài, tuần và vị trí tích hợp.</p>}
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
    {!!filtered.length && <div className="grid gap-2">
      {filtered.map(x=><button key={x.id} type="button" onClick={()=>{setSelectedId(x.id);setSelectedHotspots([]);setProjected(null);setCopied(false)}} className={`w-full rounded-xl border p-3 text-left text-sm transition ${selectedId===x.id?'border-emerald-600 bg-emerald-50':'border-slate-200 hover:bg-slate-50'}`}>
        <span className="font-bold">{x.lesson}</span><span className="mt-1 block text-xs text-slate-500">{x.subject} · {x.week ? 'Tuần '+x.week : 'Chưa ghi tuần'}</span>
      </button>)}
    </div>}
    {selected && <article className="space-y-4 rounded-2xl border border-sky-200 bg-sky-50/40 p-4">
      <div><p className="text-xs font-bold uppercase text-sky-800">Địa chỉ tích hợp từ tài liệu nguồn</p><h3 className="font-black text-slate-900">{selected.lesson}</h3></div>
      <p className="text-sm"><strong>Hình thức:</strong> {selected.integrationType || 'Theo tài liệu gốc'}</p>
      <p className="text-sm"><strong>Vị trí:</strong> {selected.activity || 'Chưa ghi vị trí cụ thể'}</p>
      <div className="whitespace-pre-wrap rounded-xl bg-white p-3 text-sm text-slate-800"><strong>{preparedDeck?.teachingContent?'Nguyên văn nguồn cũ — xem bản hiệu đính phía dưới:':'Nội dung GDĐP:'}</strong>{'\n'}{selected.content}</div>
      {preparedDeck?.teachingContent&&<div className="whitespace-pre-wrap rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm"><strong>Nội dung đã đối chiếu để sử dụng trong bản nháp:</strong>{'\n'}{preparedDeck.teachingContent}</div>}
      {selected.outcomes && <div className="whitespace-pre-wrap rounded-xl border border-emerald-100 bg-white p-3 text-sm"><strong>Yêu cầu cần đạt bổ sung:</strong>{'\n'}{selected.outcomes}</div>}
      {selected.teachingSuggestion && <div className="whitespace-pre-wrap rounded-xl border border-emerald-100 bg-white p-3 text-sm"><strong>Gợi ý tổ chức tích hợp:</strong>{'\n'}{selected.teachingSuggestion}</div>}
      <button type="button" onClick={()=>void copy(`LỚP ${selected.grade} · ${selected.subject} · ${selected.week}\nBài: ${selected.lesson}\nĐịa chỉ tích hợp: ${selected.activity}\nHình thức: ${selected.integrationType}\nNội dung GDĐP: ${teachingRecord?.content || selected.content}\nYêu cầu cần đạt bổ sung: ${selected.outcomes || ''}\nGợi ý tổ chức tích hợp: ${selected.teachingSuggestion || ''}`)} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">{copied?'Đã sao chép':'Sao chép vào KHBD'}</button>
      <section className="rounded-xl border border-emerald-200 bg-white p-4 space-y-3" aria-label="Chuẩn bị nội dung tích hợp">
        <h4 className="font-bold text-emerald-900">Chuẩn bị nội dung tích hợp</h4>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-2 text-sm font-semibold">Thời lượng</legend>
          {([5,10] as const).map(minutes=><button type="button" key={minutes} aria-pressed={integrationMinutes===minutes} onClick={()=>setIntegrationMinutes(minutes)} className={`rounded-xl border px-5 py-2 text-sm font-bold ${integrationMinutes===minutes?'bg-emerald-700 text-white':'bg-white text-slate-800'}`}>{minutes} phút</button>)}
        </fieldset>
        <p className="text-sm text-slate-600">{integrationMinutes===5?'Gợi ý chọn một điểm khám phá và một câu hỏi liên hệ.':'Gợi ý chọn một đến hai điểm khám phá và hai câu hỏi liên hệ.'} Giáo viên có thể điều chỉnh.</p>
        <h5 className="text-sm font-semibold">Chọn điểm kiến thức Chặng 1</h5>
        {matchedResources.length===0?<p className="text-sm text-amber-800">Chưa có điểm kiến thức được đối chiếu đủ tin cậy với bài này. Không tự gán nội dung khác.</p>:matchedResources.map(({station,hotspot,reason})=>{
          const id=station.id+':'+hotspot.id;
          return <label key={id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
            <input type="checkbox" className="h-4 w-4" checked={selectedHotspots.includes(id)} onChange={e=>setSelectedHotspots(prev=>e.target.checked?[...prev,id]:prev.filter(x=>x!==id))}/>
            <span className="flex-1"><strong>{hotspot.titleVi}</strong><span className="block text-xs text-slate-500">{station.titleVi} · {reason}</span></span>
            <button type="button" className="rounded-lg border px-3 py-2 font-semibold text-sky-800" onClick={()=>setProjected({station,hotspot,reason})}>Xem</button>
          </label>;
        })}
        <p className="text-xs text-slate-600">Các điểm đã chọn sẽ được dùng làm ngữ cảnh soạn câu hỏi liên hệ. Chỉ sử dụng câu hỏi AI sau khi giáo viên kiểm tra và duyệt; không tự lấy câu hỏi trò chơi không liên quan.</p>
      </section>
      <LessonPlanEditor key={selected.id+(preparedDeck?.teachingContent?'-edited':'')} integrationMinutes={integrationMinutes} selectedResources={matchedResources.filter(({station,hotspot})=>selectedHotspots.includes(station.id+':'+hotspot.id)).map(({station,hotspot})=>({stationTitle:station.titleVi,hotspotTitle:hotspot.titleVi,narration:hotspot.narrationVi}))} record={teachingRecord || selected} storageVariant={preparedDeck?.teachingContent?'source-corrected-2025-v1':undefined} sourceLabel={privateRecords?privateSource:preparedDeck?.mappingReview?`Bản tham khảo từ bảng ${preparedDeck.mappingReview.sourceYear}; chưa xác nhận địa chỉ năm học hiện hành.\n${preparedDeck.sources.join('\n')}`:undefined} />
      {preparedDeck && <section className="space-y-3 rounded-2xl border border-emerald-200 bg-white p-4">
        <div><h4 className="font-black text-emerald-900">Bộ trình chiếu riêng cho bài này</h4><p className="mt-1 text-sm text-slate-600">{preparedDeck.title} · {preparedDeck.slides.length} trang · Nội dung, câu hỏi, gợi ý trả lời và ghi chú giáo viên.</p></div>
        {preparedDeck.mappingReview&&!preparedDeck.mappingReview.currentYearConfirmed&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">Nguồn địa chỉ tích hợp: {preparedDeck.mappingReview.sourceYear}. {preparedDeck.mappingReview.note}</p>}
        <p className="text-xs text-slate-500">Bản biên soạn đối chiếu tài liệu nguồn. Giáo viên đọc và duyệt trước khi sử dụng chính thức; không thay thế toàn bộ bài học trong sách.</p>
        {preparedDeck.reviewNotes.length>0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><p className="font-bold">Lưu ý cần duyệt</p><ul className="mt-1 list-disc space-y-1 pl-4">{preparedDeck.reviewNotes.map(note=><li key={note}>{note}</li>)}</ul></div>}
        <button type="button" onClick={()=>setPreparedOpen(true)} className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800">{preparedDeck.mappingReview&&!preparedDeck.mappingReview.currentYearConfirmed?'Xem trình chiếu tham khảo':'Trình chiếu bài này'}</button>
        <details className="text-xs text-slate-600"><summary className="cursor-pointer font-bold">Nguồn và mục tiêu của bộ trình chiếu</summary><ul className="mt-2 list-disc space-y-1 pl-4">{preparedDeck.sources.map(source=><li key={source} className="break-words [overflow-wrap:anywhere]">{source}</li>)}</ul><p className="mt-2">Hình và sơ đồ minh hoạ được biên soạn cho bài; không phải ảnh tư liệu. Không gọi AI hoặc ghi dữ liệu khi mở trình chiếu.</p></details>
      </section>}
      <div className="space-y-3 rounded-xl border border-emerald-200 bg-white p-3">
        <h4 className="font-bold">Học liệu bổ sung từ các trạm</h4>
        <p className="text-xs text-slate-600">Chỉ hiện từng điểm học liệu trùng khớp với bài; không mở trọn trạm hoặc 4 chặng học sinh.</p>
        {!matchedResources.length && !preparedDeck && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Chưa tìm được học liệu có độ khớp đủ tin cậy. Không tự hiển thị nội dung trạm không liên quan; Admin có thể liên kết chính xác từng điểm học liệu.</p>}
        {matchedResources.map(({station,hotspot,reason})=><div key={station.id+':'+hotspot.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
          <div><p className="font-bold text-slate-900">{hotspot.titleVi}</p><p className="text-xs text-slate-500">{privateRecords?'Giáo viên đã xác nhận liên kết':reason} · {station.titleVi}</p></div>
          <button type="button" className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white" onClick={()=>setProjected({station,hotspot,reason})}>Trình chiếu riêng nội dung này</button>
        </div>)}
      </div>
      <p className="text-xs text-slate-500">Nội dung nguồn cần được giáo viên đối chiếu với bài dạy và tài liệu chính thức trước khi sử dụng. KHBD Demo là bản nháp để chỉnh sửa, không thay đổi dữ liệu trường.</p>
    </article>}
    {selected && preparedDeck && preparedOpen && <GddpPreparedPresentation key={selected.id} record={selected} deck={preparedDeck} onExit={()=>setPreparedOpen(false)} />}
    {selected && projected && <GddpLessonPresentation record={selected} resource={projected} onExit={()=>setProjected(null)} />}
  </section>;
};
