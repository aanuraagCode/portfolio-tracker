import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { usePortfolioStore } from '../../store/portfolioStore';

interface Props {
  /** Mobile: controlled collapse state */
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AddEntryForm({ isOpen = true, onClose }: Props) {
  const addEntry = usePortfolioStore((s) => s.addEntry);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [pnl, setPnl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess(false);

      // Validation
      if (!date) {
        setError('Please select a date.');
        return;
      }
      const pnlNum = parseFloat(pnl);
      if (isNaN(pnlNum)) {
        setError('Please enter a valid P&L number.');
        return;
      }

      addEntry(date, pnlNum, note.trim());

      // Reset form
      setPnl('');
      setNote('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);

      onClose?.();
    },
    [date, pnl, note, addEntry, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1a2235] border border-[#2a3548] rounded-xl p-4 sm:p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#e2e8f0] uppercase tracking-wider">
            Add Daily Entry
          </h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[#64748b] hover:text-[#e2e8f0] transition-smooth lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Date */}
          <div>
            <label className="block text-xs text-[#64748b] mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0a0e17] border border-[#2a3548] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] focus:border-blue-500 transition-smooth"
            />
          </div>

          {/* P&L */}
          <div>
            <label className="block text-xs text-[#64748b] mb-1.5">P&L ($)</label>
            <input
              type="number"
              step="any"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              placeholder="e.g. 1250 or -340"
              className="w-full bg-[#0a0e17] border border-[#2a3548] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#4a5568] focus:border-blue-500 transition-smooth"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs text-[#64748b] mb-1.5">
              Note <span className="text-[#4a5568]">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Market context, strategy..."
              className="w-full bg-[#0a0e17] border border-[#2a3548] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#4a5568] focus:border-blue-500 transition-smooth"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs mt-3">{error}</p>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-smooth shadow-md shadow-blue-600/20"
          >
            Add Entry
          </button>
          {success && (
            <span className="text-emerald-400 text-xs animate-fade-in">
              ✓ Entry added
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

