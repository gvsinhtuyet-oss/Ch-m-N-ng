import React,{useState} from 'react';
import type {PracticeQuestion} from '../../services/AssistantLearningEngine';
export function AssistantPracticeCard({practice,onNext}:{practice:PracticeQuestion;onNext?:()=>void}) {
  const [chosen,setChosen]=useState<number|null>(null);
  const [written,setWritten]=useState('');
  const [revealed,setRevealed]=useState(false);
  const [hintOpen,setHintOpen]=useState(false);
  const [reflection,setReflection]=useState('');
  return <section className="mt-3 space-y-2 rounded-xl border border-sky-200 bg-sky-50 p-3" aria-label="Luyện một câu">
    <p className="font-bold text-sky-950">{practice.question}</p>
    {practice.hint&&!revealed&&<><button type="button" onClick={()=>setHintOpen(true)} className="min-h-11 rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-bold">Cho em một gợi ý</button>{hintOpen&&<p role="status" className="text-sm text-sky-900">{practice.hint}</p>}</>}
    {practice.options?<div className="space-y-2">{practice.options.map((option,index)=><button type="button" key={option} disabled={chosen!==null} aria-pressed={chosen===index} onClick={()=>{setChosen(index);setRevealed(true);}} className={`block min-h-11 w-full rounded-xl border px-3 py-2 text-left text-sm ${chosen===index?'border-sky-700 bg-sky-100':'border-slate-200 bg-white'}`}>{option}</button>)}</div>:<>
      <label className="block text-xs font-semibold">Câu trả lời của em<textarea aria-label="Câu trả lời luyện tập" rows={2} maxLength={300} value={written} onChange={event=>setWritten(event.target.value)} className="mt-1 w-full rounded-lg border p-2 text-base"/></label>
      <button type="button" disabled={!written.trim()} onClick={()=>setRevealed(true)} className="min-h-11 rounded-lg bg-sky-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">Đối chiếu gợi ý</button>
    </>}
    {revealed&&<div role="status" className="rounded-lg bg-white p-3 text-sm">
      <p className="font-bold">{practice.options?(chosen===practice.correctIndex?'Đúng rồi!':'Em xem lại ý này nhé:'):'Gợi ý để em tự đối chiếu:'}</p>
      <p>{practice.answer}</p><p className="mt-1">{practice.explanation}</p>
      <p className="mt-2 font-semibold">Lần sau em sẽ nhớ điều gì?</p>
      <div className="mt-1 flex flex-wrap gap-2">{['Em đã hiểu hơn','Em cần thầy cô giúp thêm'].map(text=><button type="button" key={text} aria-pressed={reflection===text} onClick={()=>setReflection(text)} className={`min-h-11 rounded-lg border px-2 py-1 text-xs ${reflection===text?'border-sky-700 bg-sky-100':'border-slate-200'}`}>{text}</button>)}</div>
      {reflection==='Em cần thầy cô giúp thêm'&&<p className="mt-1">Em chỉ ra chỗ còn khó và hỏi thầy cô nhé.</p>}
      {onNext&&<button type="button" onClick={onNext} className="mt-2 min-h-11 rounded-lg bg-sky-700 px-3 py-2 font-bold text-white">Hỏi em câu tiếp theo</button>}
      {!practice.options&&<p className="mt-1 text-xs">Câu tự luận này không được chấm điểm tự động. Em có thể nhờ thầy cô góp ý thêm.</p>}
    </div>}
  </section>;
}
