import {audioService} from '../../services/AudioService';
import {constrainAssistantPosition, type AssistantPosition} from '../../utils/assistantPosition';
import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { MapPin, Send, MoreHorizontal, Plus, X } from 'lucide-react';
import {detectLearningTask,type PracticeQuestion,type LearningTask} from '../../services/AssistantLearningEngine';
import {AssistantPracticeCard} from './AssistantPracticeCard';
const EffectivenessPanel = lazy(() => import('./AssistantEffectivenessPanel'));
import { gddpService, type GddpCatalog } from '../../services/GddpService';
import { bundledGddpCatalog } from '../../services/GddpBundledCatalog';
import { searchTeacherLessons, type TeacherLessonHit } from '../../services/TeacherLessonSearch';
const TeacherLessonPanel = lazy(() => import('../../features/teacher/TeacherAssistantLessonPanel'));

import { ALL_25_STATIONS } from '../../data/allStations';
import { ExplorationHotspot, Station } from '../../types';
import {
  getDanangAssistantQuickPrompts,
  retrieveDanangAssistantAnswer,
} from '../../services/DanangAssistantRetrievalService';

// Keep this rule with its consumer: incremental sync can serve a legacy helper.
// Importing a newly added helper export would prevent this entire module loading.
const compactPosition = (width:number,height:number,stage?:number):AssistantPosition =>
  width < 1024
    ? stage===2 ? {x:8,y:Math.max(8,height-144)} : {x:64,y:10}
    : {x:Math.max(4,(width-48)/2),y:Math.max(4,height-56)};

interface Props {
  station?: Station | null;
  hotspot?: ExplorationHotspot | null;
  compactGame?: boolean;
  docked?: boolean;
  audience?: 'student' | 'teacher';
  stage?: number;
  storageScope?: string;
  currentGrade?: number;
  onOpenTeacherStation?: (station: Station) => void;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'student';
  text: string;
  relatedStationTitle?: string;
  sources?: {label:string;url?:string}[];
  teachingExample?: string;
  followUp?: string;
  ai?: boolean;
  task?: LearningTask;
  practice?: PracticeQuestion;
  pendingTask?: LearningTask;
  topic?: string;
  lessons?: TeacherLessonHit[];
  lessonCatalog?: GddpCatalog;
  catalogSource?: string;
}

const WELCOME =
  'Chào em! Em muốn khám phá điều gì hôm nay?';

const MAX_VISIBLE_MESSAGES = 10;

const SimpleBold: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={index}>{part.slice(2, -2)}</strong>
          : <React.Fragment key={index}>{part}</React.Fragment>
      )}
    </>
  );
};

