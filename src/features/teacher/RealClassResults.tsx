import React, {useEffect,useState} from 'react';
import {authService, ManagedClass, RealClassProgress} from '../../services/AuthService';

// Only server-confirmed student progress appears here. Never fall back to mock users.
export const RealClassResults: React.FC = () => {
  const [classes,setClasses]=useState<ManagedClass[]>([]);
  const [classId,setClassId]=useState('');
  const [report,setReport]=useState<RealClassProgress|null>(null);
  const [code,setCode]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const load=async(id:string)=>{if(!id){setReport(null);return;}setReport(await authService.classProgress(id));};
  useEffect(()=>{let active=true;void authService.classes().then(list=>{
    if(!active)return;setClasses(list);setClassId(list[0]?.id||'');
  }).catch(e=>{if(active)setMessage(e.message);});return()=>{active=false;};},[]);
  useEffect(()=>{let active=true;setReport(null);if(classId)void authService.classProgress(classId).then(x=>{if(active)setReport(x);}).catch(e=>{if(active)setMessage(e.message);});return()=>{active=false;};},[classId]);
  return <section className="rounded-3xl bg-white border p-6 space-y-5">
    <div><h2 className="text-xl font-black">Kết quả học tập thực tế</h2>
      <p className="text-sm text-slate-600">Chỉ hiện dữ liệu đồng bộ từ thiết bị học sinh đã được liên kết với lớp. Không sử dụng học sinh hoặc kết quả minh họa.</p></div>
    <label className="block text-sm font-semibold">Lớp học
      <select value={classId} onChange={e=>{setMessage('');setClassId(e.target.value);}} className="block w-full border rounded-xl p-3 mt-1">
        {classes.length===0&&<option value="">Chưa có lớp. Tạo lớp tại mục Lớp học.</option>}
        {classes.map(c=><option key={c.id} value={c.id}>{c.name} · {c.academicYear}</option>)}
      </select>
    </label>
    {classId&&<form onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);setMessage('');
      try{await authService.linkStudentProgress(classId,code);setCode('');await load(classId);setMessage('Đã liên kết tiến trình học sinh.');}
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
    {report&&<>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border p-4"><span className="text-slate-600">Danh sách lớp</span><p className="text-2xl font-bold">{report.rosterCount}</p></div>
        <div className="rounded-xl border p-4"><span className="text-slate-600">Học sinh đã liên kết</span><p className="text-2xl font-bold">{report.linkedCount}</p></div>
      </div>
      <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={()=>void load(classId).catch(e=>setMessage(e.message))}>Làm mới dữ liệu</button>
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
