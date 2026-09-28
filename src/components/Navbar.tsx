import React, { useState } from 'react';
import { Award, Shield, BarChart3, Table2, Vote, Flame, Menu, X, LogOut, CheckCircle2, Settings } from 'lucide-react';
import { AdminUser, AppSettings } from '../types';
import { StorageService, getSimulatedClientIp } from '../services/storageService';

interface NavbarProps {
  activeTab: 'vote' | 'results' | 'stats' | 'analytics' | 'admin';
  setActiveTab: (tab: 'vote' | 'results' | 'stats' | 'analytics' | 'admin') => void;
  currentAdmin: AdminUser | null;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  appSettings: AppSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentAdmin,
  onOpenAuth,
  onOpenSettings,
  appSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clientIp = getSimulatedClientIp();

  const handleLogout = () => {
    StorageService.setCurrentAdmin(null);
    if (activeTab === 'admin') {
      setActiveTab('vote');
    }
  };

  interface NavItem {
    id: 'vote' | 'results' | 'stats' | 'analytics' | 'admin';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  // Filter tabs if public view is restricted by Settings
  const allNavItems: NavItem[] = [
    { id: 'vote', label: 'Cast Vote', icon: Vote },
    { id: 'results', label: 'Live Results', icon: Flame, badge: 'LIVE' },
    { id: 'stats', label: 'Nominee Stats', icon: Table2 },
    { id: 'analytics', label: 'Real-Time Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Tally Admin', icon: Shield },
  ];

  const navItems = allNavItems.filter((item) => {
    if (currentAdmin) return true; // Admins always see all tabs
    if (item.id === 'results' && !appSettings.allowPublicResultsTab) return false;
    if (item.id === 'stats' && !appSettings.allowPublicStatsTab) return false;
    if (item.id === 'analytics' && !appSettings.allowPublicAnalyticsTab) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand */}
          <div
            onClick={() => setActiveTab('vote')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[9px] sm:rounded-[10px] flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif font-black text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
                  PAAA
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  2026 GALA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-tight truncate hidden xs:block">
                Plumtree Annual Appreciation Awards
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'admin' && !currentAdmin) {
                      onOpenAuth();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>

                  {item.badge && !isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}

                  {item.id === 'admin' && currentAdmin && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-950/40 text-current border border-current/20 font-mono">
                      {currentAdmin.role.replace('_', ' ')}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Anti-cheat indicator & Admin user info */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Anti-cheat status ticker */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium" title={`Your IP ${clientIp} monitored for single-ballot integrity`}>
              <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[11px]">Anti-Cheat Active</span>
            </div>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="System & Governance Settings"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Settings</span>
            </button>

            {currentAdmin ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <img
                  src={currentAdmin.avatar}
                  alt={currentAdmin.name}
                  className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[120px]">
                    {currentAdmin.name}
                  </div>
                  <div className="text-[10px] font-mono text-amber-400 uppercase">
                    {currentAdmin.role.replace('_', ' ')}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-200 text-xs font-medium transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>

          {/* Mobile direct actions */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300"
              title="System Settings"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (item.id === 'admin' && !currentAdmin) {
                    onOpenAuth();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSettings();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          >
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Settings & Governance</span>
          </button>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>IP Monitored: {clientIp}</span>
            </div>

            {currentAdmin ? (
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="text-xs text-amber-400 font-semibold"
              >
                Admin Sign-In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
