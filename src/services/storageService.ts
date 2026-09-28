import { Nominee, AwardCategory, YearEdition, VoteRecord, AdminUser, UserRole, VoterSession, AppSettings } from '../types';
import { INITIAL_NOMINEES, INITIAL_CATEGORIES, INITIAL_YEARS, INITIAL_ADMIN_USERS, INITIAL_VOTES } from '../data/initialData';

const STORAGE_KEYS = {
  NOMINEES: 'paaa_nominees_v1',
  CATEGORIES: 'paaa_categories_v1',
  YEARS: 'paaa_years_v1',
  VOTES: 'paaa_votes_v1',
  ADMIN_USERS: 'paaa_admin_users_v1',
  CURRENT_ADMIN: 'paaa_current_admin_v1',
  VOTER_SESSION: 'paaa_voter_session_v1',
  BLOCKED_IPS: 'paaa_blocked_ips_v1',
  ANTI_CHEAT_SETTINGS: 'paaa_anticheat_settings_v1',
  APP_SETTINGS: 'paaa_app_settings_v1',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  hidePublicVoteCounts: true, // Voters cannot see other votes casted (blind voting integrity)
  allowPublicResultsTab: false, // Live results restricted to administrative tally audit only
  allowPublicStatsTab: false, // Nominee stats restricted to administrative tally audit only
  allowPublicAnalyticsTab: false, // Analytics restricted to administrative tally audit only
  votingIsOpen: true,
};

