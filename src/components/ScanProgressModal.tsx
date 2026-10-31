import React from 'react';
import { RefreshCw, CheckCircle2, Award, AlertCircle, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { ScanProgressInfo } from '../services/firebase';

interface ScanProgressModalProps {
  isOpen: boolean;
  progressInfo: ScanProgressInfo | null;
}

export const ScanProgressModal: React.FC<ScanProgressModalProps> = ({
  isOpen,
  progressInfo
}) => {
  if (!isOpen || !progressInfo) return null;

  const {
    currentGroup,
    currentIndex,
    totalGroups,
    percent,
    newPostsFound,
    definiteCount,
    potentialCount,
    skippedDuplicates
  } = progressInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-progress-title"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="scan-progress-title" className="text-base font-bold text-white">
                  Đang Quét Các Nhóm Facebook TDTU
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live AI Scan
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Phân tích bài viết, phát hiện form Google/MS Form và chống trùng lặp dữ liệu
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Progress Bar & Percent */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Tiến trình quét các nhóm</span>
              <span className="text-blue-600 font-extrabold text-sm">{percent}%</span>
            </div>

            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
              <span>Đang kiểm tra nhóm {currentIndex} / {totalGroups}</span>
              <span>Còn lại: {Math.max(0, totalGroups - currentIndex)} nhóm</span>
            </div>
          </div>

          {/* Current Group Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800 uppercase mb-1">
              <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Nhóm đang quét trực tiếp:</span>
            </div>
            <div className="font-bold text-slate-900 truncate text-sm">
              {currentGroup.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {currentGroup.url}
            </div>
          </div>

          {/* Real-time stats grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-center text-emerald-600 mb-0.5">
                <Award className="h-4 w-4" />
              </div>
              <div className="text-base font-extrabold text-emerald-800">{definiteCount}</div>
              <div className="text-[10px] font-semibold text-emerald-700">Có ĐRL</div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-center text-amber-600 mb-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="text-base font-extrabold text-amber-800">{potentialCount}</div>
              <div className="text-[10px] font-semibold text-amber-700">Tiềm năng</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-center text-slate-500 mb-0.5">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="text-base font-extrabold text-slate-800">{skippedDuplicates}</div>
              <div className="text-[10px] font-semibold text-slate-600">Trùng (bỏ qua)</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Hệ thống đang tự động trích xuất link Google Forms & phân loại tiêu chí ĐRL TDTU...
        </div>
      </div>
    </div>
  );
};
