import React, { useState } from 'react';
import {
  Shield,
  Award,
  Users,
  FileText,
  Download,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Lock,
  RotateCcw,
  Sparkles,
  UserCheck,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Filter,
  Upload,
  Image as ImageIcon,
  Settings
} from 'lucide-react';
import { Nominee, AwardCategory, YearEdition, VoteRecord, AdminUser, UserRole } from '../types';
import { StorageService } from '../services/storageService';
import { ExportService } from '../services/exportService';
import { ROLE_PERMISSIONS } from '../data/initialData';

interface AdminDashboardProps {
  currentAdmin: AdminUser | null;
  nominees: Nominee[];
  categories: AwardCategory[];
  years: YearEdition[];
  votes: VoteRecord[];
  onOpenAuth: () => void;
  onOpenSettings?: () => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentAdmin,
  nominees,
  categories,
  years,
  votes,
  onOpenAuth,
  onOpenSettings,
  onRefresh,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'tally' | 'nominees' | 'categories' | 'rbac' | 'exports'>('tally');
  
  // Tally filters
  const [voteSearch, setVoteSearch] = useState('');
  const [voteStatusFilter, setVoteStatusFilter] = useState<'all' | 'verified' | 'flagged' | 'disqualified'>('all');

  // Nominee & Category filtering by year & award type
  const [selectedManageYear, setSelectedManageYear] = useState<number>(2026);
  const [selectedManageCategory, setSelectedManageCategory] = useState<string>('all');

  // Modals / Form states
  const [isAddNomineeOpen, setIsAddNomineeOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);

  // New Nominee Form State
  const [newNomName, setNewNomName] = useState('');
  const [newNomOrg, setNewNomOrg] = useState('');
  const [newNomCat, setNewNomCat] = useState(categories[0]?.id || 'community-hero');
  const [newNomYear, setNewNomYear] = useState(2026);
  const [newNomBio, setNewNomBio] = useState('');
  const [newNomImpact, setNewNomImpact] = useState('');
  const [newNomImg, setNewNomImg] = useState('');
  const [newNomLoc, setNewNomLoc] = useState('Plumtree Town');

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Year Form State
  const [newYearNum, setNewYearNum] = useState<number>(2027);
  const [newYearLabel, setNewYearLabel] = useState<string>('2027 Upcoming Edition');

  // Admin users for RBAC
  const adminUsers = StorageService.getAdminUsers();

