import {REAL_PHOTOS} from '../data/realPhotos';
import React from 'react';
import {grade5PhotoReferenceForSrc} from '../data/grade5PhotoReferences';
import {grade5MediaBySrc} from '../data/grade5Media';
import {grade4PhotoReferenceForSrc} from '../data/grade4PhotoReferences';
import {grade3PhotoReferenceForSrc} from '../data/grade3PhotoReferences';
import {grade3MediaBySrc} from '../data/grade3Media';
import {grade45MediaBySrc} from '../data/grade45Media';
import {grade1MediaBySrc} from '../data/grade1Media';
export function LearningMediaCredit({src,credit}:{src:string;credit?:string}){
 const real=REAL_PHOTOS.find(p=>p.src===src);
 if(real)return <span>{real.subject} · {real.author} · {real.license}{'licenseUrl' in real&&typeof real.licenseUrl==='string'&&<> · <a href={real.licenseUrl} target="_blank" rel="noopener noreferrer">Giấy phép</a></>} · <a href={real.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn ảnh</a></span>;
 const grade1=grade1MediaBySrc(src);
 if(grade1){
  if(grade1.kind==='illustration')return <span className="block break-words [overflow-wrap:anywhere]">{grade1.caption} <span className="block">{grade1.author} · {grade1.changes}</span>{grade1.id.startsWith('stream-')&&<span className="mt-2 block rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-emerald-950"><strong>Ảnh thực tế Suối Tiên (xã Quế Sơn Trung): </strong><a className="font-semibold underline" href="https://baodanang.vn/suoi-tien-moi-goi-3325573.html" target="_blank" rel="noopener noreferrer">Xem ảnh thác và rừng tại Báo Đà Nẵng (Duy Thái, 25/02/2026)</a>. <span className="block text-xs">Ảnh tư liệu nằm trên trang báo; tranh đang hiển thị chỉ là minh họa, không phải ảnh địa danh.</span></span>}</span>;
  return <span className="block break-words [overflow-wrap:anywhere]">{grade1.caption} <span className="block">{grade1.author} · {grade1.date} · {grade1.changes}</span><a className="underline" href={grade1.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn ảnh</a>{' · '}<a className="underline" href={grade1.licenseUrl} target="_blank" rel="noopener noreferrer">{grade1.license}</a></span>;
 }
 const media=grade3MediaBySrc(src)||grade45MediaBySrc(src)||grade5MediaBySrc(src);
 if(!media){const reference=grade3PhotoReferenceForSrc(src)||grade4PhotoReferenceForSrc(src)||grade5PhotoReferenceForSrc(src);return <span className="block break-words [overflow-wrap:anywhere]">{credit||'Sơ đồ minh họa học tập.'}{reference&&<span className="mt-1 block"><a className="font-semibold underline" href={reference.sourceUrl} target="_blank" rel="noopener noreferrer">Xem ảnh thật tại nguồn: {reference.title}</a><span className="block">{reference.publisher} · {reference.credit} · {reference.date}. {reference.selection} {reference.scope} Xem cùng thầy cô.</span></span>}</span>;}
 return <span className="block break-words [overflow-wrap:anywhere]">{media.caption} <span className="block">{media.author} · {media.date} · {media.changes}</span><a className="underline" href={media.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn ảnh</a>{' · '}<a className="underline" href={media.licenseUrl} target="_blank" rel="noopener noreferrer">{media.license==='PUBLIC_DOMAIN'?'Phạm vi công cộng (theo hồ sơ nguồn)':media.license}</a></span>;
}
