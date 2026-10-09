import { Station } from '../types';
import { CANONICAL_HOI_AN_STATION } from './canonicalHoiAn';

const CURRENT_G2_SOURCE = {
  id: 'src-g2-current-book',
  title: 'Tài liệu Giáo dục địa phương thành phố Đà Nẵng lớp 2 đang sử dụng',
  organization: 'Sở Giáo dục và Đào tạo thành phố Đà Nẵng',
  sourceType: 'official_curriculum' as const,
  verified: true,
};

const G2_STATION_1: Station = {
  id: 'g2-station-1',
  number: 5,
  grade: 2,
  themeId: 'IV',
  themeNameVi: 'Hoạt động kinh tế - xã hội và nghề nghiệp',
  titleVi: 'Chiếu Cẩm Nê – Chiếu Bàn Thạch',
  coverImage: 'https://danang.gov.vn/documents/37638/981989/cam-ne-1.png/440d3b04-1bc6-de6f-0d1f-09d6ae1f7c22?t=1743578855127',
  subtitleVi: 'Theo sợi cói, tìm hiểu cách người thợ làm nên tấm chiếu truyền thống',
  openingMessageVi: 'Hãy cùng quan sát nguyên liệu, giàn dệt và đôi tay người thợ để khám phá nghề làm chiếu Cẩm Nê – Bàn Thạch nhé!',
  totalPeriods: 6,
  officialCurriculumReference: 'Tài liệu GDĐP TP Đà Nẵng lớp 2 đang sử dụng – Chủ đề 5: Chiếu Cẩm Nê – Chiếu Bàn Thạch',
  pedagogyGoals: {
    knowGoalVi: 'Nhận biết làng chiếu Cẩm Nê, Bàn Thạch; biết nguyên liệu, dụng cụ và một số bước cơ bản để làm chiếu cói.',
    understandGoalVi: 'Biết sợi cói là nguyên liệu chính; cói được phơi khô, có thể nhuộm màu và được dệt cùng sợi đay trên giàn dệt.',
    behaviorGoalVi: 'Trân trọng người làm nghề, ứng xử văn hóa khi tham quan làng nghề và biết giới thiệu sản phẩm truyền thống.',
  },
  hotspots: [
    {
      id: 'g2s1-lang-chieu', stationId: 'g2-station-1',
      titleVi: '1. Hai làng chiếu truyền thống',
      subtitleVi: 'Cẩm Nê và Bàn Thạch',
      image: 'https://danang.gov.vn/documents/37638/981989/cam-ne-1.png/440d3b04-1bc6-de6f-0d1f-09d6ae1f7c22?t=1743578855127',
      narrationVi: 'Ở thành phố Đà Nẵng có những làng nghề làm chiếu truyền thống như làng Cẩm Nê và làng Bàn Thạch. Những tấm chiếu nhiều màu sắc là sản phẩm gắn với công sức và kinh nghiệm của người thợ.',
      keyFactVi: 'Cẩm Nê và Bàn Thạch là những làng nghề làm chiếu truyền thống được giới thiệu trong tài liệu lớp 2.',
      interaction: { id:'g2s1-i1', type:'single-choice', questionVi:'Cẩm Nê và Bàn Thạch nổi tiếng với nghề nào?', options:[
        {id:'a',textVi:'Làm chiếu truyền thống',isCorrect:true},{id:'b',textVi:'Đóng tàu biển',isCorrect:false},{id:'c',textVi:'Làm kính',isCorrect:false}
      ], explanationVi:'Đúng rồi! Đây là những làng nghề làm chiếu truyền thống.' }
    },
    {
      id: 'g2s1-nguyen-lieu', stationId: 'g2-station-1',
      titleVi: '2. Nguyên liệu làm chiếu',
      subtitleVi: 'Cói là nguyên liệu chính',
      image: 'https://file3.qdnd.vn/data/images/0/2025/02/26/upload_2271/1%201.jpg',
      narrationVi: 'Nguyên liệu chính để dệt chiếu là sợi cói. Sau khi phơi khô, sợi cói có màu ngà và thường được nhuộm đỏ, xanh, vàng, tím. Sợi đay cũng được dùng trong quá trình làm chiếu.',
      keyFactVi: 'Điều cần nhớ trong sách: sợi cói là nguyên liệu chính để dệt chiếu.',
      interaction: { id:'g2s1-i2', type:'single-choice', questionVi:'Nguyên liệu chính để dệt chiếu là gì?', options:[
        {id:'a',textVi:'Sợi cói',isCorrect:true},{id:'b',textVi:'Dây điện',isCorrect:false},{id:'c',textVi:'Tấm nhựa',isCorrect:false}
      ], explanationVi:'Chính xác! Sợi cói là nguyên liệu chính để dệt chiếu.' }
    },
    {
      id: 'g2s1-cac-buoc', stationId: 'g2-station-1',
      titleVi: '3. Chuẩn bị và dệt chiếu',
      subtitleVi: 'Từ sợi cói đến giàn dệt',
      image: 'https://bqn.1cdn.vn/2025/05/06/chieu-ban-thach-3.jpg',
      narrationVi: 'Người thợ chuẩn bị sợi cói thường và cói nhuộm màu, chuẩn bị giàn dệt, đặt sợi đay vào thanh go và mắc giàn đay theo kích cỡ tấm chiếu. Sau đó, người thợ phối hợp nhịp nhàng để dệt nên tấm chiếu.',
      keyFactVi: 'Làm chiếu cần chuẩn bị nguyên liệu và giàn dệt cẩn thận trước khi bắt đầu dệt.',
      interaction: { id:'g2s1-i3', type:'single-choice', questionVi:'Việc nào cần làm trước khi dệt chiếu?', options:[
        {id:'a',textVi:'Chuẩn bị sợi và giàn dệt',isCorrect:true},{id:'b',textVi:'Ném bỏ sợi cói',isCorrect:false},{id:'c',textVi:'Sơn tường',isCorrect:false}
      ], explanationVi:'Đúng rồi! Người thợ phải chuẩn bị sợi và giàn dệt.' }
    },
    {
      id: 'g2s1-gian-det', stationId: 'g2-station-1',
      titleVi: '4. Dụng cụ của người thợ',
      subtitleVi: 'Giàn dệt, thanh go và thanh văng',
      image: 'https://culaochamtourist.vn/wp-content/uploads/2023/07/lang-chieu-ban-thach-2.jpg',
      narrationVi: 'Giàn dệt chiếu có nhiều bộ phận giúp căng sợi và dệt đều. Trong tài liệu, học sinh được làm quen với thanh go và thanh văng cùng cách người thợ thao tác trên giàn dệt.',
      keyFactVi: 'Giàn dệt là dụng cụ quan trọng giúp người thợ tạo nên tấm chiếu.',
      interaction: { id:'g2s1-i4', type:'single-choice', questionVi:'Dụng cụ nào gắn trực tiếp với việc dệt chiếu?', options:[
        {id:'a',textVi:'Giàn dệt',isCorrect:true},{id:'b',textVi:'Bếp ga',isCorrect:false},{id:'c',textVi:'Máy chiếu lớp học',isCorrect:false}
      ], explanationVi:'Chính xác! Giàn dệt là dụng cụ quan trọng của người làm chiếu.' }
    },
    {
      id: 'g2s1-tham-quan', stationId: 'g2-station-1',
      titleVi: '5. Em đến làng nghề',
      subtitleVi: 'Quan sát, lắng nghe và ứng xử văn hóa',
      image: 'https://danang.gov.vn/documents/37638/981989/cam-ne-1.png/440d3b04-1bc6-de6f-0d1f-09d6ae1f7c22?t=1743578855127',
      narrationVi: 'Khi tham quan làng nghề, em cần chào hỏi lễ phép, không chạy nhảy tách đoàn, không tự ý sờ vào sản phẩm hoặc dụng cụ khi chưa xin phép, biết lắng nghe người làm nghề và bỏ rác đúng nơi quy định.',
      keyFactVi: 'Tôn trọng người làm nghề và giữ trật tự là cách tham quan làng nghề văn minh.',
      interaction: { id:'g2s1-i5', type:'single-choice', questionVi:'Khi tham quan làng nghề, em nên làm gì?', options:[
        {id:'a',textVi:'Lắng nghe và xin phép trước khi chạm vào đồ vật',isCorrect:true},{id:'b',textVi:'Tự ý nghịch dụng cụ',isCorrect:false},{id:'c',textVi:'Chạy khỏi đoàn',isCorrect:false}
      ], explanationVi:'Rất tốt! Em đã biết cách tham quan làng nghề an toàn và lịch sự.' }
    },
  ],
  challenge: {
    id:'ch-g2s1', titleVi:'EM HIỂU NGHỀ LÀM CHIẾU', platform:'internal_interactive',
    instructionsVi:'Chọn đúng cả 5 câu để hoàn thành phần thực hành.', completionMode:'AUTO', passingScore:5,
    questions:[
      {id:'q1',questionVi:'Nguyên liệu chính để dệt chiếu là gì?',options:[{id:'a',textVi:'Sợi cói',isCorrect:true},{id:'b',textVi:'Dây thép',isCorrect:false},{id:'c',textVi:'Nhựa',isCorrect:false}],hintVi:'Hãy nhớ phần nguyên liệu.'},
      {id:'q2',questionVi:'Sợi cói sau khi phơi khô có thể được làm gì?',options:[{id:'a',textVi:'Nhuộm nhiều màu',isCorrect:true},{id:'b',textVi:'Nấu thành canh',isCorrect:false},{id:'c',textVi:'Đúc thành kim loại',isCorrect:false}],hintVi:'Sách minh họa các bó cói đỏ, xanh, vàng, tím.'},
      {id:'q3',questionVi:'Dụng cụ nào dùng để dệt chiếu?',options:[{id:'a',textVi:'Giàn dệt',isCorrect:true},{id:'b',textVi:'Máy bay',isCorrect:false},{id:'c',textVi:'Nồi cơm',isCorrect:false}],hintVi:'Đây là nơi căng sợi để dệt.'},
      {id:'q4',questionVi:'Khi tham quan làng nghề, em không nên làm gì?',options:[{id:'a',textVi:'Tự ý sờ vào dụng cụ khi chưa xin phép',isCorrect:true},{id:'b',textVi:'Chào hỏi lễ phép',isCorrect:false},{id:'c',textVi:'Lắng nghe người làm nghề',isCorrect:false}],hintVi:'Chọn hành vi chưa văn minh.'},
      {id:'q5',questionVi:'Em có thể vận dụng bài học bằng cách nào?',options:[{id:'a',textVi:'Làm hướng dẫn viên giới thiệu nghề làm chiếu',isCorrect:true},{id:'b',textVi:'Làm hỏng sản phẩm',isCorrect:false},{id:'c',textVi:'Không quan tâm làng nghề',isCorrect:false}],hintVi:'Tài liệu gợi ý học sinh giới thiệu sản phẩm truyền thống.'},
    ]
  },
  checkIn:{
    emotions:[{id:'e1',emoji:'😊',labelVi:'Thích thú',labelEn:'Interested'},{id:'e2',emoji:'🌾',labelVi:'Trân trọng',labelEn:'Respectful'},{id:'e3',emoji:'⭐',labelVi:'Tự hào',labelEn:'Proud'}],
    rememberPromptVi:'Điều em nhớ nhất về nghề làm chiếu là gì?',
    rememberOptions:[{id:'r1',textVi:'Sợi cói là nguyên liệu chính'},{id:'r2',textVi:'Người thợ dùng giàn dệt'},{id:'r3',textVi:'Làm chiếu cần nhiều công đoạn'},{id:'r4',textVi:'Cần trân trọng người làm nghề'}],
    actionPromptVi:'Em sẽ làm gì khi đến làng nghề?',
    actionOptions:[{id:'a1',textVi:'Chào hỏi lễ phép'},{id:'a2',textVi:'Không tự ý sờ dụng cụ'},{id:'a3',textVi:'Lắng nghe người làm nghề'},{id:'a4',textVi:'Bỏ rác đúng nơi'}],
  },
  rewards:[
    {id:'rw-g2s1-1',stationId:'g2-station-1',stage:1,nameVi:'CON THOI KHÉO LÉO',nameEn:'Skillful Shuttle',template:'silk_ribbon',descriptionVi:'Ghi nhận em đã khám phá nghề làm chiếu.'},
    {id:'rw-g2s1-2',stationId:'g2-station-1',stage:2,nameVi:'TẤM CHIẾU QUÊ HƯƠNG',nameEn:'Hometown Mat',template:'pottery_vase',descriptionVi:'Ghi nhận em hiểu nguyên liệu, dụng cụ và cách làm chiếu.'},
    {id:'rw-g2s1-3',stationId:'g2-station-1',stage:3,nameVi:'TRÁI TIM NGƯỜI GIỮ NGHỀ',nameEn:'Craft Heart',template:'scholar_scroll',descriptionVi:'Ghi nhận ý thức trân trọng người lao động.'}
  ],
  stamp:{id:'stamp-g2s1',stationId:'g2-station-1',nameVi:'NGƯỜI BẠN LÀNG NGHỀ',nameEn:'Craft Village Friend',iconName:'scroll',colorTheme:'#d97706',quoteVi:'Quan sát chăm chú – Trân trọng người làm nghề'},
  journeyMap:{id:'map-g2s1',stationId:'g2-station-1',grade:2,titleVi:'Bản đồ hành trình Chiếu Cẩm Nê – Bàn Thạch',subtitleVi:'Nguyên liệu – giàn dệt – người thợ – ứng xử',image:'https://danang.gov.vn/documents/37638/981989/cam-ne-1.png/440d3b04-1bc6-de6f-0d1f-09d6ae1f7c22?t=1743578855127',summaryNodes:[
    {id:'n1',titleVi:'Làng nghề',textVi:'Cẩm Nê và Bàn Thạch.',icon:'🏘️'},{id:'n2',titleVi:'Sợi cói',textVi:'Nguyên liệu chính để dệt chiếu.',icon:'🌾'},{id:'n3',titleVi:'Giàn dệt',textVi:'Dụng cụ quan trọng của người thợ.',icon:'🧵'},{id:'n4',titleVi:'Ứng xử',textVi:'Lễ phép, trật tự, tôn trọng người làm nghề.',icon:'🤝'}
  ],knowVi:'Nhận biết nguyên liệu, dụng cụ và một số bước làm chiếu.',understandVi:'Biết sợi cói là nguyên liệu chính và nghề cần sự khéo léo.',actVi:'Trân trọng người làm nghề và tham quan văn minh.',rewardNameVi:'Tấm chiếu quê hương',stampNameVi:'Người bạn làng nghề'},
  version:{stationId:'g2-station-1',version:'3.0.0-current-book',status:'IN_REVIEW',createdBy:'Nhóm biên soạn CHẠM ĐÀ NẴNG',createdAt:'2026-10-09',changelog:'Chuẩn hóa theo tài liệu lớp 2 hiện hành; bỏ kiến thức dự thảo không còn là trọng tâm.'},
  sources:[CURRENT_G2_SOURCE],
  isFullyVerified:true,
};

