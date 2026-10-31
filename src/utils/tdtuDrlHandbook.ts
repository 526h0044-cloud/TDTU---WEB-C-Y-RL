/**
 * Cẩm nang & Cơ sở Tri thức Toàn diện về Điểm Rèn Luyện (ĐRL)
 * Trường Đại học Tôn Đức Thắng (TDTU)
 * Chuẩn khung 5 Cột x 20 Điểm = 100 Điểm Tổng
 */

export interface TdtuCriterion {
  id: number;
  name: string;
  shortName: string;
  maxScore: number;
  description: string;
  howToEarn: {
    activity: string;
    points: string;
    note: string;
  }[];
  tips: string[];
}

export interface DRLRanking {
  rank: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu' | 'Kém';
  minScore: number;
  maxScore: number;
  color: string;
  bgLight: string;
  benefit: string;
  consequence?: string;
}

export const TDTU_DRL_RANKINGS: DRLRanking[] = [
  {
    rank: 'Xuất sắc',
    minScore: 90,
    maxScore: 100,
    color: 'text-emerald-700 border-emerald-300',
    bgLight: 'bg-emerald-50',
    benefit: 'Ưu tiên xét Học bổng Tôn Đức Thắng loại Xuất sắc, giải thưởng Sinh viên 5 Tốt cấp Thành phố, giới thiệu việc làm doanh nghiệp đối tác hàng đầu.'
  },
  {
    rank: 'Tốt',
    minScore: 80,
    maxScore: 89,
    color: 'text-blue-700 border-blue-300',
    bgLight: 'bg-blue-50',
    benefit: 'ĐIỀU KIỆN TIÊN QUYẾT để xét nhận Học bổng Khuyến khích học tập (HKKHT). Xét danh hiệu Sinh viên 5 Tốt cấp Trường.'
  },
  {
    rank: 'Khá',
    minScore: 65,
    maxScore: 79,
    color: 'text-amber-700 border-amber-300',
    bgLight: 'bg-amber-50',
    benefit: 'Đủ điều kiện xét tốt nghiệp đúng hạn, đăng ký ở ký túc xá và xét tham gia các chương trình trao đổi sinh viên thông thường.'
  },
  {
    rank: 'Trung bình',
    minScore: 50,
    maxScore: 64,
    color: 'text-orange-700 border-orange-300',
    bgLight: 'bg-orange-50',
    benefit: 'Đủ điều kiện duy trì học tập nhưng KHÔNG được xét khen thưởng hoặc học bổng bất kỳ loại nào.',
    consequence: 'Cần nâng điểm học kỳ sau để tránh bị kéo tụt điểm rèn luyện toàn khóa.'
  },
  {
    rank: 'Yếu',
    minScore: 35,
    maxScore: 49,
    color: 'text-rose-700 border-rose-300',
    bgLight: 'bg-rose-50',
    benefit: 'Bị cảnh báo rèn luyện cấp Khoa. Không được tham gia các ban bệ cán sự hoặc đại diện sinh viên.',
    consequence: 'Nếu 2 học kỳ liên tiếp bị xếp loại Yếu sẽ bị xem xét kỷ luật học vụ.'
  },
  {
    rank: 'Kém',
    minScore: 0,
    maxScore: 34,
    color: 'text-red-900 border-red-400',
    bgLight: 'bg-red-50',
    benefit: 'Không có quyền lợi.',
    consequence: 'Tạm đình chỉ học tập hoặc buộc thôi học theo Quy chế đào tạo nếu không cải thiện.'
  }
];

export const TDTU_CORE_RULES = {
  ceilingCap: {
    title: 'Quy tắc Chặn trần (Max 20 điểm / mỗi Cột)',
    subtitle: '5 Cột x 20 Điểm = 100 Điểm Tổng',
    description: 'Mỗi cột tối đa 20 điểm. Dù bạn tích lũy vượt quá (ví dụ Cột 4 được 35 điểm), hệ thống HTTTSV chỉ ghi nhận tối đa 20 điểm. Sinh viên bắt buộc phải phân bổ đều hoạt động giữa các cột thay vì dồn hết vào một cột!'
  },
  column2Default: {
    title: 'Cột 2: Mặc định 20đ - Bị trừ là không thể bù!',
    subtitle: 'Cột kỷ luật chuẩn của sinh viên TDTU',
    description: 'Đầu kỳ, mọi sinh viên tự động có sẵn 20/20 điểm Cột 2. Lưu ý cốt lõi: Bạn KHÔNG THỂ cày hoạt động ngoại khóa để bù lại điểm cột này một khi đã bị trừ (do quên thẻ SV, vi phạm đồng phục Thứ 2 & Thứ 5, trễ học phí, vi phạm KTX).'
  },
  recordingSystem: {
    title: 'Hệ thống Ghi nhận HTTTSV & Minh chứng',
    subtitle: 'Cổng thông tin & Mã QR điểm danh',
    description: 'Đăng ký qua Cổng thông tin / quét mã QR điểm danh đầu và cuối buổi -> Hệ thống tự động cập nhật lên Hệ thống thông tin sinh viên (HTTTSV). Kiểm tra lịch sử hàng tuần để kịp thời gửi phản hồi/khiếu nại nếu bị sót điểm.'
  }
};

