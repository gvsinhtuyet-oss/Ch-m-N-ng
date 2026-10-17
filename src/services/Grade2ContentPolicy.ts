import type {Station} from '../types';
import type {StationContent} from './ContentService';
import {GRADE2_MEDIA_REVISION,LEGACY_GRADE2_MEDIA_URLS} from '../data/grade2Media';

// Pure compatibility check: no storage writes, migrations or remote requests.
export function currentGrade2Content(station:Station,content:StationContent):StationContent{
 if(station.grade!==2||content.contentRevision===station.version.version)return content;
 const ids=new Set(content.hotspots.map(h=>h.id));
 const differentPoints=ids.size!==station.hotspots.length||station.hotspots.some(h=>!ids.has(h.id));
 const scaffold=content.hotspots.some(h=>/Giới thiệu bài học:|Nội dung đang được hoàn thiện|Ban biên soạn cập nhật/.test(h.titleVi+' '+h.narrationVi));
 if(differentPoints||scaffold)return {contentRevision:station.version.version,coverImage:station.coverImage,mapImage:station.journeyMap?.image||'',hotspots:station.hotspots,resources:content.resources};
 if(station.version.version!==GRADE2_MEDIA_REVISION)return content;
 const custom=(url:string)=>!!url&&!LEGACY_GRADE2_MEDIA_URLS.includes(url)&&!/^https:\/\/images\.unsplash\.com\//i.test(url);
 return {contentRevision:station.version.version,coverImage:custom(content.coverImage)?content.coverImage:station.coverImage,mapImage:custom(content.mapImage)?content.mapImage:station.journeyMap?.image||'',resources:content.resources,
  hotspots:station.hotspots.map(h=>{const edited=content.hotspots.find(x=>x.id===h.id)!;return custom(edited.image)?edited:{...edited,image:h.image,mediaCredit:h.mediaCredit,mediaRights:h.mediaRights,sources:h.sources};})};
}
