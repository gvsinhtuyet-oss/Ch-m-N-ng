import type {Station} from '../types';
import type {StationContent} from './ContentService';
export const GRADE45_REVISION='3.0.0-grade45-source';
// Revision compatibility only, in memory. Stored payloads are never modified.
export function currentGrade45Content(station:Station,content:StationContent):StationContent{
 if((station.grade!==4&&station.grade!==5)||station.version.version!==GRADE45_REVISION||content.contentRevision===GRADE45_REVISION)return content;
 return {contentRevision:GRADE45_REVISION,coverImage:station.coverImage,mapImage:station.journeyMap?.image||'',hotspots:station.hotspots,resources:content.resources};
}
