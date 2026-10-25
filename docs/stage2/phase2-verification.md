# Giai đoạn 2 – ba bản thử mới khối 3 (26/10/2026)

## Phạm vi và bảo toàn bản đã duyệt

Nhánh `feat/stage2-shared-react-preview`, tiếp tục PR nháp #15. Không gộp `main`, không thay website chính. Trạm 1 giữ nguyên thành phần tích hợp và HTML V12 đã duyệt; không tự chuyển Trạm 1 sang engine khác trong đợt này. Trạm 2 giữ nguyên nội dung cấu hình, CSS, ảnh, âm thanh và HTML V18. Các trạm 3–5 dùng chung `SharedStage2` → `SharedChallengeGame`, `state.ts`, `audio.ts`, `fireworks.ts` với bản React Trạm 2.

Thay đổi bộ khung chỉ thêm hai trường cấu hình tùy chọn: ảnh vật phẩm và nhãn giới thiệu. Khi không cấu hình, Trạm 2 vẫn dùng biểu tượng và nhãn cũ. Không tạo ba bộ HTML game. Tất cả trò chơi chính thức tiếp tục đi theo nhánh cũ; React chỉ được chọn qua đường chơi thử hoặc `stage2-engine=shared-v1`.

## Ba bản thử

| Mã trạm | Chủ đề | Tên trò chơi | 5 vật phẩm cùng loại |
|---|---|---|---|
| g3-station-3 | Cộng đồng các dân tộc Đà Nẵng | Bí mật sắc màu quê hương | Huy hiệu thổ cẩm vàng |
| g3-station-4 | Nghề làm nước mắm Nam Ô | Truy tìm bí quyết Nam Ô | Giọt nước mắm vàng |
| g3-station-5 | Nghề đan thuyền thúng ở Sơn Trà | Xưởng thuyền thúng tí hon | Thuyền thúng vàng mini |

Mỗi trạm có 5 câu: 1 ảnh, 2 trắc nghiệm, 1 nối ba cặp, 1 tình huống. Thứ tự đáp án cố định. Hai nền 3D khác nhau mỗi trạm; sáu ảnh WebP riêng, khoảng 305–407 KiB/ảnh, tạo bằng công cụ ảnh tích hợp. Prompt và đường dẫn trong `phase2-image-prompts.json`; tài nguyên trong `public/games/shared/v1/grade3/`.

Ảnh đáp án tái sử dụng ảnh thật cục bộ: `co-tu-costumes.webp` (ảnh hai trang phục trưng bày; câu hỏi chỉ hỏi nhận diện trang phục thổ cẩm, không yêu cầu gán cả hai cho một dân tộc), `thung-my-khe.webp` (thúng tròn, câu hỏi không khẳng định địa điểm sản xuất) và `nam-o-loc.webp` (công đoạn lọc). Không dùng ảnh `thung-dan.webp` chụp thuyền dài làm đáp án nhận diện thúng. Nguồn ảnh giữ theo hồ sơ sẵn có trong `content-review/grade3-media-sources.json` và `content-review/real-photos-2026-10-24.json`; không xóa watermark.

## Căn cứ nội dung

Đối chiếu lời dẫn 4 điểm học tập của từng trạm trong `src/data/grade3Content.ts`, có ghi chú đối chiếu tài liệu lớp 3 và biên bản hiệu chỉnh giáo viên trong mã nguồn. Không có bản Word/PDF gốc mới được đính kèm ở lượt này, nên chưa xác minh lại từng trang của bản gốc. Danh mục toàn bộ 15 câu, đáp án và gợi ý được xuất nguyên từ cấu hình trong `phase2-question-review.md`, kèm điểm học tập làm căn cứ. Chờ giáo viên duyệt nội dung trước khi bật chính thức.

## Kết quả đã kiểm thử

