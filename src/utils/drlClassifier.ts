import { ClassificationType, PostAnalysisResult, PostIntent } from '../types/index.ts';

// Definite ĐRL trigger keywords (lower-case)
export const DEFINITE_KEYWORDS = [
  'điểm rèn luyện',
  'đrl',
  'drl',
  'cộng điểm rèn luyện',
  'cộng đrl',
  'cộng drl',
  'ghi nhận đrl',
  'ghi nhận điểm rèn luyện',
  'cấp đrl',
  'điểm danh nhận đrl',
  'minh chứng đrl',
  'minh chứng tham gia',
  'tiêu chí 1',
  'tiêu chí 2',
  'tiêu chí 3',
  'tiêu chí 4',
  'tiêu chí 5',
  'tiêu chí i',
  'tiêu chí ii',
  'tiêu chí iii',
  'tiêu chí iv',
  'tiêu chí v',
  'quy chế rèn luyện',
  'cộng 3đ',
  'cộng 5đ',
  'cộng 2đ',
  'cộng 4đ',
  'cộng 10đ',
  'cộng 3 điểm',
  'cộng 5 điểm',
  'cộng 2 điểm',
  'cộng 4 điểm',
  '+3 đrl',
  '+5 đrl',
  '+2 đrl',
  '+4 đrl',
  '+3 điểm',
  '+5 điểm',
  'tiêu chí đánh giá rèn luyện',
  'phiếu đánh giá rèn luyện',
  'cộng điểm rèn luyện tiêu chí',
  'cộng điểm đrl',
  'cộng 1đ',
  'cộng 1 điểm',
  'cộng 6đ',
  'cộng 6 điểm',
  'cộng 7đ',
  'cộng 7 điểm',
  'cộng 8đ',
  'cộng 8 điểm',
  'cộng 15đ',
  'cộng 15 điểm',
  'cộng 20đ',
  'cấp giấy chứng nhận và cộng đrl',
  'ghi nhận minh chứng đrl',
  'minh chứng hoạt động rèn luyện',
  'cổng rèn luyện',
  'chấm điểm rèn luyện',
  'xét điểm rèn luyện',
  'công nhận đrl',
  'chứng nhận đrl',
  'link điểm danh nhận đrl',
  'quét mã qr nhận đrl',
  'điểm danh cuối buổi nhận đrl',
  'cộng điểm chuyên cần rèn luyện',
  'hoạt động cấp trường cộng đrl',
  'hoạt động cấp khoa cộng đrl'
];

// Potential ĐRL triggers (activities commonly giving training points)
export const POTENTIAL_KEYWORDS = [
  'workshop',
  'hội thảo',
  'tọa đàm',
  'talkshow',
  'webinar',
  'hiến máu',
  'tình nguyện',
  'mùa hè xanh',
  'xuân tình nguyện',
  'tiếp sức mùa thi',
  'sinh hoạt công dân',
  'cuộc thi',
  'ngày hội việc làm',
  'job fair',
  'diễn đàn',
  'ngoại khóa',
  'hoạt động ngoại khóa',
  'form đăng ký',
  'link đăng ký',
  'đăng ký tham gia',
  'quyền lợi:',
  'quyền lợi tham gia',
  'giấy chứng nhận',
  'chứng nhận tham gia',
  'certificate',
  'minh chứng',
  'sinh viên 5 tốt',
  'sv5t',
  'thanh niên tiên tiến',
  'ngày chủ nhật xanh',
  'tiếp sức người bệnh',
  'hội thao sinh viên',
  'giải bóng đá sinh viên',
  'hội diễn văn nghệ',
  'cuộc thi ý tưởng khởi nghiệp',
  'hackathon',
  'chuỗi tập huấn',
  'tập huấn cán bộ đoàn',
  'tập huấn ban cán sự',
  'diễn đàn sinh viên',
  'gặp gỡ đối thoại với lãnh đạo',
  'đối thoại sinh viên',
  'hội chợ việc làm',
  'lễ tuyên dương sinh viên',
  'trao học bổng doanh nghiệp',
  'tham quan doanh nghiệp',
  'company tour',
  'ngày hội sách',
  'hiến tiểu cầu',
  'chiến dịch tình nguyện',
  'đại hội đoàn',
  'hội nghị nghiên cứu khoa học sinh viên',
  'nckh sinh viên'
];

