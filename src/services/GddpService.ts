import {isExperienceMode} from './ExperienceMode';
import { publicGddpTextbookRecords } from '../../gddp-textbook-review.mjs';
import { bundledGddpCatalog } from './GddpBundledCatalog';
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
let publicCache: {at:number;value:Promise<GddpCatalog & {source?:string}>}|undefined;
export const gddpService = {
  publicCatalog: async () => {
    if(isExperienceMode())return {...bundledGddpCatalog,records:publicGddpTextbookRecords(bundledGddpCatalog.records),published:false,source:'bundled-experience'};
    if(!publicCache||Date.now()-publicCache.at>5*60*1000){
      const value=call<GddpCatalog & {source?:string}>('/api/gddp/catalog');
      publicCache={at:Date.now(),value};value.catch(()=>{if(publicCache?.value===value)publicCache=undefined;});
    }
    const catalog = await publicCache.value;
    const records = catalog.published === false && catalog.source?.startsWith('bundled-')
      ? bundledGddpCatalog.records : catalog.records;
    return {...catalog, records: publicGddpTextbookRecords(records)};
  },
  adminCatalog: () => call<{published:boolean;catalog:GddpCatalog}>('/api/admin/gddp/catalog'),
  saveDraft: (data: GddpCatalog) => call<{saved:boolean;records:number}>('/api/admin/gddp/catalog','PUT',data),
  publish: () => call<{published:boolean;records:number}>('/api/admin/gddp/publish','POST',{}),
  suggest: (id: string) => call<{outcomes:string;teachingSuggestion:string;reviewRequired:boolean}>('/api/admin/gddp/suggest','POST',{id}),
};