export const TDTU_CRITERIA_LIST: TdtuCriterion[] = [
  {
    id: 1,
    name: 'Cột 1: Ý thức học tập',
    shortName: 'Ý thức học tập',
    maxScore: 20,
    description: 'Cột này đánh giá tinh thần, thái độ và kết quả trong học tập cũng như hoạt động khoa học. Gồm điểm GPA học kỳ, tham gia hội thảo/workshop học thuật, nghiên cứu khoa học (NCKH) và điểm trừ vi phạm thi cử.',
    howToEarn: [
      {
        activity: 'Kết quả học tập (GPA học kỳ)',
        points: 'Cộng theo thang GPA',
        note: 'Cộng điểm tăng dần dựa trên mức điểm trung bình học kỳ (thường từ 2.0 trở lên hệ 4, hoặc tính theo thang điểm xếp loại Khá, Giỏi, Xuất sắc).'
      },
      {
        activity: 'Ý thức tham gia câu lạc bộ / hoạt động học thuật',
        points: '+3 đến +5 điểm / lần',
        note: 'Tham gia các buổi hội thảo, workshop chuyên ngành, tọa đàm hướng nghiệp do Khoa hoặc Trường tổ chức.'
      },
      {
        activity: 'Nghiên cứu khoa học (NCKH) & Học thuật nâng cao',
        points: '+5 đến +15 điểm',
        note: 'Cộng điểm lớn nếu tham gia viết bài NCKH, tham gia các cuộc thi học thuật lớn cấp Khoa/Trường/Quốc gia hoặc đạt giải thưởng.'
      },
      {
        activity: 'Điểm trừ vi phạm học vụ & quy chế thi',
        points: 'Trừ điểm nặng',
        note: 'Bị trừ điểm nếu bị cảnh báo học vụ, vi phạm quy chế thi (bị đình chỉ thi hoặc khiển trách trong phòng thi).'
      }
    ],
    tips: [
      'Tham gia ít nhất 2 buổi TechTalk hoặc Hội thảo chuyên ngành của Khoa mỗi kỳ để tích lũy ngay 6-10 điểm hoạt động.',
      'Duy trì GPA từ 2.5 trở lên (loại Khá) để nắm chắc điểm nền tảng cho Cột 1.',
      'Tuyệt đối tuân thủ quy chế phòng thi để không bị trừ điểm học vụ.'
    ]
  },
  {
    id: 2,
    name: 'Cột 2: Việc chấp hành nội quy, quy chế, quy định',
    shortName: 'Chấp hành nội quy TDTU',
    maxScore: 20,
    description: 'Đây là cột "điểm chuẩn" đặc trưng của sinh viên TDTU nhằm đánh giá tính kỷ luật. Điểm mặc định ban đầu là 20 điểm. LƯU Ý CỐT LÕI: Bạn không thể cày hoạt động ngoại khóa để bù lại điểm cột này một khi đã bị trừ!',
    howToEarn: [
      {
        activity: 'Điểm mặc định ban đầu đầu học kỳ',
        points: '20 / 20 điểm',
        note: 'Vào đầu học kỳ, nếu bạn không vi phạm bất kỳ nội quy nào, hệ thống sẽ tự động cho tối đa 20 điểm.'
      },
      {
        activity: 'Chấp hành quy định Đồng phục TDTU bắt buộc',
        points: 'Bảo toàn điểm',
        note: 'Mặc đồng phục trường (áo truyền thống hoặc áo thun TDTU) vào các ngày quy định bắt buộc (Thứ Hai và Thứ Năm hàng tuần).'
      },
      {
        activity: 'Đeo thẻ sinh viên trong khuôn viên trường',
        points: 'Bảo toàn điểm',
        note: 'Luôn đeo thẻ sinh viên TDTU khi vào khuôn viên trường, thư viện truyền cảm hứng và các phòng ban.'
      },
      {
        activity: 'Quy tắc ứng xử văn minh & Đóng học phí đúng hạn',
        points: 'Bảo toàn điểm',
        note: 'Không nói tục, làm việc riêng, không gây mất trật tự trong lớp/thư viện; hoàn thành học phí đúng kỳ hạn của Nhà trường.'
      },
      {
        activity: 'Quy định xe & Nội quy nội trú Ký túc xá',
        points: 'Bảo toàn điểm',
        note: 'Đi xe đúng quy định trong trường, chấp hành nghiêm túc nội quy nội trú ký túc xá TDTU.'
      }
    ],
    tips: [
      'Ghi nhớ lịch: Thứ Hai và Thứ Năm BẮT BUỘC mặc áo truyền thống hoặc áo thun TDTU!',
      'Luôn đeo thẻ sinh viên trên cổ trước khi bước qua cổng trường.',
      'Cột này không thể bù bằng hoạt động ngoại khóa, do đó giữ trọn 20 điểm Cột 2 là chìa khóa đạt học bổng!'
    ]
  },
  {
    id: 3,
    name: 'Cột 3: Ý thức tham gia hoạt động chính trị, xã hội, văn hóa, thể thao',
    shortName: 'Văn hóa, Thể thao & Truyền thông',
    maxScore: 20,
    description: 'Cột này chủ yếu ghi nhận các hoạt động phong trào nhằm phát triển kỹ năng mềm và thể chất: văn hóa nghệ thuật, thể thao rèn luyện, tâm lý sức khỏe và tương tác truyền thông.',
    howToEarn: [
      {
        activity: 'Hoạt động văn hóa - nghệ thuật',
        points: '+3 đến +5 điểm / lần',
        note: 'Tham gia các đêm nhạc, hội diễn văn nghệ, ngày hội truyền thống của Khoa/Trường.'
      },
      {
        activity: 'Hoạt động rèn luyện thể thao',
        points: '+3 đến +5 điểm / giải',
        note: 'Tham gia giải chạy marathon, hội thao sinh viên TDTU, các giải đấu bóng đá, bóng rổ, cầu lông nội bộ.'
      },
      {
        activity: 'Hoạt động tâm lý, sức khỏe và tương tác',
        points: '+2 đến +4 điểm / buổi',
        note: 'Dự các buổi chia sẻ về kỹ năng sinh tồn, tư vấn tâm lý học đường, chăm sóc sức khỏe chủ động.'
      },
      {
        activity: 'Tương tác truyền thông Đoàn - Hội',
        points: '+1 đến +2 điểm / hoạt động',
        note: 'Like, share bài viết phát động phong trào, khảo sát trực tuyến theo yêu cầu của Đoàn - Hội.'
      }
    ],
    tips: [
      'Đăng ký tham gia giải chạy marathon hoặc Hội thao sinh viên TDTU để nhận ngay 4-5 điểm rèn luyện Cột 3.',
      'Theo dõi fanpage Đoàn trường / Hội sinh viên để làm các khảo sát trực tuyến và like/share nhận 1-2 điểm nhanh chóng.'
    ]
  },
  {
    id: 4,
    name: 'Cột 4: Ý thức công dân trong quan hệ cộng đồng - Tình nguyện',
    shortName: 'Cộng đồng & Tình nguyện',
    maxScore: 20,
    description: 'Đo lường tinh thần cống hiến, trách nhiệm với xã hội bên ngoài và tập thể. Bao gồm các chiến dịch tình nguyện lớn, hiến máu nhân đạo, quyên góp từ thiện và ngày Chủ nhật xanh.',
    howToEarn: [
      {
        activity: 'Chiến dịch tình nguyện lớn cấp Trường / Thành phố',
        points: '+10 đến +20 điểm (Trọn khung)',
        note: 'Tham gia chiến dịch Mùa hè xanh, Xuân tình nguyện, Tiếp sức mùa thi (được cộng điểm rất cao, thường trọn khung hoặc cộng điểm thưởng).'
      },
      {
        activity: 'Hoạt động nhân đạo thường niên (Hiến máu nhân đạo)',
        points: '+5 điểm / lần',
        note: 'Tham gia hiến máu nhân đạo tại trường (Đội Máu TDTU), quyên góp sách vở, quần áo, mua đồ hoặc tặng quà từ thiện cho trẻ em nghèo/mái ấm tình thương.'
      },
      {
        activity: 'Hoạt động bảo vệ môi trường',
        points: '+3 đến +5 điểm / buổi',
        note: 'Tham gia Ngày Chủ nhật xanh, dọn dẹp vệ sinh khuôn viên giảng đường hoặc khu vực công cộng lân cận.'
      }
    ],
    tips: [
      'Tham gia 1 lần Hiến máu nhân đạo (+5đ) và 2 buổi Ngày Chủ nhật xanh (+6đ-8đ) là công thức nhanh nhất để gom 12-15 điểm Cột 4.',
      'Nếu tham gia trọn vẹn Mùa hè xanh hoặc Xuân tình nguyện, bạn sẽ được cộng trọn 20 điểm Cột 4!'
    ]
  },
  {
    id: 5,
    name: 'Cột 5: Tinh thần tiên phong, gương mẫu / Công tác cán bộ',
    shortName: 'Tiên phong, Gương mẫu & Cán sự',
    maxScore: 20,
    description: 'Phần này tôn vinh năng lực lãnh đạo, tinh thần trách nhiệm cá nhân đối với tập thể lớp hoặc tổ chức lớn; cán sự lớp, BCH Đoàn Hội, danh hiệu Sinh viên 5 Tốt và gương người tốt việc tốt.',
    howToEarn: [
      {
        activity: 'Đảm nhiệm chức vụ cán bộ lớp / chi đoàn',
        points: '+10 đến +15 điểm',
        note: 'Ban cán sự lớp (Lớp trưởng, Lớp phó), Ban chấp hành Chi đoàn, Chi hội trưởng hoàn thành tốt nhiệm vụ.'
      },
      {
        activity: 'Thành viên tổ chức cốt cán cấp Trường / Khoa',
        points: '+10 đến +15 điểm',
        note: 'Thành viên Ban chấp hành Đoàn trường, Hội sinh viên trường, Chủ nhiệm/Phó chủ nhiệm các Câu lạc bộ/Đội/Nhóm chính thức được trường phê duyệt.'
      },
      {
        activity: 'Gương mẫu đặc biệt & Danh hiệu Sinh viên 5 Tốt',
        points: '+10 đến +20 điểm',
        note: 'Sinh viên đạt danh hiệu "Sinh viên 5 tốt" các cấp, có hành động dũng cảm cứu người, nhặt được của rơi trả lại người mất, hoặc đạt thành tích xuất sắc cấp quốc gia/quốc tế.'
      }
    ],
    tips: [
      'Nếu không làm cán sự lớp, hãy tích cực tham gia các tiêu chí xét "Sinh viên 5 Tốt" để được cộng điểm Cột 5.',
      'Gia nhập Ban chủ nhiệm hoặc ban điều hành của các CLB/Đội/Nhóm được trường phê duyệt.'
    ]
  }
];

