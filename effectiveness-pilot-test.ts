import assert from 'node:assert/strict';
import test from 'node:test';
import ExcelJS from 'exceljs';
import {readEffectivenessPilot} from './src/features/admin/effectivenessPilot';

async function sampleFile(duplicate = false): Promise<File> {
  const book = new ExcelJS.Workbook();
  const students = book.addWorksheet('Học sinh');
  const teachers = book.addWorksheet('Giáo viên');
  students.addRow(['Mã học sinh','Điểm trước /5','Điểm sau /5','Sau một tuần /5','Chênh lệch']);
  students.addRow(['s01',2,4]);
  students.addRow([duplicate ? 's01' : 's02',3,5]);
  students.addRow(['s03',4,null]); // Incomplete pair is excluded.
  teachers.addRow(['Mã tiết / giáo viên','Phút cách thường','Phút dùng Trợ lý','Mức sử dụng','Điều chỉnh sau tiết dạy','Phút tiết kiệm']);
  teachers.addRow(['t01',40,20,'Dùng ngay']);
  teachers.addRow(['t02',45,40,'Sửa nhẹ']);
  teachers.addRow(['t03',35,20,'Sửa nhiều']);
  const raw = await book.xlsx.writeBuffer();
  const bytes = new Uint8Array(raw);
  const binary = bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
  return {name:'pilot.xlsx',size:bytes.byteLength,arrayBuffer:async()=>binary} as File;
}

test('pilot reports paired scores and both average and median preparation time',async()=>{
  const actual = await readEffectivenessPilot(await sampleFile());
  assert.equal(actual.studentCount,2);
  assert.equal(actual.before,2.5);
  assert.equal(actual.after,4.5);
  assert.equal(actual.teacherCount,3);
  assert.equal(actual.averageMinutes,40/3);
  assert.equal(actual.medianMinutes,15);
  assert.equal(actual.skipped,1);
  assert.deepEqual(actual.usage.map(row=>row.count),[1,1,1,0]);
});

test('pilot rejects duplicate student codes instead of double-counting',async()=>{
  const file = await sampleFile(true);
  await assert.rejects(()=>readEffectivenessPilot(file),/mã trùng/i);
});
