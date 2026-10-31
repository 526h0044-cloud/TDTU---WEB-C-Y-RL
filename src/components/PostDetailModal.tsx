import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Award,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  Clock,
  Sparkles,
  FileSpreadsheet,
  Bookmark,
  CheckCircle,
  Share2,
  Trash2,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
  Coins,
  HelpCircle
} from 'lucide-react';
import { ScannedPost } from '../types';

interface PostDetailModalProps {
  post: ScannedPost | null;
  onClose: () => void;
  onToggleBookmark: (postId: string, current: boolean) => void;
  onToggleRegistered: (postId: string, current: boolean) => void;
  onDeletePost?: (postId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onToggleBookmark,
  onToggleRegistered,
  onDeletePost
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [formCheckStatus, setFormCheckStatus] = useState<{ checked: boolean; isOpen?: boolean; loading: boolean }>({
    checked: false,
    loading: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    // Reset form status when post changes
    setFormCheckStatus({ checked: false, loading: false });
  }, [post?.id]);

  if (!post) return null;

  const isDefinite = post.classification === 'definite';
  const isPotential = post.classification === 'potential';
  const hasForm = post.formUrls && post.formUrls.length > 0;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(post.rawContent);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const handleCheckFormLive = async (url: string) => {
    setFormCheckStatus({ checked: false, loading: true });
    try {
      const res = await fetch('/api/check-form-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formUrl: url })
      });
      if (res.ok) {
        const data = await res.json();
        setFormCheckStatus({ checked: true, isOpen: data.isOpen, loading: false });
      } else {
        setFormCheckStatus({ checked: true, isOpen: true, loading: false });
      }
    } catch {
      setFormCheckStatus({ checked: true, isOpen: true, loading: false });
    }
  };

  // Generate Google Calendar Event Link
  const buildGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`[Săn ĐRL] ${post.summary}`);
    const details = encodeURIComponent(
      `Hoạt động: ${post.groupName || 'Nhóm ĐRL'}\nQuyền lợi: ${post.points || 'Có ĐRL'}\nTiêu chí: ${post.criteria || 'Quy chế rèn luyện'}\nLink form: ${post.formUrls?.[0] || 'Xem bài viết'}\nLink Facebook: ${post.postUrl}`
    );
    const location = encodeURIComponent(post.groupName || 'Đại học');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-post-title"
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            {isDefinite && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                <Award className="h-4 w-4" />
                Chắc chắn có ĐRL {post.points ? `(${post.points})` : ''}
              </span>
            )}
            {isPotential && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                <AlertCircle className="h-4 w-4" />
                Có thể có ĐRL (Hoạt động tiềm năng)
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">
              Độ tin cậy: {post.confidence}%
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            title="Đóng chi tiết"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Group and Title Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <span>{post.groupName || 'Nhóm Facebook'}</span>
              {post.authorName && <span>• Đăng bởi: {post.authorName}</span>}
              <span>• Quét lúc: {new Date(post.scannedAt).toLocaleTimeString('vi-VN')}</span>
            </div>
            <h2 id="modal-post-title" className="text-lg font-bold text-slate-900 leading-snug">
              {post.summary}
            </h2>
          </div>

          {/* Poster Intent Alert if question */}
          {post.intent === 'question' && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase">Phát hiện bài viết hỏi đáp / thắc mắc</h4>
                <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                  AI nhận diện người đăng đang đặt câu hỏi hoặc xin thông tin/link từ cộng đồng, không phải thông báo phát động hoạt động chính thức. Điểm ĐRL sẽ không được tự động tính vào tiến độ.
                </p>
              </div>
            </div>
          )}

          {/* Key Opportunity Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {post.points && (
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Điểm thưởng ĐRL</div>
                  <div className="text-sm font-bold text-emerald-700">{post.points}</div>
                </div>
              </div>
            )}

            {post.feeOrPrize && (
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg shrink-0">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Lệ phí / Tiền thưởng giải</div>
                  <div className="text-sm font-bold text-orange-800">
                    {post.feeOrPrize}
                    <span className="ml-1 text-[11px] font-normal text-slate-500">(Không nhầm lẫn với ĐRL)</span>
                  </div>
                </div>
              </div>
            )}

            {post.criteria && (
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase">
                    Tiêu chí TDTU {post.tdtuCriteriaId ? `(Tiêu chí ${post.tdtuCriteriaId})` : ''}
                  </div>
                  <div className="text-sm font-bold text-indigo-900">{post.criteria}</div>
                </div>
              </div>
            )}

            {post.deadline && (
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Hạn chót đóng form</div>
                  <div className="text-sm font-bold text-rose-700">{post.deadline}</div>
                </div>
              </div>
            )}

            {post.eventTime && (
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Thời gian diễn ra sự kiện</div>
                  <div className="text-sm font-medium text-slate-800">{post.eventTime}</div>
                </div>
              </div>
            )}
          </div>

          {/* Form Links Prominent Box */}
          {hasForm && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
                  <span className="font-bold text-emerald-900 text-sm">
                    Link Form Đăng Ký Trực Tiếp
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCheckFormLive(post.formUrls[0])}
                    disabled={formCheckStatus.loading}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-white px-2 py-1 rounded-md border border-emerald-200 hover:bg-emerald-100"
                    title="Kiểm tra xem link Form Google/MS còn nhận câu trả lời không"
                  >
                    <RefreshCw className={`h-3 w-3 ${formCheckStatus.loading ? 'animate-spin' : ''}`} />
                    <span>{formCheckStatus.loading ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái Form'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(post.formUrls[0])}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedLink ? 'Đã sao chép' : 'Copy link'}
                  </button>
                </div>
              </div>

              {formCheckStatus.checked && (
                <div className="mb-2 text-xs font-semibold">
                  {formCheckStatus.isOpen ? (
                    <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-sm inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Form đang mở (Vào đăng ký ngay trước khi full slot!)
                    </span>
                  ) : (
                    <span className="text-rose-800 bg-rose-100 px-2 py-0.5 rounded-sm inline-flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                      Form có thể đã đóng nhận câu trả lời
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {post.formUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-xs font-mono text-emerald-800 truncate select-all">
                      {url}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 shrink-0 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                    >
                      <span>Vào Form</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Phrases Highlight */}
          {post.keyPhrases && post.keyPhrases.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Cụm từ AI nhận diện:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {post.keyPhrases.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800 border border-blue-200"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Original Post Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase">
                Toàn bộ nội dung bài đăng gốc:
              </span>
              <button
                type="button"
                onClick={handleCopyContent}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {copiedContent ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedContent ? 'Đã sao chép' : 'Sao chép văn bản'}</span>
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
              {post.rawContent}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-200 px-5 py-3.5 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleBookmark(post.id, !post.isBookmarked)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                post.isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{post.isBookmarked ? 'Đã lưu' : 'Lưu lại'}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleRegistered(post.id, !post.isRegistered)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                post.isRegistered
                  ? 'border-purple-300 bg-purple-100 text-purple-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>{post.isRegistered ? 'Đã nộp form thành công' : 'Đánh dấu đã nộp'}</span>
            </button>

            {onDeletePost && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa bài đăng này khỏi cơ sở dữ liệu server?')) {
                    onDeletePost(post.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Xóa bài viết này khỏi server"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={buildGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              title="Thêm lịch nhắc hạn chót vào Google Calendar"
            >
              <CalendarPlus className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">Nhắc lịch Calendar</span>
            </a>

            <a
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Share2 className="h-4 w-4" />
              <span>Mở trên Facebook</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
