import type { ExplorationHotspot, Station } from '../../types';
import { stage1Narration } from './stage1Narration';

// Compatibility for existing callers; the single manifest owns every URL.
export function gradeOneNarration(station: Station, point: ExplorationHotspot, language: string): string | undefined {
  return station.grade === 1 ? stage1Narration(station, point, language) : undefined;
}
