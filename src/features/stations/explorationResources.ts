import type {Station} from '../../types';
// Curated geographic places. Search links resolve the actual place in Google Maps;
// never fabricate a coordinate or place a map pin on an illustration.
export const GEO_LESSON_POINTS: Record<string, {name:string;lat:number;lon:number;description:string;accuracy:'approximate'}[]> = {
  'g1-station-4': [{name:'Thành Điện Hải',lat:16.0678,lon:108.2212,description:'24 Trần Phú; tọa độ đối chiếu nguồn du lịch, chờ kiểm chứng địa chính',accuracy:'approximate'}],
  'g2-station-4': [{name:'Phố cổ Hội An',lat:15.8801,lon:108.3380,description:'Khu phố cổ Hội An',accuracy:'approximate'}],
  'g2-station-1': [{name:'Làng chiếu Cẩm Nê',lat:15.984,lon:108.162,description:'Khu vực làng nghề Cẩm Nê',accuracy:'approximate'},{name:'Làng chiếu Bàn Thạch',lat:15.825,lon:108.280,description:'Khu vực làng nghề Bàn Thạch',accuracy:'approximate'}],
  'g3-station-1': [{name:'Bãi biển Mỹ Khê',lat:16.060,lon:108.247,description:'Bãi biển Mỹ Khê',accuracy:'approximate'},{name:'Bãi biển Bàn Than',lat:15.3833,lon:108.6167,description:'Tâm khu vực Tam Hải theo cổng thông tin địa phương, KHÔNG phải ghim chính xác bãi Bàn Than',accuracy:'approximate'}],
  'g3-station-4': [{name:'Làng nước mắm Nam Ô',lat:16.124,lon:108.126,description:'Khu vực làng nghề Nam Ô',accuracy:'approximate'}],
  'g3-station-5': [{name:'Bán đảo Sơn Trà',lat:16.115,lon:108.295,description:'Khu vực bán đảo Sơn Trà',accuracy:'approximate'}],
  'g4-station-2': [{name:'Khu đền tháp Mỹ Sơn',lat:15.764,lon:108.124,description:'Khu vực di sản Mỹ Sơn (tọa độ tham khảo)',accuracy:'approximate'},{name:'Bảo tàng Điêu khắc Chăm',lat:16.0607,lon:108.2231,description:'Bảo tàng tại đường 2 Tháng 9 (tọa độ tham khảo)',accuracy:'approximate'}],
  'g4-thu-bon-hon-kem': [{name:'Hòn Kẽm Đá Dừng',lat:15.707,lon:107.982,description:'Khu vực thắng cảnh (tọa độ tham khảo)',accuracy:'approximate'},{name:'Sông Thu Bồn – đoạn Hội An',lat:15.877,lon:108.337,description:'Một đoạn sông, không đại diện toàn dòng sông',accuracy:'approximate'}],
  'g4-station-4': [{name:'Làng đúc đồng Phước Kiều',lat:15.908,lon:108.240,description:'Khu vực làng nghề (tọa độ tham khảo)',accuracy:'approximate'}],
  'g5-ky-anh-me-nhu': [{name:'Địa đạo Kỳ Anh',lat:15.548,lon:108.438,description:'Khu vực di tích, chưa xác minh cổng vào',accuracy:'approximate'},{name:'Khu lưu niệm Mẹ Nhu – Thanh Khê',lat:16.069,lon:108.184,description:'Khu vực Thanh Khê, chưa xác minh vị trí công trình',accuracy:'approximate'}],
  'g5-station-3': [{name:'Bà Nà',lat:15.997,lon:107.988,description:'Khu vực đỉnh Bà Nà (tọa độ tham khảo)',accuracy:'approximate'},{name:'Hải Vân Quan',lat:16.186,lon:108.133,description:'Khu vực đỉnh đèo Hải Vân (tọa độ tham khảo)',accuracy:'approximate'}],
  'g5-station-4': [{name:'Danh thắng Ngũ Hành Sơn',lat:16.004,lon:108.263,description:'Khu vực núi Thủy Sơn (tọa độ tham khảo)',accuracy:'approximate'}],
  'g5-lua-ma-chau': [{name:'Làng lụa Mã Châu',lat:15.824,lon:108.294,description:'Khu vực làng nghề Mã Châu (tọa độ tham khảo)',accuracy:'approximate'}],
  'g5-station-5': [{name:'Vùng núi Ngọc Linh',lat:15.076,lon:107.984,description:'Vùng núi tham khảo, không phải địa điểm trồng sâm cụ thể',accuracy:'approximate'}],
};

