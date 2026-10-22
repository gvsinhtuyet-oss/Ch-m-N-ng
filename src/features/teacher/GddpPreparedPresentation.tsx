import {LearningMediaCredit} from '../../components/LearningMediaCredit';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Eye, FileText, X } from 'lucide-react';
import type { GddpRecord } from '../../services/GddpService';
import type { LessonDeckDefinition } from '../../data/teacher/grade2LessonDecks';

export const GddpPreparedPresentation: React.FC<{record: GddpRecord; deck: LessonDeckDefinition; onExit: () => void}> = ({record, deck, onExit}) => {
  const isPilot = record.id === 'gddp-2026-2-01' && deck.slides.length >= 5;
  const [quickMode, setQuickMode] = useState(isPilot);
  const [index, setIndex] = useState(0);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [assessment, setAssessment] = useState({strong:0,met:0,support:0});
  const [classSize, setClassSize] = useState('');
  const [assessmentNote, setAssessmentNote] = useState('');
  const sequence = quickMode && isPilot ? [0,1,4] : deck.slides.map((_,i)=>i);
  const visibleSlides = sequence.map(i=>deck.slides[i]);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const [sourcesVisible, setSourcesVisible] = useState(false);
  const [guideVisible, setGuideVisible] = useState(true);
  const [teacherMode, setTeacherMode] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const move = (delta: number) => {setIndex(value => Math.max(0, Math.min(visibleSlides.length - 1, value + delta)));setAnswerVisible(false);};
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => {document.body.style.overflow = overflow;previous?.focus();};
  }, []);
  useEffect(() => {body.current?.scrollTo(0, 0);}, [index]);
  const slide = visibleSlides[index];
  const minutes = quickMode && isPilot ? [2,4,2][index] : null;
  const pilotScripts = [
    'GV: Trong bài Bóp nát quả cam, Trần Quốc Toản thể hiện tình yêu nước như thế nào? Mời 1–2 em trả lời. Chuyển ý: Quê hương Đà Nẵng cũng có những người được nhân dân tưởng nhớ vì đóng góp của họ.',
    'GV: Đây là tên Nguyễn Văn Thoại, còn gọi là Thoại Ngọc Hầu. Theo tư liệu GDĐP, ông có đóng góp cho quê hương An Hải. Mời các em đọc hai tên và trả lời: đây là một người hay hai người? Nếu có ảnh tư liệu Chặng 1 được liên kết, mở ảnh ấy để quan sát; không sử dụng sơ đồ chữ như ảnh lịch sử.',
    'GV: Em hoàn thành câu “Em biết ơn… vì…”. Mời 2–3 em trả lời. Hỏi thêm: khi đến di tích, em nên làm gì? Chốt ý và quay về hoạt động Tiếng Việt theo SGK.'
  ];
  const assessed = assessment.strong+assessment.met+assessment.support;
  const classCount = Number(classSize);
  const assessmentValid = Number.isInteger(classCount) && classCount>0 && assessed===classCount;
  const exportAssessment = () => {
    const report = [`Bài: ${record.lesson}`,`Lớp ${record.grade} · ${record.subject}`,`Số học sinh được đánh giá: ${classCount}`,`Đạt tốt: ${assessment.strong}`,`Đạt: ${assessment.met}`,`Cần hỗ trợ: ${assessment.support}`,`Tỉ lệ đạt trở lên: ${Math.round(100*(assessment.strong+assessment.met)/classCount)}%`,`Nhận xét: ${assessmentNote}`].join('\\n');
    const blob = new Blob([report],{type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');a.href=url;a.download='danh-gia-gddp-lop-2.txt';a.click();URL.revokeObjectURL(url);
  };
  const stageLabel = index===0?'Khởi động / kết nối':index===visibleSlides.length-1?'Vận dụng / củng cố':'Khám phá / liên hệ GDĐP';
  const lessonGuide = [
    'Dạy nội dung chính theo SGK; chỉ mở học liệu GDĐP tại vị trí tích hợp phù hợp.',
    'Đặt câu hỏi trên slide, cho học sinh suy nghĩ và chia sẻ trước khi hiện gợi ý trả lời.',
    'Dùng nút Tiếp / Trước để chuyển trang; không bắt buộc trình chiếu toàn bộ nếu không đủ thời gian.',
    'Kiểm tra Ghi chú giáo viên và Nguồn & rà soát trước giờ dạy; không xem gợi ý là đáp án SGK.'
  ];
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
      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">CHẠM ĐÀ NẴNG · {deck.presentationKind==='topic'?'HỌC LIỆU CHỦ ĐỀ':'TÍCH HỢP GDĐP'} · KHỐI {record.grade}</p><h2 className="text-sm font-black sm:text-base">{record.lesson}</h2><p className="text-xs text-slate-500">{record.subject} · {deck.presentationKind==='topic'?record.week:'Tuần '+record.week} · {record.integrationType}</p></div>
      <div className="flex flex-wrap gap-2">{isPilot&&<button type="button" onClick={()=>{setQuickMode(v=>!v);setIndex(0);setAnswerVisible(false);setAssessmentOpen(false);}} className="rounded-xl bg-orange-100 px-3 py-2 text-xs font-black text-orange-900">{quickMode?'⚡ Tích hợp nhanh · 8 phút':'Bật tích hợp nhanh · 8 phút'}</button>}<button type="button" onClick={()=>setGuideVisible(value=>!value)} aria-pressed={guideVisible} className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900">{guideVisible?'Ẩn hướng dẫn':'Hướng dẫn sử dụng'}</button><button type="button" onClick={()=>setTeacherMode(value=>!value)} aria-pressed={teacherMode} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">{teacherMode?'Chế độ học sinh':'Chế độ giáo viên'}</button><button type="button" onClick={()=>setNotesVisible(value=>!value)} aria-pressed={notesVisible} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><FileText className="mr-1 inline h-4 w-4" />{notesVisible?'Ẩn ghi chú':'Ghi chú giáo viên'}</button><button type="button" onClick={()=>setSourcesVisible(value=>!value)} aria-pressed={sourcesVisible} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"><BookOpen className="mr-1 inline h-4 w-4" />Nguồn & rà soát</button><button type="button" onClick={onExit} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"><X className="mr-1 inline h-4 w-4" />Đóng</button></div>
    </header>
    {deck.mappingReview&&!deck.mappingReview.currentYearConfirmed&&<p role="status" className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">{deck.presentationKind==='topic'?deck.mappingReview.note:<>Bản tham khảo từ bảng {deck.mappingReview.sourceYear} · Chưa xác nhận địa chỉ tích hợp năm học hiện hành.</>}</p>}
    <div ref={body} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
      {quickMode&&isPilot&&<div className="mx-auto mb-4 max-w-6xl rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900"><strong>⚡ Bài mẫu tích hợp nhanh · 8 phút</strong> · {stageLabel} · {minutes} phút. Phần Tiếng Việt chính vẫn dạy theo SGK. Đây là kịch bản tham khảo, giáo viên cần kiểm chứng nguồn và địa chỉ tích hợp hiện hành.</div>}
      {guideVisible&&!teacherMode&&<aside className="mx-auto mb-5 max-w-6xl rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black text-emerald-900">Hướng dẫn sử dụng trong tiết dạy</h3><span className="rounded-full bg-white px-3 py-1 font-semibold text-emerald-800">Trang {index+1}: {stageLabel}</span></div>
        <p className="mt-2"><strong>Vị trí tích hợp theo dữ liệu bài:</strong> {record.activity || 'Giáo viên lựa chọn phù hợp với tiến trình SGK'}</p>
        <p className="mt-1"><strong>Hình thức:</strong> {record.integrationType}. <strong>Lưu ý:</strong> Bộ {visibleSlides.length} trang là học liệu hỗ trợ, không phải toàn bộ tiết dạy và không có thời lượng cố định được phê duyệt.</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">{lessonGuide.map(t=><li key={t}>{t}</li>)}</ol>
        <p className="mt-2 font-semibold text-emerald-900">Gợi ý tổ chức trang này: {slide.teacherNotes}</p>
        {quickMode&&isPilot&&<p className="mt-2 rounded-xl bg-white p-3 font-medium"><strong>Lời dẫn thực hành ({minutes} phút):</strong> {pilotScripts[index]}</p>}
        <button type="button" onClick={()=>{setGuideVisible(false);setTeacherMode(true);}} className="mt-3 rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white">Đã hiểu · Bắt đầu trình chiếu</button>
      </aside>}
      {sourcesVisible && !teacherMode && <aside className="mx-auto mb-5 max-w-6xl space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <h3 className="font-black">Nguồn và phạm vi sử dụng</h3><p>Bản biên soạn đối chiếu nguồn; chưa phải xác nhận phê duyệt của tổ chuyên môn. Không thay thế nội dung bài học chính trong sách.</p>
        <ul className="list-disc space-y-1 pl-5">{deck.sources.map(source=><li key={source} className="break-words [overflow-wrap:anywhere]">{source}</li>)}</ul>
        {deck.reviewNotes.map(note=><p key={note} className="font-semibold text-amber-900">Cần duyệt: {note}</p>)}
        <p>Ảnh thật có chú thích, tác giả và giấy phép riêng. Sơ đồ học tập không phải ảnh tư liệu hoặc bản đồ địa lí. Không dùng giọng đọc tự động theo thiết bị.</p>
      </aside>}
      <article className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-600 px-5 py-5 text-white sm:px-8"><p className="mb-2 text-xs font-semibold text-emerald-100">{deck.title} · {index+1}/{visibleSlides.length}</p><h3 aria-live="polite" className="text-2xl font-black leading-tight sm:text-4xl">{slide.title}</h3></div>
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">{(deck.sourceRecord.grade>=3&&deck.sourceRecord.grade<=5)?'Hình ảnh và sơ đồ học tập':'Sơ đồ minh hoạ học tập'}</p>{slide.images&&slide.images.length>0&&<div className={`grid gap-3 ${slide.images.length>1?'sm:grid-cols-3':''}`}>{slide.images.map(img=><figure key={img.src} className="min-w-0 overflow-hidden rounded-xl border border-emerald-100 bg-white p-2"><img src={img.src} alt={img.alt} className="max-h-56 w-full object-contain"/><figcaption className="mt-1 text-[10px] leading-relaxed text-slate-500"><LearningMediaCredit src={img.src} credit={img.caption}/></figcaption></figure>)}</div>}{slide.visual.map((item,i)=><div key={item} className="flex items-center gap-3 rounded-2xl border border-white bg-white p-4 shadow-sm"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-700">{i+1}</span><span className="text-lg font-bold sm:text-xl">{item}</span></div>)}</div>
          <div className="space-y-5"><ul className="space-y-4">{slide.points.map(point=><li key={point} className="flex gap-3 text-lg leading-relaxed sm:text-2xl"><Check className="mt-1 h-5 w-5 shrink-0 text-emerald-600" /><span>{point}</span></li>)}</ul><section className="rounded-2xl border border-orange-100 bg-orange-50 p-5"><p className="mb-2 text-xs font-black uppercase text-orange-700">Cùng trao đổi</p><p className="text-lg font-bold sm:text-xl">{slide.question}</p><button type="button" onClick={()=>setAnswerVisible(value=>!value)} aria-expanded={answerVisible} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-orange-800 shadow-sm"><Eye className="h-4 w-4" />{answerVisible?'Ẩn gợi ý trả lời':'Hiện gợi ý trả lời'}</button>{answerVisible&&<p className="mt-4 rounded-xl bg-white p-4 text-base leading-relaxed text-emerald-900">{slide.answer}</p>}</section></div>
        </div>
        {quickMode&&isPilot&&!teacherMode&&<aside className="border-t border-orange-100 bg-orange-50 p-4 text-sm"><strong>Hướng dẫn dạy ngay · {minutes} phút:</strong> {pilotScripts[index]}<p className="mt-2 text-xs text-amber-900">Học liệu Chặng 1: mở từ mục “Học liệu bổ sung từ các trạm” của bài nếu có liên kết được xác nhận; không mặc định có ảnh/âm thanh ở bộ slide này.</p></aside>}
        {notesVisible&&!teacherMode&&<aside className="border-t border-slate-100 bg-slate-50 p-5 text-sm leading-relaxed"><p className="mb-2 font-black">Ghi chú giáo viên · {record.activity.replace(/\n/g,' · ')}</p><p>{slide.teacherNotes}</p>{index===0&&<ul className="mt-3 list-disc pl-5">{deck.outcomes.map(goal=><li key={goal}>{goal}</li>)}</ul>}</aside>}
      </article>
    </div>
    {assessmentOpen&&quickMode&&isPilot&&<section className="max-h-[48vh] shrink-0 overflow-y-auto border-t border-emerald-200 bg-emerald-50 px-4 py-3 text-sm sm:px-7">
      <div className="mx-auto max-w-4xl space-y-3"><h3 className="font-black">Đánh giá nhanh tại lớp · bản mẫu</h3><p>Tiêu chí: học sinh nêu được một người có công với địa phương và một cách thể hiện lòng biết ơn. Giáo viên quan sát, ghi số lượng; không tự động coi đây là bằng chứng tác động dài hạn.</p>
      <label className="block">Số học sinh được đánh giá <input type="number" min="1" value={classSize} onChange={e=>setClassSize(e.target.value)} className="ml-2 w-24 rounded-lg border p-2" /></label>
      <div className="flex flex-wrap gap-3">{([['strong','Đạt tốt'],['met','Đạt'],['support','Cần hỗ trợ']] as const).map(([key,label])=><label key={key} className="flex items-center gap-2">{label}<input aria-label={label} type="number" min="0" value={assessment[key]} onChange={e=>setAssessment(v=>({...v,[key]:Math.max(0,Number(e.target.value)||0)}))} className="w-20 rounded-lg border p-2"/></label>)}</div>
      <p className={assessmentValid?'font-bold text-emerald-800':'font-bold text-amber-800'}>Đã ghi {assessed}/{classSize||'—'} học sinh{assessmentValid?` · Đạt trở lên: ${Math.round(100*(assessment.strong+assessment.met)/classCount)}%`:' · Vui lòng nhập đủ số lượng để xuất kết quả.'}</p>
      <label className="block">Nhận xét (không bắt buộc)<textarea value={assessmentNote} onChange={e=>setAssessmentNote(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border p-2" placeholder="Điều học sinh đã hiểu; nội dung cần điều chỉnh..."/></label>
      <button type="button" disabled={!assessmentValid} onClick={exportAssessment} className="rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white disabled:opacity-40">Tải phiếu đánh giá TXT</button><p className="text-xs text-slate-600">Chỉ tải về thiết bị của giáo viên; không tự lưu lên máy chủ hoặc gửi dữ liệu học sinh.</p></div>
    </section>}
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-7"><button type="button" onClick={()=>move(-1)} disabled={index===0} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-30"><ArrowLeft className="mr-1 inline h-4 w-4" />Trước</button><span className="text-xs font-semibold text-slate-500">Trang {index+1} / {visibleSlides.length}</span>{index===deck.slides.length-1?<button type="button" onClick={onExit} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Về bài dạy</button>:<button type="button" onClick={()=>move(1)} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Tiếp<ArrowRight className="ml-1 inline h-4 w-4" /></button>}</footer>
  </div>;
};
