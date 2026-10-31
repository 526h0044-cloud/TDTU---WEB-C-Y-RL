import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Link as LinkIcon,
  Award,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Info,
  Globe
} from 'lucide-react';
import { FBGroup, ScannedPost, PostAnalysisResult } from '../types';
import { generatePostId } from '../utils/hash';
import { classifyPostContent } from '../utils/drlClassifier';

interface PostScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: FBGroup[];
  onSavePost: (post: ScannedPost) => Promise<{ isNew: boolean; message: string }>;
}

export const PostScannerModal: React.FC<PostScannerModalProps> = ({
  isOpen,
  onClose,
  groups,
  onSavePost
}) => {
  const [content, setContent] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [authorName, setAuthorName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingFb, setIsFetchingFb] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PostAnalysisResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ isNew: boolean; message: string } | null>(null);
  const [error, setError] = useState('');
  const [fbFetchNotice, setFbFetchNotice] = useState('');

  const handleResetForm = () => {
    setContent('');
    setPostUrl('');
    setAuthorName('');
    setAnalysisResult(null);
    setSaveStatus(null);
    setError('');
    setFbFetchNotice('');
  };

  const handlePostUrlChange = (newUrl: string) => {
    setPostUrl(newUrl);
    const lower = newUrl.toLowerCase();
    const matched = groups.find((g) => {
      const gSlug = g.url.toLowerCase().split('/groups/')[1]?.replace(/\/.*$/, '');
      return gSlug && lower.includes(gSlug);
    });
    if (matched) {
      setSelectedGroupId(matched.id);
    }
  };

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

  // Real Facebook URL metadata fetcher
  const handleFetchFromFacebook = async () => {
    if (!postUrl.trim() || !postUrl.includes('facebook.com')) {
      setError('Vui lòng nhập đường link bài viết hoặc nhóm Facebook hợp lệ để tự động quét');
      return;
    }
    setError('');
    setFbFetchNotice('');
    setIsFetchingFb(true);

    try {
      const res = await fetch('/api/fetch-facebook-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: postUrl.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.hasContent && data.combinedContent) {
          setContent(data.combinedContent);
          setFbFetchNotice('Đã trích xuất thông tin thật từ Facebook thành công!');
        } else {
          setFbFetchNotice(
            data.message ||
              'Facebook yêu cầu đăng nhập đối với nhóm kín. Hãy dán trực tiếp nội dung bài viết vào khung bên dưới.'
          );
        }
      }
    } catch {
      setFbFetchNotice(
        'Không thể đọc trực tiếp từ link Facebook do giới hạn bảo mật. Vui lòng sao chép văn bản bài viết và dán vào ô bên dưới.'
      );
    } finally {
      setIsFetchingFb(false);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Vui lòng nhập hoặc dán nội dung bài đăng Facebook');
      return;
    }
    setError('');
    setSaveStatus(null);
    setIsAnalyzing(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Call server AI endpoint
      const response = await fetch('/api/analyze-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          content: content.trim(),
          postUrl: postUrl.trim()
        })
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
      } else {
        // Fallback to client deterministic classifier
        const local = classifyPostContent(content);
        setAnalysisResult(local);
      }
    } catch {
      // Fallback
      const local = classifyPostContent(content);
      setAnalysisResult(local);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToServer = async () => {
    if (!analysisResult) return;

    const chosenGroup = groups.find((g) => g.id === selectedGroupId);
    const finalUrl = postUrl.trim() || (chosenGroup ? chosenGroup.url : 'https://www.facebook.com');
    const postId = generatePostId(finalUrl, content);
    const now = new Date().toISOString();

    const newPost: ScannedPost = {
      id: postId,
      groupId: chosenGroup?.id,
      groupName: chosenGroup?.name || 'Nhóm Facebook',
      postUrl: finalUrl,
      authorName: authorName.trim() || undefined,
      rawContent: content.trim(),
      summary: analysisResult.summary,
      classification: analysisResult.classification,
      confidence: analysisResult.confidence,
      keyPhrases: analysisResult.keyPhrases,
      formUrls: analysisResult.formUrls,
      eventTime: analysisResult.eventTime,
      deadline: analysisResult.deadline,
      points: analysisResult.points,
      criteria: analysisResult.criteria,
      isBookmarked: false,
      isRegistered: false,
      scannedAt: now,
      createdAt: now,
      updatedAt: now
    };

    try {
      const res = await onSavePost(newPost);
      setSaveStatus(res);
    } catch (err) {
      setError('Lỗi lưu server: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanner-modal-title"
        className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 id="scanner-modal-title" className="text-base font-bold text-slate-900">
                Quét & Phân Tích Bài Viết Facebook Thật Bằng AI
              </h2>
              <p className="text-xs text-slate-500">
                Nhập link hoặc dán nội dung thật từ các nhóm trường để AI phát hiện form và chống trùng lặp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Group and Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nhóm Facebook đăng tải
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người đăng / Ban tổ chức (Tùy chọn)
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="VD: Ban Phong trào, CLB Kỹ năng..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Real Facebook Post URL input with auto fetcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đường link bài viết Facebook (URL)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="url"
                  value={postUrl}
                  onChange={(e) => handlePostUrlChange(e.target.value)}
                  placeholder="https://www.facebook.com/groups/.../posts/..."
                  className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                type="button"
                onClick={handleFetchFromFacebook}
                disabled={isFetchingFb || !postUrl.trim()}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                title="Tự động nạp tiêu đề và nội dung công khai từ Facebook"
              >
                <Download className={`h-3.5 w-3.5 ${isFetchingFb ? 'animate-bounce' : ''}`} />
                <span>{isFetchingFb ? 'Đang đọc...' : 'Tự động lấy'}</span>
              </button>
            </div>

            {fbFetchNotice && (
              <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200 flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{fbFetchNotice}</span>
              </div>
            )}
          </div>

          {/* Post Content Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung bài viết Facebook thật cần phân tích *
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dán nội dung thật của bài đăng trên Facebook (kèm link form Google/MS, thông tin ĐRL, thời gian, hạn chót...)"
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden font-sans"
              required
            />
          </div>

          {/* Action Trigger Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'AI đang phân tích...' : 'Phân tích bài viết bằng AI'}</span>
            </button>
          </div>

          {/* Analysis Result Box */}
          {analysisResult && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {analysisResult.classification === 'definite' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                      <Award className="h-4 w-4" />
                      Chắc chắn có ĐRL ({analysisResult.confidence}%)
                    </span>
                  )}
                  {analysisResult.classification === 'potential' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                      <AlertCircle className="h-4 w-4" />
                      Có thể có ĐRL ({analysisResult.confidence}%)
                    </span>
                  )}
                  {analysisResult.classification === 'none' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                      Không liên quan ĐRL
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-500 font-medium">
                  {analysisResult.explanation}
                </span>
              </div>

              {/* Summary */}
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {analysisResult.summary}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {analysisResult.points && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase">Điểm ĐRL</div>
                    <div className="font-bold text-emerald-700 truncate">{analysisResult.points}</div>
                  </div>
                )}
                {analysisResult.criteria && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase">Tiêu chí</div>
                    <div className="font-bold text-indigo-700 truncate">{analysisResult.criteria}</div>
                  </div>
                )}
                {analysisResult.deadline && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase">Hạn chót</div>
                    <div className="font-bold text-rose-700 truncate">{analysisResult.deadline}</div>
                  </div>
                )}
                {analysisResult.eventTime && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase">Thời gian</div>
                    <div className="font-medium text-slate-700 truncate">{analysisResult.eventTime}</div>
                  </div>
                )}
              </div>

              {/* Form links */}
              {analysisResult.formUrls && analysisResult.formUrls.length > 0 && (
                <div className="bg-white p-3 rounded-lg border border-emerald-300">
                  <div className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    Link Form Đăng Ký Phát Hiện Được:
                  </div>
                  {analysisResult.formUrls.map((fUrl, idx) => (
                    <a
                      key={idx}
                      href={fUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:underline truncate"
                    >
                      {fUrl}
                    </a>
                  ))}
                </div>
              )}

              {/* Save Status Notification */}
              {saveStatus && (
                <div className="space-y-2">
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      saveStatus.isNew
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{saveStatus.message}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Quét bài viết khác
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                      Đóng & Xem danh sách
                    </button>
                  </div>
                </div>
              )}

              {/* Push to Server Button */}
              {!saveStatus && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveToServer}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <span>Lưu bài viết lên Server (Chống trùng lặp)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3.5 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Dữ liệu thật 100% được lưu trực tiếp vào Firebase Cloud Firestore
          </span>
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
