# Đăng nhập nhân sự CHẠM ĐÀ NẴNG

Đã bỏ lối vào demo quản trị/giáo viên. Đăng nhập bằng email và mật khẩu riêng, do quản trị cấp; không phải đăng nhập Google OAuth.

## Thiết lập trên Google Cloud

1. Trong project đang chạy app (`boreal-doodad-j6shk`), bật Firestore API và tạo cơ sở dữ liệu Firestore Native. Có thể bật Firebase từ AI Studio → Settings → Integrations → Firebase Firestore & Auth; ghi lại Database ID được cấp. Chọn vị trí phù hợp trước khi tạo.
2. Xem tài khoản dịch vụ được gán cho **dịch vụ Cloud Run** trong phần Security (tài khoản production: `378356637128-compute@developer.gserviceaccount.com`). Cấp tài khoản đó quyền `Cloud Datastore User` (`roles/datastore.user`) trên project Firestore `boreal-doodad-j6shk` bằng lệnh:
   ```bash
   gcloud projects add-iam-policy-binding boreal-doodad-j6shk \
     --member="serviceAccount:378356637128-compute@developer.gserviceaccount.com" \
     --role="roles/datastore.user"
   ```
   Đây là danh tính chạy app thực tế của Cloud Run production.
3. Thiết lập các biến máy chủ của dịch vụ Cloud Run:

   | Biến | Giá trị |
   |---|---|
   | `AUTH_FIRESTORE_PROJECT` | `boreal-doodad-j6shk` |
   | `AUTH_FIRESTORE_DATABASE` | `ai-studio-71b45c71-26f3-4479-9372-306c6b35245a` (Database ID đã tạo) |
   | `AUTH_ADMIN_EMAIL` | Email thật của người quản trị đầu tiên |
   | `AUTH_ADMIN_PASSWORD` | Mật khẩu riêng từ 12–128 ký tự, nên gán bằng Secret Manager |

4. Lấy mã mới từ GitHub vào AI Studio và xuất bản. Nếu AI Studio tạo lại dịch vụ/cấu hình, kiểm tra các biến trên ở bản triển khai mới.
5. Sau khi triển khai, mở `/api/health` trên đúng URL Cloud Run. Chỉ tiếp tục khi thấy `firestore: "connected"`, `auth.ready: true` và `contentStorage: "firestore"`.
6. Chọn Quản trị trên trang đầu, nhập email/mật khẩu đã cấu hình. Tài khoản đầu tiên được tạo khi có yêu cầu đăng nhập lần đầu. Đăng xuất rồi đăng nhập lại một lần để xác nhận phiên thật hoạt động.
7. Vào mục Người dùng để thử tạo một tài khoản giáo viên; vào Nội dung trạm để thử xuất bản một thay đổi nhỏ. Nếu cả hai thao tác thành công, tài khoản quản trị và quyền ghi Firestore đã hoạt động đúng.
8. Sau khi tài khoản quản trị đã được tạo thành công, có thể bỏ biến `AUTH_ADMIN_PASSWORD` khỏi dịch vụ; giữ `AUTH_ADMIN_EMAIL` cố định. Mật khẩu đã lưu dưới dạng băm có salt; app không lưu mật khẩu gốc.

Không đưa mật khẩu, khóa dịch vụ hoặc secret vào biến `VITE_*`, mã frontend, GitHub hoặc ô chat AI Studio. Tên project không phải bí mật. Không bật `AUTH_LOCAL_HTTP` trên Cloud Run; mã cũng tự buộc cookie Secure khi chạy trong Cloud Run.

Nếu Firestore chưa được cấu hình, app học sinh vẫn mở được; đăng nhập nhân sự báo chưa cấu hình và không cấp quyền demo. Firestore cần cấu hình thanh toán/quota phù hợp với tài khoản Google Cloud.

## Hoạt động

