import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  RotateCcw
} from 'lucide-react';
import { FBGroup } from '../types';

interface AdminGroupManagerProps {
  isOpen: boolean;
  onClose: () => void;
  groups: FBGroup[];
  onAddGroup: (newGroup: Omit<FBGroup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onToggleActive: (groupId: string, current: boolean) => Promise<void>;
  onRestoreDefaults: () => Promise<void>;
}

export const AdminGroupManager: React.FC<AdminGroupManagerProps> = ({
  isOpen,
  onClose,
  groups,
  onAddGroup,
  onDeleteGroup,
  onToggleActive,
  onRestoreDefaults
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<FBGroup['category']>('club');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [searchGroup, setSearchGroup] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Vui lòng nhập tên nhóm Facebook');
      return;
    }
    if (!url.trim() || !url.includes('facebook.com')) {
      setFormError('Vui lòng nhập link nhóm Facebook hợp lệ (ví dụ: https://www.facebook.com/groups/...)');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddGroup({
        name: name.trim(),
        url: url.trim(),
        category,
        ...(description.trim() ? { description: description.trim() } : {}),
        isActive: true
      });
      setName('');
      setUrl('');
      setDescription('');
    } catch (err) {
      setFormError('Không thể thêm nhóm: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-manager-title"
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 id="group-manager-title" className="text-base font-bold text-slate-900">
                Quản lý các Nhóm Facebook Cần Theo Dõi (Admin)
              </h2>
              <p className="text-xs text-slate-500">
                Thêm link group của trường, khoa, CLB để hệ thống theo dõi và bắt trọn form ĐRL
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Add Group Form */}
          <form onSubmit={handleSubmit} className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
            <div className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Thêm nhóm Facebook mới
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên nhóm / Tên Khoa / CLB *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Khoa CNTT - Thông tin Sinh viên"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phân loại nhóm *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FBGroup['category'])}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="youth_union">Đoàn Thanh niên - Hội Sinh viên</option>
                  <option value="faculty">Khoa / Viện / Bộ môn</option>
                  <option value="club">Câu lạc bộ / Đội / Nhóm</option>
                  <option value="university">Phòng CTSV / Trường học</option>
                  <option value="other">Khác / Diễn đàn sinh viên</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đường link nhóm Facebook (URL) *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.facebook.com/groups/..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú thêm (Tùy chọn)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Thường mở form lúc 20h, bắt buộc điểm danh"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>{isSubmitting ? 'Đang thêm...' : 'Lưu nhóm vào Server'}</span>
              </button>
            </div>
          </form>

          {/* Existing Groups List */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Danh sách các nhóm theo dõi ({groups.length} nhóm thật)
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchGroup}
                  onChange={(e) => setSearchGroup(e.target.value)}
                  placeholder="Lọc nhóm theo tên..."
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={onRestoreDefaults}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                  title="Đồng bộ 24 nhóm trường đại học TDTU"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Nạp 24 nhóm TDTU</span>
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
              {[
                { id: 'all', label: `Tất cả (${groups.length})` },
                { id: 'faculty', label: `Khoa / Viện (${groups.filter((g) => g.category === 'faculty').length})` },
                { id: 'youth_union', label: `Đoàn - Hội (${groups.filter((g) => g.category === 'youth_union').length})` },
                { id: 'club', label: `CLB / Đội (${groups.filter((g) => g.category === 'club').length})` },
                { id: 'university', label: `CTSV / Trường (${groups.filter((g) => g.category === 'university').length})` },
                { id: 'other', label: `Cộng đồng (${groups.filter((g) => g.category === 'other').length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterCat(tab.id)}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                    filterCat === tab.id
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Chưa có nhóm nào. Hãy thêm link nhóm Facebook ở trên để bắt đầu theo dõi!
              </div>
            ) : (
              <div className="space-y-2">
                {groups
                  .filter((group) => {
                    if (filterCat !== 'all' && group.category !== filterCat) return false;
                    if (searchGroup.trim()) {
                      const q = searchGroup.toLowerCase();
                      if (!group.name.toLowerCase().includes(q) && !group.url.toLowerCase().includes(q)) {
                        return false;
                      }
                    }
                    return true;
                  })
                  .map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleActive(group.id, !group.isActive)}
                        className={`h-4 w-4 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                          group.isActive
                            ? 'bg-emerald-500 border-emerald-600 ring-2 ring-emerald-200'
                            : 'bg-slate-200 border-slate-300'
                        }`}
                        title={group.isActive ? 'Đang theo dõi (bấm để tạm ngưng)' : 'Đang tắt (bấm để kích hoạt lại)'}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {group.name}
                          </span>
                          <span className="shrink-0 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                            {group.category}
                          </span>
                        </div>
                        <a
                          href={group.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 truncate max-w-sm"
                        >
                          <span>{group.url}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onDeleteGroup(group.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Xóa nhóm khỏi hệ thống"
                        aria-label={`Xóa nhóm ${group.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3.5 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Dữ liệu lưu trữ thời gian thực trên Firebase Firestore</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
