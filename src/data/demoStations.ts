export const DEMO_STATION_IDS = new Set([
  'g1-station-4', // Thành Điện Hải
  'g2-station-4', // Di sản văn hóa thế giới Hội An
  'g3-station-2', // Huỳnh Thúc Kháng – Phan Châu Trinh
  'g4-station-2', // Những bảo tàng ở thành phố Đà Nẵng
  'g5-station-4', // Danh thắng Ngũ Hành Sơn
]);

export function isDemoStation(stationId: string): boolean {
  return DEMO_STATION_IDS.has(stationId);
}
