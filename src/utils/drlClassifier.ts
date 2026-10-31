import { ClassificationType, PostAnalysisResult } from '../types/index.ts';

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
  // 25+ new university specific definite keywords
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
  // 25+ new university specific potential keywords
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

/**
 * Extracts links from text, prioritizing form links (Google Forms, MS Forms, forms.gle, etc.)
 */
export function extractLinks(text: string): { allLinks: string[]; formLinks: string[] } {
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s<>"'()]+)/gi;
  const matches = text.match(urlRegex) || [];
  
  const allLinks: string[] = [];
  const formLinks: string[] = [];

  for (const rawUrl of matches) {
    let cleanUrl = rawUrl.replace(/[.,;:)\]]+$/, ''); // Strip trailing punctuation
    
    // Unwrap Facebook redirect url if present: https://l.facebook.com/l.php?u=ENCODED_URL
    if (cleanUrl.includes('l.facebook.com/l.php')) {
      try {
        const parsed = new URL(cleanUrl);
        const target = parsed.searchParams.get('u');
        if (target) {
          cleanUrl = decodeURIComponent(target);
        }
      } catch {
        // ignore parse error
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
 * Extracts points mentioned in the post (e.g. "+5 điểm", "3 điểm rèn luyện", "Tiêu chí 3 (5đ)")
 */
export function extractPoints(text: string): string | undefined {
  const pointsRegex = /(?:\+|\b(?:cộng|được|nhận)\s*)?(\d+(?:\.\d+)?)\s*(?:đ|điểm|points?)(?:\s*(?:rèn luyện|đrl|drl))?/i;
  const match = text.match(pointsRegex);
  if (match) {
    return match[0].trim();
  }
  return undefined;
}

/**
 * Extracts deadline (hạn chót / đóng form)
 */
export function extractDeadline(text: string): string | undefined {
  const deadlineRegex = /(?:hạn chót|đóng form|thời gian đóng form|hạn đăng ký|hạn cuối)[:\s]+([^.\n\r]{5,60})/i;
  const match = text.match(deadlineRegex);
  if (match) {
    return match[1].trim();
  }
  return undefined;
}

/**
 * Extracts event time / date
 */
export function extractEventTime(text: string): string | undefined {
  const timeRegex = /(?:thời gian diễn ra|thời gian tổ chức|thời gian)[:\s]+([^.\n\r]{5,70})/i;
  const match = text.match(timeRegex);
  if (match) {
    return match[1].trim();
  }
  return undefined;
}

/**
 * Extracts student criteria category (Tiêu chí 1, 2, 3, 4, 5)
 */
export function extractCriteria(text: string): string | undefined {
  const critRegex = /(tiêu chí\s*(?:[1-5]|i{1,3}|iv|v)(?:\.[0-9]+)?)/i;
  const match = text.match(critRegex);
  if (match) {
    return match[0].trim().toUpperCase();
  }
  return undefined;
}

/**
 * Core deterministic rule engine to classify post text into definite / potential / none
 */
export function classifyPostContent(text: string): PostAnalysisResult {
  const lower = text.toLowerCase();
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
  const deadline = extractDeadline(text);
  const eventTime = extractEventTime(text);
  const criteria = extractCriteria(text);

  let classification: ClassificationType = 'none';
  let confidence = 10;
  let explanation = 'Không phát hiện thông tin liên quan đến Điểm Rèn Luyện (ĐRL).';

  // Rule 1: Chắc chắn có ĐRL (DEFINITE)
  // Has explicit definite keywords (e.g. "điểm rèn luyện", "ĐRL", "tiêu chí 3")
  if (matchedDefinite.length > 0) {
    classification = 'definite';
    // If form link is present, confidence shoots up to 95-99%
    if (formLinks.length > 0) {
      confidence = 98;
      explanation = `Chắc chắn có ĐRL (${matchedDefinite.slice(0, 3).join(', ')}) và đã tìm thấy link Form đăng ký trực tiếp.`;
    } else {
      confidence = 88;
      explanation = `Bài viết xác nhận cấp ĐRL (${matchedDefinite.slice(0, 3).join(', ')}).`;
    }
  } 
  // Rule 2: Có thể có ĐRL (POTENTIAL)
  // Has potential keywords (workshop, hội thảo, hiến máu, tình nguyện) OR has a form link with university activity words
  else if (matchedPotential.length > 0 || formLinks.length > 0) {
    classification = 'potential';
    confidence = formLinks.length > 0 ? 75 : 60;
    explanation = `Bài viết về hoạt động sự kiện (${matchedPotential.slice(0, 3).join(', ') || 'có form đăng ký'}), thường sẽ được xét cộng ĐRL theo quy chế trường.`;
  }

  const keyPhrases = Array.from(new Set([...matchedDefinite, ...matchedPotential])).slice(0, 8);
  const targetFormUrls = formLinks.length > 0 ? formLinks : allLinks.slice(0, 3);

  // Generate a concise 1-2 sentence Vietnamese summary
  const summary = generateQuickSummary(text, classification, points, deadline);

  return {
    classification,
    confidence,
    keyPhrases,
    formUrls: targetFormUrls,
    summary,
    eventTime,
    deadline,
    points,
    criteria,
    explanation
  };
}

function generateQuickSummary(
  text: string,
  classification: ClassificationType,
  points?: string,
  deadline?: string
): string {
  const firstLine = text.split('\n').map(l => l.trim()).filter(Boolean)[0] || 'Thông báo từ nhóm Facebook';
  const cleanTitle = firstLine.length > 100 ? firstLine.slice(0, 97) + '...' : firstLine;
  
  if (classification === 'definite') {
    return `[CÓ ĐRL] ${cleanTitle}${points ? ` • ${points}` : ''}${deadline ? ` • Hạn: ${deadline}` : ''}`;
  } else if (classification === 'potential') {
    return `[TIỀM NĂNG] ${cleanTitle}${deadline ? ` • Hạn: ${deadline}` : ''}`;
  }
  return cleanTitle;
}
