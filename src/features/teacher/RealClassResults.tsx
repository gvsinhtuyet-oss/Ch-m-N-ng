import React, {useEffect,useState,useRef} from 'react';
import {authService, ManagedClass, RealClassProgress} from '../../services/AuthService';

// Only server-confirmed student progress appears here. Never fall back to mock users.
export const RealClassResults: React.FC = () => {
  const [classes,setClasses]=useState<ManagedClass[]>([]);
  const [classId,setClassId]=useState('');
  const [report,setReport]=useState<RealClassProgress|null>(null);
  const [code,setCode]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const [exporting,setExporting]=useState(false);
  const requestId=useRef(0);
  const selectedClass=useRef(classId);
  selectedClass.current=classId;
  const load=async(id:string)=>{
    const token=++requestId.current;
    if(!id){setReport(null);setLoading(false);return;}
    setLoading(true);setMessage('');
    try {const result=await authService.classProgress(id);
      if(token===requestId.current && selectedClass.current===id)setReport(result);
    }catch(error){if(token===requestId.current && selectedClass.current===id){setReport(null);setMessage((error as Error).message);}}
    finally{if(token===requestId.current && selectedClass.current===id)setLoading(false);}
  };
  const exportExcel=async()=>{
    if(!report || loading || exporting)return;
    setExporting(true);setMessage('');
    try {
      const {default:ExcelJS}=await import('exceljs');
      const workbook=new ExcelJS.Workbook();
      workbook.creator='CHẠM ĐÀ NẴNG';
      const overview=workbook.addWorksheet('Tổng hợp lớp');
      overview.addRow(['KẾT QUẢ HỌC TẬP – CHẠM ĐÀ NẴNG']);
      overview.addRow(['Lớp',report.className,'Năm học',report.academicYear]);
      overview.addRow(['Thời điểm xuất',new Date().toLocaleString('vi-VN')]);
      overview.addRow(['Sĩ số',report.rosterCount,'Đã liên kết',report.linkedCount]);
      overview.addRow(['Chưa liên kết',Math.max(0,report.rosterCount-report.linkedCount)]);
      overview.addRow(['Lưu ý','Chỉ gồm dữ liệu đã đồng bộ. Chưa liên kết không có nghĩa là 0 điểm hoặc chưa học.']);
      overview.addRow([]);
      overview.addRow(['STT','Họ tên học sinh','Trạm hoàn thành','Con dấu']);
      report.students.forEach((st,i)=>overview.addRow([i+1,st.name,st.completedStations,st.totalStamps]));
      overview.columns=[{width:24},{width:65},{width:24},{width:24}];
      overview.views=[{state:'frozen',ySplit:8}];
      overview.autoFilter={from:'A8',to:`D${Math.max(8,8+report.students.length)}`};
      const details=workbook.addWorksheet('Chi tiết trạm');
      details.addRow(['STT','Họ tên học sinh','Mã trạm','Trạng thái','Chặng hoàn thành','Con dấu','Lần học gần nhất']);
      report.students.forEach((st,i)=>st.stations.forEach(p=>details.addRow([i+1,st.name,p.stationId,p.completed?'Hoàn thành':'Đang học',p.completedStages,p.stamp?'Có':'Chưa có',p.lastVisitedAt?new Date(p.lastVisitedAt).toLocaleString('vi-VN'):'' ])));
      details.columns=[{width:8},{width:32},{width:28},{width:20},{width:23},{width:15},{width:26}];
      details.views=[{state:'frozen',ySplit:1}];
      details.autoFilter={from:'A1',to:`G${Math.max(1,details.rowCount)}`};
      for(const [sheet,header] of [[overview,8],[details,1]] as const){
        sheet.getRow(header).font={bold:true,color:{argb:'FFFFFFFF'}};
        sheet.getRow(header).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0369A1'}};
        sheet.eachRow(row=>{row.alignment={vertical:'top',wrapText:true};});
      }
      const buffer=await workbook.xlsx.writeBuffer();
      const bytes=new Uint8Array(buffer);
      const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
      const link=document.createElement('a');link.href=url;
      link.download=`CHAM_DA_NANG_${report.className.replace(/[^a-zA-Z0-9_-]/g,'_')}_${report.academicYear}.xlsx`;
      document.body.appendChild(link);link.click();link.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(error){setMessage('Chưa xuất được Excel: '+(error as Error).message);}
    finally{setExporting(false);}
  };
  useEffect(()=>{let active=true;void authService.classes().then(list=>{
    if(!active)return;setClasses(list);setClassId(list[0]?.id||'');
  }).catch(e=>{if(active)setMessage(e.message);});return()=>{active=false;};},[]);
  useEffect(()=>{setReport(null);void load(classId);return()=>{requestId.current++;};},[classId]);
  return <section className="rounded-3xl bg-white border p-6 space-y-5">
    <div><h2 className="text-xl font-black">Kết quả học tập thực tế</h2>
      <p className="text-sm text-slate-600">Chỉ hiện dữ liệu đồng bộ từ thiết bị học sinh đã được liên kết với lớp. Không sử dụng học sinh hoặc kết quả minh họa.</p></div>
    <label className="block text-sm font-semibold">Lớp học
      <select value={classId} disabled={busy || exporting} onChange={e=>{requestId.current++;setReport(null);setMessage('');setClassId(e.target.value);}} className="block w-full border rounded-xl p-3 mt-1">
        {classes.length===0&&<option value="">Chưa có lớp. Tạo lớp tại mục Lớp học.</option>}
        {classes.map(c=><option key={c.id} value={c.id}>{c.name} · {c.academicYear}</option>)}
      </select>
    </label>
    {classId&&<form onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);setMessage('');
      try{await authService.linkStudentProgress(classId,code);setCode('');await load(classId);}
      catch(error){setMessage((error as Error).message);}finally{setBusy(false);}}} className="rounded-xl bg-sky-50 border border-sky-100 p-4 space-y-2">
      <label className="text-sm font-bold block">Liên kết một học sinh bằng mã đồng bộ 12 ký tự
        <input type="text" autoComplete="off" required maxLength={20} value={code}
          onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Mã đồng bộ do học sinh cung cấp"
          className="mt-1 block w-full border rounded-lg p-3 font-mono bg-white"/>
      </label>
      <p className="text-xs text-slate-600">Trước tiên nhập đúng họ tên học sinh vào danh sách lớp. Mã đồng bộ phải thuộc đúng tên, khối và lớp đó. Không gửi mã qua nhóm công khai.</p>
      <button disabled={busy} className="rounded-xl bg-sky-700 text-white px-4 py-2 font-bold disabled:opacity-50">{busy?'Đang xác minh…':'Liên kết học sinh'}</button>
    </form>}
    {message&&<p role="status" className="text-sm rounded-lg bg-slate-100 p-3">{message}</p>}
    {loading&&<p role="status" className="text-sm text-slate-600">Đang tải kết quả từ máy chủ…</p>}
    {report&&<>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border p-4"><span className="text-slate-600">Danh sách lớp</span><p className="text-2xl font-bold">{report.rosterCount}</p></div>
        <div className="rounded-xl border p-4"><span className="text-slate-600">Học sinh đã liên kết</span><p className="text-2xl font-bold">{report.linkedCount}</p></div>
      </div>
      <div className="flex flex-wrap gap-3"><button type="button" disabled={loading || busy || exporting} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50" onClick={()=>void load(classId)}>Làm mới dữ liệu</button><button type="button" disabled={loading || busy || exporting} onClick={()=>void exportExcel()} className="rounded-lg bg-emerald-700 text-white px-4 py-2 text-sm font-bold disabled:opacity-50">{exporting?'Đang xuất…':'Xuất Excel (.xlsx)'}</button></div>
      {report.students.length===0?<p className="text-sm text-slate-500">Chưa có kết quả thực đã liên kết. Đây không phải kết quả 0 điểm hoặc 0 lượt học.</p>:<div className="overflow-x-auto">
        <table className="w-full text-sm text-left"><thead><tr className="bg-slate-100"><th className="p-2">Học sinh</th><th className="p-2">Trạm hoàn thành</th><th className="p-2">Con dấu</th><th className="p-2">Chi tiết</th></tr></thead>
          <tbody>{report.students.map((st,i)=><tr key={i} className="border-b align-top">
            <td className="p-2 font-semibold">{st.name}</td><td className="p-2">{st.completedStations}</td><td className="p-2">{st.totalStamps}</td>
            <td className="p-2"><details><summary className="cursor-pointer">Xem {st.stations.length} trạm</summary>
              {st.stations.map(p=><p key={p.stationId} className="py-1">{p.stationId}: {p.completed?'Hoàn thành':'Đang học'} · {p.completedStages}/4 chặng · {p.stamp?'Có dấu':'Chưa có dấu'}{p.lastVisitedAt?' · '+new Date(p.lastVisitedAt).toLocaleDateString('vi-VN'):''}</p>)}
            </details></td>
          </tr>)}</tbody></table>
      </div>}
      <p className="text-xs text-slate-500">Số liệu phản ánh bản ghi đã đồng bộ, không dùng để xếp hạng học sinh. Học sinh học ngoại tuyến có thể chưa được cập nhật.</p>
    </>}
  </section>;
};
