import type {GameConfig} from '../types';
export const station5Config = {
  "stationId": "g3-station-5",
  "layout": "safe-v1",
  "stationName": "Nghề đan thuyền thúng ở Sơn Trà",
  "title": "Xưởng thuyền thúng tí hon",
  "background": "/games/shared/v1/grade3/review/basket-play-safe-v1.webp",
  "victoryBackground": "/games/shared/v1/grade3/review/basket-victory-safe-v1.webp",
  "collectible": {
    "icon": "🛶",
    "image": "/games/shared/v1/grade3/basket.svg",
    "name": "thuyền thúng vàng mini"
  },
  "intro": {
    "heading": "GHÉ XƯỞNG THUYỀN THÚNG TÍ HON",
    "story": "Từ nan tre đến chiếc thúng tròn đi biển: khám phá 5 thử thách để sưu tầm 5 thuyền thúng vàng mini!",
    "call": "Quan sát bàn tay khéo léo và trân trọng nghề biển quê hương!",
    "readyLabel": "Khám phá quê hương"
  },
  "victory": {
    "praise": "🌟 NGƯỜI TÌM HIỂU NGHỀ BIỂN!",
    "achievement": "Em đã chinh phục 5 thử thách!",
    "reward": "Em đã sưu tầm đủ 5 thuyền thúng vàng mini!"
  },
  "questions": [
    {
      "id": "q1",
      "level": "Nhận biết",
      "kind": "image",
      "prompt": "Hình ảnh nào là thuyền thúng?",
      "hint": "Thuyền thúng có thân tròn, được đan từ những nan tre.",
      "options": [
        {
          "text": "Lọc nước mắm",
          "image": "/images/real-photos/nam-o-loc.webp"
        },
        {
          "text": "Thuyền thúng tròn",
          "image": "/learning/grade3/photos/thung-my-khe.webp"
        },
        {
          "text": "Trang phục thổ cẩm",
          "image": "/learning/grade3/photos/co-tu-costumes.webp"
        }
      ],
      "answer": 1
    },
    {
      "id": "q2",
      "level": "Nhận biết",
      "kind": "choice",
      "prompt": "Nguyên liệu chính để đan thân thuyền thúng là gì?",
      "hint": "Người thợ chẻ và vót cây này thành những nan để đan.",
      "options": [
        {
          "text": "Cá cơm than"
        },
        {
          "text": "Sợi cói"
        },
        {
          "text": "Tre"
        }
      ],
      "answer": 2
    },
    {
      "id": "q3",
      "level": "Thông hiểu",
      "kind": "choice",
      "prompt": "Vì sao người thợ phủ dầu rái lên bề mặt thúng?",
      "hint": "Thúng dùng trên nước nên cần hạn chế nước thấm qua thân.",
      "options": [
        {
          "text": "Để thúng biến thành chum"
        },
        {
          "text": "Để giúp thúng chống thấm nước"
        },
        {
          "text": "Để thay toàn bộ nan tre"
        }
      ],
      "answer": 1
    },
    {
      "id": "q4",
      "level": "Thông hiểu",
      "kind": "match",
      "prompt": "Nối công đoạn với việc làm phù hợp.",
      "hint": "Theo dõi từ nan tre đến thân thúng rồi hoàn thiện vành thúng.",
      "left": [
        "Chẻ và vót tre",
        "Đan nan tre",
        "Nẹp và ép vành"
      ],
      "right": [
        "Làm vành thúng chắc hơn",
        "Tạo những nan tre",
        "Tạo thân thúng tròn"
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
      "kind": "choice",
      "prompt": "Khi xem người thợ dùng dao chẻ tre, em nên làm gì?",
      "hint": "Dao và nan tre sắc có thể gây nguy hiểm. Hãy nghe hướng dẫn của người lớn.",
      "options": [
        {
          "text": "Đứng quan sát cùng người lớn, không chạm dao"
        },
        {
          "text": "Tự cầm dao thử"
        },
        {
          "text": "Đùa nghịch cạnh người thợ"
        }
      ],
      "answer": 0
    }
  ]
} satisfies GameConfig;
