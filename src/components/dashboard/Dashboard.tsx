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
import {
  formatCurrencyFull,
  formatPercent,
} from '../../utils/calculations';

export default function Dashboard() {
  const { hasUnsavedChanges, isLoading, activeMobileTab, metrics } = usePortfolioStore();
  const [mobileAddOpen, setMobileAddOpen] = useState(false);
  const [capitalFlowOpen, setCapitalFlowOpen] = useState(false);

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
  }, []);

  const toggleCapitalFlow = useCallback(() => {
    setCapitalFlowOpen((v) => !v);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#94a3b8] text-sm font-medium">Loading portfolio...</p>
          <p className="text-[#4a5568] text-xs mt-1">Crunching your numbers</p>
        </div>
      </div>
    );
  }

  const pnlColor = metrics.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400';
  const pnlBadgeBg = metrics.totalGainLoss >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400';

  const renderMobileContent = () => {
    switch (activeMobileTab) {
      case 'dashboard':
        return (
          <div className="space-y-5 tab-content-enter" key="dashboard">
            {/* Hero Balance Card */}
            <div className="hero-card rounded-3xl p-5 pt-6 pb-6 text-center relative overflow-hidden">
              <div className="hero-card-glow"  />
              <p className="text-[11px] text-[#94a3b8] font-medium uppercase tracking-widest mb-2">Your portfolio balance</p>
              <p className="text-4xl font-bold text-white font-[JetBrains_Mono] mb-3 tracking-tight">
                {formatCurrencyFull(metrics.currentEquity)}
              </p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${pnlBadgeBg}`}>
                <span>{formatPercent(metrics.percentReturn)}</span>
                <span className="text-[10px] opacity-70">TWRR</span>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <QuickActionBtn
                  label="Add P&L"
                  color="from-emerald-500 to-emerald-600"
                  onClick={toggleMobileAdd}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  }
                />
                <QuickActionBtn
                  label="Capital"
                  color="from-blue-500 to-blue-600"
                  onClick={toggleCapitalFlow}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <QuickActionBtn
                  label="Save"
                  color="from-purple-500 to-purple-600"
                  onClick={() => usePortfolioStore.getState().savePortfolio()}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                />
                <QuickActionBtn
                  label="Load"
                  color="from-amber-500 to-amber-600"
                  onClick={() => usePortfolioStore.getState().loadPortfolio()}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L13 8m4-4v12" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-3 gap-2.5">
              <MiniStat label="Total P&L" value={formatCurrencyFull(metrics.totalGainLoss)} color={pnlColor} />
              <MiniStat label="Today" value={formatCurrencyFull(metrics.oneDayChange)} color={metrics.oneDayChange >= 0 ? 'text-emerald-400' : 'text-red-400'} />
              <MiniStat label="Win Rate" value={`${(metrics.winRate * 100).toFixed(1)}%`} color="text-amber-400" />
            </div>

            {/* Target Tracker */}
            <TargetTracker />

            {/* Time Filters */}
            <TimeFilterBar />

            {/* Chart Preview */}
            <div className="rounded-2xl border border-[#1e293b]/50 bg-[#0c1220]/80 p-4 space-y-3">
              <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Performance</h2>
              <PortfolioChart />
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Max DD" value={formatPercent(metrics.maxDrawdown)} color="text-red-400" />
                <MiniStat label="Sharpe" value={metrics.sharpeRatio.toFixed(2)} color={metrics.sharpeRatio >= 1 ? 'text-emerald-400' : 'text-amber-400'} />
                <MiniStat label="CAGR" value={formatPercent(metrics.cagr)} color="text-purple-400" />
              </div>
            </div>

            {/* Metrics Cards */}
            <MetricsCards />
          </div>
        );

      case 'charts':
        return (
          <div className="space-y-4 tab-content-enter" key="charts">
            <ChartTypeSelector />
            <div className="rounded-2xl border border-[#1e293b]/50 bg-[#0c1220]/80 p-4 space-y-3">
              <PortfolioChart />
            </div>
            <TimeFilterBar />
          </div>
        );

      case 'log':
        return (
          <div className="space-y-4 tab-content-enter" key="log">
            <AddEntryForm />
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
            <QuickStatsSummary />
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
            <TargetTracker />
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

      {/* Desktop Layout */}
      <main className="hidden lg:block max-w-[1600px] mx-auto px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <ActionBar onOpenCapitalFlow={toggleCapitalFlow} />
        </div>
        <MetricsCards />
        <TargetTracker />
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
        <TimeFilterBar />
        <BenchmarkComparison />
        <AddEntryForm />
        <DataTable />
      </main>

      {/* Mobile Layout */}
      <main className="lg:hidden px-4 py-3">
        {renderMobileContent()}
      </main>

      {/* Modals */}
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
      <MobileActionBar />
    </div>
  );
}

/* ── Quick Action Circle Button (like Send/Receive/Swap/Add funds) ── */
function QuickActionBtn({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 touch-active">
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg transition-transform duration-150 active:scale-90`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium text-[#94a3b8]">{label}</span>
    </button>
  );
}

/* ── Mini Stat Card (like Market Cap / Volume / Supply) ── */
function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-[#0c1220]/80 border border-[#1e293b]/50 p-3 text-center">
      <p className="text-[9px] text-[#64748b] uppercase tracking-wider mb-1 font-medium">{label}</p>
      <p className={`text-sm font-bold font-[JetBrains_Mono] ${color} truncate`}>{value}</p>
    </div>
  );
}

/* ── Quick Stats Summary (More tab) ── */
function QuickStatsSummary() {
  const metrics = usePortfolioStore((s) => s.metrics);
  const fmt = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const pct = (v: number) => {
    const p = v * 100;
    return `${p > 0 ? '+' : ''}${p.toFixed(2)}%`;
  };

  return (
    <div className="rounded-2xl border border-[#1e293b]/50 bg-[#0c1220]/80 p-4 animate-fade-in">
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Advanced Stats</h3>
      <div className="grid grid-cols-2 gap-2.5">
        <StatItem label="Sharpe Ratio" value={metrics.sharpeRatio.toFixed(2)} good={metrics.sharpeRatio >= 1} />
        <StatItem label="Sortino Ratio" value={metrics.sortinoRatio.toFixed(2)} good={metrics.sortinoRatio >= 1} />
        <StatItem label="Calmar Ratio" value={metrics.calmarRatio.toFixed(2)} good={metrics.calmarRatio >= 1} />
        <StatItem label="Profit Factor" value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)} good={metrics.profitFactor >= 1.5} />
        <StatItem label="Recovery Factor" value={metrics.recoveryFactor.toFixed(2)} good={metrics.recoveryFactor >= 1} />
        <StatItem label="Expectancy" value={fmt(metrics.expectancy)} good={metrics.expectancy > 0} />
        <StatItem label="Avg Win" value={fmt(metrics.avgWin)} good />
        <StatItem label="Avg Loss" value={fmt(metrics.avgLoss)} good={false} />
        <StatItem label="Best Day" value={fmt(metrics.bestDay)} good />
        <StatItem label="Worst Day" value={fmt(metrics.worstDay)} good={false} />
        <StatItem label="Volatility" value={pct(metrics.volatility)} />
        <StatItem label="CAGR" value={pct(metrics.cagr)} good={metrics.cagr > 0} />
      </div>
    </div>
  );
}