// Official destination VR portals. Links open separately and never replace embedded VR experiences.
export const OFFICIAL_VR_RESOURCES: Record<string, {label:string;url:string;detail:string}[]> = {
  'g1-station-1': [{label:'VR360 toàn cảnh Đà Nẵng',url:'https://vr360.danangfantasticity.com/',detail:'Chọn Tổng quan Đà Nẵng'}],
  'g2-station-2': [{label:'VR360 bán đảo Sơn Trà',url:'https://vr360.danangfantasticity.com/',detail:'Chọn Bán đảo Sơn Trà'}],
  'g3-station-1': [{label:'VR360 biển Đà Nẵng',url:'https://vr360.danangfantasticity.com/',detail:'Chọn Biển Đà Nẵng'}],
  'g3-station-5': [{label:'VR360 bán đảo Sơn Trà',url:'https://vr360.danangfantasticity.com/',detail:'Chọn Bán đảo Sơn Trà'}],
  'g4-station-1': [{label:'VR360 toàn cảnh Đà Nẵng',url:'https://vr360.danangfantasticity.com/',detail:'Chọn Tổng quan Đà Nẵng'}],
  'g4-station-2': [{label:'Không gian số Bảo tàng Điêu khắc Chăm',url:'https://danangfantasticity.com/en/thi-diem-trai-nghiem-scan-3d-tai-bao-tang-dieu-khac-cham-da-nang',detail:'Tìm liên kết tham quan 3D trên trang giới thiệu chính thức'}],
  'g5-station-3': [{label:'VR360 Bà Nà Hills',url:'https://vr360.danangfantasticity.com/',detail:'Chọn khu điểm du lịch / Bà Nà Hills'}],
  'g5-station-4': [{label:'VR360 Ngũ Hành Sơn',url:'https://vr360.danangfantasticity.com/',detail:'Chọn Danh thắng Ngũ Hành Sơn'}],
};

export type VrOption = {label:string;url:string;detail?:string;embedMode:'iframe'|'direct_link';fallbackUrl?:string};
export function stationVrOptions(station:Station):VrOption[] {
  if(station.id==='g5-station-3') return [
    {label:'Khám phá Bà Nà 360°',url:'https://vr360.danangfantasticity.com/',detail:'Trong tour Đà Nẵng, chọn Khu điểm du lịch → Bà Nà Hills.',embedMode:'direct_link'},
    {label:'Khám phá Hải Vân Quan 360°',url:'https://vr360.huecit.vn/chanmaylangco/haivanquan/index.html',embedMode:'direct_link'},
  ];
  const options:VrOption[]=[];
  const vr=station.vr360Experience;
  if(vr?.verified&&vr.url)options.push({label:vr.titleVi||'Khám phá 360°',url:vr.url,embedMode:vr.embedMode,fallbackUrl:vr.fallbackUrl});
  for(const item of OFFICIAL_VR_RESOURCES[station.id]||[])if(!options.some(option=>option.url===item.url))options.push({...item,embedMode:'direct_link'});
  return options;
}
export function stationMapPlaces(station:Station):string[] {
  if(station.id==='g2-station-2')return ['Cù Lao Chàm','Bán đảo Sơn Trà, Đà Nẵng'];
  if(station.id==='g4-station-1'||station.id==='g1-station-1')return ['Đà Nẵng'];
  return (GEO_LESSON_POINTS[station.id]||[]).map(point=>point.name);
}
export function stationHasExplorationTools(station:Station):boolean {
  return stationMapPlaces(station).length>0||stationVrOptions(station).length>0;
}
