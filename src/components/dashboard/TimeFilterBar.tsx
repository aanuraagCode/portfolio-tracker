import { usePortfolioStore } from '../../store/portfolioStore';
import { TIME_FILTER_OPTIONS } from '../../utils/timeFilters';

export default function TimeFilterBar() {
  const { selectedTimeFilter, setTimeFilter } = usePortfolioStore();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
      {TIME_FILTER_OPTIONS.map((opt) => {
        const active = selectedTimeFilter === opt.label;
        return (
          <button
            key={opt.label}
            onClick={() => setTimeFilter(opt.label)}
            className={`
              shrink-0 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-semibold
              transition-smooth whitespace-nowrap touch-active
              ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-[#111827] text-[#64748b] hover:bg-[#1a2332] hover:text-[#94a3b8] border border-[#1e293b]'
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
