import { StudentStationProgress, StudentCheckInResponse } from '../types';

const PROGRESS_STORAGE_KEY = 'cham_danang_progress_v2';
const SYNC_QUEUE_KEY = 'cham_danang_sync_queue_v2';
const TREASURE_STORAGE_KEY = 'cham_danang_grade_treasure_v1';

export interface GradeSummary {
  grade: number;
  totalStations: number;
  completedStations: number;
  totalStamps: number;
  totalRewards: number;
  totalJourneyMaps: number;
  totalKeyFragments: number;
  treasureChestEligible: boolean;
}

export interface GradeTreasureProgress {
  studentId: string;
  grade: number;
  chestOpened: boolean;
  chestOpenedAt?: string;
  explorerCertificateUnlocked: boolean;
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

  private saveToStorage(notify = true) {
    try {
      const obj: Record<string, StudentStationProgress> = {};
      this.memoryCache.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(obj));
      if (notify) window.dispatchEvent(new Event('cham-progress-changed'));
    } catch (e) {
      console.warn('Could not save progress to storage:', e);
      window.dispatchEvent(new Event('cham-progress-storage-error'));
    }
  }

  private getCompositeKey(studentId: string, stationId: string): string {
    return `${studentId}:::${stationId}`;
  }

  private isGuest(studentId: string): boolean {
    return !studentId || studentId === 'guest';
  }

  public getStationProgress(studentId: string, stationId: string): StudentStationProgress {
    if (this.isGuest(studentId)) {
      return {
        studentId: 'guest',
        stationId,
        stage1Completed: false,
        stage2Completed: false,
        stage3Completed: false,
        stage4Completed: false,
        stationCompleted: false,
        exploredHotspotIds: [],
        rewardsCollected: [],
        stampReceived: false,
        journeyMapReceived: false,
        keyFragmentReceived: false,
        lastVisitedAt: new Date().toISOString(),
        syncStatus: 'local_only',
      };
    }

    const key = this.getCompositeKey(studentId, stationId);
    const existing = this.memoryCache.get(key);
    if (existing) {
      return {
        ...existing,
        journeyMapReceived: existing.journeyMapReceived ?? false,
        keyFragmentReceived: existing.keyFragmentReceived ?? false,
      };
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
      journeyMapReceived: false,
      keyFragmentReceived: false,
      lastVisitedAt: new Date().toISOString(),
      syncStatus: 'local_only',
    };
    return initial;
  }

  public startStation(studentId: string, stationId: string): StudentStationProgress {
    const current = this.getStationProgress(studentId, stationId);
    if (this.isGuest(studentId)) {
      return current;
    }
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
    if (this.isGuest(studentId)) {
      return current;
    }
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
    if (this.isGuest(studentId)) {
      return current;
    }
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
    if (this.isGuest(studentId)) {
      return current;
    }
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
    if (this.isGuest(studentId)) {
      return current;
    }
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
    if (this.isGuest(studentId)) {
      return current;
    }
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
    if (
      this.isGuest(studentId) ||
      !current.stage1Completed ||
      !current.stage2Completed ||
      !current.stage3Completed ||
      !current.journeyMapReceived ||
      !current.keyFragmentReceived
    ) {
      return current;
    }
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

  public claimJourneyGift(studentId: string, stationId: string): StudentStationProgress {
    const current = this.getStationProgress(studentId, stationId);

    // Guest mode is view-only and never writes personal progress.
    if (
      this.isGuest(studentId) ||
      !current.stage1Completed ||
      !current.stage2Completed ||
      !current.stage3Completed
    ) {
      return current;
    }

    const now = new Date().toISOString();
    let changed = false;

    if (!current.journeyMapReceived) {
      current.journeyMapReceived = true;
      current.journeyMapReceivedAt = now;
      changed = true;
    }

    if (!current.keyFragmentReceived) {
      current.keyFragmentReceived = true;
      current.keyFragmentReceivedAt = now;
      changed = true;
    }

    if (changed) {
      current.lastVisitedAt = now;
      const key = this.getCompositeKey(studentId, stationId);
      this.memoryCache.set(key, current);
      this.saveToStorage();
      this.queueSyncEvent(studentId, stationId, 'JOURNEY_GIFT_CLAIMED');
    }

    return { ...current };
  }

  public getGradeProgress(studentId: string, stationIdsInGrade: string[], grade: number): GradeSummary {
    let completedStations = 0;
    let totalStamps = 0;
    let totalRewards = 0;
    let totalJourneyMaps = 0;
    let totalKeyFragments = 0;

    stationIdsInGrade.forEach(sId => {
      const p = this.getStationProgress(studentId, sId);
      if (p.stationCompleted) {
        completedStations++;
      }
      if (p.stampReceived) {
        totalStamps++;
      }
      if (p.journeyMapReceived) {
        totalJourneyMaps++;
      }
      if (p.keyFragmentReceived) {
        totalKeyFragments++;
      }
      totalRewards += p.rewardsCollected.length;
    });

    return {
      grade,
      totalStations: stationIdsInGrade.length,
      completedStations,
      totalStamps,
      totalRewards,
      totalJourneyMaps,
      totalKeyFragments,
      treasureChestEligible:
        stationIdsInGrade.length === 5 &&
        totalJourneyMaps === 5 &&
        totalKeyFragments === 5 &&
        completedStations === 5,
    };
  }

  public getGradeTreasureProgress(studentId: string, grade: number): GradeTreasureProgress {
    const fallback: GradeTreasureProgress = {
      studentId,
      grade,
      chestOpened: false,
      explorerCertificateUnlocked: false,
    };

    if (this.isGuest(studentId)) {
      return fallback;
    }

    try {
      const raw = localStorage.getItem(TREASURE_STORAGE_KEY);
      if (!raw) return fallback;
      const parsed: Record<string, GradeTreasureProgress> = JSON.parse(raw);
      return parsed[`${studentId}:::${grade}`] ?? fallback;
    } catch {
      return fallback;
    }
  }

  public openGradeTreasure(
    studentId: string,
    grade: number,
    stationIdsInGrade: string[]
  ): GradeTreasureProgress {
    const current = this.getGradeTreasureProgress(studentId, grade);
    if (this.isGuest(studentId) || current.chestOpened) {
      return current;
    }

    const summary = this.getGradeProgress(studentId, stationIdsInGrade, grade);
    if (!summary.treasureChestEligible) {
      return current;
    }

    const next: GradeTreasureProgress = {
      studentId,
      grade,
      chestOpened: true,
      chestOpenedAt: new Date().toISOString(),
      explorerCertificateUnlocked: true,
    };

    try {
      const raw = localStorage.getItem(TREASURE_STORAGE_KEY);
      const parsed: Record<string, GradeTreasureProgress> = raw ? JSON.parse(raw) : {};
      parsed[`${studentId}:::${grade}`] = next;
      localStorage.setItem(TREASURE_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      return current;
    }

    this.queueSyncEvent(studentId, `grade-${grade}`, 'GRADE_TREASURE_OPENED');
    return next;
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

  public getStudentProgressRecords(studentId: string): Record<string, StudentStationProgress> {
    const records: Record<string, StudentStationProgress> = {};
    if (this.isGuest(studentId)) return records;
    this.memoryCache.forEach((prog, key) => {
      if (key.startsWith(`${studentId}:::`)) {
        records[prog.stationId] = { ...prog };
      }
    });
    return records;
  }

  public mergeStudentProgressRecords(
    studentId: string,
    records: Record<string, StudentStationProgress>
  ): number {
    if (this.isGuest(studentId) || !records || typeof records !== 'object') return 0;
    let changed = 0;
    const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])];
    const earliest = (a?: string, b?: string) => !a ? b : !b ? a : (Date.parse(a) <= Date.parse(b) ? a : b);
    const latest = (a?: string, b?: string) => !a ? b : !b ? a : (Date.parse(a) >= Date.parse(b) ? a : b);

    Object.entries(records).forEach(([stationId, incoming]) => {
      if (!incoming || incoming.studentId !== studentId || incoming.stationId !== stationId) return;
      const local = this.getStationProgress(studentId, stationId);
      const merged: StudentStationProgress = {
        ...local,
        ...incoming,
        studentId,
        stationId,
        stage1Completed: local.stage1Completed || incoming.stage1Completed,
        stage2Completed: local.stage2Completed || incoming.stage2Completed,
        stage3Completed: local.stage3Completed || incoming.stage3Completed,
        stage4Completed: local.stage4Completed || incoming.stage4Completed,
        stationCompleted: local.stationCompleted || incoming.stationCompleted,
        stampReceived: local.stampReceived || incoming.stampReceived,
        journeyMapReceived: local.journeyMapReceived || incoming.journeyMapReceived,
        keyFragmentReceived: local.keyFragmentReceived || incoming.keyFragmentReceived,
        exploredHotspotIds: union(local.exploredHotspotIds, incoming.exploredHotspotIds),
        rewardsCollected: union(local.rewardsCollected, incoming.rewardsCollected),
        startedAt: earliest(local.startedAt, incoming.startedAt),
        journeyMapReceivedAt: earliest(local.journeyMapReceivedAt, incoming.journeyMapReceivedAt),
        keyFragmentReceivedAt: earliest(local.keyFragmentReceivedAt, incoming.keyFragmentReceivedAt),
        completedAt: earliest(local.completedAt, incoming.completedAt),
        lastVisitedAt: latest(local.lastVisitedAt, incoming.lastVisitedAt) || new Date().toISOString(),
        checkInResponse:
          !local.checkInResponse ? incoming.checkInResponse :
          !incoming.checkInResponse ? local.checkInResponse :
          Date.parse(incoming.checkInResponse.submittedAt) >= Date.parse(local.checkInResponse.submittedAt)
            ? incoming.checkInResponse
            : local.checkInResponse,
        syncStatus: 'synced',
      };
      this.memoryCache.set(this.getCompositeKey(studentId, stationId), merged);
      changed++;
    });

    if (changed) this.saveToStorage(false);
    return changed;
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
      const count = Array.isArray(queue) ? queue.length : 0;

      // Chưa có API đồng bộ tiến độ học sinh lên máy chủ.
      // Giữ nguyên hàng đợi để không báo "đã đồng bộ" giả và không làm mất sự kiện cục bộ.
      return { success: false, syncedCount: 0 };
    } catch {
      return { success: false, syncedCount: 0 };
    }
  }
}

export const progressService = new ProgressService();

