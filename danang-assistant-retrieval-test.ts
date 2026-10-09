import test from 'node:test';
import assert from 'node:assert/strict';

import { CANONICAL_BAO_TANG_DA_NANG_STATION } from './src/data/canonicalBaoTangDaNang';
import { CANONICAL_DANH_NHAN_LOP3_STATION } from './src/data/canonicalDanhNhanLop3';
import { CANONICAL_THANH_DIEN_HAI_STATION } from './src/data/canonicalThanhDienHai';
import { CANONICAL_NGU_HANH_SON_STATION } from './src/data/canonicalNguHanhSon';
import { CANONICAL_HOI_AN_STATION } from './src/data/canonicalHoiAn';
import {
  getDanangAssistantQuickPrompts,
  retrieveDanangAssistantAnswer,
} from './src/services/DanangAssistantRetrievalService';

const hoiAn = CANONICAL_HOI_AN_STATION;
const thanhDienHai = CANONICAL_THANH_DIEN_HAI_STATION;
const nguHanhSon = CANONICAL_NGU_HANH_SON_STATION;
const baoTang = CANONICAL_BAO_TANG_DA_NANG_STATION;
const danhNhan = CANONICAL_DANH_NHAN_LOP3_STATION;

test('01 - câu hỏi chung trả về hướng dẫn thân thiện', () => {
  const result = retrieveDanangAssistantAnswer('Bạn có thể giúp tôi điều chi rứa?');
  assert.equal(result.layer, 'help');
  assert.equal(result.found, true);
  assert.match(result.answer, /khám phá Đà Nẵng/i);
  assert.match(result.answer, /từ địa phương/i);
  assert.match(result.answer, /địa danh ở đâu/i);
  assert.match(result.answer, /chuyện lịch sử/i);
  assert.match(result.answer, /ưu tiên trả lời theo đúng trạm/i);
});

test('02 - hiểu phương ngữ "ở mô" trong bài Hội An', () => {
  const result = retrieveDanangAssistantAnswer('Chùa Cầu ở mô?', { station: hoiAn });
  assert.notEqual(result.layer, 'unknown');
  assert.match(result.normalizedQuery, /ở đâu/i);
  assert.match(result.answer, /Chùa Cầu|Hội An/i);
});

test('03 - hiểu phương ngữ "là chi" khi hỏi Chùa Cầu', () => {
  const result = retrieveDanangAssistantAnswer('Chùa Cầu là chi?', { station: hoiAn });
  assert.notEqual(result.layer, 'unknown');
  assert.match(result.answer, /Chùa Cầu/i);
});

test('04 - ưu tiên hotspot khi học sinh hỏi "cái này"', () => {
  const hotspot = hoiAn.hotspots.find(h => h.id === 'hoi-an-cong-trinh');
  assert.ok(hotspot);
  const result = retrieveDanangAssistantAnswer('Cái này có gì đặc biệt?', {
    station: hoiAn,
    hotspot,
  });
  assert.equal(result.layer, 'hotspot');
  assert.match(result.answer, /Chùa Cầu/i);
});

test('05 - hotspot hiện tại thắng trước kho toàn trạm', () => {
  const hotspot = thanhDienHai.hotspots.find(h => h.id === 'tdh-dai-bac');
  assert.ok(hotspot);
  const result = retrieveDanangAssistantAnswer('Nó là gì?', {
    station: thanhDienHai,
    hotspot,
  });
  assert.equal(result.layer, 'hotspot');
  assert.match(result.answer, /đại bác/i);
});

test('06 - tìm trong trạm hiện tại trước khi tìm chéo trạm', () => {
  const result = retrieveDanangAssistantAnswer('Ma nhai là gì?', { station: nguHanhSon });
  assert.equal(result.layer, 'station');
  assert.match(result.answer, /khắc/i);
  assert.match(result.answer, /đá/i);
});

