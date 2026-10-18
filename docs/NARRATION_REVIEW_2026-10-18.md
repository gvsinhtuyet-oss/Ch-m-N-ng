# Rà soát lời thuyết minh cả năm khối — 18/10/2026

Phạm vi: 25 trạm, 105 điểm thuyết minh (khối 1: 20; khối 2: 25; khối 3, 4, 5: mỗi khối 20). Bản này thay thế lời kể tương ứng trong các báo cáo rà soát trước; giữ nguyên kết quả kiểm chứng ảnh, nguồn và quyền sử dụng.

## Nội dung được chỉnh

- Viết lại 55 đoạn. Lời kể bắt đầu bằng địa điểm, nhân vật, đặc điểm hoặc công việc của bài; dùng câu ngắn, gần gũi, phù hợp lứa tuổi. Giữ những đoạn cũ đã đáp ứng mục tiêu.
- Thay 14 câu hỏi về nguồn, chú thích, cách kiểm chứng thành câu hỏi về kiến thức chính; cập nhật đáp án, lời giải, ý chính và các sơ đồ tổng kết liên quan. Giữ 125 thử thách chặng 2 khác câu hỏi và đáp án đúng chặng 1.
- Chỉnh cách diễn đạt trên các trình chiếu tích hợp khối 1–2. Không đổi sourceRecord, tuần, môn, bài SGK hoặc trạng thái xác nhận kế hoạch.
- Trình chiếu chủ đề khối 3–5 dùng trực tiếp lời kể và câu hỏi mới. Các lưu ý từ bản trước nằm trong ghi chú giáo viên, không nằm trong phần thuyết minh. Chú thích ảnh và thông tin tác giả, giấy phép, thời điểm, phạm vi ảnh vẫn được giữ.
- Giữ mốc Mẹ Nhu và bảy chiến sĩ biệt động Thanh Khê: 26/12/1968. Không đưa tranh luận năm 1945 vào lời kể. Mẹ Nhu và Mẹ Nguyễn Thị Thứ vẫn được phân biệt rõ.
- Ma nhai: văn khắc Hán–Nôm, di sản tư liệu được ghi danh khu vực châu Á – Thái Bình Dương năm 2022; không đổi thành danh hiệu Di sản thế giới cho toàn bộ Ngũ Hành Sơn.
- Không chốt người truyền nghề Phước Kiều khi nguồn chưa thống nhất; tập trung sản phẩm, đúc đồng, thẩm âm và trao truyền nghề.
- Cù Lao Chàm: dùng đúng tên Khu dự trữ sinh quyển Cù Lao Chàm – Hội An và năm 2009, bỏ ngày tháng chưa thống nhất khỏi lời kể và ý chính. Nguồn UNESCO: https://www.unesco.org/en/mab/cu-lao-cham-hoi
- Sửa bộ chọn giọng: khi không có đoạn tiếng Anh và phải đọc đoạn tiếng Việt, chọn vi-VN. Đây vẫn là giọng hệ thống của thiết bị, chưa phải bản thu MP3 cố định.

## Bảo toàn dữ liệu

`currentNarrationContent` là hàm thuần: đổi đúng chuỗi mặc định đã phát hành; không thay lời kể, câu hỏi, ý chính hoặc ảnh giáo viên đã tự biên tập. Không sửa revision, ID trạm/điểm, tài nguyên đính kèm, tiến độ hay bộ nhớ lưu trữ. Đọc/áp dụng tương thích trong bộ nhớ; không có migration hoặc yêu cầu ghi Firestore.

`narrationReview.ts` lưu bản trước và bản duyệt để đối chiếu chính xác. Thay đổi này là mã nguồn tĩnh trong Git, không thêm ảnh hoặc âm thanh vào Firestore.

## Kiểm tra

- TypeScript và production build; 63 bài kiểm thử nội dung và hồi quy đều đạt.
- Kiểm thử nội dung, tương thích bản đã lưu, bảo toàn chỉnh sửa riêng, tính lặp ổn định, câu hỏi/đáp án và các địa chỉ tích hợp chính xác.
- Trình duyệt với API giả lập, chặn mạng ngoài: hoàn thành 25 trạm/105 điểm trên màn hình 390px, thử lỗi đọc và đọc lại, chọn sai rồi sửa, làm lại một câu thử thách sai, check-in, nhận vật phẩm, lưu bản đồ và tải lại tiến độ. Không có API ghi hoặc lỗi JavaScript.
- Mở 165 trang trình chiếu chủ đề khối 3–5 ở 390px: không tràn ngang, lỗi JavaScript hoặc API ghi. Kiểm tra lại năm trạm khối 5 ở 1280px sau lần biên tập cuối.
- Âm thanh trình duyệt được giả lập để kiểm tra đúng văn bản và vi-VN; kiểm thử không đánh giá chất giọng thực tế của từng thiết bị.
- Ảnh nhị phân khối 1–2 không có trong bản sao cục bộ: lượt trình duyệt kiểm tra luồng và lời kể, không xác nhận giải mã ảnh của hai khối này. Kiểm tra toàn bộ tài sản nằm trong CI trên kho Git đầy đủ. Ảnh và quyền sử dụng không thay đổi trong đợt sửa lời kể.

Cần đồng bộ/publish lại từ Git sang AI Studio để bản đang chạy nhận nội dung. Kế hoạch tích hợp mới vẫn chờ giáo viên cung cấp, chưa tự xác nhận sẵn sàng xuất bản theo kế hoạch hiện hành.
