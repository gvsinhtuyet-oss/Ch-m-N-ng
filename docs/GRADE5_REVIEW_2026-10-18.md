# Khối 5 – hồ sơ rà soát 18/10/2026

Phiên bản `3.1.0-grade5-reviewed-media`. 5 trạm, 20 lời thuyết minh, 20 câu nhận biết và 25 câu vận dụng riêng. Mỗi câu có 3 phương án, một đáp án đúng; chặng 2 không lặp câu hỏi/đáp án đúng chặng 1. Các phương án được xáo trộn trong giao diện. 55 trang trình chiếu theo chủ đề.

Bản biên soạn đối chiếu nguồn, chưa thay phê duyệt chuyên môn. Giữ IN_REVIEW, isFullyVerified:false; chờ kế hoạch tích hợp mới, không tự gắn tuần hoặc bài SGK.

## Những chỉnh sửa chính

- Sông Thu Bồn: bổ sung ảnh Duy Xuyên năm 2018 có giàn lưới; không suy an toàn bơi, độ sâu hay sinh kế của mọi gia đình từ một ảnh.
- Mẹ Nhu và Mẹ Nguyễn Thị Thứ: tách nhân vật, mốc 26/12/1968 khỏi Cách mạng tháng Tám 1945; không sáng tác trích dẫn. Ảnh hầm mô phỏng không coi là hầm nguyên trạng. Không biến số người thân hi sinh thành câu thi đua.
- Tượng Mẹ Thứ năm 2011 tại Hà Nội chuyển sang điểm phân biệt loại tư liệu tri ân; điểm tìm hiểu mẹ dẫn ảnh tư liệu Đợi con về của Trần Hồng, không dùng tượng thay chân dung sống.
- Bà Nà: phân biệt cảnh núi rừng và công trình du lịch; “bốn mùa” là lời gợi tả thời tiết, không bốn mùa khí hậu trong 24 giờ.
- Hải Vân Quan: nói rõ công trình phòng thủ thời Minh Mạng năm 1826, không khẳng định thời điểm sớm nhất có cửa ải. Không hỏi hướng hai dòng chữ trên cổng vì các bài nguồn còn mô tả khác nhau.
- Ảnh Hải Vân Quan năm 2024 chỉ là một góc công trình trong khu di tích sau tu bổ, không gọi là ảnh cận chữ cổng. Ảnh 2007 vẫn là tư liệu trước tu bổ để so sánh; không đổi ngày thành hiện nay.
- Ngũ Hành Sơn: ma nhai là di sản tư liệu, ghi danh MOWCAP khu vực châu Á – Thái Bình Dương năm 2022; không gọi toàn danh thắng là Di sản thế giới UNESCO. Không dùng số lượng ma nhai khi các nguồn thống kê khác nhau.
- Sâm: ảnh cây ở Măng Ri là tham khảo ngoài Đà Nẵng; ảnh Trà Linh tại nguồn chuyên môn là tư liệu địa phương riêng. Không dạy nhận biết thật/giả hoặc dùng cây từ kết quả trò chơi. Không công dụng chữa bệnh, liều dùng, giá bán.

## Ảnh, quyền sử dụng và dung lượng

9 vị trí ảnh thật cục bộ, gồm 2 vị trí dùng lại ảnh Thu Bồn mới, 1 ảnh Hải Vân Quan mới và 6 vị trí dùng ảnh đã có. Hai file mới tổng 437.872 byte (~428 KiB), ảnh WebP tĩnh trong Git/PWA cache; không phải dữ liệu ảnh trong Firestore.

11 điểm dùng sơ đồ minh họa kèm liên kết đến ảnh tại trang nguồn. Những ảnh chưa có phép sao chép không được nhúng, tự tải hoặc lưu lại. Bộ ảnh không phải 20 ảnh thật ngoại tuyến. Các ảnh có giấy phép riêng hiển thị tác giả, ngày, nguồn và giấy phép trong màn hình học và trình chiếu.

Sau kiểm tra trực quan, không chọn ảnh số 01 của bộ Hải Vân Quan 2024 vì góc cũ/bảng và xe không phù hợp điểm chính. Chọn ảnh số 22 ghi nhận một công trình trong khu di tích; không nhầm với ảnh cổng. Không tạo hoặc phục dựng địa điểm/nhân vật bằng AI.

### Ảnh mới có giấy phép riêng

- thu-bon-2018: Sông Thu Bồn và các giàn lưới nhìn từ một cây cầu ở vùng Duy Xuyên, ảnh năm 2018. Tên huyện/tỉnh trong hồ sơ gốc thuộc thời điểm chụp; không dùng ảnh xác định độ sâu, chất lượng nước hay an toàn bơi.
  - Tác giả: Christophe95; 28/07/2018; CC BY-SA 4.0
  - Nguồn: https://commons.wikimedia.org/wiki/File:Thu_Bon_River_in_the_Duy_Xuy%C3%AAn_District.jpg
  - Giấy phép: https://creativecommons.org/licenses/by-sa/4.0/
  - Thay đổi: Thu nhỏ, xoay theo EXIF và nén WebP; giữ bố cục, không tạo hoặc xóa chi tiết.
- hai-van-2024: Một góc công trình trong khu di tích Hải Vân Quan, chụp ngày 01/08/2024 sau đợt tu bổ; không phải ảnh cận cảnh chữ trên cổng. Ảnh tư liệu theo thời điểm, không thay thông báo tham quan hiện hành.
  - Tác giả: Chainwit.; 01/08/2024; CC BY 4.0
  - Nguồn: https://commons.wikimedia.org/wiki/File:Fortress_on_top_of_the_Hai_Van_Pass_-_H%E1%BA%A3i_V%C3%A2n_Quan_%282024%29_-_img_22.jpg
  - Giấy phép: https://creativecommons.org/licenses/by/4.0/
  - Thay đổi: Thu nhỏ, xoay theo EXIF và nén WebP; giữ bố cục, không tạo hoặc xóa chi tiết.

### Ảnh chọn để mở tại nguồn

