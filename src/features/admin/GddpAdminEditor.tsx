import React, { useEffect, useState } from 'react';
import { gddpService, GddpCatalog } from '../../services/GddpService';

export const GddpAdminEditor: React.FC = () => {
  const [catalog,setCatalog] = useState<GddpCatalog>({year:'2026-2027',records:[]});
  const [published,setPublished] = useState(false);
  const [saved,setSaved] = useState(false);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  const load = async () => {
    try {
      const data=await gddpService.adminCatalog();
      setCatalog(data.catalog || {year:'2026-2027',records:[]});
      setPublished(!!data.published);setSaved(true);
    } catch(e) {setError(e instanceof Error?e.message:'Không thể tải kho GDĐP.');}
  };
  useEffect(()=>{void load();},[]);
  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file=event.target.files?.[0];
    if (!file) return;
    setError('');setMessage('');
    if (file.size > 2 * 1024 * 1024) {setError('Tệp JSON quá lớn (tối đa 2 MB).');return;}
    try {
      const obj: unknown=JSON.parse(await file.text());
      if(!obj || typeof obj!=='object' || Array.isArray(obj))throw Error('Sai cấu trúc dữ liệu.');
      const data=obj as Partial<GddpCatalog>;
      if(data.year!=='2026-2027'||!Array.isArray(data.records)||!data.records.length || data.records.length>500)
        throw Error('Chỉ nhận tệp JSON GDĐP năm 2026–2027 chứa 1–500 địa chỉ.');
      const ids=new Set<string>();
      for(const row of data.records){
        if(!row || typeof row.id!=='string' || ids.has(row.id) ||
          ![1,2,3,4,5].includes(row.grade) || typeof row.lesson!=='string' ||
          !row.lesson.trim() || typeof row.content!=='string')
          throw Error('Tài liệu có địa chỉ thiếu thông tin hoặc bị trùng.');
        ids.add(row.id);
      }
      setCatalog({year:'2026-2027',records:data.records});
      setSaved(false);
      setMessage('Đã đọc '+data.records.length+' địa chỉ. Hãy kiểm tra trước khi lưu bản nháp.');
    }catch(e){setError(e instanceof Error?e.message:'Không đọc được tệp JSON.');}
    event.target.value='';
  };
  const save = async () => {
    setBusy(true);setError('');setMessage('');
    try {const data=await gddpService.saveDraft(catalog);setSaved(true);setPublished(false);setMessage('Đã lưu bản nháp '+data.records+' địa chỉ. Giáo viên vẫn xem bản đã duyệt trước đó.');}
    catch(e){setError(e instanceof Error?e.message:'Lưu dữ liệu thất bại.');}
    finally{setBusy(false);}
  };
  const generate = async (id:string) => {
    if(!saved || busy)return;
    setBusy(true);setError('');setMessage('');
    try {
      const suggestion=await gddpService.suggest(id);
      setCatalog(prev=>({...prev,records:prev.records.map(x=>x.id===id?{...x,
        outcomes:suggestion.outcomes,teachingSuggestion:suggestion.teachingSuggestion}:x)}));
      setSaved(false);setPublished(false);
      setMessage('AI đã tạo bản nháp. Admin cần đọc, chỉnh sửa, lưu và xuất bản trước khi giáo viên nhìn thấy.');
    }catch(e){setError(e instanceof Error?e.message:'Không tạo được gợi ý AI.');}
    finally{setBusy(false);}
  };
  const publish = async () => {
    if(!saved || !catalog.records.length)return;
    if(!window.confirm('Xuất bản '+catalog.records.length+' địa chỉ GDĐP cho giáo viên năm học 2026–2027?'))return;
    setBusy(true);setError('');setMessage('');
    try{const data=await gddpService.publish();setPublished(true);setMessage('Đã xuất bản '+data.records+' địa chỉ cho giáo viên.');}
    catch(e){setError(e instanceof Error?e.message:'Xuất bản thất bại.');}
    finally{setBusy(false);}
  };
  const missingContent = catalog.records.filter(x=>!x.content?.trim()).length;
  const counts=[1,2,3,4,5].map(grade=>({grade,count:catalog.records.filter(x=>x.grade===grade).length}));
  return <section className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm space-y-4">
    <div><h2 className="text-xl font-black text-slate-900">Thư viện địa chỉ tích hợp GDĐP</h2><p className="text-sm text-slate-600">Năm học 2026–2027. Chỉ Admin được cập nhật; giáo viên xem nguồn đã xuất bản.</p></div>
    <div className="flex flex-wrap gap-2">{counts.map(x=><span key={x.grade} className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold">Lớp {x.grade}: {x.count}</span>)}</div>
    {missingContent>0 && <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-900">Có {missingContent} địa chỉ thiếu nội dung nguồn. Vẫn có thể lưu nháp, nhưng chưa thể xuất bản hoặc tạo gợi ý AI cho các địa chỉ này. Cần đối chiếu tài liệu gốc trước khi bổ sung.</p>}
    <label className="block space-y-2 text-sm font-bold">Nhập danh mục từ tệp JSON đã chuẩn hóa
      <input type="file" accept=".json,application/json" onChange={e=>void importFile(e)} className="block w-full rounded-xl border border-slate-300 p-3 text-sm font-normal" />
    </label>
    <p className="text-xs text-slate-500">Chọn file GDDP_2026_2027_48_dia_chi.json được chuẩn hóa từ tài liệu Word. Không tải trực tiếp Word lên ở phiên bản đầu để tránh nhầm các ô gộp.</p>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    <div className="max-h-80 space-y-2 overflow-auto rounded-xl border border-slate-200 p-3">
      {catalog.records.map(row=><div key={row.id} className="border-b border-slate-100 py-2 text-xs">
        <strong>Lớp {row.grade} · {row.subject} · {row.week} · {row.lesson}</strong>
        <p className="mt-1 text-slate-700">Địa chỉ: {row.activity}</p>
        <label className="mt-2 block font-semibold">Nội dung GDĐP theo nguồn {row.content.trim()?'':'— CHƯA CÓ'}
          <textarea rows={3} value={row.content} onChange={e=>{const value=e.target.value;setCatalog(prev=>({...prev,records:prev.records.map(x=>x.id===row.id?{...x,content:value}:x)}));setSaved(false);setPublished(false)}} className="mt-1 w-full rounded-lg border border-slate-300 p-2 font-normal" placeholder="Chỉ bổ sung nội dung đã được tổ chuyên môn xác minh"/>
        </label>
        <button type="button" disabled={!saved || busy} onClick={()=>void generate(row.id)} className="mt-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800 disabled:opacity-40">AI gợi ý (Admin duyệt trước khi công bố)</button>
        <label className="mt-2 block font-semibold">Yêu cầu cần đạt bổ sung (Admin duyệt)
          <textarea rows={2} value={row.outcomes || ''} onChange={e=>{const value=e.target.value;setCatalog(prev=>({...prev,records:prev.records.map(x=>x.id===row.id?{...x,outcomes:value}:x)}));setSaved(false);setPublished(false)}} className="mt-1 w-full rounded-lg border border-slate-300 p-2 font-normal" placeholder="Chỉ ghi yêu cầu GDĐP bổ sung, không thay mục tiêu bài học chính"/>
        </label>
        <label className="mt-2 block font-semibold">Gợi ý tổ chức tích hợp (Admin duyệt)
          <textarea rows={3} value={row.teachingSuggestion || ''} onChange={e=>{const value=e.target.value;setCatalog(prev=>({...prev,records:prev.records.map(x=>x.id===row.id?{...x,teachingSuggestion:value}:x)}));setSaved(false);setPublished(false)}} className="mt-1 w-full rounded-lg border border-slate-300 p-2 font-normal" placeholder="Câu hỏi GV – dự kiến trả lời HS – lời chốt ngắn gọn"/>
        </label>
      </div>)}
      {!catalog.records.length && <p className="text-sm text-slate-500">Chưa có dữ liệu. Nhập tệp JSON để xem trước.</p>}
    </div>
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={busy||!catalog.records.length} onClick={()=>void save()} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-40">Lưu bản nháp</button>
      <button type="button" disabled={busy||!saved||!catalog.records.length||published||missingContent>0} onClick={()=>void publish()} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-40">{published?'Đã xuất bản':'Xuất bản cho giáo viên'}</button>
    </div>
    <p className="text-xs text-amber-800">Chỉ nút AI gợi ý mới sử dụng Gemini và có thể phát sinh phí token. Không gọi AI khi giáo viên tra cứu. Admin phải duyệt trước khi xuất bản.</p>
    <p className="text-xs text-slate-500">An toàn: không thay đổi tài khoản đăng nhập hoặc nội dung học sinh. Dữ liệu bản nháp chưa thay thế dữ liệu đã công bố.</p>
  </section>;
};
