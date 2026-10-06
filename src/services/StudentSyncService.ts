import { StudentStationProgress } from '../types';
import { fetchWithTimeout } from './NetworkService';

export interface StudentSyncProfile {
  id: string;
  name: string;
  className: string;
  grade: number;
}

async function request(path: string, method: 'POST' | 'PUT', data: unknown) {
  const response = await fetchWithTimeout(path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Máy chủ đồng bộ chưa sẵn sàng.');
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Chưa đồng bộ được tiến độ.');
  return result;
}

export const studentSyncService = {
  async register(profile: StudentSyncProfile): Promise<{ syncCode: string; profile: StudentSyncProfile; progress: Record<string, StudentStationProgress> }> {
    return request('/api/student/sync/register', 'POST', { profile });
  },

  async restore(syncCode: string): Promise<{ profile: StudentSyncProfile; progress: Record<string, StudentStationProgress> }> {
    return request('/api/student/sync/restore', 'POST', { syncCode });
  },

  async push(
    syncCode: string,
    progress: Record<string, StudentStationProgress>,
  ): Promise<{ saved: boolean; progress: Record<string, StudentStationProgress> }> {
    return request('/api/student/sync/progress', 'PUT', { syncCode, progress });
  },
};
