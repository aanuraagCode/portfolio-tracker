import { useState, useMemo } from 'react';
import { usePortfolioStore } from '../../store/portfolioStore';
import { formatPercent, formatCurrencyFull } from '../../utils/calculations';

/* ── Circular Progress Ring ── */
function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 6,
  color = '#3b82f6',
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="progress-ring-bg"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="progress-ring-fill"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export default function TargetTracker() {
  const { targetReturn, setTargetReturn, metrics } = usePortfolioStore();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(targetReturn ? String(targetReturn) : '');

  const handleSave = () => {
    const num = parseFloat(input);
    if (!isNaN(num) && num > 0) {
      setTargetReturn(num);
    }
    setEditing(false);
  };

  // Calculate progress
  const currentReturn = metrics.percentReturn * 100; // %
  const target = targetReturn ?? 0;
  const progress = target > 0 ? Math.min((currentReturn / target) * 100, 100) : 0;
  const remaining = target > 0 ? Math.max(target - currentReturn, 0) : 0;
  const isAchieved = currentReturn >= target && target > 0;

  // Target equity value
  const targetEquity = metrics.investedCapital * (1 + target / 100);
  const currentEquity = metrics.currentEquity;
  const equityRemaining = Math.max(targetEquity - currentEquity, 0);

  const progressColor = useMemo(() => {
    if (isAchieved) return '#22c55e';
    if (progress >= 70) return '#06b6d4';
    if (progress >= 40) return '#3b82f6';
    return '#6366f1';
  }, [isAchieved, progress]);

  if (!targetReturn && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full p-4 rounded-2xl border border-dashed border-[#1e293b] hover:border-blue-500/40 bg-[#111827]/30 text-[#64748b] text-sm flex items-center justify-center gap-2 transition-smooth touch-active animate-fade-in"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Set Return Target
      </button>
    );
  }

  if (editing) {
    return (
      <div className="card-glass rounded-2xl p-4 animate-fade-in-scale">
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          Set Annual Return Target
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              step="any"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 25"
              autoFocus
              className="w-full bg-[#0a0e17] border border-[#1e293b] rounded-xl px-3 py-3 text-sm text-[#f1f5f9] placeholder-[#4a5568] focus:border-blue-500 transition-smooth pr-8 font-[JetBrains_Mono]"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm font-bold">%</span>
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-smooth shadow-lg shadow-blue-600/20"
          >
            Save
          </button>
          <button
            onClick={() => { setEditing(false); setInput(targetReturn ? String(targetReturn) : ''); }}
            className="px-4 py-3 bg-[#1e293b] hover:bg-[#2a3548] text-[#94a3b8] text-sm rounded-xl transition-smooth"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass rounded-2xl p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isAchieved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
            {isAchieved ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            Return Target
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setEditing(true); setInput(String(targetReturn)); }}
            className="text-[#64748b] hover:text-blue-400 p-1.5 transition-smooth rounded-lg hover:bg-blue-500/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setTargetReturn(null)}
            className="text-[#64748b] hover:text-red-400 p-1.5 transition-smooth rounded-lg hover:bg-red-500/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <CircularProgress
            progress={progress}
            size={88}
            strokeWidth={7}
            color={progressColor}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold font-[JetBrains_Mono]" style={{ color: progressColor }}>
              {progress.toFixed(0)}%
            </span>
            <span className="text-[8px] text-[#64748b] uppercase">done</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748b]">Achieved</span>
            <span className={`text-xs font-bold font-[JetBrains_Mono] ${currentReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPercent(metrics.percentReturn)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748b]">Target</span>
            <span className="text-xs font-bold text-blue-400 font-[JetBrains_Mono]">{target.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748b]">Remaining</span>
            <span className="text-xs font-bold text-amber-400 font-[JetBrains_Mono]">{remaining.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track mt-4 mb-3">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${progressColor}, ${isAchieved ? '#06b6d4' : '#60a5fa'})`,
          }}
        />
      </div>

      {/* Equity targets */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#0a0e17]/60 rounded-xl p-2.5">
          <p className="text-[9px] text-[#64748b] uppercase tracking-wider mb-0.5">Current</p>
          <p className="text-[11px] font-bold text-[#f1f5f9] font-[JetBrains_Mono]">{formatCurrencyFull(currentEquity)}</p>
        </div>
        <div className="bg-[#0a0e17]/60 rounded-xl p-2.5">
          <p className="text-[9px] text-[#64748b] uppercase tracking-wider mb-0.5">Target</p>
          <p className="text-[11px] font-bold text-blue-400 font-[JetBrains_Mono]">{formatCurrencyFull(targetEquity)}</p>
        </div>
        <div className="bg-[#0a0e17]/60 rounded-xl p-2.5">
          <p className="text-[9px] text-[#64748b] uppercase tracking-wider mb-0.5">Need</p>
          <p className="text-[11px] font-bold text-amber-400 font-[JetBrains_Mono]">{formatCurrencyFull(equityRemaining)}</p>
        </div>
      </div>

      {isAchieved && (
        <div className="mt-3 py-2.5 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center animate-pop-in">
          <span className="text-emerald-400 text-xs font-semibold">🎯 Target Achieved! Keep pushing!</span>
        </div>
      )}
    </div>
  );
}