/**
 * Công thức tối ưu săn ĐRL TDTU chuẩn (Mỗi Cột tối đa 20 điểm - Tổng 100 điểm)
 */
export const TDTU_FORMULA_RECOMMENDATIONS = {
  targetScholarship: {
    minRequired: 80,
    strategy: 'Giữ trọn 20đ Cột 2 (mặc định không vi phạm đồng phục Thứ 2 & Thứ 5, thẻ SV, học phí) + 14đ Cột 1 (GPA Khá + 2 workshop) + 14đ Cột 3 (Marathon + văn nghệ) + 15đ Cột 4 (1 lần Hiến máu + Chủ nhật xanh) + 15đ Cột 5 (Cán sự / CLB / SV5T) = 83 điểm (Xếp loại Tốt, đủ điều kiện xét Học bổng TDTU)!'
  },
  targetExcellent: {
    minRequired: 90,
    strategy: 'Giữ trọn 20đ Cột 2 + 18-20đ Cột 1 (GPA Giỏi/Xuất sắc hoặc viết NCKH) + 18-20đ Cột 3 (Hội thao TDTU + tương tác truyền thông) + trọn 20đ Cột 4 (Mùa hè xanh / Xuân tình nguyện hoặc 2 lần Hiến máu + bảo vệ môi trường) + 15-20đ Cột 5 (Cán sự nòng cốt / Sinh viên 5 Tốt) = 92 - 100 điểm Xuất sắc!'
  }
};
