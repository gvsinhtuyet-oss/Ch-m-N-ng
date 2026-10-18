import type { StudentStationProgress } from '../../types';

// Viewing an earlier stage must not revoke stages already earned.
export function unlockedStage(progress: Pick<StudentStationProgress,
  'stationCompleted' | 'stampReceived' | 'stage1Completed' | 'stage2Completed' | 'stage3Completed'>): number {
  if (progress.stationCompleted || progress.stampReceived) return 4;
  if (!progress.stage1Completed) return 1;
  if (!progress.stage2Completed) return 2;
  return progress.stage3Completed ? 4 : 3;
}

export function allHotspotsAnswered(required:readonly {id:string}[],answered:readonly string[]):boolean {
  return required.length>0&&required.every(h=>answered.includes(h.id));
}

export function visibleStage(requested:number,progress:Parameters<typeof unlockedStage>[0],sessionUnlocked=1):number {
  return Math.max(1,Math.min(requested,4,Math.max(unlockedStage(progress),sessionUnlocked)));
}
