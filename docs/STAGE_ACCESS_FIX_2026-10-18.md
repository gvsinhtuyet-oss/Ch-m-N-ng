# Khóa lượt học đầu, giữ xem lại tự do — 18/10/2026

Yêu cầu: ở lượt chưa hoàn thành, học sinh phải trả lời đúng câu hỏi của từng điểm trước khi hoàn thành chặng 1. Bài đã hoàn thành vẫn được xem lại và chuyển điểm, chuyển chặng tự do; giữ nguyên phần thưởng, con dấu và tiến độ.

Thay đổi:
- Chặng hiển thị được giới hạn bởi tiến độ đã đạt hoặc callback hoàn thành trong phiên. Không dùng số chặng đang yêu cầu làm bằng chứng đã hoàn thành (`Math.max(currentStage, ...)`).
- Hàm chuyển tiếp của chặng 1 kiểm tra điểm hiện tại; không tự thêm ID của điểm cuối vào tập đã trả lời để tính đủ bài.
- Trước khi trao vật phẩm/mở chặng tiếp, lượt học đầu phải có đủ ID các điểm đã trả lời đúng. Chặn gửi lại câu trả lời đã chấm.
- Giao diện chặng 1 cũ cũng khóa thẻ điểm ở phía trước nếu chưa trả lời đủ các điểm trước đó, và không đánh dấu hoàn thành bằng riêng thao tác bấm tiếp.
- Giữ nguyên `freeReview` từ tiến độ đã hoàn thành: các điểm và chặng đã đạt vẫn mở. Không xóa hoặc đặt lại tiến độ.

Kiểm tra: TypeScript, build và 65 bài kiểm thử nội dung/hồi quy đều đạt; kiểm thử điều kiện mở chặng cho 25 trạm/105 điểm, từng trường hợp thiếu một câu, chỉ có điểm cuối, ID lặp, yêu cầu mở chặng cao hơn và xem lại bài đã hoàn thành. Trình duyệt dùng API giả lập, kiểm tra trả lời sai/đúng, nút chặng bị khóa trước khi đủ bài và xem lại tự do sau khi đã đạt. Không đọc/ghi Firestore thật.
