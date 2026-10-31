import React from 'react';
import { Award, AlertCircle, FileText, CheckCircle, Clock } from 'lucide-react';
import { ScannedPost } from '../types';

interface StatsBarProps {
  posts: ScannedPost[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ posts, activeFilter, onSelectFilter }) => {
  const definiteCount = posts.filter(p => p.classification === 'definite').length;
  const potentialCount = posts.filter(p => p.classification === 'potential').length;
  const formCount = posts.filter(p => p.formUrls && p.formUrls.length > 0).length;
  const registeredCount = posts.filter(p => p.isRegistered).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {/* Definite DRL Card */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'definite' ? 'all' : 'definite')}
        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
          activeFilter === 'definite'
            ? 'bg-emerald-500/10 border-emerald-500 shadow-xs'
            : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
        }`}
      >
        <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900">{definiteCount}</div>
          <div className="text-xs font-semibold text-emerald-800">Chắc chắn có ĐRL</div>
        </div>
      </button>

      {/* Potential DRL Card */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'potential' ? 'all' : 'potential')}
        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
          activeFilter === 'potential'
            ? 'bg-amber-500/10 border-amber-500 shadow-xs'
            : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
        }`}
      >
        <div className="h-10 w-10 shrink-0 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900">{potentialCount}</div>
          <div className="text-xs font-semibold text-amber-800">Có thể có ĐRL</div>
        </div>
      </button>

      {/* Forms Available Card */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'has_form' ? 'all' : 'has_form')}
        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
          activeFilter === 'has_form'
            ? 'bg-blue-500/10 border-blue-500 shadow-xs'
            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
        }`}
      >
        <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900">{formCount}</div>
          <div className="text-xs font-semibold text-blue-800">Có Link Form</div>
        </div>
      </button>

      {/* Registered / Completed Card */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'registered' ? 'all' : 'registered')}
        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
          activeFilter === 'registered'
            ? 'bg-purple-500/10 border-purple-500 shadow-xs'
            : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
        }`}
      >
        <div className="h-10 w-10 shrink-0 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
          <CheckCircle className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900">{registeredCount}</div>
          <div className="text-xs font-semibold text-purple-800">Đã đăng ký</div>
        </div>
      </button>
    </div>
  );
};
