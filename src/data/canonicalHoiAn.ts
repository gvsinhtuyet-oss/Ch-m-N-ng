import { Station } from '../types';

const CURRENT_G2_SOURCE = {
  id: 'src-g2-current-book-hoian',
  title: 'Tài liệu Giáo dục địa phương thành phố Đà Nẵng lớp 2 đang sử dụng – Di sản văn hóa thế giới Hội An',
  organization: 'Sở Giáo dục và Đào tạo thành phố Đà Nẵng',
  sourceType: 'official_curriculum' as const,
  verified: true,
};

export const CANONICAL_HOI_AN_STATION: Station = {
  id: 'g2-station-4',
  number: 2,
  grade: 2,
  themeId: 'II',
  themeNameVi: 'Lịch sử, truyền thống và di sản văn hóa',
  themeNameEn: 'History, Tradition and Cultural Heritage',
  titleVi: 'Di sản văn hóa thế giới Hội An',
  titleEn: 'Hoi An World Cultural Heritage',
  subtitleVi: 'Quan sát phố cổ – nhận biết công trình, hoạt động văn hóa và làng nghề',
  subtitleEn: 'Explore ancient streets, heritage buildings, cultural activities and craft villages',
  coverImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hoi%20An%20Ancient%20Town.jpg',
  openingMessageVi: 'Chào mừng em đến với phố cổ Hội An! Hãy cùng quan sát những con đường, công trình cổ, hoạt động văn hóa và làng nghề được giới thiệu trong tài liệu lớp 2 nhé!',
  openingMessageEn: 'Welcome to Hoi An Ancient Town! Explore its streets, buildings, cultural activities and traditional craft villages.',
  totalPeriods: 7,
  officialCurriculumReference: 'Tài liệu GDĐP TP Đà Nẵng lớp 2 đang sử dụng – Chủ đề 2: Di sản văn hóa thế giới Hội An',
  isFullyVerified: true,
  vr360Experience: {
    url: 'https://vr360.com.vn/projects/hoian-metaverse/',
    provider: 'custom_web',
    titleVi: 'Khám phá Hội An 360°',
    titleEn: 'Discover Hoi An 360°',
    verified: true,
    embedMode: 'iframe',
    fallbackUrl: 'https://vr360.com.vn/projects/hoian-metaverse/',
    sourceName: 'VR360 – Hội An Metaverse',
  },
  vr360PreviewImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hoi%20An%20Ancient%20Town.jpg',
  pedagogyGoals: {
    knowGoalVi: 'Nhận biết một số đặc điểm của phố cổ Hội An, các công trình tiêu biểu, hoạt động văn hóa nghệ thuật và một số làng nghề truyền thống.',
    understandGoalVi: 'Biết Hội An được UNESCO công nhận là Di sản văn hóa thế giới; nhận ra vẻ cổ kính và những nét văn hóa đặc trưng của phố cổ.',
    behaviorGoalVi: 'Biết giới thiệu Hội An, giữ gìn cảnh quan và có những việc làm phù hợp để bảo vệ di sản.',
  },
  hotspots: [
    {
      id:'hoi-an-pho-co', stationId:'g2-station-4',
      titleVi:'1. Phố cổ Hội An',
      subtitleVi:'Những con đường cổ bên dòng sông Hoài',
      image:'https://commons.wikimedia.org/wiki/Special:FilePath/Hoi%20An%20Ancient%20Town.jpg',
      narrationVi:'Phố cổ Hội An nổi bật với không gian cổ kính bên dòng sông Hoài. Năm 1999, Hội An được UNESCO công nhận là Di sản văn hóa thế giới.',
      keyFactVi:'Mốc cần nhớ: năm 1999, Hội An được UNESCO công nhận là Di sản văn hóa thế giới.',
      interaction:{id:'ha-i1',type:'single-choice',questionVi:'Hội An được UNESCO công nhận là Di sản văn hóa thế giới vào năm nào?',options:[
        {id:'a',textVi:'1999',isCorrect:true},{id:'b',textVi:'2009',isCorrect:false},{id:'c',textVi:'2019',isCorrect:false}
      ],explanationVi:'Chính xác! Năm 1999, Hội An được UNESCO công nhận là Di sản văn hóa thế giới.'},
      sources:['Tài liệu GDĐP lớp 2 hiện hành'],
      mediaRights:'LINK_ONLY',
      mediaCredit:'Wikimedia Commons – Hoi An Ancient Town',
    },
    {
      id:'hoi-an-duong-pho', stationId:'g2-station-4',
      titleVi:'2. Những con đường ở phố cổ',
      subtitleVi:'Dọc ngang kiểu bàn cờ, có những đoạn hẹp và uốn lượn',
      image:'https://commons.wikimedia.org/wiki/Special:FilePath/Hoi%20An%20-%20HoiAn1457.jpg',
      narrationVi:'Những con đường trong phố cổ Hội An có nét riêng: có đường dọc ngang theo kiểu bàn cờ, có đoạn đường hẹp và uốn lượn. Quan sát đường phố giúp em nhận ra vẻ cổ kính và gần gũi của Hội An.',
      keyFactVi:'Tài liệu lớp 2 gợi học sinh quan sát đặc điểm đường phố thay vì học những thuật ngữ kiến trúc khó.',
      interaction:{id:'ha-i2',type:'single-choice',questionVi:'Đặc điểm nào được nhắc đến về đường phố Hội An?',options:[
        {id:'a',textVi:'Có đường dọc ngang kiểu bàn cờ, có đoạn hẹp uốn lượn',isCorrect:true},{id:'b',textVi:'Chỉ có đường cao tốc',isCorrect:false},{id:'c',textVi:'Chỉ có đường hầm',isCorrect:false}
      ],explanationVi:'Đúng rồi! Đây là những đặc điểm được minh họa trong tài liệu.'},
      sources:['Tài liệu GDĐP lớp 2 hiện hành'],
      mediaRights:'LINK_ONLY',
      mediaCredit:'Wikimedia Commons – Hoi An - HoiAn1457.jpg',
    },
    {
      id:'hoi-an-cong-trinh', stationId:'g2-station-4',
      titleVi:'3. Những công trình cổ kính',
      subtitleVi:'Chùa Cầu – nhà cổ – hội quán – bảo tàng',
      image:'https://commons.wikimedia.org/wiki/Special:FilePath/Japanese%20Covered%20Bridge%20%28Cau%20Chua%20Pagoda%29%2C%20Hoi%20An%2C%20Vietnam%20%287090643937%29.jpg',
      narrationVi:'Ở phố cổ Hội An có nhiều công trình tiêu biểu như Chùa Cầu, Hội quán Phúc Kiến, Bảo tàng gốm sứ Mậu Dịch, Nhà cổ Tấn Ký và Hội quán Quảng Đông. Các công trình góp phần tạo nên vẻ cổ kính đặc trưng của phố cổ.',
      keyFactVi:'Hội quán là nơi hội họp và sinh hoạt tín ngưỡng của cộng đồng; bảo tàng là nơi trưng bày, lưu giữ tài liệu và hiện vật.',
      interaction:{id:'ha-i3',type:'single-choice',questionVi:'Công trình nào có ở phố cổ Hội An?',options:[
        {id:'a',textVi:'Chùa Cầu',isCorrect:true},{id:'b',textVi:'Tháp Eiffel',isCorrect:false},{id:'c',textVi:'Kim tự tháp',isCorrect:false}
      ],explanationVi:'Chính xác! Chùa Cầu là một công trình tiêu biểu ở Hội An.'},
      sources:['Tài liệu GDĐP lớp 2 hiện hành'],
      mediaRights:'LINK_ONLY',
      mediaCredit:'Wikimedia Commons – Japanese Covered Bridge (Cau Chua Pagoda), Hoi An, Vietnam (7090643937).jpg',
    },
    {
      id:'hoi-an-hoat-dong', stationId:'g2-station-4',
      titleVi:'4. Hoạt động văn hóa nghệ thuật',
      subtitleVi:'Lồng đèn – Bài Chòi – múa Thiên Cẩu – hoa đăng',
      image:'https://commons.wikimedia.org/wiki/Special:FilePath/Hoi%20An%20lanterns.jpg',
      narrationVi:'Phố cổ Hội An thường có nhiều hoạt động văn hóa nghệ thuật như làm lồng đèn, hô hát Bài Chòi, múa Thiên Cẩu và thả hoa đăng trên sông. Những hoạt động này làm cho không gian phố cổ thêm sinh động.',
      keyFactVi:'Tài liệu lớp 2 khuyến khích học sinh nhận biết hoạt động văn hóa qua quan sát hình ảnh.',
      interaction:{id:'ha-i4',type:'single-choice',questionVi:'Hoạt động nào được nhắc trong bài Hội An?',options:[
        {id:'a',textVi:'Làm lồng đèn',isCorrect:true},{id:'b',textVi:'Trượt tuyết',isCorrect:false},{id:'c',textVi:'Đua xe công thức 1',isCorrect:false}
      ],explanationVi:'Đúng rồi! Làm lồng đèn là một hoạt động quen thuộc ở Hội An.'},
      sources:['Tài liệu GDĐP lớp 2 hiện hành'],
      mediaRights:'LINK_ONLY',
      mediaCredit:'Wikimedia Commons – đèn lồng Hội An',
    },
    {
      id:'hoi-an-thanh-ha', stationId:'g2-station-4',
      titleVi:'5. Làng gốm Thanh Hà',
      subtitleVi:'Quan sát sản phẩm và trải nghiệm làm gốm',
      image:'https://commons.wikimedia.org/wiki/Special:FilePath/Gom%20Thanh%20Ha.JPG',
      narrationVi:'Làng gốm Thanh Hà là một làng nghề truyền thống được giới thiệu trong tài liệu lớp 2. Ở đây, em có thể quan sát cổng làng, các sản phẩm gốm và tìm hiểu cách người thợ tạo nên đồ gốm từ đất.',
      keyFactVi:'Điều cần nhớ: Thanh Hà nổi tiếng với nghề làm gốm và các sản phẩm gốm truyền thống.',
      interaction:{id:'ha-i5',type:'single-choice',questionVi:'Làng Thanh Hà nổi tiếng với nghề nào?',options:[
        {id:'a',textVi:'Làm gốm',isCorrect:true},{id:'b',textVi:'Dệt chiếu',isCorrect:false},{id:'c',textVi:'Đóng tàu',isCorrect:false}
      ],explanationVi:'Chính xác! Thanh Hà là làng gốm truyền thống.'},
      sources:['Tài liệu GDĐP lớp 2 hiện hành – hình cổng làng và sản phẩm gốm Thanh Hà'],
      mediaRights:'LINK_ONLY',
      mediaCredit:'Wikimedia Commons – Gom Thanh Ha.JPG',
    },
    {
      id:'hoi-an-tra-que', stationId:'g2-station-4',
      titleVi:'6. Làng rau Trà Quế',
      subtitleVi:'Cánh đồng rau xanh và những trải nghiệm làng nghề',
      image:'https://commons.wikimedia.org/wiki/Special:FilePath/Tra%20Que%20Village%2C%20Hoi%20An%20%2846404328621%29.jpg',
      narrationVi:'Làng rau Trà Quế có những cánh đồng rau xanh rộng lớn. Du khách đến đây có thể ngắm cảnh, tìm hiểu cách trồng rau, trải nghiệm làm đất và thưởng thức các món ăn được chế biến từ rau sạch của làng.',
      keyFactVi:'Tài liệu lớp 2 nhấn mạnh Trà Quế là điểm du lịch làng nghề, nơi du khách có thể trải nghiệm các hoạt động gắn với việc trồng rau.',
      interaction:{id:'ha-i6',type:'single-choice',questionVi:'Du khách có thể trải nghiệm hoạt động nào ở làng rau Trà Quế?',options:[
        {id:'a',textVi:'Làm đất và tìm hiểu cách trồng rau',isCorrect:true},{id:'b',textVi:'Khai thác than',isCorrect:false},{id:'c',textVi:'Luyện thép',isCorrect:false}
      ],explanationVi:'Đúng rồi! Trà Quế có các trải nghiệm gắn với việc làm đất, trồng rau và ẩm thực từ rau sạch.'},
      sources:['Tài liệu GDĐP lớp 2 hiện hành – hình làng rau Trà Quế và hoạt động trải nghiệm'],
      mediaRights:'LINK_ONLY',
      mediaCredit:'Wikimedia Commons – Tra Que Village, Hoi An (46404328621).jpg',
    },
  ],
  challenge: {
    id:'ch-hoi-an',
    titleVi:'EM HIỂU HỘI AN',
    titleEn:'Hoi An Challenge',
    platform:'internal_interactive',
    instructionsVi:'Trả lời đúng 5 câu để hoàn thành phần thực hành về Hội An.',
    completionMode:'AUTO',
    passingScore:5,
    externalGame:{
      platform:'wordwall',
      titleVi:'KHÁM PHÁ HỘI AN',
      url:'https://wordwall.net/resource/120605543?wwmethod=link',
      noteVi:'Wordwall là hoạt động luyện tập bổ sung khi có mạng; không bắt buộc để hoàn thành chặng.'
    },
    questions:[
      {id:'q1',questionVi:'Hội An được UNESCO công nhận là Di sản văn hóa thế giới năm nào?',options:[{id:'a',textVi:'1999',isCorrect:true},{id:'b',textVi:'2009',isCorrect:false},{id:'c',textVi:'2018',isCorrect:false}],hintVi:'Hãy nhớ mốc ở điểm đầu.'},
      {id:'q2',questionVi:'Công trình nào thuộc phố cổ Hội An?',options:[{id:'a',textVi:'Chùa Cầu',isCorrect:true},{id:'b',textVi:'Tháp nghiêng Pisa',isCorrect:false},{id:'c',textVi:'Tượng Nữ thần Tự do',isCorrect:false}],hintVi:'Công trình xuất hiện ngay ở phần khám phá.'},
      {id:'q3',questionVi:'Hoạt động văn hóa nào được nhắc trong bài?',options:[{id:'a',textVi:'Hô hát Bài Chòi',isCorrect:true},{id:'b',textVi:'Trượt băng',isCorrect:false},{id:'c',textVi:'Đua xe',isCorrect:false}],hintVi:'Hãy nhớ các hoạt động văn hóa nghệ thuật.'},
      {id:'q4',questionVi:'Hai làng nghề nào được giới thiệu trong bài Hội An?',options:[{id:'a',textVi:'Làng gốm Thanh Hà và làng rau Trà Quế',isCorrect:true},{id:'b',textVi:'Làng khai thác than và làng thép',isCorrect:false},{id:'c',textVi:'Làng làm máy bay và làng đóng tàu',isCorrect:false}],hintVi:'Một làng làm gốm, một làng trồng rau.'},
      {id:'q5',questionVi:'Em nên làm gì để bảo vệ cảnh quan phố cổ?',options:[{id:'a',textVi:'Giữ vệ sinh và không làm hư hại công trình',isCorrect:true},{id:'b',textVi:'Viết tên lên tường cổ',isCorrect:false},{id:'c',textVi:'Xả rác xuống sông',isCorrect:false}],hintVi:'Chọn hành vi văn minh.'},
    ],
  },
  checkIn:{
    emotions:[
      {id:'e1',emoji:'😍',labelVi:'Yêu thích',labelEn:'Love'},
      {id:'e2',emoji:'🏮',labelVi:'Ấn tượng',labelEn:'Impressed'},
      {id:'e3',emoji:'😊',labelVi:'Tự hào',labelEn:'Proud'},
    ],
    rememberPromptVi:'Điều em nhớ nhất về Hội An là gì?',
    rememberOptions:[
      {id:'r1',textVi:'Hội An là Di sản văn hóa thế giới'},
      {id:'r2',textVi:'Phố cổ có nhiều công trình cổ kính'},
      {id:'r3',textVi:'Có nhiều hoạt động văn hóa nghệ thuật'},
      {id:'r4',textVi:'Thanh Hà nổi tiếng với nghề gốm; Trà Quế nổi tiếng với làng rau và trải nghiệm trồng rau'},
    ],
    actionPromptVi:'Em sẽ làm gì để góp phần bảo vệ Hội An?',
    actionOptions:[
      {id:'a1',textVi:'Giữ vệ sinh khi tham quan'},
      {id:'a2',textVi:'Không viết vẽ lên công trình'},
      {id:'a3',textVi:'Tôn trọng không gian di sản'},
      {id:'a4',textVi:'Giới thiệu vẻ đẹp Hội An cho người thân'},
    ],
  },
  rewards:[
    {id:'rw-hoian-1',stationId:'g2-station-4',stage:1,nameVi:'ĐÈN LỒNG KHÁM PHÁ',nameEn:'Exploration Lantern',template:'hoi_an_lantern',descriptionVi:'Ghi nhận em đã khám phá các nét tiêu biểu của Hội An.'},
    {id:'rw-hoian-2',stationId:'g2-station-4',stage:2,nameVi:'HUY HIỆU PHỐ CỔ',nameEn:'Ancient Town Badge',template:'hoi_an_port_compass',descriptionVi:'Ghi nhận em đã hoàn thành phần thực hành.'},
    {id:'rw-hoian-3',stationId:'g2-station-4',stage:3,nameVi:'TRÁI TIM DI SẢN',nameEn:'Heritage Heart',template:'hoi_an_heritage_heart',descriptionVi:'Ghi nhận ý thức giữ gìn di sản.'},
  ],
  stamp:{
    id:'stamp-hoian',stationId:'g2-station-4',nameVi:'NHÀ DU HÀNH DI SẢN HỘI AN',nameEn:'Hoi An Heritage Traveler',
    iconName:'landmark',colorTheme:'#f59e0b',quoteVi:'Quan sát – yêu quý – giữ gìn vẻ đẹp Hội An'
  },
  journeyMap:{
    id:'map-g2-hoi-an',stationId:'g2-station-4',grade:2,
    titleVi:'Bản đồ hành trình Hội An',
    subtitleVi:'Phố cổ – công trình – văn hóa – làng nghề',
    image:'https://drive.google.com/thumbnail?id=1rgio5KckaUng8ERE3dtf5qYj_AbyLwFS&sz=w900',
    summaryNodes:[
      {id:'n1',titleVi:'Phố cổ',textVi:'Không gian cổ kính bên sông Hoài.',icon:'🏘️'},
      {id:'n2',titleVi:'Công trình',textVi:'Chùa Cầu, nhà cổ, hội quán, bảo tàng.',icon:'🌉'},
      {id:'n3',titleVi:'Văn hóa',textVi:'Lồng đèn, Bài Chòi, Thiên Cẩu, hoa đăng.',icon:'🏮'},
      {id:'n4',titleVi:'Thanh Hà',textVi:'Làng gốm truyền thống.',icon:'🏺'},
      {id:'n5',titleVi:'Trà Quế',textVi:'Làng rau và trải nghiệm trồng rau.',icon:'🥬'},
    ],
    knowVi:'Nhận biết một số nét tiêu biểu của phố cổ Hội An.',
    understandVi:'Biết Hội An là Di sản văn hóa thế giới và có nhiều giá trị văn hóa đặc sắc.',
    actVi:'Giữ gìn cảnh quan và giới thiệu Hội An bằng những việc làm phù hợp.',
    rewardNameVi:'Bản đồ Hội An',
    stampNameVi:'Dấu Ấn Hội An',
  },
  version:{
    stationId:'g2-station-4',
    version:'2.0.0-current-book',
    status:'IN_REVIEW',
    createdBy:'Nhóm biên soạn CHẠM ĐÀ NẴNG',
    createdAt:'2026-10-09',
    changelog:'Chuẩn hóa theo tài liệu lớp 2 hiện hành: tách riêng Làng gốm Thanh Hà và Làng rau Trà Quế; sửa ảnh từng điểm để không lặp ảnh bìa khi đường dẫn lỗi.'
  },
  sources:[CURRENT_G2_SOURCE],
};

export default CANONICAL_HOI_AN_STATION;