test('07 - hỏi chéo trạm trả về nội dung trạm liên quan', () => {
  const result = retrieveDanangAssistantAnswer('Nguyễn Tri Phương là ai?', { station: hoiAn });
  assert.equal(result.layer, 'five-stations');
  assert.equal(result.relatedStationId, thanhDienHai.id);
  assert.match(result.answer, /Thành Điện Hải/i);
  assert.match(result.answer, /Nguyễn Tri Phương/i);
});

test('08 - từ địa phương chung chỉ dùng sau khi không có dữ liệu trạm', () => {
  const result = retrieveDanangAssistantAnswer('Rứa nghĩa là gì?', { station: baoTang });
  assert.equal(result.layer, 'common');
  assert.match(result.answer, /vậy|thế/i);
});

test('09 - giải nghĩa "mô" từ kho chung', () => {
  const result = retrieveDanangAssistantAnswer('"Mô" nghĩa là gì?');
  assert.equal(result.layer, 'common');
  assert.match(result.answer, /đâu/i);
});

test('10 - câu ngoài kho kiến thức phải từ chối đoán', () => {
  const result = retrieveDanangAssistantAnswer('Mặt trời cách Trái Đất bao xa?');
  assert.equal(result.layer, 'unknown');
  assert.equal(result.found, false);
  assert.match(result.answer, /chưa tìm thấy thông tin đã được kiểm duyệt/i);
});

test('11 - gợi ý nhanh thay đổi theo trạm Hội An', () => {
  const prompts = getDanangAssistantQuickPrompts({ station: hoiAn });
  assert.ok(prompts.some(item => /UNESCO/i.test(item)));
  assert.ok(prompts.some(item => /Chùa Cầu/i.test(item)));
});

test('12 - gợi ý nhanh thay đổi theo hotspot', () => {
  const hotspot = nguHanhSon.hotspots.find(h => h.id === 'nghs-ma-nhai');
  assert.ok(hotspot);
  const prompts = getDanangAssistantQuickPrompts({ station: nguHanhSon, hotspot });
  assert.equal(prompts.length, 3);
  assert.match(prompts[0], /Dấu tích trên đá|Ma nhai/i);
});

test('13 - 5 trạm demo đều có thể tra cứu nội dung cốt lõi', () => {
  const cases = [
    [baoTang, 'Hiện vật là gì?', /Hiện vật/i],
    [danhNhan, 'Duy Tân nghĩa là gì?', /Duy Tân/i],
    [thanhDienHai, 'Hào thành dùng để làm gì?', /Hào/i],
    [nguHanhSon, 'Làng đá Non Nước là gì?', /Non Nước/i],
    [hoiAn, 'Chùa Cầu là gì?', /Chùa Cầu/i],
  ] as const;

  cases.forEach(([station, question, expected]) => {
    const result = retrieveDanangAssistantAnswer(question, { station });
    assert.notEqual(result.layer, 'unknown', question);
    assert.match(result.answer, expected, question);
  });
});

test('14 - câu hỏi địa phương dài vẫn được chuẩn hóa', () => {
  const result = retrieveDanangAssistantAnswer(
    'Tại răng người ta gọi cái ni là Chùa Cầu rứa?',
    { station: hoiAn },
  );
  assert.match(result.normalizedQuery, /tại sao/i);
  assert.match(result.normalizedQuery, /cái này/i);
  // The lesson does not explain the name origin; do not substitute a definition.
  assert.equal(result.layer, 'unknown');
});

test('15 - mô phỏng 1000 lượt hỏi liên tiếp không có bộ đếm hay giới hạn lượt', () => {
  for (let i = 0; i < 1000; i += 1) {
    const result = retrieveDanangAssistantAnswer('Chùa Cầu là chi?', { station: hoiAn });
    assert.equal(result.found, true);
  }
});

test('16 - mọi trạm khối 2 đều tra cứu được thuyết minh hiện có', async () => {
  const { GRADE_2_STATIONS } = await import('./src/data/grade2Stations');
  for (const station of GRADE_2_STATIONS) {
    for (const hotspot of station.hotspots) {
      const question = `${hotspot.titleVi.replace(/^\d+\.\s*/, '')} có gì đặc biệt?`;
      const result = retrieveDanangAssistantAnswer(question, { station, stations: GRADE_2_STATIONS });
      assert.equal(result.found, true, question);
      assert.ok(result.answer.length > 30, question);
    }
  }
});

