import React, { useEffect, useMemo, useState } from 'react';
import { gddpService, GddpRecord } from '../../services/GddpService';

export const GddpTeacherLookup: React.FC = () => {
  const [records, setRecords] = useState<GddpRecord[]>([]);
  const [grade, setGrade] = useState(2);
  const [subject, setSubject] = useState('');
  const [week, setWeek] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    gddpService.publicCatalog().then(data => {
      if (!active) return;
      setRecords(data.records || []);
      setLoading(false);
    }).catch(err => { if (active) {setError(err.message); setLoading(false);} });
    return () => {active = false;};
  }, []);
  const byGrade = useMemo(() => records.filter(x => x.grade === grade), [records,grade]);
  const subjects = useMemo(() => [...new Set(byGrade.map(x=>x.subject))].sort(), [byGrade]);
  const bySubject = useMemo(() => byGrade.filter(x=>!subject || x.subject===subject), [byGrade,subject]);
  const weeks = useMemo(() => [...new Set(bySubject.map(x=>x.week).filter(Boolean))].sort((a,b)=>(parseInt(a.match(/\d+/)?.[0]||'0'))-(parseInt(b.match(/\d+/)?.[0]||'0'))), [bySubject]);
  const filtered = useMemo(() => bySubject.filter(x=>!week || x.week===week), [bySubject,week]);
  const selected = filtered.find(x => x.id === selectedId) || null;
  const copy = async (text:string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); }
    catch { setError('Trình duyệt không cho phép sao chép. Hãy chọn nội dung và sao chép thủ công.'); }
  };
  return <section className="space-y-5 rounded-3xl border border-emerald-100 bg-white p-4 sm:p-6 shadow-sm">
    <div>
      <h2 className="text-xl font-black text-slate-900">Tích hợp Giáo dục địa phương</h2>
      <p className="text-sm text-slate-600">Năm học 2026–2027 · Tra cứu địa chỉ đã được nhà trường duyệt. Không phải soạn lại cả kế hoạch bài dạy.</p>
    </div>
    {loading && <p role="status">Đang tải dữ liệu GDĐP…</p>}
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <label className="space-y-1 text-sm font-semibold text-slate-700">Khối lớp
        <select className="w-full rounded-xl border border-slate-300 bg-white p-3" value={grade} onChange={e=>{setGrade(Number(e.target.value));setSubject('');setWeek('');setSelectedId('');}}>
          {[1,2,3,4,5].map(x=><option key={x} value={x}>Lớp {x}</option>)}
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
    {!loading && !filtered.length && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Chưa có địa chỉ tích hợp phù hợp trong dữ liệu đã xuất bản. Vui lòng liên hệ Admin nếu cần bổ sung.</p>}
    {!!filtered.length && <div className="grid gap-2">
      {filtered.map(x=><button key={x.id} type="button" onClick={()=>{setSelectedId(x.id);setCopied(false)}} className={`w-full rounded-xl border p-3 text-left text-sm transition ${selectedId===x.id?'border-emerald-600 bg-emerald-50':'border-slate-200 hover:bg-slate-50'}`}>
        <span className="font-bold">{x.lesson}</span><span className="mt-1 block text-xs text-slate-500">{x.subject} · {x.week ? 'Tuần '+x.week : 'Chưa ghi tuần'}</span>
      </button>)}
    </div>}
    {selected && <article className="space-y-4 rounded-2xl border border-sky-200 bg-sky-50/40 p-4">
      <div><p className="text-xs font-bold uppercase text-sky-800">Địa chỉ tích hợp đã duyệt</p><h3 className="font-black text-slate-900">{selected.lesson}</h3></div>
      <p className="text-sm"><strong>Hình thức:</strong> {selected.integrationType || 'Theo tài liệu gốc'}</p>
      <p className="text-sm"><strong>Vị trí:</strong> {selected.activity || 'Chưa ghi vị trí cụ thể'}</p>
      <div className="whitespace-pre-wrap rounded-xl bg-white p-3 text-sm text-slate-800"><strong>Nội dung GDĐP:</strong>\n{selected.content}</div>
      <button type="button" onClick={()=>void copy(`LỚP ${selected.grade} · ${selected.subject} · ${selected.week}\nBài: ${selected.lesson}\nĐịa chỉ tích hợp: ${selected.activity}\nHình thức: ${selected.integrationType}\nNội dung GDĐP: ${selected.content}`)} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">{copied?'Đã sao chép':'Sao chép vào KHBD'}</button>
      <p className="text-xs text-slate-500">Chỉ hiển thị nội dung nguồn do Admin duyệt; phần gợi ý AI sẽ được bổ sung sau và kiểm duyệt trước khi công bố.</p>
    </article>}
  </section>;
};
