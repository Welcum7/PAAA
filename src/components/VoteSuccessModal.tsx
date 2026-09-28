import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, ShieldCheck, Copy, Check, Share2 } from 'lucide-react';
import { Nominee } from '../types';

interface VoteSuccessModalProps {
  nominee: Nominee;
  receiptCode: string;
  onClose: () => void;
}

export const VoteSuccessModal: React.FC<VoteSuccessModalProps> = ({ nominee, receiptCode, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Fire festive gold confetti
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#d97706', '#10b981'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 text-center text-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

        {/* Gold Glow circle */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 mb-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
          <Award className="w-7 h-7 sm:w-8 sm:h-8" />
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 text-slate-950">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">
          Vote Confirmed!
        </h3>
        <p className="text-[11px] sm:text-xs text-amber-400 font-semibold mb-4 uppercase tracking-wider">
          PAAA Official Digital Ballot Record
        </p>

        {/* Card of Nominee */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-left flex items-center gap-3">
          <img
            src={nominee.imageUrl}
            alt={nominee.name}
            className="w-12 h-12 rounded-lg object-cover border border-amber-500/30 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Your Selected Nominee</div>
            <div className="font-bold text-white text-sm truncate">{nominee.name}</div>
            <div className="text-xs text-amber-300/90 font-medium truncate">{nominee.organization || nominee.location}</div>
          </div>
        </div>

        {/* Digital Ballot Receipt Code */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-5 text-left">
          <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Auditable Receipt Reference:
            </span>
            <span className="text-[10px] uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <code className="text-xs sm:text-sm font-mono font-bold text-white bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex-1 truncate">
              {receiptCode}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 min-h-[40px] min-w-[40px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs shrink-0"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            This verification code is cryptographically recorded in the independent tally log for anti-cheat audit.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Done & Continue Voting</span>
          </button>
        </div>
      </div>
    </div>
  );
};
