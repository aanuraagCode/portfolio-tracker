import { useState, useMemo } from 'react';
import { usePortfolioStore } from '../../store/portfolioStore';
import { formatCurrencyFull } from '../../utils/calculations';

function CircularProgress({
  progress,
  size = 72,
  strokeWidth = 5,
  color = '#a855f7',
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
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(30,41,59,0.5)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 4px ${color}66)` }}
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
    if (!isNaN(num) && num > 0) setTargetReturn(num);
    setEditing(false);
  };

  const target = targetReturn ?? 0;
  const totalProfit = metrics.totalGainLoss;
  const progress = target > 0 ? Math.min((Math.max(totalProfit, 0) / target) * 100, 100) : 0;
  const remaining = target > 0 ? Math.max(target - totalProfit, 0) : 0;
  const isAchieved = totalProfit >= target && target > 0;

  const progressColor = useMemo(() => {
    if (isAchieved) return '#22c55e';
    if (progress >= 70) return '#06b6d4';
    if (progress >= 40) return '#a855f7';
    return '#6366f1';
  }, [isAchieved, progress]);

  if (!targetReturn && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full p-4 rounded-2xl border border-dashed border-[#1e293b] hover:border-purple-500/30 bg-[#0c1220]/80 text-[#64748b] text-sm flex items-center justify-center gap-2 transition-all duration-200 touch-active active:scale-[0.98]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Set Profit Target
      </button>
    );
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-[#1e293b]/50 bg-[#0c1220]/80 p-4 animate-fade-in-scale">
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Set Profit Target</h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm font-bold">₹</span>
            <input
              type="text"
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 100000"
              autoFocus
              className="w-full bg-[#060a13] border border-[#1e293b] rounded-xl pl-8 pr-3 py-3 text-sm text-[#f1f5f9] placeholder-[#4a5568] focus:border-purple-500 transition-all font-[JetBrains_Mono]"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            />
          </div>
          <button onClick={handleSave} className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/20">
            Save
          </button>
          <button onClick={() => { setEditing(false); setInput(targetReturn ? String(targetReturn) : ''); }} className="px-4 py-3 bg-[#1e293b] hover:bg-[#2a3548] text-[#94a3b8] text-sm rounded-xl transition-all">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e293b]/50 bg-[#0c1220]/80 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Profit Target</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditing(true); setInput(String(targetReturn)); }} className="text-[#64748b] hover:text-purple-400 p-1.5 rounded-lg hover:bg-purple-500/10 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => setTargetReturn(null)} className="text-[#64748b] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <CircularProgress progress={progress} size={72} strokeWidth={5} color={progressColor} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold font-[JetBrains_Mono]" style={{ color: progressColor }}>{progress.toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748b]">Earned</span>
            <span className={`text-xs font-bold font-[JetBrains_Mono] ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrencyFull(totalProfit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748b]">Target</span>
            <span className="text-xs font-bold text-purple-400 font-[JetBrains_Mono]">{formatCurrencyFull(target)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#64748b]">Remaining</span>
            <span className="text-xs font-bold text-amber-400 font-[JetBrains_Mono]">{formatCurrencyFull(remaining)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 rounded-full bg-[#1e293b]/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${progressColor}, ${isAchieved ? '#06b6d4' : '#a855f7'})` }}
        />
      </div>

      {isAchieved && (
        <div className="mt-3 py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center animate-pop-in">
          <span className="text-emerald-400 text-xs font-semibold">Target Achieved!</span>
        </div>
      )}
    </div>
  );
}
