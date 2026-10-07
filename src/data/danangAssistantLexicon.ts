export type AssistantLexiconCategory =
  | 'phuong-ngu'
  | 'tu-kho'
  | 'dia-ly'
  | 'lich-su'
  | 'van-hoa'
  | 'di-san'
  | 'nghe-thuat'
  | 'nhan-vat'
  | 'dia-danh';

export type AssistantStationScope =
  | 'common'
  | 'bao-tang-da-nang'
  | 'danh-nhan-xu-quang'
  | 'thanh-dien-hai'
  | 'ngu-hanh-son'
  | 'hoi-an';

export interface AssistantLexiconEntry {
  id: string;
  term: string;
  aliases: string[];
  category: AssistantLexiconCategory;
  stations: AssistantStationScope[];
  shortDefinition: string;
  childExample?: string;
  related?: string[];
  sourceLabel?: string;
  sourceUrl?: string;
}

/**
 * Kho từ nền cho “Trợ lý khám phá Đà Nẵng”.
 *
 * Nguyên tắc:
 * - giải thích ngắn, thân thiện với học sinh tiểu học;
 * - hiểu được cách nói địa phương nhưng trả lời bằng tiếng Việt chuẩn, dễ hiểu;
 * - ưu tiên nghĩa phù hợp ngữ cảnh bài học;
 * - các mục kiến thức lịch sử/di sản quan trọng gắn nguồn tham khảo để giáo viên kiểm duyệt.
 */
