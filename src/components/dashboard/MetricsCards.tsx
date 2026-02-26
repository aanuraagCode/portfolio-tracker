import { useMemo } from 'react';
import { usePortfolioStore } from '../../store/portfolioStore';
import {
  formatCurrency,
  formatPercent,
  formatCurrencyFull,
} from '../../utils/calculations';

type MetricColor = 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'cyan' | 'neutral';

interface MetricItem {
  label: string;
  value: string;
  subValue?: string;
  color: MetricColor;
  icon: React.ReactNode;
}

const colorMap: Record<MetricColor, { text: string; iconBg: string }> = {
  green: { text: 'text-emerald-400', iconBg: 'bg-emerald-500/15 text-emerald-400' },
  red: { text: 'text-red-400', iconBg: 'bg-red-500/15 text-red-400' },
  blue: { text: 'text-blue-400', iconBg: 'bg-blue-500/15 text-blue-400' },
  amber: { text: 'text-amber-400', iconBg: 'bg-amber-500/15 text-amber-400' },
  purple: { text: 'text-purple-400', iconBg: 'bg-purple-500/15 text-purple-400' },
  cyan: { text: 'text-cyan-400', iconBg: 'bg-cyan-500/15 text-cyan-400' },
  neutral: { text: 'text-slate-300', iconBg: 'bg-slate-500/15 text-slate-300' },
};

const icons = {
  portfolio: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  pnl: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  day: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  winrate: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  drawdown: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
  sharpe: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  streak: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  profit: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  volatility: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 4 4 5-5M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  cagr: <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
};

/* ── List-style row for mobile (like "Coins you're tracking") ── */
function MetricRow({ item }: { item: MetricItem }) {
  const c = colorMap[item.color];
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#060a13] border border-[#1e293b]/40 active:scale-[0.98] transition-transform duration-150">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#94a3b8]">{item.label}</p>
        {item.subValue && <p className="text-[10px] text-[#4a5568] font-[JetBrains_Mono]">{item.subValue}</p>}
      </div>
      <p className={`text-sm font-bold font-[JetBrains_Mono] ${c.text} text-right flex-shrink-0`}>{item.value}</p>
    </div>
  );
}

/* ── Desktop card ── */
function DesktopMetricCard({ item, index }: { item: MetricItem; index: number }) {
  const c = colorMap[item.color];
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#1e293b]/50 bg-[#0c1220]/80 p-4 transition-all duration-200 hover:border-[#2a3548] animate-fade-in stagger-${Math.min(index + 1, 10)}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center`}>{item.icon}</div>
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#64748b]">{item.label}</p>
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${c.text} truncate font-[JetBrains_Mono] leading-tight`}>{item.value}</p>
      {item.subValue && <p className="text-[11px] text-[#64748b] mt-1.5 truncate font-[JetBrains_Mono]">{item.subValue}</p>}
    </div>
  );
}

export default function MetricsCards() {
  const metrics = usePortfolioStore((s) => s.metrics);

  const items: MetricItem[] = useMemo(() => {
    const pnlColor: MetricColor = metrics.totalGainLoss >= 0 ? 'green' : 'red';
    const dayColor: MetricColor = metrics.oneDayChange >= 0 ? 'green' : 'red';
    const streakColor: MetricColor = metrics.currentStreak >= 0 ? 'green' : 'red';

    return [
      { label: 'Portfolio Value', value: formatCurrencyFull(metrics.currentEquity), subValue: `Invested: ${formatCurrencyFull(metrics.investedCapital)}`, color: 'blue', icon: icons.portfolio },
      { label: 'Total P&L', value: formatCurrency(metrics.totalGainLoss), subValue: `TWRR: ${formatPercent(metrics.percentReturn)}`, color: pnlColor, icon: icons.pnl },
      { label: "Today's P&L", value: formatCurrency(metrics.oneDayChange), subValue: formatPercent(metrics.oneDayChangePct), color: dayColor, icon: icons.day },
      { label: 'Win Rate', value: `${(metrics.winRate * 100).toFixed(1)}%`, subValue: `${metrics.winningDays}W / ${metrics.losingDays}L`, color: 'amber', icon: icons.winrate },
      { label: 'Max Drawdown', value: formatPercent(metrics.maxDrawdown), subValue: 'From peak', color: 'red', icon: icons.drawdown },
      { label: 'Sharpe Ratio', value: metrics.sharpeRatio.toFixed(2), subValue: `Sortino: ${metrics.sortinoRatio.toFixed(2)}`, color: metrics.sharpeRatio >= 1 ? 'green' : metrics.sharpeRatio >= 0 ? 'amber' : 'red', icon: icons.sharpe },
      { label: 'Profit Factor', value: metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2), subValue: `Avg Win: ${formatCurrency(metrics.avgWin)}`, color: metrics.profitFactor >= 1.5 ? 'green' : 'amber', icon: icons.profit },
      { label: 'Streak', value: metrics.currentStreak > 0 ? `${metrics.currentStreak}W` : metrics.currentStreak < 0 ? `${Math.abs(metrics.currentStreak)}L` : '—', subValue: `Best: ${metrics.maxConsecutiveWins}W / Worst: ${metrics.maxConsecutiveLosses}L`, color: streakColor, icon: icons.streak },
      { label: 'CAGR', value: formatPercent(metrics.cagr), subValue: `${metrics.totalTradingDays} trading days`, color: 'purple', icon: icons.cagr },
      { label: 'Volatility', value: formatPercent(metrics.volatility), subValue: 'Annualised', color: 'neutral', icon: icons.volatility },
    ];
  }, [metrics]);

  return (
    <div>
      {/* Mobile: List-style cards */}
      <div className="lg:hidden rounded-2xl border border-[#1e293b]/50 bg-[#0c1220]/80 p-3 space-y-2 animate-fade-in">
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider px-1 mb-1">Your Stats</h3>
        {items.map((item) => (
          <MetricRow key={item.label} item={item} />
        ))}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden lg:grid grid-cols-5 gap-3">
        {items.map((item, i) => (
          <DesktopMetricCard key={item.label} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
