import recordings from '../../data/stage1Recordings.json';
import type { ExplorationHotspot, Station } from '../../types';

const byPoint = new Map(recordings.map(recording => [recording.pointId, recording]));

export function stage1Narration(station: Station, point: ExplorationHotspot, language: string): string | undefined {
  if (language === 'en' && point.narrationEn) return undefined;
  const recording = byPoint.get(point.id);
  // Admin edits must never play an older recording with different words.
  if (!recording || recording.stationId !== station.id || recording.grade !== station.grade || recording.narration !== point.narrationVi) return undefined;
  return recording.src;
}
