import React from 'react';
import {
  ExternalLink,
  Award,
  AlertCircle,
  Clock,
  Calendar,
  Bookmark,
  CheckCircle,
  Share2,
  FileSpreadsheet,
  Coins,
  HelpCircle
} from 'lucide-react';
import { ScannedPost } from '../types';

interface PostCardProps {
  post: ScannedPost;
  onOpenDetail: (post: ScannedPost) => void;
  onToggleBookmark: (postId: string, current: boolean) => void;
  onToggleRegistered: (postId: string, current: boolean) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenDetail,
  onToggleBookmark,
  onToggleRegistered
}) => {
  const isDefinite = post.classification === 'definite';
  const isPotential = post.classification === 'potential';
  const hasForm = post.formUrls && post.formUrls.length > 0;

  return (
    <article
      onClick={() => onOpenDetail(post)}
      className="group relative cursor-pointer flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
    >
      <div>
        {/* Top bar: Classification badge + Group Name + Bookmark */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.intent === 'question' ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
                Câu hỏi / Hỏi thăm
              </span>
            ) : isDefinite ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                <Award className="h-3.5 w-3.5" />
                Chắc chắn có ĐRL {post.points ? `(${post.points})` : ''}
              </span>
            ) : isPotential ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                <AlertCircle className="h-3.5 w-3.5" />
                Có thể có ĐRL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Thông tin chung
              </span>
            )}

            {post.feeOrPrize && (
              <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-800 border border-orange-200" title="Chi phí hoặc giải thưởng tiền mặt (không nhầm với điểm ĐRL)">
                <Coins className="h-3 w-3 text-orange-600" />
                {post.feeOrPrize}
              </span>
            )}

            {post.criteria && (
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
                {post.tdtuCriteriaId ? `TC${post.tdtuCriteriaId}: ` : ''}{post.criteria}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(post.id, !!post.isBookmarked);
              }}
              className={`p-1.5 rounded-md transition-colors ${
                post.isBookmarked
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={post.isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
              aria-label={post.isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
            >
              <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Group / Source attribution */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
          <span className="truncate max-w-[280px] font-semibold text-slate-700">
            {post.groupName || 'Nhóm Facebook'}
          </span>
          {post.authorName && (
            <>
              <span>•</span>
              <span className="truncate max-w-[150px]">{post.authorName}</span>
            </>
          )}
        </div>

        {/* Title / Summary */}
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 mb-2 leading-snug">
          {post.summary}
        </h3>

        {/* Key Phrases Highlight Tags */}
        {post.keyPhrases && post.keyPhrases.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.keyPhrases.slice(0, 4).map((phrase, idx) => (
              <span
                key={idx}
                className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200"
              >
                #{phrase}
              </span>
            ))}
          </div>
        )}

        {/* Metadata info: Deadline & Event Time */}
        <div className="space-y-1 text-xs text-slate-600 mb-3">
          {post.deadline && (
            <div className="flex items-center gap-1.5 font-medium text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Hạn chót: {post.deadline}</span>
            </div>
          )}

          {post.eventTime && (
            <div className="flex items-center gap-1.5 text-slate-600 px-1">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">Thời gian: {post.eventTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Direct Form Link or Facebook Link */}
        <div className="flex items-center gap-2">
          {hasForm ? (
            <a
              href={post.formUrls[0]}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
              title="Mở form Google / Microsoft Form đăng ký ngay"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Mở Form ĐRL</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <a
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all"
            >
              <span>Xem trên Facebook</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          )}

          <a
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
            title="Mở bài viết gốc Facebook"
            aria-label="Mở bài viết gốc Facebook"
          >
            <Share2 className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Registered status toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleRegistered(post.id, !post.isRegistered);
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            post.isRegistered
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'text-slate-400 hover:text-purple-700 hover:bg-purple-50'
          }`}
          title={post.isRegistered ? 'Đã đánh dấu đăng ký thành công' : 'Đánh dấu đã nộp form'}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{post.isRegistered ? 'Đã nộp form' : 'Chưa nộp'}</span>
        </button>
      </div>
    </article>
  );
};
