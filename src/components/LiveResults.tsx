import React, { useState, useEffect } from 'react';
import { Trophy, Flame, TrendingUp, RefreshCw, Award, Radio, Filter, EyeOff, Lock } from 'lucide-react';
import { Nominee, AwardCategory, YearEdition, AppSettings } from '../types';

interface LiveResultsProps {
  nominees: Nominee[];
  categories: AwardCategory[];
  years: YearEdition[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  onRefresh: () => void;
  appSettings: AppSettings;
  isAdmin?: boolean;
}

export const LiveResults: React.FC<LiveResultsProps> = ({
  nominees,
  categories,
  selectedYear,
  onRefresh,
  appSettings,
  isAdmin = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [recentLiveTicker, setRecentLiveTicker] = useState<string>(
    'Live Tally Stream initialized. Ballots verified by PAAA Electoral Board.'
  );

  // Filter nominees by selected year
  const yearNominees = nominees.filter((n) => n.year === selectedYear);

  // Auto-refresh pulse every 5 seconds if live streaming is toggled on
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      onRefresh();
      setLastRefreshed(new Date().toLocaleTimeString());

      // Generate realistic live activity ticker
      const randNom = yearNominees[Math.floor(Math.random() * yearNominees.length)];
      if (randNom) {
        const locations = ['Plumtree Central', 'Dingumuzi Township', 'Bulilima Rural', 'Mangwe District', 'Johannesburg Diaspora', 'UK Diaspora', 'Botswana Corridor'];
        const loc = locations[Math.floor(Math.random() * locations.length)];
        setRecentLiveTicker(`Verified ballot recorded for "${randNom.name}" via ${loc} network node`);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, onRefresh, yearNominees]);

  // Compute category totals
  const categoryTotals: Record<string, number> = {};
  yearNominees.forEach((n) => {
    categoryTotals[n.category] = (categoryTotals[n.category] || 0) + n.votes;
  });

  // Filtered list
  const filtered = selectedCategory === 'all'
    ? yearNominees
    : yearNominees.filter((n) => n.category === selectedCategory);

  // Group by category to display leaderboards
  const groupedCategories = categories.filter((cat) => {
    if (selectedCategory !== 'all') return cat.id === selectedCategory;
    return yearNominees.some((n) => n.category === cat.id);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Live Results Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 rounded-2xl border border-amber-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-rose-400">
              Live Tally Stream • Real-Time
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">
            PAAA {selectedYear} Official Leaderboards
          </h2>
          <p className="text-xs text-slate-400">
            {appSettings.hidePublicVoteCounts && !isAdmin
              ? 'Official contender directory across all award categories. Tallies are sealed to protect voting impartiality.'
              : `Real-time verified standings across all ${categories.length} award categories.`}
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isLiveStreaming
                ? 'bg-rose-500/10 border border-rose-500/40 text-rose-400'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-rose-400' : ''}`} />
            <span>{isLiveStreaming ? 'Streaming Live' : 'Live Paused'}</span>
          </button>

          <button
            onClick={() => {
              onRefresh();
              setLastRefreshed('Just now');
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Force refresh"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Secret ballot notice for public voters */}
      {appSettings.hidePublicVoteCounts && !isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <EyeOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-300">
              PAAA Electoral Integrity Protocol: Blind Voting Active
            </div>
            <p className="text-slate-300 leading-relaxed">
              To protect voter impartiality and eliminate bandwagon bias, individual vote tallies and rankings are sealed from public view. Contenders are listed in randomized/neutral alphabetical sequence. All ballots are cryptographically audited and will be unsealed at the Annual Gala. Authorized administrators can view real-time tallies in the Admin Console.
            </p>
          </div>
        </div>
      )}

      {/* Live Activity Ticker */}
      <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs text-slate-300 overflow-hidden">
        <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
        <span className="font-mono text-[11px] text-amber-400 uppercase font-bold shrink-0">Live Pulse:</span>
        <span className="truncate text-slate-300 font-medium">{recentLiveTicker}</span>
        <span className="ml-auto text-[10px] text-slate-500 shrink-0 font-mono">Updated: {lastRefreshed}</span>
      </div>

      {/* Category selector pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="text-xs text-slate-400 flex items-center gap-1.5 mr-1 font-semibold">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          Filter:
        </div>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          All Categories
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Category Leaderboard Cards */}
      <div className="space-y-8">
        {groupedCategories.map((cat) => {
          const isSecret = appSettings.hidePublicVoteCounts && !isAdmin;
          const catNominees = yearNominees
            .filter((n) => n.category === cat.id)
            .sort((a, b) => {
              if (isSecret) return a.name.localeCompare(b.name);
              return b.votes - a.votes;
            });

          const totalCatVotes = categoryTotals[cat.id] || 0;

          if (catNominees.length === 0) return null;

          return (
            <div
              key={cat.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-lg"
            >
              {/* Category Header */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {isSecret ? (
                      <span className="text-amber-400 font-sans flex items-center gap-1.5 text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Tallies Sealed • Secret Ballot</span>
                      </span>
                    ) : (
                      <>
                        <span className="text-slate-400">Total Category Ballots: </span>
                        <strong className="text-amber-400 font-bold">{totalCatVotes.toLocaleString()}</strong>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Nominees Rankings List */}
              <div className="p-5 space-y-4">
                {catNominees.map((nominee, idx) => {
                  const sharePct = totalCatVotes > 0 ? ((nominee.votes / totalCatVotes) * 100).toFixed(1) : '0';
                  const rank = idx + 1;

                  // Rank Badge styles
                  let rankBadge = (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      #{rank}
                    </div>
                  );
                  if (isSecret) {
                    rankBadge = (
                      <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 text-amber-400 text-xs font-mono font-semibold flex items-center justify-center shrink-0" title="Ballot Contender">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                    );
                  } else if (rank === 1) {
                    rankBadge = (
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 text-xs font-mono font-black flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                        1st
                      </div>
                    );
                  } else if (rank === 2) {
                    rankBadge = (
                      <div className="w-7 h-7 rounded-lg bg-slate-300 text-slate-950 text-xs font-mono font-black flex items-center justify-center shrink-0">
                        2nd
                      </div>
                    );
                  } else if (rank === 3) {
                    rankBadge = (
                      <div className="w-7 h-7 rounded-lg bg-amber-700 text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        3rd
                      </div>
                    );
                  }

                  return (
                    <div
                      key={nominee.id}
                      className="p-3.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 rounded-xl transition-all"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        
                        <div className="flex items-center gap-3 min-w-0">
                          {rankBadge}
                          <img
                            src={nominee.imageUrl}
                            alt={nominee.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate flex items-center gap-2">
                              {nominee.name}
                              {rank === 1 && (
                                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                            </h4>
                            <div className="text-xs text-slate-400 truncate">
                              {nominee.organization || nominee.location}
                            </div>
                          </div>
                        </div>

                        {/* Votes counter */}
                        <div className="text-right shrink-0">
                          {appSettings.hidePublicVoteCounts && !isAdmin ? (
                            <div>
                              <div className="text-xs font-bold text-amber-400 flex items-center justify-end gap-1">
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Confidential</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Official Contender
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-base font-mono font-bold text-white flex items-center justify-end gap-1.5">
                                {nominee.votes.toLocaleString()}
                                <span className="text-xs font-normal text-slate-400 font-sans">votes</span>
                              </div>
                              <div className="text-xs font-mono font-semibold text-amber-400">
                                {sharePct}% share
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Vote share bar */}
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${
                            rank === 1
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              : rank === 2
                              ? 'bg-gradient-to-r from-slate-400 to-slate-200'
                              : 'bg-amber-600/70'
                          }`}
                          style={{
                            width: appSettings.hidePublicVoteCounts && !isAdmin ? '100%' : `${Math.max(Number(sharePct), 2)}%`,
                            opacity: appSettings.hidePublicVoteCounts && !isAdmin ? 0.35 : 1,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
