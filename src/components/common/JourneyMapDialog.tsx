import {LessonOverlay} from './LessonOverlay';
import React, {useEffect, useRef, useState} from 'react';
import {Minus, Plus, RotateCcw, X} from 'lucide-react';

/** One accessible viewer shared by Stage 4 and the student's map collection. */
export function JourneyMapDialog({image, title, onClose}: {image: string; title: string; onClose: () => void}) {
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {document.body.style.overflow = previousOverflow; previousFocus?.focus();};
  }, []);
  return <LessonOverlay><div ref={dialog} role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[200] flex flex-col bg-slate-950/95 p-3 sm:p-5" onKeyDown={event => {
    if (event.key === 'Escape') onClose();
    if (event.key === 'Tab') {
      const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!buttons?.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
    }
  }}>
    <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-300/40 bg-sky-950 p-2 text-white shadow-lg">
      <h2 className="min-w-0 flex-1 text-sm font-bold">{title}</h2>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .5))} aria-label="Thu nhỏ bản đồ" className="h-11 w-11 rounded-xl bg-sky-700 text-white disabled:opacity-40"><Minus className="mx-auto h-5 w-5" /></button>
        <output className="min-w-10 text-center text-xs" aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button type="button" disabled={zoom >= 4} onClick={() => setZoom(value => Math.min(4, value + .5))} aria-label="Phóng to bản đồ" className="h-11 w-11 rounded-xl bg-sky-700 text-white disabled:opacity-40"><Plus className="mx-auto h-5 w-5" /></button>
        <button type="button" onClick={() => setZoom(1)} aria-label="Vừa màn hình" className="h-11 w-11 rounded-xl bg-sky-700 text-white"><RotateCcw className="mx-auto h-5 w-5" /></button>
        <button autoFocus type="button" onClick={onClose} aria-label="Đóng bản đồ" className="flex h-11 items-center gap-1 rounded-xl bg-white px-3 font-bold text-slate-900"><X className="h-5 w-5" /><span>Đóng</span></button>
      </div>
    </div>
    <p className="mb-2 text-xs text-slate-200">Dùng nút + để đọc rõ chữ, vuốt để xem các vùng trên bản đồ.</p>
    <div className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-xl" onClick={event => {if (event.target === event.currentTarget) onClose();}}>
      {failed ? <p role="alert" className="p-5 text-center text-white">Chưa tải được bản đồ. Em hãy đóng và mở lại.</p> : <img src={image} alt={title} onError={() => setFailed(true)} className="mx-auto block object-contain" style={{width: `${zoom * 100}%`, maxWidth: 'none', maxHeight: zoom === 1 ? '100%' : 'none'}} />}
    </div>
  </div></LessonOverlay>;
}
