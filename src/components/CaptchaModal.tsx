import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertTriangle, RefreshCw, Smartphone, Globe, CheckCircle2 } from 'lucide-react';
import { Nominee } from '../types';
import { StorageService, getSimulatedClientIp, getClientFingerprint } from '../services/storageService';

interface CaptchaModalProps {
  nominee: Nominee;
  onClose: () => void;
  onSuccess: (receiptCode: string) => void;
}

export const CaptchaModal: React.FC<CaptchaModalProps> = ({ nominee, onClose, onSuccess }) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [numA, setNumA] = useState(0);
  const [numB, setNumB] = useState(0);
  const [mathAnswer, setMathAnswer] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot field
  const [startTime] = useState<number>(Date.now());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientIp] = useState(getSimulatedClientIp());
  const [fingerprint] = useState(getClientFingerprint());

  // Generate a random math challenge
  const generateChallenge = () => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 1;
    setNumA(a);
    setNumB(b);
    setMathAnswer('');
    setSliderValue(0);
    setErrorMsg(null);
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Anti-bot check 1: Honeypot field must be empty
    if (honeypot.trim() !== '') {
      setErrorMsg('Automated bot interaction detected by honeypot sensor.');
      return;
    }

    // Anti-bot check 2: Math solution
    const expected = numA + numB;
    if (parseInt(mathAnswer.trim(), 10) !== expected) {
      setErrorMsg(`Incorrect security sum. Please solve ${numA} + ${numB}.`);
      return;
    }

    // Anti-bot check 3: Slider verification
    if (sliderValue < 95) {
      setErrorMsg('Please slide the verification lever completely to 100% to confirm human action.');
      return;
    }

    // Human interaction speed telemetry
    const duration = Date.now() - startTime;
    // Bots usually solve within 300ms
    let captchaScore = 0.96;
    if (duration < 1200) {
      captchaScore = 0.55; // abnormally fast
    } else if (duration > 3000) {
      captchaScore = 0.99;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = StorageService.castVote({
        nomineeId: nominee.id,
        captchaScore,
        customIp: clientIp,
      });

      setIsSubmitting(false);

      if (res.success && res.receiptCode) {
        onSuccess(res.receiptCode);
      } else {
        setErrorMsg(res.message);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Top Gold Accent & Mobile Drag Handle */}
        <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 shrink-0" />
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0" />

        <div className="p-4 sm:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                  Ballot Verification & Anti-Cheat
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  PAAA Electoral Integrity Guard | Secure Submission
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Close verification modal"
            >
              ✕
            </button>
          </div>

          {/* Nominee confirmation summary */}
          <div className="p-3 mb-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <img
              src={nominee.imageUrl}
              alt={nominee.name}
              className="w-12 h-12 rounded-lg object-cover border border-amber-500/30 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                Casting Ballot For
              </span>
              <h4 className="font-semibold text-white truncate text-sm">
                {nominee.name}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {nominee.organization || nominee.location}
              </p>
            </div>
          </div>

          {/* Telemetry info pill */}
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] text-slate-400 bg-slate-800/40 p-2 sm:p-2.5 rounded-lg border border-slate-800 mb-4">
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">IP: <strong className="text-slate-200">{clientIp}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Device: <strong className="text-slate-200">{fingerprint.slice(0, 11)}</strong></span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field (hidden from humans, traps bots) */}
            <input
              type="text"
              name="honeypot_field"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              autoComplete="off"
              tabIndex={-1}
            />

            {/* CAPTCHA Challenge 1: Math Sum */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Anti-Bot Math Challenge:
                </label>
                <button
                  type="button"
                  onClick={generateChallenge}
                  className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors py-1 px-1.5 rounded"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-mono font-bold text-base tracking-wider shrink-0">
                  {numA} + {numB} = ?
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="Sum"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>
            </div>

            {/* CAPTCHA Challenge 2: Slide to Confirm */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Slide to authorize ballot:</span>
                <span className={`font-mono font-bold ${sliderValue >= 95 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {sliderValue}%
                </span>
              </div>
              <div className="py-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="w-full h-4 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 touch-pan-x"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                {sliderValue >= 95 ? (
                  <span className="text-emerald-400 inline-flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verification slider locked at 100%
                  </span>
                ) : (
                  'Slide lever completely to the right to verify human gesture'
                )}
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Anti-cheat disclaimer */}
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              By submitting this vote, you certify that you are voting once per award category. Multiple ballots from the same IP network or automated bot engines will be quarantined by the PAAA Electoral Board.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2 pb-1 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 min-h-[46px] py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || sliderValue < 95}
                className="flex-1 min-h-[46px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Vote</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
