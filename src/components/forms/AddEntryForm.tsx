import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { usePortfolioStore } from '../../store/portfolioStore';

interface Props {
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
        className="card-glass rounded-2xl p-4 sm:p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Add Daily P&L
          </h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[#64748b] hover:text-[#f1f5f9] transition-smooth lg:hidden p-2 rounded-xl hover:bg-[#1e293b]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-[10px] text-[#64748b] mb-1.5 uppercase tracking-wider font-semibold">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#060a13] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] focus:border-blue-500 transition-smooth"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#64748b] mb-1.5 uppercase tracking-wider font-semibold">P&L (₹)</label>
            <input
              type="text"
              inputMode="decimal"
              value={pnl}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '-' || /^-?\d*\.?\d*$/.test(val)) {
                  setPnl(val);
                }
              }}
              placeholder="e.g. 1250 or -340"
              className="w-full bg-[#060a13] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#4a5568] focus:border-blue-500 transition-smooth font-[JetBrains_Mono]"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#64748b] mb-1.5 uppercase tracking-wider font-semibold">
              Note <span className="text-[#2a3548]">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Market context, strategy..."
              className="w-full bg-[#060a13] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#4a5568] focus:border-blue-500 transition-smooth"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs mt-3 animate-fade-in">{error}</p>
        )}

        <div className="flex items-center gap-3 mt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold rounded-xl transition-smooth shadow-lg shadow-blue-600/20 touch-active"
          >
            Add Entry
          </button>
          {success && (
            <span className="text-emerald-400 text-xs animate-pop-in flex items-center gap-1.5 font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Entry added
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
