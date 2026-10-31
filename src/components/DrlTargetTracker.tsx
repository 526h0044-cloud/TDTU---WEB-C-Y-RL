import React, { useState } from 'react';
import { Target, Award, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, ShieldCheck, Info } from 'lucide-react';
import { ScannedPost } from '../types';

interface DrlTargetTrackerProps {
  posts: ScannedPost[];
  targetPoints: number;
  onTargetChange: (points: number) => void;
}

interface ColumnData {
  id: number;
  name: string;
  shortName: string;
  maxScore: number;
  rawPoints: number;
  effectivePoints: number;
  isCapped: boolean;
  excessPoints: number;
  note: string;
}

export const DrlTargetTracker: React.FC<DrlTargetTrackerProps> = ({
  posts,
  targetPoints,
  onTargetChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Column 2 base score: default 20 points per semester (deductible for violations)
  const [col2Deduction, setCol2Deduction] = useState<number>(0);

  // Calculate registered posts & points
  const registeredPosts = posts.filter((p) => p.isRegistered);

  // Raw accumulation for 5 columns
  const rawScores: Record<number, number> = {
    1: 0, // Cột 1: Ý thức học tập
    2: Math.max(0, 20 - col2Deduction), // Cột 2: Mặc định 20đ ban đầu
    3: 0, // Cột 3: Văn hóa, thể thao, chính trị xã hội
    4: 0, // Cột 4: Quan hệ cộng đồng & Tình nguyện
    5: 0  // Cột 5: Tiên phong, gương mẫu & Cán sự
  };

  for (const post of registeredPosts) {
    let pts = 0;
    if (post.classification === 'none') {
      pts = 0;
    } else if (post.points) {
      const match = post.points.match(/(\d+(?:\.\d+)?)/);
      if (match) pts = parseFloat(match[1]);
    } else {
      pts = 3;
    }

    // Direct mapping if tdtuCriteriaId is present
    if (post.tdtuCriteriaId && post.tdtuCriteriaId >= 1 && post.tdtuCriteriaId <= 5) {
      rawScores[post.tdtuCriteriaId] += pts;
    } else {
      // Fallback text check
      const crit = (post.criteria || '').toLowerCase();
      if (crit.includes('1') || crit.includes('học tập') || crit.includes('workshop')) {
        rawScores[1] += pts;
      } else if (crit.includes('2') || crit.includes('nội quy') || crit.includes('đồng phục')) {
        rawScores[2] += pts;
      } else if (crit.includes('3') || crit.includes('thể thao') || crit.includes('văn nghệ') || crit.includes('truyền thông')) {
        rawScores[3] += pts;
      } else if (crit.includes('4') || crit.includes('tình nguyện') || crit.includes('hiến máu') || crit.includes('chủ nhật xanh')) {
        rawScores[4] += pts;
      } else if (crit.includes('5') || crit.includes('cán sự') || crit.includes('5 tốt')) {
        rawScores[5] += pts;
      } else {
        // Default to Column 4 (Volunteering/Community)
        rawScores[4] += pts;
      }
    }
  }

  // Build column details with 20-point Ceiling Rule
  const columns: ColumnData[] = [
    {
      id: 1,
      name: 'Cột 1: Ý thức học tập',
      shortName: 'Học tập & NCKH',
      maxScore: 20,
      rawPoints: rawScores[1],
      effectivePoints: Math.min(20, rawScores[1]),
      isCapped: rawScores[1] > 20,
      excessPoints: Math.max(0, rawScores[1] - 20),
      note: 'GPA học kỳ + Hội thảo/TechTalk + NCKH'
    },
    {
      id: 2,
      name: 'Cột 2: Việc chấp hành nội quy, quy chế',
      shortName: 'Kỷ luật & Nội quy TDTU',
      maxScore: 20,
      rawPoints: rawScores[2],
      effectivePoints: Math.min(20, rawScores[2]),
      isCapped: rawScores[2] > 20,
      excessPoints: Math.max(0, rawScores[2] - 20),
      note: 'Mặc định 20đ đầu kỳ. Bị trừ không bù được!'
    },
    {
      id: 3,
      name: 'Cột 3: Hoạt động chính trị, VH-TT',
      shortName: 'Văn hóa & Thể thao',
      maxScore: 20,
      rawPoints: rawScores[3],
      effectivePoints: Math.min(20, rawScores[3]),
      isCapped: rawScores[3] > 20,
      excessPoints: Math.max(0, rawScores[3] - 20),
      note: 'Văn nghệ + Hội thao TDTU + Tương tác truyền thông'
    },
    {
      id: 4,
      name: 'Cột 4: Quan hệ cộng đồng & Tình nguyện',
      shortName: 'Cộng đồng & Tình nguyện',
      maxScore: 20,
      rawPoints: rawScores[4],
      effectivePoints: Math.min(20, rawScores[4]),
      isCapped: rawScores[4] > 20,
      excessPoints: Math.max(0, rawScores[4] - 20),
      note: 'Hiến máu + Chủ nhật xanh + Mùa hè xanh'
    },
    {
      id: 5,
      name: 'Cột 5: Tiên phong, gương mẫu & Cán sự',
      shortName: 'Cán sự & SV 5 Tốt',
      maxScore: 20,
      rawPoints: rawScores[5],
      effectivePoints: Math.min(20, rawScores[5]),
      isCapped: rawScores[5] > 20,
      excessPoints: Math.max(0, rawScores[5] - 20),
      note: 'Cán sự lớp + Đoàn Hội + Danh hiệu SV5T'
    }
  ];

  // Total effective score adheres to the 20-point cap per column
  const totalEffectivePoints = columns.reduce((acc, col) => acc + col.effectivePoints, 0);
  const totalRawPoints = columns.reduce((acc, col) => acc + col.rawPoints, 0);
  const hasCappedColumns = columns.some((col) => col.isCapped);

  const progressPercent = Math.min(100, Math.round((totalEffectivePoints / targetPoints) * 100));

  const getRank = (score: number) => {
    if (score >= 90) return { label: 'Xuất sắc', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
    if (score >= 80) return { label: 'Tốt (Học bổng)', color: 'text-blue-700 bg-blue-100 border-blue-200' };
    if (score >= 65) return { label: 'Khá', color: 'text-amber-700 bg-amber-100 border-amber-200' };
    if (score >= 50) return { label: 'Trung bình', color: 'text-orange-700 bg-orange-100 border-orange-200' };
    return { label: 'Cần cố gắng', color: 'text-rose-700 bg-rose-100 border-rose-200' };
  };

  const rank = getRank(totalEffectivePoints);

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-xs">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Mục Tiêu Điểm Rèn Luyện TDTU
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${rank.color}`}>
                Xếp loại: {rank.label}
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Chuẩn 5 Cột x 20đ = 100đ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi nhận thực tế: <strong className="text-slate-900 font-bold text-sm">{totalEffectivePoints}</strong> /{' '}
              {targetPoints} điểm (Đã áp dụng chặn trần 20đ/cột • {registeredPosts.length} form đã nộp)
            </p>
          </div>
        </div>

        {/* Target selector and collapse toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Mục tiêu:</span>
            <select
              value={targetPoints}
              onChange={(e) => onTargetChange(parseInt(e.target.value, 10))}
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
            title={isExpanded ? 'Thu gọn chi tiết 5 cột' : 'Xem chi tiết 5 cột ĐRL'}
            aria-label={isExpanded ? 'Thu gọn chi tiết 5 cột' : 'Xem chi tiết 5 cột ĐRL'}
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
            {totalEffectivePoints >= targetPoints
              ? 'Đã đạt chỉ tiêu học kỳ!'
              : `Còn thiếu ${Math.max(0, targetPoints - totalEffectivePoints)} điểm`}
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

      {/* Ceiling Cap Warning Notice if points exceeded in any column */}
      {hasCappedColumns && (
        <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Cảnh báo Quy tắc Chặn trần TDTU:</strong> Bạn có cột đã vượt quá 20 điểm (Tổng điểm thô: {totalRawPoints}đ, nhưng hệ thống chỉ ghi nhận tối đa {totalEffectivePoints}đ). Vui lòng chuyển sang tham gia các hoạt động ở các cột khác còn thiếu!
          </div>
        </div>
      )}

      {/* Expanded Breakdown by 5 Columns */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Chi tiết phân bổ 5 Cột Điểm Rèn Luyện TDTU:</span>
            <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Tối đa 20đ / mỗi cột
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {columns.map((col) => (
              <div
                key={col.id}
                className={`p-3 rounded-xl border transition-all ${
                  col.isCapped
                    ? 'bg-amber-50/70 border-amber-300'
                    : col.effectivePoints >= 20
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">
                    Cột {col.id}
                  </span>
                  <span
                    className={`font-extrabold text-xs px-2 py-0.5 rounded-md border ${
                      col.effectivePoints >= 20
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white text-slate-900 border-slate-300'
                    }`}
                  >
                    {col.effectivePoints} / 20 đ
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 truncate" title={col.name}>
                  {col.shortName}
                </div>

                <div className="text-[10px] text-slate-500 mt-1 line-clamp-2" title={col.note}>
                  {col.note}
                </div>

                {col.id === 2 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Điểm trừ vi phạm:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCol2Deduction((prev) => Math.min(20, prev + 2))}
                        className="px-1.5 py-0.5 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded text-[10px] font-bold"
                        title="Trừ 2 điểm do vi phạm (quên thẻ SV, sai đồng phục)"
                      >
                        -2đ
                      </button>
                      <span className="font-bold text-rose-600">{col2Deduction > 0 ? `-${col2Deduction}đ` : '0đ'}</span>
                      {col2Deduction > 0 && (
                        <button
                          type="button"
                          onClick={() => setCol2Deduction(0)}
                          className="text-[10px] text-blue-600 hover:underline ml-1"
                          title="Hoàn tác vi phạm"
                        >
                          Lại
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {col.isCapped && (
                  <div className="mt-1.5 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <span>Chặn trần: thừa +{col.excessPoints}đ</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick core rule summary bar */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                <strong>2 Lưu ý vàng tại TDTU:</strong> 1) Cột 2 có sẵn 20đ đầu kỳ và không bù được khi bị trừ. 2) Đăng ký qua Cổng thông tin / quét mã QR điểm danh, kiểm tra định kỳ trên HTTTSV để khiếu nại kịp thời nếu sót điểm!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