function StatItem({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-xl bg-[#060a13] border border-[#1e293b]/40 p-3">
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
    blue: 'bg-blue-500/15 text-blue-400',
    green: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    red: 'bg-red-500/15 text-red-400',
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-[#1e293b]/50 bg-[#0c1220]/80 p-4 flex items-center gap-4 touch-active animate-fade-in text-left active:scale-[0.98] transition-transform duration-150"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style}`}>
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
    <div className="rounded-2xl border border-[#1e293b]/50 bg-[#0c1220]/80 p-4 space-y-2.5 animate-fade-in">
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">File Operations</h3>

      <FileBtn onClick={savePortfolio} label="Save Portfolio" color="text-emerald-400" badge={hasUnsavedChanges}
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
      />
      <FileBtn onClick={loadPortfolio} label="Load Portfolio (JSON)" color="text-blue-400"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L13 8m4-4v12" /></svg>}
      />
      {entries.length > 0 && (
        <FileBtn onClick={exportCSV} label="Export CSV" color="text-amber-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
      )}
      <FileBtn onClick={importCSV} label="Import CSV" color="text-cyan-400"
        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      />
      <div className="pt-2 border-t border-[#1e293b]/30">
        <FileBtn
          onClick={() => { if (window.confirm('Reset portfolio? All unsaved changes will be lost.')) resetPortfolio(); }}
          label="Reset Portfolio" color="text-red-400/70"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
        />
      </div>
    </div>
  );
}

function FileBtn({ onClick, label, color, icon, badge }: { onClick: () => void; label: string; color: string; icon: React.ReactNode; badge?: boolean }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#060a13] border border-[#1e293b]/40 touch-active active:scale-[0.98] transition-transform duration-150">
      <span className={color}>{icon}</span>
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      {badge && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-auto" />}
    </button>
  );
}
