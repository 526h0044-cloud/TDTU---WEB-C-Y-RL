import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePostId, fnv1aHash } from './hash';
import { classifyPostContent, extractLinks, extractPoints, extractDeadline } from './drlClassifier';

test('generatePostId extracts facebook post id when present in URL', () => {
  const url = 'https://www.facebook.com/groups/tdtusinhvien/posts/10159483829482912/';
  const id = generatePostId(url, 'Nội dung bài viết');
  assert.equal(id, 'fb_post_10159483829482912');
});

test('generatePostId produces deterministic deduplication hash for generic urls', () => {
  const url = 'https://facebook.com/tdtu.clbkynang';
  const content = '[THÔNG BÁO] Hội thảo kỹ năng phỏng vấn tuyển dụng 2026';
  const id1 = generatePostId(url, content);
  const id2 = generatePostId(url, content);
  assert.equal(id1, id2);
  assert.match(id1, /^[a-zA-Z0-9_\-]+$/);
  assert.ok(id1.length <= 128);
});

test('extractLinks parses Google forms and unwraps facebook redirects', () => {
  const rawText = `
    Đăng ký ngay tại link: https://forms.gle/XYZ123abc
    Hoặc qua link dự phòng: https://l.facebook.com/l.php?u=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2Fe%2F1FAIpQLSc_test%2Fviewform
  `;
  const { formLinks } = extractLinks(rawText);
  assert.equal(formLinks.length, 2);
  assert.ok(formLinks.includes('https://forms.gle/XYZ123abc'));
  assert.ok(formLinks.includes('https://docs.google.com/forms/d/e/1FAIpQLSc_test/viewform'));
});

test('classifyPostContent marks posts with explicit training point phrases as definite', () => {
  const post = `
    [ĐOÀN - HỘI KHOA CNTT]
    TỌA ĐÀM: XÂY DỰNG CV & PHỎNG VẤN IT CHUYÊN NGHIỆP
    - Thời gian: 08:30 ngày 15/11/2026
    - Quyền lợi: Cộng 5 điểm rèn luyện (Tiêu chí 3) cho tất cả sinh viên tham dự đủ buổi.
    - Hạn chót: 20:00 ngày 14/11/2026 hoặc đến khi đủ 200 bạn.
    - Link form đăng ký: https://forms.gle/cvworkshop2026
  `;
  const result = classifyPostContent(post);
  assert.equal(result.classification, 'definite');
  assert.ok(result.confidence >= 90);
  assert.equal(result.formUrls[0], 'https://forms.gle/cvworkshop2026');
  assert.ok(result.keyPhrases.includes('điểm rèn luyện') || result.keyPhrases.includes('cộng 5 điểm'));
});

test('classifyPostContent marks activity post without explicit DRL as potential', () => {
  const post = `
    [CLB TIẾNG ANH]
    ENGLISH SPEAKING CLUB: COFFEE & CHAT
    - Thời gian: 18h00 Thứ 6 tuần này
    - Địa điểm: Sảnh nhà B
    - Tham gia cùng tụi mình để giao lưu với diễn giả người bản xứ nha!
    - Link đăng ký: https://forms.gle/englishclub
  `;
  const result = classifyPostContent(post);
  assert.equal(result.classification, 'potential');
  assert.ok(result.confidence >= 60);
});

test('classifyPostContent marks casual irrelevant post as none', () => {
  const post = `
    Cần pass lại máy tính Casio fx-580vn plus còn mới 99% giá sinh viên 350k tại ký túc xá.
    Ai quan tâm inbox mình nhé!
  `;
  const result = classifyPostContent(post);
  assert.equal(result.classification, 'none');
  assert.equal(result.formUrls.length, 0);
});

test('extractPoints and extractDeadline parse standard Vietnamese formats', () => {
  const sample = 'Quyền lợi: cộng 5 điểm rèn luyện. Hạn chót: 23:59 ngày 30/11/2026.';
  const pts = extractPoints(sample);
  assert.ok(pts?.includes('5'));
  const dl = extractDeadline(sample);
  assert.ok(dl?.includes('30/11/2026'));
});

test('new DEFINITE_KEYWORDS match specific phrases like tiêu chí đánh giá rèn luyện, quét mã qr nhận đrl', () => {
  const sample1 = 'Sinh viên tham gia quét mã qr nhận đrl vào cuối buổi tọa đàm.';
  const res1 = classifyPostContent(sample1);
  assert.equal(res1.classification, 'definite');

  const sample2 = 'Cộng điểm chuyên cần rèn luyện cho các bạn điểm danh qua link.';
  const res2 = classifyPostContent(sample2);
  assert.equal(res2.classification, 'definite');
});

test('new POTENTIAL_KEYWORDS match phrases like sinh viên 5 tốt, sv5t, hackathon, ngày chủ nhật xanh', () => {
  const sample1 = 'Phát động phong trào Sinh viên 5 tốt (SV5T) năm học 2026-2027 toàn trường.';
  const res1 = classifyPostContent(sample1);
  assert.equal(res1.classification, 'potential');

  const sample2 = 'Đăng ký tham gia cuộc thi Hackathon công nghệ và nhận giấy chứng nhận.';
  const res2 = classifyPostContent(sample2);
  assert.equal(res2.classification, 'potential');
});

test('detects question intent correctly and avoids false definite alarms', () => {
  const questionPost = `
    Dạ cho em hỏi có anh chị nào biết buổi workshop AI ngày mai có được cộng điểm rèn luyện không ạ?
    Em tìm mãi không thấy link form điểm danh đâu hết. Ai biết cho em xin thông tin với!
  `;
  const result = classifyPostContent(questionPost);
  assert.equal(result.intent, 'question');
  assert.notEqual(result.classification, 'definite');
});

test('disambiguates entrance fee and prizes from training points (DRL)', () => {
  const post = `
    [CUỘC THI HÙNG BIỆN TIẾNG ANH TDTU]
    - Lệ phí tham gia: 50.000 VNĐ / bạn.
    - Tổng giải thưởng: 10.000.000đ tiền mặt.
    - Quyền lợi sinh viên: Được cộng 4 điểm rèn luyện (Tiêu chí 3).
    - Hạn đăng ký: 23h59 ngày 12/12/2026.
    - Link đăng ký: https://forms.gle/tdtu_speech
  `;
  const result = classifyPostContent(post);
  assert.equal(result.classification, 'definite');
  assert.ok(result.points?.includes('4'));
  assert.ok(!result.points?.includes('50000') && !result.points?.includes('10000000'));
  assert.ok(result.feeOrPrize);
  assert.equal(result.tdtuCriteriaId, 3);
});

test('disambiguates event time vs registration deadline when multiple dates exist', () => {
  const post = `
    [TALKSHOW KỸ NĂNG]
    Thời gian diễn ra: 08:00 sáng ngày 25/11/2026 tại Hội trường 6B.
    Thời hạn mở cổng đăng ký: Form sẽ đóng vào lúc 17:00 ngày 22/11/2026.
    Được cộng 3 ĐRL tiêu chí 1.
    Link: https://forms.gle/talkshow2026
  `;
  const result = classifyPostContent(post);
  assert.ok(result.deadline?.includes('22/11/2026') || result.deadline?.includes('17:00'));
  assert.ok(result.eventTime?.includes('25/11/2026') || result.eventTime?.includes('08:00'));
  assert.equal(result.classification, 'definite');
  assert.equal(result.tdtuCriteriaId, 1);
});