| Điểm | Tư liệu đã chọn | Phạm vi |
|---|---|---|
| g5-station-1, điểm 4 | [Hành động giữ môi trường tại địa phương](https://thanhdoandanang.org.vn/news/sac-mau-co-so/tuoi-tre-xa-phuoc-tra-phoi-hop-ra-quan-huong-ung-ngay-moi-truong-the-gioi-763.html) – Trang không ghi riêng tác giả ảnh; Hoạt động ngày 06/06/2026 | Ảnh hoạt động ra quân vệ sinh môi trường tại xã Phước Trà; minh họa hoạt động cộng đồng có tổ chức. Không gọi đây là ảnh vớt rác trên sông Thu Bồn; học sinh tham gia việc vừa sức dưới sự hướng dẫn. |
| g5-station-2, điểm 1 | [Tư liệu tại di tích Địa điểm nhà Mẹ Nhu](https://baodanang.vn/di-tich-dia-diem-nha-me-nhu-3196770.html) – Ảnh H.L; bài Huỳnh Lê; Bài tháng 03/2024; không ghi ngày chụp ảnh | Ảnh căn hầm mô phỏng tại di tích, chú thích rõ mô phỏng; không giới thiệu là ảnh chụp trận chiến. Ảnh di tích và mô phỏng phục vụ tìm hiểu; không coi mô phỏng là căn hầm nguyên trạng năm 1968. Không dùng biến thể tên mẹ làm câu hỏi bắt buộc. |
| g5-station-2, điểm 2 | [Di tích gợi nhớ sự kiện Thanh Khê năm 1968](https://baodanang.vn/di-tich-dia-diem-nha-me-nhu-3196770.html) – Ảnh H.L; bài Huỳnh Lê; Bài tháng 03/2024; không ghi ngày chụp ảnh | Xem ảnh căn hầm mô phỏng cùng phần bài viết về sự kiện ngày 26/12/1968; phân biệt ảnh di tích với ảnh lịch sử trận đánh. Ảnh di tích và mô phỏng phục vụ tìm hiểu; không coi mô phỏng là căn hầm nguyên trạng năm 1968. Không dùng biến thể tên mẹ làm câu hỏi bắt buộc. |
| g5-station-2, điểm 3 | [Mẹ Nguyễn Thị Thứ trong ảnh tư liệu](https://baodanang.vn/dai-ta-tran-hong-va-hai-buc-chan-dung-dac-biet-3299045.html) – Ảnh Đợi con về: Trần Hồng; bài An Ca; Ảnh năm 2001; bài 10/08/2025 | Chọn ảnh Đợi con về có chú thích và tác giả riêng; không dùng ảnh triển lãm thay ảnh mẹ. Chỉ tìm hiểu nhân vật và tình cảm gia đình; không thi đua kể đau thương, không trích lời không kiểm chứng. Bài có số liệu người thân khác một số nguồn nên không dùng làm đáp án số lượng. |
| g5-station-3, điểm 4 | [Tham quan Hải Vân Quan sau tu bổ](https://baotangdanang.vn/hai-van-quan-mo-cua-don-khach-tham-quan) – Bài Khánh Ly; không ghi riêng tác giả ảnh; 06/08/2024 | Ảnh có chú thích khách tham quan sau khi mở cửa ngày 01/08/2024. Thông tin miễn phí trong bài thuộc năm 2024, không dùng thành thông tin giá vé hiện nay. |
| g5-station-4, điểm 2 | [Hang động và chùa ở Ngũ Hành Sơn](https://danangfantasticity.com/en/tin-tuc/da-nang-diem-hen-dien-anh-chau-a-2025-va-hanh-trinh-kham-pha-thanh-pho-bien) – Không ghi riêng tác giả tại ảnh; Bài giới thiệu năm 2025; không ghi ngày chụp | Ảnh Ngũ Hành Sơn trong phần giới thiệu điểm đến; đọc phần mô tả động Huyền Không và các chùa. Ảnh bối cảnh danh thắng, không mặc định ảnh góc rộng nhận diện chính xác từng chùa/hang động nếu chưa có chú thích riêng. |
| g5-station-4, điểm 3 | [Ma nhai tại Ngũ Hành Sơn](https://danangfantasticity.com/en/di-san-unesco-vi/bia-ma-nhai-tai-danh-thang-ngu-hanh-son) – Ảnh có ghi Minh Trí trong bài; từng ảnh khác đọc theo chú thích; Không ghi ngày chụp | Ảnh ma nhai có chú thích riêng, ưu tiên ảnh cuối bài ghi tác giả Minh Trí; đối chiếu hồ sơ MOWCAP 2022. Không suy nội dung bản dịch từ hình chữ; không dùng số lượng văn khắc ở các nguồn làm câu hỏi bắt buộc. |
| g5-station-4, điểm 4 | [Sản phẩm làng đá mỹ nghệ Non Nước](https://danangfantasticity.com/en/lang-da-my-nghe-non-nuoc) – Không ghi riêng tác giả ảnh; Bài giới thiệu năm 2015; không ghi ngày chụp | Ảnh sản phẩm và không gian làng đá trong bài giới thiệu Non Nước. Ảnh sản phẩm không xác nhận nguyên liệu khai thác ngay ở núi di tích; không tự gán tên nghệ nhân cho người trong ảnh. |
| g5-station-5, điểm 2 | [Vùng trồng sâm ở Trà Linh](https://samngoclinh.danang.gov.vn/bi-thu-thanh-uy-le-ngoc-quang-tham-khao-sat-vung-trong-sam-ngoc-linh-tai-xa-tra-linh-188.html) – Bài đăng lại thông tin thành phố; không ghi riêng tác giả ảnh; 13/05/2026 | Ảnh đoàn khảo sát vùng trồng sâm tại Trà Linh; đọc theo chú thích trong bài, không đổi ảnh Măng Ri thành ảnh tại đây. Không công khai thêm vị trí chi tiết cây ngoài tự nhiên; không dùng ảnh để xác thực sản phẩm hoặc hướng dẫn sử dụng. |
| g5-station-5, điểm 4 | [Tìm hiểu vườn sâm theo người phụ trách](https://samngoclinh.danang.gov.vn/bi-thu-thanh-uy-le-ngoc-quang-tham-khao-sat-vung-trong-sam-ngoc-linh-tai-xa-tra-linh-188.html) – Bài đăng lại thông tin thành phố; không ghi riêng tác giả ảnh; 13/05/2026 | Ảnh khảo sát vùng trồng sâm cùng người phụ trách; minh họa việc tìm hiểu có tổ chức, không phải lời mời tự vào vườn. Không công khai thêm vị trí chi tiết cây ngoài tự nhiên; không dùng ảnh để xác thực sản phẩm hoặc hướng dẫn sử dụng. |
| g5-station-5, điểm 3 | [Gìn giữ vườn bảo tồn sâm Ngọc Linh](https://samngoclinh.danang.gov.vn/cong-tac-tuan-tra-bao-ve-vuon-bao-ton-sam-ngoc-linh-174.html) – Bài Nguyễn Cảnh Cường – Phòng Kỹ thuật; không ghi riêng tác giả ảnh; 09/02/2026 | Ảnh ghép vườn bảo tồn lúc chiều tối, đọc cùng bài về công tác bảo vệ; không gọi ảnh vườn là ảnh chân dung cán bộ. Chỉ học mối liên hệ giữ nguồn giống và môi trường rừng, không dạy cách tiếp cận hệ thống an ninh của vườn. |

## Sửa lỗi nghe và hiển thị

- Chỉ chọn giọng có mã ngôn ngữ phù hợp; không tự dùng giọng Anh để đọc tiếng Việt hoặc ngược lại. Khi thiếu giọng, thông báo đọc lời thuyết minh/nhờ giáo viên hỗ trợ.
- Tắt âm, thiếu API, thiếu giọng hoặc lỗi phát không được đánh dấu “đã nghe”.
- Hủy bộ hẹn giờ và listener chờ giọng khi dừng/chuyển điểm; bỏ qua callback của câu đọc cũ; dừng khi rời chặng.
- Khối 5 dùng ảnh không cắt trên màn hình chính và ảnh phóng lớn; khi lỗi tải, hiển thị chưa tải được ảnh thay vì chuyển sang ảnh khác địa điểm.
- Đây là xử lí độ tin cậy của chức năng đọc theo thiết bị; chưa có bộ MP3 cố định hoặc một giọng đọc giống nhau trên mọi máy.
- Căn cứ API: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/error_event ; https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices .

## Dữ liệu và hồi quy

- Giữ ID trạm, điểm, vật phẩm, con dấu và bản đồ; không đặt lại tiến độ.
- Chỉ thay trường nội dung đúng nguyên bản cũ ở phiên bản 3.0.0; giữ ảnh, lời riêng, câu hỏi, ghi nhớ, bản đồ và tài nguyên giáo viên đã sửa. Tương thích trong bộ nhớ, không ghi trả kho dữ liệu.
- Khối 4 giữ nguyên nội dung đã duyệt lượt trước; không sửa học liệu khối 1–3. Các sửa AudioService là dùng chung và được kiểm tra riêng.
- Không đổi collection, không migration, không thêm truy vấn/listener Firestore. Kiểm thử bằng API giả lập và chặn mạng ngoài.
- Cập nhật Git không đồng nghĩa bản AI Studio đang chạy đã được triển khai.

## Nội dung từng lời học, câu hỏi, đáp án

### g5-station-1 – Dòng sông nối những câu chuyện quê hương

Nguồn đối chiếu:
- https://cttdt.danangportal.gov.vn/vi/web/dng/w/hon-kem-i
- https://danang.gov.vn/vi/web/dng/w/ve-nong-son-tha-minh-giua-thien-nhien
- https://hdnd.danang.gov.vn/chi-tiet-tin/group/157/nid/23688/ngay-moi-truong-the-gioi-5-6-chung-tay-hanh-dong-vi-da-nang-xanh-va-phat-trien-ben-vung

**Điểm 1: Theo dòng Thu Bồn**

Em hãy quan sát dòng Thu Bồn trong ảnh chụp ở vùng Duy Xuyên năm 2018: mặt sông, bờ cây và những giàn lưới gợi ra một không gian sống ven sông. Đây chỉ là một đoạn sông ở một thời điểm. Muốn tìm vị trí và hướng chảy, em cần bản đồ có nguồn, hướng và chú giải. Sơ đồ tổng kết trong app giúp nhớ ý bài, không thay bản đồ địa lí.

Ghi nhớ/giải thích: Bản đồ có tên sông, chú giải và nguồn.

Câu hỏi: Muốn tìm vị trí dòng Thu Bồn, tài liệu nào đủ căn cứ hơn?
- Bản đồ có tên sông, chú giải và nguồn
- Sơ đồ trang trí chỉ có một đường màu xanh
- Ảnh mặt nước không ghi địa điểm

Đáp án: Bản đồ có tên sông, chú giải và nguồn

**Điểm 2: Hòn Kẽm Đá Dừng bên sông**

Hòn Kẽm Đá Dừng là cảnh quan nổi bật bên dòng Thu Bồn, với núi đá và vách đá soi xuống mặt nước. Em thử mô tả bằng những chi tiết nhìn thấy: hình dáng sườn núi, dòng sông và cây xanh. Tên địa danh còn đi vào lời ca dân gian của đất Quảng. Khi giới thiệu, hãy phân biệt cảnh quan quan sát được với chuyện kể truyền miệng; lời ca không tự trở thành kết luận về quá trình hình thành đá.

Ghi nhớ/giải thích: Núi đá, vách đá bên dòng sông.

Câu hỏi: Nét cảnh quan nào làm Hòn Kẽm Đá Dừng nổi bật bên Thu Bồn?
- Núi đá, vách đá bên dòng sông
- Bãi cát và những đụn cát ven biển
- Công trình cửa ải trên đỉnh đèo

Đáp án: Núi đá, vách đá bên dòng sông

**Điểm 3: Dòng sông trong đời sống**

Dòng Thu Bồn gắn với việc đi lại, nguồn nước và sinh kế của cư dân ven sông qua nhiều thời kì. Trong ảnh Duy Xuyên, em thấy các giàn lưới bên mặt nước: đó là một dấu hiệu về hoạt động của con người. Tuy nhiên, không thể từ ảnh này kết luận mọi gia đình đều làm nghề đánh cá. Cũng không thể nhìn màu nước rồi biết chắc độ sâu hay nơi nào an toàn để bơi.

Ghi nhớ/giải thích: Dòng sông gắn với sinh kế và hoạt động lao động ven bờ.

Câu hỏi: Những giàn lưới trong ảnh gợi mối liên hệ nào của sông với cư dân?
- Sinh kế và hoạt động lao động ven sông
- Chỉ dùng để trang trí cảnh quan du lịch
- Một công trình phòng thủ được xây trên sông

Đáp án: Sinh kế và hoạt động lao động ven sông

**Điểm 4: Giữ nước, giữ cảnh quan**

Một dòng sông sạch mang lại lợi ích cho nhiều người ở ven bờ và phía hạ lưu. Rác và nước thải chưa xử lí có thể làm hại môi trường nước. Em góp phần bằng cách tiết kiệm nước, giảm rác và giữ sạch nơi sống. Khi tham quan, đi cùng người phụ trách và làm theo hướng dẫn an toàn trên phương tiện. Nếu thấy người gặp nguy hiểm dưới nước, gọi ngay người lớn hoặc cứu hộ, không tự lao xuống.

Ghi nhớ/giải thích: Gọi người lớn hoặc cứu hộ và không tự lao xuống.

Câu hỏi: Nếu thấy người gặp nguy hiểm dưới nước, học sinh cần làm gì trước?
- Gọi người lớn hoặc cứu hộ và không tự lao xuống
- Tự xuống nước ngay để đưa người lên
- Tự chèo thuyền ra dù chưa được hướng dẫn

Đáp án: Gọi người lớn hoặc cứu hộ và không tự lao xuống

**Chặng 2 – nhiệm vụ vận dụng riêng**

1. Nhóm phỏng vấn hai hộ ven sông: một hộ làm nghề cá, một hộ bán hàng. Kết luận nào phù hợp với cuộc tìm hiểu?
- Hai hộ có công việc khác nhau; cần ghi rõ phạm vi đã khảo sát
- Mọi hộ ven sông đều bán hàng
- Một hộ làm nghề cá đủ đại diện toàn bộ cư dân

Đáp án: Hai hộ có công việc khác nhau; cần ghi rõ phạm vi đã khảo sát. Gợi ý: Từ hai trường hợp, chỉ kết luận trong phạm vi đã tìm hiểu; không suy rộng ra toàn bộ cộng đồng.

2. Một đoạn kể về cảnh sông có cả lời ca dân gian và kết quả quan sát thực địa. Nhóm nên sắp nội dung ra sao?
- Ghi riêng lời ca và phần quan sát, nêu nguồn cho mỗi phần
- Dùng lời ca thay cho mọi kết quả quan sát
- Xóa phần khác ý kiến của nhóm

Đáp án: Ghi riêng lời ca và phần quan sát, nêu nguồn cho mỗi phần. Gợi ý: Lời ca và quan sát là hai loại tư liệu; mỗi loại có vai trò riêng khi giới thiệu cảnh quan.

3. Đi thuyền, bạn tháo áo phao để chụp ảnh. Em chọn gì?
- Nhắc bạn làm theo hướng dẫn an toàn của người phụ trách
- Đợi tới giữa dòng rồi tháo cùng
- Giữ áo giúp bạn để chụp đẹp

Đáp án: Nhắc bạn làm theo hướng dẫn an toàn của người phụ trách. Gợi ý: Không đánh đổi an toàn lấy một bức ảnh.

4. Lớp muốn góp phần giữ dòng sông sạch. Kế hoạch nào phù hợp?
- Giảm rác ở trường, tuyên truyền và hoạt động có người lớn tổ chức an toàn
- Tự xuống nước vớt rác
- Tự xử lí một nguồn xả thải chưa rõ

Đáp án: Giảm rác ở trường, tuyên truyền và hoạt động có người lớn tổ chức an toàn. Gợi ý: Việc có ích phải vừa sức và an toàn.

5. Nhóm làm thông điệp giữ sông sạch nhưng chỉ viết khẩu hiệu. Bổ sung nào khiến kế hoạch thực hiện được?
- Việc cụ thể, người phụ trách và cách theo dõi kết quả
- Thêm nhiều lời hứa nhưng không chia việc
- Chỉ tăng cỡ chữ của khẩu hiệu

Đáp án: Việc cụ thể, người phụ trách và cách theo dõi kết quả. Gợi ý: Một kế hoạch cần hành động, trách nhiệm và cách xem kết quả; khẩu hiệu riêng lẻ chưa đủ.

**Chặng 3:** cảm xúc tự chọn, không chấm đúng/sai. Việc làm: Em ghi nguồn khi giới thiệu cảnh sông.; Em không xả rác và tiết kiệm nước.; Em tuân thủ hướng dẫn khi tham quan.

**Chặng 4:** sơ đồ học tập mới, không phải bản đồ địa lí; con dấu “Người bạn của dòng sông”.

### g5-station-2 – Nhớ người đi trước, quý cuộc sống hòa bình

Nguồn đối chiếu:
- https://baodanang.vn/di-tich-dia-diem-nha-me-nhu-3196770.html
- https://cttdt.danangportal.gov.vn/vi/w/le-thi-danh-1968-i
- https://baochinhphu.vn/ky-niem-120-nam-ngay-sinh-me-viet-nam-anh-hung-nguyen-thi-thu-102240727212121574.htm
- https://baodanang.vn/dai-ta-tran-hong-va-hai-buc-chan-dung-dac-biet-3299045.html

**Điểm 1: Mẹ Nhu – người mẹ chở che**

Ở Thanh Khê, Mẹ Nhu được ghi nhớ vì đã che chở, nuôi giấu các chiến sĩ biệt động trong kháng chiến chống Mỹ. Gia đình mẹ có hầm bí mật để bảo vệ chiến sĩ. Di tích Địa điểm nhà Mẹ Nhu giúp thế hệ sau tìm hiểu câu chuyện ấy. Khi xem tư liệu, em phân biệt di ảnh, hiện vật và căn hầm mô phỏng. Lòng dũng cảm của mẹ được hiểu từ việc làm có nguồn, không cần sáng tác lời thoại cho nhân vật.

Ghi nhớ/giải thích: Nuôi giấu, bảo vệ chiến sĩ biệt động.

Câu hỏi: Việc làm nào thể hiện sự chở che của Mẹ Nhu?
- Nuôi giấu, bảo vệ chiến sĩ biệt động
- Tổ chức khôi phục di tích sau năm 2000
- Viết tài liệu nghiên cứu về làng nghề

Đáp án: Nuôi giấu, bảo vệ chiến sĩ biệt động

**Điểm 2: Sự kiện Thanh Khê năm 1968**

Ngày 26 tháng 12 năm 1968 gắn với sự hi sinh của Mẹ Nhu và cuộc chiến đấu của bảy chiến sĩ biệt động Thanh Khê. Mốc này thuộc kháng chiến chống Mỹ, khác thời điểm Cách mạng tháng Tám năm 1945. Đặt hai mốc trên dòng thời gian giúp em thấy chúng cách nhau nhiều năm. Có thể liên hệ truyền thống yêu nước, nhưng không gộp hai sự kiện thành một hoặc chuyển chiến công năm 1968 sang năm 1945.

Ghi nhớ/giải thích: Ngày 26 tháng 12 năm 1968.

Câu hỏi: Sự kiện Mẹ Nhu và bảy dũng sĩ Thanh Khê gắn với mốc nào?
- Ngày 26 tháng 12 năm 1968
- Cách mạng tháng Tám năm 1945
- Ngày giải phóng Đà Nẵng năm 1975

Đáp án: Ngày 26 tháng 12 năm 1968

**Điểm 3: Mẹ Nguyễn Thị Thứ**

Mẹ Nguyễn Thị Thứ là Bà mẹ Việt Nam anh hùng quê vùng Điện Bàn, đất Quảng. Mẹ đã chịu nhiều mất mát khi các con và người thân hi sinh trong những cuộc kháng chiến. Mẹ Nguyễn Thị Thứ và Mẹ Nhu là hai người khác nhau, có cuộc đời và tư liệu riêng. Em tìm hiểu bằng tên nhân vật, hoàn cảnh lịch sử và nguồn ghi chép; từ đó trân trọng sự hi sinh của thế hệ trước và cuộc sống hòa bình hôm nay.

Ghi nhớ/giải thích: Hai người khác nhau, có cuộc đời và tư liệu riêng.

Câu hỏi: Cần giới thiệu Mẹ Nhu và Mẹ Nguyễn Thị Thứ như thế nào?
- Hai người khác nhau, có cuộc đời và tư liệu riêng
- Một người có hai tên gọi trong cùng một sự kiện
- Hai nhân vật có thể dùng thay ảnh và tiểu sử cho nhau

Đáp án: Hai người khác nhau, có cuộc đời và tư liệu riêng

**Điểm 4: Tri ân bằng hiểu biết và việc làm**

Ảnh trước mặt là tượng bán thân Mẹ Nguyễn Thị Thứ, chụp tại khuôn viên bảo tàng quân sự ở Hà Nội năm 2011. Đây không phải ảnh mẹ lúc còn sống và cũng không phải ảnh nhà lưu niệm ở Điện Bàn. Tượng và nơi lưu niệm giúp chúng ta tưởng nhớ theo những cách khác nhau. Em có thể viết lời tri ân bằng lời của mình, giữ trang nghiêm nơi tưởng niệm và làm việc có ích theo hướng dẫn.

Ghi nhớ/giải thích: Tượng Mẹ Nguyễn Thị Thứ chụp ở Hà Nội năm 2011.

Câu hỏi: Chú thích nào đúng cho ảnh tượng bán thân trong bài?
- Tượng Mẹ Nguyễn Thị Thứ chụp ở Hà Nội năm 2011
- Ảnh Mẹ Nguyễn Thị Thứ lúc còn sống tại Điện Bàn
- Ảnh chụp cuộc chiến đấu của các chiến sĩ Thanh Khê

Đáp án: Tượng Mẹ Nguyễn Thị Thứ chụp ở Hà Nội năm 2011

**Chặng 2 – nhiệm vụ vận dụng riêng**

1. Hai tư liệu về một hoạt động tri ân ghi ngày khác nhau. Nhóm nên làm gì trước khi đưa lên bài?
- Đối chiếu bản gốc và hỏi người phụ trách để xác định đúng
- Chọn ngày nào nhìn đẹp hơn
- Đổi cả hai thành ngày hôm nay

Đáp án: Đối chiếu bản gốc và hỏi người phụ trách để xác định đúng. Gợi ý: Khi nguồn chưa thống nhất, cần xác minh thay vì tự chọn một mốc cho thuận tiện.

2. Nhóm chọn nhạc vui nhộn và hiệu ứng gây cười cho phần tri ân các mẹ. Em đề xuất gì?
- Chọn cách thể hiện trang trọng, phù hợp mục đích tưởng nhớ
- Càng gây cười càng thể hiện lòng biết ơn
- Chỉ cần nhiều hiệu ứng, không cần xét nội dung

Đáp án: Chọn cách thể hiện trang trọng, phù hợp mục đích tưởng nhớ. Gợi ý: Hình thức trình bày phải phù hợp nội dung lịch sử và sự tôn trọng người được tưởng nhớ.

3. Bạn tự viết một câu cảm động rồi đặt trong ngoặc kép như lời mẹ từng nói. Em đề nghị gì?
- Đổi thành lời cảm nghĩ của học sinh, không gán cho nhân vật
- Thêm một năm bất kì để giống tư liệu
- Giữ vì câu nghe rất hay

Đáp án: Đổi thành lời cảm nghĩ của học sinh, không gán cho nhân vật. Gợi ý: Không sáng tác trích dẫn lịch sử.

4. Bạn chép nguyên một bài viết về các mẹ rồi ghi tên mình là tác giả. Cần sửa thế nào?
- Viết lại bằng lời của mình, dẫn nguồn và chỉ trích ngắn khi cần
- Chỉ đổi vài dấu câu rồi giữ tên mình
- Xóa tên tác giả gốc để bài ngắn hơn

Đáp án: Viết lại bằng lời của mình, dẫn nguồn và chỉ trích ngắn khi cần. Gợi ý: Tôn trọng tư liệu lịch sử bao gồm ghi nhận tác giả và phân biệt lời mình với phần trích dẫn.

5. Lớp xây hoạt động tri ân. Cách nào vừa phù hợp vừa tôn trọng?
- Tìm hiểu tư liệu, viết lời cảm nghĩ và làm việc có ích theo hướng dẫn
- Thi xem ai kể chuyện đau buồn nhất
- Bắt mọi bạn phải nói mình xúc động giống nhau

Đáp án: Tìm hiểu tư liệu, viết lời cảm nghĩ và làm việc có ích theo hướng dẫn. Gợi ý: Tri ân không cần thi đua nỗi buồn hay ép cảm xúc.

**Chặng 3:** cảm xúc tự chọn, không chấm đúng/sai. Việc làm: Em viết lời tri ân bằng lời của mình.; Em giữ trang nghiêm nơi tưởng niệm.; Em kiểm tra nhân vật và mốc sự kiện.

**Chặng 4:** sơ đồ học tập mới, không phải bản đồ địa lí; con dấu “Người giữ lời tri ân”.

### g5-station-3 – Giữa núi rừng và cửa ải

Nguồn đối chiếu:
- https://danang.gov.vn/web/dng/-/khu-du-lich-ba-na-hills-i
- https://baotangdanang.vn/hai-van-quan-mo-cua-don-khach-tham-quan
- https://vietnam.vnanet.vn/vietnamese/long-form/hai-van-quan-cua-ai-hiem-yeu-tren-con-duong-thien-li-bac-nam-xua-374910.html

**Điểm 1: Bà Nà – cảnh núi rừng**

Bà Nà có cảnh quan núi rừng và là nơi có hoạt động tham quan, nghỉ dưỡng. Ảnh Bà Nà Hills cho thấy cả công trình du lịch do con người xây dựng; không nên gọi mọi chi tiết trong ảnh là cảnh tự nhiên. Câu nói “bốn mùa trong một ngày” gợi cảm nhận thời tiết thay đổi, không có nghĩa một ngày trải qua bốn mùa khí hậu thực sự. Em hãy phân biệt vẻ đẹp cảnh quan, công trình và thông tin thời tiết.

Ghi nhớ/giải thích: Lời gợi tả cảm nhận thời tiết thay đổi.

Câu hỏi: Câu “bốn mùa trong một ngày” ở Bà Nà nên được hiểu thế nào?
- Lời gợi tả cảm nhận thời tiết thay đổi
- Bốn mùa khí hậu lần lượt diễn ra trọn vẹn trong một ngày
- Căn cứ chắc chắn để dự báo thời tiết mọi chuyến đi

Đáp án: Lời gợi tả cảm nhận thời tiết thay đổi

**Điểm 2: Hải Vân Quan trên đỉnh đèo**

Hải Vân Quan nằm trên đỉnh đèo Hải Vân. Dưới thời Nguyễn, năm 1826, vua Minh Mạng cho xây dựng công trình phòng thủ tại đây để kiểm soát vị trí quan trọng trên tuyến đi lại Bắc – Nam. Đèo là dạng địa hình và tuyến đường; cửa ải là công trình lịch sử trên đèo. Ảnh cho thấy một góc công trình trong khu di tích, chụp ngày 1 tháng 8 năm 2024, khi di tích mở cửa trở lại sau đợt tu bổ. Nó không thay thông báo tham quan hiện hành.

Ghi nhớ/giải thích: Đèo là dạng địa hình, còn cửa ải là công trình trên đèo.

Câu hỏi: Đèo Hải Vân và Hải Vân Quan khác nhau ở điểm nào?
- Đèo là dạng địa hình, còn cửa ải là công trình trên đèo
- Cả hai đều chỉ là tên gọi của một công trình du lịch
- Cửa ải là tên một khu rừng, còn đèo là tên một bảo tàng

Đáp án: Đèo là dạng địa hình, còn cửa ải là công trình trên đèo

**Điểm 3: Hai nơi, nhiều giá trị**

Bà Nà và Hải Vân Quan đều giúp em khám phá không gian núi, nhưng không có cùng câu chuyện. Bà Nà gợi tìm hiểu cảnh quan và hoạt động du lịch; Hải Vân Quan còn mang dấu ấn phòng thủ thời Nguyễn. Ảnh cửa ải năm 2007 là tư liệu trước đợt tu bổ gần đây. So sánh với ảnh năm 2024 cần giữ đúng chú thích thời gian, không gọi ảnh cũ là cảnh hôm nay và không coi tu bổ là xây một khu vui chơi mới.

Ghi nhớ/giải thích: Kiểm soát vị trí quan trọng và phòng thủ.

Câu hỏi: Giá trị nào gắn trực tiếp với Hải Vân Quan thời Nguyễn?
- Kiểm soát vị trí quan trọng và phòng thủ
- Giới thiệu sản phẩm tơ lụa của làng nghề
- Bảo tồn một loài cây dưới tán rừng

Đáp án: Kiểm soát vị trí quan trọng và phòng thủ

**Điểm 4: Tham quan để hiểu và gìn giữ**

Tham quan có trách nhiệm là vừa tìm hiểu vừa góp phần gìn giữ điểm đến. Em cùng người phụ trách xem thông báo, lối đi và điều kiện tiếp cận trước chuyến đi. Tại di tích, không trèo lên tường hoặc làm hỏng công trình; trong cảnh quan núi rừng, không bẻ cây hay bỏ rác. Sau chuyến khám phá, em chọn một điều đã có căn cứ và một câu hỏi muốn tìm hiểu thêm để chia sẻ với lớp.

Ghi nhớ/giải thích: Đi theo lối cho phép, không trèo lên tường di tích.

Câu hỏi: Cách nào thể hiện tham quan có trách nhiệm tại di tích?
- Đi theo lối cho phép, không trèo lên tường di tích
- Tự mở lối tắt qua khu vực đang bảo tồn
- Đứng lên tường để quan sát rõ hơn

Đáp án: Đi theo lối cho phép, không trèo lên tường di tích

**Chặng 2 – nhiệm vụ vận dụng riêng**

1. Nhóm ghi ảnh một cây cầu du lịch là “cảnh tự nhiên hoàn toàn”. Nên sửa gì?
- Phân biệt công trình xây dựng với cảnh núi rừng xung quanh
- Giữ nguyên vì cầu ở trên núi
- Đổi tên mọi công trình thành rừng

Đáp án: Phân biệt công trình xây dựng với cảnh núi rừng xung quanh. Gợi ý: Địa điểm tự nhiên có thể chứa công trình do con người tạo dựng.

2. Nhóm chuẩn bị chuyến tìm hiểu có bạn khó di chuyển. Cách chọn lịch trình nào phù hợp?
- Hỏi nhu cầu, kiểm tra khả năng tiếp cận và điều chỉnh cùng người phụ trách
- Mặc định bạn ở lại để nhóm đi nhanh
- Chỉ chọn nơi xa nhất vì khó mới thú vị

Đáp án: Hỏi nhu cầu, kiểm tra khả năng tiếp cận và điều chỉnh cùng người phụ trách. Gợi ý: Hoạt động khám phá cần tạo điều kiện cho các thành viên tham gia phù hợp khả năng và nhu cầu.

3. Nhóm chỉ có một phút giới thiệu cả Bà Nà và Hải Vân Quan. Cách chọn nội dung nào làm rõ được hai nơi?
- Chọn một nét tiêu biểu có nguồn của mỗi nơi rồi nêu điểm khác nhau
- Dùng toàn bộ thời gian để liệt kê tên điểm bán vé
- Lặp lại một lời khen giống nhau cho cả hai nơi

Đáp án: Chọn một nét tiêu biểu có nguồn của mỗi nơi rồi nêu điểm khác nhau. Gợi ý: Tập trung một nét có căn cứ cho từng nơi giúp bài giới thiệu ngắn vẫn rõ đối tượng.

4. Chuyến tham quan bị thay đổi vì thời tiết. Lớp cần chọn phương án học thay thế nào?
- Tìm hiểu qua tư liệu tại lớp và trao đổi với người phụ trách về lịch phù hợp
- Tự tách nhóm đi để giữ đúng kế hoạch cũ
- Dùng ảnh nắng đẹp để khẳng định thời tiết thực tế an toàn

Đáp án: Tìm hiểu qua tư liệu tại lớp và trao đổi với người phụ trách về lịch phù hợp. Gợi ý: Mục tiêu học tập có thể thực hiện bằng tư liệu; lịch trình thực tế phải theo tình hình và hướng dẫn người phụ trách.

5. Bạn muốn dùng một đoạn nhạc tải trên mạng cho video chuyến khám phá. Cần kiểm tra gì?
- Điều kiện sử dụng và yêu cầu ghi nguồn của bản nhạc
- Chỉ số lượt thích của bài nhạc
- Tên tệp có ngắn hay không

Đáp án: Điều kiện sử dụng và yêu cầu ghi nguồn của bản nhạc. Gợi ý: Video học tập vẫn cần dùng âm nhạc theo điều kiện cho phép và ghi nguồn khi được yêu cầu.

**Chặng 3:** cảm xúc tự chọn, không chấm đúng/sai. Việc làm: Em ghi thời điểm của ảnh tư liệu.; Em phân biệt tự nhiên với công trình.; Em tuân thủ lối đi và giữ cảnh quan.

**Chặng 4:** sơ đồ học tập mới, không phải bản đồ địa lí; con dấu “Người bạn của núi và di tích”.

### g5-station-4 – Đọc dấu xưa trên miền non nước

Nguồn đối chiếu:
- https://www.mowcapunesco.org/register/ma-nhai-inscriptions-on-the-marble-mountains-danang-city-2022/
- https://dsvh.gov.vn/le-don-nhan-bang-ghi-danh-ma-nhai-tai-danh-thang-ngu-hanh-son-la-di-san-tu-lieu-thuoc-chuong-trinh-ky-uc-the-gioi-khu-vuc-chau-a-thai-binh-duong-22096
- https://danangfantasticity.com/en/danh-thang-ngu-hanh-son-da-nang
- https://danangfantasticity.com/en/di-san-unesco-vi/bia-ma-nhai-tai-danh-thang-ngu-hanh-son
- https://danangfantasticity.com/en/lang-da-my-nghe-non-nuoc

**Điểm 1: Cảnh núi và hang động**

Ngũ Hành Sơn là danh thắng gắn với núi đá, hang động và các dấu tích văn hóa ở Đà Nẵng. Cảnh quan và hoạt động của con người cùng tạo nên sức hấp dẫn của nơi này. Ảnh tư liệu năm 1992 chỉ phản ánh một góc nhìn tại thời điểm chụp. Em hãy mô tả chi tiết nhìn thấy rồi đối chiếu nguồn về từng địa điểm, không suy rằng mọi lối đi và công trình hiện nay đều giống ảnh cũ.

Ghi nhớ/giải thích: Núi đá, hang động và dấu tích văn hóa.

Câu hỏi: Nhóm đặc điểm nào phù hợp với Ngũ Hành Sơn?
- Núi đá, hang động và dấu tích văn hóa
- Một quần đảo chỉ có bãi cát, không có núi
- Một công trình phòng thủ riêng lẻ trên đỉnh đèo

Đáp án: Núi đá, hang động và dấu tích văn hóa

**Điểm 2: Dấu tích và không gian văn hóa**

Ở Ngũ Hành Sơn, các hang động và chùa như động Huyền Không, chùa Tam Thai là những địa điểm có tên gọi và thông tin riêng. Không gian tự nhiên kết hợp với dấu tích văn hóa qua nhiều thời kì. Khi giới thiệu, em cần gọi đúng tên và đọc nguồn của nơi đó. Khi đến nơi sinh hoạt tín ngưỡng, hãy giữ thái độ tôn trọng và theo hướng dẫn; bài học tìm hiểu di sản không yêu cầu học sinh thực hiện nghi lễ.

Ghi nhớ/giải thích: Đọc tên từng nơi và tôn trọng không gian văn hóa.

Câu hỏi: Khi tìm hiểu chùa và hang động, cách nào phù hợp?
- Đọc tên từng nơi và tôn trọng không gian văn hóa
- Dùng một câu chuyện cho tất cả địa điểm vì ở gần nhau
- Mặc định mọi công trình đều được xây cùng một năm

Đáp án: Đọc tên từng nơi và tôn trọng không gian văn hóa

**Điểm 3: Ma nhai – thông tin trên đá**

Ma nhai ở Ngũ Hành Sơn là những văn khắc bằng chữ Hán và chữ Nôm trên vách đá, hang động. Chúng lưu lại thông tin giúp tìm hiểu lịch sử, văn hóa và giao lưu của con người. Năm 2022, ma nhai tại danh thắng được ghi danh trong Chương trình Ký ức Thế giới khu vực châu Á – Thái Bình Dương. Việc ghi danh di sản tư liệu không đồng nghĩa toàn bộ danh thắng là Di sản thế giới UNESCO theo loại hình văn hóa hoặc thiên nhiên.

Ghi nhớ/giải thích: Di sản tư liệu văn khắc trên đá.

Câu hỏi: Ma nhai tại Ngũ Hành Sơn được tìm hiểu với tư cách nào?
- Di sản tư liệu văn khắc trên đá
- Danh hiệu Di sản thế giới dành cho toàn bộ các ngọn núi
- Bản đồ địa lí mô tả các tuyến tham quan

Đáp án: Di sản tư liệu văn khắc trên đá

**Điểm 4: Giữ đá, giữ nghề và câu chuyện**

Đá còn gắn với bàn tay tài hoa của người thợ ở làng đá mỹ nghệ Non Nước. Sản phẩm làng nghề và văn khắc tại di tích có giá trị, bối cảnh khác nhau. Trân trọng nghề không có nghĩa được lấy đá ở núi di tích làm quà. Với ma nhai, em chỉ quan sát theo hướng dẫn, không viết thêm, tô chữ hoặc chà lên bề mặt đá. Tư liệu số có nguồn giúp tìm hiểu chi tiết mà hạn chế việc chạm trực tiếp di sản.

Ghi nhớ/giải thích: Quan sát theo hướng dẫn, không viết hoặc chà lên đá.

Câu hỏi: Cách nào bảo vệ bề mặt ma nhai?
- Quan sát theo hướng dẫn, không viết hoặc chà lên đá
- Tô lại chữ bằng bút để lớp sau dễ đọc
- Dùng giấy và vật cứng chà trực tiếp để lấy mẫu

Đáp án: Quan sát theo hướng dẫn, không viết hoặc chà lên đá

**Chặng 2 – nhiệm vụ vận dụng riêng**

1. Nhóm muốn dùng bản dịch văn khắc nhưng bỏ mất tên người dịch. Nên làm gì?
- Bổ sung thông tin bản dịch và nguồn có thể đối chiếu
- Ghi rằng mọi bản dịch đều do nhóm tự làm
- Tự thêm nghĩa mới cho câu chưa hiểu

Đáp án: Bổ sung thông tin bản dịch và nguồn có thể đối chiếu. Gợi ý: Bản dịch là một lớp tư liệu có người thực hiện và căn cứ; cần ghi rõ để người đọc đối chiếu.

2. Khi nghe một câu chuyện dân gian ở danh thắng, bạn ghi đó là sự kiện đã được chứng minh. Em sửa ra sao?
- Ghi rõ là chuyện kể dân gian, phân biệt với thông tin lịch sử có chứng cứ
- Chuyện được kể hay thì chắc chắn là lịch sử
- Xóa mọi nguồn để người xem tự hiểu

Đáp án: Ghi rõ là chuyện kể dân gian, phân biệt với thông tin lịch sử có chứng cứ. Gợi ý: Có thể trân trọng câu chuyện dân gian đồng thời nêu đúng tính chất của nguồn.

3. Một bản số hóa có nguồn được đưa vào bài. Lợi ích phù hợp là gì?
- Giúp quan sát chi tiết mà không phải chạm di sản
- Làm mọi bản sao trở thành hiện vật gốc
- Cho phép bỏ việc giữ hiện vật thật

Đáp án: Giúp quan sát chi tiết mà không phải chạm di sản. Gợi ý: Tư liệu số hỗ trợ tiếp cận, không thay trách nhiệm bảo tồn.

4. Bạn mua đồ đá rồi nói nguyên liệu chắc chắn lấy ngay từ núi di tích. Em góp ý gì?
- Không tự suy luận xuất xứ; cần thông tin sản phẩm có căn cứ
- Đồng ý vì cửa hàng nằm gần núi
- Đổi nhãn để hợp lời giới thiệu

Đáp án: Không tự suy luận xuất xứ; cần thông tin sản phẩm có căn cứ. Gợi ý: Vị trí bán hàng không xác nhận được nguồn vật liệu.

5. Em muốn giới thiệu danh thắng trong một phút. Cách nào có chiều sâu?
- Nêu một nét cảnh quan, một giá trị văn hóa có nguồn và một việc gìn giữ
- Chỉ đọc hàng loạt lời khen nhất
- Gộp mọi chuyện kể thành sự kiện có thật

Đáp án: Nêu một nét cảnh quan, một giá trị văn hóa có nguồn và một việc gìn giữ. Gợi ý: Chọn thông tin cụ thể và hành động phù hợp.

**Chặng 3:** cảm xúc tự chọn, không chấm đúng/sai. Việc làm: Em giới thiệu đúng phạm vi di sản.; Em không viết, vẽ lên đá.; Em ghi nguồn tư liệu số đã dùng.

**Chặng 4:** sơ đồ học tập mới, không phải bản đồ địa lí; con dấu “Người gìn giữ miền non nước”.

### g5-station-5 – Giữ rừng để giữ cây quý

Nguồn đối chiếu:
- https://vkist.mst.gov.vn/vi/ctype-service_news/sam-viet-nam--panax-vietnamensis-ha-grushv--cay-thuoc-quy-cua-viet-nam-103.htm
- https://samngoclinh.danang.gov.vn/cong-tac-tuan-tra-bao-ve-vuon-bao-ton-sam-ngoc-linh-174.html
- https://samngoclinh.danang.gov.vn/bi-thu-thanh-uy-le-ngoc-quang-tham-khao-sat-vung-trong-sam-ngoc-linh-tai-xa-tra-linh-188.html

**Điểm 1: Gặp cây sâm Ngọc Linh**

Sâm Ngọc Linh còn gọi là sâm Việt Nam, có tên khoa học là Panax vietnamensis. Em tìm hiểu cây bằng tư liệu chuyên môn và ảnh có chú thích. Ảnh trong bài chụp tại Măng Ri, ngoài Đà Nẵng; nó minh họa cây theo nguồn ảnh, không phải vườn sâm Trà Linh. Một ảnh không đủ để học sinh xác định cây thật, cây giả hoặc chất lượng sản phẩm. Không tự hái hay nếm một cây chỉ vì nhìn giống ảnh.

Ghi nhớ/giải thích: Tham khảo cây theo nguồn và nơi chụp đã ghi.

Câu hỏi: Ảnh cây sâm tại Măng Ri trong bài có thể dùng để làm gì?
- Tham khảo cây theo nguồn và nơi chụp đã ghi
- Xác thực mọi cây giống ảnh là sâm thật
- Khẳng định đây là ảnh chụp vườn sâm Trà Linh

Đáp án: Tham khảo cây theo nguồn và nơi chụp đã ghi

**Điểm 2: Cây quý dưới tán rừng**

Sâm Ngọc Linh gắn với môi trường núi rừng có điều kiện sinh thái phù hợp. Tại xã Trà Linh, Đà Nẵng, cơ sở chuyên môn bảo tồn và phát triển cây dưới tán rừng. Tán cây, độ ẩm và môi trường đất cùng góp phần tạo nơi sống cho cây. Không phải cứ có bóng râm là trồng được sâm, cũng không thể tách việc giữ cây quý khỏi việc giữ rừng. Học sinh tìm hiểu mối liên hệ ấy, không tự mang cây về trồng thử.

Ghi nhớ/giải thích: Cây cần môi trường sinh thái phù hợp dưới tán rừng.

Câu hỏi: Vì sao bảo tồn sâm Ngọc Linh cần gắn với giữ rừng?
- Cây cần môi trường sinh thái phù hợp dưới tán rừng
- Chỉ cần bóng râm, đất và độ ẩm không quan trọng
- Có thể dời cây quý đến bất cứ sân trường nào

Đáp án: Cây cần môi trường sinh thái phù hợp dưới tán rừng

**Điểm 3: Giá trị và công sức gìn giữ**

Để giữ nguồn sâm Ngọc Linh, có công việc nghiên cứu, sản xuất cây giống, chăm sóc và bảo vệ vườn. Người lao động và cán bộ chuyên môn cùng góp sức; sinh kế của địa phương gắn với việc phát triển cây có trách nhiệm. Điều đáng quý không chỉ nằm ở sản phẩm mà còn ở nguồn gen và môi trường rừng. Bài học này không dùng giá bán hay lời quảng cáo chữa bệnh để khuyến khích học sinh mua hoặc sử dụng sâm.

Ghi nhớ/giải thích: Nguồn gen, môi trường rừng và sinh kế có trách nhiệm.

Câu hỏi: Những giá trị nào là trọng tâm bài học về sâm?
- Nguồn gen, môi trường rừng và sinh kế có trách nhiệm
- Giá bán càng cao thì mọi cách khai thác càng phù hợp
- Lời quảng cáo có thể thay cho kết quả nghiên cứu

Đáp án: Nguồn gen, môi trường rừng và sinh kế có trách nhiệm

**Điểm 4: Người tìm hiểu có trách nhiệm**

Người tìm hiểu có trách nhiệm biết hỏi điều mình chưa rõ và sử dụng thông tin đúng nguồn. Khi xem tư liệu về sâm, em ghi nơi chụp và phân biệt nội dung nghiên cứu với lời quảng cáo. Nếu tham quan, chỉ đi theo người phụ trách, không bứt lá, nhổ cây hay tự lấy hạt. Em có thể làm một thông điệp về giữ rừng và tôn trọng công sức người chăm sóc; không cần thử dùng cây để hoàn thành bài học.

Ghi nhớ/giải thích: Nhờ người lớn kiểm tra nguồn chuyên môn trước khi tin hoặc chia sẻ.

Câu hỏi: Khi gặp lời quảng cáo về cây quý chưa rõ căn cứ, em nên làm gì?
- Nhờ người lớn kiểm tra nguồn chuyên môn trước khi tin hoặc chia sẻ
- Chia sẻ trước rồi tìm hiểu sau vì có ảnh đẹp
- Tự dùng thử cây để xác minh lời quảng cáo

Đáp án: Nhờ người lớn kiểm tra nguồn chuyên môn trước khi tin hoặc chia sẻ

**Chặng 2 – nhiệm vụ vận dụng riêng**

1. Lớp làm hoạt động tìm hiểu cây quý nhưng định công khai vị trí cây ngoài tự nhiên. Nên làm gì?
- Hỏi người phụ trách và dùng thông tin được phép chia sẻ
- Đăng tọa độ thật chi tiết để ai cũng đến hái
- Tổ chức tự tìm cây mà không có người chuyên môn

Đáp án: Hỏi người phụ trách và dùng thông tin được phép chia sẻ. Gợi ý: Thông tin về cây quý cần được chia sẻ có trách nhiệm, tránh tạo điều kiện khai thác trái phép.

2. Nhóm muốn phỏng vấn người trồng sâm nhưng định hỏi giá bán trước mọi vấn đề. Câu hỏi nào phù hợp mục tiêu học tập hơn?
- Công việc chăm sóc và gìn giữ cây đòi hỏi những trách nhiệm nào ạ?
- Làm sao mua thật nhiều để tự dùng ngay ạ?
- Chỉ cần biết giá là hiểu hết nghề trồng sâm phải không ạ?

Đáp án: Công việc chăm sóc và gìn giữ cây đòi hỏi những trách nhiệm nào ạ?. Gợi ý: Bài học hướng tới hiểu lao động, trách nhiệm và bảo tồn; không biến hoạt động học thành quảng cáo mua dùng.

3. Bạn muốn nhổ cây trong vườn tham quan để xem rễ. Em chọn gì?
- Nhắc bạn dừng và xem tư liệu được người hướng dẫn cho phép
- Đào xong trồng lại là được
- Nhổ một cây nhỏ sẽ không sao

Đáp án: Nhắc bạn dừng và xem tư liệu được người hướng dẫn cho phép. Gợi ý: Không làm hại cây để đáp ứng tò mò.

4. Nhóm làm trò chơi nhận biết cây rồi dự định cho người chơi dùng kết quả để chọn cây ăn thử. Cần sửa gì?
- Ghi rõ trò chơi phục vụ học tập, không dùng để quyết định ăn hay dùng cây
- Chỉ cần đạt điểm cao là có thể ăn thử
- Đổi tên trò chơi thành chuyên gia để kết quả đáng tin hơn

Đáp án: Ghi rõ trò chơi phục vụ học tập, không dùng để quyết định ăn hay dùng cây. Gợi ý: Kết quả trò chơi không thay việc xác định cây và hướng dẫn sử dụng của người có chuyên môn.

5. Kết thúc bài về sâm, nhóm muốn đánh giá hoạt động tuyên truyền. Nên xem điều gì?
- Người xem có hiểu việc cần làm để bảo tồn và biết tìm nguồn tin phù hợp không
- Có bao nhiêu bạn muốn tự mua dùng ngay
- Bài có nhiều lời quảng cáo hơn nhóm khác không

Đáp án: Người xem có hiểu việc cần làm để bảo tồn và biết tìm nguồn tin phù hợp không. Gợi ý: Đánh giá sản phẩm học tập nên bám mục tiêu hiểu và hành động có trách nhiệm, không đo bằng ý định mua dùng.

**Chặng 3:** cảm xúc tự chọn, không chấm đúng/sai. Việc làm: Em không làm hại cây khi tham quan.; Em ghi đúng nguồn và nơi chụp ảnh.; Em chia sẻ thông điệp giữ rừng.

**Chặng 4:** sơ đồ học tập mới, không phải bản đồ địa lí; con dấu “Người bạn của rừng và cây quý”.

## Kết quả kiểm tra cuối trước khi đưa lên Git

- TypeScript và production build: đạt.
- 42 kiểm tra tự động liên quan: đạt, gồm hồi quy khối 3–4, 125 câu chặng 2 toàn app không trùng câu chặng 1, trạng thái mở chặng, nguồn ảnh, nội dung và sáu tình huống giọng đọc.
- Học sinh 1280 px và 390 px: 10 lượt hoàn thành trạm, 40 lượt điểm học. Có thử sai/làm lại, xem trước ảnh mà không vượt câu hỏi, gọi đúng văn bản/giọng tiếng Việt giả lập, lỗi phát không đánh dấu đã nghe, lưu thưởng và đọc lại tiến độ. 0 API ghi, 0 lỗi JavaScript.
- Trình chiếu 1280 px và 390 px: 110 lượt slide, 18 lượt ảnh thật cục bộ, 22 lượt liên kết nhóm tư liệu; ảnh giải mã được và giữ trọn bố cục, không tràn ngang, đáp án ban đầu ẩn. 0 API ghi, 0 lỗi JavaScript.
- 30 sơ đồ SVG: kiểm tra giới hạn từng phần chữ không vượt khung 960×720. Chủ động chặn ảnh Thu Bồn: màn hình hiện đúng thông báo chưa tải được ảnh, không dùng ảnh khác thay thế.
- Kiểm tra phát giọng dùng mô phỏng API để xác định văn bản, ngôn ngữ và trạng thái; không phải xác nhận âm sắc trên máy thật hoặc bộ MP3 cố định.
