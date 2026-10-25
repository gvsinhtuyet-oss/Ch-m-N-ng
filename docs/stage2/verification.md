# Kiểm thử Giai đoạn 1 – 26/10/2026

## Đã chạy

- TypeScript toàn dự án: đạt sau khi khôi phục hai tệp Mỹ Khê bị xóa nhưng còn import trong mã nguồn gốc.
- Build Vite/PWA: đạt; cảnh báo chunk lớn của ứng dụng hiện có vẫn còn.
- 6 kiểm thử tự động engine: tiến trình đủ 5, không nhận trùng; ôn câu sai nhiều lượt; nối một-một và nối lại; so khớp toàn bộ câu/đáp án/gợi ý V18; 24 nháp chia đợt; tắt âm thanh/dừng nguồn/lưu tùy chọn và lịch phát nối tiếp bằng AudioContext giả lập.
- 7 kiểm thử hồi quy: mở khóa chặng, thống kê tiến trình, dữ liệu Chặng 2 hiện có. Đạt.
- Chromium trình duyệt: chọn sai, gợi ý, khóa nút trong thời gian phản hồi, chọn đúng, nhận đúng ô chìa khóa; câu nối có ba đường ba màu giữ khi thao tác và chỉ chấm sau Xác nhận; đủ năm mở chiến thắng; ôn câu 1 còn thiếu vẫn giữ bốn vật phẩm đã có; chuyển sang thành phần Chặng 3 đúng trạm; chơi lại.
- Tắt tiếng ở chiến thắng và giữ lựa chọn sau tải lại được quan sát qua trạng thái nút.
- Ảnh chân dung tải đủ, `object-fit: contain`, không méo/cắt ảnh.

## Ma trận viewport Chromium

Đã đo vị trí nút, câu hỏi và HUD ở cả năm câu và chiến thắng, không phần tử kiểm tra nào nằm ngoài khung:

| Khung nhìn | Câu 1–5 | Chiến thắng |
|---|---|---|
| 1366×768 | Đạt | Đạt |
| 1024×768 | Đạt | Đạt |
| 390×844 | Đạt | Đạt |
| 375×667 | Đạt | Đạt |
| 320×640 | Đạt | Đạt |
| 844×390 | Đạt | Đạt |
| 667×375 | Đạt | Đạt |
| 640×320 | Đạt sau sửa bố cục thấp | Đạt |

Màn giới thiệu đã đo trên tám khung; phát hiện nút bắt đầu tràn ở 640×320, sửa và đo lại đạt. Đã xem trực quan các màn mở đầu, ảnh, nối và chiến thắng. Không phải kiểm thử trên điện thoại vật lý. Chưa chụp đối chiếu pixel tự động V18 và React; chỉ tái sử dụng CSS/ảnh và đối chiếu giao diện.

## Chưa kiểm thử hoặc chưa hoàn tất

- Safari/iOS/iPadOS, Android, Edge trên thiết bị thật; chất lượng nghe và âm lượng thực tế qua loa từng máy; nền tab/khóa màn hình của hệ điều hành. Test âm thanh tự động dùng giả lập, không chứng nhận âm thanh nghe trên thiết bị.
- Đồng bộ kết quả bằng tài khoản học sinh thật/máy chủ: bản thử chỉ đọc, không tạo dữ liệu học sinh. Cầu nối dùng `completeStage2` hiện có; chưa xác minh lưu và tải lại bằng tài khoản thật.
- Toàn bộ bộ kiểm thử repository: chỉ chạy các kiểm thử liên quan nêu trên.
- 24 trạm còn lại chỉ có cấu trúc bản nháp và câu hỏi nguồn. Chưa hoàn thiện năm câu/ảnh/nền riêng, chưa kiểm thử và chưa bật.
- Bản V18 chính thức giữ nguyên. Chưa thay engine mặc định và chưa cập nhật website chính.

## Nội dung Trạm 2 giữ nguyên

1. Nhận diện chân dung Tổng đốc Hoàng Diệu (ảnh A trong bản thử).
2. Tên gọi khác của Phan Châu Trinh: Phan Tây Hồ.
3. Tên đường: ghi nhớ công lao hai nhà yêu nước.
4. Hoàng Diệu → chỉ huy bảo vệ thành Hà Nội; Phan Châu Trinh → đề cao khai dân trí; Duy Tân → khuyến khích đổi mới và mở trường học.
5. Tìm hiểu và trân trọng công lao người được đặt tên đường.

Vật phẩm: năm mảnh chìa khóa. Hai nền WebP, ba ảnh chân dung và ba âm thanh lấy nguyên từ V18. Lựa chọn không bị xáo trộn trong bản thử.
