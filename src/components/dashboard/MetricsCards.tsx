import { useMemo } from 'react';
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
  color?: 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'neutral';
}

function MetricCard({ label, value, subValue, color = 'neutral' }: MetricCardProps) {
  const colorMap = {
    green: 'text-emerald-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    neutral: 'text-[#e2e8f0]',
  };

  const accentMap = {
    green: 'bg-emerald-500/10 border-emerald-500/20',
    red: 'bg-red-500/10 border-red-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    neutral: 'bg-[#1a2235] border-[#2a3548]',
  };

  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 card-glow transition-smooth ${accentMap[color]}`}
    >
      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-[#64748b] mb-1">
        {label}
      </p>
      <p className={`text-base sm:text-xl font-semibold ${colorMap[color]} truncate`}>
        {value}
      </p>
      {subValue && (
        <p className="text-[10px] sm:text-xs text-[#64748b] mt-0.5 truncate">{subValue}</p>
      )}
    </div>
  );
}

export default function MetricsCards() {
  const metrics = usePortfolioStore((s) => s.metrics);
  const initialCapital = usePortfolioStore((s) => s.initialCapital);

  const cards: MetricCardProps[] = useMemo(() => {
    const pnlColor: MetricCardProps['color'] = metrics.totalGainLoss >= 0 ? 'green' : 'red';
    const dayColor: MetricCardProps['color'] = metrics.oneDayChange >= 0 ? 'green' : 'red';
    const avgColor: MetricCardProps['color'] = metrics.avgDailyReturn >= 0 ? 'green' : 'red';

    return [
      {
        label: 'Portfolio Value',
        value: formatCurrencyFull(metrics.currentEquity),
        subValue: `Initial: ${formatCurrencyFull(initialCapital)}`,
        color: 'blue',
      },
      {
        label: 'Total P&L',
        value: formatCurrency(metrics.totalGainLoss),
        subValue: formatPercent(metrics.percentReturn),
        color: pnlColor,
      },
      {
        label: '1-Day Change',
        value: formatCurrency(metrics.oneDayChange),
        subValue: formatPercent(metrics.oneDayChangePct),
        color: dayColor,
      },
      {
        label: 'Win Rate',
        value: `${(metrics.winRate * 100).toFixed(1)}%`,
        subValue: `${metrics.winningDays}W / ${metrics.losingDays}L`,
        color: 'amber',
      },
      {
        label: 'Max Drawdown',
        value: formatPercent(metrics.maxDrawdown),
        color: 'red',
      },
      {
        label: 'CAGR',
        value: formatPercent(metrics.cagr),
        color: 'purple',
      },
      {
        label: 'Volatility',
        value: formatPercent(metrics.volatility),
        subValue: 'Annualised',
        color: 'neutral',
      },
      {
        label: 'Avg Daily Return',
        value: formatPercent(metrics.avgDailyReturn),
        color: avgColor,
      },
      {
        label: 'Best Day',
        value: formatCurrency(metrics.bestDay),
        color: 'green',
      },
      {
        label: 'Worst Day',
        value: formatCurrency(metrics.worstDay),
        color: 'red',
      },
    ];
  }, [metrics, initialCapital]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}

