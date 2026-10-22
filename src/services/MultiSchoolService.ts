/**
 * Multi-school Supabase gateway. This module is opt-in: the existing app
 * continues to work until its screens explicitly adopt this service.
 * Only the public publishable/anon key belongs in the browser.
 */
export interface SchoolClassroom {
  id: string;
  teacher_id: string;
  school_id: string | null;
  name: string;
  grade: number;
  join_code: string;
}
export interface TeacherProfile {
  user_id: string;
  display_name: string;
  school_id: string | null;
}
export interface SchoolStudent {
  id: string;
  classroom_id: string;
  display_name: string;
  student_code: string;
}
const baseUrl = (import.meta.env.VITE_CHAM_SUPABASE_URL || '').replace(/\/$/, '');
const publishableKey = import.meta.env.VITE_CHAM_SUPABASE_PUBLISHABLE_KEY || '';
export const multiSchoolConfigured = Boolean(baseUrl && publishableKey);
export class MultiSchoolError extends Error {
  constructor(message: string, readonly status: number) { super(message); this.name = 'MultiSchoolError'; }
}
async function api<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  if (!multiSchoolConfigured) throw new MultiSchoolError('Chưa cấu hình Supabase CHẠM ĐÀ NẴNG.', 503);
  const response = await fetch(baseUrl + path, {
    ...options,
    headers: {
      apikey: publishableKey,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new MultiSchoolError(
    result?.msg || result?.error_description || result?.message || 'Không thể kết nối hệ thống lớp học.',
    response.status
  );
  return result as T;
}
export interface TeacherSession { access_token: string; refresh_token: string; expires_in: number; user: { id: string; email?: string }; }
export const multiSchoolService = {
  registerTeacher(email: string, password: string) {
    return api<TeacherSession>('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  signInTeacher(email: string, password: string) {
    return api<TeacherSession>('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  refreshSession(refreshToken: string) {
    return api<TeacherSession>('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) });
  },
  saveTeacherProfile(accessToken: string, profile: TeacherProfile) {
    return api<TeacherProfile[]>('/rest/v1/teacher_profiles?on_conflict=user_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(profile),
    }, accessToken);
  },
  getTeacherProfile(accessToken: string, userId: string) {
    return api<TeacherProfile[]>('/rest/v1/teacher_profiles?user_id=eq.' + encodeURIComponent(userId) + '&select=*', {}, accessToken);
  },
  listClasses(accessToken: string) {
    return api<SchoolClassroom[]>('/rest/v1/classrooms?select=*&order=created_at.desc', {}, accessToken);
  },
  createClass(accessToken: string, teacherId: string, name: string, grade: number, schoolId: string | null = null) {
    if (!name.trim() || !Number.isInteger(grade) || grade < 1 || grade > 5) throw new Error('Tên lớp hoặc khối không hợp lệ.');
    return api<SchoolClassroom[]>('/rest/v1/classrooms', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ teacher_id: teacherId, school_id: schoolId, name: name.trim(), grade }),
    }, accessToken);
  },
  listStudents(accessToken: string, classroomId: string) {
    return api<SchoolStudent[]>('/rest/v1/students?classroom_id=eq.' + encodeURIComponent(classroomId) + '&select=*&order=created_at.desc', {}, accessToken);
  },
  listProgress(accessToken: string, studentIds: string[]) {
    if (!studentIds.length) return Promise.resolve([] as Array<{student_id:string;station_id:string;progress:unknown;updated_at:string}>);
    const ids = studentIds.filter(id => /^[0-9a-f-]{36}$/i.test(id));
    if (!ids.length) return Promise.resolve([]);
    return api<Array<{student_id:string;station_id:string;progress:unknown;updated_at:string}>>(
      '/rest/v1/student_progress?student_id=in.(' + ids.join(',') + ')&select=*', {}, accessToken
    );
  },
};
