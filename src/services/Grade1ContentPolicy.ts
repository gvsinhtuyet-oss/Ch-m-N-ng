import type {Station} from '../types';
import type {StationContent} from './ContentService';
export const GRADE1_REVISION='4.2.0-grade1-textbook-complete';
// Pure in-memory compatibility policy. Never writes or migrates server records.
export function currentGrade1Content(station:Station,content:StationContent):StationContent{
 if(station.grade!==1||station.version.version!==GRADE1_REVISION||content.contentRevision===GRADE1_REVISION)return content;
 // Retain saved media only for a genuinely corresponding point; discard scaffold rows.
 const placeholder=content.hotspots.some(h=>/Giới thiệu bài học:|Nội dung đang được hoàn thiện|Ban biên soạn cập nhật/.test(h.titleVi+' '+h.narrationVi));
 const usableMedia=(url:string)=>!!url&&!/images\.unsplash\.com|commons\.wikimedia\.org\/wiki\/Special:FilePath|\/learning\/grade1\/.*\.svg(?:\?|$)/i.test(url);
 return {contentRevision:GRADE1_REVISION,coverImage:!placeholder&&usableMedia(content.coverImage)?content.coverImage:station.coverImage,mapImage:!placeholder&&usableMedia(content.mapImage)?content.mapImage:station.journeyMap?.image||'',resources:content.resources,
 hotspots:station.hotspots.map(h=>{const old=!placeholder?content.hotspots.find(x=>x.id===h.id):undefined;return old&&usableMedia(old.image)?{...h,image:old.image,mediaCredit:old.mediaCredit||'Ảnh do giáo viên cung cấp.',mediaRights:old.mediaRights,sources:old.sources||h.sources}:h;})};
}
