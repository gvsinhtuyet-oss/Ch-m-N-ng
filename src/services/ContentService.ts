
import { Station } from '../types';

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  kind: 'document' | 'video' | 'audio' | 'image';
}
export interface StationContent {
  coverImage: string;
  mapImage: string;
  hotspots: Station['hotspots'];
  resources: LearningResource[];
}
const STORAGE_KEY = 'cham_danang_content_v1';
let records: Record<string, StationContent> = {};
try { records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch {}
let adminToken = '';
export const contentService = {
  get(station: Station): StationContent {
    return records[station.id] || {
      coverImage: station.coverImage, mapImage: station.journeyMap?.image || '',
      hotspots: station.hotspots, resources: [],
    };
  },
  apply(station: Station) {
    const content = records[station.id];
    if (!content) return;
    station.coverImage = content.coverImage;
    station.hotspots = content.hotspots;
    if (station.journeyMap) station.journeyMap = { ...station.journeyMap, image: content.mapImage };
    else if (content.mapImage) station.journeyMap = {
      id: 'map-' + station.id, stationId: station.id, grade: station.grade,
      titleVi: 'Bản đồ hành trình ' + station.titleVi, image: content.mapImage,
      summaryNodes: content.hotspots.slice(0, 4).map(h => ({ id: h.id, titleVi: h.titleVi, textVi: h.keyFactVi })),
      knowVi: station.pedagogyGoals.knowGoalVi,
      understandVi: station.pedagogyGoals.understandGoalVi,
      actVi: station.pedagogyGoals.behaviorGoalVi,
    };
  },
  resources(stationId: string) { return records[stationId]?.resources || []; },
  saveLocal(station: Station, content: StationContent) {
    const next = { ...records, [station.id]: content };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    records = next;
    this.apply(station);
  },
  async loadShared(stations: Station[]) {
    try {
      const response = await fetch('/api/content', { cache: 'no-store' });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false;
      const remote = await response.json();
      if (remote.schemaVersion !== 1 || !remote.stations || typeof remote.stations !== 'object') return false;
      records = { ...records, ...remote.stations };
      stations.forEach(station => this.apply(station));
      return true;
    } catch { return false; }
  },
  async login(password: string) {
    const response = await fetch('/api/content/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json'))
      throw new Error('Không thể kết nối kho học liệu hoặc mật khẩu chưa đúng.');
    adminToken = (await response.json()).token;
  },
  async publish(station: Station, content: StationContent) {
    const response = await fetch('/api/content/' + encodeURIComponent(station.id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adminToken },
      body: JSON.stringify(content),
    });
    if (!response.ok) throw new Error('Chưa xuất bản được. Hãy kiểm tra kết nối và đăng nhập kho học liệu.');
    records = { ...records, [station.id]: content };
    this.apply(station);
    // A large shared file can exceed localStorage; publishing has already succeeded.
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch {}
  },
};
