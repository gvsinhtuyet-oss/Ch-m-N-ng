import type {Station} from '../types';
import type {StationContent} from './ContentService';

// Replace only recognizable old scaffolds/topics. Keep same-point teacher edits.
// This compatibility check never writes to local storage or the server.
export function currentGrade2Content(station:Station,content:StationContent):StationContent{
 if(station.grade!==2||content.contentRevision===station.version.version)return content;
 const ids=new Set(content.hotspots.map(h=>h.id));
 const differentPoints=ids.size!==station.hotspots.length||station.hotspots.some(h=>!ids.has(h.id));
 const scaffold=content.hotspots.some(h=>/Giới thiệu bài học:|Nội dung đang được hoàn thiện|Ban biên soạn cập nhật/.test(h.titleVi+' '+h.narrationVi));
 if(!differentPoints&&!scaffold)return content;
 return {contentRevision:station.version.version,coverImage:station.coverImage,mapImage:station.journeyMap?.image||'',hotspots:station.hotspots,resources:content.resources};
}
