import React,{useState} from 'react';
import {learningThumbnail} from '../utils/learningThumbnail';

type Props=React.ImgHTMLAttributes<HTMLImageElement>&{honestFallback?:boolean;thumbnail?:boolean};
// Callers key this component by point and source so an old load failure cannot
// leak into the next point. Never present a different place as the missing photo.
export function LearningImage({honestFallback=false,thumbnail=false,onError,...props}:Props){
 const [failed,setFailed]=useState(false);
 if(failed&&honestFallback)return <span role="img" aria-label={`Chưa tải được ảnh: ${props.alt||'điểm học'}`} className={`${props.className||''} flex items-center justify-center bg-slate-100 p-2 text-center text-xs font-semibold text-slate-600`}><span>Chưa tải được ảnh<span className="block text-[10px] font-normal">{props.alt}</span></span></span>;
 return <img loading={thumbnail ? 'lazy' : undefined} decoding="async" {...props} src={thumbnail && props.src ? learningThumbnail(props.src) : props.src} onError={event=>{if(thumbnail && props.src && event.currentTarget.getAttribute('src') !== props.src){event.currentTarget.src=props.src;return;}if(honestFallback)setFailed(true);else onError?.(event);}}/>;
}
