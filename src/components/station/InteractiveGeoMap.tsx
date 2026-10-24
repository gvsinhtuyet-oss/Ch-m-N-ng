import React, {useMemo, useState} from 'react';

export type GeoPoint = {name:string;lat:number;lon:number;description?:string;accuracy:'approximate'|'verified'};
type Props={points:GeoPoint[];selected:number;onSelect:(index:number)=>void};
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));
const tileCoord=(lat:number,lon:number,z:number)=>{
 const n=2**z, sin=Math.sin(clamp(lat,-85,85)*Math.PI/180);
 return {x:(lon+180)/360*n,y:(1-Math.log((1+sin)/(1-sin))/Math.PI)/2*n};
};
export const InteractiveGeoMap:React.FC<Props>=({points,selected,onSelect})=>{
 const [zoom,setZoom]=useState(11);
 const [tileFailures,setTileFailures]=useState(0);
 const [forceFallback,setForceFallback]=useState(false);

 const point=points[clamp(selected,0,points.length-1)];
 const center=tileCoord(point.lat,point.lon,zoom);
 const tiles=useMemo(()=>{
  const cx=Math.floor(center.x),cy=Math.floor(center.y),out:{x:number;y:number;left:number;top:number}[]=[];
  for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){
   const x=cx+dx,y=cy+dy;
   if(y<0||y>=2**zoom)continue;
   out.push({x:(x+2**zoom)%(2**zoom),y,left:450+(x-center.x)*256-128,top:220+(y-center.y)*256-128});
  }
  return out;
 },[point.lat,point.lon,zoom]);
 const showFallback=forceFallback||tileFailures>=8;
 return <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white">
  <div className="flex flex-wrap items-center justify-between gap-2 bg-sky-50 p-3">
   <strong className="text-sm text-sky-950">🌍 Bản đồ địa lý tương tác</strong>
   <div className="flex gap-2">
    <button type="button" onClick={()=>setZoom(z=>clamp(z-1,7,17))} aria-label="Thu nhỏ bản đồ" className="rounded-lg bg-white px-4 py-2 font-black shadow">−</button>
    <button type="button" onClick={()=>setZoom(z=>clamp(z+1,7,17))} aria-label="Phóng to bản đồ" className="rounded-lg bg-white px-4 py-2 font-black shadow">+</button>
   </div>
  </div>
  <div role="img" aria-label={`Bản đồ địa lý khu vực ${point.name}`} className="relative h-[350px] overflow-hidden bg-gradient-to-br from-[#c7e9f3] via-[#d6ead2] to-[#f5e9d4]">
   {!showFallback && <div className="absolute left-1/2 top-1/2 h-[440px] w-[900px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
    {tiles.map(t=><img key={zoom+'-'+t.x+'-'+t.y} src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`} alt="" loading="eager" onError={()=>setTileFailures(v=>v+1)} className="absolute h-64 w-64 max-w-none" style={{left:t.left,top:t.top}}/>)}
   </div>}
   {showFallback && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-slate-700"><span className="text-5xl">🧭</span><strong>Chế độ dự phòng</strong><p className="text-sm">Không tải được lớp bản đồ nền. Danh sách địa danh và tọa độ vẫn có thể sử dụng.</p><button type="button" onClick={()=>{setTileFailures(0);setForceFallback(false)}} className="rounded-lg bg-white px-4 py-2 text-sm font-bold">Thử tải lại bản đồ</button></div>}
   <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full text-4xl drop-shadow-lg">📍</div>
   <div className="absolute bottom-3 left-3 right-3 z-10 rounded-xl bg-white/95 p-3 text-center text-sm font-black text-slate-900 shadow">{point.name}{point.accuracy==='approximate'?' • Tọa độ tham khảo':''}</div>
  </div>
  <div className="flex flex-wrap gap-2 p-3">{points.map((p,i)=><button type="button" key={p.name} onClick={()=>{onSelect(i);setTileFailures(0);setTilesLoaded(0)}} aria-pressed={i===selected} className={`rounded-xl px-3 py-2 text-xs font-bold ${i===selected?'bg-blue-700 text-white':'bg-slate-100 text-slate-800'}`}>📍 {p.name}</button>)}</div>
  <p className="px-3 pb-3 text-[11px] text-slate-500">Nền bản đồ © OpenStreetMap contributors. Phóng to/thu nhỏ bằng +/−. Khi mất mạng, các điểm vẫn được giữ. Tọa độ tham khảo không dùng để dẫn đường.</p>
 </section>;
};
