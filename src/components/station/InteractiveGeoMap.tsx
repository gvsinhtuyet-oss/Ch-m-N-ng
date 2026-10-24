import React,{useState} from 'react';

export type GeoPoint = {name:string;lat:number;lon:number;description?:string;accuracy:'approximate'|'verified'};
type Props={points:GeoPoint[];selected:number;onSelect:(index:number)=>void};
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));

/** Keep the map inside the lesson: Google Maps' public embed view needs no new tab. */
export const InteractiveGeoMap:React.FC<Props>=({points,selected,onSelect})=>{
 const [zoom,setZoom]=useState(13);
 const [reload,setReload]=useState(0);
 const point=points[clamp(selected,0,points.length-1)];
 if(!point)return null;
 const query=encodeURIComponent(point.name);
 const url=`https://maps.google.com/maps?q=${query}&z=${zoom}&output=embed&hl=vi`;
 return <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white">
  <div className="flex flex-wrap items-center justify-between gap-2 bg-sky-50 p-3">
   <strong className="text-sm text-sky-950">🌍 Bản đồ Google Maps trong ứng dụng</strong>
   <div className="flex gap-2">
    <button type="button" onClick={()=>setZoom(z=>clamp(z-1,5,18))} aria-label="Thu nhỏ bản đồ" className="rounded-lg bg-white px-4 py-2 font-black shadow">−</button>
    <button type="button" onClick={()=>setZoom(z=>clamp(z+1,5,18))} aria-label="Phóng to bản đồ" className="rounded-lg bg-white px-4 py-2 font-black shadow">+</button>
    <button type="button" onClick={()=>setReload(n=>n+1)} className="rounded-lg bg-white px-3 py-2 text-xs font-bold shadow">Tải lại</button>
   </div>
  </div>
  <iframe key={url+'-'+reload} title={`Bản đồ ${point.name}`} src={url} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[50dvh] min-h-[320px] w-full border-0 bg-sky-50" allowFullScreen />
  <div className="flex flex-wrap gap-2 p-3">{points.map((p,i)=><button type="button" key={p.name} onClick={()=>onSelect(i)} aria-pressed={i===selected} className={`rounded-xl px-3 py-2 text-xs font-bold ${i===selected?'bg-blue-700 text-white':'bg-slate-100 text-slate-800'}`}>📍 {p.name}</button>)}</div>
  <p className="px-3 pb-3 text-[11px] text-slate-500">Bản đồ được nhúng từ Google Maps và cần Internet. Địa danh có thể là vị trí tham khảo; không sử dụng để dẫn đường khi chưa đối chiếu.</p>
 </section>;
};
