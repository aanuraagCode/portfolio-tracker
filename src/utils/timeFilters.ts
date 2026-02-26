import { subDays, subMonths, subYears, parseISO, isAfter, isEqual } from 'date-fns';
import type { TimeFilter, TimeFilterOption, EquityPoint } from '../types';

/** All available time filter presets */
export const TIME_FILTER_OPTIONS: TimeFilterOption[] = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '15D', days: 15 },
  { label: '1M', days: null },
  { label: '2M', days: null },
  { label: '3M', days: null },
  { label: '4M', days: null },
  { label: '5M', days: null },
  { label: '6M', days: null },
  { label: '7M', days: null },
  { label: '8M', days: null },
  { label: '9M', days: null },
  { label: '10M', days: null },
  { label: '11M', days: null },
  { label: '1Y', days: null },
  { label: '2Y', days: null },
  { label: '3Y', days: null },
  { label: '4Y', days: null },
  { label: '5Y', days: null },
  { label: 'ALL', days: null },
];

/**
 * Compute the cutoff date for a given time filter relative to `now`.
 * Returns null for 'ALL' (no cutoff).
 */
export function getCutoffDate(filter: TimeFilter, now: Date = new Date()): Date | null {
  if (filter === 'ALL') return null;

  // Day-based filters
  if (filter === '1D') return subDays(now, 1);
  if (filter === '7D') return subDays(now, 7);
  if (filter === '15D') return subDays(now, 15);

  // Month-based filters (1M – 11M)
  const monthMatch = filter.match(/^(\d+)M$/);
  if (monthMatch) {
    return subMonths(now, parseInt(monthMatch[1], 10));
  }

  // Year-based filters (1Y – 5Y)
  const yearMatch = filter.match(/^(\d+)Y$/);
  if (yearMatch) {
    return subYears(now, parseInt(yearMatch[1], 10));
  }

  return null;
}

/**
 * Filter equity curve points by time filter.
 */
export function filterEquityCurve(
  curve: EquityPoint[],
  filter: TimeFilter,
): EquityPoint[] {
  const cutoff = getCutoffDate(filter);
  if (!cutoff) return curve; // ALL

  return curve.filter((point) => {
    const pointDate = parseISO(point.date);
    return isAfter(pointDate, cutoff) || isEqual(pointDate, cutoff);
  });
}



