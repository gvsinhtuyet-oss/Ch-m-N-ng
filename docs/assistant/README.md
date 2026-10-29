# Kho kiến thức Trợ lý Đà Nẵng – 30/10/2026

## Phạm vi và phương pháp

- Giữ 111 mục từ cũ, bổ sung 46 thẻ kiến thức có 24 nguồn gốc; một số chủ đề bổ sung chi tiết cho từ đã có, không coi là 157 khái niệm khác nhau.
- Tra cứu học liệu hiện hành của đủ 25 trạm/121 điểm. Không sao chép lời sai của phương án nhiễu thành kiến thức. Không sửa bài học, audio hay dữ liệu trò chơi.
- 25 hướng dẫn giảng dạy riêng theo ID thật, mỗi bài có hoạt động và câu hỏi gợi mở do biên soạn; các gợi ý sư phạm không phải trích dẫn nguyên văn cơ quan nguồn.
- Mỗi thẻ mới có giải thích ngắn, ví dụ dễ dạy, câu hỏi gợi mở, nguồn gốc và ngày rà soát. Diễn giải bằng lời mới; không chép toàn bài nguồn.
- Tách rõ dữ kiện trong nguồn, ví dụ minh họa biên soạn, và giới hạn chưa biết. Không thêm địa chỉ hành chính hiện hành, liều dùng dược liệu hoặc số liệu chưa đủ căn cứ.

## Hành vi

- Học sinh: câu trả lời ngắn; phương ngữ được chuẩn hóa âm thầm, chỉ giải nghĩa phương ngữ khi được hỏi trực tiếp.
- Giáo viên/Admin: trợ lý giảng dạy xuất hiện trong không gian tài khoản và khi trình chiếu ở chế độ thông thường, nhận câu hỏi tối đa 600 ký tự. Có ví dụ và câu hỏi gợi mở khi có trong kho.
- Không dùng các lựa chọn đáp án trò chơi làm nguồn tri thức cho bất kỳ vai trò nào. Học sinh đang ở Chặng 2 chỉ nhận hướng dẫn học, không trả lời hộ. Việc này không phải hàng rào chống gian lận: học sinh vẫn có thể đọc lại kiến thức ở Chặng 1.
- Hiển thị nguồn bên dưới câu trả lời mở rộng; học liệu nội bộ ghi tên bài làm căn cứ. Không khẳng định mọi mục cũ đều đã được rà lại theo nguồn mới.
- Không API LLM, không truyền câu hỏi lên dịch vụ AI, không bộ đếm lượt hỏi tài khoản. Link nguồn chỉ mở khi người dùng bấm. Giới hạn lưu trữ/lưu lượng hosting vẫn áp dụng.
- Giữ hội thoại trong bộ nhớ, tối đa 10 tin nhắn; đổi trạm đặt lại. Không bổ sung lưu lịch sử vào Firestore.

## Kiểm thử trước xuất bản

- 38/38 kiểm thử trợ lý: gồm câu hỏi phương ngữ theo ngữ cảnh của cả 121 điểm, mốc 2009/2022, phân biệt động vật/thực vật, câu ngoài kho, giáo viên/học sinh và bảo vệ đáp án.
- 15/15 kiểm thử hồi quy audio manifest, quyền chặng, luồng giáo viên/nhập kế hoạch. TypeScript và build đạt; 4/4 kiểm thử tải và cache đạt.
- Chưa chứng nhận chatbot hiểu mọi câu diễn đạt hoặc biết mọi kiến thức ngoài bài. Đây là truy hồi theo từ/cụm và nội dung biên soạn, không phải mô hình hội thoại tổng quát.
- Khối từ điển chuyên sâu tăng thêm khoảng 16KB gzip trong chunk trợ lý; không thêm MP3/ảnh hoặc mô hình AI nặng.

## Nguồn mở rộng đã đối chiếu