// Inquiry / Question keywords (post is seeking info, NOT announcing a DRL activity)
export const QUESTION_PATTERNS = [
  'cho em hỏi',
  'cho mình hỏi',
  'mọi người cho em hỏi',
  'mọi người cho mình hỏi',
  'anh chị cho em hỏi',
  'có ai biết',
  'ai có link form',
  'cho em xin link',
  'cho mình xin link',
  'ai có link',
  'có được cộng đrl không',
  'có được cộng điểm rèn luyện không',
  'có đrl ko',
  'được mấy đrl',
  'tính tiêu chí mấy vậy',
  'có ai tham gia chưa',
  'xin review',
  'hỏi về điểm rèn luyện',
  'sao em chưa thấy cộng đrl',
  'khi nào có đrl',
  'bao giờ cộng đrl',
  'bao giờ mở form'
];

/**
 * Detects whether the post is an inquiry/question vs official announcement
 */
export function detectPostIntent(text: string): PostIntent {
  const lower = text.toLowerCase().trim();
  
  // Check question patterns
  for (const q of QUESTION_PATTERNS) {
    if (lower.includes(q)) {
      return 'question';
    }
  }

  // If text is short, ends with '?', and contains question words
  if (lower.endsWith('?') || lower.includes('?')) {
    if (
      lower.includes('ở đâu') ||
      lower.includes('bao giờ') ||
      lower.includes('khi nào') ||
      lower.includes('như thế nào') ||
      lower.includes('không ạ') ||
      lower.includes('ko ạ') ||
      lower.includes('ai biết')
    ) {
      return 'question';
    }
  }

  // Check if announcement phrases are present
  if (
    lower.includes('thông báo') ||
    lower.includes('chính thức mở') ||
    lower.includes('phát động') ||
    lower.includes('kính gửi') ||
    lower.includes('ban tổ chức') ||
    lower.includes('đoàn trường') ||
    lower.includes('đoàn - hội') ||
    lower.includes('clb') ||
    lower.includes('link form đăng ký') ||
    lower.includes('quyền lợi sinh viên') ||
    lower.includes('hạn chót đăng ký')
  ) {
    return 'announcement';
  }

  return 'discussion';
}

/**
 * Extracts links from text, prioritizing form links (Google Forms, MS Forms, forms.gle, etc.)
 */
export function extractLinks(text: string): { allLinks: string[]; formLinks: string[] } {
  const urlRegex = /(https?:\/\/[^\s<>"'()]+)/gi;
  const matches = text.match(urlRegex) || [];
  
  const allLinks: string[] = [];
  const formLinks: string[] = [];

  for (const rawUrl of matches) {
    let cleanUrl = rawUrl.replace(/[.,;:)\]]+$/, ''); // Strip trailing punctuation
    
    // Unwrap Facebook redirect url if present
    if (cleanUrl.includes('l.facebook.com/l.php')) {
      try {
        const parsed = new URL(cleanUrl);
        const target = parsed.searchParams.get('u');
        if (target) {
          cleanUrl = decodeURIComponent(target);
        }
      } catch {
        // ignore
      }
    }

    if (!allLinks.includes(cleanUrl)) {
      allLinks.push(cleanUrl);
    }

    const lower = cleanUrl.toLowerCase();
    if (
      lower.includes('forms.gle') ||
      lower.includes('docs.google.com/forms') ||
      lower.includes('forms.office.com') ||
      lower.includes('form.jotform.com') ||
      lower.includes('typeform.com') ||
      lower.includes('surveymonkey.com') ||
      lower.includes('/form') ||
      lower.includes('bit.ly/form')
    ) {
      if (!formLinks.includes(cleanUrl)) {
        formLinks.push(cleanUrl);
      }
    }
  }

  return { allLinks, formLinks };
}

/**
 * Extracts fee or prize money distinctly from DRL points.
 * e.g., "Lệ phí: 20.000đ", "Giải thưởng: 5.000.000 VNĐ", "Miễn phí"
 */
export function extractFeeOrPrize(text: string): string | undefined {
  const lower = text.toLowerCase();

  if (lower.includes('miễn phí') || lower.includes('free') || lower.includes('0 đồng') || lower.includes('0đ')) {
    return 'Miễn phí tham gia';
  }

  // Prize money
  const prizeRegex = /(?:giải thưởng|tổng giải thưởng|giải nhất|thưởng|phần thưởng)[:\s]+([\d.,]+\s*(?:vnđ|vnd|triệu|k|đồng))/i;
  const prizeMatch = text.match(prizeRegex);
  if (prizeMatch) {
    return `Giải thưởng: ${prizeMatch[1].trim()}`;
  }

  // Entry fee
  const feeRegex = /(?:lệ phí|phí tham gia|giá vé|vé tham dự|chi phí)[:\s]+([\d.,]+\s*(?:vnđ|vnd|k|nghìn|đồng))/i;
  const feeMatch = text.match(feeRegex);
  if (feeMatch) {
    return `Lệ phí: ${feeMatch[1].trim()}`;
  }

  return undefined;
}

