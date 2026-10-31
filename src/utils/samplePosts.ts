import { ScannedPost } from '../types';
import { generatePostId } from './hash';
import { classifyPostContent } from './drlClassifier';

export const SAMPLE_FACEBOOK_POSTS = [
  {
    groupName: 'Đoàn Thanh niên - Hội Sinh viên TDTU',
    groupId: 'grp_tdtu_youth_union',
    authorName: 'Ban Phong Trào & Tình Nguyện',
    postUrl: 'https://www.facebook.com/groups/doanhoitdtu.official/posts/9918237461928374/',
    content: `[NGÀY HỘI HIẾN MÁU TÌNH NGUYỆN ĐỢT 1 - NĂM HỌC 2026]
❤️ "Mỗi giọt máu cho đi - Một cuộc đời ở lại" ❤️

Các bạn sinh viên thân mến,
Đoàn trường chính thức mở cổng đăng ký tham gia Ngày hội Hiến máu tình nguyện.
⏰ Thời gian tổ chức: 07:30 - 11:30 ngày 10/11/2026.
📍 Địa điểm: Sảnh nhà thi đấu thể thao TDTU.
🎁 QUYỀN LỢI ĐẶC BIỆT:
- Được cộng 5 điểm rèn luyện (Tiêu chí 3: Đánh giá về ý thức tham gia các hoạt động chính trị, xã hội, văn hóa).
- Nhận giấy chứng nhận hiến máu của Hội Chữ Thập Đỏ và phần quà hỗ trợ sức khỏe.
⏳ Hạn chót đóng form: 20:00 ngày 08/11/2026 (hoặc khi đủ số lượng 300 sinh viên).
👉 LINK FORM ĐĂNG KÝ: https://forms.gle/HienMauTDTU2026
Lưu ý: Sinh viên nhớ mang theo CCCD và thẻ sinh viên khi đến tham gia.`,
  },
  {
    groupName: 'Khoa Công nghệ Thông tin - Thông tin & Hoạt động Sinh viên',
    groupId: 'grp_tdtu_it_faculty',
    authorName: 'CLB Học thuật IT - IT Zone',
    postUrl: 'https://www.facebook.com/groups/it.tdtu.students/posts/8827364819283711/',
    content: `[WORKSHOP AI & CLOUD ARCHITECTURE 2026]
🔥 Tọa đàm chuyên sâu cùng Chuyên gia Google Cloud & Tech Lead VNG 🔥

Bạn muốn nắm vững xu hướng Generative AI và lộ trình thực tập tại các tập đoàn công nghệ hàng đầu?
- Thời gian: 08:30 - 11:30 Thứ Bảy, ngày 15/11/2026
- Địa điểm: Hội trường A, TDTU (Quận 7)
- Quyền lợi sinh viên:
  + Cộng 3 điểm rèn luyện (Tiêu chí 1: Đánh giá về ý thức học tập và nghiên cứu khoa học)
  + Cơ hội nhận voucher thi chứng chỉ quốc tế và phỏng vấn trực tiếp
- Hạn đăng ký: Trước 23:59 ngày 13/11/2026
- Link form: https://docs.google.com/forms/d/e/1FAIpQLSc_AI_Workshop_2026/viewform
Nhanh tay đăng ký vì số lượng chỗ ngồi có hạn!`,
  },
  {
    groupName: 'CLB Kỹ Năng Sinh Viên TDTU (SSC)',
    groupId: 'grp_tdtu_skills_club',
    authorName: 'Ban Truyền Thông SSC',
    postUrl: 'https://www.facebook.com/groups/clbkynang.tdtu/posts/7726152438192834/',
    content: `[TALKSHOW KỸ NĂNG QUẢN LÝ THỜI GIAN & WORK-LIFE BALANCE]
Năm cuối ngập đầu trong đồ án, thực tập và hoạt động ngoại khóa? Đừng bỏ lỡ talkshow này!
- Thời gian: 18:00 ngày 18/11/2026 qua nền tảng Google Meet
- Diễn giả: ThS. Tâm lý học Nguyễn Văn A
- Tham gia nhận Giấy chứng nhận tham gia từ CLB và rèn luyện kỹ năng mềm
- Link đăng ký: https://forms.gle/TalkshowTimeManagement
Hẹn gặp các bạn tại buổi chia sẻ nhé!`,
  },
  {
    groupName: 'Phòng Công tác Học sinh - Sinh viên (CTSV)',
    groupId: 'grp_ctsv_university',
    authorName: 'Phòng CTSV',
    postUrl: 'https://www.facebook.com/groups/ctsv.thongbaochinhthuc/posts/6618293746192849/',
    content: `[THÔNG BÁO V/V ĐIỂM DANH SINH HOẠT CÔNG DÂN GIỮA KHÓA ĐỢT 2]
Phòng CTSV thông báo đến toàn thể sinh viên khóa tuyển sinh 2024 và 2025:
Sinh hoạt công dân là quy định bắt buộc theo Quy chế ĐRL của Nhà trường.
Sinh viên hoàn thành bài kiểm tra trực tuyến trên hệ thống e-learning trước 17:00 ngày 25/11/2026 để được:
- Ghi nhận hoàn thành nghĩa vụ sinh hoạt công dân
- Cộng 10 điểm rèn luyện (Tiêu chí 2: Ý thức chấp hành pháp luật và nội quy nhà trường)
- Cổng thông tin e-learning: https://elearning.tdtu.edu.vn/ctsv-shcd-2026`,
  },
  {
    groupName: 'Diễn đàn Sinh viên TDTU (TDTU Confessions)',
    groupId: 'grp_tdtu_confessions',
    authorName: 'Admin Hội Confession',
    postUrl: 'https://www.facebook.com/groups/tdtuconfessions/posts/5519283746192812/',
    content: `Chào mọi người, mình cần pass lại giáo trình Tiếng Anh TOEIC 750+ và máy tính Casio fx 580 còn mới nguyên tem, kèm mấy cuốn vở ghi chép môn Cấu trúc dữ liệu. Bạn nào cần cmt mình ib nhé. Cảm ơn admin duyệt bài!`,
  },
  {
    groupName: 'Đoàn - Hội Khoa Quản trị Kinh doanh (BA - TDTU)',
    groupId: 'grp_tdtu_ba_faculty',
    authorName: 'Đoàn Hội QTKD',
    postUrl: 'https://www.facebook.com/groups/doanhoiba.tdtu/posts/4432198765432109/',
    content: `[COMPANY TOUR 2026: THAM QUAN THỰC TẾ NHÀ MÁY THÔNG MINH VINAMILK]
Đoàn - Hội Khoa QTKD tổ chức chuyến tham quan doanh nghiệp giúp sinh viên tiếp cận quy trình vận hành chuỗi cung ứng hiện đại.
- Thời gian: 07:00 - 12:00 ngày 22/11/2026
- Địa điểm tập trung: Sân cờ TDTU (xe đưa đón tận nơi)
- Quyền lợi sinh viên:
  + Cộng 4 điểm rèn luyện (Tiêu chí 1: Hoạt động học tập và định hướng nghề nghiệp)
  + Nhận chứng nhận tham gia chương trình thực tế của doanh nghiệp
- Hạn chót đăng ký: 21:00 ngày 19/11/2026
- Link form: https://forms.gle/VinamilkTour2026`,
  },
  {
    groupName: 'Đoàn - Hội Khoa Ngoại ngữ (FFL - TDTU)',
    groupId: 'grp_tdtu_ffl_faculty',
    authorName: 'Ban Học thuật Khoa Ngoại ngữ',
    postUrl: 'https://www.facebook.com/groups/doanhoiffl.tdtu/posts/3321987654321098/',
    content: `[CUỘC THI HÙNG BIỆN TIẾNG ANH "GLOBAL LEADERS SPEAK 2026"]
Cơ hội khẳng định bản lĩnh ngôn ngữ và tỏa sáng trên sân khấu lớn!
- Thời gian sơ loại: 13:30 ngày 28/11/2026 tại Phòng 601 Nhà C
- Quyền lợi:
  + Cộng 5 điểm rèn luyện (Tiêu chí 3: Hoạt động văn hóa văn nghệ thể thao ngoại ngữ)
  + Giải thưởng tiền mặt lên đến 5.000.000 VNĐ cho Quán quân
- Hạn đăng ký: Trước 18:00 ngày 24/11/2026
- Link form đăng ký: https://docs.google.com/forms/d/e/1FAIpQLSd_GlobalLeaders_2026/viewform`,
  },
  {
    groupName: 'CLB Môi trường Xanh TDTU (Green TDTU)',
    groupId: 'grp_tdtu_green_club',
    authorName: 'Ban Chủ nhiệm Green Club',
    postUrl: 'https://www.facebook.com/groups/moitruongxanh.tdtu/posts/2219876543210987/',
    content: `[CHIẾN DỊCH NGÀY CHỦ NHẬT XANH - ĐỔI RÁC TÁI CHẾ LẤY SEN ĐÁ]
Chung tay vì khuôn viên TDTU xanh - sạch - đẹp!
- Thời gian: 08:00 - 11:30 ngày 16/11/2026
- Địa điểm: Sảnh Nhà thi đấu TDTU
- Quyền lợi: Cấp 3 điểm rèn luyện (Tiêu chí 3: Tình nguyện vì cộng đồng và bảo vệ môi trường)
- Hạn đóng form: 22:00 ngày 14/11/2026
- Link đăng ký: https://forms.gle/ChuNhatXanhTDTU2026`,
  }
];

export function buildScannedPostFromRaw(raw: {
  groupName: string;
  groupId: string;
  authorName: string;
  postUrl: string;
  content: string;
}): ScannedPost {
  const analysis = classifyPostContent(raw.content);
  const postId = generatePostId(raw.postUrl, raw.content);
  const now = new Date().toISOString();

  return {
    id: postId,
    groupId: raw.groupId,
    groupName: raw.groupName,
    postUrl: raw.postUrl,
    authorName: raw.authorName,
    rawContent: raw.content,
    summary: analysis.summary,
    classification: analysis.classification,
    confidence: analysis.confidence,
    keyPhrases: analysis.keyPhrases,
    formUrls: analysis.formUrls,
    eventTime: analysis.eventTime,
    deadline: analysis.deadline,
    points: analysis.points,
    criteria: analysis.criteria,
    isBookmarked: false,
    isRegistered: false,
    scannedAt: now,
    createdAt: now,
    updatedAt: now
  };
}
