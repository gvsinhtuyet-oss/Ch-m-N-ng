import { GRADE1_CONTENT } from '../../data/grade1Content';
import type { ExplorationHotspot, Station } from '../../types';

// Only use recordings when their reviewed text and stable point ID still match.
export function gradeOneNarration(station: Station, point: ExplorationHotspot, language: string): string | undefined {
  if (station.grade !== 1 || (language === 'en' && point.narrationEn)) return undefined;
  const number = Number(station.id.match(/^g1-station-(\d)$/)?.[1]);
  const lesson = GRADE1_CONTENT.find(item => item.id === station.id);
  const index = lesson?.points.findIndex(item => item.id === point.id && item.narration === point.narrationVi) ?? -1;
  if (!Number.isInteger(number) || number < 1 || number > 5 || index < 0 || index > 3) return undefined;
  return `/audio/stage1/grade1/g1-${number}-${index+1}.mp3`;
}
