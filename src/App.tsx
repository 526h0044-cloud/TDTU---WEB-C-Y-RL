/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Header
} from './components/Header';
import {
  StatsBar
} from './components/StatsBar';
import {
  FilterBar
} from './components/FilterBar';
import {
  PostCard
} from './components/PostCard';
import {
  PostDetailModal
} from './components/PostDetailModal';
import {
  AdminGroupManager
} from './components/AdminGroupManager';
import {
  PostScannerModal
} from './components/PostScannerModal';
import {
  DrlTargetTracker
} from './components/DrlTargetTracker';
import {
  ScanProgressModal
} from './components/ScanProgressModal';
import {
  TdtuDrlHandbookModal
} from './components/TdtuDrlHandbookModal';
import { FBGroup, ScannedPost, UserSettings } from './types';
import {
  testConnection,
  fetchGroups,
  subscribeToGroups,
  saveGroup,
  removeGroup,
  toggleGroupStatus,
  fetchPosts,
  subscribeToPosts,
  savePostIfNotExists,
  updatePostBookmark,
  updatePostRegistered,
  removePost,
  clearAllPosts,
  INITIAL_GROUPS,
  seedInitialDataIfEmpty,
  subscribeToUserSettings,
  saveUserSettings,
  DEFAULT_USER_SETTINGS,
  runGroupScan,
  ScanProgressInfo
} from './services/firebase';
import {
  Sparkles,
  RefreshCw,
  Flame,
  Award,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Download,
  Trash2,
  Building2,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [groups, setGroups] = useState<FBGroup[]>([]);
  const [posts, setPosts] = useState<ScannedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [hasFormOnly, setHasFormOnly] = useState(false);
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [registeredOnly, setRegisteredOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'points' | 'deadline'>('newest');

  // Modals state
  const [selectedDetailPost, setSelectedDetailPost] = useState<ScannedPost | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgressInfo | null>(null);
  const [isHandbookOpen, setIsHandbookOpen] = useState(false);

  // User Settings state persisted in Firestore (Real Data - No LocalStorage)
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Web Audio chime for DRL alerts
  const playAlertSound = useCallback(() => {
    if (!userSettings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.3); // D6

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.5);
      osc2.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }, [userSettings.soundEnabled]);

  // Initial Boot & Realtime Firebase connection
  useEffect(() => {
    let unsubscribeGroups: (() => void) | undefined;
    let unsubscribePosts: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    async function init() {
      setIsLoading(true);
      const connected = await testConnection();
      setIsFirebaseConnected(connected);

      try {
        // Auto-seed all 24 real university groups if missing from Firestore
        await seedInitialDataIfEmpty();

        // Real-time synchronization for Groups
        unsubscribeGroups = subscribeToGroups((realtimeGroups) => {
          setGroups(realtimeGroups);
        });

        // Real-time synchronization for User Preferences (target score, sound)
        unsubscribeSettings = subscribeToUserSettings((realtimeSettings) => {
          setUserSettings(realtimeSettings);
        });

        // Real-time synchronization for Posts
        unsubscribePosts = subscribeToPosts((realtimePosts) => {
          setPosts((prevPosts) => {
            // Check if any brand new definite post was added to chime
            if (prevPosts.length > 0 && realtimePosts.length > prevPosts.length) {
              const newDefinite = realtimePosts.find(
                (np) => np.classification === 'definite' && !prevPosts.some((op) => op.id === np.id)
              );
              if (newDefinite) {
                playAlertSound();
                showToast(`Phát hiện bài mới: ${newDefinite.summary}`, 'success');
              }
            }
            return realtimePosts;
          });
          setIsLoading(false);
        });
      } catch (err) {
        console.warn('Realtime subscription error:', err);
        setIsLoading(false);
      }
    }

    init();

    return () => {
      if (unsubscribeGroups) unsubscribeGroups();
      if (unsubscribePosts) unsubscribePosts();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [playAlertSound, showToast]);

  const handleToggleSound = async () => {
    const next = !userSettings.soundEnabled;
    setUserSettings((prev) => ({ ...prev, soundEnabled: next }));
    if (next) playAlertSound();
    await saveUserSettings({ soundEnabled: next });
    showToast(next ? 'Đã bật chuông thông báo bài ĐRL' : 'Đã tắt chuông', 'info');
  };

  const handleTargetChange = async (newTarget: number) => {
    setUserSettings((prev) => ({ ...prev, targetPoints: newTarget }));
    await saveUserSettings({ targetPoints: newTarget });
    showToast(`Đã lưu mục tiêu ${newTarget} điểm rèn luyện lên Firebase Cloud`, 'success');
  };

  // Group operations
  const handleAddGroup = async (newGroupData: Omit<FBGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `grp_${Date.now()}`;
    const now = new Date().toISOString();
    const newGroup: FBGroup = {
      ...newGroupData,
      id,
      createdAt: now,
      updatedAt: now
    };

    await saveGroup(newGroup);
    setGroups((prev) => [newGroup, ...prev]);
    showToast(`Đã thêm nhóm "${newGroup.name}" thành công!`, 'success');
  };

  const handleDeleteGroup = async (groupId: string) => {
    await removeGroup(groupId);
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    showToast('Đã xóa nhóm khỏi danh sách theo dõi', 'info');
  };

  const handleToggleGroupActive = async (groupId: string, current: boolean) => {
    await toggleGroupStatus(groupId, current);
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isActive: current } : g))
    );
  };

  const handleRestoreDefaults = async () => {
    for (const group of INITIAL_GROUPS) {
      await saveGroup(group);
    }
    const refreshed = await fetchGroups();
    setGroups(refreshed);
    showToast(`Đã đồng bộ đầy đủ 24 nhóm Facebook TDTU thực tế lên Server!`, 'success');
  };

  // Post operations
  const handleSaveScannedPost = async (post: ScannedPost) => {
    const res = await savePostIfNotExists(post);
    if (res.isNew) {
      setPosts((prev) => [res.post, ...prev.filter((p) => p.id !== res.post.id)]);
      if (res.post.classification === 'definite') {
        playAlertSound();
      }
      return {
        isNew: true,
        message: 'Đã lưu bài viết thật lên server Firebase thành công!'
      };
    } else {
      return {
        isNew: false,
        message: 'Bài viết này đã tồn tại trên Server từ trước (tránh lưu trùng lặp thành công)!'
      };
    }
  };

  const handleToggleBookmark = async (postId: string, current: boolean) => {
    await updatePostBookmark(postId, current);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: current } : p))
    );
    if (selectedDetailPost && selectedDetailPost.id === postId) {
      setSelectedDetailPost((prev) => (prev ? { ...prev, isBookmarked: current } : null));
    }
  };

  const handleToggleRegistered = async (postId: string, current: boolean) => {
    await updatePostRegistered(postId, current);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isRegistered: current } : p))
    );
    if (selectedDetailPost && selectedDetailPost.id === postId) {
      setSelectedDetailPost((prev) => (prev ? { ...prev, isRegistered: current } : null));
    }
    showToast(current ? 'Đã đánh dấu nộp form thành công (+ Điểm đã cập nhật)' : 'Đã bỏ đánh dấu nộp form', 'info');
  };

  const handleDeletePost = async (postId: string) => {
    await removePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Đã xóa bài viết khỏi cơ sở dữ liệu server', 'info');
  };

  const handleClearAllPosts = async () => {
    if (confirm('Bạn có chắc muốn xóa tất cả bài đăng trên server để bắt đầu dữ liệu hoàn toàn mới?')) {
      await clearAllPosts();
      setPosts([]);
      showToast('Đã dọn sạch cơ sở dữ liệu bài viết', 'info');
    }
  };

  // Export Real Data to CSV
  const handleExportCsv = () => {
    if (posts.length === 0) {
      showToast('Chưa có bài viết nào để xuất', 'warning');
      return;
    }

    const headers = ['ID', 'Nhóm', 'Phân loại', 'Điểm ĐRL', 'Tiêu chí', 'Hạn chót', 'Link Form', 'Đã nộp form', 'Link bài gốc'];
    const rows = posts.map((p) => [
      `"${p.id}"`,
      `"${p.groupName || ''}"`,
      `"${p.classification === 'definite' ? 'Chắc chắn có ĐRL' : p.classification === 'potential' ? 'Có thể có' : 'Không có'}"`,
      `"${p.points || ''}"`,
      `"${p.criteria || ''}"`,
      `"${p.deadline || ''}"`,
      `"${(p.formUrls || [])[0] || ''}"`,
      `"${p.isRegistered ? 'Đã nộp' : 'Chưa nộp'}"`,
      `"${p.postUrl}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh_sach_san_drl_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải xuống file CSV báo cáo ĐRL thành công!', 'success');
  };

  // Trigger group check with real AI deduplicated scan
  const handleRunAutoScan = async () => {
    setIsScanning(true);
    showToast('Đang kết nối các nhóm Facebook và quét bài viết mới...', 'info');

    try {
      const activeGroups = groups.filter((g) => g.isActive);
      if (activeGroups.length === 0) {
        showToast('Không có nhóm nào đang bật theo dõi. Vui lòng bật ít nhất 1 nhóm trong Quản lý Groups.', 'warning');
        setIsScanning(false);
        return;
      }

      const scanResult = await runGroupScan(activeGroups, (info) => {
        setScanProgress(info);
      });
      const refreshed = await fetchPosts();
      setPosts(refreshed);

      if (scanResult.newPostsFound > 0) {
        playAlertSound();
        showToast(
          `Đã quét ${scanResult.groupsScanned} nhóm: Phát hiện ${scanResult.newPostsFound} bài mới (${scanResult.definiteCount} bài chắc chắn có ĐRL)!`,
          'success'
        );
      } else {
        showToast(
          `Đã quét ${scanResult.groupsScanned} nhóm: Toàn bộ ${scanResult.groupsScanned} nhóm đã được quét, không có bài mới phát sinh!`,
          'info'
        );
      }
    } catch (err) {
      showToast('Lỗi khi quét nhóm: ' + (err instanceof Error ? err.message : String(err)), 'warning');
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClassification('all');
    setSelectedGroup('all');
    setHasFormOnly(false);
    setBookmarksOnly(false);
    setRegisteredOnly(false);
    setSortBy('newest');
    showToast('Đã đặt lại toàn bộ bộ lọc', 'info');
  };

  // Filtered and sorted posts calculation
  const filteredPosts = useMemo(() => {
    const list = posts.filter((post) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          post.summary.toLowerCase().includes(q) ||
          post.rawContent.toLowerCase().includes(q) ||
          (post.groupName && post.groupName.toLowerCase().includes(q)) ||
          (post.keyPhrases && post.keyPhrases.some((k) => k.toLowerCase().includes(q))) ||
          (post.points && post.points.toLowerCase().includes(q)) ||
          (post.criteria && post.criteria.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      // Classification filter
      if (selectedClassification !== 'all') {
        if (post.classification !== selectedClassification) return false;
      }

      // Group filter
      if (selectedGroup !== 'all') {
        if (post.groupName !== selectedGroup) return false;
      }

      // Has form only filter
      if (hasFormOnly) {
        if (!post.formUrls || post.formUrls.length === 0) return false;
      }

      // Bookmarks only filter
      if (bookmarksOnly) {
        if (!post.isBookmarked) return false;
      }

      // Registered only filter
      if (registeredOnly) {
        if (!post.isRegistered) return false;
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'points') {
        const getPointsNum = (p: ScannedPost) => {
          if (!p.points) return 0;
          const match = p.points.match(/(\d+(?:\.\d+)?)/);
          return match ? parseFloat(match[1]) : 0;
        };
        return getPointsNum(b) - getPointsNum(a);
      }
      if (sortBy === 'deadline') {
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        return (b.scannedAt || b.createdAt || '').localeCompare(a.scannedAt || a.createdAt || '');
      }
      // Default: newest first
      return (b.scannedAt || b.createdAt || '').localeCompare(a.scannedAt || a.createdAt || '');
    });
  }, [posts, searchQuery, selectedClassification, selectedGroup, hasFormOnly, bookmarksOnly, registeredOnly, sortBy]);

  const activeGroupCount = groups.filter((g) => g.isActive).length;

  const totalAccumulatedPoints = useMemo(() => {
    return posts
      .filter((p) => p.isRegistered && p.classification === 'definite')
      .reduce((sum, p) => {
        if (!p.points) return sum;
        const match = p.points.match(/(\d+(?:\.\d+)?)/);
        return sum + (match ? parseFloat(match[1]) : 0);
      }, 0);
  }, [posts]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <Header
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenGroupManager={() => setIsGroupManagerOpen(true)}
        onRunAutoScan={handleRunAutoScan}
        onOpenHandbook={() => setIsHandbookOpen(true)}
        isScanning={isScanning}
        soundEnabled={userSettings.soundEnabled}
        onToggleSound={handleToggleSound}
        isFirebaseConnected={isFirebaseConnected}
        activeGroupCount={activeGroupCount}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 sm:p-8 text-white shadow-lg mb-6">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white mb-3">
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              <span>Hệ Thống Theo Dõi ĐRL Thực Tế • Chống Trùng Lặp 100%</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Săn Form Điểm Rèn Luyện Trực Tiếp Từ Facebook Groups
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed mb-4">
              Dán link bài viết hoặc nội dung thật từ các nhóm trường. AI sẽ phân loại bài chắc chắn có ĐRL,
              bắt trọn link Google/MS Form, trích xuất số điểm và hạn chót để bạn không bao giờ lỡ hạn!
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-800 shadow-md hover:bg-blue-50 active:scale-95 transition-all"
              >
                <PlusCircle className="h-4 w-4 text-blue-600" />
                <span>Quét bài viết Facebook ngay</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGroupManagerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-800/80 border border-blue-400/40 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 active:scale-95 transition-all"
              >
                <Building2 className="h-4 w-4" />
                <span>Quản lý danh sách Groups</span>
              </button>

              <button
                type="button"
                onClick={() => setIsHandbookOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md active:scale-95 transition-all"
                title="Mở cẩm nang quy chế 5 tiêu chí ĐRL & Chat Cố vấn AI TDTU"
              >
                <BookOpen className="h-4 w-4 text-slate-950" />
                <span>Cẩm nang ĐRL TDTU</span>
              </button>

              {posts.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors"
                  title="Xuất file CSV danh sách bài có ĐRL"
                >
                  <Download className="h-4 w-4" />
                  <span>Xuất CSV</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Student Target ĐRL Tracker */}
        <DrlTargetTracker
          posts={posts}
          targetPoints={userSettings.targetPoints}
          onTargetChange={handleTargetChange}
        />

        {/* Stats Metrics Bar */}
        <StatsBar
          posts={posts}
          activeFilter={selectedClassification}
          hasFormOnly={hasFormOnly}
          registeredOnly={registeredOnly}
          onSelectFilter={(filter) => {
            if (filter === 'has_form') {
              setHasFormOnly((prev) => !prev);
            } else if (filter === 'registered') {
              setRegisteredOnly((prev) => !prev);
            } else if (filter === 'definite' || filter === 'potential') {
              setSelectedClassification((prev) => (prev === filter ? 'all' : filter));
            } else {
              setSelectedClassification('all');
            }
          }}
        />

        {/* Filters */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedClassification={selectedClassification}
          onClassificationChange={setSelectedClassification}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          groups={groups}
          hasFormOnly={hasFormOnly}
          onToggleHasFormOnly={() => setHasFormOnly((prev) => !prev)}
          bookmarksOnly={bookmarksOnly}
          onToggleBookmarksOnly={() => setBookmarksOnly((prev) => !prev)}
          registeredOnly={registeredOnly}
          onToggleRegisteredOnly={() => setRegisteredOnly((prev) => !prev)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
        />

        {/* Action Toolbar above posts */}
        {posts.length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
            <span>
              Hiển thị <strong className="text-slate-800">{filteredPosts.length}</strong> / {posts.length} bài đăng thật trên server
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAllPosts}
                className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                title="Dọn sạch tất cả bài đăng trên server"
              >
                <Trash2 className="h-3 w-3" />
                <span>Xóa hết bài</span>
              </button>
            </div>
          </div>
        )}

        {/* Posts Grid Feed */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded-md w-1/3 mb-4" />
                <div className="h-4 bg-slate-200 rounded-md w-full mb-2" />
                <div className="h-4 bg-slate-200 rounded-md w-4/5 mb-4" />
                <div className="h-8 bg-slate-100 rounded-md w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {posts.length === 0 ? 'Chưa có bài viết nào trong hệ thống' : 'Không tìm thấy bài viết phù hợp với bộ lọc'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
              {posts.length === 0
                ? 'Hãy dán link bài viết hoặc nội dung thật từ nhóm Facebook trường để AI phân loại và lưu trữ chống trùng lặp!'
                : 'Thử điều chỉnh từ khóa tìm kiếm hoặc chọn danh mục khác.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Quét bài đăng Facebook</span>
              </button>

              {groups.length === 0 && (
                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Nạp danh sách nhóm TDTU mẫu</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenDetail={setSelectedDetailPost}
                onToggleBookmark={handleToggleBookmark}
                onToggleRegistered={handleToggleRegistered}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <PostDetailModal
        post={selectedDetailPost}
        onClose={() => setSelectedDetailPost(null)}
        onToggleBookmark={handleToggleBookmark}
        onToggleRegistered={handleToggleRegistered}
        onDeletePost={handleDeletePost}
      />

      {/* Admin Group Manager Modal */}
      <AdminGroupManager
        isOpen={isGroupManagerOpen}
        onClose={() => setIsGroupManagerOpen(false)}
        groups={groups}
        onAddGroup={handleAddGroup}
        onDeleteGroup={handleDeleteGroup}
        onToggleActive={handleToggleGroupActive}
        onRestoreDefaults={handleRestoreDefaults}
      />

      {/* AI Post Scanner Modal */}
      <PostScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        groups={groups}
        onSavePost={handleSaveScannedPost}
      />

      {/* Visual Live Scanning Progress Modal */}
      <ScanProgressModal
        isOpen={isScanning}
        progressInfo={scanProgress}
      />

      {/* TDTU DRL Knowledge Handbook & AI Advisor Modal */}
      <TdtuDrlHandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
        currentPoints={totalAccumulatedPoints}
      />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs sm:text-sm font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
