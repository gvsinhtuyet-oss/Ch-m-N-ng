import type {GameConfig} from '../types';
export const station3Config = {
  "stationId": "g3-station-3",
  "stationName": "Cộng đồng các dân tộc Đà Nẵng",
  "title": "Bí mật sắc màu quê hương",
  "background": "/games/shared/v1/grade3/g3-3-play.webp",
  "victoryBackground": "/games/shared/v1/grade3/g3-3-victory.webp",
  "collectible": {
    "icon": "🪡",
    "image": "/games/shared/v1/grade3/badge.svg",
    "name": "huy hiệu thổ cẩm vàng"
  },
  "intro": {
    "heading": "CÙNG KHÁM PHÁ SẮC MÀU VĂN HÓA",
    "story": "Quê hương có nhiều cộng đồng dân tộc cùng sinh sống. Vượt qua 5 thử thách để sưu tầm 5 huy hiệu thổ cẩm vàng nhé!",
    "call": "Lắng nghe, tìm hiểu và trân trọng những nét văn hóa khác nhau!",
    "readyLabel": "Khám phá quê hương"
  },
  "victory": {
    "praise": "🌟 NGƯỜI BẠN ĐOÀN KẾT!",
    "achievement": "Em đã chinh phục 5 thử thách!",
    "reward": "Em đã sưu tầm đủ 5 huy hiệu thổ cẩm vàng!"
  },
  "questions": [
    {
      "id": "q1",
      "level": "Nhận biết",
      "kind": "image",
      "prompt": "Ảnh nào có trang phục thổ cẩm truyền thống?",
      "hint": "Hãy quan sát tấm vải có các hoa văn được dệt trên trang phục.",
      "options": [
        {
          "text": "Thuyền thúng",
          "image": "/learning/grade3/photos/thung-my-khe.webp"
        },
        {
          "text": "Trang phục thổ cẩm",
          "image": "/learning/grade3/photos/co-tu-costumes.webp"
        },
        {
          "text": "Lọc nước mắm",
          "image": "/images/real-photos/nam-o-loc.webp"
        }
      ],
      "answer": 1
    },
    {
      "id": "q2",
      "level": "Nhận biết",
      "kind": "choice",
      "prompt": "Trên đỉnh cây nêu của đồng bào Co có hình gì?",
      "hint": "Hãy nhớ hình con chim trang trí trên đỉnh cây nêu trong bài học.",
      "options": [
        {
          "text": "Chim chèo bẻo bằng gỗ"
        },
        {
          "text": "Cá cơm than"
        },
        {
          "text": "Con tằm"
        }
      ],
      "answer": 0
    },
    {
      "id": "q3",
      "level": "Thông hiểu",
      "kind": "choice",
      "prompt": "Vì sao cần giữ gìn nét văn hóa của các dân tộc?",
      "hint": "Mỗi cộng đồng có nét riêng, cùng góp phần làm nên vẻ đẹp quê hương.",
      "options": [
        {
          "text": "Để mọi người đều có cùng một phong tục"
        },
        {
          "text": "Để chỉ còn một kiểu trang phục"
        },
        {
          "text": "Để quê hương thêm phong phú và gắn bó"
        }
      ],
      "answer": 2
    },
    {
      "id": "q4",
      "level": "Thông hiểu",
      "kind": "match",
      "prompt": "Nối cộng đồng với nét văn hóa phù hợp.",
      "hint": "Nhớ điệu múa Cơ Tu, cây nêu của người Co và tinh thần đoàn kết.",
      "left": [
        "Đồng bào Cơ Tu",
        "Đồng bào Co",
        "Các cộng đồng dân tộc"
      ],
      "right": [
        "Cùng làm phong phú văn hóa quê hương",
        "Cây nêu có hình chim chèo bẻo",
        "Múa Tung tung – da dá"
      ],
      "solution": [
        2,
        1,
        0
      ]
    },
    {
      "id": "q5",
      "level": "Vận dụng",
      "kind": "choice",
      "prompt": "Bạn có tiếng nói và trang phục khác mình. Em nên làm gì?",
      "hint": "Tôn trọng sự khác biệt là cách giữ gìn tình đoàn kết.",
      "options": [
        {
          "text": "Trêu chọc sự khác biệt"
        },
        {
          "text": "Tôn trọng, lắng nghe và tìm hiểu"
        },
        {
          "text": "Tự ý chạm vào đồ dùng của bạn"
        }
      ],
      "answer": 1
    }
  ]
} satisfies GameConfig;