- **26/26 kiểm thử tự động đạt**: sáu kiểm thử Giai đoạn 1, bảy hồi quy về mở khóa/thống kê/nội dung, mười ba kiểm thử Giai đoạn 2. Bao gồm: mỗi đáp án có một kết quả rõ; sáu hoán vị câu nối chỉ có một hoán vị đúng; sai cả lượt đầu; sai lặp trong ôn; không mất/cấp trùng vật phẩm; reset; các tài nguyên cục bộ; bảo toàn nguyên byte các tệp đã duyệt và nội dung học; toàn bộ tín hiệu âm thanh có nguồn khi bật, im khi tắt, lịch phát nối tiếp và mở khóa AudioContext trong giả lập.
- **TypeScript toàn dự án đạt. Vite/PWA build đạt**; cảnh báo chunk lớn có sẵn vẫn còn, không phải lỗi dựng.
- **Trình duyệt Chromium**: cả ba trạm đều thử sai 5/5 câu, hiện gợi ý riêng và giữ 0/5 vật phẩm. Ôn đúng đủ 5 câu lên đúng 5/5, không nhận trùng; đi tiếp Chặng 3 đúng chủ đề. Chơi lại từ chiến thắng trở về 0/5. Đã thử các nút bắt đầu, âm thanh, đáp án ảnh/chữ, thẻ nối trái/phải, xác nhận, truy lại, chơi lại, tiếp tục.
- Câu nối giữ ba đường ba màu; SVG có 6 đoạn (3 nét viền trắng + 3 nét màu); chỉ chấm khi nhấn Xác nhận. Pháo hoa hạt liên tục trên nền chiến thắng; dọn animation khi rời game.
- Đã kiểm tra giữ trạng thái âm thanh khi chơi lại/chuyển trạm. Ba MP3 dùng chung đọc được bằng ffprobe, mono 32 kHz, hai hiệu ứng 1,116 giây và nhạc chiến thắng 5,328 giây. Bằng chứng ở `phase2-audio-probe.json`. Không phát thêm bộ âm thanh riêng cho từng trạm.
- Trạm 2 đã mở lại màn đầu và câu ảnh đúng nội dung/ảnh/vật phẩm cũ. Kiểm thử bảo toàn nguyên byte xác minh Trạm 1–2 không bị sửa nội dung, CSS hay tài nguyên. Không chụp so sánh từng pixel và không chơi lại toàn bộ Trạm 1 trong đợt này.

## Ma trận bố cục

24 màn (mỗi trạm: mở đầu, câu 1–5, truy lại, chiến thắng) × 8 khung nhìn = **192 lượt đo**, không phát hiện phần tử kiểm tra nằm ngoài viewport và không phát hiện ảnh `<img>` chưa tải. Bằng chứng thô: `phase2-browser-qa.json`. Mỗi trạm dùng cùng câu hỏi hiện tại khi đổi kích thước, qua cả dọc/ngang.

| Viewport Chromium | Trạm 3 | Trạm 4 | Trạm 5 |
|---|---|---|---|
| 1366×768 | Đạt | Đạt | Đạt |
| 1024×768 | Đạt | Đạt | Đạt |
| 390×844 | Đạt | Đạt | Đạt |
| 375×667 | Đạt | Đạt | Đạt |
| 320×640 | Đạt | Đạt | Đạt |
| 844×390 | Đạt | Đạt | Đạt |
| 667×375 | Đạt | Đạt | Đạt |
| 640×320 | Đạt | Đạt | Đạt |

Một lần công cụ `Input.dispatchMouseEvent` timeout khi đổi kích thước ở chiến thắng Trạm 5. Quan sát lại cho thấy game vẫn ở chiến thắng 5/5, sau đó chạy lại toàn bộ ma trận chiến thắng đạt. Không coi lần timeout là kết quả đạt; chỉ ghi phép chạy lại hoàn chỉnh.

## Chưa kiểm thử / chưa hoàn tất

- Safari/iPhone/iPad, Android, Edge và thao tác chạm trên thiết bị vật lý. Viewport Chromium không thay thế thử máy thật.
- Chất lượng nghe, âm lượng loa, chính sách âm thanh khi khóa màn hình/chuyển nền trên từng hệ điều hành. Kiểm thử âm thanh tự động dùng AudioContext giả lập; chưa chứng nhận nghe thực tế trên loa.
- Lưu/đồng bộ bằng tài khoản học sinh thật và đọc lại trên thiết bị khác. Bản duyệt chỉ đọc, không ghi dữ liệu học sinh; dùng đúng cầu nối chuyển `Stage3CheckIn` hiện có.
- Chưa duyệt nội dung với giáo viên, chưa bật mặc định và chưa gộp PR #15. Trạm 1 vẫn là tích hợp đã duyệt; không tuyên bố đã chuyển cả 5 trạm sang engine React mới.
- Chỉ chạy bộ kiểm thử liên quan nêu trên, không chạy toàn bộ mọi bài kiểm thử của repository.

## Chạy lại

```
node --import tsx --test stage2-shared-test.ts stage2-grade3-phase2-test.ts stage-access-test.ts local-learning-summary-test.ts stage2-distinct-test.ts
npm exec tsc -- --noEmit
npm run build
```

`/stage2-grade3-qa.html` mở bộ chọn trạm và 8 viewport. Các link thật trên bản duyệt dùng `?stage2-preview=g3-station-3`, `g3-station-4`, `g3-station-5`. Bản duyệt riêng giữ quyền truy cập hiện tại; không thay quyền chia sẻ.
