import type { StudentStationProgress } from '../../types';

// Viewing an earlier stage must not revoke stages already earned.
export function unlockedStage(progress: Pick<StudentStationProgress,
  'stationCompleted' | 'stampReceived' | 'stage1Completed' | 'stage2Completed' | 'stage3Completed'>): number {
  if (progress.stationCompleted || progress.stampReceived) return 4;
  if (!progress.stage1Completed) return 1;
  if (!progress.stage2Completed) return 2;
  return progress.stage3Completed ? 4 : 3;
}
