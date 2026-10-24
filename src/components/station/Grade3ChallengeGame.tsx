import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Station } from '../../types';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import { CheckCircle2, RotateCcw, Trophy, ChevronRight } from 'lucide-react';

interface Props { station: Station; studentId: string; isReadOnly: boolean; onCompleteStage: () => void }
const THEMES: Record<string, { name: string; emoji: string; bg: string; scene: string }> = {
  'g3-station-1': { name: 'Nhà thám hiểm biển xanh', emoji: '🌊', bg: 'from-sky-950 via-cyan-800 to-blue-500', scene: '🏖️ 🐚 🌴' },
  'g3-station-2': { name: 'Giải mã dấu ấn lịch sử', emoji: '📜', bg: 'from-amber-950 via-orange-800 to-amber-500', scene: '🏛️ 📜 🕯️' },
  'g3-station-3': { name: 'Sắc màu văn hóa', emoji: '🎨', bg: 'from-purple-950 via-fuchsia-800 to-pink-500', scene: '🥁 🎶 🌺' },
  'g3-station-4': { name: 'Nghệ nhân nhí Nam Ô', emoji: '🐟', bg: 'from-teal-950 via-emerald-800 to-cyan-600', scene: '🐟 🧂 🏺' },
  'g3-station-5': { name: 'Xưởng thuyền thúng tí hon', emoji: '🛶', bg: 'from-emerald-950 via-green-800 to-lime-600', scene: '🎋 🛶 🌊' },
};
const LEVELS = ['Mức 1 · Dễ', 'Mức 1 · Dễ', 'Mức 2 · Trung bình', 'Mức 2 · Trung bình', 'Mức 3 · Khó'];
export const Grade3ChallengeGame: React.FC<Props> = ({station, studentId, isReadOnly, onCompleteStage}) => {
  const theme = THEMES[station.id] || THEMES['g3-station-1'];
  const questions = useMemo(() => station.challenge.questions.slice(0, 5).map(q => ({...q, options: [...q.options].sort(() => Math.random() - 0.5)})), [station.challenge]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [mistake, setMistake] = useState(false);
  const [complete, setComplete] = useState(false);
  const [locked, setLocked] = useState(false);
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = questions[index];
  const reward = station.rewards.find(r => r.stage === 2) || station.rewards[1];
  useEffect(() => () => {if (delay.current) clearTimeout(delay.current);}, []);
  const choose = (id: string) => {
    if (!question || locked || complete) return;
    const option = question.options.find(o => o.id === id);
    if (!option) return;
    setChosen(id);
    if (!option.isCorrect) {
      audioService.playSfx('wrong');
      setMistake(true);
      setLocked(true);
      delay.current = setTimeout(() => {setLocked(false); setChosen(null); setMistake(false);}, 2000);
      return;
    }
    audioService.playSfx('correct');
    setLocked(true);
    delay.current = setTimeout(() => {
      if (index === questions.length - 1) {
        if (!isReadOnly) progressService.completeStage2(studentId, station.id, reward?.id);
        audioService.playSfx('reward');
        setComplete(true);
      } else setIndex(i => i + 1);
      setChosen(null);
      setLocked(false);
      setMistake(false);
    }, 900);
  };
  const restart = () => {
    if (delay.current) clearTimeout(delay.current);
    setIndex(0); setChosen(null); setMistake(false); setLocked(false); setComplete(false);
    audioService.playSfx('click');
  };
  return <section className={`relative mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-gradient-to-br ${theme.bg} p-4 sm:p-8 text-white shadow-2xl`}>
    <div className="pointer-events-none absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 10% 20%, white 0 2px, transparent 3px)', backgroundSize:'34px 34px'}} />
    <div className="relative z-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold tracking-widest text-white/80">CHẶNG 2 · CHINH PHỤC THỬ THÁCH</p><h2 className="mt-1 text-xl sm:text-3xl font-black">{theme.emoji} {theme.name}</h2></div>
        <button type="button" onClick={restart} className="rounded-xl border border-white/50 bg-white/15 px-4 py-2 text-sm font-bold"><RotateCcw className="mr-1 inline h-4 w-4"/> Chơi lại</button>
      </div>
      <div className="mb-4 flex gap-2" aria-label="Tiến độ năm câu">{questions.map((q,i) => <div key={q.id} className={`h-3 flex-1 rounded-full ${i < index || complete ? 'bg-lime-300' : i === index ? 'bg-white' : 'bg-white/25'}`} />)}</div>
      {complete ? <div className="rounded-3xl border-2 border-yellow-200 bg-white/95 p-8 text-center text-slate-900">
        <div className="text-6xl" aria-hidden="true">🎉🏆🎊</div><Trophy className="mx-auto mt-4 h-14 w-14 text-amber-500"/><h3 className="mt-3 text-2xl font-black">Xuất sắc! Hoàn thành 5 thử thách!</h3>
        <p className="mt-2 text-slate-600">Em đã chinh phục đủ 3 mức độ và nhận dấu hành trình.</p>
        <button type="button" onClick={onCompleteStage} className="mt-5 rounded-2xl bg-sky-700 px-8 py-4 font-black text-white">TIẾP TỤC HÀNH TRÌNH <ChevronRight className="inline h-5 w-5"/></button>
      </div> : question ? <>
        <div className="mb-4 flex items-center justify-between gap-2"><span className="rounded-full bg-white/20 px-4 py-2 text-sm font-black">{LEVELS[index]}</span><span className="font-black">Câu {index+1}/5</span></div>
        <div className="mb-4 rounded-3xl border border-white/35 bg-white/15 px-4 py-5 text-center shadow-lg backdrop-blur-sm">
          <div className="text-5xl sm:text-7xl" aria-hidden="true">{theme.scene}</div>
          <p className="mt-2 text-xs text-white/80">Khám phá · suy nghĩ · chọn đáp án</p>
        </div>
        <div className="rounded-3xl border border-white/60 bg-white/95 p-5 sm:p-8 text-slate-900 shadow-2xl">
          <h3 className="text-lg sm:text-2xl font-black leading-relaxed">{question.questionVi}</h3>
          <div className="mt-5 grid gap-3">{question.options.map((o,i) => {
            const picked = chosen === o.id; const correct = picked && o.isCorrect; const wrong = picked && !o.isCorrect;
            return <button type="button" key={o.id} disabled={locked} onClick={() => choose(o.id)} className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-sm sm:text-lg font-bold transition ${correct ? 'border-green-600 bg-green-100 text-green-900' : wrong ? 'border-red-600 bg-red-100 text-red-900' : 'border-slate-200 bg-slate-50 hover:border-sky-500 hover:bg-sky-50'}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow">{String.fromCharCode(65+i)}</span><span className="flex-1">{o.textVi}</span>{correct && <CheckCircle2 className="h-6 w-6 text-green-700"/>}{wrong && <span className="text-red-700">✕</span>}
            </button>;
          })}</div>
          <div className="mt-4 min-h-16" role="status" aria-live="polite">{mistake ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">Chưa đúng rồi! 💡 {question.hintVi || 'Hãy nhớ lại bài học nhé.'} Em có thể chọn lại sau 2 giây.</p> : locked && chosen ? <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-800">Chính xác! Tiếp tục khám phá nhé!</p> : <p className="text-sm text-slate-500">Hãy chọn một đáp án. Nếu chọn sai, em sẽ có gợi ý để thử lại.</p>}</div>
        </div>
      </> : <p className="rounded-2xl bg-white p-5 text-red-900">Chưa đủ câu hỏi cho trạm này. Hãy báo giáo viên.</p>}
    </div>
  </section>;
};
