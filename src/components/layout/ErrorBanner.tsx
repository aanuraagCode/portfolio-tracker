import { usePortfolioStore } from '../../store/portfolioStore';

export default function ErrorBanner() {
  const { error, clearError } = usePortfolioStore();

  if (!error) return null;

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 animate-fade-in">
      <div className="max-w-[1600px] mx-auto bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-400 mt-0.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-red-300 flex-1">{error}</p>
        <button
          onClick={clearError}
          className="text-red-400 hover:text-red-300 transition-smooth"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

