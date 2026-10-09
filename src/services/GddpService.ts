import { fetchWithTimeout } from './NetworkService';

export interface GddpRecord {
  id: string;
  grade: number;
  subject: string;
  week: string;
  lesson: string;
  integrationType: string;
  activity: string;
  content: string;
  outcomes?: string;
  teachingSuggestion?: string;
  resourceLinks?: {stationId:string;hotspotId:string}[];
}
export interface GddpCatalog {
  year: string;
  records: GddpRecord[];
  published?: boolean;
  updatedAt?: string;
}
async function call<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const res = await fetchWithTimeout(path, {
    method, credentials: 'same-origin', cache: 'no-store',
    ...(data === undefined ? {} : {headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)})
  });
  if (!res.headers.get('content-type')?.includes('application/json')) throw new Error('Máy chủ chưa trả về dữ liệu hợp lệ.');
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Không thể truy cập thư viện GDĐP.');
  return json as T;
}
export const gddpService = {
  publicCatalog: () => call<GddpCatalog>('/api/gddp/catalog'),
  adminCatalog: () => call<{published:boolean;catalog:GddpCatalog}>('/api/admin/gddp/catalog'),
  saveDraft: (data: GddpCatalog) => call<{saved:boolean;records:number}>('/api/admin/gddp/catalog','PUT',data),
  publish: () => call<{published:boolean;records:number}>('/api/admin/gddp/publish','POST',{}),
  suggest: (id: string) => call<{outcomes:string;teachingSuggestion:string;reviewRequired:boolean}>('/api/admin/gddp/suggest','POST',{id}),
};