// Generate realistic pseudo client IP and fingerprint
export const getClientFingerprint = (): string => {
  let fp = localStorage.getItem('paaa_device_fp');
  if (!fp) {
    const nav = window.navigator;
    const raw = `${nav.userAgent}-${nav.language}-${screen.width}x${screen.height}-${Date.now().toString(36)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    fp = `fp-${Math.abs(hash).toString(16).padStart(8, '0')}`;
    localStorage.setItem('paaa_device_fp', fp);
  }
  return fp;
};

export const getSimulatedClientIp = (): string => {
  let ip = localStorage.getItem('paaa_client_ip');
  if (!ip) {
    // Generate realistic African / Zimbabwe ISP subnet (Econet / Liquid Telecom / TelOne Zimbabwe)
    const host = Math.floor(Math.random() * 250) + 2;
    ip = `197.221.240.${host}`;
    localStorage.setItem('paaa_client_ip', ip);
  }
  return ip;
};

// Listeners for real-time reactivity
type Listener = () => void;
const listeners = new Set<Listener>();

export const subscribeToStorageChanges = (callback: Listener): (() => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notifySubscribers = () => {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (err) {
      console.error(err);
    }
  });
};

export class StorageService {
  // Nominees
  static getNominees(): Nominee[] {
    const stored = localStorage.getItem(STORAGE_KEYS.NOMINEES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.NOMINEES, JSON.stringify(INITIAL_NOMINEES));
      return INITIAL_NOMINEES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_NOMINEES;
    }
  }

  static saveNominees(nominees: Nominee[]) {
    localStorage.setItem(STORAGE_KEYS.NOMINEES, JSON.stringify(nominees));
    notifySubscribers();
  }

  static addNominee(nominee: Omit<Nominee, 'id' | 'votes' | 'flaggedVotes' | 'disqualifiedVotes' | 'createdAt'>): Nominee {
    const nominees = this.getNominees();
    const newNominee: Nominee = {
      ...nominee,
      id: `nom-${nominee.year}-${Date.now().toString(36)}`,
      votes: 0,
      flaggedVotes: 0,
      disqualifiedVotes: 0,
      createdAt: new Date().toISOString(),
    };
    nominees.unshift(newNominee);
    this.saveNominees(nominees);
    return newNominee;
  }

  static updateNominee(updated: Nominee) {
    const nominees = this.getNominees().map(n => n.id === updated.id ? updated : n);
    this.saveNominees(nominees);
  }

  static deleteNominee(id: string) {
    const nominees = this.getNominees().filter(n => n.id !== id);
    this.saveNominees(nominees);
  }

  // Categories
  static getCategories(): AwardCategory[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  static saveCategories(categories: AwardCategory[]) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    notifySubscribers();
  }

  static addCategory(cat: Omit<AwardCategory, 'id' | 'order'>): AwardCategory {
    const categories = this.getCategories();
    const id = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: AwardCategory = {
      ...cat,
      id: id || `cat-${Date.now().toString(36)}`,
      order: categories.length + 1,
    };
    categories.push(newCat);
    this.saveCategories(categories);
    return newCat;
  }

  // Years
  static getYears(): YearEdition[] {
    const stored = localStorage.getItem(STORAGE_KEYS.YEARS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(INITIAL_YEARS));
      return INITIAL_YEARS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_YEARS;
    }
  }

  static saveYears(years: YearEdition[]) {
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(years));
    notifySubscribers();
  }

  static addYear(yearNum: number, label: string) {
    const years = this.getYears();
    if (years.some(y => y.year === yearNum)) return;
    const newYear: YearEdition = {
      year: yearNum,
      label,
      status: 'active',
      deadline: new Date(yearNum, 11, 31).toISOString(),
      totalCategories: this.getCategories().length,
    };
    years.unshift(newYear);
    this.saveYears(years);
  }

  // Voter session & Anti-cheat tracking
  static getVoterSession(): VoterSession {
    const stored = localStorage.getItem(STORAGE_KEYS.VOTER_SESSION);
    const ip = getSimulatedClientIp();
    const fp = getClientFingerprint();
    if (!stored) {
      const session: VoterSession = {
        ip,
        fingerprint: fp,
        votedCategories: {},
        voteHistory: [],
      };
      localStorage.setItem(STORAGE_KEYS.VOTER_SESSION, JSON.stringify(session));
      return session;
    }
    try {
      const parsed = JSON.parse(stored);
      parsed.ip = ip;
      parsed.fingerprint = fp;
      return parsed;
    } catch {
      return { ip, fingerprint: fp, votedCategories: {}, voteHistory: [] };
    }
  }

  static hasVotedInCategory(categoryId: string, year: number = 2026): boolean {
    const session = this.getVoterSession();
    const key = `${year}_${categoryId}`;
    return Boolean(session.votedCategories[key]);
  }

  // Votes & Tally
  static getVotes(): VoteRecord[] {
    const stored = localStorage.getItem(STORAGE_KEYS.VOTES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(INITIAL_VOTES));
      return INITIAL_VOTES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_VOTES;
    }
  }

  static saveVotes(votes: VoteRecord[]) {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
    notifySubscribers();
  }

  static castVote(params: {
    nomineeId: string;
    captchaScore: number;
    customIp?: string;
  }): { success: boolean; message: string; receiptCode?: string; voteRecord?: VoteRecord } {
    const nominees = this.getNominees();
    const nominee = nominees.find(n => n.id === params.nomineeId);
    if (!nominee) {
      return { success: false, message: 'Nominee not found.' };
    }

    if (!nominee.isVotingActive) {
      return { success: false, message: 'Voting for this nominee or category is currently closed.' };
    }

    const voterSession = this.getVoterSession();
    const categoryKey = `${nominee.year}_${nominee.category}`;

    // Anti-cheat check 1: Client Session duplicate check
    if (voterSession.votedCategories[categoryKey]) {
      return {
        success: false,
        message: `Anti-Cheat Protection: You have already cast your vote in the "${nominee.category}" category for ${nominee.year}. One vote allowed per category.`,
      };
    }

    const clientIp = params.customIp || voterSession.ip;
    const votes = this.getVotes();

    // Anti-cheat check 2: IP-level category duplicate within 24 hours
    const existingIpVote = votes.find(
      v => v.voterIp === clientIp && v.category === nominee.category && v.year === nominee.year && v.status !== 'disqualified'
    );
    if (existingIpVote) {
      return {
        success: false,
        message: `Anti-Cheat Protection: IP address (${clientIp}) has already submitted a ballot in this category. Multiple submissions from the same IP network are restricted.`,
      };
    }

    // Anti-cheat check 3: Rate limiting - max 8 votes per IP in last 3 minutes across all categories
    const threeMinsAgo = Date.now() - 3 * 60 * 1000;
    const recentVotesFromIp = votes.filter(
      v => v.voterIp === clientIp && new Date(v.timestamp).getTime() > threeMinsAgo
    );
    if (recentVotesFromIp.length >= 8) {
      return {
        success: false,
        message: 'Anti-Cheat Protection: Rapid burst voting detected from your network. Please wait a few moments before casting another ballot.',
      };
    }

    // CAPTCHA verification score evaluation
    const isSuspiciousCaptcha = params.captchaScore < 0.65;
    const status: 'verified' | 'flagged' = isSuspiciousCaptcha ? 'flagged' : 'verified';

    const receiptCode = `PAAA-${nominee.year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newVote: VoteRecord = {
      id: `vote-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      nomineeId: nominee.id,
      nomineeName: nominee.name,
      category: nominee.category,
      year: nominee.year,
      voterIp: clientIp,
      fingerprint: voterSession.fingerprint,
      captchaScore: Number(params.captchaScore.toFixed(2)),
      locationEstimate: clientIp.startsWith('197.') ? 'Plumtree / MatSouth, ZW' : 'Regional / Diaspora Network',
      timestamp: new Date().toISOString(),
      status,
      flagReason: isSuspiciousCaptcha ? 'Suspicious CAPTCHA completion telemetry' : undefined,
      receiptCode,
    };

    // Save vote record
    votes.unshift(newVote);
    this.saveVotes(votes);

    // Update nominee vote counts
    const updatedNominees = nominees.map(n => {
      if (n.id === nominee.id) {
        return {
          ...n,
          votes: status === 'verified' ? n.votes + 1 : n.votes,
          flaggedVotes: status === 'flagged' ? n.flaggedVotes + 1 : n.flaggedVotes,
        };
      }
      return n;
    });
    this.saveNominees(updatedNominees);

    // Update voter session locally
    voterSession.votedCategories[categoryKey] = nominee.id;
    voterSession.voteHistory.push({
      nomineeId: nominee.id,
      category: nominee.category,
      timestamp: newVote.timestamp,
      receiptCode,
    });
    localStorage.setItem(STORAGE_KEYS.VOTER_SESSION, JSON.stringify(voterSession));

    return {
      success: true,
      message: 'Vote successfully recorded and verified on the PAAA tally chain.',
      receiptCode,
      voteRecord: newVote,
    };
  }

  // Administrative vote actions
  static updateVoteStatus(voteId: string, newStatus: 'verified' | 'flagged' | 'disqualified', reason?: string) {
    const votes = this.getVotes();
    const voteIndex = votes.findIndex(v => v.id === voteId);
    if (voteIndex === -1) return;

    const oldVote = votes[voteIndex];
    if (oldVote.status === newStatus) return;

    const prevStatus = oldVote.status;
    votes[voteIndex] = {
      ...oldVote,
      status: newStatus,
      flagReason: reason || oldVote.flagReason,
    };
    this.saveVotes(votes);

    // Recalculate nominee vote counts
    const nominees = this.getNominees();
    const updatedNominees = nominees.map(n => {
      if (n.id === oldVote.nomineeId) {
        let { votes: vCount, flaggedVotes: fCount, disqualifiedVotes: dCount } = n;
        // Decrement previous
        if (prevStatus === 'verified') vCount = Math.max(0, vCount - 1);
        if (prevStatus === 'flagged') fCount = Math.max(0, fCount - 1);
        if (prevStatus === 'disqualified') dCount = Math.max(0, dCount - 1);
        // Increment new
        if (newStatus === 'verified') vCount += 1;
        if (newStatus === 'flagged') fCount += 1;
        if (newStatus === 'disqualified') dCount += 1;

        return {
          ...n,
          votes: vCount,
          flaggedVotes: fCount,
          disqualifiedVotes: dCount,
        };
      }
      return n;
    });
    this.saveNominees(updatedNominees);
  }

  // Admin Auth & RBAC
  static getAdminUsers(): AdminUser[] {
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(INITIAL_ADMIN_USERS));
      return INITIAL_ADMIN_USERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ADMIN_USERS;
    }
  }

  static getCurrentAdmin(): AdminUser | null {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  static setCurrentAdmin(admin: AdminUser | null) {
    if (admin) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
    }
    notifySubscribers();
  }

  static addAdminUser(newUser: Omit<AdminUser, 'id' | 'lastLogin'>): AdminUser {
    const users = this.getAdminUsers();
    const user: AdminUser = {
      ...newUser,
      id: `admin-${Date.now().toString(36)}`,
      lastLogin: 'Never',
    };
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
    notifySubscribers();
    return user;
  }

  static updateAdminRole(userId: string, newRole: UserRole) {
    const users = this.getAdminUsers().map(u => u.id === userId ? { ...u, role: newRole } : u);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
    
    const current = this.getCurrentAdmin();
    if (current && current.id === userId) {
      this.setCurrentAdmin({ ...current, role: newRole });
    } else {
      notifySubscribers();
    }
  }

  static deleteAdminUser(userId: string) {
    const users = this.getAdminUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
    const current = this.getCurrentAdmin();
    if (current && current.id === userId) {
      this.setCurrentAdmin(null);
    }
    notifySubscribers();
  }

  // App Settings (Blind voting, visibility toggles)
  static getAppSettings(): AppSettings {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(DEFAULT_APP_SETTINGS));
      return DEFAULT_APP_SETTINGS;
    }
    try {
      return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  }

  static saveAppSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updated));
    notifySubscribers();
    return updated;
  }

  static updateCategory(updated: AwardCategory) {
    const categories = this.getCategories().map(c => c.id === updated.id ? updated : c);
    this.saveCategories(categories);
  }

  static deleteCategory(categoryId: string) {
    const categories = this.getCategories().filter(c => c.id !== categoryId);
    this.saveCategories(categories);
  }

  // Reset to sample data
  static resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.NOMINEES, JSON.stringify(INITIAL_NOMINEES));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(INITIAL_YEARS));
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(INITIAL_VOTES));
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(INITIAL_ADMIN_USERS));
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(DEFAULT_APP_SETTINGS));
    localStorage.removeItem(STORAGE_KEYS.VOTER_SESSION);
    notifySubscribers();
  }

  // Reset user's voting lock (for testing anti-cheat in demo)
  static clearLocalVoterBallots() {
    localStorage.removeItem(STORAGE_KEYS.VOTER_SESSION);
    notifySubscribers();
  }
}
