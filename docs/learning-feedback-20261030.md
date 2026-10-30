# Phản hồi và cải tiến học liệu – nhánh riêng

Phạm vi đã nhận: mục 1–3 của yêu cầu. Mục 4 trong tin nhắn bị cắt ở tiêu đề; chưa suy diễn quy trình quản lý mới.

## Hành vi

- Chặng 4 gọi nguyên `finalizeJourneyAndStamp`: một lần đóng dấu ghi bản đồ, chìa khóa, kỷ vật và tiến độ. Bỏ thao tác thu thập thứ hai và popup đánh giá. Phần thưởng không phụ thuộc đánh giá.
- Đối chiếu PR #38 (b700c86); tự áp dụng luồng một chạm trên main, giữ bản đồ đúng tỷ lệ và các sửa mới trên main. Không merge/cherry-pick PR đang xung đột. PR này thay thế phần luồng đánh giá trong #38; không gộp cả hai máy móc.
- Sao ban đầu rỗng nếu chưa đánh giá. Chọn sao tự lưu máy chủ, cho đổi sau khi lưu xong; không báo thành công nếu HTTP/JSON/xác nhận lưu thất bại. Không chuyển đánh giá kiến thức ba tiêu chí cũ thành sao yêu thích.
- Học sinh dùng mã đồng bộ bí mật đã có, máy chủ xác minh và dùng hash tài khoản làm khóa; khôi phục cùng mã trên thiết bị khác sẽ đọc cùng đánh giá. Khi tài khoản học sinh chưa đồng bộ, báo chưa lưu và giữ phần thưởng.
- Khách dùng cookie HttpOnly/SameSite/host-only do máy chủ cấp, không dùng ID từ localStorage làm căn cứ chống spam. Xóa cookie/đổi trình duyệt tạo danh tính khách mới; đây không phải xác minh người dùng duy nhất ngoài đời.
- Form ba trường dùng chung cho nút tại tất cả trạm và nút giáo viên có sẵn. Dùng lại collection `cham_learning_proposals`, hộp thư và quyền duyệt quản trị. Bổ sung loại và nguồn minh chứng; tên/khối lấy catalog chuẩn trên máy chủ. Góp ý không tự sửa nội dung bài.
- Không đưa tên/email/mã đồng bộ vào phản hồi công khai. Rating API chỉ trả sao của chính danh tính đã xác minh. Danh sách góp ý vẫn yêu cầu giáo viên/quản trị; giáo viên chỉ thấy góp ý của mình, quản trị thấy toàn bộ.

## Hạn mức và vận hành

- Góp ý: 1 góp ý mới/phút và tối đa 5/ngày mỗi danh tính. Cùng trạm/loại/nội dung/nguồn không tạo bản ghi trùng.
- Sao: 1 bản ghi/danh tính/trạm; chọn cùng sao không ghi lại; tối đa 20 thay đổi/phút.
- Quota bền vững dùng create-only Firestore documents, chống tranh chấp giữa các instance. Có giới hạn cấp danh tính mới 300/giờ/socket và chặn ingress bộ nhớ; không tin IP header do trình duyệt gửi. Socket có thể dùng chung khi qua proxy nên đây là giới hạn thô, cần theo dõi khi có lượng truy cập lớn.
- Collection mới: `cham_journey_ratings`, `cham_feedback_guests`, `cham_feedback_limits`. Hai collection sau có `expireAt` cấp document từ adapter hiện có; nên bật Firestore TTL trên trường `expireAt` để dọn tự động. Quota vẫn đúng khi chưa bật TTL nhưng tài liệu hết hạn chưa được dọn.
- Không thêm nhà cung cấp trả phí hoặc gói phụ thuộc. Dùng quota Firestore hiện tại; khi hết quota phải báo lỗi thật, không coi localStorage là thành công.
- Nguồn minh chứng là chuỗi tham khảo/URL http(s), không upload file, không tải URL về máy chủ.

## Đồng bộ trước khi dùng thật

**Chưa gộp main hoặc triển khai production.** Cloudflare Pages Functions hiện chuyển API về `chamdanang-gddp.ai.studio`; chỉ build frontend sẽ không có API mới.

1. Đồng bộ các thay đổi nhỏ ở `content-server.mjs`, `auth-server.mjs`, Dockerfile và gateway với Work chatbot, giữ nguyên thay đổi chatbot.
2. Triển khai backend có `learning-feedback.mjs` và `learning-feedback-catalog.mjs` (Dockerfile đã thêm copy). Giữ nguyên Firestore hiện tại; không tạo/xóa tài khoản hoặc dữ liệu cũ.
3. Triển khai gateway có chuyển tiếp cookie `cham_feedback`, rồi frontend. Kiểm tra cookie Secure qua Pages, học sinh/khách, góp ý xuất hiện trong admin và thất bại lưu khi mất mạng.
4. Nghiệm thu trực quan PC/điện thoại trước khi gộp. Môi trường kiểm thử hiện không có Chromium executable; chưa kiểm chứng bố cục bằng trình duyệt.

## Kiểm thử

- `npm run lint`, `npm run build`.
- `node --test learning-feedback-test.mjs cloudflare-proxy-test.mjs teacher-workspace-test.mjs production-api-test.mjs`.
- `node --import tsx --test learning-feedback-client-test.ts stage-access-test.ts student-sync-test.cjs local-learning-summary-test.ts`.
- Kiểm thử mới: 25 mã trạm; khách đọc/lưu/đổi sao; tách khách; học sinh khôi phục khác thiết bị; dữ liệu trạm giả; giá trị sai; góp ý trùng; gửi đồng thời; nguồn nguy hiểm; CSRF; máy chủ lỗi; gateway cookie.
- Các HTTP regression test chạy cả production server và Vite với Firestore giả lập; không ghi dữ liệu học sinh thật.
- Build còn cảnh báo CSS selector và chunk lớn đã có ở mã nền; không sửa mở rộng sang giao diện/chatbot ngoài phạm vi.

Kết quả cuối: 24 kiểm thử đạt (12 API/gateway/workspace + 12 client/tiến độ), TypeScript đạt, build đạt. Đã rà checklist React về hooks, xử lý bất đồng bộ và truy cập bằng bàn phím; chưa có nghiệm thu trình duyệt.
