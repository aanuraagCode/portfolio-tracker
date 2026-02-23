import { usePortfolioStore } from '../../store/portfolioStore';
import type { ChartType } from '../../types';

const CHART_OPTIONS: { type: ChartType; label: string; icon: string }[] = [
  { type: 'line', label: 'Line', icon: '📈' },
  { type: 'area', label: 'Area', icon: '📊' },
  { type: 'bar', label: 'Bar', icon: '📶' },
  { type: 'cumulative', label: 'Cumulative Returns', icon: '📉' },
  { type: 'drawdown', label: 'Drawdown', icon: '⬇️' },
];

export default function ChartTypeSelector() {
  const { selectedChartType, setChartType } = usePortfolioStore();

  return (
    <>
      {/* Desktop: inline buttons */}
      <div className="hidden sm:flex items-center gap-1.5">
        {CHART_OPTIONS.map((opt) => {
          const active = selectedChartType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => setChartType(opt.type)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth
                ${
                  active
                    ? 'bg-[#1f2b42] text-white border border-blue-500/40'
                    : 'bg-[#1a2235] text-[#94a3b8] hover:bg-[#1f2b42] hover:text-[#e2e8f0] border border-[#2a3548]'
                }
              `}
            >
              <span className="mr-1.5">{opt.icon}</span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Mobile: dropdown */}
      <div className="sm:hidden">
        <select
          value={selectedChartType}
          onChange={(e) => setChartType(e.target.value as ChartType)}
          className="w-full bg-[#1a2235] border border-[#2a3548] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] focus:border-blue-500 transition-smooth"
        >
          {CHART_OPTIONS.map((opt) => (
            <option key={opt.type} value={opt.type}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

