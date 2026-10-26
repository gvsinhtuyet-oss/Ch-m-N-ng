# Nam Ô – bản duyệt ảnh nền, tên thử thách lớn hơn

Chỉ thêm ảnh ứng viên và trang duyệt. Chưa thay cấu hình hoặc ảnh đang dùng trong game. Chưa gộp main; các trạm khác chưa đổi.

- Ảnh chơi: `public/games/shared/v1/grade3/review/nam-o-play-safe-v3.webp`.
- Ảnh chiến thắng: `public/games/shared/v1/grade3/review/nam-o-victory-safe-v3.webp`.
- Cả hai là WebP 1600×900 (16:9), quality 90, dưới 400 KiB mỗi ảnh.
- Bảng nằm giữa phía trên, toàn bộ chữ và vật trang trí trong nửa giữa ảnh. Sau phản hồi của người dùng, ưu tiên tăng tên thử thách và giảm chữ phụ; không tiếp tục thu nhỏ tên theo tỷ lệ đồng loạt. Tên ảnh chơi được chia thành hai dòng để chữ to hơn; chiến thắng giữ đúng ba dòng đã yêu cầu.
- Giữ bố cục cảnh làng nghề, biển, núi, chum và dụng cụ. Ảnh chiến thắng giữ pháo hoa và đúng năm giọt vàng trong rương; xóa chữ phụ trên biển nhỏ và nhãn chai.
- Ảnh được chỉnh bằng công cụ imagegen tích hợp, sau đó xuất WebP. Không sửa bố cục bằng CSS scale, không kéo méo chữ hay ảnh.

Đường duyệt được loại khỏi fallback điều hướng PWA để service worker không trả trang app thay cho trang ảnh.

Trang `/nam-o-background-review.html` có nút chọn ảnh chơi/chiến thắng và bốn viewport. Trên điện thoại, ảnh giữ tỷ lệ tự nhiên và chỉ crop cảnh rìa: bề ngang ảnh tối đa 2 lần bề ngang viewport, luôn để vùng trung tâm 50% nằm trọn trong khung. Phần dưới chừa nền chuyển màu cho vùng giao diện. Trên máy tính hiển thị toàn chiều ngang ảnh; không dùng cover theo toàn chiều cao điện thoại vì sẽ cắt bảng.

## Đã kiểm tra

- Tải ảnh, tỷ lệ hiển thị và vị trí vùng bao bảng: 390×844, 375×667, 320×640, 1366×768, cho cả hai trạng thái (8 phép đo). Đạt cả 8; vùng bao bảng và vùng bao rương đều nằm trong viewport.
- Xem trực quan chữ tiếng Việt trên ảnh gốc và ảnh chiến thắng ở 320×640: đủ ba dòng, tên thử thách lớn, không mất chữ; rương có năm giọt vàng.
- Giữ nguyên source game và hai ảnh Nam Ô cũ, đối chiếu bằng git với commit 1739b4c.
- Bản dựng Vite/PWA: đạt. Không có thay đổi chức năng game nên không chạy lại bộ kiểm thử logic trước đó.

Bằng chứng hình học: `nam-o-safe-v3-qa.json`. Vùng bao raster được xác định qua kiểm tra ảnh, không phải nhận dạng chữ OCR tự động. Đây là viewport Chromium, chưa phải thử thiết bị iOS/Android vật lý. Một số lệnh chụp clip/toàn trang của công cụ trình duyệt timeout; ảnh chụp viewport thường và các phép đo DOM vẫn dùng được.

Chờ người dùng duyệt bố cục và cỡ chữ trước khi thay ảnh ứng dụng hoặc áp dụng cho các trạm còn lại.
