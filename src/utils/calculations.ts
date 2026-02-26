/**
 * Portfolio calculation utilities.
 *
 * All functions are pure — no side-effects, no state access.
 * Handles capital flows with Time-Weighted Rate of Return (TWRR).
 */

import {
  differenceInCalendarDays,
  parseISO,
  getMonth,
  getYear,
  format,
} from 'date-fns';
import type {
  PortfolioEntry,
  CapitalFlow,
  EquityPoint,
  PortfolioMetrics,
  MonthlyReturn,
} from '../types';

// ────────────────────────────────────────────
// Equity Curve with Capital Flows (TWRR)
// ────────────────────────────────────────────

/**
 * Build the equity curve accounting for capital flows.
 * Uses TWRR so deposits/withdrawals don't distort returns.
 */
export function buildEquityCurve(
  entries: PortfolioEntry[],
  initialCapital: number,
  capitalFlows: CapitalFlow[] = [],
): EquityPoint[] {
  if (entries.length === 0 || initialCapital <= 0) return [];

  // Sort capital flows by date
  const sortedFlows = [...capitalFlows].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  let flowIdx = 0;

  let equity = initialCapital;
  let investedCapital = initialCapital;
  let peak = initialCapital;
  let twrProduct = 1;
  const curve: EquityPoint[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // Apply any capital flows on or before this entry's date
    while (
      flowIdx < sortedFlows.length &&
      sortedFlows[flowIdx].date <= entry.date
    ) {
      const flow = sortedFlows[flowIdx];
      equity += flow.amount;
      investedCapital += flow.amount;
      if (equity > peak) peak = equity;
      flowIdx++;
    }

    const prevEquity = equity;
    equity += entry.pnl;

    // Daily simple return: P&L / equity-before-PnL (excludes capital flows)
    const dailyReturn = prevEquity !== 0 ? entry.pnl / prevEquity : 0;

    // TWRR: multiply sub-period returns
    twrProduct *= 1 + dailyReturn;

    // Update running peak (high-water mark)
    if (equity > peak) peak = equity;

    // Drawdown from peak
    const drawdown = peak !== 0 ? (equity - peak) / peak : 0;

    curve.push({
      date: entry.date,
      equity,
      dailyReturn,
      cumulativeReturn: twrProduct - 1, // TWRR
      drawdown,
      pnl: entry.pnl,
      investedCapital,
    });
  }

  return curve;
}

// ────────────────────────────────────────────
// Streak Calculations
// ────────────────────────────────────────────

function computeStreaks(curve: EquityPoint[]) {
  let maxWins = 0;
  let maxLosses = 0;
  let currentWins = 0;
  let currentLosses = 0;
  let currentStreak = 0;

  for (const point of curve) {
    if (point.pnl > 0) {
      currentWins++;
      currentLosses = 0;
      if (currentWins > maxWins) maxWins = currentWins;
    } else if (point.pnl < 0) {
      currentLosses++;
      currentWins = 0;
      if (currentLosses > maxLosses) maxLosses = currentLosses;
    } else {
      currentWins = 0;
      currentLosses = 0;
    }
  }

  // Current streak from the end
  if (curve.length > 0) {
    const lastPnl = curve[curve.length - 1].pnl;
    if (lastPnl > 0) {
      let streak = 0;
      for (let i = curve.length - 1; i >= 0; i--) {
        if (curve[i].pnl > 0) streak++;
        else break;
      }
      currentStreak = streak;
    } else if (lastPnl < 0) {
      let streak = 0;
      for (let i = curve.length - 1; i >= 0; i--) {
        if (curve[i].pnl < 0) streak++;
        else break;
      }
      currentStreak = -streak;
    }
  }

  return { maxWins, maxLosses, currentStreak };
}

// ────────────────────────────────────────────
// Portfolio Metrics
// ────────────────────────────────────────────

/**
 * Compute all aggregate performance metrics from an equity curve.
 * Returns are computed using TWRR (capital-flow-adjusted).
 */
