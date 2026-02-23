import { usePortfolioStore } from '../../store/portfolioStore';
import { TIME_FILTER_OPTIONS } from '../../utils/timeFilters';

export default function TimeFilterBar() {
  const { selectedTimeFilter, setTimeFilter } = usePortfolioStore();

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
      {TIME_FILTER_OPTIONS.map((opt) => {
        const active = selectedTimeFilter === opt.label;
        return (
          <button
            key={opt.label}
            onClick={() => setTimeFilter(opt.label)}
            className={`
              shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium
              transition-smooth whitespace-nowrap
              ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-[#1a2235] text-[#94a3b8] hover:bg-[#1f2b42] hover:text-[#e2e8f0] border border-[#2a3548]'
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

