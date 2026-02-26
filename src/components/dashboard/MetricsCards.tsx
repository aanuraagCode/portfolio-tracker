import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { usePortfolioStore } from '../../store/portfolioStore';
import {
  formatCurrency,
  formatPercent,
  formatCurrencyFull,
} from '../../utils/calculations';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  color: 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'cyan' | 'neutral';
  icon: React.ReactNode;
  index: number;
}

const colorStyles: Record<
  MetricCardProps['color'],
  { bg: string; border: string; text: string; iconBg: string; cardClass: string }
> = {
  green: {
    bg: 'bg-emerald-500/[0.06]',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    cardClass: 'metric-card-green',
  },
  red: {
    bg: 'bg-red-500/[0.06]',
    border: 'border-red-500/20',
    text: 'text-red-400',
    iconBg: 'bg-red-500/15',
    cardClass: 'metric-card-red',
  },
  blue: {
    bg: 'bg-blue-500/[0.06]',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
    cardClass: 'metric-card-blue',
  },
  amber: {
    bg: 'bg-amber-500/[0.06]',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/15',
    cardClass: 'metric-card-amber',
  },
  purple: {
    bg: 'bg-purple-500/[0.06]',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/15',
    cardClass: 'metric-card-purple',
  },
  cyan: {
    bg: 'bg-cyan-500/[0.06]',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15',
    cardClass: 'metric-card-cyan',
  },
  neutral: {
    bg: 'bg-slate-500/[0.06]',
    border: 'border-slate-500/20',
    text: 'text-slate-300',
    iconBg: 'bg-slate-500/15',
    cardClass: 'metric-card-neutral',
  },
};

function MetricCard({ label, value, subValue, color, icon, index }: MetricCardProps) {
  const styles = colorStyles[color];
  return (
    <div className={`metric-card ${styles.cardClass} animate-fade-in stagger-${Math.min(index + 1, 10)}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-xl ${styles.iconBg} ${styles.border} border flex items-center justify-center ${styles.text}`}>
          {icon}
        </div>
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#64748b] leading-tight">
          {label}
        </p>
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${styles.text} truncate font-[JetBrains_Mono] leading-tight`}>
        {value}
      </p>
      {subValue && (
        <p className="text-[11px] sm:text-xs text-[#64748b] mt-1.5 truncate font-[JetBrains_Mono]">{subValue}</p>
      )}
    </div>
  );
}

// ── SVG Icons ──

const icons = {
  portfolio: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  pnl: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  day: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  winrate: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  drawdown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  sharpe: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  streak: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  profit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  volatility: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 4 4 5-5M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  cagr: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  ),
};

export default function MetricsCards() {
  const metrics = usePortfolioStore((s) => s.metrics);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const cards: Omit<MetricCardProps, 'index'>[] = useMemo(() => {
    const pnlColor: MetricCardProps['color'] = metrics.totalGainLoss >= 0 ? 'green' : 'red';
    const dayColor: MetricCardProps['color'] = metrics.oneDayChange >= 0 ? 'green' : 'red';
    const streakColor: MetricCardProps['color'] = metrics.currentStreak >= 0 ? 'green' : 'red';

    return [
      {
        label: 'Portfolio Value',
        value: formatCurrencyFull(metrics.currentEquity),
        subValue: `Invested: ${formatCurrencyFull(metrics.investedCapital)}`,
        color: 'blue',
        icon: icons.portfolio,
      },
      {
        label: 'Total P&L',
        value: formatCurrency(metrics.totalGainLoss),
        subValue: `TWRR: ${formatPercent(metrics.percentReturn)}`,
        color: pnlColor,
        icon: icons.pnl,
      },
      {
        label: "Today's P&L",
        value: formatCurrency(metrics.oneDayChange),
        subValue: formatPercent(metrics.oneDayChangePct),
        color: dayColor,
        icon: icons.day,
      },
      {
        label: 'Win Rate',
        value: `${(metrics.winRate * 100).toFixed(1)}%`,
        subValue: `${metrics.winningDays}W / ${metrics.losingDays}L`,
        color: 'amber',
        icon: icons.winrate,
      },
      {
        label: 'Max Drawdown',
        value: formatPercent(metrics.maxDrawdown),
        subValue: 'From peak',
        color: 'red',
        icon: icons.drawdown,
      },
      {
        label: 'Sharpe Ratio',
        value: metrics.sharpeRatio.toFixed(2),
        subValue: `Sortino: ${metrics.sortinoRatio.toFixed(2)}`,
        color: metrics.sharpeRatio >= 1 ? 'green' : metrics.sharpeRatio >= 0 ? 'amber' : 'red',
        icon: icons.sharpe,
      },
      {
        label: 'Profit Factor',
        value: metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2),
        subValue: `Avg Win: ${formatCurrency(metrics.avgWin)}`,
        color: metrics.profitFactor >= 1.5 ? 'green' : 'amber',
        icon: icons.profit,
      },
      {
        label: 'Streak',
        value: metrics.currentStreak > 0
          ? `🔥 ${metrics.currentStreak}W`
          : metrics.currentStreak < 0
            ? `❄️ ${Math.abs(metrics.currentStreak)}L`
            : '—',
        subValue: `Best: ${metrics.maxConsecutiveWins}W / Worst: ${metrics.maxConsecutiveLosses}L`,
        color: streakColor,
        icon: icons.streak,
      },
      {
        label: 'CAGR',
        value: formatPercent(metrics.cagr),
        subValue: `${metrics.totalTradingDays} trading days`,
        color: 'purple',
        icon: icons.cagr,
      },
      {
        label: 'Volatility',
        value: formatPercent(metrics.volatility),
        subValue: 'Annualised',
        color: 'neutral',
        icon: icons.volatility,
      },
    ];
  }, [metrics]);

  // Track scroll position for pagination dots
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollLeft = el.scrollLeft;
    const children = el.children;
    if (children.length === 0) return;

    // Find the card closest to the left edge
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const dist = Math.abs(child.offsetLeft - scrollLeft - 16);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    setActiveIdx(closest);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to specific card
  const scrollToCard = useCallback((idx: number) => {
    if (!scrollRef.current) return;
    const children = scrollRef.current.children;
    if (idx >= children.length) return;
    const child = children[idx] as HTMLElement;
    scrollRef.current.scrollTo({
      left: child.offsetLeft - 16,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div>
      {/* Mobile: Horizontal swipeable cards */}
      <div className="lg:hidden">
        <div ref={scrollRef} className="swiper-cards">
          {cards.map((card, i) => (
            <div key={card.label} className="swiper-card">
              <MetricCard {...card} index={i} />
            </div>
          ))}
        </div>
        {/* Pagination dots */}
        <div className="dot-indicator mt-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              className={`dot ${i === activeIdx ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden lg:grid grid-cols-5 gap-3">
        {cards.map((card, i) => (
          <MetricCard key={card.label} {...card} index={i} />
        ))}
      </div>
    </div>
  );
}
