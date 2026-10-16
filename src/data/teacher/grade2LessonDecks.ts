export interface LessonSlide {
  images?: {src:string;alt:string;caption:string}[];
  title: string;
  points: string[];
  question: string;
  answer: string;
  teacherNotes: string;
  visual: string[];
}
export interface LessonDeckDefinition {
  presentationKind?: 'topic';
  teachingContent?: string;
  resourceLinks?: {stationId:string;hotspotId:string}[];
  mappingReview?: {sourceYear:string;currentYearConfirmed:boolean;note:string};
  recordId: string;
  sourceRecord: { id: string; grade: number; subject: string; week: string; lesson: string; integrationType: string; activity: string; content: string };
  title: string;
  outcomes: string[];
  sources: string[];
  reviewNotes: string[];
  status: 'source-aligned-draft';
  slides: LessonSlide[];
}
// Original educational adaptations. Source alignment is not institutional approval.
export const GRADE2_LESSON_DECKS: LessonDeckDefinition[] = [
  {
    "recordId": "gddp-2026-2-01",
    "title": "Gặp người có công với quê hương",
    "outcomes": [
      "Nhận biết Nguyễn Văn Thoại còn được gọi là Thoại Ngọc Hầu.",
      "Nêu một đóng góp trong tư liệu; bày tỏ sự biết ơn người có công."
    ],
    "sources": [
      "TCM2_ĐỊA CHỈ TÍCH HỢP CÁC NỘI DUNG GIÁO DỤC.Mdocx.docx · mục 7, trang 17–18 · năm học ghi trên nguồn: 2025–2026",
      "LỚP 2-CHỦ ĐỀ 1-NHÀ THỜ NVT-GDĐP TPĐN.docx · trang 1–5"
    ],
    "reviewNotes": [],
    "status": "source-aligned-draft",
    "slides": [
      {
        "title": "Từ câu chuyện yêu nước đến quê hương em",
        "points": [
          "Bài đọc chính: Bóp nát quả cam.",
          "Phần liên hệ địa phương: tìm hiểu người có công qua di tích và tư liệu."
        ],
        "question": "Em biết tên một người có công với quê hương không?",
        "answer": "Chấp nhận tên đúng theo hiểu biết; giáo viên kiểm tra lại nếu chưa rõ.",
        "teacherNotes": "Khởi động ngắn. Không nói Nguyễn Văn Thoại hoặc Huỳnh Thúc Kháng là nhân vật trong Bóp nát quả cam.",
        "visual": [
          "Bài đọc chính",
          "Liên hệ quê hương",
          "Tư liệu danh nhân"
        ]
      },
      {
        "title": "Nguyễn Văn Thoại – Thoại Ngọc Hầu",
        "points": [
          "Nguyễn Văn Thoại được phong tước hiệu Thoại Ngọc Hầu.",
          "Tư liệu nêu ông hỗ trợ lập chợ, xây dựng đình, chùa cho quê hương An Hải."
        ],
        "question": "Hai tên trong tiêu đề nói về một hay hai người?",
        "answer": "Một người: Nguyễn Văn Thoại được phong tước hiệu Thoại Ngọc Hầu.",
        "teacherNotes": "Nguồn trang 1. Chỉ giới thiệu đóng góp có trong tư liệu, không ghép với chiến công nhân vật bài đọc.",
        "visual": [
          "Nguyễn Văn Thoại",
          "Thoại Ngọc Hầu",
          "Đóng góp quê hương"
        ]
      },
      {
        "title": "Nhà thờ lưu dấu người xưa",
        "points": [
          "Tài liệu giới thiệu Nhà thờ Tiền hiền làng An Hải và Thoại Ngọc Hầu.",
          "Di tích giúp chúng ta tìm hiểu và tưởng nhớ người có công."
        ],
        "question": "Khi đến di tích, em muốn tìm hiểu điều gì?",
        "answer": "Tên di tích, người được tưởng nhớ, đóng góp của người đó; nghe hướng dẫn và đọc chú thích.",
        "teacherNotes": "Trang 3–4. Không yêu cầu học sinh lớp 2 nhớ số quyết định hoặc diện tích.",
        "visual": [
          "Di tích",
          "Tư liệu",
          "Lòng biết ơn"
        ]
      },
      {
        "title": "Cụ Huỳnh Thúc Kháng",
        "points": [
          "Tư liệu giới thiệu cụ là người học rộng, tài cao, yêu nước, thương dân.",
          "Nhà lưu niệm còn giữ không gian làm việc và những vật dụng cụ từng dùng."
        ],
        "question": "Vật dụng và không gian lưu niệm giúp chúng ta hiểu điều gì?",
        "answer": "Giúp tìm hiểu cuộc sống, công việc và câu chuyện về cụ.",
        "teacherNotes": "Trang 2, 4. Tách rõ hồ sơ cụ Huỳnh với hồ sơ Nguyễn Văn Thoại.",
        "visual": [
          "Huỳnh Thúc Kháng",
          "Không gian làm việc",
          "Vật dụng lưu niệm"
        ]
      },
      {
        "title": "Nói lời biết ơn",
        "points": [
          "Em biết thêm một người có công với quê hương.",
          "Em kể một điều từ tư liệu và một việc thể hiện sự trân trọng."
        ],
        "question": "Em hoàn thành câu: Em biết ơn… vì…",
        "answer": "Ví dụ: Em trân trọng Nguyễn Văn Thoại vì ông góp sức xây dựng quê hương.",
        "teacherNotes": "Trở về nhiệm vụ bài Tiếng Việt; không thay thế nội dung tìm hiểu bài đọc.",
        "visual": [
          "Một nhân vật",
          "Một dẫn chứng",
          "Một việc tốt"
        ]
      }
    ],
    "sourceRecord": {
      "id": "gddp-2026-2-01",
      "grade": 2,
      "subject": "Tiếng Việt",
      "week": "31",
      "lesson": "Bài 23: Bóp nát quả cam",
      "integrationType": "Bộ phận",
      "activity": "Khởi động (GDĐP)\nTìm hiểu bài (Tiếng Việt)",
      "content": "Chủ đề 1: Nhà thờ Nguyễn Văn Thoại – Nhà lưu niệm Huỳnh Thúc Kháng"
    }
  },
  {
    "recordId": "gddp-2026-2-02",
    "title": "Cù Lao Chàm – Sơn Trà: cảnh đẹp và sự sống",
    "outcomes": [
      "Nêu được nét cảnh quan và một sinh vật trong tư liệu.",
      "Nói được một việc bảo vệ thiên nhiên."
    ],
    "sources": [
      "TCM2_ĐỊA CHỈ TÍCH HỢP CÁC NỘI DUNG GIÁO DỤC.Mdocx.docx · mục 7, trang 17–18 · năm học ghi trên nguồn: 2025–2026",
      "LỚP 2-CHỦ ĐỀ 4-CÙ LAO CHÀM - KHU BẢO TỒN THIÊN NHIÊN SƠN TRÀ-GDĐP TPĐN.docx · trang 1–6"
    ],
    "reviewNotes": [],
    "status": "source-aligned-draft",
    "slides": [
      {
        "title": "Cùng đi qua những miền quê",
        "points": [
          "Đất nước có nhiều cảnh đẹp.",
          "Ở địa phương, chúng mình tìm hiểu Cù Lao Chàm và Sơn Trà."
        ],
        "question": "Em muốn giới thiệu cảnh biển hay cảnh rừng?",
        "answer": "Câu hỏi mở; khuyến khích nói một lí do.",
        "teacherNotes": "Dùng ở khởi động; nối với bài Trên các miền đất nước.",
        "visual": [
          "Biển",
          "Rừng",
          "Quê hương"
        ]
      },
      {
        "title": "Cù Lao Chàm",
        "points": [
          "Tài liệu giới thiệu quần đảo với Hòn Lao là đảo chính.",
          "Cảnh quan có bãi cát, nước biển, rừng và sinh vật phong phú."
        ],
        "question": "Em có thể kể hai chi tiết cảnh quan vừa nghe không?",
        "answer": "Ví dụ: bãi cát và rừng; biển và sinh vật biển.",
        "teacherNotes": "Trang 1–2. Không thay sơ đồ chữ này cho bản đồ vị trí địa lí.",
        "visual": [
          "Cù Lao Chàm",
          "Hòn Lao",
          "Biển và rừng"
        ]
      },
      {
        "title": "Sơn Trà",
        "points": [
          "Tư liệu giới thiệu rừng, cây đa và sinh vật biển.",
          "Voọc chà vá chân nâu là động vật quý hiếm cần được bảo vệ."
        ],
        "question": "Tại sao không tự tiện cho khỉ, voọc ăn?",
        "answer": "Cần bảo vệ động vật và tuân thủ hướng dẫn; không tự ý tiếp xúc, cho ăn.",
        "teacherNotes": "Trang 4, 6. Không yêu cầu trẻ tiếp cận động vật để quan sát.",
        "visual": [
          "Rừng",
          "Voọc chà vá chân nâu",
          "Biển"
        ]
      },
      {
        "title": "Lựa chọn của Nhà phiêu lưu",
        "points": [
          "Không bẻ cành, hái hoa hay làm hại sinh vật.",
          "Bỏ rác đúng nơi; đi cùng đoàn và đọc bảng hướng dẫn."
        ],
        "question": "Bạn muốn bẻ một nhánh cây làm kỉ niệm. Em khuyên gì?",
        "answer": "Không bẻ cây; có thể quan sát, ghi nhớ hoặc chụp ảnh khi được phép.",
        "teacherNotes": "Trang 5–6. Cho hai học sinh đóng vai ngắn.",
        "visual": [
          "Quan sát",
          "Giữ gìn",
          "Theo hướng dẫn"
        ]
      },
      {
        "title": "Giới thiệu một cảnh đẹp",
        "points": [
          "Nói tên nơi em chọn.",
          "Nêu một nét đẹp và một việc cần làm để bảo vệ."
        ],
        "question": "Em giới thiệu cảnh đẹp trong hai hoặc ba câu.",
        "answer": "Ví dụ: Em muốn giới thiệu Sơn Trà. Nơi đây có rừng và động vật cần bảo vệ. Em không xả rác.",
        "teacherNotes": "Phần vận dụng của Tiếng Việt: đánh giá lời nói rõ, đúng nội dung.",
        "visual": [
          "Tên nơi",
          "Nét nổi bật",
          "Hành động"
        ]
      }
    ],
    "sourceRecord": {
      "id": "gddp-2026-2-02",
      "grade": 2,
      "subject": "Tiếng Việt",
      "week": "32",
      "lesson": "Bài 26: Trên các miền đất nước",
      "integrationType": "Bộ phận",
      "activity": "Khởi động (GDĐP)\nVận dụng (Tiếng Việt)",
      "content": "Chủ đề 4: Cù lao chàm – Khu bảo tồn thiên nhiên Sơn Trà"
    }
  },
  {
    "recordId": "gddp-2026-2-03",
    "title": "Mùa lúa và niềm vui lễ hội",
    "outcomes": [
      "Biết Lễ hội Mừng lúa mới xuất hiện trong tài liệu nguồn.",
      "Nói được một việc trân trọng người lao động và một cách tham gia văn minh."
    ],
    "sources": [
      "TCM2_ĐỊA CHỈ TÍCH HỢP CÁC NỘI DUNG GIÁO DỤC.Mdocx.docx · mục 7, trang 17–18 · năm học ghi trên nguồn: 2025–2026",
      "LỚP 2-CHỦ ĐỀ 3-LỄ HỘI TRUYỀN THỐNG-GDĐP TPĐN.docx · trang 1–5"
    ],
    "reviewNotes": [
      "Nguồn tích hợp ghi Chủ đề 6, nhưng bộ năm chủ đề lớp 2 gửi kèm không có chủ đề 6 riêng. Giữ nguyên dữ liệu nguồn; không tự đổi số.",
      "Chưa có bài chi tiết riêng về Lễ hội Mừng lúa mới. Chỉ sử dụng thông tin đã có và phần liên hệ được ghi rõ."
    ],
    "status": "source-aligned-draft",
    "slides": [
      {
        "title": "Từ cánh đồng đến ngày hội",
        "points": [
          "Bài nghe–viết nói về cánh đồng quê em.",
          "Tài liệu địa phương có giới thiệu Lễ hội Mừng lúa mới."
        ],
        "question": "Hạt lúa gợi cho em nghĩ đến công việc của ai?",
        "answer": "Người trồng lúa và những người góp công làm ra lương thực.",
        "teacherNotes": "Phần liên hệ biên soạn; không trích hoặc thay đổi bài nghe–viết trong sách.",
        "visual": [
          "Cánh đồng",
          "Người lao động",
          "Ngày hội"
        ]
      },
      {
        "title": "Đọc đúng điều tài liệu cho biết",
        "points": [
          "Lễ hội Mừng lúa mới có trong nhóm lễ hội truyền thống được giới thiệu.",
          "Các lễ hội thường có phần lễ và phần hội."
        ],
        "question": "Có thể nói mọi lễ hội đều có hoạt động giống nhau không?",
        "answer": "Không. Cần tìm hiểu hoạt động cụ thể của từng lễ hội.",
        "teacherNotes": "Nguồn chỉ nêu tên và hình lễ hội Mừng lúa mới; không suy ra cộng đồng tổ chức, ngày tháng hoặc nghi thức riêng.",
        "visual": [
          "Tên lễ hội",
          "Thông tin có nguồn",
          "Không tự suy đoán"
        ]
      },
      {
        "title": "Trân trọng hạt gạo",
        "points": [
          "Hạt gạo gắn với công sức lao động.",
          "Biết quý thức ăn và không lãng phí là một việc vừa sức."
        ],
        "question": "Em làm gì để không lãng phí thức ăn?",
        "answer": "Lấy phần vừa đủ; trao đổi với người lớn khi cần; không bỏ phí thức ăn.",
        "teacherNotes": "Đây là hoạt động liên hệ do giáo viên tổ chức, không phải mô tả nghi thức lễ hội.",
        "visual": [
          "Hạt gạo",
          "Công sức",
          "Trân trọng"
        ]
      },
      {
        "title": "Tham gia lễ hội văn minh",
        "points": [
          "Xếp hàng, mặc trang phục phù hợp.",
          "Giữ vệ sinh và chấp hành nội quy."
        ],
        "question": "Nếu bạn vứt rác tại nơi tổ chức, em nói gì?",
        "answer": "Nhắc bạn nhặt và bỏ rác đúng nơi, ứng xử lịch sự.",
        "teacherNotes": "Trang 5. Không gán các hoạt động của lễ hội khác thành nghi thức Mừng lúa mới.",
        "visual": [
          "Trật tự",
          "Vệ sinh",
          "Nội quy"
        ]
      },
      {
        "title": "Nói trước khi nghe–viết",
        "points": [
          "Nói một câu về cánh đồng hoặc người làm ra hạt gạo.",
          "Trở lại bài nghe–viết theo sách và hướng dẫn của cô."
        ],
        "question": "Em đặt một câu ngắn có từ cánh đồng.",
        "answer": "Chấp nhận câu đúng nghĩa, diễn đạt rõ; sửa viết hoa và dấu câu khi cần.",
        "teacherNotes": "Không cung cấp bản chép thay thế văn bản SGK.",
        "visual": [
          "Quan sát",
          "Nói một câu",
          "Trở lại bài chính"
        ]
      }
    ],
    "sourceRecord": {
      "id": "gddp-2026-2-03",
      "grade": 2,
      "subject": "Tiếng Việt",
      "week": "34",
      "lesson": "Bài 30: Nghe- viết : Cánh đồng quê em",
      "integrationType": "Bộ Phận",
      "activity": "Khởi động (GDĐP)\nLuyện tập (Tiếng Việt)",
      "content": "Chủ đề 6: Lễ hội Mừng lúa mới"
    }
  },
  {
    "recordId": "gddp-2026-2-04",
    "title": "Yêu quê hương qua di sản Hội An",
    "outcomes": [
      "Nhận biết một số nét tiêu biểu của Hội An.",
      "Lựa chọn việc làm thể hiện tình yêu và giữ gìn di sản."
    ],
    "sources": [
      "TCM2_ĐỊA CHỈ TÍCH HỢP CÁC NỘI DUNG GIÁO DỤC.Mdocx.docx · mục 7, trang 17–18 · năm học ghi trên nguồn: 2025–2026",
      "LỚP 2-CHỦ ĐỀ 2-DI SẢN THẾ GIỚI HỘI AN GDĐP TPĐN.docx · trang 1–6"
    ],
    "reviewNotes": [],
    "status": "source-aligned-draft",
    "slides": [
      {
        "title": "Em yêu điều gì ở quê hương?",
        "points": [
          "Mỗi nơi có những cảnh vật và giá trị đáng trân trọng.",
          "Hôm nay chúng mình tìm hiểu Hội An để nói về tình yêu quê hương."
        ],
        "question": "Yêu quê hương có thể thể hiện bằng việc làm nào?",
        "answer": "Giữ vệ sinh, giữ gìn di tích, tìm hiểu và giới thiệu điều tốt đẹp.",
        "teacherNotes": "Dùng đúng phần khám phá của bài Đạo đức; tiếp nhận nhiều câu trả lời phù hợp.",
        "visual": [
          "Yêu quê hương",
          "Tìm hiểu",
          "Giữ gìn"
        ]
      },
      {
        "title": "Nét đẹp phố cổ",
        "points": [
          "Tài liệu có hình phố cổ bên sông Hoài, Chùa Cầu, nhà cổ và hội quán.",
          "Những công trình gợi vẻ cổ kính của Hội An."
        ],
        "question": "Em muốn quan sát công trình nào trong tư liệu?",
        "answer": "Câu hỏi mở: Chùa Cầu, nhà cổ, hội quán…",
        "teacherNotes": "Trang 1–2. Địa chỉ hành chính trong bản nguồn còn đoạn chồng cũ–mới; không đưa vào nội dung khẳng định.",
        "visual": [
          "Phố cổ",
          "Chùa Cầu",
          "Nhà cổ và hội quán"
        ]
      },
      {
        "title": "Di sản còn có đời sống văn hóa",
        "points": [
          "Tài liệu giới thiệu các hoạt động văn hóa và một số làng nghề.",
          "Làng gốm Thanh Hà, làng rau Trà Quế là các ví dụ được nêu."
        ],
        "question": "Người làm nghề góp gì cho nét đẹp quê hương?",
        "answer": "Tạo sản phẩm, giữ kỹ năng nghề và góp phần gìn giữ văn hóa.",
        "teacherNotes": "Trang 3–4. Không dùng câu trả lời mang tính quảng cáo.",
        "visual": [
          "Công trình",
          "Sinh hoạt văn hóa",
          "Làng nghề"
        ]
      },
      {
        "title": "Nếu em là khách tham quan",
        "points": [
          "Không viết, vẽ lên công trình.",
          "Giữ vệ sinh, ứng xử lịch sự, làm theo hướng dẫn."
        ],
        "question": "Bạn định viết tên lên tường để lưu kỉ niệm. Em làm gì?",
        "answer": "Khuyên bạn không viết; giữ nguyên công trình, chọn cách ghi nhớ khác phù hợp.",
        "teacherNotes": "Cho học sinh giải thích vì sao, không chỉ chọn đáp án.",
        "visual": [
          "Tình huống",
          "Lựa chọn",
          "Lí do"
        ]
      },
      {
        "title": "Một việc nhỏ em sẽ làm",
        "points": [
          "Em chọn một việc giữ gìn cảnh quan hoặc di sản.",
          "Em chia sẻ việc đó với bạn hoặc người thân."
        ],
        "question": "Tuần này em thực hiện việc gì để thể hiện yêu quê hương?",
        "answer": "Một việc cụ thể, vừa sức; không yêu cầu phải đi du lịch hoặc mua sản phẩm.",
        "teacherNotes": "Ghi nhận hành động thực tế thay vì chỉ đánh giá cảm xúc.",
        "visual": [
          "Việc cụ thể",
          "Người cùng làm",
          "Khi thực hiện"
        ]
      }
    ],
    "sourceRecord": {
      "id": "gddp-2026-2-04",
      "grade": 2,
      "subject": "Đạo đức",
      "week": "31",
      "lesson": "Bài 13: : Em yêu quê hương (tiết 1)",
      "integrationType": "Bộ phận",
      "activity": "Khám phá, Yêu cầu 3 (GDĐP)\nKhám phá Yêu cầu 2 (Đạo đức)",
      "content": "Chủ đề 2: Di sản văn hóa thế giới Hội An"
    }
  },
  {
    "recordId": "gddp-2026-2-05",
    "title": "Cùng tìm hiểu lễ hội truyền thống",
    "outcomes": [
      "Gọi tên một số lễ hội theo tư liệu.",
      "Phân biệt phần lễ, phần hội; thực hành tham gia văn minh."
    ],
    "sources": [
      "TCM2_ĐỊA CHỈ TÍCH HỢP CÁC NỘI DUNG GIÁO DỤC.Mdocx.docx · mục 7, trang 17–18 · năm học ghi trên nguồn: 2025–2026",
      "LỚP 2-CHỦ ĐỀ 3-LỄ HỘI TRUYỀN THỐNG-GDĐP TPĐN.docx · trang 1–5"
    ],
    "reviewNotes": [],
    "status": "source-aligned-draft",
    "slides": [
      {
        "title": "Gọi tên ngày hội quê em",
        "points": [
          "Tài liệu nêu Cầu ngư, Đình làng Túy Loan, Mục Đồng, Mừng lúa mới, Cầu bông.",
          "Mỗi lễ hội có nét riêng cần tìm hiểu."
        ],
        "question": "Em đã biết hoặc nghe tên lễ hội nào?",
        "answer": "Câu hỏi mở; không bắt buộc học sinh từng tham dự.",
        "teacherNotes": "Giáo viên đọc rõ tên; dùng ảnh tư liệu nếu có ảnh đã được phép sử dụng.",
        "visual": [
          "Cầu ngư",
          "Mục Đồng",
          "Mừng lúa mới"
        ]
      },
      {
        "title": "Phần lễ",
        "points": [
          "Tài liệu giới thiệu nghi thức như dâng hương, lễ tế, cầu an, rước kiệu.",
          "Hoạt động cụ thể phụ thuộc từng lễ hội."
        ],
        "question": "Trong tư liệu, hoạt động nào thuộc phần lễ?",
        "answer": "Dâng hương, lễ tế hoặc rước kiệu theo ví dụ đã nêu.",
        "teacherNotes": "Trang 2–4. Giới thiệu văn hóa, không tổ chức nghi thức tín ngưỡng trên lớp.",
        "visual": [
          "Nghi thức",
          "Trang trọng",
          "Tôn trọng"
        ]
      },
      {
        "title": "Phần hội",
        "points": [
          "Có trò chơi dân gian, văn nghệ và thể thao.",
          "Ví dụ trong tài liệu: Bài Chòi, lắc thúng, gói bánh tét."
        ],
        "question": "Em thích tìm hiểu hoạt động hội nào?",
        "answer": "Câu hỏi mở; học sinh nêu lí do phù hợp.",
        "teacherNotes": "Không cho học sinh thực hiện hoạt động ngoài điều kiện an toàn của lớp học.",
        "visual": [
          "Trò chơi",
          "Văn nghệ",
          "Thể thao"
        ]
      },
      {
        "title": "Giữ niềm vui chung",
        "points": [
          "Lễ hội thể hiện những ước mong và sự gắn bó của cộng đồng.",
          "Xếp hàng, giữ vệ sinh, trang phục phù hợp, chấp hành nội quy."
        ],
        "question": "Nếu có đông người, em cần làm gì?",
        "answer": "Đi cùng người lớn hoặc đoàn, theo hướng dẫn; không chen lấn hay tự tách nhóm.",
        "teacherNotes": "Dựa phần ứng xử trang 5; câu hỏi tình huống được biên soạn thêm.",
        "visual": [
          "Gắn kết",
          "Trật tự",
          "Vệ sinh"
        ]
      },
      {
        "title": "Hướng dẫn viên lễ hội nhí",
        "points": [
          "Giới thiệu tên lễ hội, một hoạt động và ý nghĩa theo nguồn.",
          "Thêm một lời nhắn tham gia văn minh."
        ],
        "question": "Nhóm em sẽ giới thiệu lễ hội như thế nào?",
        "answer": "Tên đúng; hoạt động có nguồn; nêu điều trân trọng và cách ứng xử.",
        "teacherNotes": "Đánh giá nhóm bằng bốn tiêu chí trên; không tự thêm nơi hoặc ngày tổ chức chưa kiểm chứng.",
        "visual": [
          "Tên",
          "Hoạt động",
          "Ý nghĩa",
          "Ứng xử"
        ]
      }
    ],
    "sourceRecord": {
      "id": "gddp-2026-2-05",
      "grade": 2,
      "subject": "HĐTN",
      "week": "14",
      "lesson": "Chủ đề 4:  Truyền thống quê em",
      "integrationType": "Toàn phần",
      "activity": "Khám phá (GDĐP)\nSinh hoạt lớp (HĐTN)",
      "content": "Chủ đề 3: Lễ hội truyền thống"
    }
  },
  {
    "recordId": "gddp-2026-2-06",
    "title": "Công trình công cộng – Cùng dùng, cùng giữ",
    "outcomes": [
      "Nhận biết lợi ích của một số công trình phục vụ cộng đồng.",
      "Chọn việc giữ gìn môi trường và đồ dùng chung."
    ],
    "sources": [
      "TCM2_ĐỊA CHỈ TÍCH HỢP CÁC NỘI DUNG GIÁO DỤC.Mdocx.docx · mục 7, trang 17–18 · năm học ghi trên nguồn: 2025–2026"
    ],
    "reviewNotes": [
      "Chỉ có địa chỉ Công trình công cộng trong nguồn tổ 2; chưa tìm thấy bài học chi tiết riêng. Toàn bộ phần nội dung và ví dụ là bản biên soạn bổ sung, cần tổ chuyên môn duyệt."
    ],
    "status": "source-aligned-draft",
    "slides": [
      {
        "title": "Nơi nhiều người cùng sử dụng",
        "points": [
          "Công viên, thư viện công cộng, sân chơi chung là những ví dụ để thảo luận.",
          "Chúng ta cần sử dụng đúng mục đích và giữ gìn cho mọi người."
        ],
        "question": "Em biết nơi nào phục vụ nhiều người trong cộng đồng?",
        "answer": "Các ví dụ phù hợp; giáo viên xác nhận tên và công dụng cụ thể.",
        "teacherNotes": "Nội dung khái niệm và ví dụ do người biên soạn đề xuất. Nguồn tổ 2 chỉ ghi chủ đề, chưa có bài chi tiết riêng.",
        "visual": [
          "Công viên",
          "Thư viện công cộng",
          "Sân chơi chung"
        ]
      },
      {
        "title": "Mỗi nơi một lợi ích",
        "points": [
          "Công viên có thể là nơi nghỉ ngơi, vận động.",
          "Thư viện phục vụ đọc, tìm hiểu; sân chơi phục vụ vui chơi phù hợp."
        ],
        "question": "Em ghép nơi sử dụng với lợi ích nào?",
        "answer": "Ghép theo ví dụ trên; chấp nhận lợi ích khác có căn cứ.",
        "teacherNotes": "Không gắn ảnh hoặc tên một công trình cụ thể khi chưa được giáo viên xác nhận.",
        "visual": [
          "Nghỉ ngơi",
          "Đọc sách",
          "Vui chơi"
        ]
      },
      {
        "title": "Quan sát trước khi hành động",
        "points": [
          "Đọc nội quy và quan sát tình trạng nơi sử dụng.",
          "Phát hiện rác, đồ hỏng hoặc việc sử dụng chưa phù hợp."
        ],
        "question": "Em có nên tự sửa thiết bị hỏng ở sân chơi không?",
        "answer": "Không; tránh sử dụng thiết bị hỏng và báo người lớn hoặc người phụ trách.",
        "teacherNotes": "Tình huống thực hành được biên soạn, không phải trích nguyên văn SGK.",
        "visual": [
          "Quan sát",
          "Đọc nội quy",
          "Báo người phụ trách"
        ]
      },
      {
        "title": "Giữ nơi chung xanh, sạch",
        "points": [
          "Bỏ rác đúng nơi; không viết vẽ lên đồ dùng chung.",
          "Giữ cây xanh và sử dụng tiết kiệm, đúng hướng dẫn."
        ],
        "question": "Bạn viết lên ghế công viên. Em nhắc bạn thế nào?",
        "answer": "Nhắc không viết vẽ, giữ ghế sạch để mọi người cùng dùng.",
        "teacherNotes": "Gắn với hoạt động 2 HĐTN trong địa chỉ nguồn; giáo viên đối chiếu đúng yêu cầu sách trước khi dùng.",
        "visual": [
          "Không xả rác",
          "Không viết vẽ",
          "Giữ cây xanh"
        ]
      },
      {
        "title": "Kế hoạch việc tốt của lớp",
        "points": [
          "Chọn một việc vừa sức ở trường hoặc nơi sinh hoạt chung.",
          "Nêu việc làm, người cùng làm và thời điểm."
        ],
        "question": "Nhóm em chọn việc nào và làm khi nào?",
        "answer": "Kế hoạch cụ thể, có người lớn hướng dẫn khi cần; không làm ở nơi nguy hiểm.",
        "teacherNotes": "Đánh giá sản phẩm kế hoạch, không yêu cầu ảnh chứng minh có thông tin riêng tư.",
        "visual": [
          "Việc làm",
          "Người tham gia",
          "Thời điểm"
        ]
      }
    ],
    "sourceRecord": {
      "id": "gddp-2026-2-06",
      "grade": 2,
      "subject": "HĐTN",
      "week": "28",
      "lesson": "Chủ đề 8:  \nMôi trường xanh – Cuộc sống xanh",
      "integrationType": "Bộ phận",
      "activity": "Khám phá (GDĐP)\nHoạt động 2 (HĐTN)",
      "content": "Chủ đề 1:  Công trình công cộng"
    }
  },
  {
    "recordId": "gddp-2026-2-07",
    "title": "Nghề dệt chiếu trong cuộc sống gia đình",
    "outcomes": [
      "Gọi tên nghề dệt chiếu và sản phẩm.",
      "Nhận biết nguyên liệu, công sức người thợ và ứng xử khi tham quan."
    ],
    "sources": [
      "TCM2_ĐỊA CHỈ TÍCH HỢP CÁC NỘI DUNG GIÁO DỤC.Mdocx.docx · mục 7, trang 17–18 · năm học ghi trên nguồn: 2025–2026",
      "LỚP 2-CHỦ ĐỀ 5-CHIẾU CẨM NÊ-CHIẾU BÀN THẠCH- GDĐP TPĐN.docx · trang 1–6"
    ],
    "reviewNotes": [],
    "status": "source-aligned-draft",
    "slides": [
      {
        "title": "Người lớn làm những nghề gì?",
        "points": [
          "Mỗi công việc đóng góp cho cuộc sống.",
          "Hôm nay chúng mình tìm hiểu nghề dệt chiếu trong tài liệu địa phương."
        ],
        "question": "Em biết nghề nào của người lớn?",
        "answer": "Chấp nhận nghề phù hợp; không yêu cầu học sinh công khai thông tin riêng của gia đình.",
        "teacherNotes": "Khởi động yêu cầu 2 TNXH; không thay thế toàn bộ bài Nghề nghiệp của người lớn.",
        "visual": [
          "Người lao động",
          "Công việc",
          "Sản phẩm"
        ]
      },
      {
        "title": "Chiếu Cẩm Nê – Chiếu Bàn Thạch",
        "points": [
          "Tài liệu giới thiệu hai làng nghề làm chiếu truyền thống.",
          "Sản phẩm của nghề là những tấm chiếu."
        ],
        "question": "Nghề được giới thiệu tạo ra sản phẩm gì?",
        "answer": "Tấm chiếu.",
        "teacherNotes": "Nguồn trang 1. Không tự nhận mỗi tấm chiếu trong thị trường đều do hai làng nghề này làm.",
        "visual": [
          "Cẩm Nê",
          "Bàn Thạch",
          "Chiếu truyền thống"
        ]
      },
      {
        "title": "Nguyên liệu và dụng cụ",
        "points": [
          "Cói là nguyên liệu chính; tài liệu còn giới thiệu sợi đay.",
          "Người thợ dùng giàn dệt và các dụng cụ để tạo tấm chiếu."
        ],
        "question": "Cói và giàn dệt khác nhau ở điểm nào?",
        "answer": "Cói là nguyên liệu; giàn dệt là dụng cụ.",
        "teacherNotes": "Trang 2–4. Trình tự nghề chi tiết chỉ dùng khi đã quan sát ảnh hoặc video đúng nguồn.",
        "visual": [
          "Cói và đay",
          "Giàn dệt",
          "Người thợ"
        ]
      },
      {
        "title": "Tôn trọng người giữ nghề",
        "points": [
          "Tấm chiếu có công sức và kỹ năng của người làm.",
          "Khi tham quan, nghe hướng dẫn và xin phép trước khi chạm sản phẩm, dụng cụ."
        ],
        "question": "Nếu muốn thử dụng cụ dệt, em làm gì?",
        "answer": "Xin phép, chỉ thực hiện khi có hướng dẫn và được cho phép.",
        "teacherNotes": "Trang 6. Không tự vận hành giàn dệt.",
        "visual": [
          "Lắng nghe",
          "Xin phép",
          "Trân trọng"
        ]
      },
      {
        "title": "Giới thiệu một nghề em hiểu",
        "points": [
          "Nói tên nghề, sản phẩm và một điều em biết về người lao động.",
          "Liên hệ một nghề khác trong gia đình hoặc cộng đồng."
        ],
        "question": "Em giới thiệu nghề dệt chiếu bằng hai câu.",
        "answer": "Ví dụ: Người thợ dệt chiếu làm ra tấm chiếu. Em trân trọng sự khéo léo và công sức của người thợ.",
        "teacherNotes": "Đánh giá gọi đúng tên nghề và sản phẩm; không xếp nghề cao thấp.",
        "visual": [
          "Tên nghề",
          "Sản phẩm",
          "Lòng trân trọng"
        ]
      }
    ],
    "sourceRecord": {
      "id": "gddp-2026-2-07",
      "grade": 2,
      "subject": "TNXH",
      "week": "2",
      "lesson": "Bài 2: Nghề nghiệp của người lớn trong gia đình",
      "integrationType": "Bộ phận",
      "activity": "- Hoạt động Khởi động Yêu cầu 2 môn TNXH",
      "content": "Tích hợp GDĐP: \nChủ đề 5: Chiếu Cẩm Nê- Chiếu Bàn Thạch"
    }
  },
  {
    "recordId": "gddp-2026-2-08",
    "title": "Đọc để tìm hiểu người có công với quê hương",
    "outcomes": [
      "Biết tìm thông tin trong một đoạn tư liệu ngắn.",
      "Nêu được tên nhân vật, một thông tin và nguồn đọc."
    ],
    "sources": [
      "TCM2_ĐỊA CHỈ TÍCH HỢP CÁC NỘI DUNG GIÁO DỤC.Mdocx.docx · mục 7, trang 17–18 · năm học ghi trên nguồn: 2025–2026",
      "LỚP 2-CHỦ ĐỀ 1-NHÀ THỜ NVT-GDĐP TPĐN.docx · trang 1–5"
    ],
    "reviewNotes": [
      "Cần giáo viên duyệt cầu nối giữa bài Ngày hội đọc sách và nội dung di tích theo bảng tích hợp. Không khẳng định nhà lưu niệm là thư viện hoặc nơi tổ chức ngày hội."
    ],
    "status": "source-aligned-draft",
    "slides": [
      {
        "title": "Ngày hội đọc sách – Em muốn đọc gì?",
        "points": [
          "Sách và tư liệu giúp chúng ta tìm hiểu người, nơi và câu chuyện.",
          "Trong phần liên hệ địa phương, em đọc về Nguyễn Văn Thoại và Huỳnh Thúc Kháng."
        ],
        "question": "Em muốn biết điều gì về một nhân vật quê hương?",
        "answer": "Câu hỏi mở: tên, việc làm, di tích lưu niệm…",
        "teacherNotes": "Đây là cầu nối sư phạm do người biên soạn đề xuất; bảng nguồn gắn ngày hội đọc sách với di tích, chưa mô tả cách nối.",
        "visual": [
          "Chọn điều muốn biết",
          "Đọc tư liệu",
          "Chia sẻ"
        ]
      },
      {
        "title": "Đọc thẻ Nguyễn Văn Thoại",
        "points": [
          "Nguyễn Văn Thoại được phong tước hiệu Thoại Ngọc Hầu.",
          "Tài liệu nêu việc ông hỗ trợ lập chợ, xây dựng đình, chùa tại quê hương An Hải."
        ],
        "question": "Tìm trong thẻ một việc ông đã góp sức.",
        "answer": "Hỗ trợ lập chợ hoặc xây dựng đình, chùa.",
        "teacherNotes": "Cho học sinh chỉ vào thông tin trong thẻ, phân biệt thông tin đọc được với suy đoán.",
        "visual": [
          "Tên",
          "Đóng góp",
          "Bằng chứng"
        ]
      },
      {
        "title": "Đọc thẻ Huỳnh Thúc Kháng",
        "points": [
          "Tài liệu giới thiệu cụ học rộng, tài cao, yêu nước, thương dân.",
          "Nhà lưu niệm còn giữ không gian làm việc và vật dụng của cụ."
        ],
        "question": "Trong thẻ, chi tiết nào gợi cho em muốn tìm hiểu thêm?",
        "answer": "Câu hỏi mở; học sinh chỉ ra đúng chi tiết có trên thẻ.",
        "teacherNotes": "Không dùng thành tích hay câu nói chưa có nguồn để minh họa.",
        "visual": [
          "Nhân vật",
          "Không gian làm việc",
          "Vật dụng"
        ]
      },
      {
        "title": "Người đọc biết hỏi",
        "points": [
          "Đọc tên tài liệu, quan sát hình và chú thích.",
          "Chưa rõ điều gì, hỏi cô giáo hoặc người hướng dẫn."
        ],
        "question": "Bạn nhớ không rõ tên nhân vật. Có nên kể chắc chắn cho cả lớp không?",
        "answer": "Nên kiểm tra lại tư liệu hoặc hỏi cô trước khi kể.",
        "teacherNotes": "Liên hệ kỹ năng đọc và chia sẻ thông tin, không biến thành kiểm tra thuộc tiểu sử.",
        "visual": [
          "Đọc kỹ",
          "Kiểm tra",
          "Hỏi thêm"
        ]
      },
      {
        "title": "Giới thiệu điều em đọc được",
        "points": [
          "Nói: Em đọc tài liệu… và biết…",
          "Chọn một việc giữ gìn sách hoặc chia sẻ sách phù hợp."
        ],
        "question": "Em chia sẻ một thông tin và cho biết em đọc từ đâu.",
        "answer": "Tên nhân vật và thông tin đúng; nêu thẻ tư liệu hoặc tài liệu cô cung cấp.",
        "teacherNotes": "Trở lại nhiệm vụ vận dụng Ngày hội đọc sách; không coi nhà lưu niệm là thư viện.",
        "visual": [
          "Tên nguồn",
          "Điều biết được",
          "Chia sẻ sách"
        ]
      }
    ],
    "sourceRecord": {
      "id": "gddp-2026-2-08",
      "grade": 2,
      "subject": "TNXH",
      "week": "8",
      "lesson": "Bài 7: Ngày hội đọc sách của chúng em",
      "integrationType": "Bộ phận",
      "activity": "- Hoạt động Khởi động, hoạt động Vận dụng môn TNXH",
      "content": "Tích hợp GDĐP:\nChủ đề 1: Nhà thờ Nguyễn Văn Thoại – Nhà lưu niệm Huỳnh Thúc Kháng"
    }
  }
];
