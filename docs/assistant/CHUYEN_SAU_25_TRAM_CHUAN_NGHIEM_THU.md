# CHẠM ĐÀ NẴNG — Chuẩn đạt chuyên sâu cho Trợ lý khám phá (25 trạm, 121 điểm)

> **Trạng thái:** ĐỀ CƯƠNG & CHỈ TIÊU, KHÔNG PHẢI BÁO CÁO ĐÃ HOÀN THÀNH.  
> **Ngày lập:** 31/10/2026. Đối chiếu theo `src/data/assistantStationGuides.json`.  
> Chi tiết 25 trạm, 121 điểm và 125 cụm nghiên cứu tại `coverage-manifest-25-stations.json`.

## 1. Mục tiêu sản phẩm

- Trả lời câu hỏi đúng bài và đúng điểm khám phá, không nhầm các địa danh, nhân vật hay mốc thời gian gần giống.
- Học sinh lớp 1–2: lời giải thích ngắn, từ dễ hiểu, một ví dụ gần gũi; lớp 3–5: có thể mở rộng nguyên nhân, so sánh, liên môn nhưng không rườm rà.
- Giáo viên: giải thích thuật ngữ và sự kiện ngoài SGK, gợi ý liên hệ với bài học theo **Kết nối tri thức với cuộc sống**, hoạt động 5–10 phút, nêu rõ dữ kiện nguồn và phần gợi ý sư phạm do biên soạn.
- Hiểu câu hỏi không dấu, phương ngữ Đà Nẵng/Quảng Nam, lỗi gõ thông thường, câu hỏi tiếp theo (“vì sao?”, “thế còn...?”).
- Không đoán nơi cư trú, không thu thập địa chỉ, đường đi, thông tin cá nhân trẻ; tránh phóng đại công dụng dược liệu; không làm lộ đáp án Chặng 2.
- Mặc định **không gọi API AI hoặc Firestore** trong lúc tra cứu kiến thức. AI ngoài hệ thống chỉ mở khi giáo viên chủ động yêu cầu, có công bố chi phí/giới hạn; chất lượng không phụ thuộc chức năng AI.

## 2. Cấu trúc một đơn vị kiến thức (fact card)

Mỗi đơn vị kiến thức **khác với một mẫu câu hỏi**, gồm các trường:

- `stationId`, `pointId`, `topicId`, `factId`, `gradeRange`;
- `entity` (địa danh/người/vật/sự kiện), `aliases` và cách nói địa phương;
- `intent` (định nghĩa/địa điểm/thời gian/nguyên nhân/quy trình/so sánh/vận dụng);
- `assertion` (mệnh đề có thể đối chứng), `answerStudent`, `answerTeacher`, `followUp`;
- `sourceId`, `sourceUrl`, `sourceTitle`, `sourceQuoteOrEvidenceLocation` (đoạn/chương/trang, không sao chép dài);
- `asOfDate`, `reviewedBy`, `reviewStatus`, `uncertainty`, `sensitive`, `lastCheckedAt`.
- Quan hệ `relatedFactIds` dùng nối tiếp để trả lời câu hỏi theo chủ đề; không tạo câu hỏi tự do từ dữ kiện chưa duyệt.

**Nguồn ưu tiên:** tài liệu GDĐP chính thức, cơ quan quản lý di sản/lịch sử, UNESCO, UBND/ban quản lý di tích, bảo tàng và công trình nghiên cứu có uy tín. Đối với hành chính, thống kê, lịch lễ hội, trạng thái trường học, phải ghi thời điểm và rà lại khi cập nhật. Phân biệt các dữ kiện lịch sử trong tư liệu cũ với đơn vị hành chính hiện nay. Nếu nguồn mâu thuẫn, không tự phán đoán và đánh dấu chờ đối chiếu.

## 3. Định mức nghiên cứu (chỉ tiêu, không phải yêu cầu viết số lượng cho đủ)

- Tối thiểu mục tiêu 10–15 đơn vị kiến thức **khác nhau** trên mỗi điểm khám phá: toàn bộ 121 điểm tương đương khoảng 1.210–1.815 đơn vị kiến thức.
- 3–5 cách diễn đạt tham khảo cho mỗi đơn vị, **không coi 5 cách hỏi là 5 kiến thức mới**.
- Mỗi trạm phải bao phủ đủ các nhóm: gốc học liệu, mở rộng lịch sử–địa lý–văn hóa–kinh tế–khoa học, câu hỏi “vì sao”, so sánh, hành động bảo tồn, vận dụng liên môn, giáo viên giảng bài, câu không đủ nguồn.
- Không cố lấp đầy chỉ tiêu bằng thông tin không có nguồn; để trống đúng cách tốt hơn câu trả lời sai.
- Nguồn theo fact; không gắn một đường dẫn chung cho mọi câu trả lời.

## 4. Truy hồi và hình thành câu trả lời

1. Chuẩn hóa văn bản (dấu câu, không dấu, chính tả nhẹ, phương ngữ) **không làm mất tên riêng và con số**.
2. Lấy ngữ cảnh `stationId` và `pointId` thật; nhận diện thực thể được hỏi đích danh, kể cả khi khác điểm đang mở.
3. Chọn bằng kết hợp khớp cụm chính xác + tìm kiếm từ khóa có trọng số (ví dụ BM25/FTS) + kiểm tra yêu cầu hỏi là **nguyên nhân/thời gian/địa điểm/so sánh**, không chỉ ghép bất kỳ đoạn nào có tên địa danh.
4. Chỉ trả lời nếu ngữ cảnh, ý định và nguồn cùng hỗ trợ; khi điểm số gần nhau, hỏi lại muốn tìm hiểu ý nào.
5. Theo nhiều lượt, ưu tiên chủ đề gần nhất đã xác định; câu hỏi ngắn không đủ ngữ cảnh phải xin làm rõ, không đoán.
6. Xuất câu ngắn kèm liên kết nguồn; giáo viên có thể mở “Giải thích sâu / Ví dụ dạy học / Nguồn gốc”.
7. Với dữ kiện chưa duyệt, mốc mới chưa xác minh hoặc câu ngoài kho, nói rõ giới hạn rồi gợi ý nội dung liên quan **đã có căn cứ**.

