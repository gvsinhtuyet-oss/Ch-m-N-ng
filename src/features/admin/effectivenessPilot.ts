export async function downloadEffectivenessPilot() {
  const {default: ExcelJS} = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CHẠM ĐÀ NẴNG';
  workbook.calcProperties.fullCalcOnLoad = true;
  const guide = workbook.addWorksheet('Hướng dẫn');
  const students = workbook.addWorksheet('Học sinh');
  const teachers = workbook.addWorksheet('Giáo viên');
  const summary = workbook.addWorksheet('Tổng hợp');
  guide.columns = [{width: 100}];
  guide.addRows([
    ['PHIẾU THÍ ĐIỂM CHẠM ĐÀ NẴNG'],
    ['Mỗi tệp dùng cho một lớp, một trạm và một đợt. Ghi thông tin ở trang Tổng hợp.'],
    ['Học sinh dùng mã do lớp đặt. Mỗi em một hàng. Giữ tệp trong phạm vi nhà trường.'],
    ['Dùng hai bài ngắn tương đương, cùng thang 5 điểm. Để trống bài vắng, chỉ nhập 0 khi bài đã chấm 0 điểm.'],
    ['Bài sau một tuần là tùy chọn. Điểm trước và sau chỉ tổng hợp trên cùng nhóm có đủ hai bài.'],
    ['Một hàng Giáo viên là hai hoạt động tương đương do cùng giáo viên chuẩn bị. Tính cả phút kiểm tra và chỉnh sửa gợi ý.'],
    ['Mở bằng Excel hoặc ứng dụng bảng tính hỗ trợ công thức để cập nhật trang Tổng hợp. Mẫu có 100 dòng nhập cho mỗi nhóm.'],
  ]);
  guide.eachRow(row => {row.alignment = {wrapText: true};row.height = 28;});
  students.columns = [{width: 21}, {width: 18}, {width: 18}, {width: 20}, {width: 18}];
  students.addRow(['Mã học sinh', 'Điểm trước /5', 'Điểm sau /5', 'Sau một tuần /5', 'Chênh lệch']);
  teachers.columns = [{width: 21}, {width: 22}, {width: 22}, {width: 24}, {width: 58}, {width: 20}];
  teachers.addRow(['Mã tiết / giáo viên', 'Phút cách thường', 'Phút dùng Trợ lý', 'Mức sử dụng', 'Điều chỉnh sau tiết dạy', 'Phút tiết kiệm']);
  for (let row = 2; row <= 101; row++) {
    students.getCell('E' + row).value = {formula: `IF(AND(A${row}<>"",COUNT(B${row}:C${row})=2),C${row}-B${row},"")`};
    for (const column of ['B', 'C', 'D']) students.getCell(column + row).dataValidation = {
      type: 'decimal', operator: 'between', allowBlank: true, formulae: [0, 5],
      showErrorMessage: true, error: 'Nhập điểm từ 0 đến 5.',
    };
    teachers.getCell('D' + row).dataValidation = {
      type: 'list', allowBlank: true, formulae: ['"Dùng ngay,Sửa nhẹ,Sửa nhiều,Không dùng"'],
      showErrorMessage: true,
    };
    for (const column of ['B', 'C']) teachers.getCell(column + row).dataValidation = {
      type: 'whole', operator: 'greaterThanOrEqual', allowBlank: true, formulae: [0],
      showErrorMessage: true, error: 'Nhập số phút từ 0 trở lên.',
    };
    teachers.getCell('F' + row).value = {formula: `IF(AND(A${row}<>"",COUNT(B${row}:C${row})=2),B${row}-C${row},"")`};
  }
  summary.columns = [{width: 43}, {width: 30}];
  summary.addRows([
    ['TỔNG HỢP THÍ ĐIỂM', 'KẾT QUẢ'],
    ['Lớp'], ['Trạm'], ['Ngày / đợt'],
    ['Số học sinh có đủ hai bài', {formula: "COUNT('Học sinh'!E2:E101)"}],
    ['Điểm trước trung bình /5', {formula: `IFERROR(SUMPRODUCT(ISNUMBER('Học sinh'!E2:E101)*'Học sinh'!B2:B101)/B5,"")`}],
    ['Điểm sau trung bình /5', {formula: `IFERROR(SUMPRODUCT(ISNUMBER('Học sinh'!E2:E101)*'Học sinh'!C2:C101)/B5,"")`}],
    ['Tăng trung bình (điểm)', {formula: `IFERROR(AVERAGE('Học sinh'!E2:E101),"")`}],
    ['Số bài sau một tuần', {formula: "COUNT('Học sinh'!D2:D101)"}],
    ['Điểm sau một tuần /5', {formula: `IFERROR(AVERAGE('Học sinh'!D2:D101),"")`}],
    ['Số lượt so sánh của giáo viên', {formula: "COUNT('Giáo viên'!F2:F101)"}],
    ['Số phút tiết kiệm trung bình', {formula: `IFERROR(AVERAGE('Giáo viên'!F2:F101),"")`}],
    ...['Dùng ngay', 'Sửa nhẹ', 'Sửa nhiều', 'Không dùng'].map(label => [
      label, {formula: `COUNTIF('Giáo viên'!D2:D101,"${label}")`},
    ]),
  ]);
  for (const row of [6, 7, 8, 10, 12]) summary.getCell('B' + row).numFmt = '0.00';
  for (const sheet of [guide, students, teachers, summary]) {
    sheet.getRow(1).font = {bold: true, color: {argb: 'FFFFFFFF'}};
    sheet.getRow(1).fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF0369A1'}};
    sheet.views = [{state: 'frozen', ySplit: 1}];
  }
  const buffer = new Uint8Array(await workbook.xlsx.writeBuffer());
  const url = URL.createObjectURL(new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'CHAM_DA_NANG_Thi_diem_hieu_qua.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readEffectivenessPilot(file: File) {
  if (!/\.xlsx$/i.test(file.name) || file.size > 512 * 1024) {
    throw new Error('Hãy chọn tệp Excel .xlsx theo mẫu, tối đa 512 KB.');
  }
  const {default: ExcelJS} = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    throw new Error('Không đọc được tệp Excel. Hãy mở lại mẫu .xlsx và lưu tệp trước khi thử lại.');
  }
  const students = workbook.getWorksheet('Học sinh');
  const teachers = workbook.getWorksheet('Giáo viên');
  if (!students || !teachers || students.getCell('B1').text !== 'Điểm trước /5' ||
      students.getCell('C1').text !== 'Điểm sau /5' ||
      teachers.getCell('B1').text !== 'Phút cách thường' || teachers.getCell('C1').text !== 'Phút dùng Trợ lý') {
    throw new Error('Tệp chưa đúng mẫu đo hiệu quả của CHẠM ĐÀ NẴNG.');
  }
  if (students.rowCount > 101 || teachers.rowCount > 101) {
    throw new Error('Mỗi trang nhập tối đa 100 dòng. Hãy tách dữ liệu theo lớp và đợt đo.');
  }

  function pairs(sheet: NonNullable<typeof students>, maximum: number) {
    const result: {before: number; after: number; usage: string}[] = [];
    const ids = new Set<string>();
    let skipped = 0;
    for (let index = 2; index <= sheet.rowCount; index++) {
      const row = sheet.getRow(index);
      const id = row.getCell(1).text.trim();
      const before = row.getCell(2).value;
      const after = row.getCell(3).value;
      if (!id && before == null && after == null) continue;
      if (id && ids.has(id)) throw new Error(`Trang ${sheet.name} có mã trùng tại dòng ${index}. Mỗi mã chỉ dùng một lần.`);
      if (id) ids.add(id);
      if (!id || typeof before !== 'number' || typeof after !== 'number' ||
          !Number.isFinite(before) || !Number.isFinite(after) ||
          before < 0 || after < 0 || before > maximum || after > maximum) {
        skipped++;
        continue;
      }
      result.push({before, after, usage: row.getCell(4).text.trim()});
    }
    return {result, skipped};
  }

  const student = pairs(students, 5);
  const teacher = pairs(teachers, Number.MAX_SAFE_INTEGER);
  const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const changes = teacher.result.map(row => row.before - row.after).sort((a, b) => a - b);
  const midpoint = Math.floor(changes.length / 2);
  const medianMinutes = changes.length
    ? (changes.length % 2 ? changes[midpoint] : (changes[midpoint - 1] + changes[midpoint]) / 2)
    : null;
  return {
    studentCount: student.result.length,
    before: mean(student.result.map(row => row.before)),
    after: mean(student.result.map(row => row.after)),
    teacherCount: teacher.result.length,
    averageMinutes: mean(changes),
    medianMinutes,
    usage: ['Dùng ngay', 'Sửa nhẹ', 'Sửa nhiều', 'Không dùng'].map(label => ({
      label, count: teacher.result.filter(row => row.usage === label).length,
    })),
    skipped: student.skipped + teacher.skipped,
  };
}