/**
 * Extracts points strictly for Training Points (ĐRL).
 * CRITICAL DISAMBIGUATION:
 * - Must NOT match money (50k, 50.000đ, 5.000.000 VNĐ).
 * - Must NOT match years (2024, 2025, 2026).
 * - Must NOT match phone numbers (090..., 091...).
 * - Must NOT match room numbers (P.601, Hội trường 6B).
 * - Must NOT match participant counts (300 sinh viên, 50 bạn).
 * - Points range at TDTU is usually 1 to 20 points per event.
 */
export function extractPoints(text: string): string | undefined {
  // Pattern 1: Explicit "+X ĐRL" or "+X điểm rèn luyện"
  const explicitDrlRegex = /(?:\+)\s*([1-9]|1[0-9]|20)\s*(?:đrl|drl|điểm rèn luyện|điểm)/i;
  const m1 = text.match(explicitDrlRegex);
  if (m1) {
    return `+${m1[1]} ĐRL`;
  }

  // Pattern 2: "cộng X điểm rèn luyện" or "cộng X đrl" or "cộng X điểm (tiêu chí...)"
  const congDrlRegex = /(?:cộng|được cộng|cấp|ghi nhận)\s*([1-9]|1[0-9]|20)\s*(?:đrl|drl|điểm rèn luyện|điểm)/i;
  const m2 = text.match(congDrlRegex);
  if (m2) {
    return `+${m2[1]} ĐRL`;
  }

  // Pattern 3: Within criteria context e.g. "Tiêu chí 3 (5đ)" or "Tiêu chí 1: 3 điểm"
  const critPointRegex = /tiêu chí\s*[1-5IV]+\s*(?:\([^)]*|\s*[-:]\s*)([1-9]|1[0-9]|20)\s*(?:đ|điểm)/i;
  const m3 = text.match(critPointRegex);
  if (m3) {
    return `+${m3[1]} ĐRL`;
  }

  // Pattern 4: "X điểm rèn luyện" (strictly 1 to 20)
  const standAloneDrlRegex = /\b([1-9]|1[0-9]|20)\s*(?:điểm rèn luyện|đrl|drl)\b/i;
  const m4 = text.match(standAloneDrlRegex);
  if (m4) {
    return `+${m4[1]} ĐRL`;
  }

  return undefined;
}

/**
 * Extracts the exact registration deadline (hạn chót đóng form / đăng ký).
 * Distinguishes from event time and publishing time!
 */
export function extractDeadline(text: string): string | undefined {
  // Look for lines specifically mentioning deadline or form closing
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower.includes('hạn chót') ||
      lower.includes('đóng form') ||
      lower.includes('hạn đăng ký') ||
      lower.includes('thời hạn') ||
      lower.includes('hạn cuối') ||
      lower.includes('thời gian đóng') ||
      lower.includes('trước ngày') ||
      lower.includes('kết thúc đăng ký') ||
      lower.includes('sẽ đóng')
    ) {
      // Remove leading label
      const clean = line
        .replace(/^.*?(?:thời hạn mở cổng đăng ký|thời hạn đăng ký|thời hạn|hạn chót|đóng form|hạn đăng ký|hạn cuối|thời gian đóng form|kết thúc đăng ký|form sẽ đóng|form đóng)[:\s]*/i, '')
        .trim();
      if (clean.length >= 4 && clean.length <= 80) {
        return clean;
      }
      return line.slice(0, 80);
    }
  }

  // Regex fallback
  const regex = /(?:hạn chót|đóng form|hạn đăng ký|hạn cuối)[:\s]+([^.\n\r]{5,65})/i;
  const m = text.match(regex);
  if (m) {
    return m[1].trim();
  }

  return undefined;
}

/**
 * Extracts the actual real event time / date.
 * Distinguishes from deadline or publishing date.
 */
