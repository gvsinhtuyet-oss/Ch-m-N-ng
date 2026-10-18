import type {Station} from '../types';
import type {StationContent} from './ContentService';
export const GRADE3_REVISION='3.0.1-grade3-review';
// Revision compatibility only, in memory. Stored payloads are never modified.
export function currentGrade3Content(station:Station,content:StationContent):StationContent{
 if(station.grade!==3||station.version.version!==GRADE3_REVISION||content.contentRevision===GRADE3_REVISION)return content;
 if(content.contentRevision==='3.0.0-grade3-source')return {...content,contentRevision:GRADE3_REVISION,hotspots:content.hotspots.map(h=>{const reviewed=station.hotspots.find(p=>p.id===h.id);return reviewed?{...h,narrationVi:h.narrationVi.replace('Đề cương cô cung cấp giới thiệu Nhà lưu niệm Huỳnh Thúc Kháng tại xã Thạnh Bình, thành phố Đà Nẵng.','Nhà lưu niệm Huỳnh Thúc Kháng nằm tại xã Thạnh Bình, thành phố Đà Nẵng.'),sources:[...new Set([...(h.sources||[]),...(reviewed.sources||[])])]}:h;})};
 return {contentRevision:GRADE3_REVISION,coverImage:station.coverImage,mapImage:station.journeyMap?.image||'',hotspots:station.hotspots,resources:content.resources};
}