const AssistantEmblem=({className}:{className?:string})=>(
  <svg aria-hidden="true" viewBox="0 0 64 64" className={className} fill="none">
    <path d="M48 32a18 18 0 0 1-18 18h-6l-12 6 3-13a18 18 0 1 1 33-11Z" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="23" cy="32" r="2" fill="currentColor"/><circle cx="30" cy="32" r="2" fill="currentColor"/><circle cx="37" cy="32" r="2" fill="currentColor"/>
    <path d="m47 7 2.8 8.2L58 18l-8.2 2.8L47 29l-2.8-8.2L36 18l8.2-2.8Z" fill="#ffe093" stroke="#0891b2" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export const DanangAssistantChat: React.FC<Props> = ({ station = null, hotspot = null, compactGame = false, docked = false, audience = 'student', stage, currentGrade, onOpenTeacherStation, storageScope = '' }) => {
  const isTeacher = audience === 'teacher';
  const welcome = isTeacher ? 'Thầy cô cần tìm bài học hay chuẩn bị nội dung nào?' : WELCOME;
  const [open, setOpen] = useState(false);
  const [showSuggestions,setShowSuggestions]=useState(true);
  const panelRef=useRef<HTMLElement|null>(null);
  const launcherRef=useRef<HTMLDivElement|null>(null);
  const inputRef=useRef<HTMLTextAreaElement|null>(null);
  const menuRef=useRef<HTMLDetailsElement|null>(null);
  useEffect(()=>{
    const openFromLesson=()=>setOpen(true);
    window.addEventListener('cham-open-assistant',openFromLesson);
    return()=>window.removeEventListener('cham-open-assistant',openFromLesson);
  },[]);
  const [input, setInput] = useState('');
  const [copiedMessage,setCopiedMessage]=useState('');
  const [copyError,setCopyError]=useState('');
  const practiceCounts=useRef<Record<string,number>>({});
  const [measurementOpen,setMeasurementOpen]=useState(false);
  const [measurementMounted,setMeasurementMounted]=useState(false);
  const [lessonPanel, setLessonPanel] = useState<{recordId: string; catalog: GddpCatalog; source: string} | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const lookupLock = useRef(false);
  const chatEpoch = useRef(0);
  const catalogRequest = useRef<Promise<{catalog:GddpCatalog;source:string}> | null>(null);
  const loadLessonCatalog = () => {
    if (!catalogRequest.current) catalogRequest.current = gddpService.publicCatalog().then(data => {
      const fallback = !data.records?.length && !data.published;
      return {catalog: fallback ? bundledGddpCatalog : data, source: fallback ? 'Danh mục cài sẵn — cần đối chiếu với kế hoạch đang dùng.' : data.published ? 'Danh mục do Admin xuất bản.' : 'Danh mục nguồn — cần đối chiếu với kế hoạch đang dùng.'};
    }).catch(() => ({catalog:bundledGddpCatalog, source:'Danh mục cài sẵn — chưa tải được bản mới từ máy chủ.'}));
    return catalogRequest.current;
  };
  useEffect(() => { if (isTeacher && open) void loadLessonCatalog(); }, [isTeacher, open]);
  useEffect(() => { if (!isTeacher) {setLessonPanel(null);catalogRequest.current=null;} }, [isTeacher]);
  const [aiAvailable,setAiAvailable]=useState(false);
  const [aiBusy,setAiBusy]=useState(false);
  const activeAi=useRef<AbortController|null>(null);
  const aiLock=useRef(false);
  useEffect(()=>()=>activeAi.current?.abort(),[]);
  useEffect(()=>{
    if(!isTeacher||!open){if(!isTeacher)setAiAvailable(false);return;}
    const controller=new AbortController();
    fetch('/api/education-assistant',{credentials:'same-origin',signal:controller.signal})
      .then(r=>r.ok?r.json():null).then(data=>{if(!controller.signal.aborted)setAiAvailable(data?.available===true);})
      .catch(()=>{});
    return()=>controller.abort();
  },[isTeacher,open]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: welcome },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState(() => ({width: window.innerWidth, height: window.innerHeight}));
  const [launcherPosition, setLauncherPosition] = useState<AssistantPosition>(() =>
    constrainAssistantPosition({x: window.innerWidth - 172, y: window.innerHeight - 140}, window.innerWidth, window.innerHeight));
  const drag = useRef<{pointerId:number;startX:number;startY:number;origin:AssistantPosition} | null>(null);
  const suppressClick = useRef(false);
  const previousPosition = useRef<AssistantPosition|null>(null);
  useEffect(() => {
    if (docked) setLauncherPosition(constrainAssistantPosition(
      {x:viewport.width - 172, y:viewport.height - 130}, viewport.width, viewport.height));
  }, [docked, viewport.width, viewport.height]);
  useEffect(() => {
    if (compactGame) {
      setLauncherPosition(position => {
        previousPosition.current ||= position;
        return compactPosition(window.innerWidth,window.innerHeight,stage);
      });
    } else if (previousPosition.current) {
      setLauncherPosition(previousPosition.current);
      previousPosition.current = null;
    }
  }, [compactGame, stage]);

  useEffect(() => {
    const resize = () => {
      const width = window.innerWidth;
      const height = window.visualViewport?.height || window.innerHeight;
      setViewport({width, height});
      setLauncherPosition(position => constrainAssistantPosition(position, width, height));
    };
    resize();
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);

  useEffect(()=>{
    if(!open)return;
    const dismiss=(event:PointerEvent)=>{
      if(event.button!==0)return;
      if(panelRef.current?.contains(event.target as Node)){
        if(menuRef.current&&!menuRef.current.contains(event.target as Node))menuRef.current.open=false;
        return;
      }
      if(launcherRef.current?.contains(event.target as Node))return;
      setOpen(false);
    };
    document.addEventListener('pointerdown',dismiss,true);
    panelRef.current?.focus({preventScroll:true});
    return()=>document.removeEventListener('pointerdown',dismiss,true);
  },[open]);

  const mobile=viewport.width<640;
  const panelHeight=Math.min(mobile?viewport.height*.82:viewport.height*.78,mobile?680:620,viewport.height-24);
  const panelWidth=Math.min(400,viewport.width-24);
  const panelLeft=mobile?12:Math.max(12,Math.min(launcherPosition.x,viewport.width-panelWidth-12));
  const panelTop=mobile?Math.max(12,viewport.height-panelHeight-12):Math.max(12,Math.min(
    launcherPosition.y>viewport.height/2?launcherPosition.y-panelHeight-16:launcherPosition.y+(compactGame?58:122),
    viewport.height-panelHeight-12));


  useEffect(() => {
    activeAi.current?.abort();
    activeAi.current=null;
    aiLock.current=false;
    setAiBusy(false);
    chatEpoch.current++;
    lookupLock.current=false;
    setLookupBusy(false);
    setLessonPanel(null);
    practiceCounts.current={};setShowSuggestions(true);
    setMessages([{ id: 'welcome', role: 'assistant', text: welcome }]);
    setInput('');
    return()=>{chatEpoch.current++;};
  }, [station?.id, welcome, storageScope, currentGrade]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, open, showSuggestions]);

  const context = useMemo(() => ({ station, hotspot, stations: ALL_25_STATIONS, audience, stage, grade:currentGrade || station?.grade }), [station, hotspot, audience, stage, currentGrade]);
  const quickPrompts = useMemo(() => {
    if(!isTeacher&&stage===2)return getDanangAssistantQuickPrompts(context);
    if(isTeacher)return station?['Tạo 3 câu hỏi kèm đáp án về bài đang học','Gợi ý hoạt động 5 phút về bài đang học',...getDanangAssistantQuickPrompts(context).slice(0,1)]:['Mở bài Em yêu quê hương lớp 2','Tìm bài tích hợp về Hội An','Tạo 3 câu hỏi về Hội An kèm đáp án','Gợi ý hoạt động 5 phút về bảo vệ san hô'];
    return ['Hỏi em một câu để kiểm tra','Nói dễ hiểu hơn',...getDanangAssistantQuickPrompts(context).slice(0,2)];
  },[context,isTeacher,station,stage]);

  const append = (message: ChatMessage) => {
    setMessages(current => [...current, message].slice(-MAX_VISIBLE_MESSAGES));
  };

  const copyAnswer=async(message:ChatMessage)=>{
    try {
      const sources=(message.sources||[]).map(source=>'Nguồn: '+source.label+(source.url?' — '+source.url:''));
      await navigator.clipboard.writeText([message.text,...sources].join('\n\n'));
      setCopiedMessage(message.id);setCopyError('');
    } catch {setCopyError('Chưa sao chép được. Thầy cô có thể chọn nội dung câu trả lời để sao chép.');}
  };
  const resetConversation=()=>{
    if(aiLock.current||lookupLock.current)return;
    practiceCounts.current={};setShowSuggestions(true);if(menuRef.current)menuRef.current.open=false;setCopiedMessage('');setCopyError('');setInput('');
    setMessages([{id:'welcome',role:'assistant',text:welcome}]);
  };

  const ask = async (rawQuestion: string, practiceTopic?: string) => {
    const question = rawQuestion.trim();
    if (!question || aiLock.current || lookupLock.current) return;

    const epoch=chatEpoch.current;
    setShowSuggestions(false);
    append({ id: `q-${Date.now()}`, role: 'student', text: question });
    try {
      const pending=messages.filter(message=>message.role==='assistant').at(-1)?.pendingTask;
      if (isTeacher && detectLearningTask(question)==='knowledge'&&(!pending||/^(?:mở|tìm|tra cứu|mo|tim)(?:\s|$)/i.test(question))) {
        lookupLock.current = true;
        setLookupBusy(true);
        const {catalog, source} = await loadLessonCatalog();
        if(epoch!==chatEpoch.current)return;
        const found = searchTeacherLessons(question, catalog.records || [], ALL_25_STATIONS, currentGrade);
        if (found) {
          append({id:`lessons-${Date.now()}`,role:'assistant',text:found.message,lessons:found.hits,lessonCatalog:catalog,catalogSource:source});
          setInput('');
          return;
        }
      }
      const result = retrieveDanangAssistantAnswer(question, { ...context, previousQuery: messages.filter(message => message.role === 'student').at(-1)?.text, previousTopic:messages.filter(message=>message.role==='assistant').at(-1)?.topic, previousAnswer:messages.filter(message=>message.role==='assistant'&&!message.ai).at(-1)?.text, pendingTask:messages.filter(message=>message.role==='assistant').at(-1)?.pendingTask, practiceIndex:practiceCounts.current[practiceTopic || messages.filter(message=>message.role==='assistant').at(-1)?.topic || ''] || 0 });
      if(result.practice)practiceCounts.current[result.topic || '']=(result.practice.sequence??0)+1;
      if(!result.found && aiAvailable && isTeacher){
        void requestAi(question,result.answer);
        setInput('');
        return;
      }
      append({
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: result.answer,
        relatedStationTitle: result.relatedStationTitle,
        task:result.task,practice:result.practice,pendingTask:result.pendingTask,topic:result.topic, sources: result.sources, teachingExample: result.teachingExample, followUp: result.followUp,
      });
    } catch {
      append({ id: `error-${Date.now()}`, role: 'assistant', text: 'Mình chưa đọc được nội dung này. Bạn thử hỏi lại hoặc chọn một câu hỏi gợi ý nhé!' });
    } finally {
      if(epoch===chatEpoch.current){lookupLock.current = false;setLookupBusy(false);}
    }
    setInput('');
  };
  const requestAi=async(question:string,fallback?:string)=>{
    if(aiLock.current||!aiAvailable||!isTeacher)return;
    aiLock.current=true;
    setAiBusy(true);
    const controller=new AbortController();
    activeAi.current=controller;
    const timeout=window.setTimeout(()=>controller.abort(),30000);
    const history=messages.filter(m=>m.id!=='welcome').slice(-6).map(m=>({role:m.role==='student'?'user':'assistant',text:m.text.slice(0,1200)}));
    try{
      const response=await fetch('/api/education-assistant',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,history}),signal:controller.signal});
      const result=await response.json();
      if(!response.ok||typeof result.answer!=='string')throw Error('AI unavailable');
      if(activeAi.current!==controller)return;
      append({id:`ai-a-${Date.now()}`,role:'assistant',text:result.answer,ai:true});
    }catch{
      if(activeAi.current===controller)append({id:`ai-e-${Date.now()}`,role:'assistant',text:fallback || 'AI mở rộng hiện chưa kết nối được. Thầy cô vẫn có thể tra cứu kho kiến thức có nguồn.'});
    }finally{
      window.clearTimeout(timeout);
      if(activeAi.current===controller){activeAi.current=null;aiLock.current=false;setAiBusy(false);}
    }
  };
  const askAi=()=>{
    const question=input.trim()||messages.filter(m=>m.role==='student').at(-1)?.text;
    if(!question||aiLock.current||!aiAvailable||!isTeacher)return;
    if(input.trim()){append({id:`ai-q-${Date.now()}`,role:'student',text:question});setInput('');}
    void requestAi(question);
  };

  return (
    <>
      <div ref={launcherRef} aria-hidden={open||measurementOpen||!!lessonPanel} className={`discovery-assistant fixed z-[58] pointer-events-none flex flex-col items-end justify-end select-none ${compactGame ? 'h-12 w-12' : 'h-[122px] w-[156px] gap-2'}`}
        style={{left: launcherPosition.x, top: launcherPosition.y,visibility:open||measurementOpen||lessonPanel?'hidden':'visible'}}>
        <span className="sr-only">Trợ lý Khám phá</span>
        <button
          type="button"
          onPointerDown={event => {
            if (!event.isPrimary || event.button !== 0) return;
            suppressClick.current = false;
            drag.current = {pointerId:event.pointerId, startX:event.clientX, startY:event.clientY, origin:launcherPosition};
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={event => {
            const current = drag.current;
            if (!current || current.pointerId !== event.pointerId) return;
            const dx = event.clientX-current.startX;
            const dy = event.clientY-current.startY;
            if (Math.hypot(dx,dy) > 6) suppressClick.current = true;
            if (suppressClick.current) setLauncherPosition(constrainAssistantPosition(
              {x:current.origin.x+dx, y:current.origin.y+dy}, viewport.width, viewport.height));
          }}
          onPointerUp={event => {
            if (drag.current?.pointerId !== event.pointerId) return;
            drag.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { drag.current = null; suppressClick.current = true; }}
          onLostPointerCapture={() => { drag.current = null; }}
          onClick={event => {
            if (event.detail !== 0 && suppressClick.current) { suppressClick.current = false; return; }
            audioService.playSfx('unlock');
            setOpen(value => !value);
          }}
          style={{touchAction:'none', ...(compactGame ? {width:48,height:48} : {})}}
          className="discovery-chat-launcher pointer-events-auto relative inline-flex h-16 w-16 shrink-0 cursor-grab items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-cyan-500 via-sky-600 to-sky-800 text-white shadow-[0_8px_24px_rgba(3,105,161,0.3)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(3,105,161,0.4)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-800 active:cursor-grabbing motion-reduce:transform-none"
          aria-label={open ? 'Đóng Trợ lý khám phá Đà Nẵng' : 'Mở Trợ lý khám phá Đà Nẵng'}
          aria-expanded={open}
          aria-controls="danang-assistant-panel"
          aria-describedby="assistant-drag-hint"
          title="Bấm để trò chuyện · Giữ và kéo để di chuyển">
          <AssistantEmblem className={compactGame?'h-9 w-9':'h-12 w-12'}/>
        </button>
        <span id="assistant-drag-hint" className="sr-only">Giữ và kéo biểu tượng để tránh che nội dung.</span>
      </div>

      {measurementMounted && <Suspense fallback={null}><EffectivenessPanel key={storageScope} open={measurementOpen} audience={audience} grade={currentGrade || station?.grade || 2} scope={storageScope} initialTopic={messages.filter(message=>message.role==='assistant').at(-1)?.topic} onClose={()=>{setMeasurementOpen(false);setOpen(true);}} /></Suspense>}
      {isTeacher && lessonPanel && <Suspense fallback={<div role="status" className="fixed inset-4 z-[70] rounded-2xl bg-white p-6 shadow-xl">Đang mở bài học…</div>}>
        <TeacherLessonPanel catalog={lessonPanel.catalog} recordId={lessonPanel.recordId} source={lessonPanel.source} stations={ALL_25_STATIONS} onClose={() => {setLessonPanel(null);setOpen(true);}} onOpenStation={station => {setLessonPanel(null);onOpenTeacherStation?.(station);}} />
      </Suspense>}
      {open && (
        <section
          ref={panelRef}
          tabIndex={-1}
          id="danang-assistant-panel"
          role="dialog"
          aria-label="Trợ lý khám phá Đà Nẵng"
          style={{left:panelLeft, top:panelTop, width:panelWidth, height:panelHeight, maxHeight:panelHeight}}
          className="discovery-chat-bubble fixed z-[60] flex flex-col overflow-hidden rounded-[24px] border border-sky-100 bg-[#fffefa] shadow-[0_18px_64px_-16px_rgba(15,70,95,0.28)] outline-none"
        >
          <header className="relative z-10 shrink-0 border-b border-white/10 bg-gradient-to-r from-sky-800 to-cyan-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10"><AssistantEmblem className="h-8 w-8"/></span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[15px] font-bold tracking-tight">Trợ lý Khám phá</h2>
                {(currentGrade||station?.grade)&&<p className="mt-0.5 truncate text-[11px] text-sky-100">Lớp {currentGrade||station?.grade}{station?' · '+(hotspot?.titleVi?.replace(/^\d+\.\s*/,'')||station.titleVi):''}</p>}
              </div>
              <details ref={menuRef} className="relative shrink-0">
                <summary aria-label="Tùy chọn trợ lý" title="Tùy chọn trợ lý" className="flex h-11 w-9 cursor-pointer list-none items-center justify-center rounded-full text-white/85 hover:bg-white/10 [&::-webkit-details-marker]:hidden"><MoreHorizontal className="h-5 w-5"/></summary>
                <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-sky-100 bg-white p-2 text-slate-700 shadow-xl">
                  <button type="button" disabled={aiBusy||lookupBusy} onClick={resetConversation} className="min-h-11 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-sky-50 disabled:opacity-40">Cuộc trò chuyện mới</button>
                  {(isTeacher||stage!==2)&&storageScope&&<button type="button" onClick={()=>{if(menuRef.current)menuRef.current.open=false;setMeasurementMounted(true);setMeasurementOpen(true);setOpen(false);}} className="min-h-11 w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-sky-50">{isTeacher?'Ghi nhận thời gian chuẩn bị':'Kiểm tra trước–sau'}</button>}
                  {isTeacher&&aiAvailable&&<button type="button" onClick={()=>{if(menuRef.current)menuRef.current.open=false;askAi();}} disabled={aiBusy||lookupBusy||(!input.trim()&&!messages.some(m=>m.role==='student'))} className="min-h-11 w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-sky-50 disabled:opacity-40">Mở rộng bằng AI</button>}

                </div>
              </details>
              <button type="button" onClick={()=>setOpen(false)} className="flex h-11 w-9 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/10" aria-label="Đóng trợ lý"><X className="h-5 w-5"/></button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#fffefa] px-4 py-4">
            <div className="space-y-3">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`min-w-0 break-words rounded-[20px] px-3.5 py-3 text-sm leading-relaxed ${message.role === 'student'
                        ? 'max-w-[88%] rounded-br-md bg-sky-700 text-white shadow-sm'
                        : message.id==='welcome'?'max-w-full px-0 py-1 text-slate-600':'max-w-[96%] rounded-bl-md border border-slate-100 bg-white text-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap"><SimpleBold text={message.text} /></p>
                    {message.lessons && message.lessons.length > 0 && <div className="mt-3 space-y-2">
                      {message.lessons.map(hit => hit.kind === 'integration' ? <article key={'integration:'+hit.record.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                        <p className="font-bold text-emerald-950">{hit.record.lesson}</p>
                        <p className="mt-1 text-xs">Lớp {hit.record.grade} · {hit.record.subject} · {hit.record.week ? (/tuần/i.test(hit.record.week) ? hit.record.week : `Tuần ${hit.record.week}`) : 'Chưa ghi tuần'}</p>
                        <p className="mt-1 text-xs"><strong>Tích hợp: </strong>{hit.record.content}</p>
                        {hit.record.activity && <p className="mt-1 text-xs"><strong>Hoạt động: </strong>{hit.record.activity}</p>}
                        <button type="button" className="mt-2 min-h-11 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white" aria-label={`Mở học liệu tích hợp: ${hit.record.lesson}`} onClick={() => {setOpen(false);setLessonPanel({recordId:hit.record.id,catalog:message.lessonCatalog!,source:message.catalogSource || ''});}}>Mở học liệu tích hợp</button>
                      </article> : <article key={'station:'+hit.station.id} className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                        <p className="font-bold text-sky-950">{hit.station.titleVi}</p>
                        <p className="mt-1 text-xs">Lớp {hit.station.grade} · Bài khám phá địa phương</p>
                        {onOpenTeacherStation && <button type="button" className="mt-2 min-h-11 rounded-lg bg-sky-700 px-3 py-2 text-xs font-bold text-white" aria-label={`Mở bài học: ${hit.station.titleVi}`} onClick={() => {setOpen(false);onOpenTeacherStation(hit.station);}}>Mở bài học</button>}
                      </article>)}
                      <details className="text-[11px] text-slate-500"><summary className="cursor-pointer py-1">Nguồn học liệu</summary><p>{message.catalogSource}</p></details>
                    </div>}
                    {message.practice && <AssistantPracticeCard practice={message.practice} onNext={()=>void ask(`Hỏi em câu tiếp theo về ${message.practice!.topic}`,message.practice!.topic)} />}

                    {isTeacher&&message.role==='assistant'&&message.id!=='welcome'&&!message.lessons&&<button type="button" aria-label="Sao chép kèm nguồn" onClick={()=>void copyAnswer(message)} className="mt-2 min-h-11 rounded-lg border border-sky-200 px-3 py-2 text-xs font-bold text-sky-800">{copiedMessage===message.id?'Đã sao chép':'Sao chép'}</button>}
                    {message.ai && <p className="mt-2 text-[11px] text-amber-800">AI tham khảo</p>}
                    {isTeacher&&(message.teachingExample||message.followUp)&&<details className="mt-2 border-t border-slate-100 pt-2 text-sm"><summary className="cursor-pointer py-1 text-xs font-semibold text-sky-800">Gợi ý dạy học</summary>{message.teachingExample&&<p className="mt-2">{message.teachingExample}</p>}{message.followUp&&<p className="mt-2">Hỏi thêm: {message.followUp}</p>}</details>}
                    {!isTeacher&&message.followUp && <p className="mt-2"><strong>{isTeacher?'Hỏi thêm học sinh: ':'Em thử nghĩ thêm: '}</strong>{message.followUp}</p>}
                    {message.sources?.map(source => <p key={source.label} className="mt-2 text-[11px] leading-4 text-sky-800">{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">Nguồn: {source.label}</a> : source.label}</p>)}
                    {message.role === 'assistant' && message.relatedStationTitle && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200">
                        <MapPin className="h-3 w-3" />
                        Liên quan: {message.relatedStationTitle}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div role="status" aria-live="polite">{copyError&&<p className="text-sm text-amber-800">{copyError}</p>}{(aiBusy || lookupBusy) && <p className="text-sm text-sky-800">Đang trả lời…</p>}</div>
            </div>

            {showSuggestions&&<div className="mt-4 flex flex-wrap gap-2" aria-label="Gợi ý nhanh">
              {(isTeacher?[
                {label:'Tìm bài học',query:'Mở bài ',draft:true},
                {label:'Soạn câu hỏi',query:station?'Tạo 3 câu hỏi kèm đáp án về bài đang học':'Tạo 3 câu hỏi kèm đáp án về ',draft:!station},
                {label:'Hoạt động 5 phút',query:station?'Gợi ý hoạt động 5 phút về bài đang học':'Gợi ý hoạt động 5 phút về ',draft:!station},
              ]:quickPrompts.slice(0,3).map(query=>({label:query,query,draft:false}))).map(item=><button key={item.label} type="button" disabled={aiBusy||lookupBusy} onClick={()=>{if(item.draft){setInput(item.query);inputRef.current?.focus();}else void ask(item.query);}} className="min-h-11 rounded-2xl border border-sky-100 bg-white px-3 py-2 text-xs font-semibold text-sky-800 transition hover:border-sky-200 hover:bg-sky-50 disabled:opacity-40">{item.label}</button>)}
            </div>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={event => {
              event.preventDefault();
              ask(input);
            }}
            className="shrink-0 border-t border-sky-50 bg-white/90 p-3 pb-[max(12px,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-end gap-1 rounded-[22px] border border-sky-100 bg-sky-50/40 p-1.5 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-50">
              <button type="button" aria-label="Hiện gợi ý nhanh" aria-expanded={showSuggestions} onClick={()=>setShowSuggestions(value=>!value)} className="flex h-11 w-9 shrink-0 items-center justify-center rounded-full text-sky-700 hover:bg-sky-100"><Plus className={`h-4 w-4 transition-transform ${showSuggestions?'rotate-45':''}`}/></button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={event => setInput(event.target.value.slice(0, isTeacher ? 600 : 220))}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    ask(input);
                  }
                }}
                rows={1}
                placeholder={isTeacher ? 'Tìm bài hoặc hỏi nội dung…' : 'Em muốn hỏi điều gì?'}
                className="max-h-24 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-1 py-2.5 text-base text-slate-800 outline-none placeholder:text-slate-400"
                aria-label="Nhập câu hỏi"
              />
              <button
                type="submit"
                disabled={!input.trim()||aiBusy||lookupBusy}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-700 text-white shadow-sm transition hover:bg-sky-800 disabled:bg-sky-100 disabled:text-sky-300 disabled:shadow-none"
                aria-label="Gửi câu hỏi"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default DanangAssistantChat;


