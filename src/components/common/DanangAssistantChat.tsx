import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Compass, MapPin, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { ALL_25_STATIONS } from '../../data/allStations';
import { ExplorationHotspot, Station } from '../../types';
import {
  getDanangAssistantQuickPrompts,
  retrieveDanangAssistantAnswer,
} from '../../services/DanangAssistantRetrievalService';

interface Props {
  station?: Station | null;
  hotspot?: ExplorationHotspot | null;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'student';
  text: string;
  relatedStationTitle?: string;
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

export const DanangAssistantChat: React.FC<Props> = ({ station = null, hotspot = null }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: WELCOME },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([{ id: 'welcome', role: 'assistant', text: WELCOME }]);
    setInput('');
  }, [station?.id]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, open]);

  const context = useMemo(() => ({ station, hotspot, stations: ALL_25_STATIONS }), [station, hotspot]);
  const quickPrompts = useMemo(() => getDanangAssistantQuickPrompts(context), [station?.id, hotspot?.id]);

  const append = (message: ChatMessage) => {
    setMessages(current => [...current, message].slice(-MAX_VISIBLE_MESSAGES));
  };

  const ask = (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question) return;

    append({ id: `q-${Date.now()}`, role: 'student', text: question });
    try {
      const result = retrieveDanangAssistantAnswer(question, context);
      append({
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: result.answer,
        relatedStationTitle: result.relatedStationTitle,
      });
    } catch {
      append({ id: `error-${Date.now()}`, role: 'assistant', text: 'Mình chưa đọc được nội dung này. Bạn thử hỏi lại hoặc chọn một câu hỏi gợi ý nhé!' });
    }
    setInput('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="group fixed bottom-14 left-4 z-[58] inline-flex h-12 items-center gap-2.5 rounded-full border border-sky-200 bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-500 px-4 pr-5 text-white shadow-[0_12px_28px_rgba(3,105,161,0.28)] ring-2 ring-white/70 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(3,105,161,0.34)] active:translate-y-0"
        aria-label="Mở Trợ lý khám phá Đà Nẵng"
        title="Trợ lý khám phá Đà Nẵng"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
          <Compass className="h-5 w-5 animate-spin-slow drop-shadow-sm" />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[12px] font-black sm:text-[13px]">Trợ lý khám phá</span>
          <span className="mt-0.5 text-[9px] font-semibold text-sky-100 sm:text-[10px]">Hỏi mình về điểm đến này</span>
        </span>
        <MessageCircle className="ml-1 h-4 w-4 text-white/90" />
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Trợ lý khám phá Đà Nẵng"
          className="fixed bottom-[8.5rem] left-3 z-[60] flex max-h-[72vh] w-[calc(100vw-1.5rem)] max-w-[390px] flex-col overflow-hidden rounded-[1.75rem] border border-sky-200 bg-white shadow-2xl sm:left-4"
        >
          <header className="relative overflow-hidden bg-gradient-to-r from-sky-800 via-sky-700 to-cyan-600 px-4 py-4 text-white">
            <div className="absolute -right-7 -top-8 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-black leading-tight">Trợ lý khám phá Đà Nẵng</h2>
                  <p className="mt-0.5 text-[11px] font-medium text-sky-100">
                    Kho tri thức đã kiểm duyệt • Không giới hạn lượt hỏi
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

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-sky-50/70 to-white px-3 py-4">
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
                    {message.role === 'assistant' && message.relatedStationTitle && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200">
                        <MapPin className="h-3 w-3" />
                        Liên quan: {message.relatedStationTitle}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
            className="border-t border-slate-100 bg-white p-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
              <textarea
                value={input}
                onChange={event => setInput(event.target.value.slice(0, 220))}
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
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm transition hover:bg-sky-800 disabled:bg-slate-200 disabled:text-slate-400"
                aria-label="Gửi câu hỏi"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[9px] text-slate-400">
              Trợ lý chỉ trả lời từ kho kiến thức đã kiểm duyệt và sẽ không tự đoán khi chưa có dữ liệu.
            </p>
          </form>
        </section>
      )}
    </>
  );
};

export default DanangAssistantChat;