export const DANANG_ASSISTANT_LEXICON: AssistantLexiconEntry[] = [
  // ===== PHƯƠNG NGỮ XỨ QUẢNG / MIỀN TRUNG =====
  { id:'pn-mo', term:'mô', aliases:['ở mô','đâu mô'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Mô” nghĩa là “đâu”.', childExample:'“Em ở mô?” nghĩa là “Em ở đâu?”.', sourceLabel:'Báo Quảng Nam - Phương ngữ Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-1-di-tim-goc-gac-cua-phuong-ngu-3000217.html' },
  { id:'pn-te', term:'tê', aliases:['đằng tê','bên tê'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Tê” nghĩa là “kia”, chỉ người hoặc vật ở xa người nói.', childExample:'“Đằng tê” nghĩa là “đằng kia”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-1-di-tim-goc-gac-cua-phuong-ngu-3000217.html' },
  { id:'pn-ni', term:'ni', aliases:['bên ni','cái ni'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Ni” nghĩa là “này”, chỉ người hoặc vật ở gần người nói.', childExample:'“Cái ni” nghĩa là “cái này”.', sourceLabel:'Báo Quảng Nam - Từ điển phương ngữ', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-no', term:'nớ', aliases:['bên nớ','cái nớ','người nớ'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Nớ” thường nghĩa là “đó, ấy”.', childExample:'“Bên nớ” nghĩa là “bên đó”.' },
  { id:'pn-rang', term:'răng', aliases:['tại răng','răng rứa','răng vậy'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Răng” nghĩa là “sao” hoặc “tại sao”.', childExample:'“Tại răng?” nghĩa là “Tại sao?”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/bien-soan-tu-dien-phuong-ngu-quang-nam-3028749.html' },
  { id:'pn-rua', term:'rứa', aliases:['răng rứa','chi rứa','làm rứa'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Rứa” nghĩa là “vậy, thế”.', childExample:'“Làm chi rứa?” nghĩa là “Làm gì vậy?”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-1-di-tim-goc-gac-cua-phuong-ngu-3000217.html' },
  { id:'pn-chi', term:'chi', aliases:['cái chi','làm chi','điều chi'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Chi” nghĩa là “gì”.', childExample:'“Điều chi rứa?” nghĩa là “Điều gì vậy?”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-1-di-tim-goc-gac-cua-phuong-ngu-3000217.html' },
  { id:'pn-chu', term:'chừ', aliases:['bây chừ','chừ'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Chừ” nghĩa là “bây giờ”.', childExample:'“Bây chừ” nghĩa là “bây giờ”.' },
  { id:'pn-mi', term:'mi', aliases:['mi ơi'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Mi” là cách xưng hô thân mật, nghĩa gần với “bạn, cậu, mày” tùy quan hệ và ngữ cảnh.', childExample:'Khi nói với bạn rất thân, người lớn ở địa phương đôi khi dùng “mi”.' },
  { id:'pn-tau', term:'tau', aliases:['tao','tau đây'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Tau” là cách nói địa phương của “tao/tôi”, thường dùng trong quan hệ rất thân hoặc ngang hàng; học sinh nên dùng cách xưng hô lịch sự phù hợp.' },
  { id:'pn-han', term:'hắn', aliases:['hắn đó'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Hắn” nghĩa là “người ấy, bạn ấy, anh ấy/cô ấy” tùy ngữ cảnh.' },
  { id:'pn-ong', term:'ổng', aliases:['ông ấy'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Ổng” là cách nói thân mật của “ông ấy”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/nguoi-quang-qua-phuong-ngu-quang-3028970.html' },
  { id:'pn-ba', term:'bả', aliases:['bà ấy'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Bả” là cách nói thân mật của “bà ấy”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/nguoi-quang-qua-phuong-ngu-quang-3028970.html' },
  { id:'pn-man', term:'mần', aliases:['mần chi','mần ăn'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Mần” nghĩa là “làm”.', childExample:'“Mần chi?” nghĩa là “Làm gì?”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/nguoi-quang-qua-phuong-ngu-quang-3028970.html' },
  { id:'pn-man-an', term:'mần ăn', aliases:['làm ăn'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Mần ăn” nghĩa là “làm ăn, làm việc để sinh sống”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/nguoi-quang-qua-phuong-ngu-quang-3028970.html' },
  { id:'pn-ri', term:'rị', aliases:['rị lại','rị qua'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Rị” nghĩa là “kéo”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/bien-soan-tu-dien-phuong-ngu-quang-nam-3028749.html' },
  { id:'pn-nau', term:'nậu', aliases:['nậu rỗi'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Nậu” có thể chỉ người thuộc một địa phương hay một nhóm người trong cách nói dân gian xứ Quảng.', sourceLabel:'Báo Quảng Nam - Từ điển phương ngữ', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-ngang', term:'ngẳng', aliases:['ngẳng lắm'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Ngẳng” nghĩa là “nghịch ngợm”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-ngat', term:'ngặt', aliases:['ngặt quá','ngặt nghèo'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Ngặt” nghĩa là “khó, khó khăn”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-nham', term:'nhằm', aliases:['nói nhằm','đúng nhằm'], category:'phuong-ngu', stations:['common'], shortDefinition:'Trong một số cách nói xứ Quảng, “nhằm” có nghĩa là “đúng, không sai”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-moi', term:'mỏi', aliases:['mỏi bụng'], category:'phuong-ngu', stations:['common'], shortDefinition:'Trong một số cách nói xứ Quảng, “mỏi” có thể nghĩa là “đói”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-ung', term:'ưng', aliases:['ưng ý','có ưng không'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Ưng” nghĩa là “vừa ý, đồng ý, thích”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-um', term:'ủm', aliases:['ủm em','ủm con'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Ủm” nghĩa là “ôm vào lòng, bế ôm”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-tro', term:'trớ', aliases:['trớ đi','trớ được'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Trớ” nghĩa là “né, tránh”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-thui', term:'thụi', aliases:['thụi áo','cái thụi'], category:'phuong-ngu', stations:['common'], shortDefinition:'Tùy ngữ cảnh, “thụi” có thể chỉ hành động đấm hoặc chỉ túi áo trong cách nói dân gian địa phương.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-thung-diem', term:'thùng diêm', aliases:['hộp quẹt','bao diêm'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Thùng diêm” là cách gọi cũ của hộp quẹt hoặc bao diêm.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-2-tu-dien-phuong-ngu-quang-nam-3000216.html' },
  { id:'pn-hom-ray', term:'hởm rày', aliases:['chàu rày','dạo rày'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Hởm rày/Chàu rày” nghĩa là “dạo gần đây”.', sourceLabel:'Trung tâm Quản lý Bảo tồn Di sản Hội An', sourceUrl:'https://hoianheritage.net/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/mot-so-dac-diem-tu-ngu-dia-phuong-trong-ca-dao-quang-nam-508.html' },
  { id:'pn-xua-ray', term:'xưa rày', aliases:['lâu nay'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Xưa rày” nghĩa là “lâu nay, từ trước đến giờ”.', sourceLabel:'Trung tâm Quản lý Bảo tồn Di sản Hội An', sourceUrl:'https://hoianheritage.net/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/mot-so-dac-diem-tu-ngu-dia-phuong-trong-ca-dao-quang-nam-508.html' },
  { id:'pn-hoi-gio', term:'hồi giờ', aliases:['nãy giờ'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Hồi giờ” nghĩa là “nãy giờ, từ lúc nãy đến giờ”.', sourceLabel:'Trung tâm Quản lý Bảo tồn Di sản Hội An', sourceUrl:'https://hoianheritage.net/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/mot-so-dac-diem-tu-ngu-dia-phuong-trong-ca-dao-quang-nam-508.html' },
  { id:'pn-khi-hoi', term:'khi hồi', aliases:['lúc nãy'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Khi hồi” nghĩa là “lúc nãy”.', sourceLabel:'Trung tâm Quản lý Bảo tồn Di sản Hội An', sourceUrl:'https://hoianheritage.net/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/mot-so-dac-diem-tu-ngu-dia-phuong-trong-ca-dao-quang-nam-508.html' },
  { id:'pn-chung-mo', term:'chừng mô', aliases:['bao lâu','bao nhiêu'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Chừng mô” có thể nghĩa là “khoảng bao lâu” hoặc “khoảng bao nhiêu”, tùy câu.', sourceLabel:'Trung tâm Quản lý Bảo tồn Di sản Hội An', sourceUrl:'https://hoianheritage.net/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/mot-so-dac-diem-tu-ngu-dia-phuong-trong-ca-dao-quang-nam-508.html' },
  { id:'pn-khi-khong', term:'khi không', aliases:['tự nhiên','bỗng dưng'], category:'phuong-ngu', stations:['common'], shortDefinition:'Trong cách nói địa phương, “khi không” có thể nghĩa là “bỗng dưng, tự nhiên”.', sourceLabel:'Trung tâm Quản lý Bảo tồn Di sản Hội An', sourceUrl:'https://hoianheritage.net/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/mot-so-dac-diem-tu-ngu-dia-phuong-trong-ca-dao-quang-nam-508.html' },
  { id:'pn-co-may', term:'cớ mấy', aliases:['khoảng bao nhiêu'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Cớ mấy” nghĩa là “khoảng bao nhiêu”.', sourceLabel:'Trung tâm Quản lý Bảo tồn Di sản Hội An', sourceUrl:'https://hoianheritage.net/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/mot-so-dac-diem-tu-ngu-dia-phuong-trong-ca-dao-quang-nam-508.html' },
  { id:'pn-xa-ngai', term:'xa ngái', aliases:['xa lắm'], category:'phuong-ngu', stations:['common'], shortDefinition:'“Xa ngái” nghĩa là “rất xa, xa lắm”.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/phuong-ngu-quang-nam-bai-1-di-tim-goc-gac-cua-phuong-ngu-3000217.html' },
  { id:'pn-thom', term:'thơm', aliases:['trái thơm','quả thơm','dứa'], category:'phuong-ngu', stations:['common'], shortDefinition:'Ở miền Trung và nhiều nơi phía Nam, “thơm” là cách gọi quả dứa.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/bien-soan-tu-dien-phuong-ngu-quang-nam-3028749.html' },
  { id:'pn-mi-san', term:'mì', aliases:['củ mì','sắn'], category:'phuong-ngu', stations:['common'], shortDefinition:'Trong cách gọi địa phương, “mì” có thể chỉ củ sắn.', childExample:'“Khoai mì” là củ sắn.', sourceLabel:'Báo Quảng Nam', sourceUrl:'https://baoquangnam.vn/bien-soan-tu-dien-phuong-ngu-quang-nam-3028749.html' },

  // ===== TỪ KHÓ CHUNG VỀ DI SẢN - HỌC TẬP =====
  { id:'tk-di-san', term:'di sản', aliases:['di san'], category:'di-san', stations:['common'], shortDefinition:'Di sản là những giá trị quý do thiên nhiên hoặc con người để lại và cần được gìn giữ cho mai sau.' },
  { id:'tk-bao-ton', term:'bảo tồn', aliases:['bao ton','gìn giữ'], category:'di-san', stations:['common'], shortDefinition:'Bảo tồn là gìn giữ và bảo vệ để một giá trị quý không bị mất đi hoặc hư hỏng.' },
  { id:'tk-phat-huy', term:'phát huy giá trị', aliases:['phat huy','phát huy'], category:'di-san', stations:['common'], shortDefinition:'Phát huy giá trị là giúp nhiều người hiểu, trân trọng và sử dụng những giá trị tốt đẹp một cách phù hợp.' },
  { id:'tk-di-tich', term:'di tích', aliases:['di tich'], category:'lich-su', stations:['common'], shortDefinition:'Di tích là công trình, địa điểm hoặc dấu vết còn lại có giá trị về lịch sử, văn hóa hoặc khoa học.' },
  { id:'tk-danh-thang', term:'danh thắng', aliases:['danh thang','thắng cảnh'], category:'dia-ly', stations:['common','ngu-hanh-son'], shortDefinition:'Danh thắng là nơi có cảnh đẹp nổi bật và thường có giá trị về thiên nhiên, lịch sử hoặc văn hóa.' },
  { id:'tk-truyen-thong', term:'truyền thống', aliases:['truyen thong'], category:'van-hoa', stations:['common'], shortDefinition:'Truyền thống là những điều tốt đẹp được nhiều thế hệ gìn giữ và truyền lại.' },
  { id:'tk-ban-sac', term:'bản sắc', aliases:['ban sac'], category:'van-hoa', stations:['common'], shortDefinition:'Bản sắc là những nét riêng giúp ta nhận ra một cộng đồng, vùng đất hay nền văn hóa.' },
  { id:'tk-tin-nguong', term:'tín ngưỡng', aliases:['tin nguong'], category:'van-hoa', stations:['common','ngu-hanh-son','hoi-an'], shortDefinition:'Tín ngưỡng là niềm tin và cách thực hành tinh thần của cộng đồng; khi tham quan nơi tín ngưỡng cần giữ thái độ tôn trọng.' },
  { id:'tk-le-hoi', term:'lễ hội', aliases:['le hoi'], category:'van-hoa', stations:['common','ngu-hanh-son'], shortDefinition:'Lễ hội là hoạt động cộng đồng có nghi lễ, sinh hoạt văn hóa hoặc vui chơi được tổ chức vào dịp nhất định.' },
  { id:'tk-lang-nghe', term:'làng nghề', aliases:['lang nghe','nghề truyền thống'], category:'van-hoa', stations:['common','ngu-hanh-son'], shortDefinition:'Làng nghề là nơi nhiều người cùng làm một nghề truyền thống và truyền kinh nghiệm qua nhiều thế hệ.' },
  { id:'tk-nghe-nhan', term:'nghệ nhân', aliases:['nghe nhan'], category:'van-hoa', stations:['common','ngu-hanh-son'], shortDefinition:'Nghệ nhân là người có tay nghề và hiểu biết sâu về một nghề hoặc loại hình văn hóa truyền thống.' },

  // ===== BẢO TÀNG ĐÀ NẴNG =====
  { id:'bt-bao-tang', term:'bảo tàng', aliases:['bao tang'], category:'di-san', stations:['bao-tang-da-nang'], shortDefinition:'Bảo tàng là nơi sưu tầm, bảo quản, nghiên cứu và giới thiệu tài liệu, hiện vật để mọi người tìm hiểu lịch sử, văn hóa và nghệ thuật.' },
  { id:'bt-hien-vat', term:'hiện vật', aliases:['hien vat','đồ vật trưng bày'], category:'di-san', stations:['bao-tang-da-nang'], shortDefinition:'Hiện vật là đồ vật hoặc mẫu vật được lưu giữ vì có giá trị giúp chúng ta tìm hiểu một câu chuyện, thời kỳ hay nền văn hóa.' },
  { id:'bt-co-vat', term:'cổ vật', aliases:['co vat'], category:'lich-su', stations:['bao-tang-da-nang'], shortDefinition:'Cổ vật là hiện vật có tuổi đời lâu năm và có giá trị đặc biệt về lịch sử, văn hóa hoặc khoa học.' },
  { id:'bt-tu-lieu', term:'tư liệu', aliases:['tu lieu','tài liệu'], category:'lich-su', stations:['bao-tang-da-nang'], shortDefinition:'Tư liệu là nguồn thông tin dùng để tìm hiểu và kiểm chứng một vấn đề, như văn bản, ảnh, bản đồ, ghi chép hoặc hiện vật.' },
  { id:'bt-khao-co', term:'khảo cổ', aliases:['khao co','khảo cổ học'], category:'lich-su', stations:['bao-tang-da-nang'], shortDefinition:'Khảo cổ học tìm hiểu quá khứ qua những dấu tích và đồ vật còn lại trong lòng đất hoặc ở các địa điểm cổ.' },
  { id:'bt-trung-bay', term:'trưng bày', aliases:['trung bay'], category:'di-san', stations:['bao-tang-da-nang'], shortDefinition:'Trưng bày là sắp xếp và giới thiệu hiện vật, hình ảnh hoặc tác phẩm để người xem dễ quan sát và tìm hiểu.' },
  { id:'bt-suu-tam', term:'sưu tầm', aliases:['suu tam'], category:'di-san', stations:['bao-tang-da-nang'], shortDefinition:'Sưu tầm là tìm kiếm, lựa chọn và thu thập những tài liệu hoặc hiện vật có giá trị.' },
  { id:'bt-bao-quan', term:'bảo quản', aliases:['bao quan'], category:'di-san', stations:['bao-tang-da-nang'], shortDefinition:'Bảo quản là giữ hiện vật trong điều kiện phù hợp để hạn chế hư hỏng.' },
  { id:'bt-my-thuat', term:'mỹ thuật', aliases:['my thuat'], category:'nghe-thuat', stations:['bao-tang-da-nang'], shortDefinition:'Mỹ thuật là nghệ thuật tạo nên hình ảnh và hình khối, như hội họa, điêu khắc, đồ họa.' },
  { id:'bt-son-dau', term:'sơn dầu', aliases:['son dau'], category:'nghe-thuat', stations:['bao-tang-da-nang'], shortDefinition:'Sơn dầu là loại màu dùng chất dầu làm chất kết dính, thường được dùng để vẽ tranh.' },
  { id:'bt-son-mai', term:'sơn mài', aliases:['son mai'], category:'nghe-thuat', stations:['bao-tang-da-nang'], shortDefinition:'Sơn mài là kỹ thuật tạo tác mỹ thuật dùng nhiều lớp sơn và vật liệu để tạo bề mặt có chiều sâu, bóng và bền.' },
  { id:'bt-dieu-khac', term:'điêu khắc', aliases:['dieu khac','tạc tượng'], category:'nghe-thuat', stations:['bao-tang-da-nang','ngu-hanh-son'], shortDefinition:'Điêu khắc là nghệ thuật tạo hình khối bằng cách tạc, đục, nặn, đúc hoặc ghép vật liệu.' },
  { id:'bt-thu-cong-my-nghe', term:'thủ công mỹ nghệ', aliases:['thu cong my nghe'], category:'nghe-thuat', stations:['bao-tang-da-nang','ngu-hanh-son'], shortDefinition:'Thủ công mỹ nghệ là sản phẩm được làm chủ yếu bằng tay, vừa có công dụng vừa có giá trị thẩm mỹ.' },
  { id:'bt-bai-choi', term:'Bài chòi', aliases:['bai choi','hát bài chòi'], category:'van-hoa', stations:['bao-tang-da-nang','common'], shortDefinition:'Bài chòi là loại hình văn hóa dân gian kết hợp trò chơi, lời hát, thơ ca và diễn xướng, rất đặc trưng ở miền Trung.' },

  // ===== THÀNH ĐIỆN HẢI =====
  { id:'tdh-thanh-luy', term:'thành lũy', aliases:['thanh luy','thành'], category:'lich-su', stations:['thanh-dien-hai'], shortDefinition:'Thành lũy là công trình có tường và các bộ phận bảo vệ, được xây để phòng thủ một khu vực.' },
  { id:'tdh-phao-dai', term:'pháo đài', aliases:['phao dai'], category:'lich-su', stations:['thanh-dien-hai'], shortDefinition:'Pháo đài là công trình quân sự kiên cố dùng để bảo vệ một vị trí quan trọng.' },
  { id:'tdh-hao', term:'hào', aliases:['hào thành','hao thanh'], category:'lich-su', stations:['thanh-dien-hai'], shortDefinition:'Hào thành là khoảng đất thấp hoặc rãnh lớn chạy quanh thành, góp phần làm cho việc tiếp cận thành khó hơn.' },
  { id:'tdh-phong-tuyen', term:'phòng tuyến', aliases:['phong tuyen'], category:'lich-su', stations:['thanh-dien-hai'], shortDefinition:'Phòng tuyến là khu vực hoặc hệ thống vị trí được tổ chức để bảo vệ và ngăn đối phương tiến vào.' },
  { id:'tdh-dai-bac', term:'đại bác', aliases:['dai bac','pháo'], category:'lich-su', stations:['thanh-dien-hai'], shortDefinition:'Đại bác là loại vũ khí lớn dùng trong chiến trận thời trước; ở Thành Điện Hải, dấu tích đại bác giúp chúng ta hình dung nhiệm vụ phòng thủ của thành.' },
  { id:'tdh-phong-thu', term:'phòng thủ', aliases:['phong thu','bảo vệ thành'], category:'lich-su', stations:['thanh-dien-hai'], shortDefinition:'Phòng thủ là tổ chức lực lượng và công trình để bảo vệ một nơi trước sự tấn công.' },
  { id:'tdh-xam-luoc', term:'xâm lược', aliases:['xam luoc'], category:'lich-su', stations:['thanh-dien-hai'], shortDefinition:'Xâm lược là dùng vũ lực chiếm đất hoặc ép buộc một quốc gia, vùng đất khác.' },
  { id:'tdh-lien-quan', term:'liên quân', aliases:['lien quan'], category:'lich-su', stations:['thanh-dien-hai'], shortDefinition:'Liên quân là lực lượng quân sự gồm quân của từ hai bên hoặc hai nước trở lên cùng tham gia.' },
  { id:'tdh-nguyen-tri-phuong', term:'Nguyễn Tri Phương', aliases:['nguyen tri phuong','ông Nguyễn Tri Phương'], category:'nhan-vat', stations:['thanh-dien-hai','danh-nhan-xu-quang'], shortDefinition:'Nguyễn Tri Phương là vị tướng có vai trò quan trọng trong việc chỉ huy quân dân bảo vệ Đà Nẵng trước cuộc tấn công của liên quân Pháp - Tây Ban Nha giữa thế kỷ XIX.', related:['Thành Điện Hải'] },
  { id:'tdh-di-tich-qgdb', term:'di tích quốc gia đặc biệt', aliases:['quốc gia đặc biệt','di tich quoc gia dac biet'], category:'di-san', stations:['thanh-dien-hai','ngu-hanh-son'], shortDefinition:'Đây là danh hiệu dành cho di tích có giá trị đặc biệt tiêu biểu của đất nước và được Nhà nước bảo vệ ở mức cao.' },

  // ===== NGŨ HÀNH SƠN =====
  { id:'nhs-ngu-hanh', term:'ngũ hành', aliases:['ngu hanh','kim mộc thủy hỏa thổ'], category:'van-hoa', stations:['ngu-hanh-son'], shortDefinition:'“Ngũ hành” là năm yếu tố Kim, Mộc, Thủy, Hỏa, Thổ trong quan niệm phương Đông.' },
  { id:'nhs-nui-da-voi', term:'núi đá vôi', aliases:['nui da voi'], category:'dia-ly', stations:['ngu-hanh-son'], shortDefinition:'Núi đá vôi là núi hình thành chủ yếu từ đá vôi. Nước có thể hòa tan đá theo thời gian và góp phần tạo nên hang động, hốc đá.' },
  { id:'nhs-hang-dong', term:'hang động', aliases:['hang dong','hang'], category:'dia-ly', stations:['ngu-hanh-son'], shortDefinition:'Hang động là khoảng rỗng tự nhiên trong núi hoặc dưới đất, được hình thành qua thời gian rất dài.' },
  { id:'nhs-ma-nhai', term:'ma nhai', aliases:['ma nhai','chữ khắc trên đá','văn tự khắc đá'], category:'di-san', stations:['ngu-hanh-son'], shortDefinition:'Ma nhai là chữ hoặc bài văn được khắc trực tiếp lên vách đá, giúp người sau tìm hiểu lịch sử và văn hóa.' },
  { id:'nhs-bia-da', term:'bia đá', aliases:['bia da'], category:'di-san', stations:['ngu-hanh-son'], shortDefinition:'Bia đá là phiến đá có khắc chữ hoặc hình để ghi lại sự việc, tên tuổi hay thông tin quan trọng.' },
  { id:'nhs-non-nuoc', term:'làng đá mỹ nghệ Non Nước', aliases:['Non Nước','lang da non nuoc','làng đá'], category:'van-hoa', stations:['ngu-hanh-son'], shortDefinition:'Làng đá mỹ nghệ Non Nước là làng nghề truyền thống ở khu vực Ngũ Hành Sơn, nổi tiếng với nghề chế tác và điêu khắc đá.' },
  { id:'nhs-kim', term:'Kim Sơn', aliases:['kim son'], category:'dia-danh', stations:['ngu-hanh-son'], shortDefinition:'Kim Sơn là một trong các ngọn núi thuộc quần thể Ngũ Hành Sơn.' },
  { id:'nhs-moc', term:'Mộc Sơn', aliases:['moc son'], category:'dia-danh', stations:['ngu-hanh-son'], shortDefinition:'Mộc Sơn là một trong các ngọn núi thuộc quần thể Ngũ Hành Sơn.' },
  { id:'nhs-thuy', term:'Thủy Sơn', aliases:['thuy son'], category:'dia-danh', stations:['ngu-hanh-son'], shortDefinition:'Thủy Sơn là ngọn núi nổi tiếng và có nhiều điểm tham quan trong quần thể Ngũ Hành Sơn.' },
  { id:'nhs-tho', term:'Thổ Sơn', aliases:['tho son'], category:'dia-danh', stations:['ngu-hanh-son'], shortDefinition:'Thổ Sơn là một trong các ngọn núi thuộc quần thể Ngũ Hành Sơn.' },
  { id:'nhs-duong-hoa', term:'Dương Hỏa Sơn', aliases:['duong hoa son'], category:'dia-danh', stations:['ngu-hanh-son'], shortDefinition:'Dương Hỏa Sơn là một trong hai ngọn mang yếu tố Hỏa trong quần thể Ngũ Hành Sơn.' },
  { id:'nhs-am-hoa', term:'Âm Hỏa Sơn', aliases:['am hoa son'], category:'dia-danh', stations:['ngu-hanh-son'], shortDefinition:'Âm Hỏa Sơn là một trong hai ngọn mang yếu tố Hỏa trong quần thể Ngũ Hành Sơn.' },
  { id:'nhs-sao-sau-nui', term:'vì sao Ngũ Hành Sơn có sáu ngọn núi', aliases:['ngũ là năm sao có sáu núi','5 hành 6 núi'], category:'dia-ly', stations:['ngu-hanh-son'], shortDefinition:'Tên Ngũ Hành gắn với năm yếu tố Kim, Mộc, Thủy, Hỏa, Thổ; riêng yếu tố Hỏa có hai ngọn là Âm Hỏa Sơn và Dương Hỏa Sơn nên toàn quần thể có sáu ngọn núi.' },

  // ===== HỘI AN =====
  { id:'ha-thuong-cang', term:'thương cảng', aliases:['thuong cang','cảng thị'], category:'lich-su', stations:['hoi-an'], shortDefinition:'Thương cảng là nơi tàu thuyền đến buôn bán, trao đổi hàng hóa. Hội An từng là một thương cảng quốc tế quan trọng.' },
  { id:'ha-thuong-nhan', term:'thương nhân', aliases:['thuong nhan','người buôn'], category:'lich-su', stations:['hoi-an'], shortDefinition:'Thương nhân là người làm nghề buôn bán, trao đổi hàng hóa.' },
  { id:'ha-giao-thuong', term:'giao thương', aliases:['giao thuong','buôn bán'], category:'lich-su', stations:['hoi-an'], shortDefinition:'Giao thương là hoạt động trao đổi, mua bán hàng hóa giữa người dân, vùng đất hoặc các nước.' },
  { id:'ha-giao-thoa', term:'giao thoa văn hóa', aliases:['giao thoa','giao lưu văn hóa'], category:'van-hoa', stations:['hoi-an'], shortDefinition:'Giao thoa văn hóa là khi các cộng đồng gặp gỡ, trao đổi và để lại những ảnh hưởng văn hóa cho nhau.' },
  { id:'ha-do-thi-co', term:'đô thị cổ', aliases:['do thi co','phố cổ'], category:'lich-su', stations:['hoi-an'], shortDefinition:'Đô thị cổ là khu phố hình thành từ lâu đời và còn lưu giữ nhiều công trình, đường phố, nếp sống có giá trị lịch sử.' },
  { id:'ha-hoi-quan', term:'hội quán', aliases:['hoi quan'], category:'van-hoa', stations:['hoi-an'], shortDefinition:'Hội quán là nơi cộng đồng cùng quê hoặc cùng nhóm gặp gỡ, sinh hoạt và thực hành tín ngưỡng; ở Hội An, nhiều hội quán gắn với cộng đồng người Hoa.' },
  { id:'ha-cu-dan', term:'cư dân', aliases:['cu dan','người dân sinh sống'], category:'tu-kho', stations:['hoi-an','common'], shortDefinition:'Cư dân là những người sinh sống trong một khu vực.' },
  { id:'ha-ben-thuyen', term:'bến thuyền', aliases:['ben thuyen','bến'], category:'dia-ly', stations:['hoi-an'], shortDefinition:'Bến thuyền là nơi thuyền dừng, đón trả người hoặc bốc dỡ hàng hóa.' },
  { id:'ha-chua-cau', term:'Chùa Cầu', aliases:['chua cau','Cầu Nhật Bản','Japanese Bridge'], category:'dia-danh', stations:['hoi-an'], shortDefinition:'Chùa Cầu là công trình nổi tiếng của Hội An, vừa là cây cầu có mái che vừa có một ngôi miếu nhỏ, gợi dấu ấn giao lưu văn hóa trong thương cảng xưa.' },
  { id:'ha-lai-vien-kieu', term:'Lai Viễn Kiều', aliases:['lai vien kieu'], category:'tu-kho', stations:['hoi-an'], shortDefinition:'“Lai Viễn Kiều” là tên gọi của Chùa Cầu; có thể hiểu gần nghĩa là cây cầu dành cho khách từ phương xa đến.' },
  { id:'ha-song-hoai', term:'Sông Hoài', aliases:['song hoai','Hoài River'], category:'dia-danh', stations:['hoi-an'], shortDefinition:'Sông Hoài là dòng sông gắn với khu phố cổ Hội An, bến thuyền và nhịp sống của thương cảng.' },
  { id:'ha-nha-co', term:'nhà cổ', aliases:['nha co'], category:'di-san', stations:['hoi-an'], shortDefinition:'Nhà cổ là ngôi nhà có lịch sử lâu đời và còn giữ nhiều đặc điểm kiến trúc, vật liệu hoặc cách bố trí xưa.' },
  { id:'ha-unesco', term:'UNESCO', aliases:['unesco'], category:'di-san', stations:['hoi-an','ngu-hanh-son'], shortDefinition:'UNESCO là Tổ chức Giáo dục, Khoa học và Văn hóa của Liên Hợp Quốc, có nhiều chương trình ghi danh và bảo vệ các giá trị di sản.' },
  { id:'ha-di-san-the-gioi', term:'Di sản văn hóa thế giới', aliases:['di san van hoa the gioi','world heritage'], category:'di-san', stations:['hoi-an'], shortDefinition:'Đây là danh hiệu UNESCO dành cho di sản văn hóa có giá trị nổi bật đối với toàn nhân loại và cần được bảo vệ.' },

  // ===== DANH NHÂN XỨ QUẢNG =====
  { id:'dn-danh-nhan', term:'danh nhân', aliases:['danh nhan'], category:'nhan-vat', stations:['danh-nhan-xu-quang'], shortDefinition:'Danh nhân là người có tài năng, phẩm chất hoặc đóng góp nổi bật và được nhiều thế hệ ghi nhớ.' },
  { id:'dn-chi-si', term:'chí sĩ', aliases:['chi si','chí sĩ yêu nước'], category:'lich-su', stations:['danh-nhan-xu-quang'], shortDefinition:'Chí sĩ là người có chí lớn, thường dùng để gọi những người có tinh thần yêu nước và dấn thân vì xã hội trong lịch sử.' },
  { id:'dn-canh-tan', term:'canh tân', aliases:['canh tan','đổi mới'], category:'lich-su', stations:['danh-nhan-xu-quang'], shortDefinition:'Canh tân nghĩa là đổi mới để làm cho đất nước hoặc xã hội tiến bộ hơn.' },
  { id:'dn-duy-tan', term:'Duy Tân', aliases:['duy tan','phong trào Duy Tân'], category:'lich-su', stations:['danh-nhan-xu-quang'], shortDefinition:'Phong trào Duy Tân đầu thế kỷ XX thể hiện mong muốn đổi mới đất nước, coi trọng học tập, mở mang hiểu biết và tinh thần tự lực.' },
  { id:'dn-dan-tri', term:'dân trí', aliases:['dan tri','khai dân trí'], category:'tu-kho', stations:['danh-nhan-xu-quang'], shortDefinition:'Dân trí là trình độ hiểu biết, học vấn của người dân. “Khai dân trí” là mở mang tri thức và việc học cho người dân.' },
  { id:'dn-dan-khi', term:'dân khí', aliases:['dan khi','chấn dân khí'], category:'tu-kho', stations:['danh-nhan-xu-quang'], shortDefinition:'“Dân khí” có thể hiểu là tinh thần, ý chí và lòng tự tin của người dân. “Chấn dân khí” là khơi dậy tinh thần ấy.' },
  { id:'dn-dan-sinh', term:'dân sinh', aliases:['dan sinh','hậu dân sinh'], category:'tu-kho', stations:['danh-nhan-xu-quang'], shortDefinition:'Dân sinh là đời sống của người dân. “Hậu dân sinh” nhấn mạnh việc chăm lo để đời sống người dân tốt hơn.' },
  { id:'dn-khau-hieu-pct', term:'Khai dân trí, chấn dân khí, hậu dân sinh', aliases:['khai dân trí chấn dân khí hậu dân sinh'], category:'lich-su', stations:['danh-nhan-xu-quang'], shortDefinition:'Đây là tư tưởng gắn với Phan Châu Trinh: coi trọng mở mang tri thức, khơi dậy ý chí và chăm lo đời sống của người dân.' },
  { id:'dn-hieu-hoc', term:'hiếu học', aliases:['hieu hoc'], category:'van-hoa', stations:['danh-nhan-xu-quang','common'], shortDefinition:'Hiếu học là yêu thích việc học, ham hiểu biết và cố gắng học tập.' },
  { id:'dn-khi-tiet', term:'khí tiết', aliases:['khi tiet'], category:'tu-kho', stations:['danh-nhan-xu-quang'], shortDefinition:'Khí tiết là phẩm chất kiên định, giữ điều mình cho là đúng và không dễ khuất phục trước khó khăn.' },
  { id:'dn-nha-luu-niem', term:'nhà lưu niệm', aliases:['nha luu niem'], category:'di-san', stations:['danh-nhan-xu-quang'], shortDefinition:'Nhà lưu niệm là nơi lưu giữ tư liệu, hình ảnh, kỷ vật để tưởng nhớ và tìm hiểu về một nhân vật hoặc sự kiện.' },
  { id:'dn-huynh-thuc-khang', term:'Huỳnh Thúc Kháng', aliases:['huynh thuc khang','cụ Huỳnh'], category:'nhan-vat', stations:['danh-nhan-xu-quang'], shortDefinition:'Huỳnh Thúc Kháng là một chí sĩ yêu nước tiêu biểu của đất Quảng, nổi bật bởi tinh thần hiếu học, khí tiết và trách nhiệm với nhân dân.' },
  { id:'dn-phan-chau-trinh', term:'Phan Châu Trinh', aliases:['phan chau trinh','cụ Phan'], category:'nhan-vat', stations:['danh-nhan-xu-quang'], shortDefinition:'Phan Châu Trinh là nhà yêu nước tiêu biểu, đề cao việc học, mở mang dân trí và canh tân đất nước.' },
];

export const DANANG_DIALECT_NORMALIZATION: Record<string, string> = {
  'ở mô': 'ở đâu',
  'mô': 'đâu',
  'đằng tê': 'đằng kia',
  'bên tê': 'bên kia',
  'cái ni': 'cái này',
  'bên ni': 'bên này',
  'bên nớ': 'bên đó',
  'cái nớ': 'cái đó',
  'răng rứa': 'sao vậy',
  'tại răng': 'tại sao',
  'răng': 'sao',
  'chi rứa': 'gì vậy',
  'cái chi': 'cái gì',
  'điều chi': 'điều gì',
  'làm chi': 'làm gì',
  'chi': 'gì',
  'rứa': 'vậy',
  'bây chừ': 'bây giờ',
  'chừ': 'bây giờ',
  'mần chi': 'làm gì',
  'mần': 'làm',
  'xa ngái': 'rất xa',
  'hởm rày': 'dạo gần đây',
  'chàu rày': 'dạo gần đây',
  'xưa rày': 'lâu nay',
  'hồi giờ': 'nãy giờ',
  'khi hồi': 'lúc nãy',
  'chừng mô': 'khoảng bao lâu',
  'cớ mấy': 'khoảng bao nhiêu',
};

export const DANANG_ASSISTANT_HELP_RESPONSE =
  'Mình có thể giúp bạn khám phá Đà Nẵng đó! 😊\nBạn có thể hỏi mình về:\n\n- nghĩa của từ khó hoặc từ địa phương,\n- một địa danh ở đâu,\n- chuyện lịch sử liên quan đến bài học,\n- nhân vật, di tích, danh thắng,\n- văn hóa, làng nghề, sông núi,\n- hoặc hỏi “điều này liên quan gì đến bài đang học?”.\n\nNếu bạn đang ở một trạm cụ thể, mình sẽ ưu tiên trả lời theo đúng trạm đó trước nhé. 🌟';

export function normalizeDanangDialect(input: string): string {
  let normalized = input.trim().toLowerCase();
  Object.entries(DANANG_DIALECT_NORMALIZATION)
    .sort(([a], [b]) => b.length - a.length)
    .forEach(([local, standard]) => {
      normalized = normalized.replaceAll(local, standard);
    });
  return normalized;
}