- [UNESCO – Di sản văn hóa phi vật thể](https://ich.unesco.org/en/what-is-intangible-heritage-00003)
- [UNESCO – Đô thị cổ Hội An](https://whc.unesco.org/en/list/948/)
- [UNESCO – Khu đền tháp Mỹ Sơn](https://whc.unesco.org/en/list/949/)
- [UNESCO – Cù Lao Chàm–Hội An](https://www.unesco.org/en/mab/cu-lao-cham-hoi)
- [NOAA – San hô là động vật](https://oceanservice.noaa.gov/facts/coral.html)
- [NOAA – Hệ sinh thái rạn san hô](https://www.noaa.gov/education/resource-collections/marine-life/coral-reef-ecosystems)
- [USGS – Vòng tuần hoàn nước](https://www.usgs.gov/water-science-school/water-cycle)
- [USGS – Thuật ngữ vùng bờ](https://www.usgs.gov/glossary/coasts-glossary)
- [Cục Di sản văn hóa – Bia ma nhai Ngũ Hành Sơn](https://dsvh.gov.vn/bia-ma-nhai-tai-danh-thang-ngu-hanh-son-da-nang-22113)
- [Cục Di sản văn hóa – Thành Điện Hải](https://dsvh.gov.vn/thanh-dien-hai-3281)
- [Cổng thông tin Đà Nẵng – Địa đạo Kỳ Anh](https://cttdt.danangportal.gov.vn/vi/web/dng/w/kham-pha-dia-dao-ky-anh)
- [Cổng thông tin Đà Nẵng – Làng lụa Mã Châu](https://danang.gov.vn/vi/web/dng/w/lang-nghe-det-vai-to-lua-ma-chau-cham-vao-soi-to-ngan-nam-xu-quang)
- [Cổng du lịch Đà Nẵng – Nam Ô](https://danangfantasticity.com/en/nam-o-diem-den-hap-dan-tiem-nang-cua-du-lich-da-nang)
- [Bảo tàng Lịch sử quốc gia – Điêu khắc Chăm](https://baotanglichsu.vn/vi/Articles/3091/76565/bao-tang-djieu-khac-cham-dja-nang-kho-bau-cua-nghe-thuat-djieu-khac-cham-pa.html)
- [Cổng du lịch Đà Nẵng – Du lịch cộng đồng](https://danangfantasticity.com/en/tin-tuc/du-lich-cong-dong-huong-di-moi-cua-du-lich-da-nang)
- [Trung tâm di sản Hội An – Tết Nguyên tiêu](https://hoianheritage.net/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/tet-nguyen-tieu-o-hoi-an-1101.html)
- [Trung tâm Phát triển Sâm Ngọc Linh và Dược liệu](https://samngoclinh.danang.gov.vn/gioi-thieu-1.html)
- [NOAA – Phân biệt thời tiết và khí hậu](https://www.noaa.gov/explainers/what-s-difference-between-climate-and-weather)
- [Royal Society of Chemistry – Thuật ngữ hợp kim](https://edu.rsc.org/download?ac=540573)
- [Cổng thông tin Hòa Vang – Nhà Gươl của đồng bào Cơ Tu](https://hoavang.danang.gov.vn/vi/w/nha-guol-cua-dong-bao-cotu-25047)
- [Trung tâm di sản Hội An – Nghề trồng dâu, ươm tơ ở Cẩm Kim trước 1975](https://hoianheritage.danang.gov.vn/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/nghe-trong-dau-uom-to-o-cam-kim-truoc-nam-1975-qua-thong-tin-tham-van-cong-dong-604.html)
- [Trung tâm di sản Hội An – Chùa Cầu](https://hoianheritage.danang.gov.vn/vi/di-san-van-hoa/Cau/Chua-Cau-134.html)
- [NOAA – Vì sao có mưa](https://www.nesdis.noaa.gov/about/k-12-education/atmosphere/what-makes-it-rain)
- [Trung tâm di sản Hội An – Chùa Cầu, biểu trưng di sản](https://hoianheritage.danang.gov.vn/vi/trao-doi-chuyen-nganh/chuyen-de-nghien-cuu-trao-doi/chua-cau-bieu-trung-di-san-van-hoa-hoi-an-1016.html)

## Hướng dẫn giảng dạy cho từng trạm

| ID | Bài học | Hoạt động gợi ý |
|---|---|---|
| `g1-station-1` | Quê hương em | Cho học sinh vẽ đường từ nhà đến trường bằng các ký hiệu đơn giản, không yêu cầu cung cấp địa chỉ nhà cụ thể. |
| `g1-station-4` | Thành Điện Hải | Dùng sơ đồ mặt cắt để phân biệt tường thành, cửa thành và hào; sau đó chỉ từng phần trên ảnh Điện Hải. |
| `g1-station-2` | Trò chơi dân gian | Cho lớp nêu luật của một trò chơi quen thuộc rồi phân vai, khoanh vùng chơi an toàn và thỏa thuận lượt chơi. |
| `g1-station-3` | Những dòng suối ở thành phố Đà Nẵng | Dùng chuỗi tranh rừng, dòng suối và thác; yêu cầu học sinh chỉ nơi nước chảy, không đồng nhất mọi suối với thác. |
| `g1-station-5` | Món ăn truyền thống | Xếp thẻ nguyên liệu và thành phẩm món ăn; cho học sinh kể cách ăn, cách bày theo gia đình và tôn trọng sự khác nhau. |
| `g2-station-4` | Di sản văn hóa thế giới Hội An | So sánh ảnh đường phố, nhà cổ, Chùa Cầu và làng nghề; yêu cầu mỗi nhóm chọn một chi tiết có căn cứ để giới thiệu Hội An. |
| `g2-station-3` | Nhà thờ Nguyễn Văn Thoại – Nhà lưu niệm Huỳnh Thúc Kháng | Dùng hai thẻ nhân vật Nguyễn Văn Thoại và Huỳnh Thúc Kháng, nối mỗi người với đúng nơi tưởng niệm và đóng góp trong bài. |
| `g2-station-5` | Lễ hội truyền thống ở thành phố Đà Nẵng | Chia bảng thành phần lễ và phần hội, xếp hoạt động từ bài học vào hai cột rồi thảo luận cách ứng xử. |
| `g2-station-2` | Cù Lao Chàm – Khu bảo tồn thiên nhiên Sơn Trà | Lập hai cột biển đảo Cù Lao Chàm và rừng Sơn Trà; chỉ sinh vật, môi trường sống và việc bảo vệ phù hợp từng nơi. |
| `g2-station-1` | Chiếu Cẩm Nê – Chiếu Bàn Thạch | Dùng dải giấy mô phỏng các sợi đan xen thành chiếu, rồi đối chiếu ảnh cói, dụng cụ và quy trình người thợ. |
| `g3-station-2` | Hoàng Diệu – Phan Châu Trinh | Lập bảng riêng Hoàng Diệu và Phan Châu Trinh, ghép đúng việc làm và lý tưởng theo học liệu, tránh nhập hai nhân vật làm một. |
| `g3-station-3` | Cộng đồng các dân tộc ở thành phố Đà Nẵng | Mời học sinh nhận xét một nét văn hóa qua ảnh và thông tin của bài; tránh gán một trang phục, tập tục cho mọi dân tộc. |
| `g3-station-1` | Bãi biển Mỹ Khê – Bãi biển Bàn Than | So sánh ảnh bãi cát Mỹ Khê và bãi đá Bàn Than; thêm thẻ biển báo, cứu hộ và các tình huống an toàn khi đi biển. |
| `g3-station-4` | Nước mắm Nam Ô | Sắp xếp thẻ cá, muối, ủ và lọc theo bài; chỉ quan sát quy trình, không tổ chức nếm nguyên liệu chưa bảo đảm vệ sinh. |
| `g3-station-5` | Nghề đan thuyền thúng ở Sơn Trà | Cho lớp xem ảnh nan tre, thân thúng, vành thúng và chống thấm rồi sắp xếp công đoạn; không sử dụng dao hoặc vật liệu nóng. |
| `g4-station-1` | Thiên nhiên và con người Đà Nẵng | Dùng bản đồ của bài để nhận diện vùng núi, trung du, đồng bằng ven biển rồi nối mỗi vùng với một hoạt động sống phù hợp. |
| `g4-station-3` | Tìm hiểu một số hoạt động kinh tế Đà Nẵng | Cho học sinh kể một công việc trong gia đình và phân biệt làm ra sản phẩm, cung cấp dịch vụ hoặc sản xuất nông nghiệp. |
| `g4-station-2` | Khu đền tháp Mỹ Sơn – Bảo tàng Điêu khắc Chăm Đà Nẵng | So sánh ảnh công trình tại Mỹ Sơn và hiện vật trong bảo tàng; đọc nhãn trước khi nói chất liệu hoặc niên đại. |
| `g4-thu-bon-hon-kem` | Sông Thu Bồn – Hòn Kẽm Đá Dừng | Lần theo mũi tên dòng Thu Bồn trên bản đồ rồi liên hệ Hòn Kẽm Đá Dừng bằng ảnh; không dùng sơ đồ minh họa để dẫn đường thực tế. |
| `g4-station-4` | Nghề đúc đồng ở Phước Kiều | Xếp thẻ tạo mẫu, làm khuôn, nấu, rót và hoàn thiện theo học liệu; chỉ dùng ảnh để giới thiệu các công đoạn có nhiệt độ cao. |
| `g5-ky-anh-me-nhu` | Địa đạo Kỳ Anh – Khu lưu niệm Mẹ Nhu và 07 Dũng sĩ Thanh Khê | Tách hai nhóm tư liệu Địa đạo Kỳ Anh và Mẹ Nhu–bảy dũng sĩ Thanh Khê, phân biệt địa điểm, nhân vật và sự kiện. |
| `g5-station-3` | Bà Nà – Hải Vân Quan | Lập bảng so sánh Bà Nà và Hải Vân Quan theo cảnh quan, lịch sử và việc bảo vệ; không đồng nhất công trình du lịch mới với di tích cổ. |
| `g5-station-4` | Danh thắng Ngũ Hành Sơn | Cho học sinh tìm núi, hang động, ma nhai và làng nghề trên ảnh; tách danh thắng, di tích và di sản tư liệu khi giải thích danh hiệu. |
| `g5-lua-ma-chau` | Lụa Mã Châu | Dùng chuỗi tranh dâu, tằm, kén, ươm tơ và dệt; phân biệt nguyên liệu tơ với tấm lụa đã hoàn thiện. |
| `g5-station-5` | Sâm Ngọc Linh | Phân loại câu mô tả nơi sống, bảo tồn, sinh kế và quảng cáo công dụng; không biến bài học dược liệu thành hướng dẫn tự dùng thuốc. |

Dữ liệu: `src/data/assistantKnowledge.json`, `src/data/assistantStationGuides.json`. Các thay đổi Admin của bài đang mở tiếp tục được đọc qua context; từ điển mở rộng là phiên bản tĩnh và cần cập nhật qua mã nguồn.

## Rà soát lỗi ngữ nghĩa bổ sung

- Chặn việc dùng đáp án tình huống làm lời giải thích hiện tượng (ví dụ câu hỏi “Vì sao trời mưa?”).
- Ưu tiên cụm từ có dấu trong tiêu đề để tránh ghép “cây nêu” với “cây” và “nếu” ở bài khác.
- Tách ý hỏi người xây dựng, số lượng, so sánh và địa chỉ; không thay bằng đoạn giới thiệu chung.
- Hiểu đảo thứ tự “Thời tiết khác khí hậu thế nào?”; nhận dạng lời nhờ “Giải thích/Cho ví dụ về…” của giáo viên.
- Phân biệt phần cầu do người Nhật xây trước và phần miếu thờ do người Minh Hương xây sau theo tư liệu di sản. Không tự thêm năm xây nhà Gươl khi kho chưa có căn cứ.
- Đã tích hợp nền main mới nhất tại thời điểm kiểm thử `0246a9d`, giữ các sửa lỗi mobile/PWA và bản đồ của luồng công việc khác.
- Bản thử đầu tiên bị Cloudflare timeout ở bước initialize trước khi clone/build; thử lại đã thành công. Đây không phải lỗi TypeScript của ứng dụng.

## Kiểm tra giao diện bản xem trước

- Giáo viên demo: mở trợ lý trong Không gian dạy học, hỏi thời tiết–khí hậu, hiện giải thích + ví dụ + câu hỏi + nguồn NOAA đúng.
- Câu hỏi nhà Gươl xây năm nào: nói rõ chưa đủ thông tin, không tự điền năm.
- Học sinh demo: chọn Khối 2, mở trợ lý, câu hỏi phương ngữ không bị trả lời bằng định nghĩa từ địa phương.
- Chrome 390×844: dialog rộng 366px, nằm trong x=12..378, đáy <832; ô nhập vẫn thấy; document không tràn ngang. Chưa kiểm tra bàn phím thật trên iPhone hoặc đăng nhập bằng tài khoản thật.
- Giữ các sửa lỗi vào khối lớp, trang chủ iPhone và phản hồi lỗi thực tế từ production `9c779b7`, không thay về bản main cũ.

## Kiểm tra Chặng 2 qua giao diện

- Hoàn thành sáu điểm Hội An ở tài khoản học sinh demo, nhận vật phẩm và chuyển Chặng 2 thành công.
- Hỏi “Hội An được UNESCO công nhận năm nào?” trong Chặng 2: chỉ gợi hướng ôn bài, không trả số năm; các nút hỏi nhanh đổi sang hướng dẫn quan sát/ôn bài.
- Bản ứng dụng commit `77efb0a` đã được Cloudflare triển khai production thành công ở deployment `7ef720ff-f9f0-45c5-9def-ef36b6f4ddf6` (32 giây). Thay đổi cuối điều chỉnh riêng các gợi ý nhanh Chặng 2, giữ nguyên 46 mục tri thức.
