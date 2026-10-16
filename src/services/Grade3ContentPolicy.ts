import type {Station} from '../types';
import type {StationContent} from './ContentService';
export const GRADE3_REVISION='3.0.0-grade3-source';
// Revision compatibility only, in memory. Stored payloads are never modified.
export function currentGrade3Content(station:Station,content:StationContent):StationContent{
 if(station.grade!==3||station.version.version!==GRADE3_REVISION||content.contentRevision===GRADE3_REVISION)return content;
 return {contentRevision:GRADE3_REVISION,coverImage:station.coverImage,mapImage:station.journeyMap?.image||'',hotspots:station.hotspots,resources:content.resources};
}