  if (!currentAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-amber-500/30 rounded-2xl text-center shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white mb-2">
          Administrator Access Required
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          The PAAA Electoral & Tally Management portal is restricted to authorized committee officers, tally auditors, and moderators with role-based credentials.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>Authenticate Session</span>
        </button>
      </div>
    );
  }

  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  // Disqualify / Reinstate vote
  const handleVoteAction = (voteId: string, targetStatus: 'verified' | 'flagged' | 'disqualified', reason?: string) => {
    if (!permissions.canDisqualifyVotes) {
      alert(`Access Restricted: Your assigned role (${currentAdmin.role}) does not have permission to disqualify or modify ballots. Only Super Admins and Electoral Auditors may perform this action.`);
      return;
    }
    StorageService.updateVoteStatus(voteId, targetStatus, reason);
    onRefresh();
  };

  // Add Nominee submission
  const handleCreateNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canManageNominees) {
      alert('Access Restricted: You lack permission to add nominees.');
      return;
    }

    const defaultImg = newNomImg.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

    StorageService.addNominee({
      name: newNomName,
      organization: newNomOrg || undefined,
      category: newNomCat,
      year: Number(newNomYear),
      bio: newNomBio,
      impact: newNomImpact,
      imageUrl: defaultImg,
      location: newNomLoc,
      isVotingActive: true,
    });

    setIsAddNomineeOpen(false);
    // Reset form
    setNewNomName('');
    setNewNomOrg('');
    setNewNomBio('');
    setNewNomImpact('');
    setNewNomImg('');
    onRefresh();
  };

  // Edit Nominee update
  const handleSaveEditNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNominee) return;
    if (!permissions.canManageNominees) {
      alert('Access Restricted: You lack permission to edit nominees.');
      return;
    }

    StorageService.updateNominee(editingNominee);
    setEditingNominee(null);
    onRefresh();
  };

  // Delete Nominee
  const handleDeleteNominee = (id: string, name: string) => {
    if (!permissions.canManageNominees) {
      alert('Access Restricted: You lack permission to delete nominees.');
      return;
    }
    if (confirm(`Are you sure you want to remove nominee "${name}" from the ballot?`)) {
      StorageService.deleteNominee(id);
      onRefresh();
    }
  };

  // Add Category submission
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canManageCategories) {
      alert('Access Restricted: You lack permission to create award categories.');
      return;
    }
    StorageService.addCategory({
      name: newCatName,
      description: newCatDesc,
      iconName: 'Award',
    });
    setIsAddCategoryOpen(false);
    setNewCatName('');
    setNewCatDesc('');
    onRefresh();
  };

  // Add Year submission
  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canManageYears) {
      alert('Access Restricted: You lack permission to create new edition years.');
      return;
    }
    StorageService.addYear(newYearNum, newYearLabel);
    setIsAddYearOpen(false);
    onRefresh();
  };

  // Filtered votes
  const filteredVotes = votes.filter((v) => {
    if (!v) return false;
    const matchesStatus = voteStatusFilter === 'all' || v.status === voteStatusFilter;
    const matchesSearch =
      (v.nomineeName || '').toLowerCase().includes(voteSearch.toLowerCase()) ||
      (v.voterIp || '').includes(voteSearch) ||
      (v.receiptCode || '').toLowerCase().includes(voteSearch.toLowerCase()) ||
      (v.category || '').toLowerCase().includes(voteSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered nominees for manager
  const managedNominees = nominees.filter((n) => {
    const matchesYear = n.year === selectedManageYear;
    const matchesCategory = selectedManageCategory === 'all' || n.category === selectedManageCategory;
    return matchesYear && matchesCategory;
  });

  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner: Logged-in admin and RBAC Role info */}
      <div className="bg-slate-900 rounded-2xl border border-amber-500/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentAdmin.avatar}
            alt={currentAdmin.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-white">
                {currentAdmin.name}
              </h2>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {currentAdmin.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentAdmin.department} • <span className="font-mono text-slate-500">{currentAdmin.email}</span>
            </p>
          </div>
        </div>

        {/* Quick Role Switcher and Settings Button */}
        <div className="flex flex-wrap items-center gap-3">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Configure Blind Voting, Users, and Categories"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Settings & Privacy</span>
            </button>
          )}

          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Simulate Role:</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {currentAdmin.role === 'super_admin' ? 'Super Administrator' : currentAdmin.role === 'auditor' ? 'Tally Auditor' : 'Category Moderator'}
              </span>
            </div>
            <select
              value={currentAdmin.role}
              onChange={(e) => {
                StorageService.updateAdminRole(currentAdmin.id, e.target.value as UserRole);
                onRefresh();
              }}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="super_admin">Super Admin (All Privileges)</option>
              <option value="auditor">Tally Auditor (Integrity & Disqualify)</option>
              <option value="moderator">Moderator (Nominee & Category Edits)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('tally')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'tally'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Tally Audit & Anti-Cheat Log</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/20 font-mono">
            {votes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('nominees')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'nominees'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Nominees & Categories Manager</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('rbac')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'rbac'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>RBAC Permissions & Officers</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('exports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'exports'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Official Reports & Exports</span>
        </button>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 sm:ml-auto"
            title="Open System Settings & Nominee Photo Manager"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Settings</span>
          </button>
        )}
      </div>

      {/* TAB 1: Tally Audit & Anti-Cheat Log */}
      {activeAdminTab === 'tally' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Live Ballots & Anti-Cheat Inspection
              </h3>
              <p className="text-xs text-slate-400">
                Inspect IP signatures, CAPTCHA telemetry, and disqualify fraudulent or duplicate submissions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by IP, nominee, receipt..."
                  value={voteSearch}
                  onChange={(e) => setVoteSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status filter */}
              <select
                value={voteStatusFilter}
                onChange={(e) => setVoteStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Ballot States ({votes.length})</option>
                <option value="verified">Verified Only</option>
                <option value="flagged">Flagged / Suspicious</option>
                <option value="disqualified">Disqualified</option>
              </select>
            </div>
          </div>

          {/* Votes Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Receipt & ID</th>
                    <th className="py-3 px-4">Nominee & Category</th>
                    <th className="py-3 px-4">Voter IP & Node</th>
                    <th className="py-3 px-4 text-center">CAPTCHA Score</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-center">Integrity Status</th>
                    <th className="py-3 px-4 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredVotes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No vote records match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredVotes.map((v) => {
                      const isDisqualified = v.status === 'disqualified';
                      const isFlagged = v.status === 'flagged';

                      return (
                        <tr key={v.id} className="hover:bg-slate-850/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-amber-400 block">
                              {v.receiptCode}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {v.id}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">
                              {v.nomineeName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {catMap.get(v.category) || v.category} ({v.year})
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-slate-200 block">
                              {v.voterIp}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {v.locationEstimate} • {v.fingerprint.slice(0, 8)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                                v.captchaScore >= 0.8
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {(v.captchaScore * 100).toFixed(0)}%
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {new Date(v.timestamp).toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {v.status === 'verified' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            )}
                            {v.status === 'flagged' && (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                title={v.flagReason}
                              >
                                <AlertTriangle className="w-3 h-3" /> Flagged
                              </span>
                            )}
                            {v.status === 'disqualified' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <XCircle className="w-3 h-3" /> Disqualified
                              </span>
                            )}
                            {v.flagReason && (
                              <div className="text-[10px] text-slate-500 mt-0.5 max-w-xs truncate">
                                {v.flagReason}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {permissions.canDisqualifyVotes ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {v.status !== 'verified' && (
                                  <button
                                    onClick={() => handleVoteAction(v.id, 'verified')}
                                    className="p-1 px-2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors"
                                    title="Mark Verified"
                                  >
                                    Verify
                                  </button>
                                )}
                                {v.status !== 'disqualified' && (
                                  <button
                                    onClick={() => handleVoteAction(v.id, 'disqualified', 'Disqualified by Auditor')}
                                    className="p-1 px-2 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-semibold transition-colors"
                                    title="Disqualify ballot"
                                  >
                                    Disqualify
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Audit only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Nominees & Categories Manager */}
      {activeAdminTab === 'nominees' && (
        <div className="space-y-6">
          
          {/* Header & Filter by Year and Category */}
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Nominee & Category Administration
                </h3>
                <p className="text-xs text-slate-400">
                  Manage nominees, create award categories, and configure edition years.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {permissions.canManageNominees && (
                  <button
                    onClick={() => setIsAddNomineeOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Nominee</span>
                  </button>
                )}

                {permissions.canManageCategories && (
                  <button
                    onClick={() => setIsAddCategoryOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Add Category</span>
                  </button>
                )}

                {permissions.canManageYears && (
                  <button
                    onClick={() => setIsAddYearOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Add Year Edition</span>
                  </button>
                )}
              </div>
            </div>

            {/* Editable tabs: Year & Award Category selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block mb-1">
                  Filter Nominees by Year
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {years.map((y) => (
                    <button
                      key={y.year}
                      onClick={() => setSelectedManageYear(y.year)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedManageYear === y.year
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {y.year} Edition
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block mb-1">
                  Filter Nominees by Category
                </label>
                <select
                  value={selectedManageCategory}
                  onChange={(e) => setSelectedManageCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Award Types</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Managed Nominees List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managedNominees.map((nom) => (
              <div
                key={nom.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={nom.imageUrl}
                    alt={nom.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block truncate">
                      {catMap.get(nom.category) || nom.category}
                    </span>
                    <h4 className="font-bold text-white text-sm truncate">{nom.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{nom.organization || nom.location}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {nom.bio}
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="font-mono">
                    <span className="text-slate-400">Votes: </span>
                    <strong className="text-white">{nom.votes}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {permissions.canManageNominees && (
                      <>
                        <button
                          onClick={() => setEditingNominee(nom)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                          title="Edit Bio / Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNominee(nom.id, nom.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete Nominee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RBAC Permissions & Officers */}
      {activeAdminTab === 'rbac' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Role-Based Access Control (RBAC) & Team Privileges
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              PAAA enforces granular permissions to guarantee tally integrity and audit independence.
            </p>
          </div>

          {/* Officers Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Officer Profile</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Key Permissions Granted</th>
                  <th className="py-3 px-4 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {adminUsers.map((u) => {
                  const rolePerm = ROLE_PERMISSIONS[u.role];
                  return (
                    <tr key={u.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{u.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {u.department}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-slate-300 space-y-0.5">
                          {rolePerm.canDisqualifyVotes && (
                            <div className="text-emerald-400 font-medium">✓ Disqualify / Audit Ballots</div>
                          )}
                          {rolePerm.canManageNominees && (
                            <div className="text-slate-300">✓ Manage Nominees & Biographies</div>
                          )}
                          {rolePerm.canManageCategories && (
                            <div className="text-slate-300">✓ Edit Categories & Years</div>
                          )}
                          {rolePerm.canManageUsers && (
                            <div className="text-amber-400 font-semibold">★ Super Admin Permissions</div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {permissions.canManageUsers ? (
                          <select
                            value={u.role}
                            onChange={(e) => {
                              StorageService.updateAdminRole(u.id, e.target.value as UserRole);
                              onRefresh();
                            }}
                            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="auditor">Auditor</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-500">Read-Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Granular Permission Matrix */}
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-serif text-base font-bold text-white">
              Granular Role Permission Matrix
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">System Privilege</th>
                    <th className="py-2 text-center">Super Admin</th>
                    <th className="py-2 text-center">Tally Auditor</th>
                    <th className="py-2 text-center">Category Moderator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  <tr>
                    <td className="py-2.5 font-medium">Disqualify / Validate Ballots</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                    <td className="text-center text-rose-400">NO</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Create & Edit Nominee Profiles</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                    <td className="text-center text-rose-400">NO</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Add New Award Categories</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                    <td className="text-center text-rose-400">NO</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Export Certified CSV & PDF</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">User Role & RBAC Assignment</td>
                    <td className="text-center text-emerald-400 font-bold">YES</td>
                    <td className="text-center text-rose-400">NO</td>
                    <td className="text-center text-rose-400">NO</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Official Reports & Exports */}
      {activeAdminTab === 'exports' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-400" />
              Administrative Review & Certified Document Generation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Download auditable data snapshots in CSV format or generate print-ready official certified PDF documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export 1: Certified PDF */}
            <div className="p-6 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-base font-bold text-white">
                  Official Certified PDF Tally Report
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Generates an executive-ready A4 document with gold PAAA letterhead, cryptographic seal, category ranking tables, and auditor certification signature lines.
                </p>
              </div>

              <button
                onClick={() => {
                  const totalVotes = nominees.filter((n) => n.year === selectedManageYear).reduce((acc, n) => acc + n.votes, 0);
                  ExportService.exportCertifiedPdf(
                    nominees,
                    categories,
                    selectedManageYear,
                    totalVotes,
                    totalVotes,
                    `${currentAdmin.name} (${currentAdmin.role.replace('_', ' ').toUpperCase()})`
                  );
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official PDF</span>
              </button>
            </div>

            {/* Export 2: Nominee CSV */}
            <div className="p-6 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <Download className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-base font-bold text-white">
                  Nominee Tallies & Percentages (CSV)
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Export full nominee statistics table including rank in category, verified ballot count, category percentage share, and nomination details.
                </p>
              </div>

              <button
                onClick={() => ExportService.exportNomineesToCsv(nominees, categories, selectedManageYear)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Nominee CSV</span>
              </button>
            </div>

            {/* Export 3: Audit Trail CSV */}
            <div className="p-6 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-base font-bold text-white">
                  Complete Electoral Audit Trail (CSV)
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Row-by-row log of every individual ballot cast, timestamped with voter IP address, browser fingerprint hash, CAPTCHA score, and verification receipt.
                </p>
              </div>

              <button
                onClick={() => ExportService.exportAuditTrailToCsv(votes)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Full Audit Trail</span>
              </button>
            </div>

            {/* Demo Testing Tools */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-base font-bold text-white">
                  Demo & Testing Utilities
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Reset your browser's local voting lock to test casting ballots in multiple categories, or restore the default seed dataset.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    StorageService.clearLocalVoterBallots();
                    alert('Your local browser ballot lock has been cleared. You can now cast test votes again!');
                    onRefresh();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clear My Device Voting Lock</span>
                </button>

                {permissions.canResetData && (
                  <button
                    onClick={() => {
                      if (confirm('Reset all tallies, nominees, and audit logs to factory sample data?')) {
                        StorageService.resetToDefault();
                        onRefresh();
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors"
                  >
                    Reset All Data to Factory Seed
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Add Nominee */}
      {isAddNomineeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Add New PAAA Nominee
              </h3>
              <button onClick={() => setIsAddNomineeOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateNominee} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Nandi Sibanda"
                  value={newNomName}
                  onChange={(e) => setNewNomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Award Category</label>
                  <select
                    value={newNomCat}
                    onChange={(e) => setNewNomCat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Edition Year</label>
                  <select
                    value={newNomYear}
                    onChange={(e) => setNewNomYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    {years.map((y) => (
                      <option key={y.year} value={y.year}>{y.year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Organization / Initiative</label>
                <input
                  type="text"
                  placeholder="e.g. Plumtree Clean Energy Initiative"
                  value={newNomOrg}
                  onChange={(e) => setNewNomOrg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Geographic Location</label>
                <input
                  type="text"
                  placeholder="e.g. Dingumuzi, Plumtree"
                  value={newNomLoc}
                  onChange={(e) => setNewNomLoc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Biography / Background</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the nominee's leadership and service history..."
                  value={newNomBio}
                  onChange={(e) => setNewNomBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Key Impact Achievement</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Concrete measurable contribution to Plumtree or MatSouth..."
                  value={newNomImpact}
                  onChange={(e) => setNewNomImpact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              {/* Nominee Photo with File Upload or URL */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Nominee Photograph (Image URL or Upload from Device)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border border-slate-700 bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                    {newNomImg ? (
                      <img src={newNomImg} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newNomImg}
                    onChange={(e) => setNewNomImg(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1 text-[11px] shrink-0 font-medium">
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setNewNomImg(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddNomineeOpen(false)}
                  className="w-1/3 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider"
                >
                  Publish Nominee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Nominee */}
      {editingNominee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                Edit Nominee: {editingNominee.name}
              </h3>
              <button onClick={() => setEditingNominee(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditNominee} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingNominee.name}
                  onChange={(e) => setEditingNominee({ ...editingNominee, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Organization / Affiliation</label>
                <input
                  type="text"
                  value={editingNominee.organization || ''}
                  onChange={(e) => setEditingNominee({ ...editingNominee, organization: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Biography</label>
                <textarea
                  rows={3}
                  value={editingNominee.bio}
                  onChange={(e) => setEditingNominee({ ...editingNominee, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Impact Achievement</label>
                <textarea
                  rows={2}
                  value={editingNominee.impact}
                  onChange={(e) => setEditingNominee({ ...editingNominee, impact: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-slate-300 font-semibold flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNominee.isVotingActive}
                    onChange={(e) => setEditingNominee({ ...editingNominee, isVotingActive: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Voting Active for this Nominee</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingNominee(null)}
                  className="w-1/3 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Category */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                Add New Award Category
              </h3>
              <button onClick={() => setIsAddCategoryOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lifetime Civic Dedication Award"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category Description & Criteria</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe who qualifies and what this award honors..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="w-1/3 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Year Edition */}
      {isAddYearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Add New Edition Year
              </h3>
              <button onClick={() => setIsAddYearOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateYear} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Year</label>
                <input
                  type="number"
                  required
                  min={2020}
                  max={2035}
                  value={newYearNum}
                  onChange={(e) => setNewYearNum(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Edition Title / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2027 Gala Edition"
                  value={newYearLabel}
                  onChange={(e) => setNewYearLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddYearOpen(false)}
                  className="w-1/3 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase tracking-wider"
                >
                  Create Edition Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
