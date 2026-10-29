import React, {useEffect, useLayoutEffect, useReducer, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {startFireworks} from './fireworks';
import {audioService} from '../../services/AudioService';
import approvedCss from './approved-v18.css?raw';
import safeLayoutCss from './safe-layout.css?raw';
import compactMatchCss from './compact-match.css?raw';
import {validateConfig, type GameConfig, type MatchQuestion} from './types';
import {gameReducer,initialState,connectPair,isCorrectMatch} from './state';
import {rewardSlots} from './rewards';
import {selectImage} from './multiImage';
import {shuffleGrade1} from './grade1/shuffle';
import {sharedGameAudio, responsiveSharedGameAudio, type GameSound} from './audio';
const colors=['#19ad5e','#1684eb','#f09a22'];
const fixes=`:host{display:block;font-family:system-ui,'Segoe UI',Arial,sans-serif;color:#18324b}button:disabled{cursor:default}button:focus-visible{outline:4px solid #ffab26;outline-offset:3px}.hud-key.earned{filter:sepia(1) saturate(6) hue-rotate(4deg);animation:reward-pop .45s ease-out}@keyframes reward-pop{50%{transform:scale(1.4)}}.preview-title{position:absolute;top:8px;left:50%;transform:translateX(-50%);margin:0;font-size:1px;opacity:0;pointer-events:none}.answers button.good{background:#c8ffd8!important;border-color:#1aa85a!important}.answers button.bad{background:#ffe0dc!important;border-color:#e74a43!important}.match button.selected{background:#fff1b5!important}.match button.linked{border-color:var(--c)!important;box-shadow:inset 0 0 0 2px var(--c)!important}.music-toggle{min-width:44px;min-height:44px}.controls:empty{display:none!important}@media(max-width:650px) and (orientation:portrait){.hud{top:calc(56.3vw + 8px)!important}}@media(max-height:450px){.scene:not(.is-victory) .shell{padding:0!important}.scene:not(.is-victory) .intro-screen{padding:6px!important}.scene:not(.is-victory) .panel{margin-top:60px!important;gap:3px!important;max-height:calc(100dvh - 70px)!important}.scene:not(.is-victory) .answers:not(:has(.choice-photo)) button{min-height:36px!important;padding:5px 12px!important;font-size:13px!important}.scene:not(.is-victory) .match button{min-height:38px!important;font-size:12px!important;padding:5px!important}.scene:not(.is-victory) .prompt{font-size:14px!important;padding:5px 12px!important}.intro-screen{padding:6px!important}.intro-emblem,.intro-rules,.intro-call{display:none!important}.intro-story{font-size:13px!important;line-height:1.25!important}.intro-screen h2{font-size:17px!important}.scene:not(.is-victory) .feedback{margin-top:3px!important;font-size:12px!important}.scene:not(.is-victory) .controls{padding:2px!important;margin:2px auto!important}}`;

function MatchCards({question,pairs,locked,onConnect,onSelect,onSpeak}:{question:MatchQuestion;pairs:Record<number,number>;locked:boolean;onConnect:(l:number,r:number)=>void;onSelect:(label:string)=>void;onSpeak?:(label:string)=>void}) {
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
    <div className="matchcol">{question.left.map((label,l)=>{const card=<button data-left={l} disabled={locked} aria-pressed={selected===l} className={`${selected===l?'selected':''} ${pairs[l]!==undefined?'linked':''}`} style={{'--c':colors[l]} as React.CSSProperties} onClick={()=>{onSelect(label);setSelected(l);}}>{label}</button>;return onSpeak?<div className="match-card" key={l}>{card}<button className="match-voice" aria-label={`Nghe ${label}`} onClick={()=>onSpeak(label)}>🔊</button></div>:React.cloneElement(card,{key:l});})}</div>
    <div className="matchcol">{question.right.map((label,r)=>{const l=Object.keys(pairs).find(l=>pairs[+l]===r);const card=<button data-right={r} disabled={locked||selected===null} className={l!==undefined?'linked':''} style={{'--c':l!==undefined?colors[+l]:undefined} as React.CSSProperties} onClick={()=>{if(selected!==null){onConnect(selected,r);setSelected(null);}}}>{label}</button>;return onSpeak?<div className="match-card" key={r}>{card}<button className="match-voice" aria-label={`Nghe ${label}`} onClick={()=>onSpeak(label)}>🔊</button></div>:React.cloneElement(card,{key:r});})}</div>
  </div>;
}
function Fireworks({lightweight=false}:{lightweight?:boolean}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{if(!canvas.current)return;return startFireworks(canvas.current,lightweight);},[lightweight]);
  return <canvas className="firecanvas" ref={canvas} aria-hidden="true"/>;
}
function GameSurface({config:originalConfig,onComplete,embedded=false}:{config:GameConfig;onComplete:()=>void;embedded?:boolean}) {
  const [config,setConfig]=useState(()=>shuffleGrade1(originalConfig));
  const sceneRef=useRef<HTMLElement>(null);
  const isGrade1=config.stationId.startsWith('g1-');
  const total=config.questions.length;
  const rewardCount=total;

  const [voiceError,setVoiceError]=useState(false);
  const responsiveAudio=/^g[1245]-/.test(config.stationId);
  const audio=responsiveAudio?responsiveSharedGameAudio:sharedGameAudio;
  const [state,dispatch]=useReducer(gameReducer,undefined,initialState);
  const slots=rewardSlots(state,total,false);
  const earnedCount=slots.filter(Boolean).length;
  const [pairs,setPairs]=useState<Record<number,number>>({});
  const [multiSelected,setMultiSelected]=useState<number[]>([]);
  const [multiWrong,setMultiWrong]=useState(false);
  const [muted,setMuted]=useState(audio.syncPreference);
  const completed=useRef(false),clickLocked=useRef(false);
  const continueTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const muteTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const selectedChoice=useRef<number|null>(null);
  const recordedVoice=useRef<HTMLAudioElement|null>(null);
  const question=config.questions[state.index];
  const locked=state.result!==null;
  const isTrueFalse=isGrade1&&state.index===1&&question.kind==='choice';
  const grade45Question=/^g[1245]-/.test(config.stationId)&&state.phase==='question';
  const compactMatch=grade45Question&&question.kind==='match';
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
  useEffect(()=>{setPairs({});setMultiSelected([]);setMultiWrong(false);clickLocked.current=false;},[state.index,state.phase,state.reviewing]);
  useEffect(()=>{
    if(state.result===null)return;
    const timer=setTimeout(()=>{audio.play('next');clickLocked.current=false;setPairs({});dispatch({type:'advance'});},isGrade1?(state.result?1600:5000):compactMatch?(state.result?1800:3500):(state.result?1100:2200));
    return ()=>clearTimeout(timer);
  },[state.result,state.index,compactMatch]);
  useEffect(()=>{if(state.phase==='victory'){audio.stop();audio.play('victory');}},[state.phase]);
  useEffect(()=>{if(isGrade1 && audioService.isSoundEnabled()===muted) audioService.toggleSound();},[isGrade1,muted]);
  useEffect(()=>{if(isGrade1&&state.result!==null&&!muted){const text=state.result?'Chính xác!':`Chưa đúng. Gợi ý: ${question.hint}`;audioService.speakNarration(text,'vi-VN',undefined,()=>setVoiceError(true));}},[isGrade1,state.result,state.index,muted]);
  const speak=(text:string)=>{if(!isGrade1||muted)return;setVoiceError(false);audioService.speakNarration(text,'vi-VN',undefined,()=>setVoiceError(true));};
  const stopRecorded=()=>{const current=recordedVoice.current;recordedVoice.current=null;if(current){current.pause();current.currentTime=0;}};
  const playRecorded=(phase:'intro'|'review'|'victory')=>{
    if(!isGrade1||muted)return;
    stopRecorded();audioService.stopNarration();setVoiceError(false);
    const number=phase==='review'?11:(Number(config.stationId.split('-').at(-1))-1)*2+(phase==='intro'?1:2);
    const player=new Audio(`/games/shared/v1/grade1/narration/${String(number).padStart(2,'0')}.mp3`);
    recordedVoice.current=player;player.onended=()=>{if(recordedVoice.current===player)recordedVoice.current=null;};
    player.onerror=()=>{if(recordedVoice.current===player){recordedVoice.current=null;setVoiceError(true);}};
    void player.play().catch(()=>{if(recordedVoice.current===player){recordedVoice.current=null;setVoiceError(true);}});
  };
  useEffect(()=>{if(isGrade1&&!muted&&(state.phase==='intro'||state.phase==='review'||state.phase==='victory'))playRecorded(state.phase);return ()=>stopRecorded();},[isGrade1,state.phase,muted,config.stationId]);
  useEffect(()=>{if(isGrade1&&state.phase==='question'&&state.result===null&&!muted){const q=config.questions[state.index];if(q.kind==='match')speak(q.prompt+' Chọn một thẻ bên trái, rồi chọn thẻ tương ứng bên phải.');else if(q.kind==='image')speak(q.prompt);else speak(q.prompt+' '+q.options.map((o,i)=>'Đáp án '+String.fromCharCode(65+i)+': '+o.text).join('. '));}return ()=>{if(isGrade1)audioService.stopNarration();};},[isGrade1,state.phase,state.index,state.result,muted]);
  const act=(name:GameSound,action:()=>void)=>{audio.unlock();audio.play(name);action();};
  const answer=(correct:boolean,sound:GameSound)=>{
    if(clickLocked.current||locked)return;clickLocked.current=true;if(isGrade1)audioService.stopNarration();
    if(responsiveAudio){audio.play(correct?'right':'wrong');}
    else {audio.play(sound);audio.play(correct?'right':'wrong');if(correct)audio.play('key');}
    dispatch({type:'answer',correct});
  };
  const restart=()=>{audio.stop();completed.current=false;clickLocked.current=false;setPairs({});setConfig(shuffleGrade1(originalConfig));act('retry',()=>dispatch({type:'restart'}));};
  const victory=state.phase==='victory';
  useLayoutEffect(()=>{
    if(!embedded || !victory || window.innerWidth>=1024 || !sceneRef.current)return;
    const root=sceneRef.current.getRootNode();
    if(root instanceof ShadowRoot)root.host.closest<HTMLElement>('.station-lesson-panel')?.scrollIntoView({block:'start',behavior:'instant'});
  },[embedded,victory]);
  return <main ref={sceneRef} className={`scene ${config.layout==='safe-v1'?'safe-layout':''} ${victory?'is-victory':''} ${grade45Question?'grade45-question':''} ${isGrade1?'grade1-game':''} ${/^g[12]-/.test(config.stationId)?'grade2-game':''}`} style={{backgroundImage:`url("${victory?config.victoryBackground:config.background}")`}}>
    <h1 className="preview-title">{config.title}</h1>
    {isGrade1&&state.phase==='intro'&&<button className="voice-question intro-voice" onClick={()=>playRecorded('intro')} aria-label="Nghe giới thiệu thử thách">🔊</button>}
    {isGrade1&&state.phase==='review'&&<button className="voice-question intro-voice" onClick={()=>playRecorded('review')} aria-label="Nghe lại hướng dẫn truy lại dấu vết">🔊</button>}
    <div className={`shell ${victory?'finished':''}`}>
      <div className="hud"><div className="hud-stage">{state.phase==='intro'?'SẴN SÀNG':victory?'HOÀN THÀNH':state.phase==='review'?'ÔN TẬP':`CÂU ${state.index+1}/${total}`}<small>{victory?`${total}/${total} câu hỏi`:state.reviewing||state.phase==='review'?'Truy lại dấu vết':state.phase==='intro'?(config.intro.readyLabel??'Khám phá lịch sử'):question.level}</small></div>
        <div className="hud-right"><div className="hud-keys" aria-label={`${earnedCount}/${rewardCount} ${config.collectible.name}`}>{slots.map((earned,i)=>{return <span key={i} className={`hud-key ${earned?'earned':''}`} aria-label={`${config.collectible.name} ${i+1}: ${earned?'đã nhận':'chưa nhận'}`}>{config.collectible.image?<img src={config.collectible.image} alt="" style={{width:'1em',height:'1em',display:'block'}}/>:config.collectible.icon}</span>;})}</div>
          <button className="music-toggle" aria-label={muted?'Bật âm thanh':'Tắt âm thanh'} aria-pressed={!muted} onClick={()=>{if(muteTimer.current)clearTimeout(muteTimer.current);if(responsiveAudio&&!muted){audio.play('tap');setMuted(true);muteTimer.current=setTimeout(()=>{audio.setMuted(true);muteTimer.current=null;},100);}else{audio.setMuted(!muted);setMuted(!muted);if(muted)audio.play('tap');}}}>{muted?'♪̸':'♫'}</button>
        </div>
      </div>
      <section className={`panel ${compactMatch?'compact-match':''} ${locked?'has-result':''}`} aria-label={config.title}>
        {state.phase==='intro'&&<div className="intro-screen"><div className="intro-emblem" aria-hidden="true">🧭</div><h2>{config.intro.heading}</h2>{isGrade1&&voiceError&&!muted&&<p role="status" className="voice-error">Chưa phát được giọng đọc. Nhờ người lớn hỗ trợ nhé!</p>}<p className="intro-story">{config.intro.story}</p><div className="intro-rules"><span>🧩 {total} thử thách</span><span>{config.collectible.icon} Tìm đủ {rewardCount} {config.collectible.name}</span><span>🔎 Sai? Truy lại dấu vết!</span></div><p className="intro-call">{config.intro.call}</p><button className="btn intro-start" onClick={()=>{void audio.preload();act('next',()=>dispatch({type:'start',count:total}));}}>🚀 BẮT ĐẦU KHÁM PHÁ</button></div>}
        {state.phase==='question'&&<>
          <h2 className={`prompt ${isGrade1?'voice-prompt':''}`}>{isGrade1&&<button className="voice-question" onClick={()=>speak(question.prompt)} aria-label="Nghe lại câu hỏi">🔊</button>}<span>{question.prompt}</span></h2>
          {isGrade1&&voiceError&&<p role="status" className="voice-error">Chưa phát được giọng đọc. Nhờ người lớn hỗ trợ nhé!</p>}
          {question.kind==='match'?<MatchCards key={compactMatch?`${state.index}`:`${state.index}-${state.result}`} question={question} pairs={pairs} locked={locked} onSelect={()=>audio.play('select')} onSpeak={isGrade1?speak:undefined} onConnect={(l,r)=>{audio.play('connect');setPairs(p=>connectPair(p,l,r));}}/>:
            (isGrade1?<div className={`answers ${isGrade1?'voice-answers':''} ${isTrueFalse?'true-false':''}`}>{question.options.map((o,i)=><div className="answer-wrap" key={i}><button data-choice={i} disabled={locked} className={multiSelected.includes(i)?'good':locked&&state.result!==null&&clickLocked.current&&selectedChoice.current===i?(state.result?'good':'bad'):''} onClick={()=>{if(locked||clickLocked.current)return;selectedChoice.current=i;if(question.answers){const result=selectImage(question.answers,multiSelected,i);setMultiSelected(result.selected);setMultiWrong(result.wrong);if(result.wrong){audio.play('wrong');return;}audio.play('select');if(result.complete)answer(true,'select');return;}answer(i===question.answer,'select');}}>{question.kind==='image'?<><img className="choice-photo" src={o.image} alt={`Hình lựa chọn ${'ABC'[i]}`}/></>:isTrueFalse?<><span className="tf-symbol" aria-hidden="true">{i===0?'✓':'✕'}</span><span>{i===0?'ĐÚNG':'SAI'}</span></>:<>{state.index===3?`${'ABC'[i]}. `:''}{o.text}</>}</button>{isGrade1&&!isTrueFalse&&question.kind!=='image'&&<button className="voice-option" disabled={locked} onClick={()=>speak(o.text)} aria-label={`Nghe phương án ${'ABC'[i]}`}>🔊</button>}</div>)}</div>:<div className="answers">{question.options.map((o,i)=><button key={i} data-choice={i} disabled={locked} className={locked&&state.result!==null&&clickLocked.current&&selectedChoice.current===i?(state.result?'good':'bad'):''} onClick={()=>{if(locked||clickLocked.current)return;selectedChoice.current=i;answer(i===question.answer,'select');}}>{question.kind==='image'?<><img className="choice-photo" src={o.image} alt={`Hình lựa chọn ${'ABC'[i]}`}/><span className="choice-letter">{'ABC'[i]}</span></>:o.text}</button>)}</div>)}
          <div className={compactMatch?'match-footer':'question-footer'}>
          <div className={`feedback ${state.result?'ok':''}`} role="status" aria-live="polite">{state.result===null?(multiWrong?'✕ Hình này chưa đúng, em thử lại nhé!':''):state.result?`✓ Chính xác! Nhận một ${config.collectible.name}!`:`✕ Chưa đúng! Gợi ý: ${question.hint}`}</div>
          <div className="controls">{question.kind==='match'&&!(compactMatch&&locked)&&<button className="btn" disabled={locked||Object.keys(pairs).length!==question.solution.length} onClick={()=>answer(isCorrectMatch(question.solution,pairs),'confirm')}>✓ XÁC NHẬN</button>}</div>
          </div>
        </>}
        {state.phase==='review'&&<div className="reviewprompt"><h2>🔎 TRUY LẠI DẤU VẾT</h2><p>Em có {state.missed.length} câu cần thử lại. Hãy hoàn thành tất cả thử thách nhé!</p>{isGrade1&&<>{voiceError&&!muted&&<p role="status" className="voice-error">Chưa phát được giọng đọc. Nhờ người lớn hỗ trợ nhé!</p>}</>}<button className="btn" onClick={()=>act('retry',()=>dispatch({type:'review'}))}>🔍 THỬ LẠI CÂU SAI</button></div>}
        {victory&&<div className="victory"><Fireworks lightweight={config.layout==='safe-v1'}/><div className="victory-content"><div className="victory-message"><div className="victory-praise">{config.victory.praise}</div><div className="victory-achievement">{config.victory.achievement}</div><div className="victory-reward">{config.victory.reward}</div>{isGrade1&&<button className="voice-question" onClick={()=>playRecorded('victory')} aria-label="Nghe lại lời chúc mừng">🔊</button>}{isGrade1&&voiceError&&!muted&&<p role="status" className="voice-error">Chưa phát được giọng đọc. Nhờ người lớn hỗ trợ nhé!</p>}</div><div className="victory-buttons"><button className="btn replay-btn" onClick={restart}>↻ CHƠI LẠI</button><button className="btn secondary continue-btn" onClick={()=>{if(completed.current)return;completed.current=true;audio.stop();audio.play('unlock');continueTimer.current=setTimeout(onComplete,240);}}>➜ TIẾP TỤC HÀNH TRÌNH</button></div></div></div>}
      </section>
    </div>
  </main>;
}
/** The approved stylesheet stays isolated from the existing app and other approved games. */
export function SharedChallengeGame(props:{config:GameConfig;onComplete:()=>void;embedded?:boolean}) {
  const host=useRef<HTMLDivElement>(null);
  const [root,setRoot]=useState<ShadowRoot|null>(null);
  useLayoutEffect(()=>{if(host.current)setRoot(host.current.shadowRoot||host.current.attachShadow({mode:'open'}));},[]);
  useLayoutEffect(()=>{
    if(!props.embedded||!host.current)return;
    const element=host.current, panel=element.closest<HTMLElement>('.station-lesson-panel');
    if(!panel)return;
    const update=()=>{const height=Math.max(280,Math.min(window.innerHeight,panel.clientHeight));element.style.setProperty('--embedded-height', `${height}px`);};
    update();const observer=new ResizeObserver(update);observer.observe(panel);window.addEventListener('resize',update);
    return ()=>{observer.disconnect();window.removeEventListener('resize',update);};
  },[props.embedded]);
  const voiceCss=`
.scene.grade1-game:not(.is-victory) .intro-screen{box-sizing:border-box!important;width:min(100%,520px)!important;max-width:520px!important;padding:16px 22px!important;border-radius:20px!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:7px!important}
.scene.grade1-game .intro-screen .intro-emblem{font-size:25px!important;line-height:1!important}
.scene.grade1-game .intro-screen h2{font-size:clamp(18px,2.3vw,24px)!important;line-height:1.2!important;margin:0!important}
.scene.grade1-game .intro-voice.voice-question{position:absolute!important;left:12px!important;bottom:12px!important;z-index:20!important;margin:0!important}
.scene.grade1-game .intro-screen .intro-story{font-size:clamp(14px,1.45vw,16px)!important;line-height:1.4!important;margin:0!important;max-width:465px!important}
.scene.grade1-game .intro-screen .intro-rules{margin:0!important;gap:5px!important}
.scene.grade1-game .intro-screen .intro-rules span{font-size:12px!important;padding:5px 8px!important}
.scene.grade1-game .intro-screen .intro-call{font-size:14px!important;margin:0!important;line-height:1.3!important}
.scene.grade1-game .intro-screen .intro-start{min-width:0!important;width:auto!important;min-height:46px!important;padding:8px 22px!important;font-size:15px!important}
@media(max-width:650px){.scene.grade1-game:not(.is-victory) .intro-screen{width:min(100%,360px)!important;padding:12px 14px!important;gap:6px!important}.scene.grade1-game .intro-screen .intro-story{font-size:14px!important;line-height:1.35!important}.scene.grade1-game .intro-screen .intro-rules span{font-size:11px!important;padding:4px 7px!important}.scene.grade1-game .intro-screen .intro-start{min-height:44px!important}}
@media(max-width:650px) and (orientation:portrait){.scene.grade1-game.grade45-question .hud-right,.scene.grade1-game.grade45-question .hud-keys{max-width:19vw!important}.scene.grade1-game.grade45-question .hud-key{font-size:10px!important}}
.scene.grade1-game .prompt.voice-prompt{display:flex!important;align-items:center!important;gap:7px!important;text-align:left!important;padding:5px 12px 5px 5px!important}
.scene.grade1-game .voice-question,.scene.grade1-game .voice-option,.scene.grade1-game .match-voice{display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important;flex:none!important;width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;max-width:40px!important;padding:0!important;margin:0!important;border:1px solid #d39837!important;border-radius:50%!important;background:#fff2cd!important;box-shadow:none!important;font-size:18px!important;line-height:1!important;z-index:5!important}
.scene.grade1-game .voice-error{font-size:12px;color:#703500;background:#fff8e7;border-radius:8px;padding:2px 6px;margin:0;text-align:center;max-width:100%}
.scene.grade1-game .voice-answers .answer-wrap{display:flex!important;position:relative!important;align-items:stretch!important;min-width:0!important;width:min(100%,560px)!important}
.scene.grade1-game .voice-answers .answer-wrap>button[data-choice]{display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;width:100%!important;min-width:0!important;min-height:52px!important;padding:8px 12px 8px 52px!important;white-space:normal!important;text-align:center!important;font-size:clamp(15px,2vw,19px)!important;line-height:1.25!important}
.scene.grade1-game .voice-answers .answer-wrap>.voice-option{position:absolute!important;left:6px!important;top:6px!important}
.scene.grade1-game .voice-answers:has(.choice-photo) .answer-wrap{width:100%!important}
.scene.grade1-game .voice-answers:has(.choice-photo) .answer-wrap>button[data-choice]{display:flex!important;flex-direction:column!important;justify-content:center!important;padding:5px!important;height:100%!important}
.scene.grade1-game .voice-answers .choice-label{display:block!important;color:#163857!important;font-weight:800!important;font-size:clamp(12px,1.4vw,16px)!important;line-height:1.2!important;overflow-wrap:anywhere!important;margin:5px 2px!important}
.scene.grade1-game.safe-layout.grade45-question .panel .matchcol{grid-template-rows:repeat(2,minmax(0,1fr))!important}.scene.grade1-game .compact-match .match-card{position:relative!important;min-width:0!important;height:100%!important}
.scene.grade1-game .compact-match .match-card>button[data-left],.scene.grade1-game .compact-match .match-card>button[data-right]{width:100%!important;height:100%!important;padding:4px 5px 4px 43px!important;white-space:normal!important;overflow-wrap:anywhere!important}
.scene.grade1-game .compact-match .match-card>.match-voice{position:absolute!important;left:3px!important;top:50%!important;transform:translateY(-50%)!important;width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;max-width:36px!important;font-size:16px!important}

.scene.grade1-game:not(.is-victory) .answers.voice-answers .answer-wrap>button.voice-option,.scene.grade1-game:not(.is-victory) .answers.voice-answers:has(.choice-photo) .answer-wrap>button.voice-option{position:absolute!important;display:flex!important;left:6px!important;right:auto!important;top:6px!important;bottom:auto!important;transform:none!important;width:40px!important;height:40px!important;min-width:40px!important;max-width:40px!important;min-height:40px!important;max-height:40px!important;padding:0!important;border:1px solid #d39837!important;border-radius:50%!important;background:#fff2cd!important;box-shadow:none!important;font-size:18px!important;z-index:8!important}
.scene.grade1-game.safe-layout.grade45-question .panel.compact-match .match .match-card>button.match-voice{position:absolute!important;left:3px!important;top:50%!important;transform:translateY(-50%)!important;width:36px!important;height:36px!important;min-width:36px!important;max-width:36px!important;min-height:36px!important;max-height:36px!important;padding:0!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important}
@media(max-width:650px){.scene.grade1-game.safe-layout.grade45-question .panel.compact-match .match .match-card>button.match-voice{width:32px!important;height:32px!important;min-width:32px!important;max-width:32px!important;min-height:32px!important;max-height:32px!important}}
@media(max-width:650px){.scene.grade1-game:not(.is-victory) .answers.voice-answers .answer-wrap>button.voice-option,.scene.grade1-game:not(.is-victory) .answers.voice-answers:has(.choice-photo) .answer-wrap>button.voice-option{width:36px!important;height:36px!important;min-width:36px!important;max-width:36px!important;min-height:36px!important;max-height:36px!important;font-size:16px!important}}
@media(max-width:650px){.scene.grade1-game .voice-answers .answer-wrap>button[data-choice]{font-size:14px!important}.scene.grade1-game .voice-question,.scene.grade1-game .voice-option{width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;max-width:36px!important;font-size:16px!important}.scene.grade1-game .compact-match .match-card>button[data-left],.scene.grade1-game .compact-match .match-card>button[data-right]{padding-left:37px!important;font-size:12px!important}.scene.grade1-game .compact-match .match-card>.match-voice{width:32px!important;height:32px!important;min-width:32px!important;min-height:32px!important;max-width:32px!important}}
`;
  const compactVoiceCss=`
.scene.grade1-game .prompt.voice-prompt>.voice-question,
.scene.grade1-game:not(.is-victory) .answers.voice-answers .answer-wrap>button.voice-option,
.scene.grade1-game.safe-layout.grade45-question .panel.compact-match .match .match-card>button.match-voice{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;max-width:40px!important;max-height:40px!important;background:transparent!important;border:0!important;border-radius:8px!important;box-shadow:none!important;font-size:20px!important}
.scene.grade1-game:not(.is-victory) .answers.voice-answers .answer-wrap>button.voice-option{left:2px!important;top:50%!important;transform:translateY(-50%)!important}
.scene.grade1-game .voice-answers:not(:has(.choice-photo)) .answer-wrap>button[data-choice]{padding-left:44px!important}
.scene.grade1-game .voice-answers:has(.choice-photo) .choice-photo{flex:1 1 auto!important;min-height:0!important;object-fit:cover!important}
.scene.grade1-game:not(.is-victory) .answers.true-false .answer-wrap>button[data-choice]{padding:12px 8px!important}
.scene.grade1-game .compact-match .match-card>button[data-left],.scene.grade1-game .compact-match .match-card>button[data-right]{padding-left:43px!important}
.scene.grade1-game .voice-question.voice-question,
.scene.grade1-game .voice-option.voice-option,
.scene.grade1-game .match-voice.match-voice{background:transparent!important;border:0!important;box-shadow:none!important;opacity:.65!important;font-size:16px!important;filter:grayscale(.5)!important;cursor:pointer}
.scene.grade1-game .voice-question.voice-question:hover,.scene.grade1-game .voice-question.voice-question:focus-visible,
.scene.grade1-game .voice-option.voice-option:hover,.scene.grade1-game .voice-option.voice-option:focus-visible,
.scene.grade1-game .match-voice.match-voice:hover,.scene.grade1-game .match-voice.match-voice:focus-visible{opacity:1!important;filter:none!important}
`;
  const trueFalseCss=`.scene.grade1-game:not(.is-victory) .answers.true-false{display:flex!important;flex-direction:row!important;justify-content:center!important;gap:clamp(12px,3vw,24px)!important;width:min(100%,540px)!important}.scene.grade1-game:not(.is-victory) .answers.true-false .answer-wrap{width:calc(50% - 8px)!important;max-width:230px!important}.scene.grade1-game:not(.is-victory) .answers.true-false .answer-wrap>button[data-choice]{display:flex!important;flex-direction:column!important;gap:4px!important;justify-content:center!important;align-items:center!important;padding:12px 8px!important;min-height:130px!important;border-radius:20px!important;font-weight:900!important;font-size:clamp(17px,3vw,24px)!important}.scene.grade1-game:not(.is-victory) .answers.true-false .answer-wrap:first-child>button{background:#e7ffeb!important;color:#126833!important;border:3px solid #35a95c!important}.scene.grade1-game:not(.is-victory) .answers.true-false .answer-wrap:nth-child(2)>button{background:#fff0ee!important;color:#a72b28!important;border:3px solid #e1635d!important}.scene.grade1-game .true-false .tf-symbol{font-size:clamp(42px,8vw,64px)!important;line-height:1!important;font-weight:900!important}@media(max-width:650px){.scene.grade1-game:not(.is-victory) .answers.true-false .answer-wrap>button[data-choice]{min-height:105px!important;font-size:19px!important}.scene.grade1-game .true-false .tf-symbol{font-size:48px!important}}`;
  const questionEmphasisCss=`
/* Uniform orange question plaque across all shared Stage 2 games. */
.scene:not(.is-victory) .panel .prompt {
 box-sizing:border-box!important;max-width:100%!important;min-width:0!important;
 background:linear-gradient(180deg,#fb923c,#ea580c)!important;color:#fff!important;
 border:2px solid #fed7aa!important;border-radius:18px!important;
 box-shadow:0 5px 0 #9a3412,0 8px 16px #43140777!important;
 text-shadow:0 1px 2px #7c2d12!important;
 font-size:clamp(16px,2.2vw,29px)!important;line-height:1.25!important;
 padding:9px 16px!important;white-space:normal!important;overflow-wrap:anywhere!important;
 height:auto!important;min-height:0!important;
}
.scene:not(.is-victory) .panel .prompt span {color:#fff!important;white-space:normal!important;overflow-wrap:anywhere!important}
.scene:not(.is-victory) .answers button[data-choice],
.scene:not(.is-victory) .match button {white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.2!important}
@media(max-width:650px) and (orientation:portrait){
 :host([data-embedded]){display:block!important;min-height:100%!important;overflow:visible!important}
 :host([data-embedded]) .scene:not(.is-victory){height:auto!important;min-height:var(--embedded-height,100dvh)!important;overflow-y:auto!important;overscroll-behavior:contain!important}
 :host([data-embedded]) .scene:not(.is-victory) .shell{height:auto!important;min-height:100%!important;overflow:visible!important}
 :host([data-embedded]) .scene:not(.is-victory) .panel{max-height:none!important;height:auto!important;overflow:visible!important;padding-bottom:24px!important}
 .scene:not(.is-victory) .panel .prompt{font-size:clamp(15px,4.1vw,20px)!important;padding:8px 12px!important}
 .scene:not(.is-victory) .answers button[data-choice],.scene:not(.is-victory) .match button{height:auto!important;min-height:48px!important;max-height:none!important}
}
`;
  const grade2Css=`@media(max-width:650px) and (orientation:portrait){.scene.safe-layout.grade2-game:not(.is-victory){--art-width:140vw;--banner-bottom:26.8vw}}`;
  const embeddedCss=`:host([data-embedded]) .scene .intro-screen{padding:14px 20px!important;gap:6px!important;max-width:560px!important}:host([data-embedded]) .scene .intro-emblem{font-size:26px!important}:host([data-embedded]) .scene .intro-screen h2{font-size:clamp(18px,2vw,26px)!important;margin:0!important}:host([data-embedded]) .scene .intro-story{font-size:clamp(14px,1.5vw,17px)!important;line-height:1.4!important;margin:4px 0!important}:host([data-embedded]) .scene .intro-call{font-size:14px!important;margin:4px 0!important}:host([data-embedded]) .scene .intro-start{min-height:44px!important;padding:9px 18px!important;font-size:16px!important}:host([data-embedded]) .scene{height:var(--embedded-height,100dvh)!important;min-height:0!important}:host([data-embedded]) .scene .shell{height:100%!important;min-height:0!important}:host([data-embedded]) .scene.safe-layout.is-victory .panel,:host([data-embedded]) .scene.safe-layout.is-victory .victory{height:100%!important;min-height:0!important}`;
  return <div ref={host} data-shared-stage2="v1" data-embedded={props.embedded?'':undefined}>{root&&createPortal(<><style>{approvedCss+'\n'+fixes+'\n'+safeLayoutCss+'\n'+compactMatchCss+'\n'+voiceCss+'\n'+trueFalseCss+'\n'+compactVoiceCss+'\n'+grade2Css+'\n'+embeddedCss+'\n'+questionEmphasisCss}</style><GameSurface key={props.config.stationId} {...props}/></>,root)}</div>;
}
