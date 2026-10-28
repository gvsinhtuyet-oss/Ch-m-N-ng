# Cloudflare Pages — giữ API và dữ liệu hiện có

## Trạng thái

Chuẩn bị trên nhánh riêng từ main `f2a1f73a9a2a455e77d263a5533b92c64d2d5d92`.
CHƯA triển khai/CHƯA nghiệm thu Cloudflare. Không coi bản build là một link dự thi.

## Kiến trúc đã kiểm tra

- Vite tạo `dist`, toàn bộ 25 WebP/trò chơi/audio/PWA vẫn đóng gói.
- `functions/api/[[path]].js` chỉ chuyển `/api/*` tới `https://chamdanang-gddp.ai.studio`.
- Node `content-server.mjs`, Firestore, danh tính Google Cloud, tài khoản Admin/giáo viên và dữ liệu cũ được giữ nguyên trên backend hiện tại.
- Không dùng metadata Google Cloud từ Workers, không sao chép mật khẩu/token/khóa dịch vụ, không tạo database.
- Gateway kiểm tra Origin trước khi chuyển tiếp, không bật CORS, chỉ chuyển cookie phiên của app; cookie HttpOnly/Secure/SameSite=Strict được giữ nguyên. API không cache. Redirect/HTML từ upstream trả lỗi thay vì giả thành công.
- `_routes.json` chỉ gọi Functions cho API; ảnh/audio/JS được phục vụ tĩnh.
- Sửa lỗi có sẵn ở Admin: các đường dẫn ảnh WebP đóng gói bị bộ kiểm tra cũ từ chối. Trình biên tập chấp nhận asset đóng gói và gửi URL HTTPS tuyệt đối đến backend cũ; không thay đổi schema hoặc quyền.

## Cấu hình Pages dự kiến (chưa thực hiện trên tài khoản)

- Kết nối đúng repository `gvsinhtuyet-oss/Ch-m-N-ng`; chỉ cấp quyền repository này nếu UI hỗ trợ.
- Build: `npm run lint && npm run build`; output: `dist`; root: repository root; Node.js 22.
- `functions/` ở repository root, không bỏ qua Functions hoặc chỉ kéo-thả `dist`.
- Không cần bí mật mới trên Pages: gateway dùng backend công khai hiện có.
- Tạo preview nhánh triển khai, kiểm tra API/login/lưu học liệu và học sinh trước khi gộp main và kích hoạt main production auto-deploy.
- Chọn Free, không thêm phương thức thanh toán hoặc bật gói trả phí.
- Phải xác minh một commit an toàn tự tạo deployment mới trước khi tuyên bố auto-deploy hoạt động.

## Phụ thuộc và giới hạn

- Backend Google hiện có phải tiếp tục hoạt động; đây không phải di chuyển toàn bộ máy chủ ra khỏi Google.
- Health API live ngày 28/10 báo Firestore đọc/ghi connected, Admin ready, database `ai-studio-71b45c71-26f3-4479-9372-306c6b35245a`, revision `ch-m-n-ng-h-nh-tr-nh-s-kh-m-ph-qu-h-ng-00056-t45`.
- Lần republish mới nhất trên Chrome ngày 28/10 lúc 16:09 Việt Nam thất bại với `Internal error encountered`; không kết luận mọi lần đều do quota.
- Pages Free: 500 builds/tháng, tối đa 20.000 tệp, 25 MiB/tệp. Functions tính vào Workers Free 100.000 yêu cầu/ngày dùng chung tài khoản, CPU 10 ms/yêu cầu. Không thể quy đổi thành số học sinh đồng thời khi chưa đo tải. Google backend/Firestore vẫn có hạn mức riêng.
- Nếu có đăng nhập Google giáo viên, origin Pages mới cần được chủ OAuth client cho phép trước khi nghiệm thu nút Google; đăng nhập email/mật khẩu vẫn dùng backend cũ. Không tự đổi OAuth/IAM.
- LocalStorage/PWA thuộc từng origin: thiết bị học sinh chuyển từ ai.studio sang Pages cần dùng mã đồng bộ để khôi phục tiến độ đã lên máy chủ; tiến độ chỉ lưu cục bộ không tự chuyển qua domain.
- Trên iPhone cần kiểm tra luồng Safari → Chia sẻ → Thêm vào Màn hình chính; chưa tuyên bố đã cài được trên điện thoại thật.

## Bằng chứng đã có

- Đã xác nhận PR #20 merged, main SHA như trên qua GitHub connector; 25 bản đồ gắn đúng mã trạm.
- TypeScript/build thành công; 25 ảnh decode đúng độ phân giải, 121 câu hỏi kiểm tra chọn hai phương án từ dữ liệu thật; nhận quà/lưu local/tách tài khoản/rương đủ năm mảnh đạt kiểm thử tự động.
- Các bài HTTP integration production/Vite/gateway dùng Firestore giả lập, không ghi database thật: Admin, giáo viên, GDĐP công bố học sinh, lớp học, sync register/push/restore, phân quyền/đăng xuất/đăng nhập lại đều đạt.
- Đã mở app công khai, bấm đăng nhập Admin bằng thông tin trình duyệt đã lưu và vào quản lý trạm thành công. Bấm xuất bản bản không đổi bị validator URL cũ chặn; đã sửa trên nhánh này.
- Chưa ghi học liệu thử lên máy chủ thật, chưa nghiệm thu đủ 25 trạm qua UI/mobile, chưa có deployment Cloudflare hay auto-deploy được xác minh.
- Cloudflare đang ở màn hình đăng nhập tài khoản đã lưu; người dùng cần hoàn tất đăng nhập/điều khoản trong giao diện bảo mật, không gửi bí mật trong chat.
- Wrangler 4.154.0 biên dịch Pages Function thành công. Local `pages dev` bị lỗi môi trường `uv_interface_addresses`, nên chưa tuyên bố chạy thành công trong runtime Workers. API gateway đã chạy qua Node HTTP integration, nhưng vẫn cần nghiệm thu trên preview Cloudflare thật.
- Bộ TS/TSX đạt 200/201 ở clone nông; bài còn lại thiếu lịch sử `39ddc40`. Sau `git fetch --unshallow`, bài grade45 được chạy lại và cả 22 kiểm thử của tệp đều đạt. Đây là thiếu lịch sử clone, không phải lỗi ứng dụng.
- 30 kiểm thử server/auth/storage/sync cũ đạt; 3 gateway security tests, 3 HTTP integration scenarios và 2 kiểm thử đường dẫn Admin mới đạt. TypeScript và production build đạt; 666 tệp/82.337.211 byte, tệp lớn nhất 1.563.485 byte.

Nguồn: https://developers.cloudflare.com/pages/platform/limits/
https://developers.cloudflare.com/workers/platform/limits/
