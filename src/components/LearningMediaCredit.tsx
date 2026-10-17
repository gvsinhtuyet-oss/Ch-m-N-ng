import React from 'react';
import {grade45MediaBySrc} from '../data/grade45Media';
export function LearningMediaCredit({src,credit}:{src:string;credit?:string}){
 const media=grade45MediaBySrc(src);
 if(!media)return <span className="break-words [overflow-wrap:anywhere]">{credit||'Sơ đồ minh họa học tập.'}</span>;
 return <span className="block break-words [overflow-wrap:anywhere]">{media.caption} <span className="block">{media.author} · {media.date} · {media.changes}</span><a className="underline" href={media.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn ảnh</a>{' · '}<a className="underline" href={media.licenseUrl} target="_blank" rel="noopener noreferrer">{media.license==='PUBLIC_DOMAIN'?'Tác giả phát hành vào phạm vi công cộng':media.license}</a></span>;
}
