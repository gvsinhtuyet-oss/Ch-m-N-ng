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

## Chỉnh câu nối theo ảnh duyệt tiếp

Chỉ câu nối của khối 4/5 dùng lớp compact-match: thẻ gọn, chữ tối thiểu 14px trên điện thoại; vùng nút/phản hồi cố định, ẩn nút sau xác nhận; giữ nguyên ba đường nối và tăng thời gian đọc phản hồi (đúng 1,8s, sai 3,5s). Không đổi nội dung, hình nền, vật phẩm hay CSS của câu khác/khối 3.

Kiểm tra bổ sung: 40 bố cục trước xác nhận (10 trạm × 4 cỡ yêu cầu) không tràn chữ/nút; 5 phản hồi sai khối 4 và 5 phản hồi đúng khối 5 tại 320×640 hiện đầy đủ, giữ ba đường nối, nút xác nhận ẩn. Không tuyên bố đã thử cả đúng lẫn sai của mỗi trạm trong lần chỉnh này. Các luồng đầy đủ đã thử ở bản trước; chưa thử lại trên thiết bị vật lý.

### Phản hồi ảnh lỗi lần hai

Ảnh gửi tiếp vẫn có nút xác nhận cùng dòng gợi ý, khác với DOM bản sửa. Chưa xác minh được cache trên máy người dùng nên không khẳng định nguyên nhân. Bổ sung: loại nút xác nhận khỏi DOM sau khi chấm câu nối, không chỉ ẩn bằng CSS. Tạo một trang mở bản thử mới tại /api/stage2-match-review-v2.html (đường dẫn đã được PWA cũ loại khỏi navigation fallback); dùng chính HTML và module có hash của bản dựng hiện tại, không nhân bản trò chơi và không đăng ký thêm service worker. Không xóa cache dữ liệu học sinh.

Kiểm tra lại đúng trạm kinh tế ở 320×640: sau nối sai có 0 nút xác nhận trong DOM, đủ 3 đường nối, gợi ý nằm trong màn hình (mép dưới khoảng 598px), không tràn chữ. 41 kiểm thử, TypeScript, bản dựng đạt. Chưa xác minh trên trình duyệt/thiết bị của người dùng; trang riêng tư yêu cầu chủ sở hữu đăng nhập.

## Đưa toàn bộ câu hỏi lên gần tiêu đề

Theo yêu cầu tiếp theo: 50 câu khối 4/5 neo trên ngay dưới bảng tên thay vì căn giữa dọc. Trên điện thoại giảm khoảng dành cho HUD từ 84 xuống 66px, vẫn cách HUD; câu ảnh có đệm dưới cho nhãn A/B/C. Không đổi ảnh nền, dữ liệu, màn mở đầu, chiến thắng hay khối 3.

Đã đo lại 200 trường hợp (50 câu × 4 kích thước yêu cầu): khung panel không có cuộn nội bộ, nội dung chữ câu hỏi/lựa chọn không tràn. 20 trường hợp câu ảnh khối 4 ban đầu phát hiện nhãn A/B/C nhô ra gây thanh cuộn, đã thêm đệm và đo lại đạt; không tính lượt đầu lỗi là đạt. 5 phản hồi sai câu nối khối 5 tại 320×640 không cuộn, gợi ý kết thúc khoảng 560px. Một thao tác chờ chọn câu 5 báo timeout, quan sát lại xác nhận cả năm game đã sang câu 5 và đo hoàn tất. Chưa thử trên thiết bị vật lý hoặc trình duyệt của người dùng.

## Bản duyệt bố cục sát bảng tên (v3)

Thay vùng panel cuộn cũ bằng vùng chơi có vị trí trên/dưới rõ trong viewport cho 50 câu khối 4/5. Câu hỏi neo cách mép bảng tên 12px; điện thoại đưa HUD về hai góc với giới hạn 23vw mỗi bên. Ba hàng nối có chiều cao theo phần màn hình còn lại; chừa vùng xác nhận/phản hồi. Không đổi câu chữ, ảnh nền, âm thanh, phần thưởng, mở đầu/chiến thắng hoặc các trò đã duyệt khối 3.

