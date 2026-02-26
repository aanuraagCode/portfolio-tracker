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
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {CHART_OPTIONS.map((opt) => {
          const active = selectedChartType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => setChartType(opt.type)}
              className={`
                shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap border
                ${
                  active
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md shadow-purple-500/10'
                    : 'bg-transparent text-[#64748b] hover:text-[#94a3b8] border-[#1e293b] hover:border-[#2a3548]'
                }
              `}
            >
              <span className="mr-1">{opt.icon}</span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        {CHART_OPTIONS.map((opt) => {
          const active = selectedChartType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => setChartType(opt.type)}
              className={`
                shrink-0 px-3.5 py-2 rounded-full text-[11px] font-bold transition-all duration-200 whitespace-nowrap border
                ${
                  active
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md shadow-purple-500/10'
                    : 'bg-transparent text-[#64748b] border-[#1e293b] active:scale-95'
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
