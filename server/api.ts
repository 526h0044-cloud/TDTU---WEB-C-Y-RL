import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { classifyPostContent, extractLinks } from '../src/utils/drlClassifier.ts';
import { PostAnalysisResult } from '../src/types/index.ts';

export const apiRouter = express.Router();

// Ensure res.json and res.status exist in all environments (Vite Connect & Express)
apiRouter.use((req, res: any, next) => {
  if (!res.status) {
    res.status = function (code: number) {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = function (data: any) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }
  next();
});

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Real Facebook URL metadata fetcher
// Fetches real OpenGraph title & description directly from Facebook public posts
apiRouter.post('/fetch-facebook-post', async (req: Request, res: Response) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string' || !url.includes('facebook.com')) {
      return res.status(400).json({ error: 'URL Facebook không hợp lệ' });
    }

    const cleanUrl = url.trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const fbRes = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    const html = await fbRes.text();

    // Extract OpenGraph tags
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i);
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);

    const title = ogTitleMatch ? decodeHtmlEntities(ogTitleMatch[1]) : '';
    const description = ogDescMatch ? decodeHtmlEntities(ogDescMatch[1]) : '';

    const combinedContent = [title, description].filter(Boolean).join('\n\n');

    return res.json({
      success: true,
      url: cleanUrl,
      title,
      description,
      combinedContent,
      hasContent: combinedContent.length > 0
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: 'Không thể tự động đọc HTML từ Facebook do chính sách bảo mật/đăng nhập. Vui lòng sao chép nội dung bài viết và dán trực tiếp.'
    });
  }
});