Kiểm tra thực hiện bằng thao tác thật trên UI: 200 cấu hình (50 câu × 390×844, 375×667, 320×640, 1366×768) đều không tràn panel, không cắt phần tử câu hỏi/đáp án/nút và không tràn chữ. Khối 4 thử xác nhận nối sai ở 320×640: đủ gợi ý, mép dưới khoảng 501px, không tràn panel; khối 5 thử xác nhận đúng ở 1366×768: hiện phản hồi và không tràn. Chưa thử lại tất cả đúng/sai ở mọi kích thước hoặc trên thiết bị thật. Trang mới /api/stage2-title-fit-v3.html dùng cùng mã nguồn và tránh trang HTML cũ đã cache. Các bản trước đã báo đạt nhưng ảnh người dùng vẫn cho thấy cuộn; kết quả v3 chỉ khẳng định trong môi trường kiểm thử đã nêu, chưa xác minh trên máy người dùng.

## V4: đưa câu hỏi sát mép bảng tên thật

Ảnh giáo viên gửi cho thấy bảng tên và câu hỏi vẫn cách nhau đáng kể. Cách tính cũ lấy mốc 19,125% bề ngang ảnh, trong khi mép bảng gỗ của trạm Kinh tế ở khoảng 15,9% bề ngang ảnh. Đổi mốc lên 16,5% bề ngang thực tế của ảnh, cộng 5px; trên điện thoại dùng cùng tỉ lệ theo ảnh được hiển thị. Không sửa ảnh nguồn hoặc thay đổi nội dung các câu.

Đối chiếu trực quan trước/sau tại trạm Kinh tế: trên màn hình trình duyệt rộng 1363px, khoảng cách từ bảng gỗ đến câu hỏi giảm khoảng 58px xuống khoảng 15px. Đã nhìn trực quan câu 2 và câu 4 trên máy tính, câu 2 và câu 4 trong khung điện thoại 390×844. Đo câu 4 ở 320×640, 375×667, 390×844, 1366×768: nút xác nhận nằm trong viewport, khung không cuộn, chữ trong thẻ không tràn. Chưa kiểm tra thực tế trên thiết bị của giáo viên hoặc từng câu của 9 trạm còn lại sau thay đổi V4; các trạm dùng cùng bố cục và ảnh nền vẫn riêng biệt. Tạo link V4 riêng để giảm khả năng mở lại HTML cũ đã lưu.

## V5: nút xác nhận và âm thanh

Gỡ nền kéo dài của vùng controls, thu nút xác nhận theo chữ; đo trực tiếp ở 320×640, 375×667, 390×844, 1366×768 cho thấy nền controls trong suốt và rộng đúng bằng nút (khoảng 136 CSS px), nút nằm trong màn hình. Vị trí câu hỏi và ảnh nền giữ nguyên.

Phân tích âm thanh: bộ phát mặc định xếp các hiệu ứng nối tiếp; một lần chọn có thể nối select, right/wrong và key, nên nhiều lần chạm nhanh làm phản hồi bị chậm hoặc bị stop khi chuyển màn. Tiếng tổng hợp dự phòng có biên độ khoảng 0,03, nhỏ hơn đáng kể so với mẫu MP3 được chuẩn hóa. Không thể từ mã nguồn xác định chắc chắn nguyên nhân trên thiết bị của giáo viên hoặc loại trừ trạng thái tắt âm, chính sách trình duyệt hay loa.

