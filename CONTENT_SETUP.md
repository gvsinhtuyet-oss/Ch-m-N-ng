# Kho học liệu CHẠM ĐÀ NẴNG

Quản trị → Nội dung trạm → Thêm ảnh và học liệu.

- Chọn trạm, tải ảnh bìa/bản đồ/điểm chạm, sửa thuyết minh và điều cần nhớ.
- Thêm tài liệu PDF, ảnh, âm thanh hoặc video; với tệp lớn dùng link HTTPS.
- Lưu xem thử chỉ lưu trên máy đang thao tác.
- Xuất bản cho học sinh cần đăng nhập tài khoản quản trị thật theo [AUTH_SETUP.md](./AUTH_SETUP.md). Giáo viên không được xuất bản.
- Mật khẩu kho học liệu chung `CONTENT_ADMIN_PASSWORD` và endpoint đăng nhập cũ đã được bỏ; không cần nhập mật khẩu lần nữa khi xuất bản.

## Chạy máy chủ

1. Cài dependencies và chạy `npm run build`.
2. Thiết lập tài khoản và Firestore theo `AUTH_SETUP.md`.
3. Dùng đúng `AUTH_FIRESTORE_PROJECT` và `AUTH_FIRESTORE_DATABASE`; học liệu dùng cùng kho Firestore với tài khoản.
4. Chạy `npm start` trên dịch vụ Node có HTTPS.
5. Đăng nhập quản trị, chỉnh nội dung rồi chọn Xuất bản.

Khi có cấu hình Firestore, học liệu và nền được lưu trong `cham_content` và `cham_content_chunks`, không nằm trên ổ tạm Cloud Run. Tệp lớn được chia nhỏ; bản mới chỉ được công bố sau khi ghi đủ dữ liệu. Lỗi giữa lúc tải giữ nguyên bản đã công bố. Mỗi lần đọc tải bản đang công bố từ Firestore để nhiều máy chủ nhận cùng nội dung. Hosting tĩnh không chạy được API.

Các khối của phiên bản cũ được giữ lại để tránh làm hỏng yêu cầu đang đọc. Chưa có cơ chế dọn tự động; cần theo dõi dung lượng/quota và sao lưu trước khi dọn các phiên bản không còn được tham chiếu. Kho này phù hợp tệp nhỏ; video lớn dùng URL HTTPS. Dữ liệu JSON cũ trong `CONTENT_DATA_DIR` không được tự chuyển sang Firestore; nếu từng tải dữ liệu ở bản cũ, cần sao lưu và nhập lại.

Mỗi tệp tải lên tối đa 4 MB. Tổng nội dung một lần lưu tối đa 32 MB. Học sinh tải lại app để nhận nội dung mới. Không lưu dữ liệu học sinh hoặc tiến trình cá nhân trong kho này.
