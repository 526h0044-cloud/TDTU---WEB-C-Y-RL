import React from 'react';
import { Search, Filter, Sparkles, Check, ChevronDown } from 'lucide-react';
import { FBGroup } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedClassification: string;
  onClassificationChange: (c: string) => void;
  selectedGroup: string;
  onGroupChange: (g: string) => void;
  groups: FBGroup[];
  hasFormOnly: boolean;
  onToggleHasFormOnly: () => void;
  bookmarksOnly: boolean;
  onToggleBookmarksOnly: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedClassification,
  onClassificationChange,
  selectedGroup,
  onGroupChange,
  groups,
  hasFormOnly,
  onToggleHasFormOnly,
  bookmarksOnly,
  onToggleBookmarksOnly
}) => {
  return (
    <div className="space-y-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
      {/* Top Search & Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo sự kiện, hội thảo, tiêu chí, từ khóa ĐRL..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Group filter dropdown */}
        <div className="relative sm:w-72">
          <select
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            aria-label="Lọc theo nhóm Facebook"
            className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 pr-8 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-hidden font-medium"
          >
            <option value="all">Tất cả nhóm ({groups.length} nhóm theo dõi)</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Badges / Tabs row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
          <Filter className="h-3 w-3" />
          Phân loại:
        </span>

        {/* All tab */}
        <button
          type="button"
          onClick={() => onClassificationChange('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            selectedClassification === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Tất cả
        </button>

        {/* Definite tab */}
        <button
          type="button"
          onClick={() => onClassificationChange('definite')}
          className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            selectedClassification === 'definite'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          Chắc chắn có ĐRL
        </button>

        {/* Potential tab */}
        <button
          type="button"
          onClick={() => onClassificationChange('potential')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            selectedClassification === 'potential'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          Có thể có ĐRL
        </button>

        {/* Has Form Checkbox Pill */}
        <button
          type="button"
          onClick={onToggleHasFormOnly}
          className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            hasFormOnly
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          {hasFormOnly && <Check className="h-3 w-3" />}
          Chỉ xem bài có Link Form
        </button>

        {/* Bookmarks Pill */}
        <button
          type="button"
          onClick={onToggleBookmarksOnly}
          className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            bookmarksOnly
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {bookmarksOnly && <Check className="h-3 w-3" />}
          Bài đã lưu
        </button>
      </div>
    </div>
  );
};
