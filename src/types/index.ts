/** A single daily P&L entry */
export interface PortfolioEntry {
  id: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Daily profit/loss value */
  pnl: number;
  /** Optional note for the day */
  note: string;
}

/** The persisted portfolio JSON structure */
export interface PortfolioData {
  initialCapital: number;
  entries: PortfolioEntry[];
}

/** A single point on the equity curve */
export interface EquityPoint {
  date: string;
  equity: number;
  dailyReturn: number;
  cumulativeReturn: number;
  drawdown: number;
  pnl: number;
}

/** Aggregated portfolio performance metrics */
export interface PortfolioMetrics {
  totalGainLoss: number;
  percentReturn: number;
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
}

/** Available chart types */
export type ChartType = 'line' | 'area' | 'bar' | 'cumulative' | 'drawdown';

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

