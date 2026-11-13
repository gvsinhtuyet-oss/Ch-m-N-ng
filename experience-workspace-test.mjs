import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(path, 'utf8');

test('Free teacher has a safe, isolated Teacher/Admin experience switch', () => {
  const teacher = read('src/features/teacher/TeacherDashboard.tsx');
  const experience = read('src/features/teacher/ExperienceWorkspace.tsx');
  assert.match(teacher, /currentUser\?\.id === 'teacher-demo'/);
  assert.match(teacher, /<ExperienceWorkspace teacherPanel=\{<TeacherDashboardCore \/>/);
  assert.match(experience, /Chuyển đổi vai trò trải nghiệm/);
  assert.match(read('src/features/landing/AccessPortal.tsx'), /Giáo viên \/ Quản trị trải nghiệm/);
  assert.match(experience, /Quản trị/);
  assert.match(experience, /Giáo viên/);
  assert.match(experience, /CHẾ ĐỘ TRẢI NGHIỆM · DỮ LIỆU MINH HỌA/);
});
test('Sample class, star, plan and assets live on this device only', () => {
  const source = read('src/features/teacher/ExperienceWorkspace.tsx');
  for (const expected of ['localStorage.getItem', 'localStorage.setItem', 'Tạo lớp', 'Thêm vào lớp', 'Đánh giá 1–5 sao', 'ALL_25_STATIONS.map', 'Kế hoạch tích hợp GDĐP']) {
    assert.ok(source.includes(expected), expected);
  }
  assert.doesNotMatch(source, /\bfetch\s*\(|authService|studentSyncService|firebase\/|\/api\/admin|\/api\/teacher|eval\s*\(/);
  assert.match(source, /Học sinh mẫu/);
});
test('Protected real Admin remains separate from teacher guest route', () => {
  const app = read('src/App.tsx');
  const context = read('src/contexts/AppContext.tsx');
  assert.match(app, /currentView === 'admin-view' && role === 'admin' && <AdminDashboard \/>/);
  assert.match(context, /authService\.current\(\)\?\.role !== 'admin'/);
  assert.doesNotMatch(context, /enterAdminDemo|loginAsAdminDemo/);
});

test('Experience Admin matches the real five groups and ten pages without loading privileged AdminDashboard', () => {
  const actual = read('src/features/admin/AdminDashboard.tsx');
  const shell = read('src/features/teacher/AdminExperienceShell.tsx');
  const experience = read('src/features/teacher/ExperienceWorkspace.tsx');
  const groups = ['Tổng quan','Dạy và học','Học liệu','Báo cáo','Cài đặt'];
  const ids = ['overview','tracking','reports','stations','gddp','effectiveness','proposals','users','theme','assistant-qa'];
  for (const label of groups) {
    assert.ok(actual.includes("label: '" + label + "'"), 'Real admin group ' + label);
    assert.ok(shell.includes("label: '" + label + "'"), 'Experience group ' + label);
  }
  for (const id of ids) {
    assert.ok(actual.includes("id: '" + id + "'"), 'Real admin page ' + id);
    assert.ok(shell.includes("id: '" + id + "'"), 'Experience page ' + id);
  }
  assert.match(shell, /admin-workspace/);
  assert.match(shell, /admin-sidebar/);
  assert.match(shell, /admin-page-hero/);
  assert.match(experience, /<AdminExperienceShell activePage=\{adminPage\}/);
  assert.doesNotMatch(shell, /authService|AdminDashboard\s*from|fetch\s*\(|\/api\//);
});
test('Admin experience displays local-only effectiveness and performs offline chatbot checks', () => {
  const experience = read('src/features/teacher/ExperienceWorkspace.tsx');
  assert.match(experience, /Hiệu quả sử dụng và hành trình khám phá/);
  assert.match(experience, /Kiểm định Trợ lý khám phá/);
  assert.match(experience, /evaluateAssistantQualityCase\(row\)/);
  assert.match(experience, /DỮ LIỆU MINH HỌA/);
  assert.match(experience, /Không tạo biểu đồ ngày truy cập giả định/);
  assert.doesNotMatch(experience, /\bfetch\s*\(|authService|studentSyncService|\/api\/admin|\/api\/teacher/);
});
