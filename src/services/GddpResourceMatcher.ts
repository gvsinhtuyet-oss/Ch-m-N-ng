import { Station, ExplorationHotspot } from '../types';
import { GddpRecord } from './GddpService';

// Editorially reviewed topic-to-station candidates from the bundled integration
// addresses. These are TOPIC links only; teachers must review the actual
// hotspot and current textbook placement. Never infer a precise SGK page.
export const CURATED_TOPIC_STATIONS:Readonly<Record<string,string>>=Object.freeze({
 'gddp-2026-1-01':'g1-station-2',
 'gddp-2026-1-10':'g1-station-2',
 'gddp-2026-1-11':'g1-station-1',
 'gddp-2026-1-12':'g1-station-4',
 'gddp-2026-1-13':'g1-station-5',
 'gddp-2026-2-01':'g2-station-3',
 'gddp-2026-2-02':'g2-station-2',
 'gddp-2026-2-03':'g2-station-5',
 'gddp-2026-2-04':'g2-station-4',
 'gddp-2026-2-05':'g2-station-5',
 'gddp-2026-2-07':'g2-station-1',
 'gddp-2026-2-08':'g2-station-3',
 'gddp-2026-3-01':'g3-station-1',
 'gddp-2026-3-02':'g3-station-1',
 'gddp-2026-3-03':'g3-station-4',
 'gddp-2026-3-04':'g3-station-1',
 'gddp-2026-3-05':'g3-station-3',
 'gddp-2026-3-06':'g3-station-5',
 'gddp-2026-3-07':'g3-station-2',
 'gddp-2026-3-08':'g3-station-5',
 'gddp-2026-3-09':'g3-station-2',
 'gddp-2026-3-10':'g3-station-3',
 'gddp-2026-4-04':'g4-station-1',
 'gddp-2026-4-05':'g4-thu-bon-hon-kem',
 'gddp-2026-4-06':'g4-station-2',
 'gddp-2026-4-07':'g4-station-4',
 'gddp-2026-4-09':'g4-station-3',
 'gddp-2026-5-03':'g5-station-4',
 'gddp-2026-5-08':'g5-ky-anh-me-nhu'
});
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
    if (station.grade!==row.grade) continue;
    const curatedStation=CURATED_TOPIC_STATIONS[row.id]===station.id;
    // An explicitly curated topic is a candidate, not institutional verification.
    // Do not show incomplete placeholder lessons or empty narration.
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
      if(explicitlyLinked || automatic || curatedStation)
        matched.push({station,hotspot,reason:explicitlyLinked?'Được Admin liên kết':curatedStation?'Gợi ý theo chủ đề; giáo viên cần duyệt':'Khớp chủ đề học liệu'});
    }
  }
  return matched;
}
