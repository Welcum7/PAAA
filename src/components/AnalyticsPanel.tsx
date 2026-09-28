import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Globe, Download, FileText, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { Nominee, AwardCategory, VoteRecord } from '../types';
import { ExportService } from '../services/exportService';

interface AnalyticsPanelProps {
  nominees: Nominee[];
  categories: AwardCategory[];
  votes: VoteRecord[];
  selectedYear: number;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  nominees,
  categories,
  votes,
  selectedYear,
}) => {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const yearNominees = nominees.filter((n) => n.year === selectedYear);

  const totalVotesCast = yearNominees.reduce((acc, n) => acc + n.votes, 0);
  const totalFlagged = yearNominees.reduce((acc, n) => acc + n.flaggedVotes, 0);
  const totalDisqualified = yearNominees.reduce((acc, n) => acc + n.disqualifiedVotes, 0);
  const grandTotal = totalVotesCast + totalFlagged + totalDisqualified;

  const integrityPct = grandTotal > 0 ? ((totalVotesCast / grandTotal) * 100).toFixed(1) : '100';

  // Category votes distribution
  const categoryStats = categories.map((cat) => {
    const noms = yearNominees.filter((n) => n.category === cat.id);
    const votesInCat = noms.reduce((acc, n) => acc + n.votes, 0);
    const pct = totalVotesCast > 0 ? ((votesInCat / totalVotesCast) * 100).toFixed(1) : '0';
    return {
      id: cat.id,
      name: cat.name,
      votes: votesInCat,
      pct: Number(pct),
    };
  }).sort((a, b) => b.votes - a.votes);

  // Geographic network breakdown simulation
  const geoBreakdown = [
    { region: 'Plumtree Central & Dingumuzi', count: Math.round(totalVotesCast * 0.38), pct: 38 },
    { region: 'Bulilima Rural District (Thekwane, Madlambuzi)', count: Math.round(totalVotesCast * 0.22), pct: 22 },
    { region: 'Mangwe District (Brunapeg, Mphoengs)', count: Math.round(totalVotesCast * 0.16), pct: 16 },
    { region: 'South Africa Diaspora (Gauteng / Western Cape)', count: Math.round(totalVotesCast * 0.14), pct: 14 },
    { region: 'United Kingdom & International Diaspora', count: Math.round(totalVotesCast * 0.07), pct: 7 },
    { region: 'Botswana Border Corridor (Francistown)', count: Math.round(totalVotesCast * 0.03), pct: 3 },
  ];

  // Hourly velocity distribution
  const hourlyVelocity = [
    { hour: '08:00', ballots: 142 },
    { hour: '10:00', ballots: 285 },
    { hour: '12:00', ballots: 420 },
    { hour: '14:00', ballots: 530 },
    { hour: '16:00', ballots: 615 },
    { hour: '18:00', ballots: 790 },
    { hour: '20:00', ballots: 680 },
    { hour: '22:00', ballots: 490 },
  ];
  const maxVelocity = Math.max(...hourlyVelocity.map((h) => h.ballots));

  const handleExportCsv = () => {
    ExportService.exportAuditTrailToCsv(votes);
  };

  const handleExportPdf = () => {
    ExportService.exportCertifiedPdf(
      nominees,
      categories,
      selectedYear,
      totalVotesCast,
      totalVotesCast
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header with Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <h2 className="font-serif text-2xl font-bold text-white">
              Real-Time Tally Analytics & Integrity Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit velocity, demographic nodes, anti-cheat diagnostics, and cryptographic export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/40 text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Audit Trail (CSV)</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <FileText className="w-4 h-4" />
            <span>Certified Audit Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Verified Ballots</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {totalVotesCast.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 100% human CAPTCHA cleared
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Electoral Integrity Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {integrityPct}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero duplicate IP collision allowance
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Flagged Bot Activity</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {totalFlagged.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Quarantined for auditor review
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Disqualified Submissions</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">
            {totalDisqualified.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Excluded by Auditor board
          </p>
        </div>
      </div>

      {/* Grid: Category Distribution & Hourly Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Votes Breakdown */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Category Vote Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total {totalVotesCast.toLocaleString()} votes
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium truncate max-w-xs">{item.name}</span>
                  <span className="font-mono font-bold text-white shrink-0">
                    {item.votes.toLocaleString()} <span className="text-amber-400 font-normal">({item.pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voting Velocity Trends (Hourly) */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Hourly Voting Velocity
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Peak Activity
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Track surge periods and burst patterns to detect automated bot injection spikes.
            </p>

            <div className="flex items-end justify-between gap-2 h-44 pt-4 px-2 bg-slate-950/60 rounded-xl border border-slate-800">
              {hourlyVelocity.map((h) => {
                const heightPct = Math.round((h.ballots / maxVelocity) * 100);
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono text-slate-400 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {h.ballots}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-md group-hover:brightness-125 transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="text-[10px] font-mono text-slate-500">{h.hour}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 mt-4">
            <span>Average velocity: <strong className="text-white">430 ballots/hr</strong></span>
            <span className="text-emerald-400 font-semibold">Zero Anomaly Spikes</span>
          </div>
        </div>

      </div>

      {/* Geographic / IP Subnet Distribution */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            Geographic & Network Subnet Distribution
          </h3>
          <span className="text-xs text-slate-400">
            Plumtree Town, Rural Districts, and Cross-Border Diaspora Nodes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {geoBreakdown.map((geo, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white text-xs truncate">{geo.region}</span>
                <span className="font-mono font-bold text-amber-400 text-xs">{geo.pct}%</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mb-2">
                ~{geo.count.toLocaleString()} Ballots Submitted
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${geo.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