// Real Form Link Status Checker (Checks whether Google Forms/MS Forms are still open)
apiRouter.post('/check-form-url', async (req: Request, res: Response) => {
  try {
    const { formUrl } = req.body || {};
    if (!formUrl || typeof formUrl !== 'string') {
      return res.status(400).json({ error: 'URL form không hợp lệ' });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const formRes = await fetch(formUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml'
      }
    });
    clearTimeout(timeoutId);

    const status = formRes.status;
    const text = await formRes.text();
    const lower = text.toLowerCase();

    // Check common closed form messages
    const isClosed =
      lower.includes('đã dừng nhận câu trả lời') ||
      lower.includes('no longer accepting responses') ||
      lower.includes('không còn nhận phản hồi') ||
      lower.includes('form đã đóng') ||
      lower.includes('closed') ||
      status === 404;

    return res.json({
      formUrl,
      status: status,
      isOpen: status === 200 && !isClosed,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return res.json({
      formUrl: req.body?.formUrl,
      status: 'unknown',
      isOpen: true, // assume reachable if timeout
      checkedAt: new Date().toISOString()
    });
  }
});

// AI Post Analysis Endpoint with Advanced Disambiguation & TDTU Domain Knowledge
apiRouter.post('/analyze-post', async (req: Request, res: Response) => {
  try {
    const { content, postUrl } = req.body || {};
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Nội dung bài viết không hợp lệ' });
    }

    // 1. Run deterministic classifier first as fast verified baseline
    const baseline = classifyPostContent(content);

    // 2. Try Gemini Flash if API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `
Bạn là Chuyên gia Cố vấn Điểm Rèn Luyện (ĐRL) cao cấp tại Trường Đại học Tôn Đức Thắng (TDTU).
Hãy phân tích bài đăng Facebook sau đây từ các nhóm trường đại học để trích xuất thông tin SĂN ĐIỂM RÈN LUYỆN chuẩn xác:

"""
${content.slice(0, 4000)}
"""

Quy định ĐRL của Đại học Tôn Đức Thắng (TDTU) bao gồm 5 Cột (TỐI ĐA 20 ĐIỂM MỖI CỘT - TỔNG 100 ĐIỂM):
- Cột 1: Ý thức học tập (Tối đa 20đ): GPA học kỳ (hệ 4 / Khá, Giỏi, Xuất sắc), hoạt động CLB học thuật, hội thảo, workshop chuyên ngành, tọa đàm hướng nghiệp (+3-5đ), NCKH & thi học thuật lớn (+5-15đ). Trừ điểm nếu cảnh báo học vụ hoặc vi phạm quy chế thi.
- Cột 2: Việc chấp hành nội quy, quy chế, quy định (Tối đa 20đ): MẶC ĐỊNH ĐẦU KỲ CÓ SẴN 20 ĐIỂM. KHÔNG THỂ BÙ ĐIỂM NGOẠI KHÓA KHI BỊ TRỪ! Trừ điểm nặng do: Không mặc đồng phục trường (áo truyền thống hoặc áo thun TDTU) vào Thứ Hai và Thứ Năm; không đeo thẻ sinh viên; vi phạm quy tắc ứng xử/gây mất trật tự; đóng học phí trễ; vi phạm giao thông/KTX.
- Cột 3: Ý thức tham gia hoạt động chính trị, xã hội, văn hóa, thể thao (Tối đa 20đ): Văn hóa nghệ thuật (đêm nhạc, hội diễn văn nghệ +3-5đ), thể thao (marathon, hội thao sinh viên TDTU, bóng đá, bóng rổ, cầu lông +3-5đ), tâm lý, kỹ năng sinh tồn, chăm sóc sức khỏe (+2-4đ), tương tác truyền thông (like, share, khảo sát trực tuyến Đoàn - Hội +1-2đ).
- Cột 4: Ý thức công dân trong quan hệ cộng đồng - Tình nguyện (Tối đa 20đ): Chiến dịch tình nguyện lớn (Mùa hè xanh, Xuân tình nguyện, Tiếp sức mùa thi +10-20đ trọn khung), hoạt động nhân đạo thường niên (hiến máu nhân đạo +5đ, quyên góp từ thiện), bảo vệ môi trường (Ngày Chủ nhật xanh +3-5đ, dọn dẹp khuôn viên).
- Cột 5: Tinh thần tiên phong, gương mẫu / Công tác cán bộ (Tối đa 20đ): Chức vụ cán sự lớp, BCH Chi đoàn (+10-15đ), BCH Đoàn - Hội, Ban chủ nhiệm CLB chính thức (+10-15đ), danh hiệu "Sinh viên 5 tốt", hành động dũng cảm cứu người, nhặt được của rơi (+10-20đ).

2 LƯU Ý CỐT LÕI TDTU:
1. Quy tắc chặn trần: Mỗi cột tối đa 20 điểm. Tích lũy vượt quá (VD cột 4 được 35đ) thì HTTTSV chỉ ghi nhận tối đa 20đ. Phải phân bổ đều hoạt động.
2. Hệ thống ghi nhận: Đăng ký qua Cổng thông tin / quét mã QR điểm danh -> cập nhật lên Hệ thống thông tin sinh viên (HTTTSV).

YÊU CẦU PHÂN BIỆT ĐẶC BIỆT QUAN TRỌNG:
1. PHÂN BIỆT Ý ĐỊNH NGƯỜI ĐĂNG (INTENT):
   - "question": Người đăng đang hỏi/thắc mắc/xin xỏ (VD: "Cho em hỏi hoạt động này có ĐRL không ạ?", "Ai có link form cho em xin...", "Bao giờ mở form?"). KHI LÀ QUESTION: BẮT BUỘC đặt "classification": "none", giải thích rõ là câu hỏi của sinh viên, không phải bài đăng mở form chính thức!
   - "announcement": Bài đăng thông báo chính thức từ BTC, Đoàn - Hội, Khoa, CLB về sự kiện, mở đơn, có quyền lợi rõ ràng.
   - "discussion": Chia sẻ kinh nghiệm, thảo luận chung.

2. PHÂN BIỆT THỜI GIAN THỰC TẾ (KHI CÓ NHIỀU MỐC THỜI GIAN):
   - "eventTime": Thời gian thực sự diễn ra sự kiện/workshop/buổi hiến máu/tọa đàm (VD: "08:00 - 11:30 ngày 15/11/2026").
   - "deadline": Hạn chót ĐÓNG FORM đăng ký (VD: "Trước 20:00 ngày 10/11/2026"). TUYỆT ĐỐI KHÔNG nhầm lẫn hạn đóng form với thời gian diễn ra sự kiện!

3. PHÂN BIỆT TIỀN / LỆ PHÍ VÀ ĐIỂM RÈN LUYỆN:
   - "points": CHỈ LÀ SỐ ĐIỂM RÈN LUYỆN (thường từ 1 đến 20 điểm, VD: "+5 ĐRL", "3 điểm rèn luyện", "+10đ Tiêu chí 2"). TUYỆT ĐỐI KHÔNG lấy số tiền (50k, 50.000 VNĐ, 5 triệu đồng) hoặc năm (2024, 2026) hoặc số phòng (P.601) hoặc số lượng sinh viên (300 bạn) làm điểm!
   - "feeOrPrize": Nếu có lệ phí tham gia (VD: "20.000đ") hoặc giải thưởng cuộc thi (VD: "Giải nhất 5.000.000đ") hoặc "Miễn phí", hãy trích xuất vào đây.

Hãy trả về định dạng JSON thuần túy theo schema:
{
  "classification": "definite" | "potential" | "none",
  "confidence": number (0 đến 100),
  "intent": "announcement" | "question" | "discussion",
  "keyPhrases": string[],
  "formUrls": string[],
  "summary": string (tóm tắt cực ngắn 1-2 câu tiếng Việt),
  "eventTime": string (thời gian diễn ra sự kiện hoặc null nếu không có),
  "deadline": string (hạn chót đóng form đăng ký hoặc null nếu không có),
  "points": string (chỉ số điểm rèn luyện ví dụ "+5 ĐRL", "+3 điểm" hoặc null),
  "feeOrPrize": string (lệ phí tham gia hoặc giải thưởng hoặc null),
  "criteria": string (tiêu chí TDTU ví dụ "Tiêu chí 3 (Hoạt động Xã hội & Tình nguyện)" hoặc null),
  "tdtuCriteriaId": number (1, 2, 3, 4, 5 hoặc null),
  "explanation": string (lý do phân loại ngắn gọn, chỉ rõ cơ sở ĐRL TDTU)
}
`;

        const aiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI timeout')), 4500)
        );

        const aiResponse = (await Promise.race([aiPromise, timeoutPromise])) as any;
        const responseText = aiResponse?.text;

        if (responseText) {
          const parsed = JSON.parse(responseText);

          // Merge AI results with detected form links to never miss direct links
          const mergedForms = Array.from(new Set([...(parsed.formUrls || []), ...baseline.formUrls]));
          const mergedKeyPhrases = Array.from(new Set([...(parsed.keyPhrases || []), ...baseline.keyPhrases]));

          const result: PostAnalysisResult & { source: string } = {
            classification: parsed.intent === 'question' ? 'none' : (parsed.classification || baseline.classification),
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : baseline.confidence,
            intent: parsed.intent || baseline.intent,
            keyPhrases: mergedKeyPhrases.slice(0, 10),
            formUrls: mergedForms,
            summary: parsed.summary || baseline.summary,
            eventTime: parsed.eventTime || baseline.eventTime,
            deadline: parsed.deadline || baseline.deadline,
            points: parsed.points || baseline.points,
            feeOrPrize: parsed.feeOrPrize || baseline.feeOrPrize,
            criteria: parsed.criteria || baseline.criteria,
            tdtuCriteriaId: parsed.tdtuCriteriaId || baseline.tdtuCriteriaId,
            explanation: parsed.explanation || baseline.explanation,
            source: 'gemini-3.8-flash'
          };

          return res.json(result);
        }
      } catch (aiErr) {
        // Fallback gracefully to upgraded deterministic baseline
      }
    }

    return res.json({
      ...baseline,
      source: 'heuristic-nlp'
    });
  } catch (error) {
    console.error('Error analyzing post:', error);
    return res.status(500).json({ error: 'Lỗi phân tích bài viết' });
  }
});

// AI TDTU DRL Advisor Endpoint (Chat & Guidance about TDTU rules)
apiRouter.post('/tdtu-advisor', async (req: Request, res: Response) => {
  try {
    const { question, currentScore } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Vui lòng nhập câu hỏi' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `
Bạn là Trợ lý AI Cố vấn Điểm Rèn Luyện chính thức của sinh viên Đại học Tôn Đức Thắng (TDTU).
Hãy giải đáp câu hỏi của sinh viên một cách súc tích, chính xác và thực tế dựa trên Quy chế ĐRL của TDTU:

Thông tin sinh viên:
- Điểm rèn luyện hiện tại: ${currentScore || 0} điểm
- Câu hỏi của sinh viên: "${question}"

Quy chế ĐRL TDTU cốt lõi (5 Cột x 20 Điểm = 100 Điểm Tổng):
1. Cột 1 (Ý thức học tập - max 20đ): GPA học kỳ (hệ 4 / Khá, Giỏi, Xuất sắc), hội thảo/workshop học thuật của Khoa (+3-5đ), NCKH & thi học thuật (+5-15đ). Trừ điểm nếu bị cảnh báo học vụ hoặc vi phạm thi cử.
2. Cột 2 (Nội quy TDTU - max 20đ): MẶC ĐỊNH ĐẦU KỲ 20 ĐIỂM. KHÔNG THỂ CÀY HOẠT ĐỘNG BÙ ĐIỂM KHI BỊ TRỪ! Các lỗi trừ nặng: Không mặc đồng phục trường (áo truyền thống hoặc áo thun TDTU) vào Thứ Hai và Thứ Năm; không đeo thẻ sinh viên; mất trật tự; trễ học phí; vi phạm KTX.
3. Cột 3 (Văn hóa, thể thao, chính trị xã hội - max 20đ): Văn nghệ (+3-5đ), Hội thao sinh viên TDTU, marathon (+3-5đ), kỹ năng sinh tồn/tâm lý (+2-4đ), like/share khảo sát Đoàn - Hội (+1-2đ).
4. Cột 4 (Cộng đồng & Tình nguyện - max 20đ): Mùa hè xanh, Xuân tình nguyện (+10-20đ trọn khung), Hiến máu nhân đạo (+5đ/lần), Ngày Chủ nhật xanh (+3-5đ/buổi), từ thiện.
5. Cột 5 (Tiên phong, gương mẫu & Cán sự - max 20đ): Cán sự lớp, BCH Chi đoàn (+10-15đ), BCH Đoàn - Hội, Ban chủ nhiệm CLB (+10-15đ), Sinh viên 5 Tốt, cứu người/nhặt được của rơi (+10-20đ).

2 QUY TẮC CỐT LÕI:
- Quy tắc chặn trần: Mỗi cột tối đa 20 điểm. Điểm vượt trần không được tính vào tổng điểm. Sinh viên phải phân bổ hoạt động đều cả 5 cột.
- Hệ thống ghi nhận: Điểm danh qua Cổng thông tin / mã QR -> cập nhật lên Hệ thống thông tin sinh viên (HTTTSV).
Xếp loại: Xuất sắc (>=90đ), Tốt (>=80đ - điều kiện nhận Học bổng), Khá (>=65đ), TB (>=50đ), Yếu (<50đ).

Hãy đưa ra lời khuyên cụ thể, ngắn gọn (dưới 150 từ), có bullet points rõ ràng để sinh viên hành động ngay!
`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        return res.json({
          answer: aiResponse.text,
          source: 'gemini-3.8-flash'
        });
      } catch (e) {
        // Fallback
      }
    }

    return res.json({
      answer: `Để đạt mốc 80 điểm rèn luyện (xếp loại Tốt để xét Học bổng TDTU):
1. Cột 2 (20/20đ): Tuyệt đối không vi phạm nội quy, luôn đeo thẻ sinh viên và mặc áo truyền thống/áo thun TDTU vào Thứ Hai & Thứ Năm để bảo toàn trọn vẹn 20đ mặc định (cột này không thể bù điểm ngoại khóa).
2. Cột 4 (15-20/20đ): Tham gia 1 đợt Hiến máu tình nguyện (+5đ) + 2 buổi Ngày Chủ nhật xanh (+6-8đ) hoặc chiến dịch Mùa hè xanh (+20đ).
3. Cột 1 (14-16/20đ): Đạt GPA Khá/Giỏi (+4-6đ) + tham gia 2 buổi Hội thảo / TechTalk của Khoa (+6-8đ).
4. Cột 3 (10-14/20đ): Tham gia giải chạy marathon hoặc hội thao sinh viên TDTU (+4-5đ) và làm khảo sát trực tuyến Đoàn - Hội (+2đ).
5. Cột 5 (10-15/20đ): Tham gia cán sự lớp, ban chủ nhiệm CLB hoặc nộp hồ sơ Sinh viên 5 Tốt.
Lưu ý quy tắc chặn trần: Mỗi cột tối đa 20 điểm!`,
      source: 'knowledge-base'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi phản hồi tư vấn' });
  }
});

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}
