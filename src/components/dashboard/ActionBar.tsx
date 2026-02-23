import { usePortfolioStore } from '../../store/portfolioStore';

export default function ActionBar() {
  const {
    savePortfolio,
    loadPortfolio,
    exportCSV,
    importCSV,
    resetPortfolio,
    hasUnsavedChanges,
    entries,
  } = usePortfolioStore();

  return (
    <div className="hidden lg:flex items-center gap-2 flex-wrap">
      <button
        onClick={savePortfolio}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-smooth shadow-md shadow-emerald-600/20"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Save JSON
        {hasUnsavedChanges && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        )}
      </button>

      <button
        onClick={loadPortfolio}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2235] hover:bg-[#1f2b42] border border-[#2a3548] text-[#e2e8f0] text-sm font-medium rounded-lg transition-smooth"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L13 8m4-4v12" />
        </svg>
        Load JSON
      </button>

      <div className="w-px h-6 bg-[#2a3548]" />

      {entries.length > 0 && (
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2235] hover:bg-[#1f2b42] border border-[#2a3548] text-[#94a3b8] text-sm font-medium rounded-lg transition-smooth"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      )}

      <button
        onClick={importCSV}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2235] hover:bg-[#1f2b42] border border-[#2a3548] text-[#94a3b8] text-sm font-medium rounded-lg transition-smooth"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Import CSV
      </button>

      <div className="w-px h-6 bg-[#2a3548]" />

      <button
        onClick={() => {
          if (window.confirm('Are you sure you want to reset? All unsaved changes will be lost.')) {
            resetPortfolio();
          }
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#64748b] hover:text-red-400 text-sm font-medium rounded-lg transition-smooth hover:bg-red-500/10"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
    </div>
  );
}

