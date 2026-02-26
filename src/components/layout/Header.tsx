import { usePortfolioStore } from '../../store/portfolioStore';
import { format, parseISO } from 'date-fns';
import { formatCurrencyFull } from '../../utils/calculations';

export default function Header() {
  const { hasPortfolio, lastSavedAt, hasUnsavedChanges, metrics } =
    usePortfolioStore();

  return (
    <header className="border-b border-[#1e293b] bg-[#0c1220]/95 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Trader<span className="text-gradient">Folio</span>
            </h1>
            {hasPortfolio && (
              <p className="text-[10px] text-[#64748b] font-[JetBrains_Mono] hidden sm:block">
                {formatCurrencyFull(metrics.currentEquity)}
                {metrics.totalGainLoss !== 0 && (
                  <span className={`ml-1.5 ${metrics.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {metrics.totalGainLoss >= 0 ? '▲' : '▼'}{' '}
                    {(metrics.percentReturn * 100).toFixed(2)}%
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Mobile: Quick P&L display */}
        {hasPortfolio && (
          <div className="sm:hidden text-right">
            <p className="text-xs font-bold font-[JetBrains_Mono] text-[#f1f5f9]">
              {formatCurrencyFull(metrics.currentEquity)}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className={`stat-pill ${metrics.oneDayChange >= 0 ? 'stat-pill-green' : 'stat-pill-red'}`}
                style={{ padding: '2px 6px', fontSize: '9px' }}
              >
                {metrics.oneDayChange >= 0 ? '▲' : '▼'} {formatCurrencyFull(Math.abs(metrics.oneDayChange))}
              </span>
            </div>
          </div>
        )}

        {/* Desktop: Status */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Unsaved
            </span>
          )}
          {lastSavedAt && (
            <span className="text-[#64748b]">
              Saved: {format(parseISO(lastSavedAt), 'h:mm a')}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
