import { usePortfolioStore } from '../../store/portfolioStore';
import type { ChartType } from '../../types';

const CHART_OPTIONS: { type: ChartType; label: string; icon: string }[] = [
  { type: 'area', label: 'Equity', icon: '📈' },
  { type: 'line', label: 'Line', icon: '📊' },
  { type: 'bar', label: 'Daily P&L', icon: '📶' },
  { type: 'cumulative', label: 'Returns', icon: '📉' },
  { type: 'drawdown', label: 'Drawdown', icon: '⬇️' },
  { type: 'monthly', label: 'Monthly', icon: '📅' },
  { type: 'distribution', label: 'Distribution', icon: '🔔' },
  { type: 'rolling', label: 'Sharpe', icon: '⚡' },
];

export default function ChartTypeSelector() {
  const { selectedChartType, setChartType } = usePortfolioStore();

  return (
    <>
      {/* Desktop: inline pill buttons */}
      <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {CHART_OPTIONS.map((opt) => {
          const active = selectedChartType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => setChartType(opt.type)}
              className={`
                shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-smooth whitespace-nowrap
                ${
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                    : 'bg-[#111827] text-[#64748b] hover:bg-[#1a2332] hover:text-[#94a3b8] border border-[#1e293b]'
                }
              `}
            >
              <span className="mr-1">{opt.icon}</span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Mobile: horizontal scroll pills */}
      <div className="sm:hidden flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
        {CHART_OPTIONS.map((opt) => {
          const active = selectedChartType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => setChartType(opt.type)}
              className={`
                shrink-0 px-3 py-2.5 rounded-xl text-[11px] font-semibold transition-smooth whitespace-nowrap touch-active
                ${
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                    : 'bg-[#111827] text-[#64748b] border border-[#1e293b]'
                }
              `}
            >
              {opt.icon} {opt.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
