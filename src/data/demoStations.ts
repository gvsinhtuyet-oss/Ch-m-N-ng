export const DEMO_STATION_IDS = new Set([
  'g1-station-1', // Quê hương em
  'g1-station-4', // Thành Điện Hải
  'g1-station-2', // Trò chơi dân gian
  'g1-station-3', // Những dòng suối
  'g1-station-5', // Món ăn truyền thống

  // Khối 2: mở toàn bộ 5 trạm để demo dự thi
  'g2-station-1', // Chiếu Cẩm Nê – Chiếu Bàn Thạch
  'g2-station-2', // Cù Lao Chàm – Khu bảo tồn thiên nhiên Sơn Trà
  'g2-station-3', // Nhà thờ Nguyễn Văn Thoại – Nhà lưu niệm Huỳnh Thúc Kháng
  'g2-station-4', // Di sản văn hóa thế giới Hội An
  'g2-station-5', // Lễ hội truyền thống ở thành phố Đà Nẵng

  'g3-station-1',
  'g3-station-3',
  'g3-station-4',
  'g3-station-5',
  'g3-station-2', // Huỳnh Thúc Kháng – Phan Châu Trinh
  'g4-station-2', // Những bảo tàng ở thành phố Đà Nẵng
  'g5-station-4', // Danh thắng Ngũ Hành Sơn
]);

export function isDemoStation(stationId: string): boolean {
  return DEMO_STATION_IDS.has(stationId);
}
