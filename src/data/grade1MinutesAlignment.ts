/**
 * Editorial alignment with the user-provided Sở GDĐT meeting record:
 * "31-01.LỚP 1. BIÊN BẢN GÓP Ý TLGD ĐP.docx", dated 31/07/2025.
 *
 * Text-only reference. Photo labels are NOT representations of licensed photos.
 * The original source textbook and photographs must be checked separately.
 * No effect on existing hotspot IDs, answers, assets, or progress.
 */
export type Grade1MinutePhase = {
  name: 'Khởi động' | 'Khám phá' | 'Thực hành' | 'Vận dụng';
  instructions: string[];
  imageSubjects?: string[];
  requiresOriginalTextbook?: boolean;
};
export type Grade1MinuteTopic = {
  stationId: string;
  title: string;
  sourcePages: string;
  phases: Grade1MinutePhase[];
  editorialNotice?: string;
};
export const GRADE1_MINUTES: Grade1MinuteTopic[] = [
  {
    stationId:'g1-station-1',title:'Quê hương em',sourcePages:'Biên bản trang 1–2, mục II, Chủ đề 1',
    editorialNotice:'Tên trường Kim Đồng trong biên bản là thông tin tư liệu năm 2025. Theo UBND phường Tam Kỳ, từ ngày 26/8/2026 Trường Tiểu học Kim Đồng hợp nhất vào Trường Tiểu học Tam Kỳ. Không gọi tên cũ là tên hiện hành.',
    phases:[
      {name:'Khởi động',instructions:['Kể tên một số xã, phường, đặc khu của thành phố Đà Nẵng mà em biết.','Kết luận theo biên bản năm 2025: thành phố có 23 phường, 70 xã và 01 đặc khu (giáo viên rà lại theo thời điểm sử dụng).'],imageSubjects:['Phường Hội An','Xã Nam Trà My','Phường Hải Châu','Xã Hiệp Đức','Đặc khu Hoàng Sa']},
      {name:'Khám phá',instructions:['Em đang ở đâu? Quan sát từng hình, nhận biết tên địa điểm và khu vực; không yêu cầu tiết lộ địa chỉ nhà.'],imageSubjects:['Cổng thôn Thạch Bích – xã Quế Phước','Đường Trần Hưng Đạo – phường Bàn Thạch','Cổng chợ Việt An – xã Việt An','Nhà làng truyền thống – xã Tây Giang','Đài tưởng niệm liệt sĩ huyện Hòa Vang – theo biên bản: nay thuộc phường Cẩm Lệ','Ga Trà Kiệu – xã Duy Xuyên']},
      {name:'Thực hành',instructions:['Trường của em tên là gì?','Trường của em ở xã hoặc phường nào?','Từ nhà đến trường, em đi qua những địa điểm nào?'],imageSubjects:['Trường Tiểu học Kim Đồng, phường Tam Kỳ (tên ghi trong tài liệu 2025)','Một trường tiểu học ở Đà Nẵng cũ (biên bản chưa định danh cụ thể)']},
      {name:'Vận dụng',instructions:['Hoạt động 1: Em hãy giới thiệu về nơi em ở.','Hoạt động 2: Em hãy kể tên xã hoặc phường của Đà Nẵng mà em đã được đến.']}
    ]
  },
  {
    stationId:'g1-station-4',title:'Thành Điện Hải',sourcePages:'Biên bản trang 2–3, mục II, Chủ đề 2',
    editorialNotice:'Biên bản ghi cơ bản giữ nguyên tài liệu GDĐP Đà Nẵng trang 10. Những phần không diễn giải đầy đủ ở đây cần so với tài liệu gốc.',
    phases:[
      {name:'Khởi động',instructions:['Di tích lịch sử Thành Điện Hải thuộc phường Hải Châu, thành phố Đà Nẵng.']},
      {name:'Khám phá',instructions:['Em thấy gì trong di tích Thành Điện Hải đã tham quan hoặc quan sát qua hình minh họa?','Hiện vật nào trong di tích Thành Điện Hải làm em ấn tượng nhất?']},
      {name:'Thực hành',instructions:['Thành Điện Hải được biết đến vì điều gì?','Thành Điện Hải gắn liền với vị tướng nào?']},
      {name:'Vận dụng',instructions:['Hoạt động 1: Giữ nguyên theo tài liệu GDĐP Đà Nẵng trang 10 (biên bản không chép nội dung).','Hoạt động 2: Em hãy kể tên di tích lịch sử mà em biết.'],requiresOriginalTextbook:true}
    ]
  },
  {
    stationId:'g1-station-2',title:'Trò chơi dân gian',sourcePages:'Biên bản trang 3, mục II, Chủ đề 3',
    editorialNotice:'Biên bản yêu cầu GIỮ NGUYÊN nội dung Tài liệu GDĐP Quảng Nam trang 10, nhưng không cung cấp lại nội dung trang đó. Chỉ được xác nhận khớp toàn bộ khi đã so với trang sách gốc.',
    phases:[
      {name:'Khởi động',instructions:['Thực hiện theo tài liệu GDĐP Quảng Nam trang 10; biên bản không ghi lại chi tiết.'],requiresOriginalTextbook:true},
      {name:'Khám phá',instructions:['Giữ nguyên nội dung và trò chơi theo tài liệu GDĐP Quảng Nam trang 10.'],requiresOriginalTextbook:true},
      {name:'Thực hành',instructions:['Giữ nguyên theo tài liệu GDĐP Quảng Nam trang 10.'],requiresOriginalTextbook:true},
      {name:'Vận dụng',instructions:['Giữ nguyên theo tài liệu GDĐP Quảng Nam trang 10.'],requiresOriginalTextbook:true}
    ]
  },
  {
    stationId:'g1-station-3',title:'Những dòng suối ở thành phố Đà Nẵng',sourcePages:'Biên bản trang 3–4, mục II, Chủ đề 4',
    editorialNotice:'Biên bản giữ phần lớn tài liệu GDĐP Quảng Nam trang 34–36; nhãn tên dòng suối chỉ ghi theo tài liệu, không tự khẳng định thay đổi địa danh mới.',
    phases:[
      {name:'Khởi động',instructions:['Em đã biết những dòng suối, thác nước nào ở thành phố Đà Nẵng?'],imageSubjects:['Suối Tiên – xã Quế Sơn Trung','Suối Mơ – xã Hà Nha','Thác Ồ Ồ – xã Sơn Cẩm Hà','Thác ở Hố Giang Thơm – xã Tam Mỹ','Suối Mơ – xã Bà Nà','Suối Lương – phường Hải Vân']},
      {name:'Khám phá',instructions:['Thay hình Thác Năm Tầng (Nam Trà My) bằng hình thác Hòa Phú Thành (xã Hòa Vang).'],imageSubjects:['Thác Grăng – xã Bến Giằng','Thác Hòa Phú Thành – xã Hòa Vang']},
      {name:'Thực hành',instructions:['Kết luận theo biên bản: Thành phố Đà Nẵng có nhiều dòng suối và thác nước đẹp; đây là những điểm du lịch sinh thái hấp dẫn, thu hút du khách gần xa.']},
      {name:'Vận dụng',instructions:['Hoạt động 1: Hãy sưu tầm những hình ảnh em thích về một dòng suối đẹp ở thành phố Đà Nẵng.','Hoạt động 2: Hãy giới thiệu một cảnh đẹp mà em thích với người thân trong gia đình.']}
    ]
  },
  {
    stationId:'g1-station-5',title:'Món ăn truyền thống',sourcePages:'Biên bản trang 4, mục II, Chủ đề 5',
    editorialNotice:'Khởi động phải gồm đúng sáu món theo biên bản. Cao lầu, bê thui, cơm gà và nem nướng chỉ dùng khi mở rộng, không thay bộ hình Khởi động.',
    phases:[
      {name:'Khởi động',instructions:['Quan sát sáu món ăn trong biên bản, gọi đúng tên món; bỏ hình Cá niên.'],imageSubjects:['Mì Quảng','Bánh tráng cuốn thịt heo','Bánh sừng trâu','Bánh thuẫn','Bánh bèo','Bánh xèo']},
      {name:'Khám phá',instructions:['Giữ nguyên nội dung theo Tài liệu GDĐP Quảng Nam trang 2 (biên bản không ghi lại chi tiết).'],requiresOriginalTextbook:true},
      {name:'Thực hành',instructions:['Thay hình Bánh tráng chập bằng hình Bánh đập.','Thay cụm từ “Bánh tráng chập” bằng “Bánh đập” trong kết luận.'],imageSubjects:['Bánh đập']},
      {name:'Vận dụng',instructions:['Giữ nguyên theo Tài liệu GDĐP Quảng Nam trang 2 (biên bản không chép nội dung).'],requiresOriginalTextbook:true}
    ]
  },
];
export const grade1MinutesTopic=(stationId:string)=>GRADE1_MINUTES.find(t=>t.stationId===stationId);
