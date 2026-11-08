# Biên bản nghiệm thu Giáo viên / Quản trị – 08/11/2026

## Phạm vi và nguyên tắc

Website: `https://chamdanang-gddp.pages.dev/`.
Nhánh Production tại thời điểm kiểm tra: `deploy/cloudflare-preserve-api-20261028`, head `03be359f3e8c6d3adf7f17242d5ae9311404f774`.
PR nghiệm thu: #133, **chưa gộp**. Không sửa dữ liệu thật của nhà trường, không tạo tài khoản, không gửi mật khẩu, không xuất bản nội dung.

Các mốc giờ trong báo cáo dùng **UTC+7 (Việt Nam)**.

## 1. Kết quả trực tiếp trên Production

| Hạng mục | Kết quả | Bằng chứng / giới hạn |
| --- | --- | --- |
| Trang công khai và Teacher Demo mới | PASS trong bài kiểm thử browser ở PR #132 | Desktop 1366 px, phone 390 px; các menu và hero đã hiển thị |
| Cấu hình Google OAuth công khai | PASS | GET `/api/auth/google/config`: JSON, có client ID |
| Truy cập phiên chưa đăng nhập | PASS | GET `/api/auth/session`: `user: null` |
| Khách truy cập API Admin và dữ liệu Giáo viên | PASS | GET 6 route API bảo vệ đều trả 401 |
| Kết nối **đọc** Firestore | **FAIL – BLOCKER** | GET `/api/health`: `firestoreConnected=false`, HTTP 429 `RESOURCE_EXHAUSTED` |
| Kết nối **ghi** Firestore | **CHƯA KIỂM ĐỊNH ĐƯỢC – BLOCKER** | `firestoreWriteConnected=false`; phép thử ghi không thực hiện vì đọc đã hỏng |
| `auth.ready` trên Production | **FAIL – BLOCKER** | `false` |
| Lưu nội dung được cấu hình dùng Firestore | CONFIG PASS, RUNTIME CHƯA ĐẠT | `contentStorage=firestore`, nhưng dịch vụ đang từ chối đọc |
| GET `/api/gddp/catalog` | FALLBACK – không có dữ liệu mới từ Firestore | 10:51 ICT: HTTP 200, `bundled-fallback=true`, phản hồi có `published:false` |
| GET `/api/content` | **FAIL** | 10:51 ICT: HTTP 503, không đọc được nội dung chung từ máy chủ |
| Đăng nhập Admin thật | CHƯA PASS | Màn đăng nhập hiện báo Firestore chạm hạn mức; không đoán mật khẩu |
| Đăng nhập Google tài khoản Giáo viên thật | CHƯA PASS | Bước tạo challenge, tài khoản và phiên đều phụ thuộc Firestore |
| Lưu/đọc lại lớp, kế hoạch, học liệu sau đăng xuất | CHƯA PASS Production | Chỉ có kiểm thử bộ nhớ / Firestore REST giả lập |
| Admin Demo mới (PR #133) | PASS trong CI Preview | Desktop/mobile, 4 mục, không có nút xuất bản, không ghi API đặc quyền |
| 25 trò chơi Chặng 2 | PASS qua CI mô phỏng viewport | Cần nghiệm thu end-to-end trên thiết bị thực trước toàn trường |

Lưu ý: `/api/health` vốn có phép thử ghi/xóa nội bộ đối với collection `cham_health_checks`; lần này kiểm tra dừng ngay khi đọc Firestore thất bại. Không có dữ liệu học sinh, tài khoản hoặc bài học nào được chủ động sửa.

**Lịch sử thử nghiệm**
- 10:37 ICT: 6 phép thử anonymous API PASS.
- 10:46 ICT: health FAIL do Firestore không kết nối.
- 10:48 ICT: ghi nhận HTTP 429 / `RESOURCE_EXHAUSTED` khi đọc Firestore; không phải `PERMISSION_DENIED`.
- 10:51 ICT: GDĐP chuyển sang `bundled-fallback`, nội dung chung HTTP 503, `RESOURCE_EXHAUSTED` tiếp diễn.

## 2. Nguyên nhân có bằng chứng và điều chưa biết

Đã có bằng chứng Firestore trả `RESOURCE_EXHAUSTED`. Theo tài liệu chính thức của Google, nguyên nhân có thể là vượt mức miễn phí khi không bật billing hoặc vượt hạn mức/giới hạn tăng tải; **chưa thể xác nhận loại hạn mức nào vì không có số liệu Quotas/Usage của dự án**.

Tham khảo:
- https://docs.cloud.google.com/firestore/native/docs/understand-error-codes
- https://firebase.google.com/docs/firestore/pricing

Không nên thử đăng nhập liên tục hay đổi database/Cloud Run một cách ngẫu nhiên. Không xóa collection `cham_users`, `cham_sessions`, `cham_classes`, `cham_student_sync`, `cham_teacher_workspaces` hoặc kho nội dung.

## 3. Thứ tự xử lý an toàn

1. Trên Google Cloud Console của backend đang chạy, kiểm tra **Firestore > Usage** và **IAM & Admin > Quotas**; xác nhận quota cụ thể bị vượt và chế độ billing.
2. Nếu chạm mức miễn phí theo ngày, hạn mức có thể đặt lại quanh nửa đêm giờ Pacific; nếu sử dụng thường xuyên vượt mức, cần quyết định có bật billing (kèm cảnh báo ngân sách) hay tối ưu giảm Firestore reads/writes. Không tự động bật thanh toán.
3. Kiểm tra Cloud Run logs và đường gọi Firestore nào sinh lưu lượng; không mặc định cho rằng lỗi do riêng CHẠM ĐÀ NẴNG nếu nhiều ứng dụng dùng chung project.
4. Chạy lại `/api/health` khi quota được khôi phục: yêu cầu `firestore=connected`, `firestoreWrite=connected`, `auth.ready=true`, `contentStorage=firestore`.
5. Trên Production, có sự tham gia của chủ tài khoản: login Admin thật, đăng xuất/đăng nhập lại; đăng nhập Google (kiểm tra OAuth Authorized JavaScript Origins cho đúng domain); xác minh giáo viên không thể gọi API Admin.
6. Tạo **tài khoản và lớp kiểm thử riêng**, lưu 1 thay đổi không ảnh hưởng học liệu dùng thật, đọc lại trên thiết bị khác; dọn dữ liệu thử có kiểm soát sau khi xác nhận.
7. Chỉ khi các mục trên PASS mới xem xét gộp PR #133 và tuyên bố phát hành ổn định.

## 4. Nhánh và thay đổi

PR #133 chỉ bổ sung nút vào Admin Demo, browser QA và API probe. **Không đổi auth server, Cloud Run, Firestore, D1, học liệu hay trò chơi.** Giữ draft trước khi Production Firestore đạt yêu cầu.
