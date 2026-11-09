import React,{useEffect,useRef,useState} from 'react';
import {authService,StudentAccess} from '../../services/AuthService';
type Card={id:string;name:string;code:string;qr:string};
export function StudentAccessCards({classId,className}:{classId:string;className:string}){
 const [students,setStudents]=useState<StudentAccess[]>([]),[cards,setCards]=useState<Card[]>([]);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[confirm,setConfirm]=useState('');
 const [oldCodes,setOldCodes]=useState<Record<string,string>>({});
 const generation=useRef(0),inFlight=useRef(false);
 useEffect(()=>{const version=++generation.current;setCards([]);setStudents([]);setOldCodes({});setMessage('');setConfirm('');
  void authService.studentAccess(classId).then(rows=>{if(version===generation.current)setStudents(rows);}).catch(e=>{if(version===generation.current)setMessage(e.message);});
  return()=>{generation.current++;};
 },[classId]);
 async function issue(rows:StudentAccess[],action:'issue'|'rotate'|'adopt'){
  if(inFlight.current)return;inFlight.current=true;setBusy(true);setMessage('');const version=generation.current;
  let completed=0;
  try{
   const QRCode=await import('qrcode');
   for(const row of rows){
    if(version!==generation.current)break;
    const result=await authService.issueStudentCode(classId,row.id,action,oldCodes[row.id]);
    // Keep the newly issued code even if QR generation fails; never issue again
    // automatically after a timeout or a lost response.
    if(version!==generation.current)break;
    const card={id:row.id,name:result.profile.name,code:result.syncCode,qr:''};
    setCards(prev=>[...prev.filter(c=>c.id!==row.id),card]);
    setStudents(prev=>prev.map(s=>s.id===row.id?{...s,issued:true,studentId:result.profile.id}:s));completed++;
    try{const qr=await QRCode.toDataURL(window.location.origin+'/#student-code='+encodeURIComponent(result.syncCode),{width:180,margin:2,errorCorrectionLevel:'M'});if(version===generation.current)setCards(prev=>prev.map(c=>c.id===row.id?{...c,qr}:c));}catch{setMessage('Đã cấp mã. Chưa tạo được QR; có thể dùng mã in trên thẻ.');}
   }
   if(version===generation.current){setConfirm('');setMessage(`Đã xử lý ${completed} học sinh. Hãy in hoặc lưu thẻ trước khi rời trang.`);}
  }catch(e){if(version===generation.current){setMessage(`${completed?`Đã cấp ${completed} mã. `:''}${(e as Error).message} Nếu kết nối bị ngắt, tải lại danh sách trước khi thử tiếp.`);try{setStudents(await authService.studentAccess(classId));}catch{}}}
  finally{inFlight.current=false;if(version===generation.current)setBusy(false);}
 }
 return <section className="border-t pt-5 space-y-4">
  <h3 className="text-lg font-black">Mã đăng nhập riêng của học sinh</h3>
  <p className="text-sm text-slate-600">Mỗi em có hồ sơ riêng gắn với lớp. Dùng mã hoặc quét QR để vào học, không cần mật khẩu. Kết quả tự về lớp này.</p>
  <p className="text-sm rounded-xl bg-amber-50 p-3">Em đã học trên website? Nhập mã đồng bộ cũ của em rồi chọn “Giữ hành trình cũ”. Chỉ cấp hồ sơ mới cho em chưa có hành trình.</p>
  <button type="button" disabled={busy||!students.some(s=>!s.issued)} onClick={()=>setConfirm('batch')} className="rounded-xl bg-sky-700 text-white px-4 py-3 font-bold disabled:opacity-50">Cấp mã cho các em chưa có hồ sơ</button>
  {confirm==='batch'&&<div className="rounded-xl border border-amber-300 p-3"><p>Đã kiểm tra các em chưa có hành trình cũ? Thao tác này tạo hồ sơ mới cho {students.filter(s=>!s.issued).length} em chưa có mã.</p><button type="button" disabled={busy} onClick={()=>void issue(students.filter(s=>!s.issued),'issue')} className="m-2 rounded-lg bg-emerald-700 p-2 text-white">Xác nhận cấp mã mới</button><button type="button" disabled={busy} onClick={()=>setConfirm('')}>Hủy</button></div>}
  <div className="space-y-3">{students.map(row=><div key={row.id} className="rounded-xl border p-3 space-y-2">
   <p className="font-bold">{row.index+1}. {row.name} <span className="text-xs font-normal">{row.issued?'· Đã có hồ sơ':'· Chưa cấp mã'}</span></p>
   {!row.issued?<div className="flex flex-wrap items-center gap-2"><button type="button" disabled={busy} onClick={()=>void issue([row],'issue')} className="rounded-lg bg-emerald-700 p-2 text-white">Cấp mã mới</button><input aria-label={'Mã cũ của '+row.name+' số '+(row.index+1)} type="password" autoComplete="off" maxLength={20} placeholder="Mã đồng bộ cũ (nếu có)" value={oldCodes[row.id]||''} onChange={e=>setOldCodes(prev=>({...prev,[row.id]:e.target.value}))} className="min-w-0 max-w-full rounded-lg border p-2"/><button type="button" disabled={busy||!oldCodes[row.id]?.trim()} onClick={()=>void issue([row],'adopt')} className="rounded-lg border p-2">Giữ hành trình cũ</button></div>:<button type="button" disabled={busy} onClick={()=>setConfirm(row.id)} className="rounded-lg border p-2">Quên/lộ mã: cấp lại</button>}
   {confirm===row.id&&<div className="rounded-lg bg-amber-50 p-3"><p>Mã cũ của {row.name} sẽ ngừng sử dụng. Hồ sơ và tiến độ giữ nguyên. Thiết bị đang học cần nhập mã mới.</p><button type="button" disabled={busy} onClick={()=>void issue([row],'rotate')} className="m-2 rounded-lg bg-amber-700 p-2 text-white">Xác nhận cấp lại</button><button type="button" disabled={busy} onClick={()=>setConfirm('')}>Hủy</button></div>}
  </div>)}</div>
  {message&&<p role="status" className="rounded-xl bg-slate-100 p-3">{message}</p>}
  {!!cards.length&&<><p className="text-sm font-bold">Thẻ chỉ hiện trong lượt cấp này. In hoặc lưu PDF ngay; phát riêng cho từng em.</p><button type="button" onClick={()=>window.print()} className="rounded-xl bg-slate-800 p-3 text-white font-bold">In / lưu PDF thẻ đã cấp</button>
   <div id="student-access-print" className="grid sm:grid-cols-2 gap-3">{cards.map(card=><article key={card.id} className="student-access-card rounded-xl border-2 border-sky-200 bg-white p-4 text-center break-inside-avoid"><p className="text-sm font-bold">CHẠM ĐÀ NẴNG · Lớp {className}</p><p className="font-black text-lg">{card.name}</p>{card.qr&&<img src={card.qr} alt={'QR vào học của '+card.name} width={180} height={180} className="mx-auto"/>}<p className="font-mono text-lg font-bold tracking-wider">{card.code}</p><p className="text-xs">Quét QR hoặc mở {window.location.host}, chọn Học sinh → Vào học bằng mã. Giữ thẻ riêng.</p></article>)}</div>
   <style>{`@media print{body *{visibility:hidden!important}#student-access-print,#student-access-print *{visibility:visible!important}#student-access-print{position:absolute;left:0;top:0;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:12px}.student-access-card{break-inside:avoid;box-shadow:none!important}}`}</style>
  </>}
 </section>;
}
