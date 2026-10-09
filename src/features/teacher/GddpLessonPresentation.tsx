import React, {useEffect, useState} from 'react';
import {MatchedLessonResource} from '../../services/GddpResourceMatcher';
import {GddpRecord} from '../../services/GddpService';
import {audioService} from '../../services/AudioService';
import {DEFAULT_APP_BACKGROUND_DATA_URL} from '../../assets/defaultAppBackground';

// Deliberately separate from StationView and ClassroomPresentationMode:
// only the single selected lesson hotspot renders, without stage navigation,
// student rewards, station challenge or whole-station narration.
export const GddpLessonPresentation:React.FC<{record:GddpRecord;resource:MatchedLessonResource;onExit:()=>void}> =
({record,resource,onExit})=>{
  const [showAnswer,setShowAnswer]=useState(false);
  const [show360,setShow360]=useState(false);
  useEffect(()=>()=>audioService.stopNarration(),[]);
  const {hotspot,station}=resource;
  const vr=hotspot.vr360?.verified?hotspot.vr360:null;
  const close=()=>{audioService.stopNarration();onExit();};
  return <div role="dialog" aria-modal="true" aria-label="Trình chiếu tích hợp GDĐP" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 p-4 text-white sm:p-7">
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold text-amber-300">TÍCH HỢP GDĐP · KHÔNG MỞ TOÀN BỘ TRẠM</p>
        <h2 className="text-xl font-black">{record.lesson}</h2>
        <p className="text-sm text-slate-300">{record.subject} · Lớp {record.grade} · {record.activity}</p></div>
      <button type="button" onClick={close} className="rounded-xl bg-rose-700 px-5 py-3 font-bold">Đóng trình chiếu</button>
    </header>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        <img className="max-h-[60vh] w-full object-contain" src={hotspot.image} alt={hotspot.titleVi} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=DEFAULT_APP_BACKGROUND_DATA_URL}}/>
        <div className="p-4"><h3 className="text-2xl font-bold">{hotspot.titleVi}</h3><p className="text-sm text-slate-300">{station.titleVi}</p></div>
      </div>
      <div className="space-y-4">
        <section className="rounded-2xl bg-slate-900 p-5"><h3 className="mb-2 font-black text-amber-300">Nội dung tương ứng với bài học</h3><p className="whitespace-pre-wrap">{hotspot.narrationVi}</p>
          {hotspot.keyFactVi && <p className="mt-3 rounded-xl bg-slate-800 p-3"><strong>Ghi nhớ:</strong> {hotspot.keyFactVi}</p>}
          <button type="button" className="mt-3 rounded-lg bg-sky-700 px-4 py-2 font-bold" onClick={()=>audioService.speakNarration(hotspot.narrationVi,'vi-VN')}>Nghe thuyết minh</button>
        </section>
        {record.teachingSuggestion && <section className="rounded-2xl bg-slate-900 p-5"><h3 className="font-bold text-amber-300">Gợi ý tích hợp đã duyệt</h3><p className="mt-2 whitespace-pre-wrap">{record.teachingSuggestion}</p></section>}
        {hotspot.interaction && <section className="rounded-2xl bg-slate-900 p-5">
          <h3 className="font-bold text-amber-300">Câu hỏi tương tác</h3><p className="my-2">{hotspot.interaction.questionVi}</p>
          {hotspot.interaction.options.map(x=><p key={x.id} className={`rounded-lg p-2 ${showAnswer&&x.isCorrect?'bg-emerald-800':'bg-slate-800'}`}>{x.textVi}</p>)}
          <button type="button" className="mt-3 rounded-lg bg-sky-700 px-3 py-2" onClick={()=>setShowAnswer(x=>!x)}>{showAnswer?'Ẩn đáp án':'Hiện đáp án'}</button>
        </section>}
        {vr && <button type="button" onClick={()=>setShow360(true)} className="rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950">Mở VR360 của nội dung này</button>}
      </div>
    </div>
    {show360 && vr && <div className="fixed inset-0 z-[60] flex flex-col bg-black p-4"><button type="button" onClick={()=>setShow360(false)} className="mb-3 self-end rounded-lg bg-slate-700 px-5 py-2">Đóng VR360</button><iframe src={vr.url} title={vr.title||hotspot.titleVi} className="min-h-0 flex-1" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" allowFullScreen/></div>}
  </div>;
};