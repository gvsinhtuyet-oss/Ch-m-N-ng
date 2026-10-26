# Đồng bộ trò chơi Chặng 2 khối 4–5

## Phạm vi

Hai đợt, mỗi đợt 5 trạm theo thứ tự tài liệu học. Dùng lại SharedChallengeGame, SharedStage2, âm thanh, bộ đếm vật phẩm, ôn câu sai, pháo hoa nhẹ và bố cục safe-v1 của khối 3. Không sao chép game thành 10 HTML. Các HTML QA chỉ chứa khung thử và iframe vào cùng React.

Các game khối 4–5 đang dùng và bộ định tuyến chính thức giữ nguyên. Bản mới chỉ chọn qua stage2-preview; chưa gộp main, chờ giáo viên duyệt. Trạm 1–5 khối 3 và toàn bộ bài học gốc không đổi.

Mỗi trạm: 5 câu (2 nhận biết, 2 thông hiểu, 1 vận dụng), 3 ảnh lựa chọn, 3 cặp nối, 5 vật phẩm cùng loại, nền chơi và chiến thắng riêng. 20 nền WebP đúng 1600×900, quality 84; tổng 6.589.986 byte, ảnh lớn nhất 419.210 byte. Ảnh được tạo/chỉnh bằng imagegen tích hợp; bộ câu lệnh và đường dẫn từng ảnh: image-prompts.json. Toàn bộ ảnh cuối cùng lưu tại public/games/shared/v1/grade45/ cùng 10 SVG vật phẩm.

Nguồn câu hỏi: lời dẫn và câu hỏi đã có trong src/data/grade45Content.ts. Hai câu mỗi trạm tái sử dụng nội dung cũ; câu ảnh, câu nhận biết và bài nối bổ sung từ các ý của bài. Ảnh đáp án tái sử dụng tư liệu cục bộ hiện có. Không dùng nền 3D làm bằng chứng nhận diện ảnh thật. Chưa mở lại tài liệu Word/PDF gốc trong đợt này; bộ 50 câu và đáp án để duyệt ở question-review.md và questions.json.

Đã sửa minh họa Hải Vân Quan theo ảnh tư liệu thật (cửa gạch hình khối, vòm đi qua; giữ Cầu Vàng và hai bàn tay), bỏ kén treo trên cây trong nền lụa. Nền Kỳ Anh–Mẹ Nhu không dựng chân dung nhân vật hoặc dùng tượng Mẹ Thứ thay thế.

## Kiểm tra đã hoàn thành

- 41/41 kiểm thử: cấu hình đủ 10 mã trạm và 2 đợt; ảnh có thật trên đĩa, 20 ảnh khác nhau, định dạng/kích thước/dung lượng; tiến trình sai cả năm câu, ôn lại đúng, không nhận trùng thưởng; ba cặp nối có đúng một hoán vị đúng; hồi quy khối 3, âm thanh và các bản đã duyệt.
- TypeScript và Vite/PWA build đạt. Vẫn có cảnh báo tối ưu CSS và chunk lớn đã có từ trước.
- Chromium: sai đủ 50 câu (gồm nối sai), phản hồi và màn ôn lại đúng. Sau đó làm đúng đủ 50 câu, đủ 5/5 vật phẩm ở cả 10 trạm. Thử một vòng đúng mới nữa để kiểm tra chơi lại ở màn cuối.
- Mỗi trạm đã bấm bắt đầu, chọn đáp án, chọn/nối cặp, xác nhận, ôn lại, chơi lại, bật/tắt âm thanh và tiếp tục hành trình. Cả 10 trạm chuyển đúng sang Chặng 3 của chính trạm đó. Chơi lại trả về 0/5.
- 360 phép đo bố cục: mở đầu, ôn lại, 5 câu, chiến thắng, chơi lại × 10 trạm × 4 cỡ: 390×844, 375×667, 320×640, 1366×768. Không có phần tử kiểm tra bị tràn chữ, HUD chồng lên khối chữ, ảnh img tải lỗi hoặc nút cuối màn ra ngoài viewport. 340 kết quả giữ trong lần đo sau phục hồi, 20 kết quả mở đầu khối 4 đã xác nhận đạt trước đó.
- Kiểm tra trực quan 20 ảnh: chữ Việt, vị trí bảng, năm phần thưởng trong rương. Ảnh luôn giữ tỷ lệ; màn cuối điện thoại hiển thị trọn ảnh. Nền là minh họa sáng tạo, không phải bản đồ hoặc phục dựng chính xác di tích.
- React: hooks trước các nhánh trả về; cấu hình ngoài component; chỉ nạp nền của trạm đang chọn; tái sử dụng renderer/cue; thuộc tính readOnly tùy chọn cho Stage3CheckIn, mặc định không đổi. Preview truyền readOnly để không ghi tiến trình kể cả đang có phiên học sinh.

## Giới hạn và sự cố công cụ

Chưa thử thiết bị iOS/Android vật lý, nghe qua loa thật, benchmark FPS/mạng chậm, đồng bộ tài khoản học sinh thật, toàn bộ test repository hoặc triển khai ai.studio. Không tuyên bố game đã được giáo viên duyệt nội dung mới.

Một lượt tự động 5 game vượt thời gian công cụ sau khi đã đến màn ôn lại; khôi phục từ trạng thái đang chơi rồi chia lượt ngắn hơn và đo lại đạt. Một tham chiếu khung cũ lúc chuyển đợt đã được sửa trong lệnh kiểm thử. Preview từ checkout có node_modules liên kết không khởi động được; chuyển đúng mã nguồn sang checkout có phụ thuộc đầy đủ, kiểm thử tại cùng URL quản lý. Các sự cố này không được tính là lượt game đạt trước khi xác minh lại.

## Đường dẫn duyệt

Thêm ?stage2-preview=<mã trạm> vào địa chỉ bản thử. Không cần Chặng 1. Các mã và tên theo thứ tự hiển thị chính thức, không suy số thứ tự từ hậu tố ID:

- Khối 4: g4-station-1; g4-station-3; g4-station-2; g4-thu-bon-hon-kem; g4-station-4.
- Khối 5: g5-ky-anh-me-nhu; g5-station-3; g5-station-4; g5-lua-ma-chau; g5-station-5.
