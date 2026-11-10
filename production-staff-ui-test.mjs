import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');

test('teacher signed-in and demo roles use the approved real sidebar without changing lesson code',()=>{
 const teacher=read('src/features/teacher/TeacherDashboard.tsx');
 const app=read('src/App.tsx');
 assert.match(app,/currentView === 'teacher-view' && role === 'teacher' && <TeacherDashboard/);
 assert.match(teacher,/teacher-workspace/);
 assert.match(teacher,/teacher-sidebar/);
 assert.match(teacher,/teacher-page-hero/);
 assert.match(teacher,/aria-label="Điều hướng giáo viên"/);
 for(const t of ['Dạy học ngay','Kế hoạch bài dạy','Lớp của tôi','Kết quả học tập','Kho học liệu','Danh mục 25 trạm']) assert.ok(teacher.includes(t),t);
 for(const x of ['<TeacherWorkspace />','<ClassRoster />','<RealClassResults />','<GddpTeacherLookup','<ImplementationModal']) assert.ok(teacher.includes(x),x);
});

test('Admin has real authenticated route only; no public Admin Demo role',()=>{
 const app=read('src/App.tsx');
 const context=read('src/contexts/AppContext.tsx');
 const landing=read('src/features/landing/LandingView.tsx');
 const real=read('src/features/admin/AdminDashboard.tsx');
 assert.match(app,/currentView === 'admin-view' && role === 'admin' && <AdminDashboard \/>/);
 assert.match(context,/authService\.current\(\)\?\.id !== admin\.id/);
 assert.match(context,/authService\.current\(\)\?\.role !== 'admin'/);
 const portal=read('src/features/landing/AccessPortal.tsx');
 assert.match(landing,/onTeacher=\{openStaffLogin\}/);
 assert.match(portal,/Giáo viên/);
 assert.match(portal,/Đăng nhập bằng tài khoản/);
 assert.match(portal,/GoogleTeacherLogin onLogin=\{onGoogleLogin\}/);
 for(const source of [app,context,landing]){
   assert.doesNotMatch(source,/AdminDemoDashboard|enterAdminDemo|admin-demo|Quản trị \(Demo\)|Khám phá tự do dành cho quản trị/);
 }
 assert.match(real,/admin-workspace/);
 assert.match(real,/admin-sidebar/);
 assert.match(real,/admin-page-hero/);
 const header=read('src/components/common/Header.tsx');
 assert.match(header,/Xem giao diện/);
 assert.doesNotMatch(header,/Về trang học/);
});

test('same approved image is visible on staff pages with local fallback and readable panels',()=>{
 const bg=read('src/components/common/AppBackground.tsx');
 const css=read('src/index.css');
 assert.match(bg,/chamdanang-journey-orange\.webp/);
 assert.match(bg,/setUseBundledSource\(true\)/);
 assert.match(css,/\.game-content\.staff-workspace \{ background: transparent;/);
 assert.match(css,/\.teacher-workspace \.teacher-sidebar/);
 assert.match(css,/\.admin-workspace \.admin-sidebar/);
 assert.match(css,/\.teacher-workspace \.teacher-page-hero/);
 assert.match(css,/\.admin-page-hero/);
});
