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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/20">
            P
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Portfolio Tracker</h1>
          <p className="text-[#64748b] text-sm">
            Personal trading portfolio analytics
          </p>
        </div>

        {/* Create new */}
        <div className="bg-[#1a2235] border border-[#2a3548] rounded-xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-[#e2e8f0] uppercase tracking-wider mb-4">
            Create New Portfolio
          </h2>
          <form onSubmit={handleCreate}>
            <label className="block text-xs text-[#64748b] mb-1.5">
              Starting Capital ($)
            </label>
            <input
              type="number"
              step="any"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              placeholder="e.g. 100000"
              className="w-full bg-[#0a0e17] border border-[#2a3548] rounded-lg px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#4a5568] focus:border-blue-500 transition-smooth mb-3"
            />
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-smooth shadow-md shadow-blue-600/20"
            >
              Create Portfolio
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#2a3548]" />
          <span className="text-xs text-[#64748b]">or</span>
          <div className="flex-1 h-px bg-[#2a3548]" />
        </div>

        {/* Load / Import */}
        <div className="flex flex-col gap-3">
          <button
            onClick={loadPortfolio}
            className="w-full py-2.5 bg-[#1a2235] hover:bg-[#1f2b42] border border-[#2a3548] text-[#e2e8f0] text-sm font-medium rounded-lg transition-smooth flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L13 8m4-4v12" />
            </svg>
            Load Portfolio (JSON)
          </button>
          <button
            onClick={importCSV}
            className="w-full py-2.5 bg-[#1a2235] hover:bg-[#1f2b42] border border-[#2a3548] text-[#94a3b8] text-sm font-medium rounded-lg transition-smooth flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Import CSV
          </button>
        </div>
      </div>
    </div>
  );
}

