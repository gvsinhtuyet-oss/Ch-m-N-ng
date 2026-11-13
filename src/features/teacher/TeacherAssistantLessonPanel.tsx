import React, {useEffect, useRef, useState} from 'react';
import type {GddpCatalog} from '../../services/GddpService';
import type {Station} from '../../types';
import {GddpTeacherLookup} from './GddpTeacherLookup';

interface Props {
  catalog:GddpCatalog; recordId:string; source:string; stations:Station[];
  onClose:()=>void; onOpenStation?:(station:Station)=>void;
}
export default function TeacherAssistantLessonPanel({catalog,recordId,source,stations,onClose,onOpenStation}:Props) {
  const record=catalog.records.find(row=>row.id===recordId);
  const [grade,setGrade]=useState(record?.grade || 2);
  const panel=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    panel.current?.focus();
    return()=>previous?.focus();
  },[]);
  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/60 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Bài học từ trợ lý" tabIndex={-1} ref={panel} onKeyDown={event=>{
    if(event.key==='Escape'){event.stopPropagation();onClose();}
    if(event.key==='Tab'){
      const controls=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]') || []).filter(element=>element.getClientRects().length);
      const first=controls[0],last=controls.slice(-1)[0];
      if(event.shiftKey && (document.activeElement===first || document.activeElement===panel.current)){event.preventDefault();last?.focus();}
      else if(!event.shiftKey && (document.activeElement===last || document.activeElement===panel.current)){event.preventDefault();first?.focus();}
    }
  }}>
    <div className="mx-auto max-w-5xl rounded-2xl bg-white p-3 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div><h2 className="font-black text-sky-950">Bài học và nội dung tích hợp</h2><p className="mt-1 text-xs text-slate-600">{source}</p></div>
        <button type="button" className="min-h-11 shrink-0 rounded-xl border px-3 py-2 text-sm font-bold text-sky-900" onClick={onClose}>Quay lại chatbox</button>
      </div>
      {record ? <GddpTeacherLookup stations={stations} currentGrade={grade} onGradeChange={setGrade} initialRecordId={grade===record.grade?recordId:undefined} catalogSnapshot={catalog} onOpenStudentStage1={onOpenStation} /> : <p role="status">Bài này không còn trong danh mục. Thầy cô quay lại để tìm bài khác.</p>}
    </div>
  </div>;
}