const G2_STATION_2: Station = {
  id:'g2-station-2', number:4, grade:2, themeId:'I',
  themeNameVi:'Địa lí dân cư và môi trường',
  titleVi:'Cù Lao Chàm – Khu bảo tồn thiên nhiên Sơn Trà',
  coverImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Cham%20Island%20%28C%C3%B9%20Lao%20Ch%C3%A0m%29%20seen%20from%20M%E1%BB%B9%20Kh%C3%AA%20Beach%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng%2C%20Vietnam.jpg',
  subtitleVi:'Từ đảo xanh đến rừng xanh – quan sát thiên nhiên và học cách bảo vệ',
  openingMessageVi:'Hãy cùng quan sát biển đảo Cù Lao Chàm, rừng Sơn Trà và những sinh vật cần được gìn giữ nhé!',
  totalPeriods:7,
  officialCurriculumReference:'Tài liệu GDĐP TP Đà Nẵng lớp 2 đang sử dụng – Chủ đề 4: Cù Lao Chàm – Khu bảo tồn thiên nhiên Sơn Trà',
  pedagogyGoals:{
    knowGoalVi:'Nhận biết một số nét đặc sắc của Cù Lao Chàm và Khu bảo tồn thiên nhiên Sơn Trà qua cảnh quan, động vật, thực vật và sinh vật biển.',
    understandGoalVi:'Biết Cù Lao Chàm được UNESCO công nhận là Khu dự trữ sinh quyển thế giới năm 2009; biết Sơn Trà có hệ sinh thái rừng gắn với biển và nhiều loài quý.',
    behaviorGoalVi:'Giữ gìn cảnh quan, không phá hoại hoặc khai thác trái phép tài nguyên và biết cách tham quan thiên nhiên an toàn, văn minh.',
  },
  hotspots:[
    {id:'g2s2-tong-quan',stationId:'g2-station-2',titleVi:'1. Đảo và bán đảo của Đà Nẵng',subtitleVi:'Cù Lao Chàm – Sơn Trà',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Cham%20Island%20%28C%C3%B9%20Lao%20Ch%C3%A0m%29%20seen%20from%20M%E1%BB%B9%20Kh%C3%AA%20Beach%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng%2C%20Vietnam.jpg',narrationVi:'Cù Lao Chàm gồm nhiều đảo nhỏ, trong đó Hòn Lao là đảo chính và có diện tích lớn nhất. Bán đảo Sơn Trà có Khu bảo tồn thiên nhiên Sơn Trà, được thành lập từ năm 1992.',keyFactVi:'Cù Lao Chàm có 8 hòn đảo nhỏ; Hòn Lao là đảo chính.',interaction:{id:'i1',type:'single-choice',questionVi:'Hòn nào là đảo chính của Cù Lao Chàm?',options:[{id:'a',textVi:'Hòn Lao',isCorrect:true},{id:'b',textVi:'Hòn Gai',isCorrect:false},{id:'c',textVi:'Hòn Khoai',isCorrect:false}],explanationVi:'Đúng rồi! Hòn Lao là đảo chính của Cù Lao Chàm.'}},
    {id:'g2s2-cu-lao',stationId:'g2-station-2',titleVi:'2. Những nét đặc sắc của Cù Lao Chàm',subtitleVi:'Biển trong, cát đẹp và sinh vật phong phú',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Coral%20reef%20in%20Vietnam.jpg',narrationVi:'Cù Lao Chàm có rừng núi xanh, bãi cát dài, nước biển trong và hệ động thực vật phong phú. Ngày 29 tháng 5 năm 2009, Cù Lao Chàm được UNESCO công nhận là Khu dự trữ sinh quyển thế giới.',keyFactVi:'Cù Lao Chàm được UNESCO công nhận là Khu dự trữ sinh quyển thế giới năm 2009.',interaction:{id:'i2',type:'single-choice',questionVi:'Cù Lao Chàm được UNESCO công nhận là gì?',options:[{id:'a',textVi:'Khu dự trữ sinh quyển thế giới',isCorrect:true},{id:'b',textVi:'Sân vận động thế giới',isCorrect:false},{id:'c',textVi:'Khu công nghiệp',isCorrect:false}],explanationVi:'Chính xác! Đây là Khu dự trữ sinh quyển thế giới.'}},
    {id:'g2s2-hoat-dong',stationId:'g2-station-2',titleVi:'3. Hoạt động khi tham quan Cù Lao Chàm',subtitleVi:'Quan sát và trải nghiệm biển đảo',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Cham%20Island%20Vietnam.jpg',narrationVi:'Khi tham quan Cù Lao Chàm, du khách có thể lặn ngắm san hô, đi thuyền, câu cá, tắm biển và tham quan các điểm du lịch. Mỗi hoạt động đều cần tuân thủ hướng dẫn an toàn và bảo vệ môi trường.',keyFactVi:'Trải nghiệm thiên nhiên cần đi cùng ý thức bảo vệ thiên nhiên.',interaction:{id:'i3',type:'single-choice',questionVi:'Hoạt động nào phù hợp khi tham quan Cù Lao Chàm?',options:[{id:'a',textVi:'Lặn ngắm san hô theo hướng dẫn',isCorrect:true},{id:'b',textVi:'Bẻ san hô mang về',isCorrect:false},{id:'c',textVi:'Vứt rác xuống biển',isCorrect:false}],explanationVi:'Đúng rồi! Có thể lặn ngắm san hô nhưng phải bảo vệ môi trường biển.'}},
    {id:'g2s2-son-tra',stationId:'g2-station-2',titleVi:'4. Sinh vật ở Sơn Trà',subtitleVi:'Voọc chà vá chân nâu và hệ sinh thái rừng – biển',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Pygathrix%20nemaeus%20-%20Son%20Tra%20Peninsula.jpg',narrationVi:'Khu bảo tồn thiên nhiên Sơn Trà có cây gỗ lớn, cây thuốc, cây cảnh và nhiều loài động vật. Voọc chà vá chân nâu là động vật quý hiếm cần được bảo vệ. Vùng biển còn có rạn san hô và thảm cỏ biển có giá trị.',keyFactVi:'Voọc chà vá chân nâu là loài động vật quý hiếm cần được bảo vệ.',interaction:{id:'i4',type:'single-choice',questionVi:'Loài nào ở Sơn Trà cần được bảo vệ?',options:[{id:'a',textVi:'Voọc chà vá chân nâu',isCorrect:true},{id:'b',textVi:'Gấu Bắc Cực',isCorrect:false},{id:'c',textVi:'Chim cánh cụt Nam Cực',isCorrect:false}],explanationVi:'Chính xác! Voọc chà vá chân nâu là loài quý hiếm ở Sơn Trà.'}},
    {id:'g2s2-bao-ve',stationId:'g2-station-2',titleVi:'5. Em bảo vệ thiên nhiên',subtitleVi:'Giữ cảnh quan – không phá hoại tài nguyên',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Son%20Tra%20Peninsula%2C%20Da%20Nang%2C%20Vietnam.jpg',narrationVi:'Để bảo vệ Cù Lao Chàm và Sơn Trà, em cần giữ gìn cảnh quan, không tham gia phá hoại hoặc khai thác trái phép tài nguyên, biết nhắc mọi người cùng bảo vệ môi trường và tuân thủ hướng dẫn khi tham quan.',keyFactVi:'Bảo vệ thiên nhiên bắt đầu từ việc không xả rác, không phá hoại và biết làm theo hướng dẫn.',interaction:{id:'i5',type:'single-choice',questionVi:'Việc nào giúp bảo vệ Cù Lao Chàm và Sơn Trà?',options:[{id:'a',textVi:'Giữ gìn cảnh quan và không phá hoại tài nguyên',isCorrect:true},{id:'b',textVi:'Bẻ san hô',isCorrect:false},{id:'c',textVi:'Chọc phá động vật',isCorrect:false}],explanationVi:'Rất tốt! Đó là cách ứng xử đúng với thiên nhiên.'}},
  ],
  challenge:{id:'ch-g2s2',titleVi:'NGƯỜI BẠN THIÊN NHIÊN',platform:'internal_interactive',instructionsVi:'Hoàn thành 5 câu để trở thành Người bạn thiên nhiên.',completionMode:'AUTO',passingScore:5,questions:[
    {id:'q1',questionVi:'Hòn Lao là gì?',options:[{id:'a',textVi:'Đảo chính của Cù Lao Chàm',isCorrect:true},{id:'b',textVi:'Một con sông',isCorrect:false},{id:'c',textVi:'Một sa mạc',isCorrect:false}],hintVi:'Hãy nhớ điểm khám phá đầu tiên.'},
    {id:'q2',questionVi:'Năm 2009, Cù Lao Chàm được UNESCO công nhận là gì?',options:[{id:'a',textVi:'Khu dự trữ sinh quyển thế giới',isCorrect:true},{id:'b',textVi:'Khu công nghiệp',isCorrect:false},{id:'c',textVi:'Sân bay',isCorrect:false}],hintVi:'Đây là danh hiệu về thiên nhiên.'},
    {id:'q3',questionVi:'Loài quý hiếm nào được nhắc trong bài về Sơn Trà?',options:[{id:'a',textVi:'Voọc chà vá chân nâu',isCorrect:true},{id:'b',textVi:'Hươu cao cổ',isCorrect:false},{id:'c',textVi:'Lạc đà',isCorrect:false}],hintVi:'Loài linh trưởng đặc trưng của Sơn Trà.'},
    {id:'q4',questionVi:'Việc nào không nên làm khi tham quan thiên nhiên?',options:[{id:'a',textVi:'Phá hoại hoặc khai thác trái phép tài nguyên',isCorrect:true},{id:'b',textVi:'Đi theo hướng dẫn',isCorrect:false},{id:'c',textVi:'Giữ gìn cảnh quan',isCorrect:false}],hintVi:'Chọn hành vi gây hại.'},
    {id:'q5',questionVi:'Sau chuyến tham quan, em có thể làm gì?',options:[{id:'a',textVi:'Kể cho người thân và vận động mọi người cùng bảo vệ',isCorrect:true},{id:'b',textVi:'Mang san hô về nhà',isCorrect:false},{id:'c',textVi:'Xả rác',isCorrect:false}],hintVi:'Tài liệu gợi ý chia sẻ và tuyên truyền.'}
  ]},
  checkIn:{emotions:[{id:'e1',emoji:'🌊',labelVi:'Thích biển xanh',labelEn:'Sea'},{id:'e2',emoji:'🌳',labelVi:'Yêu rừng xanh',labelEn:'Forest'},{id:'e3',emoji:'🐒',labelVi:'Muốn bảo vệ sinh vật',labelEn:'Wildlife'}],rememberPromptVi:'Điều em nhớ nhất là gì?',rememberOptions:[{id:'r1',textVi:'Cù Lao Chàm có 8 hòn đảo nhỏ'},{id:'r2',textVi:'UNESCO công nhận Cù Lao Chàm năm 2009'},{id:'r3',textVi:'Voọc chà vá chân nâu cần được bảo vệ'},{id:'r4',textVi:'Rạn san hô và thảm cỏ biển rất có giá trị'}],actionPromptVi:'Em sẽ làm gì để bảo vệ thiên nhiên?',actionOptions:[{id:'a1',textVi:'Không xả rác'},{id:'a2',textVi:'Không phá hoại san hô và cây rừng'},{id:'a3',textVi:'Tuân thủ hướng dẫn tham quan'},{id:'a4',textVi:'Nhắc mọi người cùng bảo vệ'}]},
  rewards:[{id:'rw-g2s2-1',stationId:'g2-station-2',stage:1,nameVi:'LÁ XANH SINH THÁI',nameEn:'Eco Leaf',template:'nature_leaf',descriptionVi:'Ghi nhận em đã quan sát thiên nhiên Cù Lao Chàm – Sơn Trà.'},{id:'rw-g2s2-2',stationId:'g2-station-2',stage:2,nameVi:'HUY HIỆU NGƯỜI BẠN THIÊN NHIÊN',nameEn:'Nature Friend',template:'sea_pearl',descriptionVi:'Ghi nhận em hiểu các giá trị thiên nhiên.'},{id:'rw-g2s2-3',stationId:'g2-station-2',stage:3,nameVi:'TRÁI TIM XANH',nameEn:'Green Heart',template:'culture_lotus',descriptionVi:'Ghi nhận lời hứa bảo vệ môi trường.'}],
  stamp:{id:'stamp-g2s2',stationId:'g2-station-2',nameVi:'NHÀ BẢO VỆ THIÊN NHIÊN',nameEn:'Nature Guardian',iconName:'leaf',colorTheme:'#16a34a',quoteVi:'Yêu biển – yêu rừng – bảo vệ sự sống'},
  journeyMap:{id:'map-g2s2',stationId:'g2-station-2',grade:2,titleVi:'Bản đồ hành trình Cù Lao Chàm – Sơn Trà',subtitleVi:'Đảo – biển – rừng – sinh vật – bảo vệ',summaryNodes:[{id:'n1',titleVi:'Cù Lao Chàm',textVi:'8 hòn đảo nhỏ, Hòn Lao là đảo chính.',icon:'🏝️'},{id:'n2',titleVi:'UNESCO 2009',textVi:'Khu dự trữ sinh quyển thế giới.',icon:'🌍'},{id:'n3',titleVi:'Sơn Trà',textVi:'Rừng gắn với biển, sinh vật phong phú.',icon:'🌳'},{id:'n4',titleVi:'Bảo vệ',textVi:'Không phá hoại, giữ cảnh quan.',icon:'💚'}],knowVi:'Nhận biết cảnh quan và sinh vật tiêu biểu.',understandVi:'Biết giá trị thiên nhiên và các loài cần bảo vệ.',actVi:'Giữ gìn cảnh quan và tuân thủ hướng dẫn tham quan.',rewardNameVi:'Lá xanh sinh thái',stampNameVi:'Nhà bảo vệ thiên nhiên'},
  version:{stationId:'g2-station-2',version:'3.0.0-current-book',status:'IN_REVIEW',createdBy:'Nhóm biên soạn CHẠM ĐÀ NẴNG',createdAt:'2026-10-09',changelog:'Chuẩn hóa theo tài liệu lớp 2 hiện hành.'},
  sources:[CURRENT_G2_SOURCE],
  isFullyVerified:true,
};

const G2_STATION_3: Station = {
  id:'g2-station-3', number:1, grade:2, themeId:'II',
  themeNameVi:'Lịch sử, truyền thống và di sản văn hóa',
  titleVi:'Nhà thờ Nguyễn Văn Thoại – Nhà lưu niệm Huỳnh Thúc Kháng',
  coverImage:'https://danatravel.vn/data/images/images1419978_b.jpg',
  subtitleVi:'Gặp hai nhân vật và hai địa điểm lưu niệm của quê hương',
  openingMessageVi:'Hãy cùng tìm hiểu danh tướng Nguyễn Văn Thoại, cụ Huỳnh Thúc Kháng và những nơi lưu giữ dấu ấn của hai nhân vật nhé!',
  totalPeriods:6,
  officialCurriculumReference:'Tài liệu GDĐP TP Đà Nẵng lớp 2 đang sử dụng – Chủ đề: Nhà thờ Nguyễn Văn Thoại – Nhà lưu niệm Huỳnh Thúc Kháng',
  pedagogyGoals:{
    knowGoalVi:'Nhận biết danh tướng Nguyễn Văn Thoại (Thoại Ngọc Hầu), cụ Huỳnh Thúc Kháng và hai địa điểm lưu niệm gắn với các nhân vật.',
    understandGoalVi:'Biết một số đóng góp của Nguyễn Văn Thoại đối với quê hương An Hải; biết Nhà lưu niệm Huỳnh Thúc Kháng còn lưu giữ không gian và vật dụng gắn với cụ.',
    behaviorGoalVi:'Trân trọng người có công, giữ gìn di tích và biết giới thiệu di sản lịch sử quê hương.',
  },
  hotspots:[
    {id:'g2s3-thoai',stationId:'g2-station-3',titleVi:'1. Danh tướng Nguyễn Văn Thoại',subtitleVi:'Thoại Ngọc Hầu – người con của An Hải',image:'https://danatravel.vn/data/images/images1419971_a5%281%29.jpg',narrationVi:'Danh tướng Nguyễn Văn Thoại được phong tước hiệu Thoại Ngọc Hầu. Ông quê ở làng An Hải, nay thuộc thành phố Đà Nẵng. Ở quê hương, ông đã hỗ trợ việc lập chợ, xây dựng đình, chùa cho làng An Hải.',keyFactVi:'Nguyễn Văn Thoại còn được biết đến với tước hiệu Thoại Ngọc Hầu.',interaction:{id:'i1',type:'single-choice',questionVi:'Nguyễn Văn Thoại còn được gọi là gì?',options:[{id:'a',textVi:'Thoại Ngọc Hầu',isCorrect:true},{id:'b',textVi:'Hải Thượng Lãn Ông',isCorrect:false},{id:'c',textVi:'Trạng Trình',isCorrect:false}],explanationVi:'Đúng rồi! Nguyễn Văn Thoại được phong tước hiệu Thoại Ngọc Hầu.'}},
    {id:'g2s3-nha-tho',stationId:'g2-station-3',titleVi:'2. Nhà thờ Tiền hiền làng An Hải và Thoại Ngọc Hầu',subtitleVi:'Di tích gắn với quê hương An Hải',image:'https://danatravel.vn/data/images/images1419978_b.jpg',narrationVi:'Khu di tích lịch sử văn hóa Nhà thờ Tiền hiền làng An Hải và Thoại Ngọc Hầu nằm ở phường An Hải. Năm 2007, nhà thờ được xếp hạng di tích cấp quốc gia.',keyFactVi:'Nhà thờ được xếp hạng di tích cấp quốc gia vào năm 2007.',interaction:{id:'i2',type:'single-choice',questionVi:'Nhà thờ Tiền hiền làng An Hải và Thoại Ngọc Hầu được xếp hạng gì?',options:[{id:'a',textVi:'Di tích cấp quốc gia',isCorrect:true},{id:'b',textVi:'Sân thể thao',isCorrect:false},{id:'c',textVi:'Khu vui chơi',isCorrect:false}],explanationVi:'Chính xác! Đây là di tích cấp quốc gia.'}},
    {id:'g2s3-huynh',stationId:'g2-station-3',titleVi:'3. Cụ Huỳnh Thúc Kháng',subtitleVi:'Người học rộng, tài cao, yêu nước, thương dân',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Mr%20Hu%E1%BB%B3nh%20Th%C3%BAc%20Kh%C3%A1ng.jpg',narrationVi:'Cụ Huỳnh Thúc Kháng (1876 – 1947) là người học rộng, tài cao và rất mực yêu nước, thương dân. Cuộc đời của cụ để lại nhiều dấu ấn trong lịch sử.',keyFactVi:'Tài liệu lớp 2 nhấn mạnh phẩm chất học rộng, tài cao, yêu nước và thương dân của cụ Huỳnh Thúc Kháng.',interaction:{id:'i3',type:'single-choice',questionVi:'Phẩm chất nào phù hợp với cụ Huỳnh Thúc Kháng?',options:[{id:'a',textVi:'Yêu nước, thương dân',isCorrect:true},{id:'b',textVi:'Thờ ơ với mọi người',isCorrect:false},{id:'c',textVi:'Không thích học hỏi',isCorrect:false}],explanationVi:'Đúng rồi! Cụ Huỳnh Thúc Kháng rất mực yêu nước, thương dân.'}},
    {id:'g2s3-luu-niem',stationId:'g2-station-3',titleVi:'4. Nhà lưu niệm Huỳnh Thúc Kháng',subtitleVi:'Ngôi nhà cổ lưu giữ không gian và vật dụng xưa',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Huynh%20Thuc%20Khang%20memorial%20house.jpg',narrationVi:'Nhà lưu niệm Huỳnh Thúc Kháng là ngôi nhà cổ, được xây dựng từ năm 1869 và nằm trong khu vườn rộng. Trong nhà còn giữ không gian làm việc xưa và những vật dụng mà cụ thường dùng.',keyFactVi:'Nhà lưu niệm giúp chúng ta hiểu thêm về cuộc sống và dấu ấn của cụ Huỳnh Thúc Kháng.',interaction:{id:'i4',type:'single-choice',questionVi:'Trong Nhà lưu niệm Huỳnh Thúc Kháng còn lưu giữ gì?',options:[{id:'a',textVi:'Không gian làm việc xưa và một số vật dụng của cụ',isCorrect:true},{id:'b',textVi:'Tàu vũ trụ',isCorrect:false},{id:'c',textVi:'Động vật hoang dã',isCorrect:false}],explanationVi:'Chính xác! Nhà lưu niệm còn giữ không gian và vật dụng gắn với cụ.'}},
  ],
  challenge:{id:'ch-g2s3',titleVi:'DẤU ẤN NGƯỜI XƯA',platform:'internal_interactive',instructionsVi:'Hoàn thành 5 câu để ghi nhớ hai nhân vật và hai địa điểm.',completionMode:'AUTO',passingScore:5,questions:[
    {id:'q1',questionVi:'Nguyễn Văn Thoại có tước hiệu nào?',options:[{id:'a',textVi:'Thoại Ngọc Hầu',isCorrect:true},{id:'b',textVi:'Hưng Đạo Vương',isCorrect:false},{id:'c',textVi:'Bình Tây Đại nguyên soái',isCorrect:false}],hintVi:'Tên tước hiệu xuất hiện ngay ở điểm đầu.'},
    {id:'q2',questionVi:'Nguyễn Văn Thoại đã hỗ trợ quê hương An Hải việc gì?',options:[{id:'a',textVi:'Lập chợ, xây đình và chùa',isCorrect:true},{id:'b',textVi:'Xây sân bay quốc tế',isCorrect:false},{id:'c',textVi:'Xây tàu điện ngầm',isCorrect:false}],hintVi:'Tài liệu nhắc đến các công trình gần gũi với làng.'},
    {id:'q3',questionVi:'Nhà thờ Tiền hiền làng An Hải và Thoại Ngọc Hầu được xếp hạng quốc gia năm nào?',options:[{id:'a',textVi:'2007',isCorrect:true},{id:'b',textVi:'1990',isCorrect:false},{id:'c',textVi:'2025',isCorrect:false}],hintVi:'Hãy nhớ mốc thời gian ở điểm 2.'},
    {id:'q4',questionVi:'Cụ Huỳnh Thúc Kháng được giới thiệu là người như thế nào?',options:[{id:'a',textVi:'Học rộng, tài cao, yêu nước, thương dân',isCorrect:true},{id:'b',textVi:'Không quan tâm cộng đồng',isCorrect:false},{id:'c',textVi:'Không thích học',isCorrect:false}],hintVi:'Đây là câu mô tả ngay dưới chân dung cụ.'},
    {id:'q5',questionVi:'Em có thể vận dụng bài học bằng cách nào?',options:[{id:'a',textVi:'Đóng vai hướng dẫn viên giới thiệu di tích',isCorrect:true},{id:'b',textVi:'Viết vẽ lên di tích',isCorrect:false},{id:'c',textVi:'Làm hỏng hiện vật',isCorrect:false}],hintVi:'Tài liệu gợi ý hoạt động hướng dẫn viên.'}
  ]},
  checkIn:{emotions:[{id:'e1',emoji:'🙏',labelVi:'Kính trọng',labelEn:'Respect'},{id:'e2',emoji:'📚',labelVi:'Muốn học hỏi',labelEn:'Learn'},{id:'e3',emoji:'😊',labelVi:'Tự hào',labelEn:'Proud'}],rememberPromptVi:'Điều em nhớ nhất là gì?',rememberOptions:[{id:'r1',textVi:'Nguyễn Văn Thoại là Thoại Ngọc Hầu'},{id:'r2',textVi:'Nhà thờ An Hải là di tích cấp quốc gia'},{id:'r3',textVi:'Huỳnh Thúc Kháng yêu nước, thương dân'},{id:'r4',textVi:'Nhà lưu niệm giữ không gian và vật dụng xưa'}],actionPromptVi:'Em sẽ làm gì khi đến di tích?',actionOptions:[{id:'a1',textVi:'Giữ trật tự và vệ sinh'},{id:'a2',textVi:'Không chạm hiện vật khi chưa được phép'},{id:'a3',textVi:'Lắng nghe hướng dẫn'},{id:'a4',textVi:'Giới thiệu điều em biết cho người thân'}]},
  rewards:[{id:'rw-g2s3-1',stationId:'g2-station-3',stage:1,nameVi:'CUỐN SÁCH DẤU XƯA',nameEn:'Heritage Book',template:'enlightenment_book',descriptionVi:'Ghi nhận em đã khám phá hai nhân vật và hai địa điểm.'},{id:'rw-g2s3-2',stationId:'g2-station-3',stage:2,nameVi:'HUY HIỆU TRI ÂN',nameEn:'Gratitude Badge',template:'guardian_star',descriptionVi:'Ghi nhận em hiểu bài học lịch sử địa phương.'},{id:'rw-g2s3-3',stationId:'g2-station-3',stage:3,nameVi:'TRÁI TIM KÍNH TRỌNG',nameEn:'Respect Heart',template:'scholar_scroll',descriptionVi:'Ghi nhận thái độ trân trọng người có công.'}],
  stamp:{id:'stamp-g2s3',stationId:'g2-station-3',nameVi:'HƯỚNG DẪN VIÊN NHÍ',nameEn:'Young Guide',iconName:'landmark',colorTheme:'#92400e',quoteVi:'Biết người xưa – yêu quê hương – giữ gìn di tích'},
  journeyMap:{id:'map-g2s3',stationId:'g2-station-3',grade:2,titleVi:'Bản đồ hành trình Dấu ấn người xưa',subtitleVi:'Nguyễn Văn Thoại – Huỳnh Thúc Kháng',image:'https://danatravel.vn/data/images/images1419978_b.jpg',summaryNodes:[{id:'n1',titleVi:'Thoại Ngọc Hầu',textVi:'Người con của An Hải.',icon:'🎖️'},{id:'n2',titleVi:'Nhà thờ An Hải',textVi:'Di tích cấp quốc gia.',icon:'🏛️'},{id:'n3',titleVi:'Huỳnh Thúc Kháng',textVi:'Học rộng, tài cao, yêu nước, thương dân.',icon:'📚'},{id:'n4',titleVi:'Nhà lưu niệm',textVi:'Lưu giữ không gian và vật dụng xưa.',icon:'🏠'}],knowVi:'Nhận biết hai nhân vật và hai địa điểm lưu niệm.',understandVi:'Biết một số đóng góp và dấu ấn của nhân vật.',actVi:'Trân trọng người có công và giữ gìn di tích.',rewardNameVi:'Cuốn sách Dấu xưa',stampNameVi:'Hướng dẫn viên nhí'},
  version:{stationId:'g2-station-3',version:'3.0.0-current-book',status:'IN_REVIEW',createdBy:'Nhóm biên soạn CHẠM ĐÀ NẴNG',createdAt:'2026-10-09',changelog:'Thay toàn bộ nội dung dự thảo Nguyễn Tri Phương – Hoàng Diệu bằng chủ đề hiện hành người dùng cung cấp.'},
  sources:[CURRENT_G2_SOURCE],
  isFullyVerified:true,
};

const G2_STATION_5: Station = {
  id:'g2-station-5', number:3, grade:2, themeId:'III',
  themeNameVi:'Văn hóa phi vật thể và đời sống xã hội',
  titleVi:'Lễ hội truyền thống ở thành phố Đà Nẵng',
  coverImage:'https://media.mia.vn/uploads/blog-du-lich/le-hoi-cau-ngu-da-nang-kham-pha-net-dac-sac-trong-van-hoa-ngu-dan-vung-bien-da-nang-12-1636815747.jpg',
  subtitleVi:'Nhận biết phần lễ, phần hội, ý nghĩa và cách tham gia lễ hội văn minh',
  openingMessageVi:'Tiếng trống hội vang lên rồi! Hãy quan sát những lễ hội quen thuộc và khám phá phần lễ, phần hội cùng ý nghĩa của chúng nhé!',
  totalPeriods:6,
  officialCurriculumReference:'Tài liệu GDĐP TP Đà Nẵng lớp 2 đang sử dụng – Chủ đề 3: Lễ hội truyền thống ở thành phố Đà Nẵng',
  pedagogyGoals:{
    knowGoalVi:'Nhận biết một số lễ hội truyền thống tiêu biểu ở Đà Nẵng; biết lễ hội thường có phần lễ và phần hội.',
    understandGoalVi:'Biết một số nghi thức, trò chơi dân gian và ý nghĩa cầu mong bình an, mùa màng hoặc mùa biển bội thu, tưởng nhớ người có công.',
    behaviorGoalVi:'Biết xếp hàng, bỏ rác đúng nơi, mặc trang phục phù hợp và chấp hành nội quy khi tham gia lễ hội.',
  },
  hotspots:[
    {id:'g2s5-le-hoi',stationId:'g2-station-5',titleVi:'1. Những lễ hội quen thuộc',subtitleVi:'Cầu Ngư – Túy Loan – Mục Đồng – Mừng lúa mới – Cầu bông',image:'https://media.mia.vn/uploads/blog-du-lich/le-hoi-cau-ngu-da-nang-kham-pha-net-dac-sac-trong-van-hoa-ngu-dan-vung-bien-da-nang-12-1636815747.jpg',narrationVi:'Ở thành phố Đà Nẵng có nhiều lễ hội truyền thống như Lễ hội Cầu Ngư, Lễ hội Đình làng Túy Loan, Lễ hội Mục Đồng, Lễ hội Mừng lúa mới và Lễ hội Cầu bông.',keyFactVi:'Mỗi lễ hội gắn với đời sống, tín ngưỡng hoặc nghề nghiệp của cộng đồng.',interaction:{id:'i1',type:'single-choice',questionVi:'Lễ hội nào được nhắc trong tài liệu lớp 2?',options:[{id:'a',textVi:'Lễ hội Mục Đồng',isCorrect:true},{id:'b',textVi:'Lễ hội tuyết',isCorrect:false},{id:'c',textVi:'Lễ hội sa mạc',isCorrect:false}],explanationVi:'Đúng rồi! Lễ hội Mục Đồng là một trong những lễ hội được giới thiệu.'}},
    {id:'g2s5-phan-le',stationId:'g2-station-5',titleVi:'2. Phần lễ',subtitleVi:'Trang nghiêm và thành kính',image:'https://file3.qdnd.vn/data/images/0/2025/02/07/upload_2328/3%202.jpg?dpi=150&quality=100&w=870',narrationVi:'Phần lễ thường có những nghi thức như dâng hương, lễ tế, lễ cầu an, cầu ngư hoặc rước kiệu. Đây là phần thể hiện sự trang nghiêm và lòng thành kính của cộng đồng.',keyFactVi:'Lễ dâng hương, lễ tế, lễ cầu an, cầu ngư và rước kiệu là những nghi thức phần lễ.',interaction:{id:'i2',type:'single-choice',questionVi:'Hoạt động nào thuộc phần lễ?',options:[{id:'a',textVi:'Dâng hương',isCorrect:true},{id:'b',textVi:'Lắc thúng',isCorrect:false},{id:'c',textVi:'Đập niêu',isCorrect:false}],explanationVi:'Chính xác! Dâng hương là một nghi thức của phần lễ.'}},
    {id:'g2s5-phan-hoi',stationId:'g2-station-5',titleVi:'3. Phần hội',subtitleVi:'Trò chơi, văn nghệ và hoạt động cộng đồng',image:'https://bqn.1cdn.vn/2023/12/30/baodanang.vn-dataimages-202312-original-_images1723374_1911481349658a8d3be9bbr__cm_c__ng__nh_ngv_nsinh_1_.jpg',narrationVi:'Phần hội có nhiều trò chơi và hoạt động như lắc thúng trên biển, chơi Bài Chòi, kéo co, đập niêu đất, gói bánh tét, nướng bánh tráng, thi văn nghệ và thể thao.',keyFactVi:'Phần hội tạo không khí vui tươi và gắn kết cộng đồng.',interaction:{id:'i3',type:'single-choice',questionVi:'Hoạt động nào thuộc phần hội?',options:[{id:'a',textVi:'Chơi Bài Chòi',isCorrect:true},{id:'b',textVi:'Lễ tế',isCorrect:false},{id:'c',textVi:'Dâng hương',isCorrect:false}],explanationVi:'Đúng rồi! Chơi Bài Chòi là một hoạt động phần hội.'}},
    {id:'g2s5-y-nghia',stationId:'g2-station-5',titleVi:'4. Ý nghĩa của lễ hội',subtitleVi:'Nhớ người xưa – cầu bình an – mong mùa vụ tốt',image:'https://bqn.1cdn.vn/2023/12/30/baodanang.vn-dataimages-202312-original-_images1723374_1911481349658a8d3be9bbr__cm_c__ng__nh_ngv_nsinh_1_.jpg',narrationVi:'Lễ hội truyền thống có thể giúp tưởng nhớ những người có công khai hoang lập làng, tạ ơn các vị thần, tưởng nhớ ngư dân đã mất và cầu mong một năm mới an lành, mùa màng hoặc mùa đánh bắt bội thu, mọi người mạnh khỏe và hạnh phúc.',keyFactVi:'Lễ hội vừa lưu giữ truyền thống vừa gửi gắm những ước mong tốt đẹp của cộng đồng.',interaction:{id:'i4',type:'single-choice',questionVi:'Lễ hội truyền thống thường gửi gắm điều gì?',options:[{id:'a',textVi:'Những ước mong tốt đẹp cho cộng đồng',isCorrect:true},{id:'b',textVi:'Làm mọi người xa cách',isCorrect:false},{id:'c',textVi:'Phá bỏ truyền thống',isCorrect:false}],explanationVi:'Chính xác! Lễ hội thể hiện nhiều mong ước tốt đẹp và sự gắn kết cộng đồng.'}},
    {id:'g2s5-ung-xu',stationId:'g2-station-5',titleVi:'5. Em đi hội văn minh',subtitleVi:'Xếp hàng – bỏ rác đúng nơi – chấp hành nội quy',image:'https://file3.qdnd.vn/data/images/0/2025/02/07/upload_2328/3%202.jpg?dpi=150&quality=100&w=870',narrationVi:'Khi tham gia lễ hội, em cần xếp hàng trật tự, bỏ rác đúng nơi quy định, mặc trang phục phù hợp và chấp hành nội quy. Em cũng có thể tập làm hướng dẫn viên giới thiệu một lễ hội mà mình biết.',keyFactVi:'An toàn, vệ sinh và tôn trọng nội quy làm cho lễ hội đẹp hơn.',interaction:{id:'i5',type:'single-choice',questionVi:'Việc nào đúng khi tham gia lễ hội?',options:[{id:'a',textVi:'Xếp hàng trật tự và bỏ rác đúng nơi',isCorrect:true},{id:'b',textVi:'Chen lấn và xả rác',isCorrect:false},{id:'c',textVi:'Không chấp hành nội quy',isCorrect:false}],explanationVi:'Rất tốt! Đó là cách tham gia lễ hội văn minh.'}},
  ],
  challenge:{id:'ch-g2s5',titleVi:'SẮC HỘI QUÊ HƯƠNG',platform:'internal_interactive',instructionsVi:'Hoàn thành 5 câu để trở thành hướng dẫn viên lễ hội nhí.',completionMode:'AUTO',passingScore:5,questions:[
    {id:'q1',questionVi:'Lễ hội truyền thống thường có mấy phần chính?',options:[{id:'a',textVi:'Phần lễ và phần hội',isCorrect:true},{id:'b',textVi:'Chỉ phần hội',isCorrect:false},{id:'c',textVi:'Chỉ phần lễ',isCorrect:false}],hintVi:'Tài liệu nêu hai phần chính.'},
    {id:'q2',questionVi:'Hoạt động nào thuộc phần lễ?',options:[{id:'a',textVi:'Rước kiệu',isCorrect:true},{id:'b',textVi:'Đập niêu',isCorrect:false},{id:'c',textVi:'Kéo co',isCorrect:false}],hintVi:'Đây là nghi thức trang nghiêm.'},
    {id:'q3',questionVi:'Hoạt động nào thuộc phần hội?',options:[{id:'a',textVi:'Lắc thúng trên biển',isCorrect:true},{id:'b',textVi:'Lễ tế',isCorrect:false},{id:'c',textVi:'Dâng hương',isCorrect:false}],hintVi:'Đây là hoạt động vui chơi.'},
    {id:'q4',questionVi:'Một ý nghĩa của lễ hội là gì?',options:[{id:'a',textVi:'Cầu mong bình an và mùa vụ tốt',isCorrect:true},{id:'b',textVi:'Khuyến khích xả rác',isCorrect:false},{id:'c',textVi:'Làm mất truyền thống',isCorrect:false}],hintVi:'Hãy nghĩ đến những điều cộng đồng mong ước.'},
    {id:'q5',questionVi:'Khi tham gia lễ hội, em nên làm gì?',options:[{id:'a',textVi:'Chấp hành nội quy và giữ vệ sinh',isCorrect:true},{id:'b',textVi:'Chen lấn',isCorrect:false},{id:'c',textVi:'Vứt rác bừa bãi',isCorrect:false}],hintVi:'Chọn hành vi văn minh.'}
  ]},
  checkIn:{emotions:[{id:'e1',emoji:'🥁',labelVi:'Rộn ràng',labelEn:'Festive'},{id:'e2',emoji:'😊',labelVi:'Vui thích',labelEn:'Happy'},{id:'e3',emoji:'🙏',labelVi:'Trân trọng',labelEn:'Respect'}],rememberPromptVi:'Điều em nhớ nhất về lễ hội là gì?',rememberOptions:[{id:'r1',textVi:'Lễ hội có phần lễ và phần hội'},{id:'r2',textVi:'Phần lễ có nhiều nghi thức trang nghiêm'},{id:'r3',textVi:'Phần hội có trò chơi và văn nghệ'},{id:'r4',textVi:'Lễ hội gửi gắm nhiều ước mong tốt đẹp'}],actionPromptVi:'Khi đi hội, em sẽ làm gì?',actionOptions:[{id:'a1',textVi:'Xếp hàng trật tự'},{id:'a2',textVi:'Bỏ rác đúng nơi'},{id:'a3',textVi:'Mặc trang phục phù hợp'},{id:'a4',textVi:'Chấp hành nội quy'}]},
  rewards:[{id:'rw-g2s5-1',stationId:'g2-station-5',stage:1,nameVi:'TIẾNG TRỐNG NGÀY HỘI',nameEn:'Festival Drumbeat',template:'heritage_lantern',descriptionVi:'Ghi nhận em đã khám phá phần lễ, phần hội và ý nghĩa lễ hội.'},{id:'rw-g2s5-2',stationId:'g2-station-5',stage:2,nameVi:'CỜ HỘI QUÊ HƯƠNG',nameEn:'Festival Flag',template:'silk_ribbon',descriptionVi:'Ghi nhận em hiểu nội dung lễ hội truyền thống.'},{id:'rw-g2s5-3',stationId:'g2-station-5',stage:3,nameVi:'TRÁI TIM VĂN HÓA',nameEn:'Culture Heart',template:'culture_lotus',descriptionVi:'Ghi nhận cách ứng xử văn minh khi đi hội.'}],
  stamp:{id:'stamp-g2s5',stationId:'g2-station-5',nameVi:'HƯỚNG DẪN VIÊN LỄ HỘI NHÍ',nameEn:'Young Festival Guide',iconName:'sparkles',colorTheme:'#c026d3',quoteVi:'Hiểu lễ hội – vui văn minh – trân trọng truyền thống'},
  journeyMap:{id:'map-g2s5',stationId:'g2-station-5',grade:2,titleVi:'Bản đồ hành trình Lễ hội truyền thống',subtitleVi:'Lễ hội – phần lễ – phần hội – ý nghĩa – ứng xử',image:'https://media.mia.vn/uploads/blog-du-lich/le-hoi-cau-ngu-da-nang-kham-pha-net-dac-sac-trong-van-hoa-ngu-dan-vung-bien-da-nang-12-1636815747.jpg',summaryNodes:[{id:'n1',titleVi:'Lễ hội',textVi:'Nhiều lễ hội truyền thống ở Đà Nẵng.',icon:'🏮'},{id:'n2',titleVi:'Phần lễ',textVi:'Dâng hương, lễ tế, rước kiệu…',icon:'🙏'},{id:'n3',titleVi:'Phần hội',textVi:'Trò chơi, văn nghệ, thể thao…',icon:'🥁'},{id:'n4',titleVi:'Ứng xử',textVi:'Xếp hàng, giữ vệ sinh, chấp hành nội quy.',icon:'✅'}],knowVi:'Nhận biết lễ hội và hai phần chính.',understandVi:'Biết một số hoạt động và ý nghĩa lễ hội.',actVi:'Tham gia lễ hội an toàn, vệ sinh, văn minh.',rewardNameVi:'Cờ hội quê hương',stampNameVi:'Hướng dẫn viên lễ hội nhí'},
  version:{stationId:'g2-station-5',version:'3.0.0-current-book',status:'IN_REVIEW',createdBy:'Nhóm biên soạn CHẠM ĐÀ NẴNG',createdAt:'2026-10-09',changelog:'Chuẩn hóa theo tài liệu lớp 2 hiện hành; bỏ các lễ hội ngoài trọng tâm tài liệu.'},
  sources:[CURRENT_G2_SOURCE],
  isFullyVerified:true,
};

export const GRADE_2_STATIONS: Station[] = [
  G2_STATION_3,
  CANONICAL_HOI_AN_STATION,
  G2_STATION_5,
  G2_STATION_2,
  G2_STATION_1,
];
