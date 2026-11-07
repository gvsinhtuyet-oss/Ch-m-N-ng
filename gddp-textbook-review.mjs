// This review covers the textbook reference. Teaching placement and the school
// calendar still need a separate review before a record is ready to teach.
const grade2Vietnamese = 'https://sgkvn.com/lop-2-8/ket-noi-tri-thuc-voi-cuoc-song-3/tieng-viet-2-tap-hai-1023.html';
const grade2Science = 'https://sachdientu.nxbgd.vn/thu-vien-so/doc-sach/shs-tu-nhien-va-xa-hoi.4502758495';
const grade3Vietnamese1 = 'https://www.sgkvn.com/lop-3-9/ket-noi-tri-thuc-voi-cuoc-song-3/tieng-viet-3-tap-mot-1072.html';
const grade3Vietnamese2 = 'https://sgk.olm.vn/thu-vien-so/doc-sach/shs-tieng-viet-tap-2.4502981707';
const grade4Experience = 'https://vietjack.com/hoat-dong-trai-nghiem-4-ct/chu-de-4-em-yeu-truyen-thong-que-huong.jsp';
const grade1Vietnamese = 'https://sachgiaokhoa.aistudybuddy.vn/sach-online/lop-1/tieng-viet-1-tap-2/';
const grade1Science = 'https://hoc24.vn/tu-nhien-va-xa-hoi/lop-1/ket-noi-tri-thuc-voi-cuoc-song';
const grade4Vietnamese = 'https://vietjack.com/tieng-viet-4-kn/tieng-viet-lop-4-tap-2.jsp';
const grade4History = 'https://www.vietjack.com/lich-su-va-dia-li-4-kn/bai-2-thien-nhien-va-con-nguoi-dia-phuong-em.jsp';
const grade5History = 'https://sgk.olm.vn/thu-vien-so/doc-sach/sgv-lich-su-va-dia-li-5.4502896326';
const reviewEntries = {
  '1-01': ['Tiếng Việt', 'Bài 1: Cậu bé thông minh', grade1Vietnamese],
  '1-02': ['Tiếng Việt', 'Bài 4: Ruộng bậc thang ở Sa Pa', grade1Vietnamese],
  '1-03': ['Tiếng Việt', 'Bài 6: Du lịch biển Việt Nam', 'https://vanvn.net/bai-6-du-lich-bien-viet-nam-tieng-viet-lop-1-ket-noi-tri-thuc/'],
  '1-10': ['TNXH', 'Chủ đề1: Gia đình', grade1Science],
  '1-11': ['TNXH', 'Chủ đề 3: Cộng đồng, địa phương', grade1Science],
  '1-12': ['TNXH', 'Chủ đề 3: Cộng đồng, địa phương', grade1Science],
  '1-13': ['TNXH', 'Chủ đề 5: Con người và sức khoẻ', grade1Science],
  '2-01': ['Tiếng Việt', 'Bài 23: Bóp nát quả cam', grade2Vietnamese],
  '2-02': ['Tiếng Việt', 'Bài 26: Trên các miền đất nước', grade2Vietnamese],
  '2-03': ['Tiếng Việt', 'Bài 30: Nghe- viết : Cánh đồng quê em', grade2Vietnamese],
  '2-04': ['Đạo đức', 'Bài 2: Em yêu quê hương (tiết 1)', 'https://sgkvn.com/lop-2-8/ket-noi-tri-thuc-voi-cuoc-song-3/dao-duc-2-1028.html', false, 'Bài 13: : Em yêu quê hương (tiết 1)'],
  '2-05': ['HĐTN', 'Chủ đề 4: Truyền thống quê em', 'https://www.sachgiaokhoa.online/lop-2-8/chan-troi-sang-tao-2/chu-de-4-truyen-thong-que-em-1402.html', true],
  '2-06': ['HĐTN', 'Chủ đề 8: Môi trường xanh – Cuộc sống xanh', 'https://www.sachgiaokhoa.online/lop-2-8/chan-troi-sang-tao-2/chu-de-8-moi-truong-xanh-cuoc-song-xanh-1406.html', true],
  '2-07': ['TNXH', 'Bài 2: Nghề nghiệp của người lớn trong gia đình', grade2Science],
  '2-08': ['TNXH', 'Bài 7: Ngày hội đọc sách của chúng em', grade2Science],
  '3-01': ['Tiếng Việt', 'Chủ đề: Những trải nghiệm thú vị. Bài 5: Nhật kí tập bơi', grade3Vietnamese1, false, 'Chủ đề : Những trải nghiệm thú vi. Bài 4: Nhật kí tập bơi'],
  '3-02': ['Tiếng Việt', 'Chủ đề : Những trải nghiệm thú vi. Bài 4: Lần đầu ra biển.', grade3Vietnamese1],
  '3-03': ['Tiếng Việt', 'Chủ đề : Những sắc màu thiên nhiên. Bài 5: Ngày hội rừng xanh', grade3Vietnamese2],
  '3-04': ['Tiếng Việt', 'Chủ đề: Đất nước ngàn năm. Bài 17: Đất nước là gì?', grade3Vietnamese2],
  '3-05': ['Tiếng Việt', 'Chủ đề : Đất nước ngàn năm Bài 22: Sự tích ông Đùng, bà Đùng.', grade3Vietnamese2],
  '3-06': ['Tiếng Việt', 'Chủ đề : Đất nước ngàn năm Bài 21: Nhà rông', grade3Vietnamese2],
  '3-07': ['Tiếng Việt', 'Chủ đề: Đất nước ngàn năm Bài 23: Hai Bà Trưng', grade3Vietnamese2],
  '3-08': ['TNXH', 'Bài 10: Hoạt động sản xuất thủ công và công nghiệp', 'https://vietjack.com/tu-nhien-va-xa-hoi-3-kn/bai-10-hoat-dong-san-xuat-thu-cong-va-cong-nghiep.jsp'],
  '3-09': ['TNXH', 'Bài 11: Di tích lịch sử – văn hóa và cảnh quan thiên nhiên', 'https://sgkvn.com/lop-3-9/ket-noi-tri-thuc-voi-cuoc-song-3/chu-de-3-cong-dong-dia-phuong-1679/bai-11-di-tich-lich-su-van-hoa-va-canh-quan-thien-nhien-7323.html', false, 'Bài 11:Di tích lịch sử - vă hóa và cảnh quan thiên nhiên.'],
  '3-10': ['HĐTN', 'Chủ đề 4: Tự hào truyền thống quê em.', 'https://www.vietjack.com/hoat-dong-trai-nghiem-3-ct/chu-de-4-tu-hao-truyen-thong-que-em.jsp', true],
  '4-01': ['Tiếng Việt', 'Bài 4: Đọc: Quả ngọt cuối mùa', grade4Vietnamese],
  '4-02': ['Tiếng Việt', 'Bài 19: Đọc: Đi hội Chùa Hương', grade4Vietnamese],
  '4-03': ['Tiếng Việt', 'Bài 21: Đọc: Những cánh buồm', grade4Vietnamese],
  '4-04': ['Lịch sử và Địa lí', 'Bài 2: Thiên nhiên và con người ở địa phương em (Tiết 1)', grade4History],
  '4-05': ['Lịch sử và Địa lí', 'Bài 2: Thiên nhiên và con người ở địa phương em (Tiết 2)', grade4History],
  '4-06': ['Lịch sử và Địa lí', 'Bài 3: Lịch sử và văn hoá truyền thống địa phương em (Tiết 1)', grade4History],
  '4-07': ['Lịch sử và Địa lí', 'Bài 3: Lịch sử và văn hoá truyền thống địa phương em (Tiết 2)', grade4History],
  '4-08': ['Hoạt động trải nghiệm', 'Chủ đề 4: Em yêu truyền thống quê hương', grade4Experience, true],
  '4-09': ['Hoạt động trải nghiệm', 'Chủ đề 9: Những người sống quanh em và nghề truyền thống quê hương', 'https://www.findu.vn/hoat-dong-trai-nghiem-4-ct/chu-de-9-nhung-nguoi-song-quanh-em-va-nghe-truyen-thong-que-huong-ct', true],
  '5-01': ['Tiếng Việt', 'Bài 8: Nói và nghe: Những điểm vui chơi lí thú', 'https://www.thivien.org/tieng-viet-5-kn/bai-8-hanh-tinh-ki-la.jsp'],
  '5-02': ['Tiếng Việt', 'Bài 11: Đọc: Hang Sơn Đoòng - Những điều kì thú', 'https://giaokhoaonline.com/tieng-viet-lop-5-tap-1-ket-noi-tri-thuc'],
  '5-03': ['Tiếng Việt', 'Bài 16: Nói và nghe: Cảnh đẹp thiên nhiên', 'https://loigiaihay.com/bai-16-canh-dep-thien-nhien-trang-79-sgk-tieng-viet-lop-5-tap-1-ket-noi-tri-thuc-a162876.html', false, 'Bài 16: Nói và nghe: Giới thiệu một cảnh đẹp thiên nhiên của đất nước ta'],
  '5-04': ['Tiếng Việt', 'Bài 25: Đọc: Tiếng đàn ba-la-lai-ca trên sông Đà', 'https://vanvn.net/tieng-dan-ba-la-lai-ca-tren-song-da/'],
  '5-05': ['Tiếng Việt', 'Bài 12: Nói và nghe: Địa điểm tham quan, du lịch', 'https://loigiaihay.com/bai-12-dia-diem-tham-quan-du-lich-trang-60-sgk-tieng-viet-lop-5-tap-2-ket-noi-tri-thuc-a165361.html'],
  '5-06': ['Tiếng Việt', 'Nói và nghe: Di tích lịch sử', 'https://www.findu.vn/tieng-viet-5-kn/'],
  '5-07': ['Lịch sử Địa Lý', 'Bài 4: Dân cư và dân tộc ở Việt Nam', grade5History],
  '5-08': ['Lịch sử Địa Lý', 'Bài 14: Cách mạng tháng Tám năm 1945 (Tiết 1)', grade5History],
};

const clean = value => value.normalize('NFC').replace(/\s+/g, ' ').trim();

function matchingEntry(row) {
  const key = row.id?.match(/^gddp-2026-([1-5]-\d{2})$/)?.[1];
  const entry = key && reviewEntries[key];
  if (!entry || Number(key[0]) !== row.grade || row.subject !== entry[0]) return null;
  const title = clean(row.lesson);
  const expected = clean(entry[1]);
  // The two original grade 4 entries append the activities to the subject title.
  if (title === expected || (key.startsWith('4-') && title.startsWith(expected + ': Hoạt động giáo dục theo chủ đề:'))) return entry;
  if (entry[4] && title === clean(entry[4])) return entry;
  return null;
}

/** Read-time correction for legacy copies. Leaves edited titles and all other fields intact. */
export function correctGddpTextbookAddress(row) {
  const entry = matchingEntry(row);
  return entry?.[4] && clean(row.lesson) === clean(entry[4]) ? {...row, lesson: entry[1]} : row;
}

export function reviewGddpTextbookAddress(row) {
  const entry = matchingEntry(row);
  if (!entry) return {status:'reference', source:null};
  return {status:entry[3] ? 'other_book' : 'title_checked', source:entry[2]};
}
