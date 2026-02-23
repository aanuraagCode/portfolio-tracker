/**
 * Central Zustand store for the portfolio tracker.
 *
 * Holds portfolio data in memory, derived metrics, UI state.
 * Logic is separated from UI — components only call actions.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  PortfolioData,
  PortfolioEntry,
  EquityPoint,
  PortfolioMetrics,
  ChartType,
  TimeFilter,
} from '../types';
import {
  buildEquityCurve,
  computeMetrics,
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
  hasPortfolio: boolean;

  // Derived (recomputed on data change)
  fullEquityCurve: EquityPoint[];
  filteredEquityCurve: EquityPoint[];
  metrics: PortfolioMetrics;

  // UI state
  selectedTimeFilter: TimeFilter;
  selectedChartType: ChartType;
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
  clearError: () => void;
  exportCSV: () => void;
  importCSV: () => Promise<void>;
  resetPortfolio: () => void;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function deriveData(
  entries: PortfolioEntry[],
  initialCapital: number,
  timeFilter: TimeFilter,
) {
  const sorted = sortEntriesByDate(entries);
  const fullCurve = buildEquityCurve(sorted, initialCapital);
  const filteredCurve = filterEquityCurve(fullCurve, timeFilter);
  const metrics = computeMetrics(filteredCurve, initialCapital);
  return { sorted, fullCurve, filteredCurve, metrics };
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
};

// ────────────────────────────────────────────
// Store
// ────────────────────────────────────────────

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  // Initial state
  initialCapital: 0,
  entries: [],
  hasPortfolio: false,
  fullEquityCurve: [],
  filteredEquityCurve: [],
  metrics: emptyMetrics,
  selectedTimeFilter: 'ALL',
  selectedChartType: 'line',
  hasUnsavedChanges: false,
  lastSavedAt: null,
  error: null,
  isLoading: false,

  // ── Create new portfolio ──
  createNewPortfolio: (initialCapital: number) => {
    set({
      initialCapital,
      entries: [],
      hasPortfolio: true,
      fullEquityCurve: [],
      filteredEquityCurve: [],
      metrics: { ...emptyMetrics, currentEquity: initialCapital },
      hasUnsavedChanges: true,
      selectedTimeFilter: 'ALL',
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
      const sorted = sortEntriesByDate(data.entries);
      const { fullCurve, filteredCurve, metrics } = deriveData(
        sorted,
        data.initialCapital,
        'ALL',
      );

      set({
        initialCapital: data.initialCapital,
        entries: sorted,
        hasPortfolio: true,
        fullEquityCurve: fullCurve,
        filteredEquityCurve: filteredCurve,
        metrics,
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
    const { initialCapital, entries } = get();
    const data: PortfolioData = { initialCapital, entries: sortEntriesByDate(entries) };
    savePortfolioFile(data);
    set({
      hasUnsavedChanges: false,
      lastSavedAt: new Date().toISOString(),
    });
  },

  // ── Add a new daily entry ──
  addEntry: (date: string, pnl: number, note: string) => {
    const { entries, initialCapital, selectedTimeFilter } = get();
    const newEntry: PortfolioEntry = {
      id: uuidv4(),
      date,
      pnl,
      note,
    };
    const updated = sortEntriesByDate([...entries, newEntry]);
    const { fullCurve, filteredCurve, metrics } = deriveData(
      updated,
      initialCapital,
      selectedTimeFilter,
    );

    set({
      entries: updated,
      fullEquityCurve: fullCurve,
      filteredEquityCurve: filteredCurve,
      metrics,
      hasUnsavedChanges: true,
    });
  },

  // ── Delete an entry ──
  deleteEntry: (id: string) => {
    const { entries, initialCapital, selectedTimeFilter } = get();
    const updated = entries.filter((e) => e.id !== id);
    const { fullCurve, filteredCurve, metrics } = deriveData(
      updated,
      initialCapital,
      selectedTimeFilter,
    );

    set({
      entries: updated,
      fullEquityCurve: fullCurve,
      filteredEquityCurve: filteredCurve,
      metrics,
      hasUnsavedChanges: true,
    });
  },

  // ── Edit an entry ──
  editEntry: (id: string, date: string, pnl: number, note: string) => {
    const { entries, initialCapital, selectedTimeFilter } = get();
    const updated = entries.map((e) =>
      e.id === id ? { ...e, date, pnl, note } : e,
    );
    const sorted = sortEntriesByDate(updated);
    const { fullCurve, filteredCurve, metrics } = deriveData(
      sorted,
      initialCapital,
      selectedTimeFilter,
    );

    set({
      entries: sorted,
      fullEquityCurve: fullCurve,
      filteredEquityCurve: filteredCurve,
      metrics,
      hasUnsavedChanges: true,
    });
  },

  // ── Time filter ──
  setTimeFilter: (filter: TimeFilter) => {
    const { fullEquityCurve, initialCapital } = get();
    const filteredCurve = filterEquityCurve(fullEquityCurve, filter);
    const metrics = computeMetrics(filteredCurve, initialCapital);
    set({ selectedTimeFilter: filter, filteredEquityCurve: filteredCurve, metrics });
  },

  // ── Chart type ──
  setChartType: (type: ChartType) => set({ selectedChartType: type }),

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
      const { entries, initialCapital, selectedTimeFilter } = get();
      const merged = sortEntriesByDate([...entries, ...imported]);
      const { fullCurve, filteredCurve, metrics } = deriveData(
        merged,
        initialCapital,
        selectedTimeFilter,
      );

      set({
        entries: merged,
        fullEquityCurve: fullCurve,
        filteredEquityCurve: filteredCurve,
        metrics,
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

  // ── Reset ──
  resetPortfolio: () => {
    set({
      initialCapital: 0,
      entries: [],
      hasPortfolio: false,
      fullEquityCurve: [],
      filteredEquityCurve: [],
      metrics: emptyMetrics,
      selectedTimeFilter: 'ALL',
      selectedChartType: 'line',
      hasUnsavedChanges: false,
      lastSavedAt: null,
      error: null,
      isLoading: false,
    });
  },
}));

