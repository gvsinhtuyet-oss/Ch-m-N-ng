# Khối 1 – Kiểm kê ảnh nguồn gốc theo biên bản 31/7/2025

**Trạng thái: đã nhận dạng, trích xuất và đóng gói để kiểm duyệt — chưa chèn ảnh nguồn vào Production.**

## Nguồn gốc được kiểm tra

- Tài liệu Word do giáo viên cung cấp: `TLĐP 1. 08-8-2025 (Nhóm 1).docx` (195,5 MB).
- Biên bản GDĐP lớp 1 ngày 31/7/2025: `31-01.LỚP 1. BIÊN BẢN GÓP Ý  TLGD ĐP.docx`.
- Bản Word có **153 tệp ảnh bên trong**, gồm cả ảnh nội dung, icon, ảnh lặp và tranh; 126 lần hiển thị trong văn bản. Đã lựa chọn **37 tệp nguồn ứng viên**, nén WebP và lập manifest mã băm để không nhầm hình.
- Bản đóng gói nguồn: `Grade1_AnhGoc_DoiChieu_BienBan_ChuaXuatBan.zip`, tạo trong môi trường làm việc để người phụ trách kiểm duyệt.

## Danh mục 37 ảnh nguồn ứng viên

| Chủ đề | Ảnh trong tài liệu | Tệp imageXXX được chọn |
|---|---|---|
| Quê hương em – Khởi động | Hội An, Nam Trà My, Hải Châu, Hiệp Đức, Hoàng Sa | 13, 14, 15, 16, 17 |
| Quê hương em – Khám phá | Cổng thôn Thạch Bích, đường Trần Hưng Đạo, chợ Việt An, nhà làng Tây Giang, đài tưởng niệm Hòa Vang, ga Trà Kiệu | 19, 20, 21, 22, 23, 24 |
| Quê hương em – Thực hành | Trường Tiểu học Kim Đồng, trường Võ Thị Sáu (ảnh trường tại Đà Nẵng cũ trong tài liệu) | 25, 27 |
| Thành Điện Hải | Toàn cảnh, Cửa Nam, Cửa Đông, hào thành, súng thần công, Nguyễn Tri Phương | 44, 49, 51, 53, 55, 57 |
| Trò chơi dân gian | Bịt mắt bắt dê, hoạt động vui chơi; ba ảnh chọn để đối chiếu nội dung bài | 66, 79, 74 |
| Những dòng suối | Suối Tiên, Suối Mơ (Hà Nha), Thác Ồ Ồ, Hố Giang Thơm, Suối Mơ (Bà Nà), Suối Lương, Thác Grăng, Hòa Phú Thành | 92, 93, 96, 97, 100, 101, 110, 112 |
| Món ăn | Mì Quảng, bánh tráng cuốn thịt heo, bánh sừng trâu, bánh thuẫn, bánh bèo, bánh xèo, bánh đập | 117, 122, 118, 121, 125, 124, 147 |

**Rà lại bằng mắt:** hai ảnh chụp thác ở cuối nhóm Suối (`image110.png`, `image112.jpeg`) cần giáo viên xác nhận khớp đúng nhãn Thác Grăng/Hòa Phú Thành trước khi đóng học liệu. Ảnh Trường Tiểu học Kim Đồng là **tư liệu 2025**, không phải xác nhận tên trường hiện hành. Không khẳng định nguồn ảnh nào có giấy phép mở chỉ vì ảnh nằm trong bản sách được gửi.

## Điều kiện trước khi gắn vào website công khai

1. **Xác nhận quyền sử dụng ảnh**: quyền công bố trực tuyến/học liệu công khai của các ảnh trích trong tài liệu không được chứng minh bằng biên bản. Giữ ảnh ở gói kiểm duyệt; không đưa tự động lên Cloudflare.
2. Chốt nhãn, địa điểm chính xác và mốc thời gian với giáo viên, nhất là hai thác và các trường học có thay đổi tên.
3. Khi đã được phép, nhập các WebP từ manifest vào `public/learning/grade1/minutes-source/` với tên cố định, thêm gallery theo **hoạt động học** cho khối 1 (không thay ngầm ảnh gốc được giáo viên chỉnh), kiểm tra 20 điểm và tất cả trò chơi.
4. Tạo lại bản MP3 **đúng bốn lời dẫn** (`g1-home-2`, `g1-home-3`, `g1-food-1`, `g1-food-4`), kiểm định âm thanh thật trước khi cập nhật `stage1Recordings.json`. Hệ thống hiện giữ TTS thiết bị thay MP3 cũ để tránh đọc sai.
5. Kiểm tra iOS/Safari và Android Chrome thật: xem rõ ảnh, không tràn viền, đọc trọn vẹn lời, đúng/sai/chiến thắng/tiếp tục.

## Không thay đổi

Không sửa tiến độ học sinh, cấp quyền Admin, Firebase/Firestore, ID trạm, ID điểm, trò chơi Chặng 3–4, nội dung các khối 2–5. **Không coi CI xanh là phê duyệt bản quyền hay nghiệm thu âm thanh theo tai người nghe.**
