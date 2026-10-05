import { Admin, Teacher } from '../types';
import { fetchWithTimeout } from './NetworkService';
export type StaffUser = (Admin | Teacher) & { email: string };
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
  async restore() { user=(await request('/api/auth/session')).user; return user; },
  async login(email: string,password: string) { user=(await request('/api/auth/login','POST',{email,password})).user; return user!; },
  async logout() { await request('/api/auth/logout','POST',{}); user=null; },
  async users(): Promise<(StaffUser & {active:boolean})[]> { return (await request('/api/admin/users')).users; },
  async createTeacher(email: string,name: string,password: string) { await request('/api/admin/users','POST',{email,name,password}); },
  async updateTeacher(email: string,active: boolean,password?: string) { await request('/api/admin/users','PUT',{email,active,password}); },
  async changePassword(currentPassword: string,password: string) { await request('/api/auth/password','POST',{currentPassword,password}); user=null; },
};
