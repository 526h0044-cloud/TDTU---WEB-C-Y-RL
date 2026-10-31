import React, { useState } from 'react';
import { Target, Award, CheckCircle2, ChevronDown, ChevronUp, Sparkles, TrendingUp } from 'lucide-react';
import { ScannedPost } from '../types';

interface DrlTargetTrackerProps {
  posts: ScannedPost[];
  targetPoints: number;
  onTargetChange: (points: number) => void;
}

export const DrlTargetTracker: React.FC<DrlTargetTrackerProps> = ({
  posts,
  targetPoints,
  onTargetChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate registered posts & points
  const registeredPosts = posts.filter((p) => p.isRegistered);

  let totalPointsAccumulated = 0;
  const criteriaBreakdown: Record<string, number> = {
    'Tiêu chí 1 (Học tập)': 0,
    'Tiêu chí 2 (Kỷ luật & Nội quy)': 0,
    'Tiêu chí 3 (Hoạt động xã hội & Tình nguyện)': 0,
    'Tiêu chí 4 (Phẩm chất công dân)': 0,
    'Tiêu chí 5 (Lớp & Đoàn Hội)': 0
  };

  for (const post of registeredPosts) {
    let pts = 0;
    if (post.points) {
      const match = post.points.match(/(\d+(?:\.\d+)?)/);
      if (match) pts = parseFloat(match[1]);
    } else {
      // Default estimation if not stated explicitly
      pts = 3;
    }
    totalPointsAccumulated += pts;

    // Assign to criteria bucket
    if (post.criteria?.includes('1') || post.criteria?.toLowerCase().includes('i')) {
      criteriaBreakdown['Tiêu chí 1 (Học tập)'] += pts;
    } else if (post.criteria?.includes('2') || post.criteria?.toLowerCase().includes('ii')) {
      criteriaBreakdown['Tiêu chí 2 (Kỷ luật & Nội quy)'] += pts;
    } else if (post.criteria?.includes('3') || post.criteria?.toLowerCase().includes('iii')) {
      criteriaBreakdown['Tiêu chí 3 (Hoạt động xã hội & Tình nguyện)'] += pts;
    } else if (post.criteria?.includes('4') || post.criteria?.toLowerCase().includes('iv')) {
      criteriaBreakdown['Tiêu chí 4 (Phẩm chất công dân)'] += pts;
    } else if (post.criteria?.includes('5') || post.criteria?.toLowerCase().includes('v')) {
      criteriaBreakdown['Tiêu chí 5 (Lớp & Đoàn Hội)'] += pts;
    } else {
      criteriaBreakdown['Tiêu chí 3 (Hoạt động xã hội & Tình nguyện)'] += pts;
    }
  }

  const progressPercent = Math.min(100, Math.round((totalPointsAccumulated / targetPoints) * 100));

  const getRank = (score: number) => {
    if (score >= 90) return { label: 'Xuất sắc', color: 'text-emerald-700 bg-emerald-100' };
    if (score >= 80) return { label: 'Tốt', color: 'text-blue-700 bg-blue-100' };
    if (score >= 65) return { label: 'Khá', color: 'text-amber-700 bg-amber-100' };
    if (score >= 50) return { label: 'Trung bình', color: 'text-orange-700 bg-orange-100' };
    return { label: 'Cần cố gắng', color: 'text-rose-700 bg-rose-100' };
  };

  const rank = getRank(totalPointsAccumulated);

  const handleTargetChange = (val: number) => {
    onTargetChange(val);
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-xs">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Mục Tiêu Điểm Rèn Luyện Học Kỳ
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rank.color}`}>
                Xếp loại: {rank.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Đã tích lũy ước tính <strong className="text-slate-900 font-bold">{totalPointsAccumulated}</strong> /{' '}
              {targetPoints} điểm ({registeredPosts.length} hoạt động đã nộp form)
            </p>
          </div>
        </div>

        {/* Target selector and collapse toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Mục tiêu:</span>
            <select
              value={targetPoints}
              onChange={(e) => handleTargetChange(parseInt(e.target.value, 10))}
              aria-label="Chọn mục tiêu điểm rèn luyện"
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="65">65 điểm (Khá)</option>
              <option value="80">80 điểm (Tốt / Xét Học bổng)</option>
              <option value="85">85 điểm (Tốt cao)</option>
              <option value="90">90 điểm (Xuất sắc)</option>
              <option value="100">100 điểm (Tối đa)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title={isExpanded ? 'Thu gọn chi tiết tiêu chí' : 'Xem chi tiết các tiêu chí'}
            aria-label={isExpanded ? 'Thu gọn chi tiết tiêu chí' : 'Xem chi tiết các tiêu chí'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5">
        <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
          <span>Tiến độ hoàn thành: {progressPercent}%</span>
          <span>
            {totalPointsAccumulated >= targetPoints
              ? 'Đã đạt chỉ tiêu!'
              : `Còn thiếu ${Math.max(0, targetPoints - totalPointsAccumulated)} điểm`}
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              progressPercent >= 100
                ? 'bg-emerald-500'
                : progressPercent >= 70
                ? 'bg-blue-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Expanded Breakdown by Criteria */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 animate-in fade-in duration-150">
          {Object.entries(criteriaBreakdown).map(([critName, pts]) => (
            <div
              key={critName}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <span className="font-medium text-slate-700 truncate mr-2">{critName}</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                +{pts} đ
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
