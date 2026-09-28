import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { VotingPortal } from './components/VotingPortal';
import { LiveResults } from './components/LiveResults';
import { StatsTable } from './components/StatsTable';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { StorageService, subscribeToStorageChanges } from './services/storageService';
import { Nominee, AwardCategory, YearEdition, VoteRecord, AdminUser, VoterSession, AppSettings } from './types';
import { Award, ShieldCheck, Heart, Sparkles, ExternalLink, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vote' | 'results' | 'stats' | 'analytics' | 'admin'>('vote');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Core state from storage
  const [nominees, setNominees] = useState<Nominee[]>(() => StorageService.getNominees());
  const [categories, setCategories] = useState<AwardCategory[]>(() => StorageService.getCategories());
  const [years, setYears] = useState<YearEdition[]>(() => StorageService.getYears());
  const [votes, setVotes] = useState<VoteRecord[]>(() => StorageService.getVotes());
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => StorageService.getCurrentAdmin());
  const [voterSession, setVoterSession] = useState<VoterSession>(() => StorageService.getVoterSession());
  const [appSettings, setAppSettings] = useState<AppSettings>(() => StorageService.getAppSettings());

  const refreshData = useCallback(() => {
    setNominees(StorageService.getNominees());
    setCategories(StorageService.getCategories());
    setYears(StorageService.getYears());
    setVotes(StorageService.getVotes());
    setCurrentAdmin(StorageService.getCurrentAdmin());
    setVoterSession(StorageService.getVoterSession());
    setAppSettings(StorageService.getAppSettings());
  }, []);

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToStorageChanges(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [refreshData]);

  // Aggregate stats
  const yearNominees = nominees.filter((n) => n.year === selectedYear);
  const totalVotesCount = yearNominees.reduce((acc, n) => acc + n.votes, 0);
  const hasVotedAny = Object.keys(voterSession.votedCategories).length > 0;
  const isAdminUser = Boolean(currentAdmin);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentAdmin={currentAdmin}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        appSettings={appSettings}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* Hero banner shown on main voting, results, and stats tabs */}
        {(activeTab === 'vote' || activeTab === 'results' || activeTab === 'stats') && (
          <HeroBanner
            years={years}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            totalVotes={totalVotesCount}
            totalNominees={yearNominees.length}
            categoriesCount={categories.length}
            hasAlreadyVotedAny={hasVotedAny}
            appSettings={appSettings}
            isAdmin={isAdminUser}
          />
        )}

        {/* Tab 1: Cast Vote */}
        {activeTab === 'vote' && (
          <VotingPortal
            nominees={nominees}
            categories={categories}
            years={years}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            voterSession={voterSession}
            onRefresh={refreshData}
            appSettings={appSettings}
            isAdmin={isAdminUser}
          />
        )}

        {/* Tab 2: Live Results */}
        {activeTab === 'results' && (
          <LiveResults
            nominees={nominees}
            categories={categories}
            years={years}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            onRefresh={refreshData}
            appSettings={appSettings}
            isAdmin={isAdminUser}
          />
        )}

        {/* Tab 3: Nominee Stats Table */}
        {activeTab === 'stats' && (
          <StatsTable
            nominees={nominees}
            categories={categories}
            years={years}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            appSettings={appSettings}
            isAdmin={isAdminUser}
          />
        )}

        {/* Tab 4: Real-Time Analytics Panel */}
        {activeTab === 'analytics' && (
          <AnalyticsPanel
            nominees={nominees}
            categories={categories}
            votes={votes}
            selectedYear={selectedYear}
          />
        )}

        {/* Tab 5: Admin Tally Management Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboard
            currentAdmin={currentAdmin}
            nominees={nominees}
            categories={categories}
            years={years}
            votes={votes}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* Gala Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-white text-sm">
                Plumtree Annual Appreciation Awards (PAAA)
              </div>
              <p className="text-[11px] text-slate-400">
                Official Community Recognition Portal • Bulilima, Mangwe & International Diaspora
              </p>
            </div>
          </div>

          {/* Electoral Integrity & Anti-cheat notice */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Anti-Cheat Protected: IP subnets, hardware fingerprinting, and cryptographic audit receipts.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 transition-colors"
              title="System Configuration & Management"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-slate-400 hover:text-amber-400 transition-colors"
            >
              Auditor Portal
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => {
                StorageService.clearLocalVoterBallots();
                alert('Local voting lock reset for demo testing.');
                refreshData();
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Reset My Vote Lock
            </button>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500">© 2026 PAAA Committee</span>
          </div>

        </div>
      </footer>

      {/* Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(admin) => {
            setCurrentAdmin(admin);
            setIsAuthModalOpen(false);
            setActiveTab('admin');
            refreshData();
          }}
        />
      )}

      {/* Settings Modal (Add Users, Categories, Nominees with Pictures, and Ballot Privacy) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentAdmin={currentAdmin}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        categories={categories}
        nominees={nominees}
        years={years}
        appSettings={appSettings}
        onRefresh={refreshData}
      />

      {/* Mobile Bottom Navigation Dock */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentAdmin={currentAdmin}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        appSettings={appSettings}
      />

    </div>
  );
}
