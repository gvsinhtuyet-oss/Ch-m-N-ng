# Kho học liệu CHẠM ĐÀ NẴNG

Quản trị → Nội dung trạm → Thêm ảnh và học liệu.

- Chọn trạm, tải ảnh bìa/bản đồ/điểm chạm, sửa thuyết minh và điều cần nhớ.
- Thêm tài liệu PDF, ảnh, âm thanh hoặc video; với tệp lớn dùng link HTTPS.
- Lưu xem thử chỉ lưu trên máy đang thao tác.
- Xuất bản cho học sinh lưu vào máy chủ. Học sinh tải lại app để nhận nội dung mới.

## Chạy máy chủ có kho học liệu

1. Cài dependencies và chạy `npm run build`.
2. Cấu hình `CONTENT_ADMIN_PASSWORD` (ít nhất 12 ký tự), chỉ trên máy chủ. Không đặt mật khẩu vào biến VITE hay mã giao diện.
3. Cấu hình `CONTENT_DATA_DIR` trỏ đến thư mục trên ổ đĩa bền vững, có sao lưu.
4. Chạy `npm start` trên dịch vụ Node có HTTPS và ổ đĩa bền vững.
5. Mở app và dùng mật khẩu đó tại nút Xuất bản.

Lưu ý: hosting chỉ phục vụ website tĩnh không chạy được API này. Cần cấu hình máy chủ Node và persistent volume trước khi xuất bản học liệu cho mọi thiết bị. Không lưu dữ liệu học sinh hoặc tiến trình cá nhân trong kho học liệu này.

Mỗi tệp tải lên tối đa 4 MB. Tổng nội dung một lần lưu tối đa 32 MB.
Dữ liệu hiện chỉ tải khi mở app; tải lại trang để nhận phiên bản mới.
