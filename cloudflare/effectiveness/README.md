# Báo cáo hiệu quả

Triển khai theo thứ tự Preview rồi Production. Chỉ bật trên tài khoản **Workers Free** sau khi kiểm tra gói đang dùng và mức sử dụng chung của tài khoản. Tính năng mặc định tắt, không có gói trả phí, API AI hay thao tác thay đổi Firestore.

1. Tạo một D1 riêng cho môi trường kiểm thử trên Workers Free. Chạy `0001.sql` trong D1 Console. Trong cấu hình Preview của Pages, tạo binding `EFFECTIVENESS_DB` trỏ vào D1 này.
2. Đặt `EFFECTIVENESS_ENABLED=true` cho Pages Functions và `VITE_EFFECTIVENESS_ENABLED=true` cho bước build. Chạy lại triển khai Preview để nhận cả binding và biến. Khi một trong hai cờ thiếu, phía tương ứng dừng gửi hoặc ghi số liệu. Tắt biến runtime để ngừng ghi ngay, sau đó bỏ cờ build ở bản kế tiếp.
3. Kiểm tra một phiên khách, một phiên học sinh và một phiên quản trị. Trong một phiên học sinh, vào trạm, hoàn thành rồi tải lại để kiểm tra lượt không bị đếm hai lần. Trong Admin, đổi nhóm, trạm và khoảng ngày, kiểm tra số liệu, tải CSV và mẫu Excel. Xác nhận giáo viên không mở được API báo cáo. Tắt cờ runtime để xác nhận người học vẫn hoàn thành và dữ liệu học tập vẫn lưu.
4. Dùng D1 khác cho Production sau khi Preview đạt. Trước khi bật, kiểm tra gói Workers Free và giới hạn dùng chung. Theo dõi D1 Row Metrics và số yêu cầu Pages Functions. Khi cần hạn chế lưu lượng trước khi hết hạn mức chung, có thể tắt cờ runtime. Nếu tài khoản yêu cầu nâng gói thì dừng ở Preview và giữ tính năng tắt trên Production.
5. Mục sao và góp ý phụ thuộc bản Cloud Run có API từ PR #99. Nghiệm thu gửi một đánh giá/góp ý và mở Admin trước khi xác nhận luồng đó hoạt động trên bản chính. Phần đọc báo cáo D1 vẫn dùng quyền Admin từ phiên đăng nhập hiện có.

## Định nghĩa dữ liệu

- Một phiên trên một trình duyệt, tách sau 30 phút không có mốc được ghi nhận. Khách chuyển sang học sinh trong phiên chỉ tính một lượt. Phiên đã nhận diện là nhân sự hoặc demo được loại khỏi báo cáo. Số lượt là số phiên ghi nhận được, có thể thiếu do mạng, cài đặt trình duyệt hoặc hết hạn mức; không dùng làm số người duy nhất.
- Một lượt bắt đầu cho mỗi trạm trong mỗi phiên; chặng cao nhất tính một lần. Chặng 4 chỉ ghi sau khi đóng dấu thành công. Phiên quay lại có thể tiếp tục ở chặng cao hơn nhờ tiến độ đã lưu. Tỷ lệ là tỷ lệ đóng dấu theo phiên, không phải tỷ lệ hoàn thành của từng học sinh qua nhiều ngày. Ngày của lượt và mốc được nhóm theo lúc bắt đầu phiên, giờ Việt Nam.
- D1 lưu mã phiên ngẫu nhiên, ngày, nhóm, mã trạm và mốc chặng. Không gửi tên, mã đồng bộ, điểm cá nhân hoặc nội dung học lên D1. Trang Admin chỉ đọc số tổng hợp trong 7/30/90 ngày, không tự tải lại. Có thể bảo trì các dòng trên 90 ngày bằng tác vụ có giới hạn trong D1 riêng, theo lịch do quản trị quyết định.
- Mẫu Excel thí điểm tính điểm trước–sau ghép cặp và thời gian giáo viên chuẩn bị. Tệp do nhà trường giữ. Chức năng này không tự thu bài hoặc đưa kết quả cá nhân lên hệ thống.

Kiểm thử cục bộ với Node.js 22 trở lên bằng `node --test effectiveness-test.mjs cloudflare-proxy-test.mjs learning-feedback-test.mjs`, rồi chạy `npm run lint && npm run build`.
