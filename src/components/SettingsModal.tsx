import React, { useState } from 'react';
import {
  Settings,
  Users,
  Award,
  Layers,
  EyeOff,
  Eye,
  Plus,
  Trash2,
  Edit3,
  Shield,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { AdminUser, AwardCategory, Nominee, UserRole, AppSettings } from '../types';
import { StorageService } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin: AdminUser | null;
  onOpenAuth: () => void;
  categories: AwardCategory[];
  nominees: Nominee[];
  years: { year: number }[];
  appSettings: AppSettings;
  onRefresh: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentAdmin,
  onOpenAuth,
  categories,
  nominees,
  years,
  appSettings,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'privacy' | 'users' | 'categories' | 'nominees'>('privacy');

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('moderator');
  const [newUserDept, setNewUserDept] = useState('Nominee Review Committee');
  const [newUserAvatar, setNewUserAvatar] = useState('');

  // New category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New nominee form state
  const [newNomName, setNewNomName] = useState('');
  const [newNomOrg, setNewNomOrg] = useState('');
  const [newNomCat, setNewNomCat] = useState(categories[0]?.id || 'community-hero');
  const [newNomYear, setNewNomYear] = useState(years[0]?.year || 2026);
  const [newNomLoc, setNewNomLoc] = useState('Plumtree Town');
  const [newNomBio, setNewNomBio] = useState('');
  const [newNomImpact, setNewNomImpact] = useState('');
  const [newNomImg, setNewNomImg] = useState('');

  // Success toast or feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const adminUsers = StorageService.getAdminUsers();

  // Handle Photo upload from local file
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size exceeds 2MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle privacy settings
  const handleTogglePrivacySetting = (key: keyof AppSettings) => {
    if (!currentAdmin) {
      onOpenAuth();
      return;
    }
    const updated = StorageService.saveAppSettings({
      [key]: !appSettings[key],
    });
    showFeedback(`Settings updated: "${key}" is now ${updated[key] ? 'ENABLED' : 'DISABLED'}`);
    onRefresh();
  };

  // Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) {
      onOpenAuth();
      return;
    }
    if (currentAdmin.role !== 'super_admin') {
      alert('Only Super Administrators can create administrative user accounts.');
      return;
    }

    const avatar = newUserAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    StorageService.addAdminUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDept,
      avatar,
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserAvatar('');
    showFeedback('New administrative user added successfully!');
    onRefresh();
  };

  // Delete User
  const handleDeleteUser = (userId: string, name: string) => {
    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      alert('Permission denied: Only Super Administrators can delete user accounts.');
      return;
    }
    if (confirm(`Remove administrator "${name}"?`)) {
      StorageService.deleteAdminUser(userId);
      showFeedback(`User ${name} removed.`);
      onRefresh();
    }
  };

  // Create Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) {
      onOpenAuth();
      return;
    }
    StorageService.addCategory({
      name: newCatName,
      description: newCatDesc,
      iconName: 'Award',
    });
    setNewCatName('');
    setNewCatDesc('');
    showFeedback('New award category created!');
    onRefresh();
  };

  // Delete Category
  const handleDeleteCategory = (catId: string, name: string) => {
    if (!currentAdmin) {
      onOpenAuth();
      return;
    }
    if (confirm(`Delete award category "${name}"? Existing nominees in this category will remain.`)) {
      StorageService.deleteCategory(catId);
      showFeedback(`Category "${name}" deleted.`);
      onRefresh();
    }
  };

  // Create Nominee
  const handleCreateNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) {
      onOpenAuth();
      return;
    }

    const defaultImg = newNomImg.trim() || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80';

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

    setNewNomName('');
    setNewNomOrg('');
    setNewNomBio('');
    setNewNomImpact('');
    setNewNomImg('');
    showFeedback(`Nominee added successfully with picture!`);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Top Gold Accent Header & Mobile Handle */}
        <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 shrink-0" />
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0" />

        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-2">
                PAAA System & Governance Settings
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                Configure ballot privacy, add users, categories, nominees with photos, and voting rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Feedback alert banner */}
        {feedback && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-5 py-2 text-xs text-emerald-300 flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 pt-2 border-b border-slate-800 bg-slate-950/50 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap ${
              activeSubTab === 'privacy'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span>Ballot Privacy</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nominees')}
            className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap ${
              activeSubTab === 'nominees'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Nominees & Photos</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap ${
              activeSubTab === 'categories'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap ${
              activeSubTab === 'users'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Roles</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: VOTER PRIVACY & BLIND VOTING */}
          {activeSubTab === 'privacy' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 mt-0.5">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Blind Voting & Tally Confidentiality Control
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      To prevent bandwagon bias and protect voting integrity, PAAA allows administrators to prevent voters from viewing other casted votes and rankings before polls close.
                    </p>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {/* Rule 1: Hide public vote counts */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-amber-400" />
                      Hide Vote Tallies from Voters (Secret Ballot)
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      When enabled, public voters will only see &quot;Secret Ballot • Confidential&quot; instead of exact numerical ballot counts on nominee cards.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePrivacySetting('hidePublicVoteCounts')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      appSettings.hidePublicVoteCounts ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 transition duration-200 ease-in-out ${
                        appSettings.hidePublicVoteCounts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Rule 2: Restrict Live Results Tab to Admins Only */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Allow Public Live Results Leaderboard
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      If turned OFF, the &quot;Live Results&quot; tab will only be accessible to authenticated election administrators and tally auditors.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePrivacySetting('allowPublicResultsTab')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      appSettings.allowPublicResultsTab ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 transition duration-200 ease-in-out ${
                        appSettings.allowPublicResultsTab ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Rule 3: Restrict Nominee Stats Table to Admins */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      Allow Public Nominee Statistics Table
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      If turned OFF, the full nominee statistics and category share data table will be locked to authorized audit officers only.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePrivacySetting('allowPublicStatsTab')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      appSettings.allowPublicStatsTab ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 transition duration-200 ease-in-out ${
                        appSettings.allowPublicStatsTab ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Rule 4: Global Voting Gate */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-yellow-400" />
                      Global Voting Portal Status
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      Immediately pause or open public submissions across all award categories simultaneously.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePrivacySetting('votingIsOpen')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      appSettings.votingIsOpen ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 transition duration-200 ease-in-out ${
                        appSettings.votingIsOpen ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {!currentAdmin && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
                  <span>Sign in as an administrator to toggle or save system configuration changes.</span>
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg uppercase tracking-wider text-[11px]"
                  >
                    Admin Sign-In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD NOMINEES & PICTURES */}
          {activeSubTab === 'nominees' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Nominee Registry & Photo Management
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Register a new community contender with bio, impact summary, and photograph.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-amber-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  {nominees.length} Active Nominees
                </span>
              </div>

              <form onSubmit={handleCreateNominee} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3.5">
                <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  + Add New Nominee
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Nominee Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Nandi Sibanda"
                      value={newNomName}
                      onChange={(e) => setNewNomName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Award Category *</label>
                    <select
                      value={newNomCat}
                      onChange={(e) => setNewNomCat(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Affiliation / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Plumtree Clean Energy Initiative"
                      value={newNomOrg}
                      onChange={(e) => setNewNomOrg(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Location / District</label>
                    <input
                      type="text"
                      placeholder="e.g. Dingumuzi, Plumtree Town"
                      value={newNomLoc}
                      onChange={(e) => setNewNomLoc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Nominee Picture Section (URL or File Upload) */}
                <div className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-xl space-y-2">
                  <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    Nominee Picture (Upload File or Enter URL)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Picture Preview */}
                    <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center">
                      {newNomImg ? (
                        <img src={newNomImg} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="url"
                        placeholder="Image URL: https://images.unsplash.com/..."
                        value={newNomImg}
                        onChange={(e) => setNewNomImg(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Or upload photo:</span>
                        <label className="cursor-pointer px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1">
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>Choose Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, setNewNomImg)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nominee Biography *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Key leadership achievements, background and dedication to the community..."
                    value={newNomBio}
                    onChange={(e) => setNewNomBio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Key Impact Statement *</label>
                  <textarea
                    required
                    rows={1}
                    placeholder="Specific outcome or community milestone achieved..."
                    value={newNomImpact}
                    onChange={(e) => setNewNomImpact(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
                >
                  Publish Nominee to Ballots
                </button>
              </form>

              {/* Quick list of recent nominees with pictures */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 text-xs">Recent Registered Nominees:</div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950">
                  {nominees.slice(0, 8).map((nom) => (
                    <div key={nom.id} className="p-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={nom.imageUrl}
                          alt={nom.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate text-xs">{nom.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{nom.organization || nom.location}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800 shrink-0">
                        {nom.year}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADD CATEGORIES */}
          {activeSubTab === 'categories' && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Award Categories Management
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Define new honor categories, criteria, and voting classifications.
                </p>
              </div>

              {/* Add category form */}
              <form onSubmit={handleCreateCategory} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  + Create New Category
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Award Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lifetime Community Vanguard Award"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category Criteria & Scope *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Explain who qualifies, eligibility guidelines, and social significance..."
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Save & Publish Category
                </button>
              </form>

              {/* Existing Categories List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 text-xs">Active Categories ({categories.length}):</div>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs">{cat.name}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors shrink-0"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USERS & RBAC ACCESS */}
          {activeSubTab === 'users' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    Authorized Electoral Administrators & Officers
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Assign role-based access for tally auditors, category moderators, and super admins.
                  </p>
                </div>
              </div>

              {/* Add User Form */}
              <form onSubmit={handleCreateUser} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  + Add New Admin Officer
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sindiwe Nleya"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="s.nleya@paa-awards.org"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Assigned Role Privilege *</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="super_admin">Super Administrator (Full System)</option>
                      <option value="auditor">Tally Auditor (Integrity & Disqualify)</option>
                      <option value="moderator">Category Curator (Nominees & Biographies)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Department / Branch</label>
                    <input
                      type="text"
                      placeholder="e.g. Electoral Integrity Oversight"
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Avatar Photo upload or URL */}
                <div className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-xl space-y-2">
                  <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    Officer Profile Picture
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center">
                      {newUserAvatar ? (
                        <img src={newUserAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="Avatar image URL (optional)"
                      value={newUserAvatar}
                      onChange={(e) => setNewUserAvatar(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <label className="cursor-pointer px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 text-[11px] shrink-0">
                      <Upload className="w-3 h-3 text-amber-400" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, setNewUserAvatar)}
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Create User & Issue Credentials
                </button>
              </form>

              {/* Officer Accounts List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 text-xs">Registered Administrative Users ({adminUsers.length}):</div>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950">
                  {adminUsers.map((u) => (
                    <div key={u.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{u.name}</span>
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {u.role.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email} • {u.department}</div>
                        </div>
                      </div>

                      {adminUsers.length > 1 && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>PAAA Electoral Board RBAC Security Enforced</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};
