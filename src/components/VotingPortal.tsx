import React, { useState } from 'react';
import { Award, Search, CheckCircle2, Lock, Shield, MapPin, Sparkles, Building2, EyeOff } from 'lucide-react';
import { Nominee, AwardCategory, YearEdition, VoterSession, AppSettings } from '../types';
import { CaptchaModal } from './CaptchaModal';
import { VoteSuccessModal } from './VoteSuccessModal';

interface VotingPortalProps {
  nominees: Nominee[];
  categories: AwardCategory[];
  years: YearEdition[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  voterSession: VoterSession;
  onRefresh: () => void;
  appSettings: AppSettings;
  isAdmin?: boolean;
}

export const VotingPortal: React.FC<VotingPortalProps> = ({
  nominees,
  categories,
  selectedYear,
  voterSession,
  onRefresh,
  appSettings,
  isAdmin = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [votingForNominee, setVotingForNominee] = useState<Nominee | null>(null);
  const [voteReceipt, setVoteReceipt] = useState<{ nominee: Nominee; code: string } | null>(null);
  const [expandedNomineeId, setExpandedNomineeId] = useState<string | null>(null);

  // Filter nominees for the selected year
  const yearNominees = nominees.filter((n) => n.year === selectedYear);

  // Filter by category and search
  const filteredNominees = yearNominees.filter((n) => {
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    const matchesSearch =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.organization && n.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleVoteSuccess = (receiptCode: string) => {
    if (votingForNominee) {
      setVoteReceipt({
        nominee: votingForNominee,
        code: receiptCode,
      });
      setVotingForNominee(null);
      onRefresh();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Category Tabs & Search Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              Award Categories ({selectedYear})
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a category to view vetted nominees and cast your official verified ballot.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search nominee by name, area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/30">
              {yearNominees.length}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const categoryKey = `${selectedYear}_${cat.id}`;
            const hasVotedInCategory = Boolean(voterSession.votedCategories[categoryKey]);
            const count = yearNominees.filter((n) => n.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/30">
                  {count}
                </span>
                {hasVotedInCategory && (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected category description banner */}
      {selectedCategory !== 'all' && (
        <div className="p-4 mb-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              Category Focus
            </span>
            <h3 className="font-serif text-lg font-bold text-white">
              {categories.find((c) => c.id === selectedCategory)?.name}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {categories.find((c) => c.id === selectedCategory)?.description}
            </p>
          </div>

          {Boolean(voterSession.votedCategories[`${selectedYear}_${selectedCategory}`]) && (
            <div className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Category Ballot Locked</span>
            </div>
          )}
        </div>
      )}

      {/* Nominees Grid */}
      {filteredNominees.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Nominees Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNominees.map((nominee) => {
            const categoryKey = `${nominee.year}_${nominee.category}`;
            const votedNomineeId = voterSession.votedCategories[categoryKey];
            const hasVotedThisCategory = Boolean(votedNomineeId);
            const isUserChoice = votedNomineeId === nominee.id;
            const categoryObj = categories.find((c) => c.id === nominee.category);

            return (
              <div
                key={nominee.id}
                className={`relative flex flex-col bg-slate-900 rounded-2xl border transition-all overflow-hidden group hover:shadow-xl hover:shadow-amber-500/5 ${
                  isUserChoice
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/40'
                    : 'border-slate-800 hover:border-amber-500/40'
                }`}
              >
                {/* Photo & Image Header */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={nominee.imageUrl}
                    alt={nominee.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                      {categoryObj?.name || nominee.category}
                    </span>
                  </div>

                  {/* Year Tag & Status */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700">
                      {nominee.year}
                    </span>
                  </div>

                  {/* User choice ribbon */}
                  {isUserChoice && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 text-[11px] font-bold shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Your Official Vote</span>
                    </div>
                  )}
                </div>

                {/* Nominee Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {nominee.name}
                    </h3>

                    {nominee.organization && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium mt-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{nominee.organization}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      <span>{nominee.location}</span>
                    </div>

                    <div className="mt-2.5">
                      <p className={`text-xs text-slate-300 leading-relaxed transition-all ${
                        expandedNomineeId === nominee.id ? '' : 'line-clamp-3'
                      }`}>
                        {nominee.bio}
                      </p>
                      {nominee.bio.length > 120 && (
                        <button
                          type="button"
                          onClick={() => setExpandedNomineeId(expandedNomineeId === nominee.id ? null : nominee.id)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold mt-1 inline-block focus:outline-none"
                        >
                          {expandedNomineeId === nominee.id ? 'Show less ▲' : 'Read full bio ▼'}
                        </button>
                      )}
                    </div>

                    {/* Impact highlight box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                      <strong className="text-amber-400 font-semibold flex items-center gap-1 mb-0.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Impact Achievement:
                      </strong>
                      <span className={expandedNomineeId === nominee.id ? '' : 'line-clamp-2'}>{nominee.impact}</span>
                    </div>
                  </div>

                  {/* Vote footer & Action button */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      {appSettings.hidePublicVoteCounts && !isAdmin ? (
                        <div>
                          <div className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider flex items-center gap-1">
                            <EyeOff className="w-3 h-3 text-amber-400" />
                            Secret Ballot
                          </div>
                          <div className="text-xs font-medium text-slate-400 mt-0.5">
                            Votes confidential
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            Verified Ballots
                          </div>
                          <div className="text-lg font-mono font-bold text-white">
                            {nominee.votes.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {!nominee.isVotingActive ? (
                        <div className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5 min-h-[44px]">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Voting Closed</span>
                        </div>
                      ) : hasVotedThisCategory ? (
                        isUserChoice ? (
                          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 min-h-[44px]">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Voted</span>
                          </div>
                        ) : (
                          <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-800 text-slate-500 text-xs font-semibold flex items-center gap-1.5 min-h-[44px]" title="Category locked: You have already cast a vote for another nominee in this category">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked</span>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => setVotingForNominee(nominee)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 min-h-[44px]"
                        >
                          <Award className="w-4 h-4" />
                          <span>Cast Vote</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Anti-cheat disclaimer footer */}
      <div className="mt-12 p-4 rounded-2xl bg-slate-900/50 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-200">PAAA Electoral Anti-Cheat Engine</div>
            <div className="text-[11px] text-slate-400">
              IP telemetry, automated bot filtration, and hardware fingerprinting active. One verified ballot permitted per award category.
            </div>
          </div>
        </div>
        <div className="shrink-0 font-mono text-[11px] text-amber-400">
          Client: {voterSession.ip}
        </div>
      </div>

      {/* CAPTCHA Anti-Cheat Modal */}
      {votingForNominee && (
        <CaptchaModal
          nominee={votingForNominee}
          onClose={() => setVotingForNominee(null)}
          onSuccess={handleVoteSuccess}
        />
      )}

      {/* Vote Success Confirmation */}
      {voteReceipt && (
        <VoteSuccessModal
          nominee={voteReceipt.nominee}
          receiptCode={voteReceipt.code}
          onClose={() => setVoteReceipt(null)}
        />
      )}

    </div>
  );
};
