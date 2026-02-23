import { usePortfolioStore } from '../../store/portfolioStore';

interface Props {
  onToggleAddEntry: () => void;
}

export default function MobileActionBar({ onToggleAddEntry }: Props) {
  const { savePortfolio, loadPortfolio, hasPortfolio } = usePortfolioStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111827]/95 backdrop-blur-sm border-t border-[#2a3548] px-4 py-3 flex items-center justify-around gap-2">
      {hasPortfolio && (
        <button
          onClick={onToggleAddEntry}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-smooth"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      )}
      {hasPortfolio && (
        <button
          onClick={savePortfolio}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1a2235] hover:bg-[#1f2b42] text-[#e2e8f0] text-sm font-medium border border-[#2a3548] transition-smooth"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save
        </button>
      )}
      <button
        onClick={loadPortfolio}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1a2235] hover:bg-[#1f2b42] text-[#e2e8f0] text-sm font-medium border border-[#2a3548] transition-smooth"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L13 8m4-4v12" />
        </svg>
        Load
      </button>
    </div>
  );
}

