import { useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { usePortfolioStore } from '../../store/portfolioStore';
import { formatCurrencyFull } from '../../utils/calculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CapitalFlowModal({ isOpen, onClose }: Props) {
  const { addCapitalFlow, deleteCapitalFlow, capitalFlows, metrics } = usePortfolioStore();

  const [activeTab, setActiveTab] = useState<'add' | 'history'>('add');
  const [flowType, setFlowType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess(false);

      const num = parseFloat(amount);
      if (isNaN(num) || num <= 0) {
        setError('Enter a valid positive amount.');
        return;
      }
      if (!date) {
        setError('Please select a date.');
        return;
      }

      addCapitalFlow(date, num, flowType, note.trim());
      setAmount('');
      setNote('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    },
    [date, amount, flowType, note, addCapitalFlow],
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[#2a3548] rounded-full" />
        </div>

        <div className="p-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#f1f5f9]">Capital Management</h2>
                <p className="text-[10px] text-[#64748b]">Add/withdraw without affecting returns</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1e293b] rounded-xl transition-smooth text-[#64748b] hover:text-[#f1f5f9]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current capital display */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-xl p-3 text-center">
              <p className="text-[9px] uppercase tracking-wider text-[#64748b] mb-1">Invested</p>
              <p className="text-xs font-bold text-blue-400 font-[JetBrains_Mono]">
                {formatCurrencyFull(metrics.investedCapital)}
              </p>
            </div>
            <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-3 text-center">
              <p className="text-[9px] uppercase tracking-wider text-[#64748b] mb-1">Added</p>
              <p className="text-xs font-bold text-emerald-400 font-[JetBrains_Mono]">
                {formatCurrencyFull(metrics.totalCapitalAdded)}
              </p>
            </div>
            <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-[9px] uppercase tracking-wider text-[#64748b] mb-1">Withdrawn</p>
              <p className="text-xs font-bold text-red-400 font-[JetBrains_Mono]">
                {formatCurrencyFull(metrics.totalCapitalWithdrawn)}
              </p>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex gap-1 bg-[#0a0e17] rounded-xl p-1 mb-5">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-smooth ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-[#64748b] hover:text-[#f1f5f9]'
              }`}
            >
              Add/Withdraw
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-smooth ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-[#64748b] hover:text-[#f1f5f9]'
              }`}
            >
              History ({capitalFlows.length})
            </button>
          </div>

          {activeTab === 'add' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Deposit / Withdrawal toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFlowType('deposit')}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-smooth border ${
                    flowType === 'deposit'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
                      : 'bg-[#0a0e17] border-[#1e293b] text-[#64748b]'
                  }`}
                >
                  <span className="mr-1.5">↗</span> Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setFlowType('withdrawal')}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-smooth border ${
                    flowType === 'withdrawal'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-lg shadow-red-500/10'
                      : 'bg-[#0a0e17] border-[#1e293b] text-[#64748b]'
                  }`}
                >
                  <span className="mr-1.5">↙</span> Withdraw
                </button>
              </div>

              <div>
                <label className="block text-xs text-[#64748b] mb-1.5 font-medium">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] focus:border-blue-500 transition-smooth"
                />
              </div>

              <div>
                <label className="block text-xs text-[#64748b] mb-1.5 font-medium">Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-[#0a0e17] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#4a5568] focus:border-blue-500 transition-smooth font-[JetBrains_Mono]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#64748b] mb-1.5 font-medium">
                  Note <span className="text-[#4a5568]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reason for capital change..."
                  className="w-full bg-[#0a0e17] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#4a5568] focus:border-blue-500 transition-smooth"
                />
              </div>

              {error && <p className="text-red-400 text-xs animate-fade-in">{error}</p>}

              <button
                type="submit"
                className={`w-full py-4 text-white text-sm font-bold rounded-xl transition-smooth shadow-xl touch-active ${
                  flowType === 'deposit'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-600/25 active:from-emerald-500 active:to-emerald-400'
                    : 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-600/25 active:from-red-500 active:to-red-400'
                }`}
              >
                {flowType === 'deposit' ? '↗ Add Capital' : '↙ Withdraw Capital'}
              </button>

              {success && (
                <p className="text-emerald-400 text-xs text-center animate-pop-in font-medium">
                  ✓ Capital flow recorded. Returns will not be affected.
                </p>
              )}
            </form>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {capitalFlows.length === 0 ? (
                <div className="empty-state py-8">
                  <div className="empty-state-icon">
                    <svg className="w-6 h-6 text-[#4a5568]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
                    </svg>
                  </div>
                  <p className="text-[#64748b] text-sm font-medium">No capital flows recorded yet</p>
                </div>
              ) : (
                [...capitalFlows]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((flow) => (
                    <div
                      key={flow.id}
                      className="flex items-center justify-between p-3.5 bg-[#0a0e17] rounded-xl border border-[#1e293b]/50 animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                            flow.type === 'deposit'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {flow.type === 'deposit' ? '↗' : '↙'}
                        </div>
                        <div>
                          <p className={`text-sm font-bold font-[JetBrains_Mono] ${
                            flow.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {flow.type === 'deposit' ? '+' : '-'}
                            {formatCurrencyFull(Math.abs(flow.amount))}
                          </p>
                          <p className="text-[10px] text-[#64748b]">
                            {format(parseISO(flow.date), 'MMM d, yyyy')}
                            {flow.note && ` · ${flow.note}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCapitalFlow(flow.id)}
                        className="p-2 text-[#64748b] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-smooth"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
