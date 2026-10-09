import { authService } from './AuthService';
import { fetchWithTimeout } from './NetworkService';
import { ThemeSettings, saveTheme } from './ThemeService';

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
const PREVIEW_KEY = 'cham_danang_content_preview_v1';
let previewRecords: Record<string, StationContent> = {};
let records: Record<string, StationContent> = {};
function validContent(value: unknown): value is StationContent {
  if (!value || typeof value !== 'object') return false;
  const content = value as StationContent;
  return typeof content.coverImage === 'string' && typeof content.mapImage === 'string' &&
    Array.isArray(content.hotspots) && content.hotspots.length > 0 &&
    content.hotspots.every(h => h && typeof h.id === 'string' && typeof h.titleVi === 'string' &&
      typeof h.image === 'string' && typeof h.narrationVi === 'string' && typeof h.keyFactVi === 'string' &&
      (!h.interaction || (Array.isArray(h.interaction.options) && typeof h.interaction.questionVi === 'string'))) &&
    Array.isArray(content.resources) &&
    content.resources.every(r => r && typeof r.id === 'string' && typeof r.title === 'string' &&
      typeof r.url === 'string' && ['document','video','audio','image'].includes(r.kind));
}
function validRecords(value: unknown): Record<string, StationContent> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key,content]) => /^[a-zA-Z0-9_-]{1,100}$/.test(key) && validContent(content)));
}
try { records = validRecords(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); } catch {}
try { previewRecords = validRecords(JSON.parse(localStorage.getItem(PREVIEW_KEY) || '{}')); records = {...records,...previewRecords}; } catch {}

const isLegacyPlaceholderCover = (url: string) =>
  /^https:\/\/images\.unsplash\.com\//i.test(url.trim());

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
    // Dữ liệu đã xuất bản từ các bản cũ có thể còn ảnh stock Unsplash.
    // Không cho ảnh placeholder cũ ghi đè bộ cover đã được biên tập đúng theo 25 trạm.
    if (content.coverImage && !isLegacyPlaceholderCover(content.coverImage)) {
      station.coverImage = content.coverImage;
    }
    station.hotspots = content.hotspots;
    if (station.journeyMap) station.journeyMap = { ...station.journeyMap, image: content.mapImage };
    else if (content.mapImage) station.journeyMap = {
      id: 'map-' + station.id, stationId: station.id, grade: station.grade,
      titleVi: 'Bản đồ hành trình ' + station.titleVi, image: content.mapImage,
      summaryNodes: content.hotspots.map(h => ({ id: h.id, titleVi: h.titleVi, textVi: h.keyFactVi })),
      knowVi: station.pedagogyGoals.knowGoalVi,
      understandVi: station.pedagogyGoals.understandGoalVi,
      actVi: station.pedagogyGoals.behaviorGoalVi,
    };
  },
  resources(stationId: string) { return records[stationId]?.resources || []; },
  saveLocal(station: Station, content: StationContent) {
    if (!validContent(content)) throw new Error('Nội dung trạm chưa hợp lệ.');
    const next = { ...records, [station.id]: structuredClone(content) };
    const nextPreview = {...previewRecords,[station.id]:structuredClone(content)};
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(nextPreview));
    previewRecords = nextPreview;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    records = next;
    this.apply(station);
  },
  async loadShared(stations: Station[]) {
    try {
      const response = await fetchWithTimeout('/api/content', { cache: 'no-store' }, 120000);
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false;
      const remote = await response.json();
      if (remote.schemaVersion !== 1 || !remote.stations || typeof remote.stations !== 'object') return false;
      records = { ...records, ...validRecords(remote.stations), ...previewRecords };
      if (remote.theme) { try { saveTheme(remote.theme); } catch {} }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch {}
      stations.forEach(station => this.apply(station));
      return true;
    } catch { return false; }
  },
  async login(_password?: string) {
    const user = await authService.restore();
    if(user?.role !== 'admin') throw new Error('Vui lòng đăng nhập bằng tài khoản quản trị.');
  },
  async publishTheme(theme: ThemeSettings) {
    const response = await fetchWithTimeout('/api/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json',  },
      body: JSON.stringify(theme),
    }, 120000);
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Chưa xuất bản được giao diện. Hãy kiểm tra cấu hình máy chủ.');
    }
    try { saveTheme(theme); } catch {
      window.dispatchEvent(new Event('cham-theme-changed'));
    }
  },
  async publish(station: Station, content: StationContent) {
    const response = await fetchWithTimeout('/api/content/' + encodeURIComponent(station.id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json',  },
      body: JSON.stringify(content),
    }, 120000);
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Chưa xuất bản được. Hãy kiểm tra kết nối và đăng nhập kho học liệu.');
    }
    records = { ...records, [station.id]: structuredClone(content) };
    this.apply(station);
    // A large shared file can exceed localStorage; publishing has already succeeded.
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch {}
  },
};