**Không nên dùng việc khớp từ khóa/năm hoặc ghi chú “confidence=high” để tuyên bố tính đúng sự kiện.** Cần đánh giá đầu cuối trên câu hỏi độc lập do giáo viên đặt.

## 5. Bộ nghiệm thu độc lập bắt buộc

Cần tối thiểu 8 câu hỏi chưa dùng lúc viết kho trên mỗi điểm (tổng >=968), gồm: kiến thức gốc, ngoài bài, hỏi ngược, nhiễu địa danh, không dấu, phương ngữ, tình huống, hỏi nối tiếp. Bổ sung tối thiểu 5 câu chuyên môn giáo viên mỗi trạm (>=125) và nhóm câu thiếu dữ kiện/an toàn. Các thử nghiệm không được sao chép nguyên câu trong kho.

| Chỉ số | Mục tiêu nghiệm thu đề xuất |
|---|---|
| Mã trạm/điểm có nội dung & metadata | 25/25 trạm, 121/121 điểm |
| Độ đúng dữ kiện (human adjudication) | >=95% trên tập câu đủ căn cứ; lỗi lịch sử nghiêm trọng = 0 |
| Hiểu câu diễn đạt mới | >=90% câu có thể trả lời bằng kho |
| Không bịa khi ngoài kho | >=95% trường hợp thiếu bằng chứng được từ chối/đề nghị làm rõ |
| Sai trạm | <=1% và không có sai trạm nghiêm trọng |
| Tiết lộ đáp án trò chơi Chặng 2 | 0 trường hợp trong bộ kiểm thử |
| Liên kết nguồn không hợp lệ | 0 nguồn sai định dạng; nguồn quan trọng phải mở và hỗ trợ đúng mệnh đề |
| Mức dễ hiểu, hữu ích | >=90% đánh giá Đúng/Dễ hiểu sau khảo sát giáo viên–học sinh với đồng thuận phù hợp |

Phân loại kết quả rõ ràng: **đúng nguồn/đúng ý**, **đúng một phần**, **thiếu nguồn**, **sai kiến thức**, **sai trạm**, **không hiểu phương ngữ**, **không đủ căn cứ**, **vi phạm an toàn**, **lộ đáp án**. Chỉ số chỉ được công bố sau khi có dữ liệu thật.

## 6. Cách thực hiện và đưa lên ứng dụng

**Lô 0 – chuẩn hóa:** chốt danh mục 25 trạm/121 điểm; sơ đồ học liệu/điểm liên kết; xây bộ chỉ tiêu & nguồn; tự động báo những trạm không có nguồn hay thiếu bộ kiểm tra.

**Lô 1 – mẫu chất lượng:** rà 4 điểm Trạm “Quê hương em”; giải quyết tên trường hiện hành theo nguồn rồi mới chuyển trạng thái biên tập. Làm kế “Thành Điện Hải” và “Hội An” vì có nhiều dữ kiện lịch sử/UNESCO cần kiểm chứng. Tạo bộ câu hỏi độc lập do người thứ hai chấm.

**Lô 2 – đồng loạt theo khối:** nghiên cứu hết 5 trạm mỗi khối, mỗi lần merge tối đa một nhóm nhỏ có bộ kiểm thử độc lập và chứng cứ nguồn; dùng dữ liệu JSON theo `stationId` hoặc lazy load, không viết hàng nghìn điều kiện trong `DanangAssistantRetrievalService.ts`.

**Lô 3 – kiểm định tổng:** chạy bộ câu hỏi chưa thấy; thử học sinh 5 khối + giáo viên, đo trễ trên điện thoại, khả năng hoạt động khi Firestore 429, ẩn API AI tự động, bảo mật tài khoản.

**Lô 4 – xuất bản:** chỉ merge các trạm đã đủ tiêu chí, kiểm tra commit Production Cloudflare và đo lại các ca trên URL thực. Bảng Admin phân biệt điểm định tuyến tự động và điểm đúng thực tế do giáo viên chấm.

## 7. Trạng thái kiểm chứng ngày 31/10/2026

- **Đã có:** 25 hướng dẫn theo trạm và định tuyến 121 điểm, kho thuật ngữ chung, bộ QA kỹ thuật Admin; PR #72 có 51 Q&A/157 cách hỏi Trạm 1.
- **Chưa có:** 25/25 trạm hoàn thiện kiến thức ngoài bài được duyệt, bộ holdout độc lập >1.000 câu, kết quả nghiệm thu thực tế; PR #72 vẫn nháp.
- **Rủi ro cần xử lý:** tên trường tại Tam Kỳ sau sáp nhập, tên các trường trùng nhau; kiểm soát thông tin hành chính mới; phân biệt nguồn lịch sử và hiện trạng.
- **Hạ tầng:** Firestore trả 429 trên API đăng nhập tại lần kiểm tra trước, nhưng kho chatbot nội bộ nên giữ độc lập với Firestore. Không tạo lại database, không thay quyền Admin trong công việc nghiên cứu này.

Đây là **cam kết về phương pháp và tiêu chí đánh giá**, không phải cam kết hệ thống đã đạt kết quả trước khi kiểm thử.
