import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Award,
  Target,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Info,
  AlertCircle
} from 'lucide-react';
import {
  TDTU_CRITERIA_LIST,
  TDTU_DRL_RANKINGS,
  TDTU_FORMULA_RECOMMENDATIONS,
  TDTU_CORE_RULES
} from '../utils/tdtuDrlHandbook';

interface TdtuDrlHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints?: number;
}

export const TdtuDrlHandbookModal: React.FC<TdtuDrlHandbookModalProps> = ({
  isOpen,
  onClose,
  currentPoints = 0
}) => {
  const [activeTab, setActiveTab] = useState<'criteria' | 'rankings' | 'strategy' | 'advisor'>('criteria');
  const [selectedCriterionId, setSelectedCriterionId] = useState<number>(1);

  // AI Advisor state
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [advisorAnswers, setAdvisorAnswers] = useState<
    { role: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      role: 'assistant',
      text: 'Chào bạn! Mình là Trợ lý AI Cố vấn Điểm Rèn Luyện TDTU. Khung chuẩn ĐRL TDTU gồm 5 Cột (mỗi cột tối đa 20đ = 100đ tổng). Bạn cần tư vấn chiến thuật đạt 80+ điểm xét học bổng, cách giữ trọn 20đ Cột 2 hay cách tính điểm của cột nào không?',
      time: 'Vừa xong'
    }
  ]);
  const [isAsking, setIsAsking] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendAdvisorQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQuestion.trim() || isAsking) return;

    const userText = advisorQuestion.trim();
    setAdvisorQuestion('');
    const userTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    setAdvisorAnswers((prev) => [
      ...prev,
      { role: 'user', text: userText, time: userTime }
    ]);
    setIsAsking(true);

    try {
      const res = await fetch('/api/tdtu-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText, currentScore: currentPoints })
      });

      if (res.ok) {
        const data = await res.json();
        setAdvisorAnswers((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.answer || 'Xin lỗi, hiện chưa thể phản hồi câu hỏi này.',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('Advisor API error');
      }
    } catch {
      setAdvisorAnswers((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Quy tắc chuẩn ĐRL TDTU (5 Cột x 20 Điểm = 100 Điểm):\n- Cột 2 (20đ): Mặc định có sẵn 20đ đầu kỳ. Phải mặc áo truyền thống/áo thun TDTU Thứ Hai & Thứ Năm, luôn đeo thẻ sinh viên, đóng học phí đúng hạn. Cột này KHÔNG THỂ BÙ ĐIỂM khi bị trừ!\n- Cột 4 (20đ): 1 lần Hiến máu nhân đạo (+5đ) + 2 buổi Chủ nhật xanh (+6đ) hoặc Mùa hè xanh (+20đ).\n- Cột 1 (20đ): GPA Khá/Giỏi (+4-6đ) + 2 workshop khoa (+6-8đ).\n- Cột 3 (20đ): Giải chạy marathon / hội thao (+4-5đ) + khảo sát Đoàn Hội (+2đ).\n- Cột 5 (20đ): Cán sự / CLB / Sinh viên 5 Tốt (+10-15đ).\n=> Nhớ quy tắc chặn trần: Mỗi cột tối đa 20đ!`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const selectedCriterion = TDTU_CRITERIA_LIST.find((c) => c.id === selectedCriterionId) || TDTU_CRITERIA_LIST[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="handbook-title"
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="handbook-title" className="text-base sm:text-lg font-bold text-white">
                  Cẩm Nang & Quy Chế Điểm Rèn Luyện TDTU
                </h2>
                <span className="rounded-full bg-amber-400/20 border border-amber-300/40 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                  Chuẩn 5 Cột x 20đ = 100đ
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Toàn bộ tri thức về 5 cột rèn luyện, quy tắc chặn trần 20đ, cách tính điểm và chiến thuật học bổng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('criteria')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'criteria'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>5 Cột ĐRL TDTU (20đ/cột)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rankings')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'rankings'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Xếp Loại & Học Bổng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('strategy')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'strategy'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            <span>Chiến Thuật Săn 80+ Điểm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('advisor')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'advisor'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>AI Cố Vấn TDTU (Hỏi Đáp)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: 5 Cột ĐRL TDTU */}
          {activeTab === 'criteria' && (
            <div className="space-y-4">
              {/* Highlight Core Rules Notice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>{TDTU_CORE_RULES.ceilingCap.title}</span>
                  </div>
                  <p className="text-amber-900/90 leading-relaxed text-[11px]">
                    {TDTU_CORE_RULES.ceilingCap.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{TDTU_CORE_RULES.column2Default.title}</span>
                  </div>
                  <p className="text-blue-900/90 leading-relaxed text-[11px]">
                    {TDTU_CORE_RULES.column2Default.description}
                  </p>
                </div>
              </div>

              {/* Column selector badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {TDTU_CRITERIA_LIST.map((crit) => (
                  <button
                    key={crit.id}
                    type="button"
                    onClick={() => setSelectedCriterionId(crit.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedCriterionId === crit.id
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                      Cột {crit.id}
                    </div>
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {crit.shortName}
                    </div>
                    <div className="text-[11px] font-extrabold text-blue-700 mt-1">
                      Max {crit.maxScore} đ
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Criterion Detail Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedCriterion.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {selectedCriterion.description}
                    </p>
                  </div>
                  <span className="shrink-0 bg-blue-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs">
                    Tối đa: {selectedCriterion.maxScore} điểm
                  </span>
                </div>

                {/* How to earn table */}
                <div>
                  <div className="text-xs font-bold text-slate-800 uppercase mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Cách thức tính điểm & quy định cụ thể tại TDTU:
                  </div>

                  <div className="space-y-2">
                    {selectedCriterion.howToEarn.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-900">
                            {item.activity}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.note}
                          </div>
                        </div>
                        <span className="shrink-0 self-start sm:self-center font-bold text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
                          {item.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                {selectedCriterion.tips && selectedCriterion.tips.length > 0 && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                    <div className="font-bold text-amber-900 uppercase flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      Lưu ý & Mẹo săn trọn 20 điểm {selectedCriterion.name}:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-xs">
                      {selectedCriterion.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recording system banner */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-xs text-slate-700 flex items-start gap-2">
                <Info className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <strong>{TDTU_CORE_RULES.recordingSystem.title}:</strong> {TDTU_CORE_RULES.recordingSystem.description}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Xếp Loại & Học Bổng */}
          {activeTab === 'rankings' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                <strong className="text-blue-900">Quy định Học bổng TDTU:</strong> Để được xét học bổng Khuyến khích học tập (HKKHT) hoặc học bổng tài trợ doanh nghiệp, sinh viên TDTU bắt buộc phải có Điểm rèn luyện đạt từ loại <strong>TỐT (&ge; 80 điểm)</strong> trở lên.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TDTU_DRL_RANKINGS.map((rk, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${rk.color} ${rk.bgLight} space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{rk.rank}</span>
                      <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-white border border-slate-300">
                        {rk.minScore} - {rk.maxScore} đ
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong>Quyền lợi:</strong> {rk.benefit}
                    </div>

                    {rk.consequence && (
                      <div className="text-xs text-rose-700 font-medium pt-1 border-t border-rose-200 flex items-start gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{rk.consequence}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Chiến Thuật Săn 80+ Điểm */}
          {activeTab === 'strategy' && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
                <h3 className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-emerald-700" />
                  Công Thức Vàng Đạt 80+ Điểm Rèn Luyện Xét Học Bổng TDTU
                </h3>
                <p className="text-emerald-800 text-xs">
                  {TDTU_FORMULA_RECOMMENDATIONS.targetScholarship.strategy}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
                    Bước 1: Giữ trọn 20 điểm mặc định Cột 2 (Kỷ luật & Nội quy TDTU)
                  </div>
                  <p className="text-slate-600 pl-7 text-xs">
                    Luôn mặc đồng phục trường (áo truyền thống hoặc áo thun TDTU) vào <strong>Thứ Hai và Thứ Năm</strong>, đeo thẻ sinh viên khi vào trường, đóng học phí đúng hạn, không gây mất trật tự. Cột này <strong>không thể bù điểm</strong> bằng hoạt động ngoại khóa nếu đã bị trừ!
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
                    Bước 2: Tích lũy 15 - 20 điểm Cột 4 (Cộng đồng & Tình nguyện)
                  </div>
                  <p className="text-slate-600 pl-7 text-xs">
                    Đăng ký <strong>1 lần Hiến máu nhân đạo (+5đ)</strong> tại trường và tham gia <strong>2 buổi Ngày Chủ nhật xanh (+6đ-8đ)</strong> dọn vệ sinh khuôn viên. Hoặc nếu tham gia trọn vẹn <strong>Mùa hè xanh / Xuân tình nguyện</strong>, bạn sẽ được cộng trọn <strong>20 điểm Cột 4</strong>!
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</span>
                    Bước 3: Tích lũy 14 - 16 điểm Cột 1 (Ý thức học tập & Workshop)
                  </div>
                  <p className="text-slate-600 pl-7 text-xs">
                    Duy trì điểm GPA Khá (+4đ) hoặc Giỏi (+6đ), cộng thêm tham gia <strong>2 buổi Hội thảo / TechTalk chuyên ngành của Khoa (+6đ-8đ)</strong>. Bạn nâng tổng điểm lên trên <strong>50 - 55 điểm</strong>!
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">4</span>
                    Bước 4: Kiếm 10 - 15 điểm Cột 3 (Văn hóa, Thể thao & Truyền thông)
                  </div>
                  <p className="text-slate-600 pl-7 text-xs">
                    Tham gia <strong>giải chạy marathon hoặc Hội thao sinh viên TDTU (+4đ-5đ)</strong>, dự đêm nhạc văn nghệ (+3đ-5đ) và thực hiện các khảo sát trực tuyến / tương tác fanpage Đoàn - Hội (+2đ). Bạn đã đạt <strong>75 - 80 điểm</strong>!
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">5</span>
                    Bước 5: Cán sự lớp, CLB hoặc Sinh viên 5 Tốt (Cột 5)
                  </div>
                  <p className="text-slate-600 pl-7 text-xs">
                    Ban cán sự lớp, BCH Chi đoàn hoặc Ban chủ nhiệm CLB (+10đ-15đ) hoặc nộp hồ sơ xét danh hiệu <strong>Sinh viên 5 Tốt</strong>. Bạn chính thức bứt phá lên <strong>85 - 95 điểm Xuất sắc</strong>!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI Cố Vấn TDTU */}
          {activeTab === 'advisor' && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-xl border border-slate-200 mb-3">
                {advisorAnswers.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div
                        className={`text-[10px] mt-1 ${
                          msg.role === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}

                {isAsking && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                      <span>AI Cố vấn TDTU đang tra cứu quy chế...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendAdvisorQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={advisorQuestion}
                  onChange={(e) => setAdvisorQuestion(e.target.value)}
                  placeholder="Hỏi về quy chế ĐRL, cách kiếm điểm Cột 3, học bổng..."
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  disabled={isAsking}
                />
                <button
                  type="submit"
                  disabled={isAsking || !advisorQuestion.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Gửi</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Nguồn: Quy chế Đánh giá Rèn luyện Sinh viên Trường Đại học Tôn Đức Thắng (TDTU)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
