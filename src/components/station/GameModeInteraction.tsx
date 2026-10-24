import React, { useState } from 'react';

/** Interaction data is independent from the display theme and can be reused across grades. */
export type Task =
  | { type:'pick'|'flip'|'unlock'|'journey'|'treasure'; prompt:string; items:{label:string;correct:boolean;image?:string}[];hint:string }
  | { type:'detective'; prompt:string; image:string; spots:{x:number;y:number;label:string;correct:boolean}[];hint:string }
  | { type:'classify'; prompt:string; groups:[string,string]; items:{label:string;group:0|1}[];hint:string }
  | { type:'pair';prompt:string;pairs:{left:string;right:string}[];hint:string };

type Props = {task:Task;onCorrect:()=>void;onWrong:(hint:string)=>void;locked:boolean;incorrect:boolean};
export const GameModeInteraction:React.FC<Props> = ({task,onCorrect,onWrong,locked,incorrect})=>{
 const [open,setOpen]=useState<number[]>([]);
 const [groupAssignments,setGroups]=useState<Record<number,0|1>>({});
 const [left,setLeft]=useState<number|null>(null);
 const [matched,setMatched]=useState<number[]>([]);
 const [attempt,setAttempt]=useState<number|null>(null);
 const fail=()=>onWrong(task.hint);
 const choice=(correct:boolean)=>{if(locked)return;if(correct)onCorrect();else fail();};
 const btn='min-h-14 rounded-2xl border-2 border-sky-200 bg-white/95 px-4 py-3 font-bold text-slate-900 shadow-sm hover:border-cyan-600 active:scale-[.99] disabled:opacity-65';
 const answerButtons=(items:{label:string;correct:boolean;image?:string}[])=>items.map((item,i)=>{
  const hidden=(task.type==='flip'||task.type==='treasure')&&!open.includes(i);
  return <button key={i} className={btn} disabled={locked} onClick={()=>hidden?setOpen(v=>[...v,i]):choice(item.correct)}>
   {item.image&&<img src={item.image} alt="" loading="lazy" className="mb-2 h-24 w-full rounded-xl object-cover"/>}
   {hidden?<span>🎁 Mở thẻ {i+1}</span>:<span>{item.label}</span>}
  </button>;
 });
 if(task.type==='detective') return <div>
  <p className="mb-3 text-sm font-medium">Chạm vào vị trí em tìm được trên tranh.</p>
  <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border-4 border-white shadow-xl">
   <img src={task.image} alt="Tranh tìm dấu vết an toàn ở bãi biển" className="block w-full" />
   {task.spots.map((s,i)=><button key={i} disabled={locked} aria-label={s.label} title={s.label}
    style={{left:`${s.x}%`,top:`${s.y}%`,transform:'translate(-50%,-50%)'}}
    onClick={()=>choice(s.correct)}
    className="absolute flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-amber-400/80 text-xl shadow-lg focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-500">🔎</button>)}
  </div>
 </div>;
 if(task.type==='classify') {
  const all=task.items.every((_,i)=>groupAssignments[i]!==undefined);
  const check=()=>all&&choice(task.items.every((v,i)=>v.group===groupAssignments[i]));
  return <div className="space-y-3">
   <p className="text-sm text-slate-700">Chạm vào tên nhóm dưới mỗi hoạt động, rồi kiểm tra.</p>
   {task.items.map((item,i)=><div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="mb-2 font-bold">{item.label}</div>
    <div className="grid grid-cols-2 gap-2">{task.groups.map((group,j)=><button type="button" key={group} disabled={locked} onClick={()=>setGroups(p=>({...p,[i]:j as 0|1}))} className={`${btn} ${groupAssignments[i]===j?'!border-cyan-600 !bg-cyan-100':''}`}>{group}</button>)}</div>
   </div>)}
   {incorrect&&<button className={btn} onClick={()=>setGroups({})}>Sắp xếp lại</button>}
   <button className={`${btn} w-full !bg-amber-300`} disabled={!all||locked} onClick={check}>KIỂM TRA PHÂN LOẠI</button>
  </div>;
 }
 if(task.type==='pair')return <div className="space-y-3">
  <p className="text-sm text-slate-700">Chạm một thẻ ở cột trái, rồi chạm thẻ tương ứng bên phải.</p>
  <div className="grid grid-cols-2 gap-3">
   <div className="space-y-2">{task.pairs.map((p,i)=><button key={i} disabled={locked||matched.includes(i)} onClick={()=>setLeft(i)} className={`${btn} w-full ${left===i?'!bg-cyan-100 !border-cyan-600':''}`}>{matched.includes(i)?'✓ ':''}{p.left}</button>)}</div>
   <div className="space-y-2">{[...task.pairs].reverse().map((p,j)=>{const original=task.pairs.length-j-1;return <button key={j} disabled={locked||matched.includes(original)} onClick={()=>{if(left===null)return;if(left!==original){setLeft(null);fail();return;}const next=[...matched,original];setMatched(next);setLeft(null);if(next.length===task.pairs.length)onCorrect();}} className={`${btn} w-full`}>{matched.includes(original)?'✓ ':''}{p.right}</button>;})}</div>
  </div>
 </div>;
 if(task.type==='unlock')return <div className="space-y-3">
  <div className="text-center text-5xl" aria-hidden="true">🔒</div>
  <p className="text-center text-sm text-slate-600">Chọn chìa khóa đúng để mở cánh cửa khám phá.</p>
  <div className="grid gap-3 sm:grid-cols-3">{answerButtons(task.items)}</div>
 </div>;
 if(task.type==='journey')return <div>
  <p className="mb-4 text-sm text-slate-700">Ba con đường, chỉ một đường đưa em đến nơi an toàn.</p>
  <div className="grid gap-3 sm:grid-cols-3">{task.items.map((item,i)=><button key={i} disabled={locked} onClick={()=>choice(item.correct)} className={`${btn} min-h-32`}><div className="text-4xl">🧭</div><div className="mt-2">{item.label}</div></button>)}</div>
 </div>;
 return <div className="grid gap-3 sm:grid-cols-3">{answerButtons(task.items)}</div>;
};
