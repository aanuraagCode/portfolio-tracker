/** A single daily P&L entry */
export interface PortfolioEntry {
  id: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Daily profit/loss value in INR */
  pnl: number;
  /** Optional note for the day */
  note: string;
}

/** A capital flow event (deposit or withdrawal) */
export interface CapitalFlow {
  id: string;
  date: string;
  /** Positive = deposit, Negative = withdrawal */
  amount: number;
  type: 'deposit' | 'withdrawal';
  note: string;
}

/** Benchmark entry for comparison */
export interface BenchmarkEntry {
  date: string;
  value: number;
}

/** A benchmark index/stock for comparison */
export interface Benchmark {
  id: string;
  name: string;
  color: string;
  entries: BenchmarkEntry[];
}

/** The persisted portfolio JSON structure */
export interface PortfolioData {
  initialCapital: number;
  entries: PortfolioEntry[];
  capitalFlows: CapitalFlow[];
  targetReturn: number | null; // annual target return %
  benchmarks: Benchmark[];
}

/** A single point on the equity curve */
export interface EquityPoint {
  date: string;
  equity: number;
  dailyReturn: number;
  cumulativeReturn: number; // TWRR
  drawdown: number;
  pnl: number;
  investedCapital: number;
}

/** Monthly return data for heatmap */
export interface MonthlyReturn {
  year: number;
  month: number; // 0-11
  monthLabel: string;
  returnPct: number;
  pnl: number;
}

/** Aggregated portfolio performance metrics */
export interface PortfolioMetrics {
  totalGainLoss: number;
  percentReturn: number; // TWRR
  oneDayChange: number;
  oneDayChangePct: number;
  winRate: number;
  avgDailyReturn: number;
  bestDay: number;
  worstDay: number;
  maxDrawdown: number;
  volatility: number;
  cagr: number;
  totalTradingDays: number;
  winningDays: number;
  losingDays: number;
  currentEquity: number;
  investedCapital: number;
  sharpeRatio: number;
  sortinoRatio: number;
  profitFactor: number;
  calmarRatio: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  currentStreak: number; // +ve for winning streak, -ve for losing
  recoveryFactor: number;
  totalCapitalAdded: number;
  totalCapitalWithdrawn: number;
}

/** Available chart types */
export type ChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'cumulative'
  | 'drawdown'
  | 'monthly'
  | 'distribution'
  | 'rolling';

/** Available time filter presets */
export type TimeFilter =
  | '1D' | '7D' | '15D'
  | '1M' | '2M' | '3M' | '4M' | '5M' | '6M'
  | '7M' | '8M' | '9M' | '10M' | '11M'
  | '1Y' | '2Y' | '3Y' | '4Y' | '5Y'
  | 'ALL';

/** Time filter definition with label and days */
export interface TimeFilterOption {
  label: TimeFilter;
  days: number | null; // null = ALL
}

/** Mobile navigation tab */
export type MobileTab = 'dashboard' | 'charts' | 'log' | 'compare' | 'more';
