import type {GameConfig} from '../types';
export const station4Config = {
  "stationId": "g3-station-4",
  "stationName": "Nghề làm nước mắm Nam Ô",
  "title": "Truy tìm bí quyết Nam Ô",
  "background": "/games/shared/v1/grade3/g3-4-play.webp",
  "victoryBackground": "/games/shared/v1/grade3/g3-4-victory.webp",
  "collectible": {
    "icon": "💧",
    "image": "/games/shared/v1/grade3/drop.svg",
    "name": "giọt nước mắm vàng"
  },
  "intro": {
    "heading": "KHÁM PHÁ BÍ QUYẾT NAM Ô",
    "story": "Theo dấu người làm nghề, tìm hiểu cách làm nước mắm Nam Ô và sưu tầm 5 giọt nước mắm vàng!",
    "call": "Quan sát thật tinh và trân trọng công sức người làm nghề nhé!",
    "readyLabel": "Khám phá quê hương"
  },
  "victory": {
    "praise": "🌟 NHÀ KHÁM PHÁ NAM Ô!",
    "achievement": "Em đã chinh phục 5 thử thách!",
    "reward": "Em đã sưu tầm đủ 5 giọt nước mắm vàng!"
  },
  "questions": [
    {
      "id": "q1",
      "level": "Nhận biết",
      "kind": "image",
      "prompt": "Ảnh nào cho thấy công đoạn lọc nước mắm?",
      "hint": "Quan sát dòng nước mắm chảy qua dụng cụ lọc xuống chum.",
      "options": [
        {
          "text": "Lọc nước mắm",
          "image": "/images/real-photos/nam-o-loc.webp"
        },
        {
          "text": "Trang phục thổ cẩm",
          "image": "/learning/grade3/photos/co-tu-costumes.webp"
        },
        {
          "text": "Thuyền thúng",
          "image": "/learning/grade3/photos/thung-my-khe.webp"
        }
      ],
      "answer": 0
    },
    {
      "id": "q2",
      "level": "Nhận biết",
      "kind": "choice",
      "prompt": "Hai nguyên liệu chính làm nước mắm Nam Ô là gì?",
      "hint": "Một nguyên liệu là cá, nguyên liệu còn lại dùng để ướp cá.",
      "options": [
        {
          "text": "Tre và dầu rái"
        },
        {
          "text": "Cá cơm than và muối"
        },
        {
          "text": "Sợi cói và sợi đay"
        }
      ],
      "answer": 1
    },
    {
      "id": "q3",
      "level": "Thông hiểu",
      "kind": "choice",
      "prompt": "Vì sao cá phải được ủ trong chum từ 12 đến 18 tháng?",
      "hint": "Làm nước mắm cần thời gian ủ và đảo để cá chín đều.",
      "options": [
        {
          "text": "Để chum biến thành chai"
        },
        {
          "text": "Để tạo ra nan tre"
        },
        {
          "text": "Để cá chín trong quá trình ủ"
        }
      ],
      "answer": 2
    },
    {
      "id": "q4",
      "level": "Thông hiểu",
      "kind": "match",
      "prompt": "Nối công đoạn với việc làm phù hợp.",
      "hint": "Phân biệt bước ướp cá, bước lọc và bước ủ tiếp nước mắm sau khi lọc.",
      "left": [
        "Ướp cá",
        "Lọc nước mắm",
        "Ủ nước mắm sau lọc"
      ],
      "right": [
        "Dùng vuột tre lót vải sạch",
        "Ủ tiếp trong chum rồi mới đóng chai",
        "Rửa cá bằng nước biển, trộn với muối"
      ],
      "solution": [
        2,
        0,
        1
      ]
    },
    {
      "id": "q5",
      "level": "Vận dụng",
      "kind": "choice",
      "prompt": "Bạn muốn mở nắp chum để tự nếm. Em chọn cách nào?",
      "hint": "Tôn trọng quy trình sản xuất và giữ vệ sinh khi tham quan.",
      "options": [
        {
          "text": "Cùng mở vì chỉ nếm một chút"
        },
        {
          "text": "Dùng tay khuấy rồi đậy lại"
        },
        {
          "text": "Nhắc bạn dừng lại, hỏi người hướng dẫn"
        }
      ],
      "answer": 2
    }
  ]
} satisfies GameConfig;
