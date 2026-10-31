export type ClassificationType = 'definite' | 'potential' | 'none';
export type PostIntent = 'announcement' | 'question' | 'discussion';

export interface FBGroup {
  id: string;
  name: string;
  url: string;
  category: 'university' | 'faculty' | 'club' | 'youth_union' | 'other';
  description?: string;
  isActive: boolean;
  addedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScannedPost {
  id: string; // Deterministic deduplication hash
  groupId?: string;
  groupName?: string;
  postUrl: string;
  authorName?: string;
  rawContent: string;
  summary: string;
  classification: ClassificationType;
  confidence: number; // 0 to 100
  keyPhrases: string[];
  formUrls: string[];
  eventTime?: string;
  deadline?: string;
  points?: string;
  criteria?: string;
  intent?: PostIntent;
  feeOrPrize?: string;
  tdtuCriteriaId?: number;
  isBookmarked?: boolean;
  isRegistered?: boolean;
  scannedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  groupsScanned: number;
  newPostsFound: number;
  definiteCount: number;
  potentialCount: number;
  triggeredBy: string;
  status: 'success' | 'partial' | 'failed';
}

export interface PostAnalysisResult {
  classification: ClassificationType;
  confidence: number;
  keyPhrases: string[];
  formUrls: string[];
  summary: string;
  eventTime?: string;
  deadline?: string;
  points?: string;
  criteria?: string;
  intent?: PostIntent;
  feeOrPrize?: string;
  tdtuCriteriaId?: number;
  explanation: string;
}

export interface UserSettings {
  id: string;
  soundEnabled: boolean;
  targetPoints: number;
  studentEmail?: string;
  updatedAt: string;
}