Bổ sung chế độ phản hồi nhanh tùy chọn trong cùng SharedGameAudio dành riêng cho 10 game thử khối 4/5; chế độ mặc định của game khối 3 giữ cách hoạt động cũ. Với khối 4/5, âm mới ngắt hàng chờ cũ, lựa chọn câu phát trực tiếp đúng hoặc sai thay cho chuỗi select–kết quả–key; fallback tăng âm lượng, mẫu kết quả phát tối đa 0,8s và chỉ giảm cuối đoạn. Bấm thẻ nối, bắt đầu, xem lại, chơi lại, tiếp tục, nút bật/tắt đều có cue khi âm thanh đang bật; nút đang bị vô hiệu hóa hoặc âm đã tắt thì không phát. Mở lại âm thanh đồng bộ tùy chọn lưu giữa hai chế độ; bấm tắt có một tiếng ngắn trước khi tắt.

Đã kiểm tra tự động chế độ cũ vẫn tuần tự, chế độ mới ngắt hàng chờ và phát đúng/sai ngay, mẫu MP3 và âm dự phòng, tắt/bật và đồng bộ tùy chọn. Chromium đã bấm chuỗi chơi, chọn nối sai, xác nhận, bật/tắt và kiểm tra bố cục. Không kiểm tra được nghe thực tế qua loa, iOS/Android vật lý, hoặc chính thiết bị của giáo viên; browser Web Audio có thể bị hạn chế bởi chế độ im lặng/quyền hệ thống. Các trò đã duyệt chưa được cập nhật chính thức; PR vẫn nháp.

## Kích hoạt trò chơi chính thức

Theo yêu cầu phát hành, Stage2Challenge chọn đúng grade45SharedConfigs theo 10 mã và lớp tương ứng; các nhánh khối 1–3 giữ nguyên, mã trạm khác tiếp tục dùng xử lý cũ. SharedStage2 vẫn ghi hoàn thành Chặng 2 trước khi chuyển Chặng 3 với học sinh, không ghi khi chỉ xem.

Kiểm tra bằng UI ứng dụng thực, chế độ khách: hoàn thành 5 điểm Chặng 1 trạm Kinh tế khối 4 → mở game mới → đúng 5 câu → thắng 5/5 → tiếp tục → Chặng 2 được đánh dấu hoàn thành, mở đúng Chặng 3. Chơi lại vòng khác, nút chơi lại hoạt động. Kiểm tra trong ứng dụng ở màn hình 320×640: màn mở đầu, màn thắng và hai nút không bị thanh đầu trang che. Ứng dụng desktop: điều chỉnh chiều cao game theo vùng bài học, đưa khung về đầu sau chuyển chặng; trợ lý thu gọn khỏi nút game và vẫn mở được. Đo và quan sát vị trí trợ lý và nút chơi lại không chồng nhau.

Thêm kiểm tra bằng Stage2Challenge thực cho cả 10 mã trạm tại 320×640: cả 10 mở đúng tên game mới và có nút bắt đầu. Các tệp QA tạm đã được xóa, không đi vào bản phát hành. Chưa chơi lại toàn bộ 50 câu trong luồng ứng dụng chính ở 10 trạm, chưa thử loa thật hoặc thiết bị vật lý; kiểm thử trước đó đã chạy từng game trong môi trường thử. Xuất bản ai.studio phụ thuộc quy trình đồng bộ riêng, không thể suy ra từ việc GitHub đã gộp.

Kiểm tra bổ sung luồng ứng dụng 320×640: sau khi hoàn tất game Kinh tế, khung thắng nằm từ dưới thanh đầu trang đến cuối màn hình; hai nút nằm trong viewport, bảng tên không bị thanh đầu trang che. Biểu tượng trợ lý thu gọn và đặt trên thanh đầu trang điện thoại, tránh che nút; trên máy tính đặt ở giữa phía dưới và đã xác nhận không chồng nút chơi lại. Trợ lý vẫn mở được trong game trên máy tính. Chưa thử trợ lý trên điện thoại vật lý hoặc toàn bộ 10 trạm trong luồng học sinh chính thức.
