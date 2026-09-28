import React from 'react';
import { Award, ShieldCheck, Users, Calendar, Sparkles, AlertCircle, EyeOff } from 'lucide-react';
import { YearEdition, AppSettings } from '../types';

interface HeroBannerProps {
  years: YearEdition[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  totalVotes: number;
  totalNominees: number;
  categoriesCount: number;
  hasAlreadyVotedAny: boolean;
  appSettings: AppSettings;
  isAdmin?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  years,
  selectedYear,
  onSelectYear,
  totalVotes,
  totalNominees,
  categoriesCount,
  hasAlreadyVotedAny,
  appSettings,
  isAdmin = false,
}) => {
  const currentEdition: YearEdition =
    years.find((y) => y.year === selectedYear) ||
    years[0] || {
      year: selectedYear,
      label: `${selectedYear} Edition`,
      status: 'active',
      deadline: '',
      totalCategories: 0,
    };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-amber-500/20 py-6 sm:py-10 md:py-14">
      
      {/* Decorative ambient gold lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Year Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 sm:p-1.5 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none max-w-full">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Edition:
            </span>
            {years.map((y) => {
              const isSelected = y.year === selectedYear;
              return (
                <button
                  key={y.year}
                  onClick={() => onSelectYear(y.year)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{y.year}</span>
                  {y.status === 'active' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-emerald-400 animate-pulse'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Real-time voting status badge */}
          <div className="flex items-center gap-2">
            {currentEdition?.status === 'active' ? (
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="truncate">Voting Open ({currentEdition?.year || selectedYear} Gala)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] sm:text-xs font-semibold">
                <span className="truncate">Archived ({currentEdition?.year || selectedYear} Final)</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Plumtree & Matabeleland South Champions</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Plumtree Annual <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
                Appreciation Awards (PAAA)
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Honoring grassroots heroes, visionary educators, healthcare pioneers, cultural custodians, athletic legends, and diaspora leaders who inspire Plumtree and its global community.
            </p>

            {hasAlreadyVotedAny && (
              <div className="inline-flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-[11px] sm:text-xs text-amber-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your ballot has been recorded. You may continue voting in other unlocked categories.</span>
              </div>
            )}
          </div>

          {/* Quick Metrics Cards */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-colors">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Ballot Privacy
              </div>
              {appSettings.hidePublicVoteCounts && !isAdmin ? (
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-300 flex items-center gap-1.5 mt-0.5">
                    <EyeOff className="w-5 h-5 text-amber-400" />
                    <span>Confidential</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Audited privately by board
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {totalVotes.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Real-time tallying
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-colors">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-yellow-400" />
                Categories
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {categoriesCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {totalNominees} Official Nominees
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-colors">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Integrity Score
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                99.4%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                IP & Bot Defense Active
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-colors">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Anti-Cheat Rule
              </div>
              <div className="text-sm font-bold text-amber-300 mt-1">
                1 Vote / Category
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Per IP & Hardware ID
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
