/**
 * File I/O service — load & save portfolio JSON via browser APIs.
 * Handles backward compatibility with older portfolio files.
 */

import type { PortfolioData, PortfolioEntry } from '../types';

// ────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────

function isValidEntry(entry: unknown): entry is PortfolioEntry {
  if (typeof entry !== 'object' || entry === null) return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}/.test(e.date as string) &&
    typeof e.pnl === 'number' &&
    !Number.isNaN(e.pnl) &&
    typeof e.note === 'string'
  );
}

export function validatePortfolioData(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return 'Invalid JSON: root must be an object.';
  }

  const d = data as Record<string, unknown>;

  if (typeof d.initialCapital !== 'number' || d.initialCapital < 0) {
    return 'Invalid or missing "initialCapital" (must be a non-negative number).';
  }

  if (!Array.isArray(d.entries)) {
    return 'Missing or invalid "entries" array.';
  }

  for (let i = 0; i < d.entries.length; i++) {
    if (!isValidEntry(d.entries[i])) {
      return `Invalid entry at index ${i}. Each entry must have id, date, pnl, note.`;
    }
  }

  return null;
}

// ────────────────────────────────────────────
// Load (Upload) — with backward compatibility
// ────────────────────────────────────────────

export function loadPortfolioFile(file: File): Promise<PortfolioData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text);
        const error = validatePortfolioData(parsed);
        if (error) {
          reject(new Error(error));
          return;
        }

        // Ensure new fields have defaults for backward compat
        const data: PortfolioData = {
          initialCapital: parsed.initialCapital,
          entries: parsed.entries,
          capitalFlows: Array.isArray(parsed.capitalFlows) ? parsed.capitalFlows : [],
          targetReturn: typeof parsed.targetReturn === 'number' ? parsed.targetReturn : null,
          benchmarks: Array.isArray(parsed.benchmarks) ? parsed.benchmarks : [],
        };

        resolve(data);
      } catch {
        reject(new Error('Failed to parse JSON file. Please check the format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsText(file);
  });
}

// ────────────────────────────────────────────
// Save (Download)
// ────────────────────────────────────────────

export function savePortfolioFile(data: PortfolioData, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `portfolio_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ────────────────────────────────────────────
// File picker
// ────────────────────────────────────────────

export function openFilePicker(accept = '.json'): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    input.onchange = () => {
      const file = input.files?.[0] ?? null;
      resolve(file);
    };

    const onFocus = () => {
      setTimeout(() => {
        if (!input.files || input.files.length === 0) {
          resolve(null);
        }
        window.removeEventListener('focus', onFocus);
      }, 300);
    };
    window.addEventListener('focus', onFocus);

    input.click();
  });
}
