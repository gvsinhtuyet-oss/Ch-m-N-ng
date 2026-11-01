# Trợ lý học tập và giảng dạy — 01/11/2026

## Vấn đề và hành vi mới

Trước đây bộ truy hồi nhận ra chủ đề nhưng thường không thực hiện nhiệm vụ: yêu cầu tạo câu hỏi về Hội An nhận một đoạn giới thiệu; câu xác nhận sai về san hô bị báo thiếu thông tin; học sinh xin giải thích đơn giản nhận chỉ dẫn dành cho giáo viên.

Lớp xử lý nhiệm vụ mới chạy sau hàng rào Chặng 2 và trước truy hồi/AI. Phân biệt kiến thức, so sánh, tạo câu hỏi, hoạt động có thời lượng, viết lại và luyện từng câu. Câu hỏi kiến thức vẫn qua kho hiện có. Tìm/mở bài của giáo viên vẫn dùng danh mục thực tế; yêu cầu sư phạm không bị chuyển thành tìm bài.

- 51 chủ đề có giải thích cho lớp 1–2, ví dụ minh họa, tình huống vận dụng và gợi ý đáp án. Lớp 3–5 giữ phần giải thích đầy đủ hơn và câu hỏi vận dụng.
- Ba chủ đề tổng hợp Hội An, làng nghề và trò chơi dân gian có nguồn riêng, phục vụ yêu cầu tạo câu hỏi và hoạt động.
- Câu xác nhận sai về san hô được sửa trực tiếp; các phát biểu khác chưa đủ căn cứ không tự được công nhận là đúng.
- Bộ câu hỏi trắc nghiệm được biên soạn cho 13 chủ đề (52 câu). Các chủ đề còn lại có câu hỏi tự luận và gợi ý để đối chiếu, không tự tạo phương án nhiễu hoặc chấm tự luận bằng từ khóa.
- Hoạt động có mục tiêu, chuẩn bị, thời lượng từng bước, câu hỏi vận dụng, tiêu chí và điều chỉnh theo lớp. Gợi ý sư phạm là nội dung biên soạn, không phải trích dẫn cơ quan nguồn.
- Câu hỏi thiếu chủ đề được hỏi lại; tên chủ đề ở lượt tiếp theo tiếp nối đúng nhiệm vụ. Chủ đề mới chưa biết không bị thay bằng chủ đề cũ.

## Cơ sở thiết kế

1. [IES/What Works Clearinghouse: Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) — luyện nhớ và câu hỏi yêu cầu giải thích. Các mức bằng chứng khác nhau giữa khuyến nghị; không gán một mức tác động chung cho app.
2. [IES: bản hướng dẫn đầy đủ](https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf) — có phản hồi sửa sai trong luyện nhớ, thay vì chỉ lặp lại nội dung.
3. [EEF: Metacognition and Self-Regulated Learning](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition) — hướng dẫn học sinh theo dõi và tự đánh giá gắn với nội dung cụ thể.
4. [EEF: A School’s Guide to Implementation](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/implementation/) — định nghĩa điều cần theo dõi và dùng cách thu thập khả thi trong thực hành.
5. [NOAA: Are corals animals or plants?](https://oceanservice.noaa.gov/facts/coral.html) — căn cứ sửa hiểu nhầm san hô là thực vật. Hình dáng giống cây không quyết định phân loại.

Thiết kế câu ngắn và phân nhóm lớp là lựa chọn biên soạn cho app, cần giáo viên tiếp tục rà trong lớp học; không coi việc dùng các hướng dẫn này là chứng minh app có cùng mức tác động trong nghiên cứu.

## Công cụ đo và giới hạn

Học sinh tự chọn một trong 13 chủ đề: làm hai câu trước (hiểu bài, vận dụng), ôn giải thích và ví dụ, rồi làm hai câu sau có cách hỏi khác. Chỉ hiện phản hồi và đáp án sau khi hoàn thành. Mỗi miền có một câu ở mỗi lần đo, ghi điểm 0/1. Kết quả là một lượt luyện ngắn, không phải thang đo chuẩn hóa, không phải điểm năng lực hay bằng chứng tác động nhân quả. Chưa đo ghi nhớ trì hoãn.

Giáo viên bấm bắt đầu và kết thúc một công việc chuẩn bị bài liên tục; thời gian thực đo tính cả khoảng rời bảng để làm việc trong app. Thời gian bài tương tự trước đây là trường tùy chọn do người dùng tự ghi, được tách khỏi thời gian thực đo. Mức chỉnh sửa gồm dùng ngay, chỉnh ít, chỉnh nhiều và chưa dùng được.

Không có số liệu mẫu. Chỉ ghi khi hoàn thành và chủ động lưu. Nhật ký giới hạn 100 lượt, tách khóa theo tài khoản và vai trò trên thiết bị. Không lưu tên, câu trả lời tự luận hay thông tin cá nhân học sinh trong nhật ký; không gửi dữ liệu lên máy chủ hoặc dịch vụ AI. CSV xuất điểm, thời gian, chủ đề, lớp và mức chỉnh sửa. Số lượt không được gọi là số học sinh. Thống kê của tài khoản/thiết bị không phải báo cáo lớp hay dữ liệu đa thiết bị.

Khi triển khai nghiên cứu lớp học: giáo viên cần xác định mục tiêu, thời điểm đo, cặp bài tương đương, tiêu chí chấm vận dụng và cách thu thập; ghi nhận cả số trường hợp thiếu cặp trước–sau. Chỉ so sánh trong cùng điều kiện và báo cáo giới hạn; nghiên cứu tác động cần thiết kế bổ sung ngoài nhật ký này.

## Xác minh

Kiểm thử tập trung vào phân loại nhiệm vụ, số câu và tổng thời lượng, sửa tiền đề sai, câu trả lời theo lớp, tiếp nối chủ đề, không tự trả lời chủ đề lạ, ánh xạ đáp án sau xáo thứ tự, bảo vệ Chặng 2, dữ liệu trước–sau và nhật ký theo tài khoản. CI còn chạy TypeScript, build và các kiểm thử hồi quy hiện có. Kiểm tra trình duyệt và trạng thái xuất bản được báo cáo theo kết quả thực tế, không mặc định đã nghiệm thu backend hay hiệu quả học tập.