- Cookie phiên HttpOnly, Secure, SameSite=Strict, thời hạn 8 giờ; chỉ mã băm của token được lưu trong Firestore. Không lưu token ở localStorage.
- Mỗi yêu cầu quản trị kiểm tra tài khoản và vai trò trên máy chủ. Giáo viên không được cấp tài khoản khác hoặc xuất bản học liệu.
- Quản trị tạo tài khoản giáo viên, khóa/mở và đặt lại mật khẩu. Không có đăng ký tự do, không có mật khẩu mặc định.
- Đổi mật khẩu hoặc khóa/đặt lại mật khẩu vô hiệu hóa phiên cũ. Mọi nhân sự có nút Đổi mật khẩu của tôi.
- Thử sai 5 lần trong 10 phút sẽ tạm chặn 1 phút theo tài khoản, lưu bền vững. Yêu cầu ghi từ origin khác bị từ chối.
- Danh tính/vai trò không lấy từ giá trị vai trò do trình duyệt gửi lên.

## Vận hành

Các collection: `cham_users`, `cham_sessions`, `cham_auth_limits`, `cham_auth_locks`. Chỉ máy chủ dùng IAM truy cập. Không mở Firestore rules cho truy cập công khai; bảo vệ project IAM và sao lưu cơ sở dữ liệu. Có thể bật TTL field `expireAt` cho collection group `cham_sessions` để dọn phiên hết hạn; phiên hết hạn vẫn bị từ chối dù chưa được dọn.

Tài khoản quản trị ban đầu được giữ nguyên sau mỗi triển khai. Đổi biến mật khẩu không đặt lại mật khẩu tài khoản đã tồn tại. Nếu quản trị quên mật khẩu, người vận hành Cloud có thể xóa đúng document quản trị trong `cham_users` và gán lại mật khẩu khởi tạo mạnh trước lần đăng nhập kế tiếp; document có ID SHA-256 của email chữ thường. Đây là thao tác phục hồi đặc quyền, cần kiểm tra đúng document và sao lưu trước.

## Phạm vi và kiểm tra trước sử dụng toàn trường

Đăng nhập nhân sự thật đã được triển khai trong mã; phải hoàn thành cấu hình và kiểm thử thực tế trên URL Cloud Run trước khi sử dụng. Kiểm tra: đăng nhập quản trị/giáo viên, cấp/khóa/đặt lại mật khẩu, đổi mật khẩu, đăng xuất và từ chối giáo viên gọi API quản trị.

Giáo viên có thể tạo và sửa danh sách lớp trên máy chủ, liên kết mã đồng bộ của học sinh, xem kết quả thật và xuất Excel. Tiến trình học sinh lưu tại thiết bị và đồng bộ khi được cấu hình Firestore. Báo cáo chỉ gồm học sinh đã liên kết; không suy diễn chưa liên kết là 0 điểm. Chưa có gửi email đặt lại mật khẩu tự động, Google OAuth, MFA hoặc đăng nhập học sinh bằng mã lớp.

Kiểm tra tự động: `node --test auth-test.mjs` kiểm tra API với kho dữ liệu bộ nhớ (không thay thế kiểm thử Firestore/Cloud Run thật). Cấu hình thiếu không được làm máy chủ dừng.


## Dịch vụ thử nghiệm tách biệt

Chỉ triển khai nhánh `feature/gddp-teacher-2026-2027` vào dịch vụ Cloud Run mới. Đặt `CHAM_ENV=test`, `AUTH_FIRESTORE_PROJECT` và `AUTH_FIRESTORE_DATABASE` trỏ tới database thử nghiệm riêng; không dùng database chính ở bảng trên. Máy chủ từ chối khởi động trong chế độ test nếu thiếu cấu hình hoặc dùng database chính. Không tự chuyển về database chính khi kho thử nghiệm bị lỗi. Cấu hình Admin và quyền IAM riêng trên dịch vụ thử nghiệm, rồi kiểm tra `/api/health`, đăng nhập hai vai trò, lưu/đọc lại GDĐP, tiến trình một học sinh giả lập, báo cáo lớp và tải Excel.

`node --test deployment-test.mjs production-api-test.mjs` kiểm tra đóng gói runtime, lựa chọn database và toàn bộ API với Firestore REST giả lập; vẫn cần kiểm chứng quyền IAM, cookie và lưu bền vững trên Cloud Run thật.
