import {test} from 'node:test';import assert from 'node:assert/strict';
import {recordsFromRows} from './src/services/TeacherWorkspaceService';
test('Vietnamese headers map independently of column order',()=>{const rows=recordsFromRows([['Tiêu đề'],['Tuần','Tên bài học','Môn học','Địa chỉ tích hợp','Nội dung tích hợp','Mức độ'],['3','Bài hiện hành','Tiếng Việt','Luyện tập','Hội An','Liên hệ']],2);assert.equal(rows[0].lesson,'Bài hiện hành');assert.equal(rows[0].activity,'Luyện tập');assert.equal(rows[0].content,'Hội An');assert.deepEqual(rows[0].resourceLinks,[]);});
test('ambiguous/incomplete rows require teacher correction',()=>{assert.throws(()=>recordsFromRows([['Tên bài','Nội dung']],2));assert.throws(()=>recordsFromRows([['Tên bài','Môn học','Nội dung'],['Bài','','Hội An']],2));});
