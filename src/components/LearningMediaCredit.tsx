import React from 'react';
import {grade3MediaBySrc} from '../data/grade3Media';
import {grade45MediaBySrc} from '../data/grade45Media';
import {grade1MediaBySrc} from '../data/grade1Media';
export function LearningMediaCredit({src,credit}:{src:string;credit?:string}){
 const grade1=grade1MediaBySrc(src);
 if(grade1){
  if(grade1.kind==='illustration')return <span className="block break-words [overflow-wrap:anywhere]">{grade1.caption} <span className="block">{grade1.author} · {grade1.changes}</span>{grade1.id.startsWith('stream-')&&<a className="underline" href="https://vietnamtourism.vn/index.php/tourism/items/1056/5" target="_blank" rel="noopener noreferrer">Xem ảnh thật Suối Tiên tại nguồn Cục Du lịch</a>}</span>;
  return <span className="block break-words [overflow-wrap:anywhere]">{grade1.caption} <span className="block">{grade1.author} · {grade1.date} · {grade1.changes}</span><a className="underline" href={grade1.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn ảnh</a>{' · '}<a className="underline" href={grade1.licenseUrl} target="_blank" rel="noopener noreferrer">{grade1.license}</a></span>;
 }
 const media=grade3MediaBySrc(src)||grade45MediaBySrc(src);
 if(!media)return <span className="break-words [overflow-wrap:anywhere]">{credit||'Sơ đồ minh họa học tập.'}</span>;
 return <span className="block break-words [overflow-wrap:anywhere]">{media.caption} <span className="block">{media.author} · {media.date} · {media.changes}</span><a className="underline" href={media.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn ảnh</a>{' · '}<a className="underline" href={media.licenseUrl} target="_blank" rel="noopener noreferrer">{media.license==='PUBLIC_DOMAIN'?'Phạm vi công cộng (theo hồ sơ nguồn)':media.license}</a></span>;
}
