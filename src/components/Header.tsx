import React from 'react';
import {
  Bell,
  BellOff,
  PlusCircle,
  RefreshCw,
  Settings,
  Flame,
  ShieldCheck,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenGroupManager: () => void;
  onRunAutoScan: () => void;
  onOpenHandbook: () => void;
  isScanning: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFirebaseConnected: boolean;
  activeGroupCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenGroupManager,
  onRunAutoScan,
  onOpenHandbook,
  isScanning,
  soundEnabled,
  onToggleSound,
  isFirebaseConnected,
  activeGroupCount
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
            <Flame className="h-6 w-6 fill-amber-300 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight sm:text-xl">
                Săn ĐRL AI
              </h1>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                FB Monitor
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                {activeGroupCount} Group theo dõi
              </span>
              <span>•</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  isFirebaseConnected ? 'text-emerald-600' : 'text-amber-600'
                }`}
                title={isFirebaseConnected ? 'Đã kết nối Firebase Firestore' : 'Đang kết nối Firebase...'}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {isFirebaseConnected ? 'Firebase Cloud' : 'Connecting DB'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Alert Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              soundEnabled
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
            title={soundEnabled ? 'Đã bật chuông báo có ĐRL' : 'Đã tắt chuông báo'}
            aria-label="Toggle sound alerts"
          >
            {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </button>

          {/* TDTU Handbook & AI Advisor Button */}
          <button
            type="button"
            onClick={onOpenHandbook}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 active:scale-95 transition-all shadow-2xs"
            title="Cẩm nang quy chế ĐRL TDTU, 5 tiêu chí & AI Cố vấn học bổng"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-700" />
            <span className="hidden lg:inline">Cẩm nang ĐRL TDTU</span>
            <span className="lg:hidden">Cẩm nang</span>
          </button>

          {/* Auto Scan Simulator Button */}
          <button
            type="button"
            onClick={onRunAutoScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-60"
            title="Quét các nhóm Facebook đã thêm để tìm bài mới"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Quét các nhóm</span>
            <span className="md:hidden">Quét</span>
          </button>

          {/* Quick Paste Scanner */}
          <button
            type="button"
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
            title="Dán bài viết hoặc link FB để AI phân tích ngay"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Phân tích bài</span>
          </button>

          {/* Admin Group Manager */}
          <button
            type="button"
            onClick={onOpenGroupManager}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-200 active:scale-95 transition-all"
            title="Quản lý link các Group Facebook trường học"
          >
            <Settings className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden sm:inline">Quản lý Groups</span>
          </button>
        </div>
      </div>
    </header>
  );
};
