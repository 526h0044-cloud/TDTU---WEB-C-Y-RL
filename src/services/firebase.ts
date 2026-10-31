import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  limit,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { FBGroup, ScannedPost, ScanLog, UserSettings } from '../types';

// Initialize Firebase App & Firestore with specific Database ID
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as required by system skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
    }
    return false;
  }
}

// --------------------------------------------------------------------------
// GROUPS SERVICE
// --------------------------------------------------------------------------

// Utility to remove undefined fields because Firestore rejects undefined values
function sanitizeForFirestore<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

export async function fetchGroups(): Promise<FBGroup[]> {
  const path = 'groups';
  try {
    const snap = await getDocs(collection(db, path));
    const groupMap = new Map<string, FBGroup>();
    snap.forEach((d) => {
      const data = d.data() as FBGroup;
      const id = data.id || d.id;
      groupMap.set(id, { ...data, id });
    });
    return Array.from(groupMap.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeToGroups(onUpdate: (groups: FBGroup[]) => void): () => void {
  const path = 'groups';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const groupMap = new Map<string, FBGroup>();
      snap.forEach((d) => {
        const data = d.data() as FBGroup;
        const id = data.id || d.id;
        groupMap.set(id, { ...data, id });
      });
      const uniqueGroups = Array.from(groupMap.values());
      onUpdate(uniqueGroups.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function saveGroup(group: FBGroup): Promise<void> {
  const path = `groups/${group.id}`;
  try {
    const docRef = doc(db, 'groups', group.id);
    const existing = await getDoc(docRef);
    const now = new Date().toISOString();
    const dataToSave: FBGroup = {
      ...group,
      createdAt: existing.exists() ? (existing.data() as FBGroup).createdAt || group.createdAt : group.createdAt || now,
      updatedAt: now
    };
    await setDoc(docRef, sanitizeForFirestore(dataToSave as unknown as Record<string, unknown>));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeGroup(groupId: string): Promise<void> {
  const path = `groups/${groupId}`;
  try {
    await deleteDoc(doc(db, 'groups', groupId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function toggleGroupStatus(groupId: string, isActive: boolean): Promise<void> {
  const path = `groups/${groupId}`;
  try {
    await updateDoc(doc(db, 'groups', groupId), {
      isActive,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// --------------------------------------------------------------------------
// POSTS SERVICE (WITH DEDUPLICATION & REALTIME)
// --------------------------------------------------------------------------

export async function fetchPosts(): Promise<ScannedPost[]> {
  const path = 'posts';
  try {
    const snap = await getDocs(collection(db, path));
    const postMap = new Map<string, ScannedPost>();
    snap.forEach((d) => {
      const data = d.data() as ScannedPost;
      const id = data.id || d.id;
      postMap.set(id, { ...data, id });
    });
    return Array.from(postMap.values()).sort((a, b) => (b.scannedAt || b.createdAt || '').localeCompare(a.scannedAt || a.createdAt || ''));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeToPosts(onUpdate: (posts: ScannedPost[]) => void): () => void {
  const path = 'posts';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const postMap = new Map<string, ScannedPost>();
      snap.forEach((d) => {
        const data = d.data() as ScannedPost;
        const id = data.id || d.id;
        postMap.set(id, { ...data, id });
      });
      onUpdate(Array.from(postMap.values()).sort((a, b) => (b.scannedAt || b.createdAt || '').localeCompare(a.scannedAt || a.createdAt || '')));
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

/**
 * Checks if the post already exists in Firestore.
 * If not, saves it. Returns { isNew: boolean, post: ScannedPost }.
 * This fulfills: "khi quét và cho lên server lúc sau sẽ không cho lại nữa"
 */
export async function savePostIfNotExists(post: ScannedPost): Promise<{ isNew: boolean; post: ScannedPost }> {
  const path = `posts/${post.id}`;
  try {
    const docRef = doc(db, 'posts', post.id);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      return { isNew: false, post: existing.data() as ScannedPost };
    }

    await setDoc(docRef, sanitizeForFirestore(post as unknown as Record<string, unknown>));
    return { isNew: true, post };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updatePostBookmark(postId: string, isBookmarked: boolean): Promise<void> {
  const path = `posts/${postId}`;
  try {
    await updateDoc(doc(db, 'posts', postId), {
      isBookmarked,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updatePostRegistered(postId: string, isRegistered: boolean): Promise<void> {
  const path = `posts/${postId}`;
  try {
    await updateDoc(doc(db, 'posts', postId), {
      isRegistered,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function removePost(postId: string): Promise<void> {
  const path = `posts/${postId}`;
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function clearAllPosts(): Promise<void> {
  const path = 'posts';
  try {
    const snap = await getDocs(collection(db, path));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'posts', d.id));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// --------------------------------------------------------------------------
// SCAN LOGS
// --------------------------------------------------------------------------

export async function saveScanLog(log: ScanLog): Promise<void> {
  const path = `scan_logs/${log.id}`;
  try {
    await setDoc(doc(db, 'scan_logs', log.id), sanitizeForFirestore(log as unknown as Record<string, unknown>));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchScanLogs(): Promise<ScanLog[]> {
  const path = 'scan_logs';
  try {
    const q = query(collection(db, path), limit(20));
    const snap = await getDocs(q);
    const logs: ScanLog[] = [];
    snap.forEach((d) => {
      logs.push(d.data() as ScanLog);
    });
    return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// --------------------------------------------------------------------------
// USER SETTINGS SERVICE (REAL PERSISTENCE IN FIRESTORE - NO LOCALSTORAGE)
// --------------------------------------------------------------------------

const SETTINGS_DOC_ID = 'student_drl_preferences';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  id: SETTINGS_DOC_ID,
  soundEnabled: true,
  targetPoints: 85,
  studentEmail: '526h0044@student.tdtu.edu.vn',
  updatedAt: new Date().toISOString()
};

export async function fetchUserSettings(): Promise<UserSettings> {
  const path = `settings/${SETTINGS_DOC_ID}`;
  try {
    const snap = await getDoc(doc(db, 'settings', SETTINGS_DOC_ID));
    if (snap.exists()) {
      return snap.data() as UserSettings;
    }
    // If not exists, save default real settings to Firestore
    await setDoc(doc(db, 'settings', SETTINGS_DOC_ID), sanitizeForFirestore(DEFAULT_USER_SETTINGS as unknown as Record<string, unknown>));
    return DEFAULT_USER_SETTINGS;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export function subscribeToUserSettings(onUpdate: (settings: UserSettings) => void): () => void {
  const path = `settings/${SETTINGS_DOC_ID}`;
  return onSnapshot(
    doc(db, 'settings', SETTINGS_DOC_ID),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserSettings);
      } else {
        // Initialize if empty
        saveUserSettings(DEFAULT_USER_SETTINGS).catch(console.warn);
        onUpdate(DEFAULT_USER_SETTINGS);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
  const path = `settings/${SETTINGS_DOC_ID}`;
  try {
    const updated: UserSettings = {
      id: SETTINGS_DOC_ID,
      soundEnabled: settings.soundEnabled ?? true,
      targetPoints: settings.targetPoints ?? 85,
      studentEmail: settings.studentEmail ?? '526h0044@student.tdtu.edu.vn',
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'settings', SETTINGS_DOC_ID), sanitizeForFirestore(updated as unknown as Record<string, unknown>));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// --------------------------------------------------------------------------
// 24 REAL UNIVERSITY FACEBOOK GROUPS (TDTU & FACULTIES & CLUBS)
// --------------------------------------------------------------------------

export const INITIAL_GROUPS: FBGroup[] = [
  {
    id: 'grp_tdtu_youth_union',
    name: 'Đoàn TNCS Hồ Chí Minh - Hội Sinh viên TDTU',
    url: 'https://www.facebook.com/groups/doanhoitdtu.official',
    category: 'youth_union',
    description: 'Kênh phát động các chiến dịch tình nguyện Mùa hè xanh, Xuân tình nguyện, SV5T và các chương trình cấp ĐRL toàn trường',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_ctsv_university',
    name: 'Phòng Công tác Học sinh - Sinh viên (CTHSSV) - TDTU',
    url: 'https://www.facebook.com/groups/ctsv.tdtu.official',
    category: 'university',
    description: 'Thông báo chính thức về Quy chế đánh giá rèn luyện, tuần sinh hoạt công dân, xét học bổng và kỷ luật',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_it_faculty',
    name: 'Khoa Công nghệ Thông tin - Thông tin & Hoạt động Sinh viên TDTU',
    url: 'https://www.facebook.com/groups/it.tdtu.students',
    category: 'faculty',
    description: 'Hội thảo công nghệ, TechTalk, cuộc thi AI & Hackathon, seminar học thuật cộng ĐRL Tiêu chí 1 & 3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_ba_faculty',
    name: 'Đoàn - Hội Khoa Quản trị Kinh doanh (BA - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoiba.tdtu',
    category: 'faculty',
    description: 'Chương trình kỹ năng quản trị, Company Tour, Talkshow doanh nhân và hoạt động cấp ĐRL Khoa QTKD',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_eee_faculty',
    name: 'Đoàn - Hội Khoa Điện - Điện tử (EEE - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoieee.tdtu',
    category: 'faculty',
    description: 'Thông tin thực tập doanh nghiệp, hội thảo chuyên đề kỹ thuật, ngày hội công nghệ và hoạt động phong trào EEE',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_ffl_faculty',
    name: 'Đoàn - Hội Khoa Ngoại ngữ (FFL - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoiffl.tdtu',
    category: 'faculty',
    description: 'Các cuộc thi hùng biện tiếng Anh, Ngày hội giao lưu văn hóa quốc tế, câu lạc bộ ngoại ngữ cộng ĐRL Tiêu chí 3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_finance_faculty',
    name: 'Đoàn - Hội Khoa Tài chính - Ngân hàng (BF - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoifinance.tdtu',
    category: 'faculty',
    description: 'Hội thảo tài chính chứng khoán, giải đấu học thuật sinh viên, hoạt động cộng đồng cấp ĐRL Khoa TCNH',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_accounting_faculty',
    name: 'Đoàn - Hội Khoa Kế toán (AF - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoiaf.tdtu',
    category: 'faculty',
    description: 'Cuộc thi học thuật I-Audit, workshop chuẩn mực kiểm toán, hoạt động tình nguyện cấp ĐRL',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_law_faculty',
    name: 'Đoàn - Hội Khoa Luật (Law - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoilaw.tdtu',
    category: 'faculty',
    description: 'Phiên tòa giả định, diễn đàn pháp luật sinh viên, hoạt động tư vấn trợ giúp pháp lý cộng ĐRL Tiêu chí 4',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_design_faculty',
    name: 'Đoàn - Hội Khoa Mỹ thuật Công nghiệp (Design - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoidesign.tdtu',
    category: 'faculty',
    description: 'Triển lãm đồ án mỹ thuật, workshop sáng tạo thiết kế thời trang & đồ họa, hoạt động văn nghệ cấp ĐRL',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_pharmacy_faculty',
    name: 'Đoàn - Hội Khoa Dược (Pharmacy - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoipharmacy.tdtu',
    category: 'faculty',
    description: 'Tuyên truyền sức khỏe học đường, hiến máu tình nguyện, hội thảo dược lâm sàng cấp ĐRL',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_ssh_faculty',
    name: 'Đoàn - Hội Khoa Khoa học Xã hội & Nhân văn (SSH - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoissh.tdtu',
    category: 'faculty',
    description: 'Hội thảo du lịch, văn hóa và cộng đồng, các phong trào công tác xã hội cấp ĐRL Tiêu chí 3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_math_faculty',
    name: 'Đoàn - Hội Khoa Toán - Thống kê (Math - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoimath.tdtu',
    category: 'faculty',
    description: 'Hội thảo phân tích dữ liệu, Olympic Toán học sinh viên, hoạt động ngoại khóa cấp ĐRL',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_fas_faculty',
    name: 'Đoàn - Hội Khoa Khoa học Ứng dụng (FAS - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoifas.tdtu',
    category: 'faculty',
    description: 'Hoạt động công nghệ sinh học, kỹ thuật hóa học, tham quan nhà máy thực tế cấp ĐRL',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_civil_faculty',
    name: 'Đoàn - Hội Khoa Kỹ thuật Công trình (Civil - TDTU)',
    url: 'https://www.facebook.com/groups/doanhoicivil.tdtu',
    category: 'faculty',
    description: 'Cuộc thi thiết kế kết cấu cầu mô hình, an toàn lao động công trường, hoạt động tình nguyện cấp ĐRL',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_skills_club',
    name: 'CLB Kỹ Năng Sinh Viên TDTU (SSC - Skills Student Club)',
    url: 'https://www.facebook.com/groups/clbkynang.tdtu',
    category: 'club',
    description: 'Chuỗi tập huấn kỹ năng giao tiếp, quản lý thời gian, tư duy phản biện và phỏng vấn xin việc có cấp ĐRL',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_english_club',
    name: 'CLB Tiếng Anh TDTU (TEC - TDTU English Club)',
    url: 'https://www.facebook.com/groups/tec.tdtu.official',
    category: 'club',
    description: 'English Speaking Zone, câu lạc bộ thảo luận tiếng Anh hàng tuần, workshop IELTS cấp minh chứng ĐRL',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_social_work',
    name: 'Đội Công tác Xã hội TDTU (CTXH TDTU)',
    url: 'https://www.facebook.com/groups/congtacxahoi.tdtu',
    category: 'club',
    description: 'Các chuyến đi thiện nguyện vùng sâu vùng xa, hiến máu cứu người, trung thu cho em cộng điểm rèn luyện Tiêu chí 3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_src_club',
    name: 'CLB Nghiên cứu Khoa học Sinh viên (SRC TDTU)',
    url: 'https://www.facebook.com/groups/nckhsinhvien.tdtu',
    category: 'club',
    description: 'Thông báo đăng ký đề tài NCKH, viết bài báo khoa học sinh viên, cuộc thi sáng tạo trẻ cộng điểm rèn luyện Tiêu chí 1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_book_action',
    name: 'CLB Sách và Hành động TDTU (BAC)',
    url: 'https://www.facebook.com/groups/sachvahanhdong.tdtu',
    category: 'club',
    description: 'Ngày hội đọc sách, lan tỏa văn hóa đọc, thử thách 21 ngày đọc sách cấp chứng nhận rèn luyện',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_stec_club',
    name: 'CLB Tin học STEC - Khoa CNTT TDTU',
    url: 'https://www.facebook.com/groups/stec.tdtu',
    category: 'club',
    description: 'Workshop lập trình web, công nghệ mới, hướng dẫn sửa máy tính miễn phí cho sinh viên cấp ĐRL',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_green_club',
    name: 'CLB Môi trường Xanh TDTU (Green TDTU)',
    url: 'https://www.facebook.com/groups/moitruongxanh.tdtu',
    category: 'club',
    description: 'Chiến dịch Ngày Chủ nhật Xanh, phân loại rác bảo vệ môi trường khuôn viên trường cộng ĐRL Tiêu chí 3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_blood_donation',
    name: 'Đội Thanh niên Vận động Hiến máu Tình nguyện TDTU',
    url: 'https://www.facebook.com/groups/hienmautdtu',
    category: 'youth_union',
    description: 'Các đợt hiến máu nhân đạo định kỳ tại trường, cấp Giấy chứng nhận hiến máu tình nguyện và cộng điểm rèn luyện',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_tdtu_student_community',
    name: 'Cộng đồng Sinh viên TDTU - Chia sẻ Điểm rèn luyện',
    url: 'https://www.facebook.com/groups/sinhvientdtu.drl',
    category: 'other',
    description: 'Nơi giao lưu, cập nhật link form mở gấp và phản ánh kết quả điểm rèn luyện các kỳ',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const existingGroups = await fetchGroups();
    const existingIds = new Set(existingGroups.map((g) => g.id));
    
    // Seed all 24 real groups if missing from Firestore
    for (const group of INITIAL_GROUPS) {
      if (!existingIds.has(group.id)) {
        await setDoc(doc(db, 'groups', group.id), sanitizeForFirestore(group as unknown as Record<string, unknown>));
      }
    }
  } catch (err) {
    console.warn('Could not seed initial data:', err);
  }
}