export function extractEventTime(text: string): string | undefined {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();
    // Exclude deadline lines
    if (lower.includes('hạn chót') || lower.includes('đóng form') || lower.includes('hạn đăng ký')) {
      continue;
    }

    if (
      lower.includes('thời gian tổ chức') ||
      lower.includes('thời gian diễn ra') ||
      lower.includes('thời gian:') ||
      lower.includes('thời gian sự kiện') ||
      lower.includes('ngày diễn ra')
    ) {
      const clean = line
        .replace(/^.*?(?:thời gian diễn ra|thời gian tổ chức|thời gian sự kiện|thời gian|ngày diễn ra)[:\s]*/i, '')
        .trim();
      if (clean.length >= 4 && clean.length <= 80) {
        return clean;
      }
      return line.slice(0, 80);
    }
  }

  // Regex fallback
  const regex = /(?:thời gian diễn ra|thời gian tổ chức|thời gian sự kiện)[:\s]+([^.\n\r]{5,75})/i;
  const m = text.match(regex);
  if (m) {
    return m[1].trim();
  }

  return undefined;
}

/**
 * Extracts TDTU criteria and maps directly to column 1..5 (Max 20 pts each)
 */
export function extractCriteria(text: string): { criteriaText?: string; tdtuCriteriaId?: number } {
  const lower = text.toLowerCase();

  // Explicit check
  if (lower.includes('tiêu chí 1') || lower.includes('tiêu chí i\b') || lower.includes('tiêu chí i:') || lower.includes('cột 1')) {
    return { criteriaText: 'Cột 1: Ý thức học tập (max 20đ)', tdtuCriteriaId: 1 };
  }
  if (lower.includes('tiêu chí 2') || lower.includes('tiêu chí ii\b') || lower.includes('tiêu chí ii:') || lower.includes('cột 2')) {
    return { criteriaText: 'Cột 2: Chấp hành nội quy TDTU (max 20đ)', tdtuCriteriaId: 2 };
  }
  if (lower.includes('tiêu chí 3') || lower.includes('tiêu chí iii\b') || lower.includes('tiêu chí iii:') || lower.includes('cột 3')) {
    return { criteriaText: 'Cột 3: Văn hóa, Thể thao & Truyền thông (max 20đ)', tdtuCriteriaId: 3 };
  }
  if (lower.includes('tiêu chí 4') || lower.includes('tiêu chí iv\b') || lower.includes('tiêu chí iv:') || lower.includes('cột 4')) {
    return { criteriaText: 'Cột 4: Quan hệ cộng đồng & Tình nguyện (max 20đ)', tdtuCriteriaId: 4 };
  }
  if (lower.includes('tiêu chí 5') || lower.includes('tiêu chí v\b') || lower.includes('tiêu chí v:') || lower.includes('cột 5')) {
    return { criteriaText: 'Cột 5: Tiên phong, Gương mẫu & Cán sự (max 20đ)', tdtuCriteriaId: 5 };
  }

  // Heuristic mapping based on TDTU activities
  if (lower.includes('đồng phục') || lower.includes('thẻ sinh viên') || lower.includes('thẻ sv') || lower.includes('học phí') || lower.includes('ký túc xá') || lower.includes('nội quy')) {
    return { criteriaText: 'Cột 2: Chấp hành nội quy TDTU (max 20đ)', tdtuCriteriaId: 2 };
  }
  if (lower.includes('hiến máu') || lower.includes('mùa hè xanh') || lower.includes('xuân tình nguyện') || lower.includes('tiếp sức mùa thi') || lower.includes('chủ nhật xanh') || lower.includes('từ thiện') || lower.includes('tình nguyện')) {
    return { criteriaText: 'Cột 4: Quan hệ cộng đồng & Tình nguyện (max 20đ)', tdtuCriteriaId: 4 };
  }
  if (lower.includes('hội thao') || lower.includes('marathon') || lower.includes('văn nghệ') || lower.includes('đêm nhạc') || lower.includes('bóng đá') || lower.includes('bóng rổ') || lower.includes('cầu lông') || lower.includes('khảo sát trực tuyến') || lower.includes('like, share') || lower.includes('tâm lý')) {
    return { criteriaText: 'Cột 3: Văn hóa, Thể thao & Truyền thông (max 20đ)', tdtuCriteriaId: 3 };
  }
  if (lower.includes('workshop') || lower.includes('techtalk') || lower.includes('nckh') || lower.includes('học thuật') || lower.includes('company tour') || lower.includes('seminar') || lower.includes('gpa') || lower.includes('nghiên cứu khoa học')) {
    return { criteriaText: 'Cột 1: Ý thức học tập (max 20đ)', tdtuCriteriaId: 1 };
  }
  if (lower.includes('sinh viên 5 tốt') || lower.includes('sv5t') || lower.includes('cán sự') || lower.includes('lớp trưởng') || lower.includes('lớp phó') || lower.includes('bí thư') || lower.includes('bch đoàn') || lower.includes('chi hội trưởng')) {
    return { criteriaText: 'Cột 5: Tiên phong, Gương mẫu & Cán sự (max 20đ)', tdtuCriteriaId: 5 };
  }

  return {};
}

