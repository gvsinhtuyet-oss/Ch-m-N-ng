import { OfflinePackage } from '../types';

const OFFLINE_PACKAGES_KEY = 'cham_danang_offline_pkgs_v2';

class OfflineService {
  private packages: Map<string, OfflinePackage> = new Map();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(OFFLINE_PACKAGES_KEY);
      if (raw) {
        const list: OfflinePackage[] = JSON.parse(raw);
        list.forEach(p => this.packages.set(p.stationId, p));
      }
    } catch {
      // ignore
    }
  }

  private save() {
    try {
      const list = Array.from(this.packages.values());
      localStorage.setItem(OFFLINE_PACKAGES_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  public getPackage(stationId: string): OfflinePackage | undefined {
    return this.packages.get(stationId);
  }

  public isDownloaded(stationId: string): boolean {
    return this.packages.has(stationId);
  }

  public async downloadStation(stationId: string): Promise<OfflinePackage> {
    // Simulate caching images and audio text
    await new Promise(res => setTimeout(res, 800));

    const pkg: OfflinePackage = {
      stationId,
      downloadedAt: new Date().toISOString(),
      sizeMb: 4.8,
      hasUpdate: false,
    };
    this.packages.set(stationId, pkg);
    this.save();
    return pkg;
  }

  public removeStation(stationId: string) {
    this.packages.delete(stationId);
    this.save();
  }
}

export const offlineService = new OfflineService();
