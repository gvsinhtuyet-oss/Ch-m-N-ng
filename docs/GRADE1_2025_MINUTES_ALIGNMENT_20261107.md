# Đối chiếu lớp 1 với Biên bản điều chỉnh TLGDĐP ngày 31/7/2025

**Trạng thái:** Bản sửa trên nhánh `feature/grade1-minutes-alignment-20261107`, **chưa công nhận khớp 100% và chưa tự xuất bản**.

Nguồn chuẩn của đợt sửa: tệp do giáo viên cung cấp `31-01.LỚP 1. BIÊN BẢN GÓP Ý  TLGD ĐP.docx`, Sở GDĐT TP Đà Nẵng, biên bản ngày 31/7/2025, 4 trang. Biên bản có nhiều phần ghi **“giữ nguyên”** tài liệu Quảng Nam/Đà Nẵng cũ mà không chép nguyên văn; khi chưa có đủ các trang gốc không được tự kết luận đã khớp từng tranh và từng hoạt động.

## Đã điều chỉnh trong mã nguồn

- **5/5 chủ đề** giữ đúng tên, thứ tự; ID 5 trạm, ID 20 điểm, thử thách Chặng 2 và phần thưởng không đổi.
- Gắn phần đọc đối chiếu gồm **Khởi động – Khám phá – Thực hành – Vận dụng** vào Chặng 1 của cả 5 chủ đề. Đây là **hoạt động học** theo tài liệu, không đổi bốn chặng kỹ thuật của ứng dụng.
- **Quê hương em:** ghi đủ 5 đơn vị hành chính của phần khởi động, 6 nhãn địa điểm của phần khám phá, 2 nhãn hình trường học của phần thực hành, câu hỏi học sinh và hai nhiệm vụ vận dụng. Sửa lời dẫn hai điểm cho phù hợp thông tin biên bản; bỏ khẳng định hai trường Võ Thị Sáu vì không có trong nội dung điều chỉnh này.
- **Thành Điện Hải:** giữ vị trí phường Hải Châu; nêu lại câu hỏi nhận biết, hiện vật, vị tướng Nguyễn Tri Phương, kể tên di tích; phần Vận dụng 1 được ghi rõ cần đối chiếu sách gốc.
- **Trò chơi dân gian:** KHÔNG tự viết lại nội dung mà biên bản chỉ ghi “giữ nguyên theo tài liệu GDĐP Quảng Nam trang 10”. Nội dung trò chơi hiện có chỉ là bản đang chạy và phải đối chiếu sách.
- **Những dòng suối:** đủ 6 nhãn hình khởi động, có hai Suối Mơ khác nhau; danh mục Thác Grăng và Thác Hòa Phú Thành; đủ hai yêu cầu sưu tầm và giới thiệu cảnh đẹp.
- **Món ăn truyền thống:** sửa lời dẫn thành **mì Quảng, bánh tráng cuốn thịt heo, bánh sừng trâu, bánh thuẫn, bánh bèo, bánh xèo**; không đưa cao lầu/bê thui/cơm gà/nem nướng thay danh mục này. Ghi rõ thay bánh tráng chập bằng bánh đập trong phần thực hành.
- Mã phiên bản đổi thành `4.3.0-grade1-minutes-2025-alignment` để nội dung cũ trong cache không lấn át bản sửa. Chính sách chỉ chuẩn hóa trong bộ nhớ, không ghi lại Firestore.
- Cung cấp bộ kiểm thử riêng `grade1-minutes-alignment-test.ts` và kiểm thử toàn ứng dụng trong CI.

## Điểm CHƯA hoàn thành, không được tuyên bố đã giống hình sách

1. **Ảnh minh họa:** biên bản liệt kê 5 hình Khởi động và 6 hình Khám phá của “Quê hương em”; 2 hình trường học; 6 hình Khởi động, 2 hình Khám phá chủ đề Suối; 6 món ăn và hình bánh đập. Trong repo chưa có đủ các ảnh **đúng đối tượng, đủ bản quyền và được kiểm chứng nguồn**. Giao diện đã hiện **tên hình** như danh mục cần đối chiếu, **không giả ảnh minh họa là ảnh chụp**. Việc thay hình thật còn chờ tài liệu ảnh nguồn hợp pháp.
2. **Giọng đọc:** bốn lời dẫn bị sửa ở `g1-home-2`, `g1-home-3`, `g1-food-1`, `g1-food-4`. **MP3 cũ vẫn được lưu, nhưng không phát trên 4 điểm này** vì nội dung không khớp. App chuyển về đọc trên thiết bị bằng Web Speech API; nếu thiết bị không có giọng Việt, vẫn có thể đọc văn bản. Trước xuất bản chính thức nên thu lại 4 MP3 chất lượng tốt và cập nhật manifest/hash.
3. **Giữ nguyên trang sách:** những đoạn được biên bản ghi giữ nguyên chỉ có thể kiểm tra trọn vẹn khi có trang gốc Quảng Nam tr. 2, 10, 28–34, 36 và Đà Nẵng tr. 6, 8, 10 theo tham chiếu trong biên bản.
4. **Thông tin hiện hành khác với tư liệu 2025:** theo thông báo [UBND phường Tam Kỳ ngày 13/9/2026](https://tamky.danang.gov.vn/chi-tiet-tin/group/151/nid/4719/default), Trường Tiểu học Kim Đồng là một trong bốn trường được hợp nhất thành **Trường Tiểu học Tam Kỳ**, các quyết định hiệu lực 26/8/2026. Vì vậy tài liệu ghi tên Kim Đồng là **ảnh lịch sử trong tài liệu 2025**, không dùng để giới thiệu tên trường hiện hành.
5. **Bài tích hợp theo môn học:** bảng 7 bộ trình chiếu Tiếng Việt/TNXH đang tham chiếu kế hoạch năm 2025–2026, không phải biên bản 31/7/2025. Không tự sửa tuần/tiết/trang 2026–2027 khi chưa có kế hoạch hiện hành.

## Phạm vi an toàn

Không sửa dữ liệu cấp 2–5, API, quyền Admin, tiến độ học sinh, trò chơi hay cơ sở dữ liệu. Không thay ảnh bằng ảnh tạo AI hoặc ảnh mạng thiếu giấy phép. Không thay đổi lịch sử giao diện bốn chặng, chỉ bổ sung lớp hướng dẫn theo biên bản vào Chặng 1.
