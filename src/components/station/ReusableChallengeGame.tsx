import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Station } from '../../types';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import { GameModeInteraction } from './GameModeInteraction';
import { MY_KHE_BAN_THAN_TASKS } from './grade3SeaTasks';

export const GAME_MODES = ['pick', 'flip', 'detective', 'classify', 'pair', 'unlock', 'journey', 'treasure'] as const;
export type GameMode = typeof GAME_MODES[number];
export interface GameTheme {
  title: string;
  intro?: string;
  /** Three responsive image paths: intro, playing, victory. Image-free CSS gradients are used until provided. */
  backgrounds?: { intro: string; playing: string; victory: string };
  modeOrder?: readonly GameMode[];
}
export const DEFAULT_GAME_THEMES: Record<string, GameTheme> = {
  'g3-station-1': { title: 'Nhà thám hiểm biển xanh', intro: 'Khám phá Mỹ Khê – Bàn Than và vui chơi an toàn nhé!', backgrounds: {intro:'/games/grade3-my-khe-ban-than/intro.svg',playing:'/games/grade3-my-khe-ban-than/playing.svg',victory:'/games/grade3-my-khe-ban-than/victory.svg'} },
  'g3-station-2': { title: 'Giải mã dấu ấn lịch sử' },
  'g3-station-3': { title: 'Sắc màu văn hóa' },
  'g3-station-4': { title: 'Nghệ nhân nhí Nam Ô' },
  'g3-station-5': { title: 'Xưởng thuyền thúng tí hon' },
};
const MODE_LABEL: Record<GameMode, string> = {
  pick: 'Chọn đáp án', flip: 'Lật thẻ bí mật', detective: 'Thám tử tìm dấu vết',
  classify: 'Phân loại thông minh', pair: 'Ghép ý đúng', unlock: 'Mở khóa bí mật',
  journey: 'Chọn đường khám phá', treasure: 'Kho báu kiến thức',
};
const MODE_EMOJI: Record<GameMode, string> = {
  pick: '🎯', flip: '🃏', detective: '🔍', classify: '🧺',
  pair: '🧩', unlock: '🔑', journey: '🧭', treasure: '🎁',
};
const level = (i: number) => i < 2 ? 'Mức 1 · Dễ' : i < 4 ? 'Mức 2 · Trung bình' : 'Mức 3 · Vận dụng';
const palettes = ['from-sky-900 via-cyan-800 to-blue-600', 'from-amber-950 via-orange-800 to-yellow-700', 'from-purple-950 via-fuchsia-800 to-pink-700', 'from-teal-950 via-emerald-800 to-teal-600', 'from-emerald-950 via-green-800 to-lime-700'];
const getMode = (theme: GameTheme, station: Station, i: number): GameMode => {
  const cycle = theme.modeOrder?.length ? theme.modeOrder : GAME_MODES;
  const stationOffset = (Number(station.id.match(/station-(\d+)/)?.[1] || '1') - 1) * 3 + (station.grade - 3) * 2;
  return cycle[(stationOffset + i) % cycle.length];
};
interface Props { station: Station; studentId: string; isReadOnly: boolean; onCompleteStage: () => void; theme?: GameTheme }
export const ReusableChallengeGame: React.FC<Props> = ({ station, studentId, isReadOnly, onCompleteStage, theme: supplied }) => {
  const theme = supplied || DEFAULT_GAME_THEMES[station.id] || { title: station.titleVi };
  const [screen, setScreen] = useState<'intro'|'playing'|'victory'>('intro');
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [incorrect, setIncorrect] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionSet = station.challenge.questions || [];
  const questions = useMemo(() => questionSet.map(q => ({
    ...q, options: [...q.options].sort((a,b) => a.id.localeCompare(b.id)),
  })), [questionSet]);
  const seaSample = station.id === 'g3-station-1';
  const sampleTask = seaSample ? MY_KHE_BAN_THAN_TASKS[index] : undefined;
  const question = questions[index];
  const reward = station.rewards.find(r => r.stage === 2) || station.rewards[1];
  const palette = palettes[Math.max(0, station.grade === 3 ? Number(station.id.match(/station-(\d+)/)?.[1] || '1')-1 : (station.grade-3)*2) % palettes.length];
  const mode = getMode(theme, station, index);
  const backdrop = screen === 'intro' ? theme.backgrounds?.intro : screen === 'playing' ? theme.backgrounds?.playing : theme.backgrounds?.victory;
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);
  const reset = () => { if(timeout.current) clearTimeout(timeout.current); setScreen('intro'); setIndex(0);setChoice(null);setRevealed([]);setLocked(false);setIncorrect(false);audioService.playSfx('click'); };
  const answer = (optionId: string) => {
    if(locked || !question || screen !== 'playing') return;
    const selected = question.options.find(o=>o.id===optionId);
    if(!selected) return;
    setChoice(optionId);
    if(!selected.isCorrect) {
      setIncorrect(true);setLocked(true);audioService.playSfx('wrong');
      timeout.current = setTimeout(()=>{setChoice(null);setIncorrect(false);setLocked(false);},2000);
      return;
    }
    setIncorrect(false);setLocked(true);audioService.playSfx('correct');
    timeout.current = setTimeout(()=>{
      if(index === questions.length-1) {
        if(!isReadOnly) progressService.completeStage2(studentId,station.id,reward?.id);
        audioService.playSfx('reward');setScreen('victory');
      } else setIndex(n=>n+1);
      setChoice(null);setRevealed([]);setLocked(false);
    },850);
  };
  // Every game works with tapping: no drag-only controls or small targets.
  const reveal = (id:string) => { if(!locked) {setRevealed(v=>v.includes(id)?v:[...v,id]);audioService.playSfx('click');} };
  const isRevealMode = mode==='flip'||mode==='treasure'||mode==='unlock';
  return <section className={`relative mx-auto min-h-[600px] w-full max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br ${palette} text-white shadow-xl`}
    style={backdrop ? {backgroundImage:`linear-gradient(180deg,rgba(7,21,43,.52),rgba(7,21,43,.72)),url("${backdrop}")`,backgroundSize:'cover',backgroundPosition:'center'} : undefined}>
    <div className="relative mx-auto flex min-h-[600px] max-w-3xl flex-col p-4 sm:p-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div><p className="text-xs font-black tracking-wide text-white/80">CHẶNG 2 · THỬ THÁCH KHÁM PHÁ</p><h2 className="mt-1 text-xl font-black sm:text-3xl">{theme.title}</h2></div>
        <button onClick={reset} type="button" className="min-h-11 shrink-0 rounded-xl border border-white/40 bg-black/30 px-3 text-sm font-bold">↻ Chơi lại</button>
      </header>
      {screen==='intro' && <div className="my-auto rounded-3xl border border-white/40 bg-slate-950/65 p-6 text-center shadow-xl backdrop-blur-sm sm:p-10">
        <div className="mb-3 text-6xl" aria-hidden="true">🗺️</div>
        <h3 className="text-2xl font-black sm:text-4xl">{theme.title}</h3>
        <p className="mt-3 text-base text-white/90">{theme.intro || 'Vượt qua 5 thử thách với 3 mức độ. Chọn đúng để khám phá tiếp nhé!'}</p>
        <button onClick={()=>{audioService.playSfx('click');setScreen('playing');}} className="mt-7 min-h-14 w-full rounded-2xl bg-yellow-400 px-6 text-lg font-black text-slate-950 shadow-lg sm:w-auto">BẮT ĐẦU KHÁM PHÁ →</button>
      </div>}
      {screen==='playing' && question && <>
        <div className="mb-4 flex gap-2" aria-label={`Đã đến câu ${index+1} trong ${questions.length} câu`}>{questions.map((q,i)=><span key={q.id} className={`h-2.5 flex-1 rounded-full ${i<index?'bg-emerald-300':i===index?'bg-yellow-300':'bg-white/30'}`}/>)}</div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-white/20 px-4 py-2 text-sm font-black">{level(index)}</span><span className="rounded-full bg-white/20 px-4 py-2 text-sm font-black">Câu {index+1}/{questions.length}</span></div>
        <div className="flex-1 rounded-3xl border border-white/50 bg-white/95 p-4 text-slate-900 shadow-2xl sm:p-7">
          {sampleTask ? <>
            <div className="mb-3 text-sm font-black text-sky-800">🎮 {sampleTask.type === 'detective' ? 'Thám tử tìm dấu vết' : sampleTask.type === 'classify' ? 'Phân loại thông minh' : sampleTask.type === 'journey' ? 'Chọn đường khám phá' : sampleTask.type === 'flip' ? 'Lật thẻ bí mật' : 'Chọn đáp án'}</div>
            <h3 className="mb-5 text-lg font-black leading-relaxed sm:text-2xl">{sampleTask.prompt}</h3>
            <GameModeInteraction key={index} task={sampleTask} locked={locked} incorrect={incorrect}
              onWrong={(hint) => {setIncorrect(true);setLocked(true);audioService.playSfx('wrong');timeout.current=setTimeout(()=>{setIncorrect(false);setLocked(false);},2000);}}
              onCorrect={() => {setChoice('correct');setIncorrect(false);setLocked(true);audioService.playSfx('correct');timeout.current=setTimeout(()=>{if(index === 4){if(!isReadOnly) progressService.completeStage2(studentId,station.id,reward?.id);audioService.playSfx('reward');setScreen('victory');}else setIndex(n=>n+1);setChoice(null);setLocked(false);},850);}} />
          </> : <>
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-sky-800"><span className="text-2xl">{MODE_EMOJI[mode]}</span>{MODE_LABEL[mode]}</div>
          <h3 className="mb-5 text-lg font-black leading-relaxed sm:text-2xl">{question.questionVi}</h3>
          {isRevealMode && <p className="mb-3 text-sm text-slate-600">Chạm mở thẻ, sau đó chọn đáp án em cho là đúng.</p>}
          <div className={`grid gap-3 ${isRevealMode ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
            {question.options.map((o,i)=>{
              const visible = !isRevealMode || revealed.includes(o.id);
              const ok=choice===o.id && o.isCorrect, bad=choice===o.id&&!o.isCorrect;
              return <button type="button" key={o.id} disabled={locked} onClick={()=>visible?answer(o.id):reveal(o.id)}
                aria-label={visible?o.textVi:`Mở thẻ ${i+1}`}
                className={`min-h-16 rounded-2xl border-2 p-4 text-left text-sm font-bold transition sm:text-base ${ok?'border-emerald-600 bg-emerald-100 text-emerald-900':bad?'border-red-600 bg-red-100 text-red-900':'border-sky-200 bg-sky-50 text-slate-900 hover:border-sky-600'}`}>
                <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 shadow-sm">{visible?String.fromCharCode(65+i):'❔'}</span>
                {visible?o.textVi:`Mở thẻ ${i+1}`}{ok?' ✓':bad?' ✕':''}
              </button>;
            })}
          </div>
          </>}
          <div className="mt-5 min-h-16" role="status" aria-live="polite">
            {incorrect?<div className="rounded-2xl border border-red-300 bg-red-50 p-3 font-bold text-red-800">Chưa đúng! 💡 {sampleTask?.hint || question.hintVi || 'Hãy nhớ lại bài học rồi thử tiếp nhé.'} Sau 2 giây em có thể chọn lại.</div>
            :locked&&choice?<div className="rounded-2xl bg-emerald-50 p-3 font-bold text-emerald-800">Chính xác! Giỏi lắm!</div>
            :<p className="text-sm text-slate-500">Chạm vào đáp án phù hợp để tiếp tục hành trình.</p>}
          </div>
        </div>
      </>}
      {screen==='victory' && <div className="my-auto rounded-3xl border border-yellow-200 bg-slate-950/75 p-7 text-center shadow-xl backdrop-blur-sm sm:p-12">
        <div className="text-6xl" aria-hidden="true">🎉🏆🎊</div><h3 className="mt-4 text-3xl font-black">CHÚC MỪNG CHIẾN THẮNG!</h3>
        <p className="mt-3 text-lg">Em đã hoàn thành cả {questions.length} thử thách. Thật tuyệt vời!</p>
        <button type="button" onClick={onCompleteStage} className="mt-7 min-h-14 w-full rounded-2xl bg-yellow-400 px-6 font-black text-slate-950 sm:w-auto">TIẾP TỤC HÀNH TRÌNH →</button>
      </div>}
    </div>
  </section>;
};
