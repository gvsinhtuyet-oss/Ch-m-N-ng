import {audioService} from '../../services/AudioService';
import {constrainAssistantPosition, type AssistantPosition} from '../../utils/assistantPosition';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, MapPin, MessageCircle, Send, Sparkles, X } from 'lucide-react';
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
  topic?: string;
}

const WELCOME =
  'Xin chào Nhà phiêu lưu! 👋 Mình là Trợ lý khám phá Đà Nẵng. Bạn muốn tìm hiểu điều gì hôm nay?';

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

export const DanangAssistantChat: React.FC<Props> = ({ station = null, hotspot = null, compactGame = false, docked = false, audience = 'student', stage }) => {
  const isTeacher = audience === 'teacher';
  const welcome = isTeacher ? 'Thầy cô muốn tìm hiểu kiến thức giáo dục địa phương nào? Tôi có thể tra cứu văn hóa, lịch sử, địa lý, làng nghề, trò chơi dân gian và học liệu có nguồn.' : WELCOME;
  const [open, setOpen] = useState(false);
  const [tapPulse, setTapPulse] = useState(0);
  useEffect(()=>{
    const openFromLesson=()=>setOpen(true);
    window.addEventListener('cham-open-assistant',openFromLesson);
    return()=>window.removeEventListener('cham-open-assistant',openFromLesson);
  },[]);
  const [input, setInput] = useState('');
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

  const panelHeight = Math.min(viewport.height * .72, viewport.height - 24);
  const panelWidth = Math.min(390, viewport.width - 24);
  const panelLeft = Math.max(12, Math.min(launcherPosition.x, viewport.width - panelWidth - 12));
  const panelTop = Math.max(12, Math.min(
    launcherPosition.y > viewport.height / 2 ? launcherPosition.y - panelHeight - 20 : launcherPosition.y + (compactGame ? 58 : 122),
    viewport.height - panelHeight - 12));


  useEffect(() => {
    activeAi.current?.abort();
    activeAi.current=null;
    aiLock.current=false;
    setAiBusy(false);
    setMessages([{ id: 'welcome', role: 'assistant', text: welcome }]);
    setInput('');
  }, [station?.id, welcome]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, open]);

  const context = useMemo(() => ({ station, hotspot, stations: ALL_25_STATIONS, audience, stage }), [station, hotspot, audience, stage]);
  const quickPrompts = useMemo(() => getDanangAssistantQuickPrompts(context), [context]);

  const append = (message: ChatMessage) => {
    setMessages(current => [...current, message].slice(-MAX_VISIBLE_MESSAGES));
  };

  const ask = (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || aiLock.current) return;

    append({ id: `q-${Date.now()}`, role: 'student', text: question });
    try {
      const result = retrieveDanangAssistantAnswer(question, { ...context, previousQuery: messages.filter(message => message.role === 'student').at(-1)?.text, previousTopic:messages.filter(message=>message.role==='assistant').at(-1)?.topic });
      // A local question never silently triggers a paid AI call.
      // Teacher AI expansion remains explicit via the separate button.
      append({
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: result.answer,
        relatedStationTitle: result.relatedStationTitle,
        topic:result.topic, sources: result.sources, teachingExample: result.teachingExample, followUp: result.followUp,
      });
    } catch {
      append({ id: `error-${Date.now()}`, role: 'assistant', text: 'Mình chưa đọc được nội dung này. Bạn thử hỏi lại hoặc chọn một câu hỏi gợi ý nhé!' });
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
      <div className={`discovery-assistant fixed z-[58] flex flex-col items-center select-none ${compactGame ? 'h-12 w-12' : 'h-[122px] w-[156px] gap-2'}`}
        style={{left: launcherPosition.x, top: launcherPosition.y}}>
        <span className={`${compactGame ? 'sr-only' : 'pointer-events-none whitespace-nowrap rounded-full border-2 border-amber-300 bg-white px-3 py-1.5 text-[13px] font-black leading-tight text-sky-950 shadow-lg'} `}>Trợ lý khám phá</span>
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
            setTapPulse(value => value + 1);
            setOpen(value => !value);
          }}
          style={{touchAction:'none', ...(compactGame ? {width:48,height:48} : {})}}
          className="discovery-assistant-button relative inline-flex h-[72px] w-[72px] shrink-0 cursor-grab items-center justify-center rounded-none border-0 bg-transparent text-white shadow-none ring-0 transition-shadow hover:shadow-[0_10px_30px_rgba(3,105,161,.6)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-900 active:cursor-grabbing"
          aria-label={open ? 'Đóng Trợ lý khám phá Đà Nẵng' : 'Mở Trợ lý khám phá Đà Nẵng'}
          aria-expanded={open}
          aria-controls="danang-assistant-panel"
          aria-describedby="assistant-drag-hint"
          title="Bấm để trò chuyện · Giữ và kéo để di chuyển">
          <svg key={tapPulse} aria-hidden="true" viewBox="0 0 100 100" className={`discovery-robot ${tapPulse ? 'is-tapped' : ''}`}>
            <defs><linearGradient id="discovery-shell" x2="0" y2="1"><stop stopColor="#f5ffff"/><stop offset="1" stopColor="#9be7ec"/></linearGradient><linearGradient id="discovery-face" x2="0" y2="1"><stop stopColor="#17466a"/><stop offset="1" stopColor="#082438"/></linearGradient></defs>
            <path d="M50 18V9" stroke="#fbd45c" strokeWidth="5"/><circle cx="50" cy="8" r="5" fill="#ffe387"/>
            <ellipse cx="50" cy="88" rx="30" ry="6" fill="#075985" opacity=".25"/>
            <rect x="24" y="65" width="52" height="25" rx="12" fill="url(#discovery-shell)" stroke="#fff" strokeWidth="2"/>
            <path d="M24 70L12 79M76 70L88 79" stroke="#b7f5f2" strokeWidth="9" strokeLinecap="round"/>
            <rect x="12" y="33" width="12" height="24" rx="6" fill="#ffd16a"/><rect x="76" y="33" width="12" height="24" rx="6" fill="#ffd16a"/>
            <rect x="19" y="19" width="62" height="49" rx="18" fill="url(#discovery-shell)" stroke="#fff" strokeWidth="3"/>
            <rect x="26" y="28" width="48" height="30" rx="12" fill="url(#discovery-face)"/>
            <g className="discovery-robot-eyes"><ellipse cx="39" cy="41" rx="5" ry="6" fill="#64f5f0"/><ellipse cx="61" cy="41" rx="5" ry="6" fill="#64f5f0"/></g>
            <path d="M44 51Q50 55 56 51" fill="none" stroke="#91ffff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="50" cy="77" r="5" fill="#ffcd57"/><path d="M47 77h6M50 74v6" stroke="#fff" strokeWidth="2"/>
          </svg>
          <span aria-hidden="true" className="absolute -right-6 top-1 rounded-2xl border-2 border-amber-300 bg-white px-2 py-1 text-sky-950 shadow-md"><MessageCircle className="h-5 w-5" /></span>
        </button>
        <span id="assistant-drag-hint" className="sr-only">Giữ và kéo biểu tượng để tránh che nội dung.</span>
      </div>

      {open && (
        <section
          id="danang-assistant-panel"
          role="dialog"
          aria-label="Trợ lý khám phá Đà Nẵng"
          style={{left:panelLeft, top:panelTop, width:panelWidth, height:panelHeight, maxHeight:panelHeight}}
          className="discovery-chat-bubble fixed z-[60] flex flex-col overflow-hidden rounded-[1.75rem] border-2 border-sky-200 bg-white shadow-2xl"
        >
          <header className="relative shrink-0 overflow-hidden bg-gradient-to-r from-sky-800 via-sky-700 to-cyan-600 px-4 py-4 text-white">
            <div className="absolute -right-7 -top-8 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-black leading-tight">{isTeacher ? 'Trợ lý giảng dạy Đà Nẵng' : 'Trợ lý khám phá Đà Nẵng'}</h2>
                  <p className="mt-0.5 text-[11px] font-medium text-sky-100">
                    {isTeacher ? 'Hỗ trợ giảng dạy • Kiến thức có nguồn' : 'Khám phá địa phương • Kiến thức có nguồn'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                aria-label="Đóng trợ lý"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {(station || hotspot) && (
              <div className="relative mt-3 rounded-xl bg-slate-950/15 px-3 py-2 text-[11px] leading-snug text-sky-50">
                {station && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Đang ưu tiên: <strong>{hotspot?.titleVi?.replace(/^\d+\.\s*/, '') || station.titleVi}</strong></span>
                  </div>
                )}
              </div>
            )}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-sky-50/70 to-white px-3 py-4">
            <div className="space-y-3">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${message.role === 'student'
                        ? 'rounded-br-md bg-sky-700 text-white'
                        : 'rounded-bl-md border border-sky-100 bg-white text-slate-700'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <span className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-cyan-700">
                        <Sparkles className="h-3 w-3" /> Trợ lý
                      </span>
                    )}
                    <p className="whitespace-pre-wrap"><SimpleBold text={message.text} /></p>
                    {message.ai && <p className="mt-2 text-[11px] text-amber-800">AI tham khảo — thầy cô cần đối chiếu trước khi sử dụng để giảng dạy.</p>}
                    {message.teachingExample && <p className="mt-2 border-t border-sky-100 pt-2"><strong>Gợi ý giảng dễ hiểu: </strong>{message.teachingExample}</p>}
                    {message.followUp && <p className="mt-2"><strong>Hỏi thêm học sinh: </strong>{message.followUp}</p>}
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
              <div role="status" aria-live="polite">{aiBusy && <p className="text-sm text-sky-800">Trợ lý đang tìm cách giải thích…</p>}</div>
              <div ref={endRef} />
            </div>

            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <MessageCircle className="h-3.5 w-3.5" /> Bạn có thể hỏi
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => ask(prompt)}
                    className="rounded-full border border-sky-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-sky-800 transition hover:bg-sky-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={event => {
              event.preventDefault();
              ask(input);
            }}
            className="shrink-0 border-t border-slate-100 bg-white p-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
              <textarea
                value={input}
                onChange={event => setInput(event.target.value.slice(0, isTeacher ? 600 : 220))}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    ask(input);
                  }
                }}
                rows={1}
                placeholder="Hỏi mình: “Sông Hoài ở mô?”..."
                className="max-h-24 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                aria-label="Nhập câu hỏi"
              />
              <button
                type="submit"
                disabled={!input.trim()||aiBusy}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm transition hover:bg-sky-800 disabled:bg-slate-200 disabled:text-slate-400"
                aria-label="Gửi câu hỏi"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {isTeacher&&aiAvailable&&<div className="mt-2"><button type="button" onClick={askAi} disabled={aiBusy||(!input.trim()&&!messages.some(m=>m.role==='student'))} className="rounded-xl bg-sky-800 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{aiBusy?'AI đang giải thích…':'Mở rộng bằng AI'}</button><p className="mt-1 text-[10px] text-slate-500">Gửi câu hỏi đến AI để giải thích hoặc gợi ý thêm. Không nhập dữ liệu cá nhân học sinh.</p></div>}
            <p className="mt-1.5 text-center text-[9px] text-slate-400">
              {aiAvailable ? 'Kho kiến thức có nguồn hoạt động miễn phí. Chỉ khi thầy cô bấm “Mở rộng bằng AI” mới gửi câu hỏi đến dịch vụ AI.' : 'Kho kiến thức có nguồn đang hoạt động. AI mở rộng chưa kết nối; có thể hỏi tiếp hoặc yêu cầu ví dụ.'}
            </p>
          </form>
        </section>
      )}
    </>
  );
};

export default DanangAssistantChat;