export function computeMetrics(
  curve: EquityPoint[],
  initialCapital: number,
  capitalFlows: CapitalFlow[] = [],
): PortfolioMetrics {
  const totalCapitalAdded = capitalFlows
    .filter((f) => f.type === 'deposit')
    .reduce((s, f) => s + f.amount, 0);
  const totalCapitalWithdrawn = capitalFlows
    .filter((f) => f.type === 'withdrawal')
    .reduce((s, f) => s + Math.abs(f.amount), 0);

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
    investedCapital: initialCapital,
    sharpeRatio: 0,
    sortinoRatio: 0,
    profitFactor: 0,
    calmarRatio: 0,
    avgWin: 0,
    avgLoss: 0,
    expectancy: 0,
    maxConsecutiveWins: 0,
    maxConsecutiveLosses: 0,
    currentStreak: 0,
    recoveryFactor: 0,
    totalCapitalAdded,
    totalCapitalWithdrawn,
  };

  if (curve.length === 0) return empty;

  const n = curve.length;
  const lastPoint = curve[n - 1];
  const currentEquity = lastPoint.equity;
  const investedCapital = lastPoint.investedCapital;

  // Total P&L = sum of all daily P&L (not affected by capital flows)
  const totalGainLoss = curve.reduce((s, p) => s + p.pnl, 0);

  // TWRR
  const percentReturn = lastPoint.cumulativeReturn;

  // 1-day change (most recent entry)
  const oneDayChange = lastPoint.pnl;
  const prevEquity = n >= 2 ? curve[n - 2].equity : initialCapital;
  const oneDayChangePct = prevEquity !== 0 ? oneDayChange / prevEquity : 0;

  // Win / loss counts
  const winningDays = curve.filter((p) => p.pnl > 0).length;
  const losingDays = curve.filter((p) => p.pnl < 0).length;
  const winRate = n > 0 ? winningDays / n : 0;

  // Average daily return (arithmetic mean of daily % returns)
  const dailyReturns = curve.map((p) => p.dailyReturn);
  const avgDailyReturn = dailyReturns.reduce((s, r) => s + r, 0) / n;

  // Best / worst day (by raw P&L)
  const pnls = curve.map((p) => p.pnl);
  const bestDay = Math.max(...pnls);
  const worstDay = Math.min(...pnls);

  // Max drawdown (most negative drawdown value)
  const maxDrawdown = Math.min(...curve.map((p) => p.drawdown));

  // Volatility: annualised σ
  const meanReturn = avgDailyReturn;
  const variance =
    dailyReturns.reduce((s, r) => s + (r - meanReturn) ** 2, 0) /
    (n > 1 ? n - 1 : 1);
  const dailyStdDev = Math.sqrt(variance);
  const volatility = dailyStdDev * Math.sqrt(252);

  // CAGR
  const firstDate = parseISO(curve[0].date);
  const lastDate = parseISO(curve[n - 1].date);
  const totalDays = differenceInCalendarDays(lastDate, firstDate);
  let cagr = 0;
  if (totalDays > 0 && initialCapital > 0 && currentEquity > 0) {
    // Using TWRR for CAGR calculation
    cagr = Math.pow(1 + percentReturn, 365 / totalDays) - 1;
  }

  // ── Advanced Trader Metrics ──

  // Sharpe Ratio (annualised, risk-free rate assumed 0 for simplicity)
  const sharpeRatio =
    dailyStdDev !== 0
      ? (avgDailyReturn / dailyStdDev) * Math.sqrt(252)
      : 0;

  // Sortino Ratio (downside deviation only)
  const downsideReturns = dailyReturns.filter((r) => r < 0);
  const downsideVariance =
    downsideReturns.length > 0
      ? downsideReturns.reduce((s, r) => s + r ** 2, 0) / downsideReturns.length
      : 0;
  const downsideStdDev = Math.sqrt(downsideVariance);
  const sortinoRatio =
    downsideStdDev !== 0
      ? (avgDailyReturn / downsideStdDev) * Math.sqrt(252)
      : 0;

  // Profit Factor = gross profit / gross loss
  const grossProfit = pnls.filter((p) => p > 0).reduce((s, p) => s + p, 0);
  const grossLoss = Math.abs(
    pnls.filter((p) => p < 0).reduce((s, p) => s + p, 0),
  );
  const profitFactor = grossLoss !== 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Calmar Ratio = CAGR / |Max Drawdown|
  const calmarRatio =
    maxDrawdown !== 0 ? cagr / Math.abs(maxDrawdown) : 0;

  // Average Win / Loss
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);
  const avgWin = wins.length > 0 ? wins.reduce((s, p) => s + p, 0) / wins.length : 0;
  const avgLoss =
    losses.length > 0 ? losses.reduce((s, p) => s + p, 0) / losses.length : 0;

  // Expectancy = (Win% × Avg Win) + (Loss% × Avg Loss)
  const winPct = n > 0 ? winningDays / n : 0;
  const lossPct = n > 0 ? losingDays / n : 0;
  const expectancy = winPct * avgWin + lossPct * avgLoss;

  // Streaks
  const { maxWins, maxLosses, currentStreak } = computeStreaks(curve);

  // Recovery Factor = Total P&L / Max Drawdown (in absolute terms)
  const maxDDAbsolute = Math.abs(maxDrawdown * (investedCapital > 0 ? investedCapital : initialCapital));
  const recoveryFactor = maxDDAbsolute !== 0 ? totalGainLoss / maxDDAbsolute : 0;

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
    investedCapital,
    sharpeRatio,
    sortinoRatio,
    profitFactor,
    calmarRatio,
    avgWin,
    avgLoss,
    expectancy,
    maxConsecutiveWins: maxWins,
    maxConsecutiveLosses: maxLosses,
    currentStreak,
    recoveryFactor,
    totalCapitalAdded,
    totalCapitalWithdrawn,
  };
}

