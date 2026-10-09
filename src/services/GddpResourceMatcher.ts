import { Station, ExplorationHotspot } from '../types';
import { GddpRecord } from './GddpService';

// Only specific place/topic phrases are eligible. General words such as
// Đà Nẵng, quê hương, học sinh, địa phương cannot justify a match.
const COMMON = new Set('đà nẵng địa phương quê hương học sinh giáo viên bài học hoạt động tìm hiểu giới thiệu khám phá truyền thống thành phố việt nam các những được trong cho của một và với về đến từ trên tại theo cảnh đẹp em'.split(' '));
const norm = (s: string) => s.normalize('NFC').toLocaleLowerCase('vi-VN')
  .replace(/[.,;:!?()\[\]{}\-–—“”"'/\\\d]+/g,' ').replace(/\s+/g,' ').trim();
const meaningful = (value:string) => norm(value).split(' ').filter(w => w.length > 2 && !COMMON.has(w));
const eligible = (hotspot:ExplorationHotspot) => Boolean(hotspot.titleVi?.trim() && hotspot.image?.trim() &&
  hotspot.narrationVi?.trim() && !/đang được hoàn thiện|đang cập nhật|giới thiệu bài học/i.test(hotspot.narrationVi));
export interface MatchedLessonResource { station:Station; hotspot:ExplorationHotspot; reason:string; }
// Deterministic no-AI filtering. Only same grade, verified station and approved
// hotspot IDs OR strong distinct named-topic overlap. Never show all hotspots.
export function matchGddpResources(row:GddpRecord, stations:Station[]):MatchedLessonResource[] {
  const topic=norm(row.content+' '+row.lesson);
  const sourceTokens=new Set(meaningful(row.content+' '+row.lesson));
  const links = row.resourceLinks || [];
  const matched:MatchedLessonResource[]=[];
  for (const station of stations) {
    if (station.grade!==row.grade || !station.isFullyVerified) continue;
    for (const hotspot of station.hotspots) {
      if (!eligible(hotspot)) continue;
      const explicitlyLinked=links.some(link=>link.stationId===station.id && link.hotspotId===hotspot.id);
      const cleanTitle=hotspot.titleVi.replace(/^\s*\d+[.)]\s*/, '').trim();
      const titleTokens=[...new Set(meaningful(cleanTitle))];
      const overlap=titleTokens.filter(token=>sourceTokens.has(token));
      // Require a named hotspot title (2+ meaningful terms) appearing
      // almost wholly in the lesson, not merely shared city/generic words.
      const automatic=links.length===0 && titleTokens.length>=2 && overlap.length>=2 &&
        overlap.length >= Math.ceil(titleTokens.length*0.8) &&
        (topic.includes(norm(cleanTitle)) || overlap.length>=3);
      if(explicitlyLinked || automatic)
        matched.push({station,hotspot,reason:explicitlyLinked?'Được Admin liên kết':'Khớp chủ đề học liệu'});
    }
  }
  return matched;
}
