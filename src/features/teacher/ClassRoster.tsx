import React, { useEffect, useState } from 'react';
import { authService, ManagedClass } from '../../services/AuthService';
export const ClassRoster: React.FC = () => {
  const [classes,setClasses]=useState<ManagedClass[]>([]);
  const [selected,setSelected]=useState('');
  const [grade,setGrade]=useState(2), [name,setName]=useState('2/24');
  const [year,setYear]=useState('2026-2027'), [names,setNames]=useState('');
  const [busy,setBusy]=useState(false), [message,setMessage]=useState('');
  const load=async()=>setClasses(await authService.classes());
  useEffect(()=>{void load().catch(e=>setMessage(e.message));},[]);
  const choose=(id:string)=>{
    setSelected(id);setMessage('');
    const c=classes.find(c=>c.id===id);
    if(c){setGrade(c.grade);setName(c.name);setYear(c.academicYear);setNames(c.students.join('\n'));}
    else {setNames('');}
  };
  return <section className="bg-white rounded-3xl p-6 border space-y-4">
    <h2 className="text-xl font-black">Lớp và danh sách học sinh của tôi</h2>
    <p className="text-sm text-slate-600">Tạo lớp, nhập mỗi học sinh trên một dòng rồi lưu. Danh sách được lưu trên máy chủ và chỉ nhân sự có quyền mới xem được.</p>
    <label className="block">Chọn lớp<select className="block w-full border rounded-xl p-3" value={selected} onChange={e=>choose(e.target.value)} disabled={busy}>
      <option value="">+ Tạo lớp mới</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name} · {c.academicYear} · {c.totalStudents} học sinh</option>)}
    </select></label>
    <form className="space-y-4" onSubmit={async e=>{
      e.preventDefault();if(busy)return;setBusy(true);setMessage('');
      try {await authService.saveClass({grade,name,academicYear:year,students:names.split(/\r?\n/).map(n=>n.trim()).filter(Boolean)},!selected);
        const fresh=await authService.classes();setClasses(fresh);setSelected(fresh.find(c=>c.name===name && c.academicYear===year)?.id || '');setMessage('Đã lưu lớp và danh sách học sinh.');
      }catch(e){setMessage((e as Error).message);}finally{setBusy(false);}
    }}>
      <fieldset disabled={busy} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <label>Khối<select disabled={!!selected} value={grade} onChange={e=>{const g=Number(e.target.value);setGrade(g);setName(`${g}/1`);}} className="block border rounded-xl p-3 w-full">{[1,2,3,4,5].map(g=><option key={g} value={g}>Khối {g}</option>)}</select></label>
          <label>Tên lớp<input required disabled={!!selected} pattern={`${grade}/[1-9][0-9]{0,2}`} value={name} onChange={e=>setName(e.target.value)} className="block border rounded-xl p-3 w-full" /></label>
          <label>Năm học<input required disabled={!!selected} pattern="20[0-9]{2}-20[0-9]{2}" value={year} onChange={e=>setYear(e.target.value)} className="block border rounded-xl p-3 w-full" /></label>
        </div>
        <label className="block">Họ tên học sinh — mỗi dòng một em<textarea rows={10} maxLength={10100} value={names} onChange={e=>setNames(e.target.value)} className="block border rounded-xl p-3 w-full" placeholder={'Nguyễn An\nTrần Bình'} /></label>
        <p className="text-sm">{names.split(/\r?\n/).filter(n=>n.trim()).length} học sinh · tối đa 100</p>
        <button className="rounded-xl bg-emerald-700 text-white px-5 py-3 font-bold">{busy?'Đang lưu…':selected?'Lưu danh sách':'Tạo lớp và lưu danh sách'}</button>
      </fieldset>
    </form>
    {message && <p role="status" className="rounded-xl bg-slate-100 p-3">{message}</p>}
  </section>;
};
