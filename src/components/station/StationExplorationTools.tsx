import React,{useEffect,useId,useRef,useState} from 'react';
import {X,ExternalLink} from 'lucide-react';
import type {Station} from '../../types';
import {audioService} from '../../services/AudioService';
import {backgroundMusic} from '../../services/BackgroundMusic';
import {InteractiveGeoMap,type GeoPoint} from './InteractiveGeoMap';
import {GEO_LESSON_POINTS,stationMapPlaces,stationVrOptions} from '../../features/stations/explorationResources';

function ToolArtwork({kind}:{kind:'vr'|'map'}) {
  const id=useId().replace(/:/g,'');
  return <svg viewBox="0 0 100 88" aria-hidden="true" className="exploration-tool-art">
    <defs>
      <radialGradient id={id+'sea'} cx="30%" cy="20%" r="85%"><stop stopColor="#a6fff1"/><stop offset=".45" stopColor="#16b9c9"/><stop offset="1" stopColor="#075586"/></radialGradient>
      <linearGradient id={id+'paper'} x2="1" y2="1"><stop stopColor="#fff7cf"/><stop offset="1" stopColor="#d5a052"/></linearGradient>
      <linearGradient id={id+'gold'} x2="1" y2="1"><stop stopColor="#fff4aa"/><stop offset=".5" stopColor="#f5bd40"/><stop offset="1" stopColor="#8c501b"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="78" rx="34" ry="5" fill="#5c391a" opacity=".18"/>
    {kind==='vr'?<>
      <path d="M27 69Q49 81 70 67M48 61V76" fill="none" stroke={`url(#${id}gold)`} strokeWidth="7" strokeLinecap="round"/>
      <circle cx="50" cy="37" r="31" fill={`url(#${id}sea)`} stroke="#fff8cf" strokeWidth="2"/>
      <path d="M27 18L43 12 51 20 47 29 58 33 54 44 44 48 43 62 34 57 35 43 26 38 21 29ZM63 21L73 26 79 40 69 45 61 38 64 31ZM61 51L75 53 70 63 61 65 57 59Z" fill="#b9e988" stroke="#68a46a" strokeWidth="1"/>
      <ellipse cx="50" cy="37" rx="17" ry="30" fill="none" stroke="#e1ffff" opacity=".35"/>
      <path d="M20 35Q50 44 81 35M24 22Q50 31 76 22M24 52Q50 59 76 52" fill="none" stroke="#e1ffff" opacity=".3"/>
      <path d="M27 23Q34 13 46 11" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity=".7"/>
    </>:<>
      <path d="M12 23L35 13 59 23 81 13 88 65 63 76 39 65 16 76Z" fill="#8c501b" opacity=".2" transform="translate(0 3)"/>
      <path d="M12 20L35 10 59 20 81 10 88 62 63 73 39 62 16 73Z" fill={`url(#${id}paper)`} stroke="#9e652b" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M35 10L39 62M59 20L63 73" stroke="#b38448" strokeWidth="2"/>
      <path d="M24 45Q34 27 48 43T74 31" fill="none" stroke="#ca6a2c" strokeWidth="2" strokeDasharray="4 3"/>
      <circle cx="61" cy="51" r="23" fill={`url(#${id}gold)`} stroke="#8f531c" strokeWidth="2"/>
      <circle cx="61" cy="51" r="18" fill="#fff2c1" stroke="#b5873a"/>
      <path d="M61 34L66 51 61 68 56 51Z" fill="#bd422e"/>
      <path d="M44 51L61 46 78 51 61 56Z" fill="#166882"/>
      <circle cx="61" cy="51" r="3" fill="#fff4b7"/>
    </>}
  </svg>;
}

