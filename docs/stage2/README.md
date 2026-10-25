# Bộ khung Chặng 2 – bản thử Giai đoạn 1

Mốc nguồn tham chiếu: `5f12454e3adafd971040f1d82931dcf8463fcb4d` (main khi bắt đầu).

## Kiến trúc

- `src/games/stage2/SharedChallengeGame.tsx`: một giao diện React, CSS V18 trong Shadow DOM, câu ảnh/chữ/nối, vật phẩm và chiến thắng.
- `state.ts`: tiến trình thuần, khóa lượt trả lời, chỉ ôn câu sai, mỗi câu nhận một vật phẩm.
- `types.ts`: hợp đồng dữ liệu và kiểm tra năm câu theo thứ tự ảnh/chữ/chữ/nối/chữ.
- `audio.ts`: một singleton Web Audio, một âm lượng chính, các tín hiệu nối tiếp; dùng mẫu âm V18 và giai điệu dự phòng từ `public/games/shared/game-audio.js`.
- `fireworks.ts`: tái sử dụng thuật toán pháo hoa V18, React dọn animation khi rời màn.
- `hoangDieu.ts`: nội dung V18 giữ nguyên; không nhúng HTML hoặc thực thi script HTML cũ.
- `SharedStage2.tsx`: cầu nối `progressService.completeStage2` và callback chuyển chặng hiện có. Vai trò chỉ đọc không ghi kết quả. Nhạc nền app tạm dừng khi game sở hữu âm thanh, khôi phục khi rời.
- `rollout.ts`: danh mục 24 bản nháp tham chiếu câu hỏi hiện có. Không tự coi câu hỏi cũ là bộ năm câu đã duyệt. Không bật trạm nào.

## Mở bản thử

`/?stage2-preview=g3-station-2`: không cần đăng nhập; chuyển đến đúng thành phần `Stage3CheckIn` của trạm; không ghi tiến trình học sinh.

Trong app, chỉ khi URL có `stage2-engine=shared-v1` thì Trạm 2 mới dùng engine mới. URL bình thường vẫn dùng V18.

`/stage2-qa.html`: bộ khung nhìn 1366×768, 1024×768, 390×844, 375×667, 320×640 và ba chiều ngang điện thoại. Đây là các viewport Chromium, không phải thiết bị vật lý.

## Khác biệt kỹ thuật có chủ đích

Ảnh và toàn bộ câu hỏi giữ nguyên từ V18. Cố định thứ tự lựa chọn trong bản thử. Dời HUD điện thoại dọc xuống dưới tranh để tránh che tên trò chơi; bổ sung bố cục ngang thấp. Không làm lại mỹ thuật. Chìa khóa tính theo tập câu đúng thay vì vị trí lượt ôn. Nhạc chiến thắng tuân thủ tắt tiếng. Không cài listener âm thanh HTML cũ vào game React.

Các trò chơi cũ vẫn dùng `public/games/shared/game-audio.js` trong thời gian chuyển tiếp. Chưa tuyên bố 25 trạm đã dùng chung hệ thống mới. Mẫu tín hiệu được chuyển vào module TypeScript; sau khi duyệt từng đợt sẽ loại hệ thống cũ khỏi các trạm được thay thế, không chạy đồng thời hai bộ trong một game.

## Lỗi có sẵn được phục hồi để dựng được dự án

Commit nguồn mới nhất xóa `MyKheBanThanV12.tsx` và HTML V12 dù `Stage2Challenge.tsx` vẫn import. Khôi phục nguyên byte hai tệp từ `6f3c363` để loại lỗi thiếu module; không thay nội dung trò chơi Mỹ Khê. V18 Trạm 2 và script âm thanh legacy không chỉnh sửa.

## Lệnh xác minh

```
node --import tsx --test stage2-shared-test.ts
node --import tsx --test stage-access-test.ts local-learning-summary-test.ts stage2-distinct-test.ts
npm exec tsc -- --noEmit
npm run build
```

## Điều kiện chuyển đợt

24 trạm chia 5/5/5/5/4 theo khối và thứ tự bài từ `OFFICIAL_25_CATALOG`. Mỗi bản nháp giữ ID thật, tên thật, câu hỏi nguồn và checklist. Cần đối chiếu nội dung đã duyệt, đủ năm câu, ba cặp nối, ảnh cục bộ, hai nền, vật phẩm, kiểm thử âm thanh và viewport rồi mới xin duyệt. Không dùng câu hỏi hoặc ảnh Trạm 2 làm nội dung thay thế cho trạm khác. Không tự bật sau khi build qua.
