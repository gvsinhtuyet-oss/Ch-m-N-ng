import React, {useEffect, useLayoutEffect, useReducer, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {startFireworks} from './fireworks';
import approvedCss from './approved-v18.css?raw';
import safeLayoutCss from './safe-layout.css?raw';
import compactMatchCss from './compact-match.css?raw';
import {validateConfig, type GameConfig, type MatchQuestion} from './types';
import {gameReducer,initialState,connectPair,isCorrectMatch} from './state';
import {sharedGameAudio as audio, type GameSound} from './audio';
const colors=['#19ad5e','#1684eb','#f09a22'];
const fixes=`:host{display:block;font-family:system-ui,'Segoe UI',Arial,sans-serif;color:#18324b}button:disabled{cursor:default}button:focus-visible{outline:4px solid #ffab26;outline-offset:3px}.hud-key.earned{filter:sepia(1) saturate(6) hue-rotate(4deg);animation:reward-pop .45s ease-out}@keyframes reward-pop{50%{transform:scale(1.4)}}.preview-title{position:absolute;top:8px;left:50%;transform:translateX(-50%);margin:0;font-size:1px;opacity:0;pointer-events:none}.answers button.good{background:#c8ffd8!important;border-color:#1aa85a!important}.answers button.bad{background:#ffe0dc!important;border-color:#e74a43!important}.match button.selected{background:#fff1b5!important}.match button.linked{border-color:var(--c)!important;box-shadow:inset 0 0 0 2px var(--c)!important}.music-toggle{min-width:44px;min-height:44px}.controls:empty{display:none!important}@media(max-width:650px) and (orientation:portrait){.hud{top:calc(56.3vw + 8px)!important}}@media(max-height:450px){.scene:not(.is-victory) .shell{padding:0!important}.scene:not(.is-victory) .intro-screen{padding:6px!important}.scene:not(.is-victory) .panel{margin-top:60px!important;gap:3px!important;max-height:calc(100dvh - 70px)!important}.scene:not(.is-victory) .answers:not(:has(.choice-photo)) button{min-height:36px!important;padding:5px 12px!important;font-size:13px!important}.scene:not(.is-victory) .match button{min-height:38px!important;font-size:12px!important;padding:5px!important}.scene:not(.is-victory) .prompt{font-size:14px!important;padding:5px 12px!important}.intro-screen{padding:6px!important}.intro-emblem,.intro-rules,.intro-call{display:none!important}.intro-story{font-size:13px!important;line-height:1.25!important}.intro-screen h2{font-size:17px!important}.scene:not(.is-victory) .feedback{margin-top:3px!important;font-size:12px!important}.scene:not(.is-victory) .controls{padding:2px!important;margin:2px auto!important}}`;

function MatchCards({question,pairs,locked,onConnect,onSelect}:{question:MatchQuestion;pairs:Record<number,number>;locked:boolean;onConnect:(l:number,r:number)=>void;onSelect:()=>void}) {
  const [selected,setSelected]=useState<number|null>(null);
  const box=useRef<HTMLDivElement>(null);
  const [lines,setLines]=useState<{x1:number;y1:number;x2:number;y2:number;color:string}[]>([]);
  useLayoutEffect(()=>{
    const parent=box.current;if(!parent)return;
    const update=()=>{const b=parent.getBoundingClientRect();setLines(Object.entries(pairs).map(([l,r])=>{
      const a=parent.querySelector<HTMLElement>(`[data-left="${l}"]`)!.getBoundingClientRect();
      const c=parent.querySelector<HTMLElement>(`[data-right="${r}"]`)!.getBoundingClientRect();
      return {x1:a.right-b.left,y1:a.top+a.height/2-b.top,x2:c.left-b.left,y2:c.top+c.height/2-b.top,color:colors[+l]};
    }));};
    update();const observer=new ResizeObserver(update);observer.observe(parent);window.addEventListener('resize',update);
    return ()=>{observer.disconnect();window.removeEventListener('resize',update);};
  },[pairs]);
  return <div className="match" ref={box}>
    <svg className="lines" aria-hidden="true">{lines.map((line,i)=><g key={i}><line {...line} stroke="white" strokeWidth={8}/><line {...line} stroke={line.color} strokeWidth={5} strokeLinecap="round"/></g>)}</svg>
    <div className="matchcol">{question.left.map((label,l)=><button key={l} data-left={l} disabled={locked} aria-pressed={selected===l} className={`${selected===l?'selected':''} ${pairs[l]!==undefined?'linked':''}`} style={{'--c':colors[l]} as React.CSSProperties} onClick={()=>{onSelect();setSelected(l);}}>{label}</button>)}</div>
    <div className="matchcol">{question.right.map((label,r)=>{const l=Object.keys(pairs).find(l=>pairs[+l]===r);return <button key={r} data-right={r} disabled={locked||selected===null} className={l!==undefined?'linked':''} style={{'--c':l!==undefined?colors[+l]:undefined} as React.CSSProperties} onClick={()=>{if(selected!==null){onConnect(selected,r);setSelected(null);}}}>{label}</button>;})}</div>
  </div>;
}
function Fireworks({lightweight=false}:{lightweight?:boolean}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{if(!canvas.current)return;return startFireworks(canvas.current,lightweight);},[lightweight]);
  return <canvas className="firecanvas" ref={canvas} aria-hidden="true"/>;
}
function GameSurface({config,onComplete}:{config:GameConfig;onComplete:()=>void}) {
  const [state,dispatch]=useReducer(gameReducer,undefined,initialState);
  const [pairs,setPairs]=useState<Record<number,number>>({});
  const [muted,setMuted]=useState(audio.isMuted);
  const completed=useRef(false),clickLocked=useRef(false);
  const continueTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const selectedChoice=useRef<number|null>(null);
  const question=config.questions[state.index];
  const locked=state.result!==null;
  const compactMatch=/^g[45]-/.test(config.stationId)&&state.phase==='question'&&question.kind==='match';
  useEffect(()=>{
    if(config.layout!=='safe-v1')return;
    // Fetch and decode before the last answer, keeping the decoded image alive.
    const images=[config.background,config.victoryBackground].map(src=>{
      const img=new Image();img.decoding='async';img.src=src;
      void img.decode().catch(()=>{});return img;
    });
    return ()=>{images.forEach(img=>{img.onload=null;});};
  },[config]);
  useEffect(()=>{validateConfig(config);return ()=>{audio.stop();if(continueTimer.current)clearTimeout(continueTimer.current);};},[config]);
  useEffect(()=>{setPairs({});clickLocked.current=false;},[state.index,state.phase,state.reviewing]);
  useEffect(()=>{
    if(state.result===null)return;
    const timer=setTimeout(()=>{audio.play('next');clickLocked.current=false;setPairs({});dispatch({type:'advance'});},compactMatch?(state.result?1800:3500):(state.result?1100:2200));
    return ()=>clearTimeout(timer);
  },[state.result,state.index,compactMatch]);
  useEffect(()=>{if(state.phase==='victory'){audio.stop();audio.play('victory');}},[state.phase]);
  const act=(name:GameSound,action:()=>void)=>{audio.unlock();audio.play(name);action();};
  const answer=(correct:boolean,sound:GameSound)=>{
    if(clickLocked.current||locked)return;clickLocked.current=true;
    audio.play(sound);audio.play(correct?'right':'wrong');if(correct)audio.play('key');dispatch({type:'answer',correct});
  };
  const restart=()=>{audio.stop();completed.current=false;clickLocked.current=false;setPairs({});act('retry',()=>dispatch({type:'restart'}));};
  const victory=state.phase==='victory';
  return <main className={`scene ${config.layout==='safe-v1'?'safe-layout':''} ${victory?'is-victory':''}`} style={{backgroundImage:`url("${victory?config.victoryBackground:config.background}")`}}>
    <h1 className="preview-title">{config.title}</h1>
    <div className={`shell ${victory?'finished':''}`}>
      <div className="hud"><div className="hud-stage">{state.phase==='intro'?'SẴN SÀNG':victory?'HOÀN THÀNH':state.phase==='review'?'ÔN TẬP':`CÂU ${state.index+1}/5`}<small>{victory?'5/5 câu hỏi':state.reviewing||state.phase==='review'?'Truy lại dấu vết':state.phase==='intro'?(config.intro.readyLabel??'Khám phá lịch sử'):question.level}</small></div>
        <div className="hud-right"><div className="hud-keys" aria-label={`${state.earned.length}/5 ${config.collectible.name}`}>{config.questions.map((q,i)=><span key={q.id} className={`hud-key ${state.earned.includes(i)?'earned':''}`} aria-label={`${config.collectible.name} ${i+1}: ${state.earned.includes(i)?'đã nhận':'chưa nhận'}`}>{config.collectible.image?<img src={config.collectible.image} alt="" style={{width:'1em',height:'1em',display:'block'}}/>:config.collectible.icon}</span>)}</div>
          <button className="music-toggle" aria-label={muted?'Bật âm thanh':'Tắt âm thanh'} aria-pressed={!muted} onClick={()=>{audio.setMuted(!muted);setMuted(!muted);if(muted)audio.play('tap');}}>{muted?'♪̸':'♫'}</button>
        </div>
      </div>
      <section className={`panel ${compactMatch?'compact-match':''} ${locked?'has-result':''}`} aria-label={config.title}>
        {state.phase==='intro'&&<div className="intro-screen"><div className="intro-emblem" aria-hidden="true">🧭</div><h2>{config.intro.heading}</h2><p className="intro-story">{config.intro.story}</p><div className="intro-rules"><span>🧩 5 thử thách</span><span>{config.collectible.icon} Tìm đủ 5 {config.collectible.name}</span><span>🔎 Sai? Truy lại dấu vết!</span></div><p className="intro-call">{config.intro.call}</p><button className="btn intro-start" onClick={()=>{void audio.preload();act('next',()=>dispatch({type:'start'}));}}>🚀 BẮT ĐẦU KHÁM PHÁ</button></div>}
        {state.phase==='question'&&<>
          <h2 className="prompt">{question.prompt}</h2>
          {question.kind==='match'?<MatchCards key={compactMatch?`${state.index}`:`${state.index}-${state.result}`} question={question} pairs={pairs} locked={locked} onSelect={()=>audio.play('select')} onConnect={(l,r)=>{audio.play('connect');setPairs(p=>connectPair(p,l,r));}}/>:
            <div className="answers">{question.options.map((o,i)=><button key={i} data-choice={i} disabled={locked} className={locked&&state.result!==null&&clickLocked.current&&selectedChoice.current===i?(state.result?'good':'bad'):''} onClick={()=>{if(locked||clickLocked.current)return;selectedChoice.current=i;answer(i===question.answer,'select');}}>{question.kind==='image'?<><img className="choice-photo" src={o.image} alt={`Hình lựa chọn ${'ABC'[i]}`}/><span className="choice-letter">{'ABC'[i]}</span></>:o.text}</button>)}</div>}
          <div className={compactMatch?'match-footer':'question-footer'}>
          <div className={`feedback ${state.result?'ok':''}`} role="status" aria-live="polite">{state.result===null?'':state.result?`✓ Chính xác! Nhận một ${config.collectible.name}!`:`✕ Chưa đúng! Gợi ý: ${question.hint}`}</div>
          <div className="controls">{question.kind==='match'&&!(compactMatch&&locked)&&<button className="btn" disabled={locked||Object.keys(pairs).length!==3} onClick={()=>answer(isCorrectMatch(question.solution,pairs),'confirm')}>✓ XÁC NHẬN</button>}</div>
          </div>
        </>}
        {state.phase==='review'&&<div className="reviewprompt"><h2>🔎 TRUY LẠI DẤU VẾT</h2><p>Em có {state.missed.length} câu cần thử lại. Hãy hoàn thành tất cả thử thách nhé!</p><button className="btn" onClick={()=>act('retry',()=>dispatch({type:'review'}))}>🔍 THỬ LẠI CÂU SAI</button></div>}
        {victory&&<div className="victory"><Fireworks lightweight={config.layout==='safe-v1'}/><div className="victory-content"><div className="victory-message"><div className="victory-praise">{config.victory.praise}</div><div className="victory-achievement">{config.victory.achievement}</div><div className="victory-reward">{config.victory.reward}</div></div><div className="victory-buttons"><button className="btn replay-btn" onClick={restart}>↻ CHƠI LẠI</button><button className="btn secondary continue-btn" onClick={()=>{if(completed.current)return;completed.current=true;audio.stop();audio.play('unlock');continueTimer.current=setTimeout(onComplete,240);}}>➜ TIẾP TỤC HÀNH TRÌNH</button></div></div></div>}
      </section>
    </div>
  </main>;
}
/** The approved stylesheet stays isolated from the existing app and other approved games. */
export function SharedChallengeGame(props:{config:GameConfig;onComplete:()=>void}) {
  const host=useRef<HTMLDivElement>(null);
  const [root,setRoot]=useState<ShadowRoot|null>(null);
  useLayoutEffect(()=>{if(host.current)setRoot(host.current.shadowRoot||host.current.attachShadow({mode:'open'}));},[]);
  return <div ref={host} data-shared-stage2="v1">{root&&createPortal(<><style>{approvedCss+'\n'+fixes+'\n'+safeLayoutCss+'\n'+compactMatchCss}</style><GameSurface key={props.config.stationId} {...props}/></>,root)}</div>;
}
