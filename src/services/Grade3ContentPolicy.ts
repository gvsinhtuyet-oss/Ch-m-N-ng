import type {Station} from '../types';
import type {StationContent} from './ContentService';
import {GRADE3_MEDIA_PREVIOUS_NARRATIONS} from '../data/grade3MediaPreviousNarrations';
import {GRADE3_PREVIOUS_NARRATIONS} from '../data/grade3PreviousNarrations';
export const GRADE3_REVISION='3.1.1-grade3-photo-sources';
// Compatibility is in memory only; no storage writes, downloads, or database migrations.
const oldBuiltin=(src:string)=>/^\/learning\/grade3\/g3-station-[1-5]-(?:cover|point-[1-4])\.svg$/.test(src);
export function currentGrade3Content(station:Station,content:StationContent):StationContent{
 if(station.grade!==3||station.version.version!==GRADE3_REVISION||content.contentRevision===GRADE3_REVISION)return content;
 if(['3.0.0-grade3-source','3.0.1-grade3-review','3.0.2-grade3-review','3.1.0-grade3-media'].includes(content.contentRevision||''))return {
  ...content,contentRevision:GRADE3_REVISION,
  coverImage:oldBuiltin(content.coverImage)?station.coverImage:content.coverImage,
  hotspots:content.hotspots.map(h=>{
   const reviewed=station.hotspots.find(p=>p.id===h.id);if(!reviewed)return h;
   const replacePhoto=oldBuiltin(h.image)&&h.image!==reviewed.image;
   return {...h,
    ...(replacePhoto?{image:reviewed.image,mediaRights:reviewed.mediaRights,mediaCredit:reviewed.mediaCredit}:{}),
    interaction:['Vì sao không thể trộn cá và muối rồi đóng chai dùng ngay?','Bước nào giúp các nan trở thành thân thúng?','Cách nói nào phù hợp khi xem một ảnh sinh hoạt?'].includes(h.interaction?.questionVi||'')?reviewed.interaction:h.interaction,
    narrationVi:(h.narrationVi===GRADE3_PREVIOUS_NARRATIONS[h.id]||h.narrationVi===GRADE3_MEDIA_PREVIOUS_NARRATIONS[h.id])?reviewed.narrationVi:h.narrationVi.replace('Đề cương cô cung cấp giới thiệu Nhà lưu niệm Huỳnh Thúc Kháng tại xã Thạnh Bình, thành phố Đà Nẵng.','Nhà lưu niệm Huỳnh Thúc Kháng nằm tại xã Thạnh Bình, thành phố Đà Nẵng.'),
    sources:[...new Set([...(h.sources||[]),...(reviewed.sources||[])])]
   };
  })
 };
 return {contentRevision:GRADE3_REVISION,coverImage:station.coverImage,mapImage:station.journeyMap?.image||'',hotspots:station.hotspots,resources:content.resources};
}
