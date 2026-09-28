import React from 'react';
import { Vote, Flame, Table2, Settings, Shield, User } from 'lucide-react';
import { AdminUser, AppSettings } from '../types';

interface MobileBottomNavProps {
  activeTab: 'vote' | 'results' | 'stats' | 'analytics' | 'admin';
  setActiveTab: (tab: 'vote' | 'results' | 'stats' | 'analytics' | 'admin') => void;
  currentAdmin: AdminUser | null;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  appSettings: AppSettings;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentAdmin,
  onOpenAuth,
  onOpenSettings,
  appSettings,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl shadow-black/80 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        
        {/* Tab 1: Vote */}
        <button
          onClick={() => setActiveTab('vote')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 transition-all relative ${
            activeTab === 'vote' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'vote' && (
            <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-b-full shadow-sm shadow-amber-400/50" />
          )}
          <Vote className={`w-5 h-5 mb-0.5 ${activeTab === 'vote' ? 'text-amber-400 scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Vote</span>
        </button>

        {/* Tab 2: Results */}
        <button
          onClick={() => {
            if (!appSettings.allowPublicResultsTab && !currentAdmin) {
              alert('Live Results are currently restricted by governance rules.');
              return;
            }
            setActiveTab('results');
          }}
          className={`flex flex-col items-center justify-center h-full w-full py-1 transition-all relative ${
            activeTab === 'results' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'results' && (
            <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-b-full shadow-sm shadow-amber-400/50" />
          )}
          <div className="relative">
            <Flame className={`w-5 h-5 mb-0.5 ${activeTab === 'results' ? 'text-amber-400 scale-110' : ''}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-tight">Results</span>
        </button>

        {/* Tab 3: Stats Table */}
        <button
          onClick={() => {
            if (!appSettings.allowPublicStatsTab && !currentAdmin) {
              alert('Nominee Stats Table is currently restricted by governance rules.');
              return;
            }
            setActiveTab('stats');
          }}
          className={`flex flex-col items-center justify-center h-full w-full py-1 transition-all relative ${
            activeTab === 'stats' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'stats' && (
            <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-b-full shadow-sm shadow-amber-400/50" />
          )}
          <Table2 className={`w-5 h-5 mb-0.5 ${activeTab === 'stats' ? 'text-amber-400 scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Stats</span>
        </button>

        {/* Tab 4: Settings */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center h-full w-full py-1 text-slate-400 hover:text-amber-300 transition-all active:scale-95"
        >
          <Settings className="w-5 h-5 mb-0.5 text-amber-400/90" />
          <span className="text-[10px] tracking-tight text-amber-300/90">Settings</span>
        </button>

        {/* Tab 5: Admin */}
        <button
          onClick={() => {
            if (!currentAdmin) {
              onOpenAuth();
            } else {
              setActiveTab('admin');
            }
          }}
          className={`flex flex-col items-center justify-center h-full w-full py-1 transition-all relative ${
            activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'admin' && (
            <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-b-full shadow-sm shadow-amber-400/50" />
          )}
          {currentAdmin ? (
            <div className="relative">
              <img
                src={currentAdmin.avatar}
                alt={currentAdmin.name}
                className="w-5 h-5 rounded-full object-cover border border-amber-400 mb-0.5"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </div>
          ) : (
            <Shield className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px] tracking-tight truncate max-w-[48px]">
            {currentAdmin ? 'Admin' : 'Login'}
          </span>
        </button>

      </div>
    </nav>
  );
};
