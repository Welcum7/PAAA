export type UserRole = 'super_admin' | 'auditor' | 'moderator';

export interface Permission {
  canManageNominees: boolean;
  canManageCategories: boolean;
  canManageYears: boolean;
  canTallyAudit: boolean;
  canDisqualifyVotes: boolean;
  canManageUsers: boolean;
  canExportReports: boolean;
  canResetData: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  lastLogin: string;
}

export interface AwardCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
  order: number;
}

export interface YearEdition {
  year: number;
  label: string;
  status: 'active' | 'archived' | 'upcoming';
  deadline: string;
  totalCategories: number;
}

export interface Nominee {
  id: string;
  name: string;
  organization?: string;
  category: string; // matches Category id
  year: number;
  bio: string;
  impact: string;
  imageUrl: string;
  votes: number;
  flaggedVotes: number;
  disqualifiedVotes: number;
  location: string;
  isVotingActive: boolean;
  createdAt: string;
}

export interface VoteRecord {
  id: string;
  nomineeId: string;
  nomineeName: string;
  category: string;
  year: number;
  voterIp: string;
  fingerprint: string;
  captchaScore: number; // 0 to 1
  locationEstimate: string;
  timestamp: string;
  status: 'verified' | 'flagged' | 'disqualified';
  flagReason?: string;
  receiptCode: string;
}

export interface AntiCheatLog {
  id: string;
  ip: string;
  timestamp: string;
  attemptCount: number;
  action: 'vote_approved' | 'rate_limited' | 'captcha_failed' | 'duplicate_blocked' | 'suspicious_proxy_flagged';
  details: string;
}

export interface VoterSession {
  ip: string;
  votedCategories: Record<string, string>; // categoryId -> nomineeId
  fingerprint: string;
  voteHistory: {
    nomineeId: string;
    category: string;
    timestamp: string;
    receiptCode: string;
  }[];
}

export interface AppSettings {
  hidePublicVoteCounts: boolean; // Voters should not be able to see other votes casted
  allowPublicResultsTab: boolean; // Restrict live leaderboard to admin/auditor only
  allowPublicStatsTab: boolean; // Restrict stats table to admin/auditor only
  allowPublicAnalyticsTab: boolean; // Restrict analytics to admin/auditor only
  votingIsOpen: boolean; // Global voting pause switch
}