test('17 - dữ liệu giáo viên mới cập nhật được dùng ngay ở trạm ngoài demo', () => {
  const station = structuredClone(hoiAn);
  station.id = 'g2-custom';
  station.hotspots = [{ ...hoiAn.hotspots[0], id: 'updated', titleVi: 'Vườn học tập',
    narrationVi: 'Vườn học tập có khu gieo hạt cho học sinh.', keyFactVi: 'Học sinh chăm sóc cây mỗi tuần.' }];
  const result = retrieveDanangAssistantAnswer('Vườn học tập có gì?', { station });
  assert.equal(result.found, true);
  assert.match(result.answer, /gieo hạt/);
});

test('18 - hỏi địa danh khác không bị hotspot đang xem lấn át', () => {
  const hotspot = hoiAn.hotspots[0];
  const result = retrieveDanangAssistantAnswer('Ở đây Thành Điện Hải là gì?', { station: hoiAn, hotspot, stations: [thanhDienHai] });
  assert.match(result.answer, /Điện Hải/);
});

test('19 - hỏi chéo trạm ngoài demo đọc được nội dung học liệu', () => {
  const station = structuredClone(hoiAn);
  station.id = 'g2-new';
  station.hotspots = [{ ...hoiAn.hotspots[0], titleVi: 'Giàn dệt chiếu',
    narrationVi: 'Giàn dệt dùng để dệt các sợi cói thành tấm chiếu.', keyFactVi: 'Người thợ sử dụng giàn dệt.' }];
  const result = retrieveDanangAssistantAnswer('Giàn dệt chiếu là gì?', { stations: [station] });
  assert.equal(result.found, true);
  assert.match(result.answer, /sợi cói/);
});


test('20 - chuẩn hóa phương ngữ không làm hỏng từ chiếu', async () => {
  const { normalizeDanangDialect } = await import('./src/data/danangAssistantLexicon');
  assert.equal(normalizeDanangDialect('Chiếu Cẩm Nê'), 'chiếu cẩm nê');
});

 test('21 - câu hỏi không dấu tìm được nội dung làng chiếu', async () => {
  const { GRADE_2_STATIONS } = await import('./src/data/grade2Stations');
  const result = retrieveDanangAssistantAnswer('nguyen lieu lam chieu la gi', { stations: GRADE_2_STATIONS });
  assert.equal(result.found, true);
  assert.match(result.answer, /cói/i);
});



test('22 - dialect in a location question is not a vocabulary answer', () => {
  const result = retrieveDanangAssistantAnswer('Chùa Cầu ở mô?', {station: hoiAn});
  assert.doesNotMatch(result.answer, /“Mô” nghĩa/);
  assert.match(result.answer, /phố|Hội An|nằm|bên/i);
});
test('23 - material question selects material evidence rather than an introduction', async () => {
  const {GRADE_2_STATIONS} = await import('./src/data/grade2Stations');
  const result = retrieveDanangAssistantAnswer('Nguyên liệu làm chiếu là gì?', {stations:GRADE_2_STATIONS});
  assert.match(result.answer, /cói/i);
  assert.doesNotMatch(result.answer, /“Chi” nghĩa/);
});
test('24 - unsupported date must not return a generic description', () => {
  const s = structuredClone(hoiAn);
  s.hotspots = [{...s.hotspots[0],titleVi:'Vườn học tập',narrationVi:'Vườn học tập có cây xanh.',keyFactVi:'Các bạn yêu cây xanh.'}];
  const result = retrieveDanangAssistantAnswer('Vườn học tập xây dựng năm nào?', {stations:[s]});
  assert.equal(result.found,false);
});
test('25 - preserving hometown question provides actions', () => {
  const result = retrieveDanangAssistantAnswer('Em có thể làm gì để giữ gìn vẻ đẹp quê hương?');
  assert.equal(result.found,true);
  assert.match(result.answer,/bỏ rác|vệ sinh/);
});
