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

// AI Post Analysis Endpoint
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
        const ai = new GoogleGenAI();
        const prompt = `
Phân tích bài đăng Facebook sau đây từ các nhóm sinh viên trường đại học Việt Nam để phục vụ việc SĂN ĐIỂM RÈN LUYỆN (ĐRL):

"""
${content.slice(0, 4000)}
"""

Hãy trả về định dạng JSON thuần túy theo schema:
{
  "classification": "definite" | "potential" | "none",
  "confidence": number (từ 0 đến 100),
  "keyPhrases": string[],
  "formUrls": string[],
  "summary": string (tóm tắt cực ngắn 1-2 câu tiếng Việt),
  "eventTime": string (thời gian diễn ra sự kiện hoặc null nếu không có),
  "deadline": string (hạn chót đóng form hoặc null nếu không có),
  "points": string (số điểm rèn luyện ví dụ "+3 ĐRL", "5 điểm" hoặc null),
  "criteria": string (tiêu chí rèn luyện ví dụ "Tiêu chí 3", "Tiêu chí 1.2" hoặc null),
  "explanation": string (lý do phân loại ngắn gọn)
}
Lưu ý quy tắc phân loại:
- "definite": Bài viết khẳng định có cộng điểm rèn luyện/ĐRL/minh chứng/quy chế rèn luyện/tiêu chí đánh giá hoặc có link form điểm danh ĐRL.
- "potential": Bài viết về workshop, hội thảo, talkshow, tình nguyện, hiến máu, sinh hoạt công dân, cuộc thi nhưng chưa ghi rõ mức điểm.
- "none": Bài đăng pass đồ, tin thuê trọ, quảng cáo bán khóa học ngoài luồng, không liên quan ĐRL.
`;

        const aiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI timeout')), 4000)
        );

        const aiResponse = (await Promise.race([aiPromise, timeoutPromise])) as any;

        const responseText = aiResponse?.text;
        if (responseText) {
          const parsed = JSON.parse(responseText);

          // Merge AI results with detected form links to never miss direct links
          const mergedForms = Array.from(new Set([...(parsed.formUrls || []), ...baseline.formUrls]));
          const mergedKeyPhrases = Array.from(new Set([...(parsed.keyPhrases || []), ...baseline.keyPhrases]));

          const result: PostAnalysisResult & { source: string } = {
            classification: parsed.classification || baseline.classification,
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : baseline.confidence,
            keyPhrases: mergedKeyPhrases.slice(0, 10),
            formUrls: mergedForms,
            summary: parsed.summary || baseline.summary,
            eventTime: parsed.eventTime || baseline.eventTime,
            deadline: parsed.deadline || baseline.deadline,
            points: parsed.points || baseline.points,
            criteria: parsed.criteria || baseline.criteria,
            explanation: parsed.explanation || baseline.explanation,
            source: 'gemini-3.8-flash'
          };

          return res.json(result);
        }
      } catch (aiErr) {
        // Fallback gracefully to verified baseline
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
