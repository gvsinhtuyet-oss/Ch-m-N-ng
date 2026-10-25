import type { GameConfig } from './types';
export const hoangDieuConfig = {
  "stationId": "g3-station-2",
  "stationName": "Hoàng Diệu – Phan Châu Trinh",
  "title": "Giải mã dấu ấn lịch sử",
  "background": "/games/shared/v1/approved-0.webp",
  "victoryBackground": "/games/shared/v1/approved-1.webp",
  "collectible": {
    "icon": "🗝️",
    "name": "mảnh chìa khóa"
  },
  "intro": {
    "heading": "HÀNH TRÌNH MỞ KHÓA LỊCH SỬ",
    "story": "Một chiếc rương thời gian đang cất giữ 5 mảnh chìa khóa lịch sử. Hãy tìm hiểu về Hoàng Diệu và Phan Châu Trinh để mở khóa tri thức nhé!",
    "call": "Quan sát thật tinh, suy nghĩ thật khéo và mở rương kho báu nhé!"
  },
  "victory": {
    "praise": "🌟 CHÌA KHÓA THỜI GIAN!",
    "achievement": "Em đã chinh phục 5 thử thách!",
    "reward": "💎 Chìa khóa thời gian vàng đã thuộc về em!"
  },
  "questions": [
    {
      "id": "q1",
      "level": "Nhận biết",
      "prompt": "Hình ảnh nào là chân dung Tổng đốc Hoàng Diệu?",
      "hint": "Hãy quan sát trang phục quan lại triều Nguyễn của Hoàng Diệu.",
      "kind": "image",
      "options": [
        {
          "text": "Tổng đốc Hoàng Diệu",
          "image": "/games/shared/v1/approved-5.webp"
        },
        {
          "text": "Phan Châu Trinh",
          "image": "/games/shared/v1/approved-6.webp"
        },
        {
          "text": "Hồ Chí Minh",
          "image": "/games/shared/v1/approved-7.webp"
        }
      ],
      "answer": 0
    },
    {
      "id": "q2",
      "level": "Nhận biết",
      "prompt": "Nhà yêu nước Phan Châu Trinh còn được biết đến với tên gọi nào?",
      "hint": "Hãy nhớ đến hiệu Tây Hồ của nhà yêu nước Phan Châu Trinh.",
      "kind": "choice",
      "options": [
        {
          "text": "Phan Tây Hồ"
        },
        {
          "text": "Nguyễn Trãi"
        },
        {
          "text": "Trần Hưng Đạo"
        }
      ],
      "answer": 0
    },
    {
      "id": "q3",
      "level": "Thông hiểu",
      "prompt": "Vì sao Đà Nẵng có những con đường mang tên Hoàng Diệu và Phan Châu Trinh?",
      "hint": "Tên đường là một cách tưởng nhớ, biết ơn những người có công với đất nước.",
      "kind": "choice",
      "options": [
        {
          "text": "Để ghi nhớ công lao của hai nhà yêu nước"
        },
        {
          "text": "Vì hai ông là thương nhân nổi tiếng"
        },
        {
          "text": "Vì hai ông đã xây dựng các con đường"
        }
      ],
      "answer": 0
    },
    {
      "id": "q4",
      "level": "Thông hiểu",
      "prompt": "Nối nhân vật hoặc phong trào với dấu ấn lịch sử phù hợp.",
      "hint": "Hãy phân biệt người bảo vệ thành Hà Nội, người cổ vũ nâng cao dân trí và phong trào đổi mới việc học.",
      "kind": "match",
      "left": [
        "🏯 Hoàng Diệu",
        "📚 Phan Châu Trinh",
        "📝 Phong trào Duy Tân"
      ],
      "right": [
        "Khuyến khích đổi mới và mở trường học",
        "Chỉ huy bảo vệ thành Hà Nội",
        "Đề cao khai dân trí"
      ],
      "solution": [
        1,
        2,
        0
      ]
    },
    {
      "id": "q5",
      "level": "Vận dụng",
      "prompt": "Khi đi trên đường mang tên một nhà yêu nước, em nên làm gì?",
      "hint": "Tên đường giúp chúng ta ghi nhớ và biết ơn những người có công với đất nước.",
      "kind": "choice",
      "options": [
        {
          "text": "Tìm hiểu và trân trọng công lao của người ấy"
        },
        {
          "text": "Không cần quan tâm tên đường"
        },
        {
          "text": "Tự kể thêm những chuyện chưa kiểm chứng"
        }
      ],
      "answer": 0
    }
  ]
} satisfies GameConfig;
