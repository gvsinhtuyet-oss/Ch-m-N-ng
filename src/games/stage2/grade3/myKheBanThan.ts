import type {GameConfig} from '../types';

// Faithful migration of the five teacher-reviewed V12 challenges.
// All backgrounds and answer photos are extracted losslessly by
// scripts/extract-my-khe-v12-images.mjs from the approved V12 HTML.
export const myKheBanThanConfig = {
  stationId:'g3-station-1',
  layout:'safe-v1',
  stationName:'Mỹ Khê – Bàn Than',
  title:'Mật mã hai miền biển',
  background:'/games/shared/v1/grade3/my-khe/play.webp',
  victoryBackground:'/games/shared/v1/grade3/my-khe/victory.webp',
  collectible:{icon:'💎',name:'mảnh ngọc'},
  intro:{
    heading:'HÀNH TRÌNH TÌM NGỌC BIỂN',
    story:'Sóng biển vừa gửi đến một mật thư bí ẩn! Hai miền biển Mỹ Khê – Bàn Than đang cất giấu 5 mảnh ngọc đại dương. Em đã sẵn sàng khám phá chưa?',
    call:'Quan sát thật tinh, suy nghĩ thật khéo và mở rương kho báu nhé!',
    readyLabel:'Sẵn sàng khám phá'
  },
  victory:{
    praise:'🌟 THẬT TUYỆT VỜI!',
    achievement:'Em đã chinh phục 5 thử thách!',
    reward:'💎 Viên ngọc đại dương đã thuộc về em!'
  },
  questions:[
    {
      id:'q1',level:'Nhận biết',kind:'image',
      prompt:'Hình ảnh nào dưới đây là bãi biển Mỹ Khê?',
      hint:'Hãy tìm nơi có bờ cát dài, rộng và bằng phẳng.',
      options:[
        {text:'Bờ cát dài, rộng, nhiều hoạt động vui chơi',image:'/games/shared/v1/grade3/my-khe/choice-0.webp'},
        {text:'Ghềnh đá đen độc đáo',image:'/games/shared/v1/grade3/my-khe/choice-1.webp'},
        {text:'Phố cổ ven sông',image:'/games/shared/v1/grade3/my-khe/choice-2.webp'}
      ],
      answer:0
    },
    {
      id:'q2',level:'Nhận biết',kind:'choice',
      prompt:'Bãi biển Mỹ Khê có bờ cát dài, rộng, thích hợp cho nhiều hoạt động vui chơi.',
      hint:'Hãy nhớ đặc điểm nổi bật của bãi biển Mỹ Khê.',
      options:[{text:'✓ ĐÚNG'},{text:'✕ SAI'}],
      answer:0
    },
    {
      id:'q3',level:'Thông hiểu',kind:'choice',
      prompt:'Điều gì làm cho cảnh quan Bàn Than trở nên đặc biệt?',
      hint:'Hãy nhớ đến các ghềnh đá ở Bàn Than.',
      options:[{text:'Những bãi cát trắng trải dài'},{text:'Những ghềnh đá đen với hình dáng độc đáo'},{text:'Những dãy nhà cổ ven sông'}],
      answer:1
    },
    {
      id:'q4',level:'Thông hiểu',kind:'match',
      prompt:'Em hãy nối mỗi hoạt động khi tham quan biển với việc làm phù hợp.',
      hint:'Hãy nghĩ đến cách chụp ảnh an toàn, bảo vệ sinh vật biển và giữ vệ sinh sau khi ăn uống.',
      left:['📸 Chụp ảnh kỷ niệm','🐚 Quan sát sinh vật biển','🧺 Ăn uống trên bãi biển'],
      right:['Bỏ rác đúng nơi quy định','Không bắt hoặc làm hại sinh vật','Chọn vị trí an toàn'],
      solution:[2,1,0]
    },
    {
      id:'q5',level:'Vận dụng',kind:'choice',
      prompt:'Một bạn định trèo lên tảng đá ướt gần mép sóng ở Bàn Than. Em sẽ làm gì?',
      hint:'Hãy nghĩ đến an toàn khi có đá trơn và sóng biển.',
      options:[{text:'Cùng bạn trèo lên chụp ảnh'},{text:'Khuyên bạn tránh đá ướt, chọn nơi an toàn'},{text:'Đứng sát mép sóng để quan sát'}],
      answer:1
    }
  ]
} satisfies GameConfig;
