import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Eye, FileText, X } from 'lucide-react';
import type { GddpRecord } from '../../services/GddpService';
import type { LessonDeckDefinition } from '../../data/teacher/grade2LessonDecks';

export const GddpPreparedPresentation: React.FC<{record: GddpRecord; deck: LessonDeckDefinition; onExit: () => void}> = ({record, deck, onExit}) => {
  const [index, setIndex] = useState(0);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const [sourcesVisible, setSourcesVisible] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const move = (delta: number) => {setIndex(value => Math.max(0, Math.min(deck.slides.length - 1, value + delta)));setAnswerVisible(false);};
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => {document.body.style.overflow = overflow;previous?.focus();};
  }, []);
  useEffect(() => {body.current?.scrollTo(0, 0);}, [index]);
  const slide = deck.slides[index];
  return <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Trình chiếu bài ${record.lesson}`} onKeyDown={event => {
    if (event.key === 'Escape') {event.preventDefault();onExit();}
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault();move(event.key === 'ArrowRight' ? 1 : -1);}
    if (event.key === 'Tab' && dialog.current) {
      const elements = [...dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')];
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {event.preventDefault();last?.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first?.focus();}
    }
  }} className="fixed inset-0 z-[75] flex flex-col bg-[#f8fafc] text-slate-900 outline-none">
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-7">
      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">CHẠM ĐÀ NẴNG · TÍCH HỢP GDĐP · KHỐI 2</p><h2 className="text-sm font-black sm:text-base">{record.lesson}</h2><p className="text-xs text-slate-500">{record.subject} · Tuần {record.week} · {record.integrationType}</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setNotesVisible(value=>!value)} aria-pressed={notesVisible} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><FileText className="mr-1 inline h-4 w-4" />{notesVisible?'Ẩn ghi chú':'Ghi chú giáo viên'}</button><button type="button" onClick={()=>setSourcesVisible(value=>!value)} aria-pressed={sourcesVisible} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><BookOpen className="mr-1 inline h-4 w-4" />Nguồn & rà soát</button><button type="button" onClick={onExit} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"><X className="mr-1 inline h-4 w-4" />Đóng</button></div>
    </header>
    <div ref={body} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
      {sourcesVisible && <aside className="mx-auto mb-5 max-w-6xl space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <h3 className="font-black">Nguồn và phạm vi sử dụng</h3><p>Bản biên soạn đối chiếu nguồn; chưa phải xác nhận phê duyệt của tổ chuyên môn. Không thay thế nội dung bài học chính trong sách.</p>
        <ul className="list-disc space-y-1 pl-5">{deck.sources.map(source=><li key={source}>{source}</li>)}</ul>
        {deck.reviewNotes.map(note=><p key={note} className="font-semibold text-amber-900">Cần duyệt: {note}</p>)}
        <p>Hình khối trên slide là sơ đồ chữ minh hoạ học tập, không phải ảnh tư liệu hoặc bản đồ địa lí. Không dùng giọng đọc tự động theo thiết bị.</p>
      </aside>}
      <article className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-600 px-5 py-5 text-white sm:px-8"><p className="mb-2 text-xs font-semibold text-emerald-100">{deck.title} · {index+1}/{deck.slides.length}</p><h3 aria-live="polite" className="text-2xl font-black leading-tight sm:text-4xl">{slide.title}</h3></div>
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Sơ đồ minh hoạ học tập</p>{slide.visual.map((item,i)=><div key={item} className="flex items-center gap-3 rounded-2xl border border-white bg-white p-4 shadow-sm"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-700">{i+1}</span><span className="text-lg font-bold sm:text-xl">{item}</span></div>)}</div>
          <div className="space-y-5"><ul className="space-y-4">{slide.points.map(point=><li key={point} className="flex gap-3 text-lg leading-relaxed sm:text-2xl"><Check className="mt-1 h-5 w-5 shrink-0 text-emerald-600" /><span>{point}</span></li>)}</ul><section className="rounded-2xl border border-orange-100 bg-orange-50 p-5"><p className="mb-2 text-xs font-black uppercase text-orange-700">Cùng trao đổi</p><p className="text-lg font-bold sm:text-xl">{slide.question}</p><button type="button" onClick={()=>setAnswerVisible(value=>!value)} aria-expanded={answerVisible} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-orange-800 shadow-sm"><Eye className="h-4 w-4" />{answerVisible?'Ẩn gợi ý trả lời':'Hiện gợi ý trả lời'}</button>{answerVisible&&<p className="mt-4 rounded-xl bg-white p-4 text-base leading-relaxed text-emerald-900">{slide.answer}</p>}</section></div>
        </div>
        {notesVisible&&<aside className="border-t border-slate-100 bg-slate-50 p-5 text-sm leading-relaxed"><p className="mb-2 font-black">Ghi chú giáo viên · {record.activity.replace(/\n/g,' · ')}</p><p>{slide.teacherNotes}</p>{index===0&&<ul className="mt-3 list-disc pl-5">{deck.outcomes.map(goal=><li key={goal}>{goal}</li>)}</ul>}</aside>}
      </article>
    </div>
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-7"><button type="button" onClick={()=>move(-1)} disabled={index===0} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-30"><ArrowLeft className="mr-1 inline h-4 w-4" />Trước</button><span className="text-xs font-semibold text-slate-500">Trang {index+1} / {deck.slides.length}</span>{index===deck.slides.length-1?<button type="button" onClick={onExit} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Về bài dạy</button>:<button type="button" onClick={()=>move(1)} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Tiếp<ArrowRight className="ml-1 inline h-4 w-4" /></button>}</footer>
  </div>;
};
