// Conservative, editor-reviewed topic links. A link confirms GDĐP topic relevance,
// NOT the SGK page, lesson placement or textbook edition.
const TOPICS = Object.freeze({
  'gddp-2026-1-01': ['g1-station-2','Trò chơi dân gian'],
  'gddp-2026-1-10': ['g1-station-2','Trò chơi dân gian'],
  'gddp-2026-1-12': ['g1-station-4','Thành Điện Hải'],
  'gddp-2026-1-13': ['g1-station-5','Món ăn truyền thống'],
  'gddp-2026-2-01': ['g2-station-3','Nhà thờ Nguyễn Văn Thoại – Nhà lưu niệm Huỳnh Thúc Kháng'],
  'gddp-2026-2-02': ['g2-station-2','Cù Lao Chàm – Khu bảo tồn thiên nhiên Sơn Trà'],
  'gddp-2026-2-04': ['g2-station-4','Di sản văn hóa thế giới Hội An'],
  'gddp-2026-2-05': ['g2-station-5','Lễ hội truyền thống ở thành phố Đà Nẵng']
});
export function getCuratedGddpLink(row) {
  const link=TOPICS[row.id];
  if (!link) return null;
  // Prevent stale curated IDs from leaking into changed admin-published records.
  const expected = row.id.startsWith('gddp-2026-1-') ? 1 : 2;
  if (row.grade!==expected) return null;
  return {stationId:link[0],stationTitle:link[1],status:'topic_only_unverified_sgk'};
}
export function textbookReviewStatus(row) {
  return {status:'requires_textbook_review',grade:row.grade,subject:row.subject,
    lesson:row.lesson,week:row.week,verifiedPage:null,
    note:'Địa chỉ từ bảng tích hợp GDĐP; chưa xác minh độc lập nội dung/trang SGK hiện hành.'};
}
