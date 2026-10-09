import { Admin, Teacher, Classroom } from '../types';
import { fetchWithTimeout } from './NetworkService';
export type StaffUser = (Admin | Teacher) & { email: string };
export type ManagedClass = Classroom & { students: string[] };
export interface RealClassProgress {
  className:string; academicYear:string; rosterCount:number; linkedCount:number;
  students:Array<{name:string;completedStations:number;totalStamps:number;stations:Array<{stationId:string;completed:boolean;stamp:boolean;completedStages:number;lastVisitedAt:string|null}>}>;
}
export interface AuthHealth {
  status: string;
  revision?: string | null;
  firestore?: string;
  firestoreWrite?: string;
  firestoreError?: { status?: number | null; code?: string | null; detail?: string | null } | null;
  firestoreWriteError?: { status?: number | null; code?: string | null; detail?: string | null } | null;
  auth?: {
    adminEmailConfigured?: boolean;
    adminAccountExists?: boolean;
    bootstrapSecretConfigured?: boolean;
    ready?: boolean;
  };
}
let user: StaffUser | null = null;
async function request(path: string, method='GET', data?: unknown) {
  const response = await fetchWithTimeout(path, { method, credentials:'same-origin', cache:'no-store',
    ...(data !== undefined ? { headers:{'Content-Type':'application/json'},body:JSON.stringify(data) } : {}) });
  if(!response.headers.get('content-type')?.includes('application/json')) throw new Error('Máy chủ đăng nhập chưa sẵn sàng.');
  const result=await response.json();
  if(!response.ok) throw new Error(result.error || 'Chưa thực hiện được yêu cầu.');
  return result;
}
export const authService = {
  current: () => user,
  async health(): Promise<AuthHealth> { return await request('/api/health'); },
  async classProgress(classId: string): Promise<RealClassProgress> { return await request('/api/teacher/progress?classId='+encodeURIComponent(classId)); },
  async linkStudentProgress(classId: string,syncCode: string): Promise<void> { await request('/api/teacher/progress','POST',{classId,syncCode}); },
  async classes(): Promise<ManagedClass[]> { return (await request('/api/teacher/classes')).classes; },
  async saveClass(data: Pick<ManagedClass, 'name' | 'grade' | 'academicYear' | 'students'>, create: boolean) { await request('/api/teacher/classes', create ? 'POST' : 'PUT', data); },
  async restore() { user=(await request('/api/auth/session')).user; return user; },
  async login(email: string,password: string) { user=(await request('/api/auth/login','POST',{email,password})).user; return user!; },
  async logout() { await request('/api/auth/logout','POST',{}); user=null; },
  async users(): Promise<(StaffUser & {active:boolean})[]> { return (await request('/api/admin/users')).users; },
  async createTeacher(email: string,name: string,password: string) { await request('/api/admin/users','POST',{email,name,password}); },
  async updateTeacher(email: string,active: boolean,password?: string) { await request('/api/admin/users','PUT',{email,active,password}); },
  async changePassword(currentPassword: string,password: string) { await request('/api/auth/password','POST',{currentPassword,password}); user=null; },
};
