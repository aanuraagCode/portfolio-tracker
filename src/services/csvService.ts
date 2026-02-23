/**
 * CSV import / export for portfolio entries.
 */

import { v4 as uuidv4 } from 'uuid';
import type { PortfolioEntry } from '../types';

// ────────────────────────────────────────────
// Export
// ────────────────────────────────────────────

/**
 * Convert entries to a CSV string and trigger a download.
 */
export function exportEntriesToCSV(entries: PortfolioEntry[], filename?: string): void {
  const header = 'date,pnl,note';
  const rows = entries.map(
    (e) => `${e.date},${e.pnl},"${e.note.replace(/"/g, '""')}"`,
  );
  const csv = [header, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `portfolio_entries_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ────────────────────────────────────────────
// Import
// ────────────────────────────────────────────

/**
 * Parse a CSV file into PortfolioEntry[].
 *
 * Expected columns: date, pnl, note (optional)
 * First row is treated as a header.
 */
export function importEntriesFromCSV(file: File): Promise<PortfolioEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');

        if (lines.length < 2) {
          reject(new Error('CSV file must have a header row and at least one data row.'));
          return;
        }

        // Skip header
        const entries: PortfolioEntry[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length < 2) {
            reject(new Error(`Invalid CSV row at line ${i + 1}: expected at least date and pnl columns.`));
            return;
          }

          const dateStr = cols[0].trim();
          const pnl = parseFloat(cols[1].trim());
          const note = cols[2]?.trim().replace(/^"|"$/g, '') ?? '';

          if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            reject(new Error(`Invalid date format at line ${i + 1}: "${dateStr}". Use YYYY-MM-DD.`));
            return;
          }

          if (Number.isNaN(pnl)) {
            reject(new Error(`Invalid P&L value at line ${i + 1}: "${cols[1]}".`));
            return;
          }

          entries.push({
            id: uuidv4(),
            date: dateStr.slice(0, 10), // normalise to YYYY-MM-DD
            pnl,
            note,
          });
        }

        resolve(entries);
      } catch {
        reject(new Error('Failed to parse CSV file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read CSV file.'));
    reader.readAsText(file);
  });
}

/**
 * Naive CSV line parser that handles quoted fields with commas.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Open a CSV file picker.
 */
export function openCSVFilePicker(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = () => {
      resolve(input.files?.[0] ?? null);
    };

    const onFocus = () => {
      setTimeout(() => {
        if (!input.files || input.files.length === 0) resolve(null);
        window.removeEventListener('focus', onFocus);
      }, 300);
    };
    window.addEventListener('focus', onFocus);

    input.click();
  });
}

