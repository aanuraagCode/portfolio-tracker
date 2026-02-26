import { useRef, useEffect } from 'react';
import { usePortfolioStore } from '../../store/portfolioStore';
import { TIME_FILTER_OPTIONS } from '../../utils/timeFilters';

export default function TimeFilterBar() {
  const { selectedTimeFilter, setTimeFilter } = usePortfolioStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const btn = activeRef.current;
      const scrollLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedTimeFilter]);

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1"
    >
      {TIME_FILTER_OPTIONS.map((opt) => {
        const active = selectedTimeFilter === opt.label;
        return (
          <button
            key={opt.label}
            ref={active ? activeRef : undefined}
            onClick={() => setTimeFilter(opt.label)}
            className={`
              shrink-0 px-4 py-2 rounded-full text-xs font-bold
              transition-all duration-200 whitespace-nowrap border
              ${
                active
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md shadow-purple-500/10'
                  : 'bg-transparent text-[#64748b] border-[#1e293b] active:scale-95 hover:text-[#94a3b8] hover:border-[#2a3548]'
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
