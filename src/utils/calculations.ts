/**
 * Portfolio calculation utilities.
 *
 * All functions are pure — no side-effects, no state access.
 * They accept sorted entries + initial capital and return derived data.
 */

import {
  differenceInCalendarDays,
  parseISO,
} from 'date-fns';
import type { PortfolioEntry, EquityPoint, PortfolioMetrics } from '../types';

// ────────────────────────────────────────────
// Equity Curve
// ────────────────────────────────────────────

/**
 * Build the full equity curve from sorted entries.
 *
 * Each point tracks:
 *  - equity          running portfolio value
 *  - dailyReturn     % change from previous day
 *  - cumulativeReturn % change from initial capital
 *  - drawdown        % decline from the running peak
 *  - pnl             raw daily P&L
 */
export function buildEquityCurve(
  entries: PortfolioEntry[],
  initialCapital: number,
): EquityPoint[] {
  if (entries.length === 0 || initialCapital <= 0) return [];

  let equity = initialCapital;
  let peak = initialCapital;
  const curve: EquityPoint[] = [];

  for (let i = 0; i < entries.length; i++) {
    const prevEquity = equity;
    equity += entries[i].pnl;

    // Update running peak (high-water mark)
    if (equity > peak) peak = equity;

    // Daily simple return: (Eq_t - Eq_{t-1}) / Eq_{t-1}
    const dailyReturn = prevEquity !== 0 ? (equity - prevEquity) / prevEquity : 0;

    // Cumulative return from inception
    const cumulativeReturn = (equity - initialCapital) / initialCapital;

    // Drawdown from peak: (Eq_t - peak) / peak  (always ≤ 0)
    const drawdown = peak !== 0 ? (equity - peak) / peak : 0;

    curve.push({
      date: entries[i].date,
      equity,
      dailyReturn,
      cumulativeReturn,
      drawdown,
      pnl: entries[i].pnl,
    });
  }

  return curve;
}

// ────────────────────────────────────────────
// Portfolio Metrics
// ────────────────────────────────────────────

/**
 * Compute all aggregate performance metrics from an equity curve.
 */
export function computeMetrics(
  curve: EquityPoint[],
  initialCapital: number,
): PortfolioMetrics {
  const empty: PortfolioMetrics = {
    totalGainLoss: 0,
    percentReturn: 0,
    oneDayChange: 0,
    oneDayChangePct: 0,
    winRate: 0,
    avgDailyReturn: 0,
    bestDay: 0,
    worstDay: 0,
    maxDrawdown: 0,
    volatility: 0,
    cagr: 0,
    totalTradingDays: 0,
    winningDays: 0,
    losingDays: 0,
    currentEquity: initialCapital,
  };

  if (curve.length === 0) return empty;

  const n = curve.length;
  const lastPoint = curve[n - 1];
  const currentEquity = lastPoint.equity;
  const totalGainLoss = currentEquity - initialCapital;
  const percentReturn = initialCapital !== 0 ? totalGainLoss / initialCapital : 0;

  // 1-day change (most recent entry)
  const oneDayChange = lastPoint.pnl;
  const prevEquity = n >= 2 ? curve[n - 2].equity : initialCapital;
  const oneDayChangePct = prevEquity !== 0 ? oneDayChange / prevEquity : 0;

  // Win / loss counts
  const winningDays = curve.filter((p) => p.pnl > 0).length;
  const losingDays = curve.filter((p) => p.pnl < 0).length;
  const winRate = n > 0 ? winningDays / n : 0;

  // Average daily return (arithmetic mean of daily % returns)
  const avgDailyReturn = curve.reduce((s, p) => s + p.dailyReturn, 0) / n;

  // Best / worst day (by raw P&L)
  const pnls = curve.map((p) => p.pnl);
  const bestDay = Math.max(...pnls);
  const worstDay = Math.min(...pnls);

  // Max drawdown (most negative drawdown value)
  const maxDrawdown = Math.min(...curve.map((p) => p.drawdown));

  // Volatility: annualised standard deviation of daily returns
  // σ_annual = σ_daily × √252
  const dailyReturns = curve.map((p) => p.dailyReturn);
  const meanReturn = avgDailyReturn;
  const variance =
    dailyReturns.reduce((s, r) => s + (r - meanReturn) ** 2, 0) / (n > 1 ? n - 1 : 1);
  const dailyStdDev = Math.sqrt(variance);
  const volatility = dailyStdDev * Math.sqrt(252);

  // CAGR: Compound Annual Growth Rate
  // CAGR = (V_final / V_initial)^(365/days) - 1
  const firstDate = parseISO(curve[0].date);
  const lastDate = parseISO(curve[n - 1].date);
  const totalDays = differenceInCalendarDays(lastDate, firstDate);
  let cagr = 0;
  if (totalDays > 0 && initialCapital > 0 && currentEquity > 0) {
    cagr = Math.pow(currentEquity / initialCapital, 365 / totalDays) - 1;
  }

  return {
    totalGainLoss,
    percentReturn,
    oneDayChange,
    oneDayChangePct,
    winRate,
    avgDailyReturn,
    bestDay,
    worstDay,
    maxDrawdown,
    volatility,
    cagr,
    totalTradingDays: n,
    winningDays,
    losingDays,
    currentEquity,
  };
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

/** Sort entries ascending by date (ISO strings compare lexicographically). */
export function sortEntriesByDate(entries: PortfolioEntry[]): PortfolioEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

/** Format a number as currency string */
export function formatCurrency(value: number): string {
  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absVal >= 1_000_000) {
    return `${sign}$${(absVal / 1_000_000).toFixed(2)}M`;
  }
  if (absVal >= 1_000) {
    return `${sign}$${(absVal / 1_000).toFixed(2)}K`;
  }
  return `${sign}$${absVal.toFixed(2)}`;
}

/** Format a decimal as a percentage string (e.g. 0.0532 → "+5.32%") */
export function formatPercent(value: number): string {
  const pct = value * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/** Format a raw currency with commas (e.g. 12345.67 → "$12,345.67") */
export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