export function StationExplorationTools({station,onOpenChange}:{station:Station;onOpenChange:(open:boolean)=>void}) {
  const [tool,setTool]=useState<'vr'|'map'|null>(null);
  const [vrIndex,setVrIndex]=useState(0);
  const [placeIndex,setPlaceIndex]=useState(0);
  const [frameFailed,setFrameFailed]=useState(false);
  const dialogRef=useRef<HTMLDivElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  const vrOptions=stationVrOptions(station);
  const places=stationMapPlaces(station);
  const selectedVr=vrOptions[vrIndex]||vrOptions[0];
  const points:GeoPoint[]=station.id==='g2-station-2'
    ? [{name:'Cù Lao Chàm',lat:15.950,lon:108.510,accuracy:'approximate'},{name:'Bán đảo Sơn Trà',lat:16.115,lon:108.295,accuracy:'approximate'}]
    : GEO_LESSON_POINTS[station.id]||[];
  const close=()=>setTool(null);
  useEffect(()=>{
    onOpenChange(tool!==null);
    return ()=>onOpenChange(false);
  },[tool,onOpenChange]);
  useEffect(()=>{
    if(!tool)return;
    const previous=document.activeElement as HTMLElement|null;
    closeRef.current?.focus({preventScroll:true});
    const keyboard=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setTool(null);}
      if(event.key==='Tab'){
        const focusable=Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button,a[href],iframe,[tabindex="0"]')||[]).filter(element=>!element.hasAttribute('disabled'));
        const first=focusable[0],last=focusable.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',keyboard);
    return ()=>{document.removeEventListener('keydown',keyboard);if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[tool]);
  useEffect(()=>{
    backgroundMusic.setForegroundSource('exploration-tool-vr',tool==='vr');
    return ()=>backgroundMusic.setForegroundSource('exploration-tool-vr',false);
  },[tool]);
  if(!vrOptions.length&&!places.length)return null;
  return <>
    <nav aria-label="Dụng cụ khám phá" className="station-tool-nav">
      {vrOptions.length>0&&<button type="button" className="station-tool-badge is-vr" aria-haspopup="dialog" aria-expanded={tool==='vr'} onClick={()=>{audioService.playSfx('click');setTool('vr');}}><ToolArtwork kind="vr"/><span>Khám phá 360°</span></button>}
      {places.length>0&&<button type="button" className="station-tool-badge is-map" aria-haspopup="dialog" aria-expanded={tool==='map'} onClick={()=>{audioService.playSfx('click');setTool('map');}}><ToolArtwork kind="map"/><span>Bản đồ</span></button>}
    </nav>
    {tool&&<div className="station-tool-backdrop" data-testid="exploration-backdrop" onClick={event=>{if(event.target===event.currentTarget)close();}}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="exploration-tool-title" className="station-tool-dialog">
        <header className="station-tool-dialog-header">
          <div><p className="text-xs font-bold text-amber-700">BỘ DỤNG CỤ KHÁM PHÁ</p><h2 id="exploration-tool-title" className="text-lg font-black text-sky-950 sm:text-2xl">{tool==='vr'?'Khám phá 360°':'Khám phá bản đồ'}</h2><p className="text-xs font-semibold text-slate-600">{station.titleVi}</p></div>
          <button ref={closeRef} type="button" onClick={close} className="station-tool-close" aria-label="Đóng dụng cụ khám phá"><X className="h-5 w-5"/><span>Đóng</span></button>
        </header>
        <div className="station-tool-dialog-content">
          {tool==='vr'&&selectedVr&&<>
            <div className="grid gap-2 sm:grid-cols-2">{vrOptions.map((option,index)=><button type="button" key={option.url} aria-pressed={vrIndex===index} className={`min-h-12 rounded-xl border-2 p-3 text-left font-bold ${vrIndex===index?'border-teal-500 bg-teal-50 text-teal-950':'border-amber-200 bg-white text-sky-950'}`} onClick={()=>{setVrIndex(index);setFrameFailed(false);}}>{option.label}</button>)}</div>
            {selectedVr.detail&&<p className="mt-3 text-sm text-slate-700">{selectedVr.detail}</p>}
            <a href={selectedVr.fallbackUrl||selectedVr.url} target="_blank" rel="noopener noreferrer" className="my-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-black text-white">Mở trải nghiệm 360° <ExternalLink className="h-4 w-4"/></a>
            {selectedVr.embedMode==='iframe'&&!frameFailed?<div className="space-y-2"><iframe key={selectedVr.url} title={selectedVr.label} src={selectedVr.url} className="h-[55dvh] min-h-[260px] w-full rounded-2xl border-0 bg-sky-50" allowFullScreen sandbox="allow-scripts allow-same-origin allow-popups allow-forms" onError={()=>setFrameFailed(true)}/><p className="text-xs text-slate-600">Nếu tour không hiện hoặc bị chặn trong khung, bấm “Mở trải nghiệm 360°” để xem ở tab mới.</p></div>:<div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 text-sm text-teal-950">Trải nghiệm này mở ở tab mới. Quay về tab bài học để tiếp tục đúng điểm em đang khám phá.</div>}
          </>}
          {tool==='map'&&places.length>0&&<>
            <div className="mb-4 flex flex-wrap gap-2">{places.map((place,index)=><button type="button" key={place} aria-pressed={placeIndex===index} onClick={()=>setPlaceIndex(index)} className={`min-h-11 rounded-xl border-2 px-4 py-2 text-sm font-bold ${placeIndex===index?'border-amber-500 bg-amber-100 text-amber-950':'border-amber-200 bg-white text-sky-950'}`}>{place}</button>)}</div>
            {points.length>0?<InteractiveGeoMap points={points} selected={placeIndex} onSelect={setPlaceIndex}/>:<iframe title={'Bản đồ '+places[placeIndex]} src={`https://maps.google.com/maps?q=${encodeURIComponent(places[placeIndex])}&output=embed`} className="h-[50dvh] min-h-[260px] w-full rounded-2xl border-0"/>}
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(places[placeIndex])}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">Xem vị trí trên Google Maps <ExternalLink className="h-4 w-4"/></a>
            <p className="mt-3 text-xs text-slate-600">Vị trí tham khảo để tìm hiểu bài học; đối chiếu bản đồ trước khi dùng để dẫn đường.</p>
          </>}
        </div>
      </div>
    </div>}
  </>;
}