// ────────────────────────────────────────────
// Monthly Returns
// ────────────────────────────────────────────

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Aggregate daily P&L into monthly return buckets.
 */
export function computeMonthlyReturns(
  curve: EquityPoint[],
): MonthlyReturn[] {
  if (curve.length === 0) return [];

  const monthMap = new Map<string, { pnl: number; startEquity: number }>();

  for (let i = 0; i < curve.length; i++) {
    const d = parseISO(curve[i].date);
    const key = `${getYear(d)}-${getMonth(d)}`;
    const existing = monthMap.get(key);
    if (existing) {
      existing.pnl += curve[i].pnl;
    } else {
      // Start equity for the month is the equity BEFORE this entry's P&L
      const startEquity = curve[i].equity - curve[i].pnl;
      monthMap.set(key, { pnl: curve[i].pnl, startEquity });
    }
  }

  const result: MonthlyReturn[] = [];
  for (const [key, data] of monthMap) {
    const [yearStr, monthStr] = key.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const returnPct = data.startEquity !== 0 ? data.pnl / data.startEquity : 0;
    result.push({
      year,
      month,
      monthLabel: MONTH_LABELS[month],
      returnPct,
      pnl: data.pnl,
    });
  }

  return result.sort((a, b) => a.year - b.year || a.month - b.month);
}

/**
 * Compute rolling Sharpe ratio (annualised) over a given window.
 */
export function computeRollingSharpe(
  curve: EquityPoint[],
  window: number = 20,
): { date: string; sharpe: number }[] {
  if (curve.length < window) return [];

  const result: { date: string; sharpe: number }[] = [];

  for (let i = window - 1; i < curve.length; i++) {
    const slice = curve.slice(i - window + 1, i + 1);
    const returns = slice.map((p) => p.dailyReturn);
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance =
      returns.reduce((s, r) => s + (r - mean) ** 2, 0) /
      (returns.length > 1 ? returns.length - 1 : 1);
    const std = Math.sqrt(variance);
    const sharpe = std !== 0 ? (mean / std) * Math.sqrt(252) : 0;
    result.push({ date: curve[i].date, sharpe });
  }

  return result;
}

/**
 * Build histogram bins for daily P&L distribution.
 */
export function computePnLDistribution(
  curve: EquityPoint[],
  binCount: number = 20,
): { range: string; count: number; midpoint: number }[] {
  if (curve.length === 0) return [];

  const pnls = curve.map((p) => p.pnl);
  const min = Math.min(...pnls);
  const max = Math.max(...pnls);

  if (min === max) {
    return [{ range: formatCurrency(min), count: pnls.length, midpoint: min }];
  }

  const binWidth = (max - min) / binCount;
  const bins: { range: string; count: number; midpoint: number }[] = [];

  for (let i = 0; i < binCount; i++) {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const midpoint = (lo + hi) / 2;
    const count = pnls.filter(
      (p) => (i === binCount - 1 ? p >= lo && p <= hi : p >= lo && p < hi),
    ).length;
    bins.push({
      range: `${formatCurrency(lo)}`,
      count,
      midpoint,
    });
  }

  return bins;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

/** Sort entries ascending by date */
export function sortEntriesByDate(entries: PortfolioEntry[]): PortfolioEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

/** Format a number as INR currency (compact) */
export function formatCurrency(value: number): string {
  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absVal >= 1_00_00_000) {
    return `${sign}₹${(absVal / 1_00_00_000).toFixed(2)}Cr`;
  }
  if (absVal >= 1_00_000) {
    return `${sign}₹${(absVal / 1_00_000).toFixed(2)}L`;
  }
  if (absVal >= 1_000) {
    return `${sign}₹${(absVal / 1_000).toFixed(2)}K`;
  }
  return `${sign}₹${absVal.toFixed(2)}`;
}

/** Format a decimal as a percentage string (e.g. 0.0532 → "+5.32%") */
export function formatPercent(value: number): string {
  const pct = value * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/** Format a raw currency with commas in INR format */
export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a number with Indian comma system */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format date for display */
export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}
