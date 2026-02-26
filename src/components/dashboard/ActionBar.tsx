import { usePortfolioStore } from '../../store/portfolioStore';

interface Props {
  onOpenCapitalFlow: () => void;
}

export default function ActionBar({ onOpenCapitalFlow }: Props) {
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
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-medium rounded-xl transition-smooth shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Save
        {hasUnsavedChanges && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </button>

      <button
        onClick={loadPortfolio}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#111827] hover:bg-[#1a2332] border border-[#1e293b] text-[#f1f5f9] text-sm font-medium rounded-xl transition-smooth hover:border-[#2a3548]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L13 8m4-4v12" />
        </svg>
        Load
      </button>

      <button
        onClick={onOpenCapitalFlow}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-xl transition-smooth hover:border-blue-500/50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Capital
      </button>

      <div className="w-px h-6 bg-[#1e293b]" />

      {entries.length > 0 && (
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#111827] hover:bg-[#1a2332] border border-[#1e293b] text-[#94a3b8] text-sm font-medium rounded-xl transition-smooth hover:border-[#2a3548]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      )}

      <button
        onClick={importCSV}
        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#111827] hover:bg-[#1a2332] border border-[#1e293b] text-[#94a3b8] text-sm font-medium rounded-xl transition-smooth hover:border-[#2a3548]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Import CSV
      </button>

      <div className="w-px h-6 bg-[#1e293b]" />

      <button
        onClick={() => {
          if (window.confirm('Reset portfolio? All unsaved changes will be lost.')) {
            resetPortfolio();
          }
        }}
        className="inline-flex items-center gap-1.5 px-3 py-2.5 text-[#64748b] hover:text-red-400 text-sm font-medium rounded-xl transition-smooth hover:bg-red-500/10"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
    </div>
  );
}
