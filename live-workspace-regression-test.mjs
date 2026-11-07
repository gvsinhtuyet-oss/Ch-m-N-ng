import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(p,'utf8');

test('actual teacher role uses approved workspace shell for signed-in and guest access',()=>{
 const app=read('src/App.tsx');
 const teacher=read('src/features/teacher/TeacherDashboard.tsx');
 const context=read('src/contexts/AppContext.tsx');
 const css=read('src/index.css');
 assert.match(app,/currentView === 'teacher-view' && role === 'teacher' && <TeacherDashboard/);
 assert.match(context,/setCurrentView\('teacher-view'\)/);
 assert.match(teacher,/teacher-workspace/);
 assert.match(teacher,/teacher-sidebar/);
 assert.match(teacher,/teacher-page-hero/);
 assert.match(teacher,/aria-label="Điều hướng giáo viên"/);
 assert.match(teacher,/aria-current=\{activeTab===id\?'page':undefined\}/);
 for(const tab of ['Dạy học ngay','Kế hoạch bài dạy','Lớp của tôi','Kết quả học tập','Kho học liệu','Danh mục 25 trạm']) assert.ok(teacher.includes(tab),tab);
 for(const required of ['<TeacherWorkspace />','<ClassRoster />','<RealClassResults />','<GddpTeacherLookup','<ImplementationModal','<LearningFeedbackForm']) assert.ok(teacher.includes(required),required);
 assert.match(css,/\.teacher-workspace \.teacher-page-hero/);
});

test('actual administrator demo uses same approved navigation, without backend write privileges',()=>{
 const app=read('src/App.tsx');
 const demo=read('src/features/admin/AdminDemoDashboard.tsx');
 const admin=read('src/features/admin/AdminDashboard.tsx');
 assert.match(app,/currentUser\?\.id === 'admin-demo' \? <AdminDemoDashboard \/> : <AdminDashboard \/>/);
 assert.match(demo,/admin-sidebar/);
 assert.match(demo,/admin-page-hero/);
 assert.match(demo,/aria-label="Điều hướng quản trị trải nghiệm"/);
 assert.match(demo,/<ContentEditor localOnly onDirtyChange=\{setEditorDirty\}\/>/);
 assert.match(demo,/<ThemeEditor localOnly onDirtyChange=\{setEditorDirty\}\/>/);
 assert.match(demo,/Dữ liệu minh họa|không xem báo cáo toàn trường/);
 assert.match(admin,/aria-label="Điều hướng quản trị"/);
});

test('production does not substitute static teacher/admin preview pages for the real app',()=>{
 const app=read('src/App.tsx');
 assert.doesNotMatch(app,/teacher-preview\.html|admin-preview\.html/);
});
