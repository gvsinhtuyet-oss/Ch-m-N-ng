# Giáo viên toàn thành phố – kế hoạch riêng

## Cách dùng

Giáo viên chọn đăng nhập, bấm Tiếp tục với Google rồi chọn tài khoản trong nút Google. Email đăng nhập Google chưa phải xác minh nghề nghiệp. Tài khoản mới chỉ có quyền giáo viên; không thể tự nhận quyền quản trị. Email có tài khoản cấp thủ công tiếp tục dùng mật khẩu, không tự liên kết tài khoản đặc quyền.

Trong KẾ HOẠCH CỦA TÔI: chọn trường, bộ sách, năm học, khối; tải mẫu hoặc nhập bảng .docx/.xlsx; chỉnh từng dòng; xác nhận liên kết học liệu phù hợp; kiểm tra và lưu. Bảng không nhận diện được sẽ báo lỗi thay vì đoán. Không gọi AI khi nhập; file gốc không tải lên máy chủ. Giới hạn file 5 MB / giải nén 15 MB, 100 bài, kế hoạch lưu tối đa 250 KB. Mỗi tài khoản hiện có một kế hoạch đang dùng. Tải bản sao trước khi thay kế hoạch; bản sao JSON để lưu trữ, chưa hỗ trợ nhập lại JSON. Chưa có lịch sử phiên bản/nhiều kế hoạch.

Liên kết gợi ý dựa trên bộ đối chiếu chủ đề hiện có, cùng khối và học liệu đủ điều kiện; giáo viên phải chọn xác nhận. Nội dung chưa khớp không tự có trình chiếu; không sinh một bài giảng mới từ tên bài. Có thể xem/soạn/xuất KHBD trong danh sách bài riêng. Kho tích hợp nguồn cũ vẫn cần đối chiếu sách hiện hành, không tự coi đã chuẩn cho năm mới.

Đề xuất vào kho chung gửi bản chụp đầy đủ kế hoạch đã lưu. Quản trị đọc từng bài, tiếp nhận vào bản nháp hoặc yêu cầu chỉnh sửa. Tiếp nhận chưa xuất bản: mở mục quản trị GDĐP để kiểm tra và xuất bản riêng. Kho chung hiện hỗ trợ năm 2026–2027; kế hoạch cá nhân nhận năm học liên tiếp khác. Mỗi lần gửi là một đề xuất; giao diện chặn gửi lại tới khi có chỉnh sửa.

## Bật Google trên tên miền thật

Dùng Google Identity Services trực tiếp, không yêu cầu bật Firebase Google provider. Máy chủ kiểm tra chữ ký RS256, issuer, audience, hạn dùng, email đã xác minh và nonce một lần, rồi cấp phiên HttpOnly 8 giờ như đăng nhập hiện có.

Trong Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → Web application của dự án:

- Authorized JavaScript origins phải có `https://chamdanang-gddp.ai.studio` và tên miền thử nghiệm thực tế nếu cần. Không thêm path hoặc dấu `/` cuối.
- OAuth consent screen cần phù hợp người dùng mục tiêu. Nếu ở trạng thái Testing, chỉ người dùng thử được khai báo mới đăng nhập được; cần kiểm tra trạng thái trước khi chia sẻ rộng.
- Mặc định dùng client ID Web đã có trong `firebase-applet-config.json`. Có thể đặt `GOOGLE_CLIENT_ID` trên Cloud Run để thay thế; trình duyệt đọc cấu hình công khai từ `/api/auth/google/config`. Client secret không dùng và không đưa lên giao diện.
- Container phải truy cập `https://www.googleapis.com/oauth2/v1/certs`; trình duyệt phải tải `https://accounts.google.com/gsi/client`.

Mã không tự thay đổi OAuth consent/origins. Cần một lần đăng nhập thực trên tên miền sau xuất bản để xác nhận cấu hình và popup Google. Thử nghiệm tự động chỉ mô phỏng danh tính đã xác minh; kiểm thử chữ ký riêng dùng khóa RSA giả lập.

## Dữ liệu và vận hành

Kế hoạch lưu tại `cham_teacher_workspaces/{serverAuthenticatedUserId}`. Không dùng teacherId do trình duyệt gửi; GET đọc đúng một tài liệu, PUT không ghi lại kế hoạch không đổi. Chỉ lưu văn bản/liên kết, không nhân bản ảnh/âm thanh. Trường được chọn là tên do giáo viên khai báo, chưa phải đơn vị đã xác thực. Lớp của tài khoản Google có ID chứa giáo viên để tránh trùng lớp 2/24 giữa các trường; ID của tài khoản cũ giữ nguyên để bảo toàn dữ liệu.

Đăng nhập dùng các collection tài khoản/phiên hiện có và challenge Google có expiresAt/expireAt. Cần chính sách Firestore TTL cho `expireAt` để dọn tài liệu hết hạn; kiểm tra hết hạn vẫn được máy chủ thực hiện dù chưa có TTL. Không tuyên bố không phát sinh chi phí hoặc đã chịu tải toàn thành phố: vẫn cần theo dõi hạn mức Firestore/Cloud Run và thử tải thực. Các API báo cáo cũ vẫn có thao tác liệt kê collection; chưa tối ưu toàn hệ thống ở quy mô thành phố.
