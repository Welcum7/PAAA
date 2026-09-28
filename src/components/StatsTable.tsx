import React, { useState } from 'react';
import { Table2, Download, FileText, Search, Filter, ArrowUpDown, ShieldCheck, CheckCircle2, Lock, EyeOff } from 'lucide-react';
import { Nominee, AwardCategory, YearEdition, AppSettings } from '../types';
import { ExportService } from '../services/exportService';

interface StatsTableProps {
  nominees: Nominee[];
  categories: AwardCategory[];
  years: YearEdition[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  onCastVoteClick?: (nominee: Nominee) => void;
  appSettings: AppSettings;
  isAdmin?: boolean;
}

export const StatsTable: React.FC<StatsTableProps> = ({
  nominees,
  categories,
  years,
  selectedYear,
  setSelectedYear,
  onCastVoteClick,
  appSettings,
  isAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'name' | 'category' | 'flagged'>('votes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  // Nominees for the selected year
  const yearNominees = nominees.filter((n) => n.year === selectedYear);

  // Category totals
  const categoryTotals: Record<string, number> = {};
  yearNominees.forEach((n) => {
    categoryTotals[n.category] = (categoryTotals[n.category] || 0) + n.votes;
  });

  // Filter
  const filtered = yearNominees.filter((n) => {
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    const matchesSearch =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.organization && n.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'votes') comp = a.votes - b.votes;
    else if (sortBy === 'name') comp = a.name.localeCompare(b.name);
    else if (sortBy === 'category') comp = (catMap.get(a.category) || '').localeCompare(catMap.get(b.category) || '');
    else if (sortBy === 'flagged') comp = a.flaggedVotes - b.flaggedVotes;

    return sortOrder === 'asc' ? comp : -comp;
  });

  const toggleSort = (col: 'votes' | 'name' | 'category' | 'flagged') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const totalVerifiedBallots = yearNominees.reduce((acc, n) => acc + n.votes, 0);

  const handleCsvExport = () => {
    ExportService.exportNomineesToCsv(nominees, categories, selectedYear);
  };

  const handlePdfExport = () => {
    ExportService.exportCertifiedPdf(
      nominees,
      categories,
      selectedYear,
      totalVerifiedBallots,
      totalVerifiedBallots
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Table Header and Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Table2 className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-2xl font-bold text-white">
              Nominee Tally Statistics & Metrics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete audited breakdown of nominees, category percentages, and verification metrics for {selectedYear}.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCsvExport}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/40 text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePdfExport}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <FileText className="w-4 h-4" />
            <span>Download Certified PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        
        {/* Year Edition Selector */}
        <div className="md:col-span-3">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Edition Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          >
            {years.map((y) => (
              <option key={y.year} value={y.year}>
                {y.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Award Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">All Award Categories ({yearNominees.length} nominees)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="md:col-span-5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Search Nominees
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, organization, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg text-xs text-white focus:outline-none placeholder-slate-500"
            />
          </div>
        </div>

      </div>

      {/* Nominees Data Table / Cards */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        
        {/* Mobile View: High-Legibility Nominee Cards */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {sorted.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No matching nominee statistics recorded.
            </div>
          ) : (
            sorted.map((nom, index) => {
              const catTotal = categoryTotals[nom.category] || 1;
              const sharePct = ((nom.votes / catTotal) * 100).toFixed(1);
              const isSecret = appSettings.hidePublicVoteCounts && !isAdmin;

              return (
                <div key={nom.id} className="p-4 bg-slate-900/60 hover:bg-slate-900 transition-colors space-y-3">
                  
                  {/* Top card row: Rank + Category + Ballot Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          index === 0
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : index === 1
                            ? 'bg-slate-300 text-slate-950'
                            : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-300">
                        {catMap.get(nom.category) || nom.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {nom.isVotingActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nominee details */}
                  <div className="flex items-center gap-3">
                    <img
                      src={nom.imageUrl}
                      alt={nom.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-sm truncate">
                        {nom.name}
                      </h4>
                      <div className="text-[11px] text-slate-400 truncate">
                        {nom.organization || 'Independent Contender'} • {nom.location}
                      </div>
                    </div>
                  </div>

                  {/* Stats grid on mobile card */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ballot Tally</span>
                      {isSecret ? (
                        <span className="text-amber-400 font-bold text-xs inline-flex items-center gap-1 mt-0.5">
                          <EyeOff className="w-3.5 h-3.5" /> Confidential
                        </span>
                      ) : (
                        <span className="text-white font-mono font-bold text-sm">
                          {nom.votes.toLocaleString()} <span className="text-[10px] font-sans text-slate-400 font-normal">votes</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Category Share</span>
                      {isSecret ? (
                        <span className="text-slate-500 text-xs italic mt-0.5 block">Sealed</span>
                      ) : (
                        <div>
                          <span className="text-amber-300 font-mono font-semibold text-xs">{sharePct}%</span>
                          <div className="w-full bg-slate-900 rounded-full h-1 mt-1 overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${sharePct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Anti-cheat audit badge */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      {nom.flaggedVotes > 0 ? (
                        <span className="text-amber-400 flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" /> {nom.flaggedVotes} Flagged
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cryptographically Verified
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nominee Details</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('category')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Location</th>
                <th
                  onClick={() => toggleSort('votes')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Verified Votes</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 w-32">Category Share</th>
                <th
                  onClick={() => toggleSort('flagged')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Integrity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Ballot Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No matching nominee statistics recorded.
                  </td>
                </tr>
              ) : (
                sorted.map((nom, index) => {
                  const catTotal = categoryTotals[nom.category] || 1;
                  const sharePct = ((nom.votes / catTotal) * 100).toFixed(1);
                  const isTopContender = index === 0;

                  return (
                    <tr
                      key={nom.id}
                      className="hover:bg-slate-850/60 transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            index === 0
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : index === 1
                              ? 'bg-slate-300 text-slate-950'
                              : index === 2
                              ? 'bg-amber-700 text-white'
                              : 'text-slate-400 bg-slate-800'
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>

                      {/* Nominee details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={nom.imageUrl}
                            alt={nom.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                              {nom.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {nom.organization || 'Independent Contender'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200">
                          {catMap.get(nom.category) || nom.category}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          PAAA-{nom.year}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-300">
                        {nom.location}
                      </td>

                      {/* Verified votes */}
                      <td className="py-3 px-4 text-right">
                        {appSettings.hidePublicVoteCounts && !isAdmin ? (
                          <div>
                            <span className="font-mono text-xs font-bold text-amber-400 inline-flex items-center gap-1">
                              <EyeOff className="w-3.5 h-3.5" /> Confidential
                            </span>
                            <div className="text-[10px] text-slate-500">
                              Secret Ballot
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-mono font-bold text-base text-white">
                              {nom.votes.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                              <ShieldCheck className="w-3 h-3" /> Audited
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Category share bar */}
                      <td className="py-3 px-4">
                        {appSettings.hidePublicVoteCounts && !isAdmin ? (
                          <div className="text-[11px] text-slate-500 font-mono italic">
                            Tally masked
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-slate-300">
                              <span>{sharePct}%</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full"
                                style={{ width: `${sharePct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Anti-cheat audit status */}
                      <td className="py-3 px-4 text-center">
                        {nom.flaggedVotes > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {nom.flaggedVotes} Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> 100% Valid
                          </span>
                        )}
                      </td>

                      {/* Ballot status */}
                      <td className="py-3 px-4 text-center">
                        {nom.isVotingActive ? (
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Voting Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">
                            Closed
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table summary footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{sorted.length}</strong> of{' '}
            <strong className="text-white">{yearNominees.length}</strong> nominees for {selectedYear}
          </div>
          <div className="flex items-center gap-4">
            <span>Cumulative Ballots: <strong className="text-amber-400 font-mono">{totalVerifiedBallots.toLocaleString()}</strong></span>
            <span>Data Format: <strong className="text-slate-200">ISO-8601 & SHA-256 Verified</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
};
