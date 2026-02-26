import { useState, useCallback } from 'react';
import { usePortfolioStore } from '../../store/portfolioStore';

export default function NewPortfolioForm() {
  const { createNewPortfolio, loadPortfolio, importCSV } = usePortfolioStore();
  const [capital, setCapital] = useState('');
  const [error, setError] = useState('');

  const handleCreate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      const num = parseFloat(capital);
      if (isNaN(num) || num <= 0) {
        setError('Enter a valid positive starting capital.');
        return;
      }
      createNewPortfolio(num);
    },
    [capital, createNewPortfolio],
  );

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-4 grid-lines">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-5 shadow-2xl shadow-blue-500/30 animate-pulse-glow">
            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Trader<span className="text-gradient">Folio</span>
          </h1>
          <p className="text-[#64748b] text-sm">
            Professional portfolio analytics for Indian traders
          </p>
          <p className="text-[#4a5568] text-[10px] mt-1">
            Track P&L · TWRR Returns · Benchmark Comparison · All in ₹
          </p>
        </div>

        {/* Create new */}
        <div className="card-glass rounded-2xl p-6 mb-4 animate-border-glow">
          <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Create New Portfolio
          </h2>
          <form onSubmit={handleCreate}>
            <label className="block text-[10px] text-[#64748b] mb-1.5 uppercase tracking-wider font-semibold">
              Starting Capital (₹)
            </label>
            <input
              type="number"
              step="any"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              placeholder="e.g. 1,00,000"
              className="w-full bg-[#060a13] border border-[#1e293b] rounded-xl px-4 py-3.5 text-base text-[#f1f5f9] placeholder-[#4a5568] focus:border-blue-500 transition-smooth mb-3 font-[JetBrains_Mono]"
            />
            {error && <p className="text-red-400 text-xs mb-3 animate-fade-in">{error}</p>}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold rounded-xl transition-smooth shadow-lg shadow-blue-600/25 touch-active"
            >
              Create Portfolio
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#1e293b]" />
          <span className="text-[10px] text-[#4a5568] uppercase tracking-wider font-semibold">or load existing</span>
          <div className="flex-1 h-px bg-[#1e293b]" />
        </div>

        {/* Load / Import */}
        <div className="flex flex-col gap-3">
          <button
            onClick={loadPortfolio}
            className="w-full py-3.5 bg-[#111827] hover:bg-[#1a2332] border border-[#1e293b] text-[#f1f5f9] text-sm font-medium rounded-xl transition-smooth flex items-center justify-center gap-2 touch-active hover:border-[#2a3548]"
          >
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L13 8m4-4v12" />
            </svg>
            Load Portfolio (JSON)
          </button>
          <button
            onClick={importCSV}
            className="w-full py-3.5 bg-[#111827] hover:bg-[#1a2332] border border-[#1e293b] text-[#94a3b8] text-sm font-medium rounded-xl transition-smooth flex items-center justify-center gap-2 touch-active hover:border-[#2a3548]"
          >
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Import CSV
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <FeaturePill icon="📊" label="8 Chart Types" />
          <FeaturePill icon="🎯" label="Target Tracking" />
          <FeaturePill icon="📈" label="Benchmarks" />
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#2a3548] mt-8">
          All data stays on your device. Nothing is sent to any server.
        </p>
      </div>
    </div>
  );
}

function FeaturePill({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#111827]/50 border border-[#1e293b]/50">
      <span className="text-lg">{icon}</span>
      <span className="text-[9px] text-[#64748b] font-medium text-center leading-tight">{label}</span>
    </div>
  );
}
