import React,{useEffect,useState} from 'react';
import {downloadStudentCardPng,downloadStudentCardsZip} from './TeacherQrDownloads';
import {makeDemoStudentQrUrl} from './demoStudentQr';

type Learner={id:string;name:string};
type Card={id:string;name:string;code:string;qr:string};
type Props={className:string;grade:number;students:Learner[]};

/** Show the same PNG/ZIP/print options, but never issue an actual student credential. */
export function DemoStudentAccessCards({className,grade,students}:Props){
  const [cards,setCards]=useState<Card[]>([]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [selected,setSelected]=useState('');
  useEffect(()=>{setCards([]);setMessage('');setSelected('');},[className,grade,students.length]);
  async function generate(){
    setBusy(true);setMessage('');
    try{
      const qrcode=await import('qrcode');
      const results:Card[]=[];
      for(let i=0;i<students.length;i++){
        const ordinal=i+1;
        const code='TN-'+String(grade)+String(ordinal).padStart(3,'0');
        const url=makeDemoStudentQrUrl(window.location.origin,grade,ordinal,className);
        const qr=await qrcode.toDataURL(url,{width:300,margin:2,errorCorrectionLevel:'M'});
        results.push({id:students[i].id,name:'Học sinh '+String(ordinal).padStart(2,'0'),code,qr});
      }
      setCards(results);
      setMessage('Đã tạo '+results.length+' thẻ trải nghiệm trên thiết bị. QR quét vào hành trình thử và không cấp tài khoản học sinh thật.');
    }catch(error){setMessage((error as Error).message);}
    finally{setBusy(false);}
  }
  const download=async(action:'one'|'zip')=>{
    setBusy(true);setMessage('');
    try{
      const target=cards.find(card=>card.id===selected)||cards[0];
      if(action==='one'){
        if(!target)throw Error('Hãy tạo thẻ trước.');
        await downloadStudentCardPng({...target,code:target.code+' · THỬ NGHIỆM'},className+' - TRẢI NGHIỆM');
      }else{
        await downloadStudentCardsZip(cards.map(card=>({...card,code:card.code+' · THỬ NGHIỆM'})),className+' - TRẢI NGHIỆM');
      }
    }catch(error){setMessage((error as Error).message);}
    finally{setBusy(false);}
  };
  return <section className="mt-4 space-y-4 rounded-2xl border border-sky-200 bg-sky-50/50 p-4" aria-label="Thẻ QR học sinh trải nghiệm">
    <div>
      <h3 className="text-lg font-black text-sky-950">Thẻ QR học sinh</h3>
      <p className="mt-1 text-sm text-slate-700">
        Tạo mã và thẻ QR riêng cho từng vị trí trong lớp để thử quy trình quét vào học.
        Các mã bắt đầu bằng <strong>TN-</strong> chỉ dùng trong chế độ trải nghiệm, không phải mã đăng nhập thật.
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="min-h-11 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        disabled={busy||!students.length} onClick={()=>void generate()}>
        {busy?'Đang tạo…':'Tạo thẻ QR cho '+students.length+' học sinh'}
      </button>
      <button type="button" className="min-h-11 rounded-xl border border-sky-300 bg-white px-3 py-2.5 text-sm font-bold text-sky-900 disabled:opacity-50"
        disabled={busy||!cards.length} onClick={()=>void download('zip')}>Tải trọn bộ thẻ QR (ZIP)</button>
      <button type="button" className="min-h-11 rounded-xl border border-sky-300 bg-white px-3 py-2.5 text-sm font-bold text-sky-900 disabled:opacity-50"
        disabled={busy||!cards.length} onClick={()=>window.print()}>In / lưu PDF</button>
    </div>
    <p className="text-xs font-semibold text-slate-700">TRẢI NGHIỆM · Mã QR đưa vào hành trình học thử theo khối, không đăng ký học sinh hoặc ghi kết quả lên máy chủ.</p>
    {message&&<p role="status" className="rounded-xl bg-white p-3 text-sm text-slate-700">{message}</p>}
    {!!cards.length&&<div className="space-y-4">
      <label className="block text-sm font-semibold">Chọn thẻ để tải riêng
        <select className="mt-1 min-h-11 w-full max-w-sm rounded-xl border border-slate-300 bg-white px-3"
          value={selected||cards[0]?.id||''} onChange={e=>setSelected(e.target.value)}>
          {cards.map(card=><option value={card.id} key={card.id}>{card.name} · {card.code}</option>)}
        </select>
      </label>
      <button type="button" className="min-h-11 rounded-xl border border-sky-300 bg-white px-4 py-2 font-bold text-sky-900"
        disabled={busy} onClick={()=>void download('one')}>Tải thẻ PNG riêng</button>
      <div id="student-access-print" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.slice(0,100).map(card=><article key={card.id} className="student-access-card break-inside-avoid rounded-2xl border-2 border-sky-200 bg-white p-4 text-center">
          <p className="text-sm font-black text-sky-950">CHẠM ĐÀ NẴNG · Lớp {className}</p>
          <p className="mt-1 text-lg font-black text-slate-900">{card.name}</p>
          <img className="mx-auto my-2" src={card.qr} alt={'Mã QR trải nghiệm '+card.name} width={180} height={180}/>
          <p className="font-mono text-base font-bold text-slate-800">{card.code}</p>
          <p className="mt-2 text-xs font-bold text-amber-800">THẺ TRẢI NGHIỆM · KHÔNG PHẢI MÃ HỌC SINH THẬT</p>
        </article>)}
      </div>
      <style>{'@media print{body *{visibility:hidden!important}#student-access-print,#student-access-print *{visibility:visible!important}#student-access-print{position:absolute;left:0;top:0;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:12px}.student-access-card{break-inside:avoid}.student-card-download{display:none!important}}'}</style>
    </div>}
  </section>;
}
