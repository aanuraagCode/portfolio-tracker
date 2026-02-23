import { usePortfolioStore } from '../../store/portfolioStore';
import { format, parseISO } from 'date-fns';

export default function Header() {
  const { hasPortfolio, lastSavedAt, hasUnsavedChanges, initialCapital } =
    usePortfolioStore();

  return (
    <header className="border-b border-[#2a3548] bg-[#111827]/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight">
              Portfolio Tracker
            </h1>
            {hasPortfolio && (
              <p className="text-xs text-[#64748b]">
                Capital: ${initialCapital.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Status indicators */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes
            </span>
          )}
          {lastSavedAt && (
            <span className="text-[#64748b]">
              Last saved:{' '}
              {format(parseISO(lastSavedAt), 'MMM d, h:mm a')}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

