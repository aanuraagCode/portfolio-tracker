/**
 * Central Zustand store for the portfolio tracker.
 *
 * Holds portfolio data in memory, derived metrics, UI state.
 * Handles capital flows, target returns, and benchmark comparisons.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  PortfolioData,
  PortfolioEntry,
  CapitalFlow,
  Benchmark,
  BenchmarkEntry,
  EquityPoint,
  PortfolioMetrics,
  MonthlyReturn,
  ChartType,
  TimeFilter,
  MobileTab,
} from '../types';
import {
  buildEquityCurve,
  computeMetrics,
  computeMonthlyReturns,
  sortEntriesByDate,
} from '../utils/calculations';
import { filterEquityCurve } from '../utils/timeFilters';
import {
  loadPortfolioFile,
  savePortfolioFile,
  openFilePicker,
} from '../services/fileService';
import {
  exportEntriesToCSV,
  importEntriesFromCSV,
  openCSVFilePicker,
} from '../services/csvService';

// ────────────────────────────────────────────
// State shape
// ────────────────────────────────────────────

interface PortfolioState {
  // Data
  initialCapital: number;
  entries: PortfolioEntry[];
  capitalFlows: CapitalFlow[];
  benchmarks: Benchmark[];
  targetReturn: number | null; // annual target %
  hasPortfolio: boolean;

  // Derived (recomputed on data change)
  fullEquityCurve: EquityPoint[];
  filteredEquityCurve: EquityPoint[];
  metrics: PortfolioMetrics;
  monthlyReturns: MonthlyReturn[];

  // UI state
  selectedTimeFilter: TimeFilter;
  selectedChartType: ChartType;
  activeMobileTab: MobileTab;
  hasUnsavedChanges: boolean;
  lastSavedAt: string | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  createNewPortfolio: (initialCapital: number) => void;
  loadPortfolio: () => Promise<void>;
  savePortfolio: () => void;
  addEntry: (date: string, pnl: number, note: string) => void;
  deleteEntry: (id: string) => void;
  editEntry: (id: string, date: string, pnl: number, note: string) => void;
  setTimeFilter: (filter: TimeFilter) => void;
  setChartType: (type: ChartType) => void;
  setMobileTab: (tab: MobileTab) => void;
  clearError: () => void;
  exportCSV: () => void;
  importCSV: () => Promise<void>;
  resetPortfolio: () => void;

  // Capital flow actions
  addCapitalFlow: (date: string, amount: number, type: 'deposit' | 'withdrawal', note: string) => void;
  deleteCapitalFlow: (id: string) => void;

  // Target return actions
  setTargetReturn: (target: number | null) => void;

  // Benchmark actions
  addBenchmark: (name: string, color: string) => void;
  removeBenchmark: (id: string) => void;
  addBenchmarkEntry: (benchmarkId: string, date: string, value: number) => void;
  importBenchmarkCSV: (benchmarkId: string) => Promise<void>;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function deriveData(
  entries: PortfolioEntry[],
  initialCapital: number,
  capitalFlows: CapitalFlow[],
  timeFilter: TimeFilter,
) {
  const sorted = sortEntriesByDate(entries);
  const fullCurve = buildEquityCurve(sorted, initialCapital, capitalFlows);
  const filteredCurve = filterEquityCurve(fullCurve, timeFilter);
  const metrics = computeMetrics(filteredCurve, initialCapital, capitalFlows);
  const monthlyReturns = computeMonthlyReturns(fullCurve);
  return { sorted, fullCurve, filteredCurve, metrics, monthlyReturns };
}

const emptyMetrics: PortfolioMetrics = {
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
  currentEquity: 0,
  investedCapital: 0,
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
  totalCapitalAdded: 0,
  totalCapitalWithdrawn: 0,
};

// ────────────────────────────────────────────
// Store
// ────────────────────────────────────────────

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  // Initial state
  initialCapital: 0,
  entries: [],
  capitalFlows: [],
  benchmarks: [],
  targetReturn: null,
  hasPortfolio: false,
  fullEquityCurve: [],
  filteredEquityCurve: [],
  metrics: emptyMetrics,
  monthlyReturns: [],
  selectedTimeFilter: 'ALL',
  selectedChartType: 'area',
  activeMobileTab: 'dashboard',
  hasUnsavedChanges: false,
  lastSavedAt: null,
  error: null,
  isLoading: false,

  // ── Create new portfolio ──
  createNewPortfolio: (initialCapital: number) => {
    set({
      initialCapital,
      entries: [],
      capitalFlows: [],
      benchmarks: [],
      targetReturn: null,
      hasPortfolio: true,
      fullEquityCurve: [],
      filteredEquityCurve: [],
      metrics: { ...emptyMetrics, currentEquity: initialCapital, investedCapital: initialCapital },
      monthlyReturns: [],
      hasUnsavedChanges: true,
      selectedTimeFilter: 'ALL',
      activeMobileTab: 'dashboard',
      error: null,
    });
  },

  // ── Load portfolio from JSON file ──
  loadPortfolio: async () => {
    try {
      set({ isLoading: true, error: null });
      const file = await openFilePicker('.json');
      if (!file) {
        set({ isLoading: false });
        return;
      }
      const data: PortfolioData = await loadPortfolioFile(file);
      const capitalFlows = data.capitalFlows || [];
      const benchmarks = data.benchmarks || [];
      const targetReturn = data.targetReturn ?? null;

      const { sorted, fullCurve, filteredCurve, metrics, monthlyReturns } = deriveData(
        data.entries,
        data.initialCapital,
        capitalFlows,
        'ALL',
      );

      set({
        initialCapital: data.initialCapital,
        entries: sorted,
        capitalFlows,
        benchmarks,
        targetReturn,
        hasPortfolio: true,
        fullEquityCurve: fullCurve,
        filteredEquityCurve: filteredCurve,
        metrics,
        monthlyReturns,
        selectedTimeFilter: 'ALL',
        hasUnsavedChanges: false,
        lastSavedAt: null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load portfolio.',
      });
    }
  },

  // ── Save portfolio as JSON download ──
  savePortfolio: () => {
    const { initialCapital, entries, capitalFlows, benchmarks, targetReturn } = get();
    const data: PortfolioData = {
      initialCapital,
      entries: sortEntriesByDate(entries),
      capitalFlows,
      benchmarks,
      targetReturn,
    };
    savePortfolioFile(data);
    set({
      hasUnsavedChanges: false,
      lastSavedAt: new Date().toISOString(),
    });
  },

  // ── Add a new daily entry ──
  addEntry: (date: string, pnl: number, note: string) => {
    const { entries, initialCapital, capitalFlows, selectedTimeFilter } = get();
    const newEntry: PortfolioEntry = {
      id: uuidv4(),
      date,
      pnl,
      note,
    };
    const updated = sortEntriesByDate([...entries, newEntry]);
    const { fullCurve, filteredCurve, metrics, monthlyReturns } = deriveData(
      updated,
      initialCapital,
      capitalFlows,
      selectedTimeFilter,
    );

    set({
      entries: updated,
      fullEquityCurve: fullCurve,
      filteredEquityCurve: filteredCurve,
      metrics,
      monthlyReturns,
      hasUnsavedChanges: true,
    });
  },

  // ── Delete an entry ──
  deleteEntry: (id: string) => {
    const { entries, initialCapital, capitalFlows, selectedTimeFilter } = get();
    const updated = entries.filter((e) => e.id !== id);
    const { fullCurve, filteredCurve, metrics, monthlyReturns } = deriveData(
      updated,
      initialCapital,
      capitalFlows,
      selectedTimeFilter,
    );

    set({
      entries: updated,
      fullEquityCurve: fullCurve,
      filteredEquityCurve: filteredCurve,
      metrics,
      monthlyReturns,
      hasUnsavedChanges: true,
    });
  },

  // ── Edit an entry ──
  editEntry: (id: string, date: string, pnl: number, note: string) => {
    const { entries, initialCapital, capitalFlows, selectedTimeFilter } = get();
    const updated = entries.map((e) =>
      e.id === id ? { ...e, date, pnl, note } : e,
    );
    const sorted = sortEntriesByDate(updated);
    const { fullCurve, filteredCurve, metrics, monthlyReturns } = deriveData(
      sorted,
      initialCapital,
      capitalFlows,
      selectedTimeFilter,
    );

    set({
      entries: sorted,
      fullEquityCurve: fullCurve,
      filteredEquityCurve: filteredCurve,
      metrics,
      monthlyReturns,
      hasUnsavedChanges: true,
    });
  },

  // ── Time filter ──
  setTimeFilter: (filter: TimeFilter) => {
    const { fullEquityCurve, initialCapital, capitalFlows } = get();
    const filteredCurve = filterEquityCurve(fullEquityCurve, filter);
    const metrics = computeMetrics(filteredCurve, initialCapital, capitalFlows);
    set({ selectedTimeFilter: filter, filteredEquityCurve: filteredCurve, metrics });
  },

  // ── Chart type ──
  setChartType: (type: ChartType) => set({ selectedChartType: type }),

  // ── Mobile tab ──
  setMobileTab: (tab: MobileTab) => set({ activeMobileTab: tab }),

  // ── Error management ──
  clearError: () => set({ error: null }),

  // ── CSV export ──
  exportCSV: () => {
    const { entries } = get();
    exportEntriesToCSV(sortEntriesByDate(entries));
  },

  // ── CSV import ──
  importCSV: async () => {
    try {
      set({ isLoading: true, error: null });
      const file = await openCSVFilePicker();
      if (!file) {
        set({ isLoading: false });
        return;
      }
      const imported = await importEntriesFromCSV(file);
      const { entries, initialCapital, capitalFlows, selectedTimeFilter } = get();
      const merged = sortEntriesByDate([...entries, ...imported]);
      const { fullCurve, filteredCurve, metrics, monthlyReturns } = deriveData(
        merged,
        initialCapital,
        capitalFlows,
        selectedTimeFilter,
      );

      set({
        entries: merged,
        fullEquityCurve: fullCurve,
        filteredEquityCurve: filteredCurve,
        metrics,
        monthlyReturns,
        hasUnsavedChanges: true,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to import CSV.',
      });
    }
  },

  // ── Capital Flow: Add deposit or withdrawal ──
  addCapitalFlow: (date: string, amount: number, type: 'deposit' | 'withdrawal', note: string) => {
    const { capitalFlows, entries, initialCapital, selectedTimeFilter } = get();
    const flow: CapitalFlow = {
      id: uuidv4(),
      date,
      amount: type === 'withdrawal' ? -Math.abs(amount) : Math.abs(amount),
      type,
      note,
    };
    const updatedFlows = [...capitalFlows, flow].sort((a, b) => a.date.localeCompare(b.date));
    const { fullCurve, filteredCurve, metrics, monthlyReturns } = deriveData(
      entries,
      initialCapital,
      updatedFlows,
      selectedTimeFilter,
    );

    set({
      capitalFlows: updatedFlows,
      fullEquityCurve: fullCurve,
      filteredEquityCurve: filteredCurve,
      metrics,
      monthlyReturns,
      hasUnsavedChanges: true,
    });
  },

  // ── Capital Flow: Delete ──
  deleteCapitalFlow: (id: string) => {
    const { capitalFlows, entries, initialCapital, selectedTimeFilter } = get();
    const updatedFlows = capitalFlows.filter((f) => f.id !== id);
    const { fullCurve, filteredCurve, metrics, monthlyReturns } = deriveData(
      entries,
      initialCapital,
      updatedFlows,
      selectedTimeFilter,
    );

    set({
      capitalFlows: updatedFlows,
      fullEquityCurve: fullCurve,
      filteredEquityCurve: filteredCurve,
      metrics,
      monthlyReturns,
      hasUnsavedChanges: true,
    });
  },

  // ── Target Return ──
  setTargetReturn: (target: number | null) => {
    set({ targetReturn: target, hasUnsavedChanges: true });
  },

  // ── Benchmarks ──
  addBenchmark: (name: string, color: string) => {
    const { benchmarks } = get();
    const benchmark: Benchmark = {
      id: uuidv4(),
      name,
      color,
      entries: [],
    };
    set({ benchmarks: [...benchmarks, benchmark], hasUnsavedChanges: true });
  },

  removeBenchmark: (id: string) => {
    const { benchmarks } = get();
    set({
      benchmarks: benchmarks.filter((b) => b.id !== id),
      hasUnsavedChanges: true,
    });
  },

  addBenchmarkEntry: (benchmarkId: string, date: string, value: number) => {
    const { benchmarks } = get();
    const updated = benchmarks.map((b) => {
      if (b.id !== benchmarkId) return b;
      const entries = [...b.entries, { date, value }].sort((a, b2) =>
        a.date.localeCompare(b2.date),
      );
      return { ...b, entries };
    });
    set({ benchmarks: updated, hasUnsavedChanges: true });
  },

  importBenchmarkCSV: async (benchmarkId: string) => {
    try {
      const file = await openCSVFilePicker();
      if (!file) return;

      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) throw new Error('CSV must have header + data');

      const newEntries: BenchmarkEntry[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length < 2) continue;
        const date = cols[0].trim();
        const value = parseFloat(cols[1].trim());
        if (/^\d{4}-\d{2}-\d{2}/.test(date) && !isNaN(value)) {
          newEntries.push({ date: date.slice(0, 10), value });
        }
      }

      const { benchmarks } = get();
      const updated = benchmarks.map((b) => {
        if (b.id !== benchmarkId) return b;
        const merged = [...b.entries, ...newEntries].sort((a, b2) =>
          a.date.localeCompare(b2.date),
        );
        return { ...b, entries: merged };
      });
      set({ benchmarks: updated, hasUnsavedChanges: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to import benchmark CSV.',
      });
    }
  },

  // ── Reset ──
  resetPortfolio: () => {
    set({
      initialCapital: 0,
      entries: [],
      capitalFlows: [],
      benchmarks: [],
      targetReturn: null,
      hasPortfolio: false,
      fullEquityCurve: [],
      filteredEquityCurve: [],
      metrics: emptyMetrics,
      monthlyReturns: [],
      selectedTimeFilter: 'ALL',
      selectedChartType: 'area',
      activeMobileTab: 'dashboard',
      hasUnsavedChanges: false,
      lastSavedAt: null,
      error: null,
      isLoading: false,
    });
  },
}));
