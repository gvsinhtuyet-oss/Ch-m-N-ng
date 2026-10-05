import { StudentStationProgress, StudentCheckInResponse } from '../types';

const PROGRESS_STORAGE_KEY = 'cham_danang_progress_v2';
const SYNC_QUEUE_KEY = 'cham_danang_sync_queue_v2';

export interface GradeSummary {
  grade: number;
  totalStations: number;
  completedStations: number;
  totalStamps: number;
  totalRewards: number;
}

class ProgressService {
  private memoryCache: Map<string, StudentStationProgress> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        const parsed: Record<string, StudentStationProgress> = JSON.parse(raw);
        Object.entries(parsed).forEach(([key, val]) => {
          this.memoryCache.set(key, val);
        });
      }
    } catch (e) {
      console.warn('Could not load progress from storage:', e);
    }
  }

  private saveToStorage() {
    try {
      const obj: Record<string, StudentStationProgress> = {};
      this.memoryCache.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn('Could not save progress to storage:', e);
    }
  }

  private getCompositeKey(studentId: string, stationId: string): string {
    return `${studentId}:::${stationId}`;
  }

  public getStationProgress(studentId: string, stationId: string): StudentStationProgress {
    const key = this.getCompositeKey(studentId, stationId);
    const existing = this.memoryCache.get(key);
    if (existing) {
      return { ...existing };
    }

    const initial: StudentStationProgress = {
      studentId,
      stationId,
      stage1Completed: false,
      stage2Completed: false,
      stage3Completed: false,
      stage4Completed: false,
      stationCompleted: false,
      exploredHotspotIds: [],
      rewardsCollected: [],
      stampReceived: false,
      lastVisitedAt: new Date().toISOString(),
      syncStatus: 'local_only',
    };
    return initial;
  }

  public startStation(studentId: string, stationId: string): StudentStationProgress {
    const current = this.getStationProgress(studentId, stationId);
    if (!current.startedAt) {
      current.startedAt = new Date().toISOString();
    }
    current.lastVisitedAt = new Date().toISOString();
    const key = this.getCompositeKey(studentId, stationId);
    this.memoryCache.set(key, current);
    this.saveToStorage();
    return { ...current };
  }

  public completeHotspot(studentId: string, stationId: string, hotspotId: string): StudentStationProgress {
    const current = this.getStationProgress(studentId, stationId);
    if (!current.exploredHotspotIds.includes(hotspotId)) {
      current.exploredHotspotIds.push(hotspotId);
    }
    current.lastVisitedAt = new Date().toISOString();
    const key = this.getCompositeKey(studentId, stationId);
    this.memoryCache.set(key, current);
    this.saveToStorage();
    return { ...current };
  }

  public completeStage1(studentId: string, stationId: string, rewardId?: string): StudentStationProgress {
    const current = this.getStationProgress(studentId, stationId);
    current.stage1Completed = true;
    if (rewardId && !current.rewardsCollected.includes(rewardId)) {
      current.rewardsCollected.push(rewardId);
    }
    current.lastVisitedAt = new Date().toISOString();
    const key = this.getCompositeKey(studentId, stationId);
    this.memoryCache.set(key, current);
    this.saveToStorage();
    this.queueSyncEvent(studentId, stationId, 'STAGE1_COMPLETED');
    return { ...current };
  }

  public claimReward(studentId: string, stationId: string, rewardId: string): StudentStationProgress {
    const current = this.getStationProgress(studentId, stationId);
    if (!current.rewardsCollected.includes(rewardId)) {
      current.rewardsCollected.push(rewardId);
      current.lastVisitedAt = new Date().toISOString();
      const key = this.getCompositeKey(studentId, stationId);
      this.memoryCache.set(key, current);
      this.saveToStorage();
      this.queueSyncEvent(studentId, stationId, 'REWARD_CLAIMED');
    }
    return { ...current };
  }

  public completeStage2(studentId: string, stationId: string, rewardId?: string): StudentStationProgress {
    const current = this.getStationProgress(studentId, stationId);
    current.stage2Completed = true;
    if (rewardId && !current.rewardsCollected.includes(rewardId)) {
      current.rewardsCollected.push(rewardId);
    }
    current.lastVisitedAt = new Date().toISOString();
    const key = this.getCompositeKey(studentId, stationId);
    this.memoryCache.set(key, current);
    this.saveToStorage();
    this.queueSyncEvent(studentId, stationId, 'STAGE2_COMPLETED');
    return { ...current };
  }

  public completeStage3(
    studentId: string,
    stationId: string,
    checkInResponse: StudentCheckInResponse,
    rewardId?: string
  ): StudentStationProgress {
    const current = this.getStationProgress(studentId, stationId);
    current.stage3Completed = true;
    current.checkInResponse = checkInResponse;
    if (rewardId && !current.rewardsCollected.includes(rewardId)) {
      current.rewardsCollected.push(rewardId);
    }
    current.lastVisitedAt = new Date().toISOString();
    const key = this.getCompositeKey(studentId, stationId);
    this.memoryCache.set(key, current);
    this.saveToStorage();
    this.queueSyncEvent(studentId, stationId, 'STAGE3_COMPLETED');
    return { ...current };
  }

  public completeStage4(studentId: string, stationId: string): StudentStationProgress {
    const current = this.getStationProgress(studentId, stationId);
    current.stage4Completed = true;
    current.stationCompleted = true;
    current.stampReceived = true;
    if (!current.completedAt) {
      current.completedAt = new Date().toISOString();
    }
    current.lastVisitedAt = new Date().toISOString();
    const key = this.getCompositeKey(studentId, stationId);
    this.memoryCache.set(key, current);
    this.saveToStorage();
    this.queueSyncEvent(studentId, stationId, 'STATION_COMPLETED');
    return { ...current };
  }

  public getGradeProgress(studentId: string, stationIdsInGrade: string[]): GradeSummary {
    let completedStations = 0;
    let totalStamps = 0;
    let totalRewards = 0;

    stationIdsInGrade.forEach(sId => {
      const p = this.getStationProgress(studentId, sId);
      if (p.stationCompleted) {
        completedStations++;
      }
      if (p.stampReceived) {
        totalStamps++;
      }
      totalRewards += p.rewardsCollected.length;
    });

    return {
      grade: 2,
      totalStations: stationIdsInGrade.length,
      completedStations,
      totalStamps,
      totalRewards,
    };
  }

  public getAllCompletedStamps(studentId: string): string[] {
    const stamps: string[] = [];
    this.memoryCache.forEach((prog, key) => {
      if (key.startsWith(`${studentId}:::`) && prog.stampReceived) {
        stamps.push(prog.stationId);
      }
    });
    return stamps;
  }

  private queueSyncEvent(studentId: string, stationId: string, eventType: string) {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        studentId,
        stationId,
        eventType,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      // ignore
    }
  }

  public syncProgress(): { success: boolean; syncedCount: number } {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      if (!raw) return { success: true, syncedCount: 0 };
      const queue = JSON.parse(raw);
      const count = queue.length;
      localStorage.removeItem(SYNC_QUEUE_KEY);
      return { success: true, syncedCount: count };
    } catch {
      return { success: false, syncedCount: 0 };
    }
  }
}

export const progressService = new ProgressService();