/**
 * Core deterministic rule engine to classify post text
 */
export function classifyPostContent(text: string): PostAnalysisResult {
  const lower = text.toLowerCase();
  const intent = detectPostIntent(text);
  const { formLinks, allLinks } = extractLinks(text);

  const matchedDefinite: string[] = [];
  for (const kw of DEFINITE_KEYWORDS) {
    if (lower.includes(kw)) {
      matchedDefinite.push(kw);
    }
  }

  const matchedPotential: string[] = [];
  for (const kw of POTENTIAL_KEYWORDS) {
    if (lower.includes(kw)) {
      matchedPotential.push(kw);
    }
  }

  const points = extractPoints(text);
  const feeOrPrize = extractFeeOrPrize(text);
  const deadline = extractDeadline(text);
  const eventTime = extractEventTime(text);
  const { criteriaText, tdtuCriteriaId } = extractCriteria(text);

  let classification: ClassificationType = 'none';
  let confidence = 10;
  let explanation = 'Không phát hiện thông tin liên quan đến Điểm Rèn Luyện (ĐRL).';

  // RULE A: Question / Inquiry detection
  // If the user is asking a question, do NOT classify as an official DRL post!
  if (intent === 'question') {
    classification = 'none';
    confidence = 85;
    explanation = 'Bài đăng dạng câu hỏi/thắc mắc của sinh viên, không phải thông báo mở form hay hoạt động cấp ĐRL chính thức.';
  }
  // RULE B: Definite ĐRL (Announcement + Explicit DRL)
  else if (matchedDefinite.length > 0 || (points && formLinks.length > 0)) {
    classification = 'definite';
    if (formLinks.length > 0) {
      confidence = 98;
      explanation = `Chắc chắn có ĐRL (${matchedDefinite.slice(0, 3).join(', ') || points}) và đã trích xuất được link form đăng ký.`;
    } else {
      confidence = 88;
      explanation = `Thông báo khẳng định cộng ĐRL (${matchedDefinite.slice(0, 3).join(', ') || points}).`;
    }
  }
  // RULE C: Potential ĐRL (Events commonly granting DRL at TDTU)
  else if (matchedPotential.length > 0 || formLinks.length > 0) {
    classification = 'potential';
    confidence = formLinks.length > 0 ? 75 : 60;
    explanation = `Hoạt động phong trào/học thuật (${matchedPotential.slice(0, 3).join(', ') || 'có form đăng ký'}), thường được cộng ĐRL theo Quy chế TDTU.`;
  }

  const keyPhrases = Array.from(new Set([...matchedDefinite, ...matchedPotential])).slice(0, 8);
  const targetFormUrls = formLinks.length > 0 ? formLinks : allLinks.slice(0, 3);

  const summary = generateQuickSummary(text, classification, points, deadline, intent);

  return {
    classification,
    confidence,
    keyPhrases,
    formUrls: targetFormUrls,
    summary,
    eventTime,
    deadline,
    points,
    criteria: criteriaText,
    intent,
    feeOrPrize,
    tdtuCriteriaId,
    explanation
  };
}

function generateQuickSummary(
  text: string,
  classification: ClassificationType,
  points?: string,
  deadline?: string,
  intent?: PostIntent
): string {
  if (intent === 'question') {
    const firstLine = text.split('\n').map((l) => l.trim()).filter(Boolean)[0] || 'Câu hỏi từ sinh viên';
    return `[THẮC MẮC] ${firstLine.slice(0, 95)}`;
  }

  const firstLine = text.split('\n').map((l) => l.trim()).filter(Boolean)[0] || 'Thông báo từ nhóm Facebook';
  const cleanTitle = firstLine.length > 90 ? firstLine.slice(0, 87) + '...' : firstLine;

  if (classification === 'definite') {
    return `[CÓ ĐRL] ${cleanTitle}${points ? ` • ${points}` : ''}${deadline ? ` • Hạn: ${deadline}` : ''}`;
  } else if (classification === 'potential') {
    return `[TIỀM NĂNG] ${cleanTitle}${deadline ? ` • Hạn: ${deadline}` : ''}`;
  }
  return cleanTitle;
}
