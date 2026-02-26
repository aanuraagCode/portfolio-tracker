import { useState, useEffect, useCallback } from 'react';
import { usePortfolioStore } from '../../store/portfolioStore';
import Header from '../layout/Header';
import ErrorBanner from '../layout/ErrorBanner';
import MobileActionBar from '../layout/MobileActionBar';
import MetricsCards from './MetricsCards';
import TimeFilterBar from './TimeFilterBar';
import ChartTypeSelector from './ChartTypeSelector';
import ActionBar from './ActionBar';
import DataTable from './DataTable';
import TargetTracker from './TargetTracker';
import BenchmarkComparison from './BenchmarkComparison';
import CapitalFlowModal from './CapitalFlowModal';
import PortfolioChart from '../charts/PortfolioChart';
import AddEntryForm from '../forms/AddEntryForm';

export default function Dashboard() {
  const { hasUnsavedChanges, isLoading, activeMobileTab } = usePortfolioStore();
  const [mobileAddOpen, setMobileAddOpen] = useState(false);
  const [capitalFlowOpen, setCapitalFlowOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // ── Warn on page leave if unsaved changes ──
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const toggleMobileAdd = useCallback(() => {
    setMobileAddOpen((v) => !v);
    setQuickActionsOpen(false);
  }, []);

  const toggleCapitalFlow = useCallback(() => {
    setCapitalFlowOpen((v) => !v);
    setQuickActionsOpen(false);
  }, []);

  const toggleQuickActions = useCallback(() => {
    setQuickActionsOpen((v) => !v);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#94a3b8] text-sm font-medium">Loading portfolio…</p>
          <p className="text-[#4a5568] text-xs mt-1">Crunching your numbers</p>
        </div>
      </div>
    );
  }

  // ── Mobile Content Router ──
  const renderMobileContent = () => {
    switch (activeMobileTab) {
      case 'dashboard':
        return (
          <div className="space-y-4 tab-content-enter" key="dashboard">
            {/* Swipeable Metrics */}
            <MetricsCards />

            {/* Target Tracker */}
            <TargetTracker />

            {/* Quick Chart Preview */}
            <div className="bg-[#1a2235]/80 border border-[#2a3548] rounded-2xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  Performance
                </h2>
              </div>
              <PortfolioChart />
            </div>

            {/* Time Filters */}
            <TimeFilterBar />
          </div>
        );

      case 'charts':
        return (
          <div className="space-y-4 tab-content-enter" key="charts">
            {/* Chart Type Selector */}
            <ChartTypeSelector />

            {/* Main Chart */}
            <div className="bg-[#1a2235]/80 border border-[#2a3548] rounded-2xl p-3 space-y-3">
              <PortfolioChart />
            </div>

            {/* Time Filters */}
            <TimeFilterBar />
          </div>
        );

      case 'log':
        return (
          <div className="space-y-4 tab-content-enter" key="log">
            {/* Add Entry Form */}
            <AddEntryForm />

            {/* Data Table */}
            <DataTable />
          </div>
        );

      case 'compare':
        return (
          <div className="space-y-4 tab-content-enter" key="compare">
            <BenchmarkComparison />
          </div>
        );

      case 'more':
        return (
          <div className="space-y-4 tab-content-enter" key="more">
            {/* Quick Stats Summary */}
            <QuickStatsSummary />

            {/* Capital Management */}
            <MoreMenuButton
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Capital Management"
              sublabel="Add or withdraw capital"
              color="blue"
              onClick={toggleCapitalFlow}
            />

            {/* Target Return */}
            <TargetTracker />

            {/* File Operations */}
            <FileOperations />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <Header />
      <ErrorBanner />

      {/* ── Desktop Layout ── */}
      <main className="hidden lg:block max-w-[1600px] mx-auto px-6 lg:px-8 py-6 space-y-6">
        {/* Action bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <ActionBar onOpenCapitalFlow={toggleCapitalFlow} />
        </div>

        {/* Metrics Grid */}
        <MetricsCards />

        {/* Target Tracker */}
        <TargetTracker />

        {/* Chart section */}
        <div className="bg-[#1a2235]/80 border border-[#2a3548] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-[#e2e8f0] uppercase tracking-wider flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              Performance
            </h2>
            <ChartTypeSelector />
          </div>
          <PortfolioChart />
        </div>

        {/* Time filters */}
        <TimeFilterBar />

        {/* Benchmark comparison */}
        <BenchmarkComparison />

        {/* Add entry form */}
        <AddEntryForm />

        {/* Data table */}
        <DataTable />
      </main>

      {/* ── Mobile Layout ── */}
      <main className="lg:hidden px-4 py-3">
        {renderMobileContent()}
      </main>

      {/* ── Mobile: FAB for quick add ── */}
      {activeMobileTab !== 'log' && activeMobileTab !== 'more' && (
        <div className="lg:hidden">
          {/* Quick Actions Menu */}
          {quickActionsOpen && (
            <div className="quick-actions-menu">
              <div className="quick-action-item">
                <span className="quick-action-label">Add P&L Entry</span>
                <button
                  onClick={toggleMobileAdd}
                  className="quick-action-btn bg-gradient-to-br from-emerald-500 to-emerald-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="quick-action-item">
                <span className="quick-action-label">Capital Flow</span>
                <button
                  onClick={toggleCapitalFlow}
                  className="quick-action-btn bg-gradient-to-br from-blue-500 to-blue-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* FAB Button */}
          <button
            onClick={toggleQuickActions}
            className={`fab fab-pulse ${quickActionsOpen ? '!rounded-xl !bg-gradient-to-br !from-red-500 !to-red-600' : ''}`}
            style={{
              transform: quickActionsOpen ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {mobileAddOpen && (
        <div className="modal-overlay" onClick={() => setMobileAddOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-[#2a3548] rounded-full" />
            </div>
            <div className="p-4">
              <AddEntryForm isOpen={mobileAddOpen} onClose={() => setMobileAddOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <CapitalFlowModal isOpen={capitalFlowOpen} onClose={() => setCapitalFlowOpen(false)} />

      {/* Mobile Bottom Bar */}
      <MobileActionBar />
    </div>
  );
}

/* ── Quick Stats Summary (More tab) ── */
function QuickStatsSummary() {
  const metrics = usePortfolioStore((s) => s.metrics);
  const { formatCurrencyFull, formatPercent } = (() => {
    const fmt = (v: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
    const pct = (v: number) => {
      const p = v * 100;
      return `${p > 0 ? '+' : ''}${p.toFixed(2)}%`;
    };
    return { formatCurrencyFull: fmt, formatPercent: pct };
  })();

  return (
    <div className="card-glass rounded-2xl p-4 animate-fade-in">
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        Advanced Stats
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <StatItem label="Sharpe Ratio" value={metrics.sharpeRatio.toFixed(2)} good={metrics.sharpeRatio >= 1} />
        <StatItem label="Sortino Ratio" value={metrics.sortinoRatio.toFixed(2)} good={metrics.sortinoRatio >= 1} />
        <StatItem label="Calmar Ratio" value={metrics.calmarRatio.toFixed(2)} good={metrics.calmarRatio >= 1} />
        <StatItem label="Profit Factor" value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)} good={metrics.profitFactor >= 1.5} />
        <StatItem label="Recovery Factor" value={metrics.recoveryFactor.toFixed(2)} good={metrics.recoveryFactor >= 1} />
        <StatItem label="Expectancy" value={formatCurrencyFull(metrics.expectancy)} good={metrics.expectancy > 0} />
        <StatItem label="Avg Win" value={formatCurrencyFull(metrics.avgWin)} good />
        <StatItem label="Avg Loss" value={formatCurrencyFull(metrics.avgLoss)} good={false} />
        <StatItem label="Best Day" value={formatCurrencyFull(metrics.bestDay)} good />
        <StatItem label="Worst Day" value={formatCurrencyFull(metrics.worstDay)} good={false} />
        <StatItem label="Volatility" value={formatPercent(metrics.volatility)} />
        <StatItem label="CAGR" value={formatPercent(metrics.cagr)} good={metrics.cagr > 0} />
      </div>
    </div>
  );
}

function StatItem({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="bg-[#0a0e17]/80 rounded-xl p-3 border border-[#1e293b]/50">
      <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-bold font-[JetBrains_Mono] ${
        good === undefined ? 'text-[#f1f5f9]' : good ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {value}
      </p>
    </div>
  );
}

/* ── More Menu Button ── */
function MoreMenuButton({
  icon,
  label,
  sublabel,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  onClick: () => void;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className="w-full card-glass rounded-2xl p-4 flex items-center gap-4 touch-active animate-fade-in text-left"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${style}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#f1f5f9]">{label}</p>
        <p className="text-[11px] text-[#64748b]">{sublabel}</p>
      </div>
      <svg className="w-5 h-5 text-[#4a5568]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

/* ── File Operations (More tab) ── */
function FileOperations() {
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
    <div className="card-glass rounded-2xl p-4 space-y-3 animate-fade-in">
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        File Operations
      </h3>

      <button
        onClick={savePortfolio}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 touch-active"
      >
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="text-sm font-medium text-emerald-400">Save Portfolio</span>
        {hasUnsavedChanges && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-auto" />
        )}
      </button>

      <button
        onClick={loadPortfolio}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0a0e17] border border-[#1e293b] touch-active"
      >
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L13 8m4-4v12" />
        </svg>
        <span className="text-sm font-medium text-[#f1f5f9]">Load Portfolio (JSON)</span>
      </button>

      {entries.length > 0 && (
        <button
          onClick={exportCSV}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0a0e17] border border-[#1e293b] touch-active"
        >
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium text-[#94a3b8]">Export CSV</span>
        </button>
      )}

      <button
        onClick={importCSV}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0a0e17] border border-[#1e293b] touch-active"
      >
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-medium text-[#94a3b8]">Import CSV</span>
      </button>

      <div className="pt-2 border-t border-[#1e293b]/50">
        <button
          onClick={() => {
            if (window.confirm('Reset portfolio? All unsaved changes will be lost.')) {
              resetPortfolio();
            }
          }}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 touch-active"
        >
          <svg className="w-5 h-5 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium text-red-400/60">Reset Portfolio</span>
        </button>
      </div>
    </div>
  );
}
