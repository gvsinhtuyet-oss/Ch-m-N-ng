import type {Station} from '../types';
import type {StationContent} from './ContentService';
import {realPointPhoto,realCoverPhoto} from '../data/realPhotos';
// Replace only shipped media. Retain teacher-uploaded photos and all teaching text.
const builtin=(src:string)=>/^\/(?:learning\/|images\/real-photos\/)/.test(src)||/^https:\/\/culaochamtour\.com\/wp-content\/uploads\/2021\/10\/suoi-tien-que-son-quang-nam(?:-a)?-1024x(?:438|401)\.jpg$/.test(src)||src.startsWith('https://bqn.1cdn.vn/2023/10/29/')||src.startsWith('https://commons.wikimedia.org/wiki/Special:FilePath/My%20Son%20Sanctuary');
export function currentRealPhotos(station:Station,content:StationContent):StationContent{
 const cover=realCoverPhoto(station.id);
 return {...content,coverImage:cover&&builtin(content.coverImage)?cover.src:content.coverImage,
 hotspots:content.hotspots.map(h=>{
  const index=station.hotspots.findIndex(p=>p.id===h.id);
  const photo=realPointPhoto(station.id,index);
  return photo&&builtin(h.image)?{...h,image:photo.src,mediaCredit:photo.credit,sources:[...new Set([...(h.sources||[]),photo.sourceUrl])]}:h;
 })};
}
