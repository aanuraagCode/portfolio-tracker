import { useState, useMemo, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { usePortfolioStore } from '../../store/portfolioStore';
import { formatCurrencyFull } from '../../utils/calculations';

export default function DataTable() {
  const { entries, deleteEntry, editEntry } = usePortfolioStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editPnl, setEditPnl] = useState('');
  const [editNote, setEditNote] = useState('');

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );

  const handleStartEdit = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      setEditId(id);
      setEditDate(entry.date);
      setEditPnl(String(entry.pnl));
      setEditNote(entry.note);
    },
    [entries],
  );

  const handleSaveEdit = useCallback(() => {
    if (!editId) return;
    const pnlNum = parseFloat(editPnl);
    if (isNaN(pnlNum) || !editDate) return;
    editEntry(editId, editDate, pnlNum, editNote);
    setEditId(null);
  }, [editId, editDate, editPnl, editNote, editEntry]);

  const handleCancelEdit = useCallback(() => setEditId(null), []);

  const handleDelete = useCallback(
    (id: string) => {
      if (deleteConfirm === id) {
        deleteEntry(id);
        setDeleteConfirm(null);
      } else {
        setDeleteConfirm(id);
        setTimeout(() => setDeleteConfirm(null), 3000);
      }
    },
    [deleteConfirm, deleteEntry],
  );

  if (entries.length === 0) {
    return (
      <div className="card-glass rounded-2xl p-8 text-center animate-fade-in">
        <div className="empty-state-icon mx-auto">
          <svg className="w-8 h-8 text-[#4a5568]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-[#94a3b8] text-sm font-medium mt-3">No entries yet</p>
        <p className="text-[#4a5568] text-xs mt-1">Add your first daily P&L to get started</p>
      </div>
    );
  }

  return (
    <div className="card-glass rounded-2xl overflow-hidden animate-fade-in">
      <div className="px-4 sm:px-5 py-3 border-b border-[#1e293b] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          Trade Log
        </h3>
        <span className="text-[10px] text-[#4a5568] bg-[#111827] px-2.5 py-1 rounded-full font-semibold">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Mobile: Card list view */}
      <div className="sm:hidden divide-y divide-[#1e293b]/30">
        {sortedEntries.map((entry) => {
          const isEditing = editId === entry.id;
          const isConfirmingDelete = deleteConfirm === entry.id;

          if (isEditing) {
            return (
              <div key={entry.id} className="p-4 space-y-3 animate-fade-in bg-[#0a0e17]/30">
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-[#060a13] border border-[#1e293b] rounded-xl px-3 py-2.5 text-sm text-[#f1f5f9]"
                />
                <input
                  type="number"
                  step="any"
                  value={editPnl}
                  onChange={(e) => setEditPnl(e.target.value)}
                  placeholder="P&L"
                  className="w-full bg-[#060a13] border border-[#1e293b] rounded-xl px-3 py-2.5 text-sm text-[#f1f5f9] font-[JetBrains_Mono]"
                />
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Note"
                  className="w-full bg-[#060a13] border border-[#1e293b] rounded-xl px-3 py-2.5 text-sm text-[#f1f5f9]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-smooth"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 py-2.5 bg-[#1e293b] text-[#94a3b8] text-xs font-semibold rounded-xl transition-smooth"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-[#111827]/40 transition-smooth">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  entry.pnl >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {entry.pnl >= 0 ? '▲' : '▼'}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-bold font-[JetBrains_Mono] ${
                    entry.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {entry.pnl >= 0 ? '+' : ''}{formatCurrencyFull(entry.pnl)}
                  </p>
                  <p className="text-[11px] text-[#64748b] truncate">
                    {format(parseISO(entry.date), 'MMM d, yyyy')}
                    {entry.note && ` · ${entry.note}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => handleStartEdit(entry.id)}
                  className="p-2 text-[#4a5568] hover:text-blue-400 transition-smooth rounded-xl hover:bg-blue-500/10 touch-active"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className={`p-2 transition-smooth rounded-xl touch-active ${
                    isConfirmingDelete
                      ? 'text-red-400 bg-red-500/10'
                      : 'text-[#4a5568] hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  {isConfirmingDelete ? (
                    <span className="text-[9px] font-bold px-0.5">Confirm?</span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Table view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[540px]">
          <thead>
            <tr className="border-b border-[#1e293b]">
              <th className="text-left text-[10px] font-medium text-[#4a5568] uppercase tracking-wider px-5 py-3">
                Date
              </th>
              <th className="text-right text-[10px] font-medium text-[#4a5568] uppercase tracking-wider px-5 py-3">
                P&L
              </th>
              <th className="text-left text-[10px] font-medium text-[#4a5568] uppercase tracking-wider px-5 py-3">
                Note
              </th>
              <th className="text-right text-[10px] font-medium text-[#4a5568] uppercase tracking-wider px-5 py-3 w-28">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry, idx) => {
              const isEditing = editId === entry.id;
              const isConfirmingDelete = deleteConfirm === entry.id;

              return (
                <tr
                  key={entry.id}
                  className={`border-b border-[#1e293b]/30 hover:bg-[#111827]/60 transition-smooth ${
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-[#060a13]/30'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <td className="px-5 py-2">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="bg-[#060a13] border border-[#1e293b] rounded-lg px-2 py-1.5 text-xs text-[#f1f5f9] w-full"
                        />
                      </td>
                      <td className="px-5 py-2">
                        <input
                          type="number"
                          step="any"
                          value={editPnl}
                          onChange={(e) => setEditPnl(e.target.value)}
                          className="bg-[#060a13] border border-[#1e293b] rounded-lg px-2 py-1.5 text-xs text-[#f1f5f9] w-full text-right font-[JetBrains_Mono]"
                        />
                      </td>
                      <td className="px-5 py-2">
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="bg-[#060a13] border border-[#1e293b] rounded-lg px-2 py-1.5 text-xs text-[#f1f5f9] w-full"
                        />
                      </td>
                      <td className="px-5 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-medium rounded-lg transition-smooth"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#2a3548] text-[#94a3b8] text-[10px] rounded-lg transition-smooth"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 text-xs text-[#f1f5f9]">
                        {format(parseISO(entry.date), 'MMM d, yyyy')}
                      </td>
                      <td
                        className={`px-5 py-3 text-xs font-bold text-right font-[JetBrains_Mono] ${
                          entry.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {entry.pnl >= 0 ? '+' : ''}
                        {formatCurrencyFull(entry.pnl)}
                      </td>
                      <td className="px-5 py-3 text-xs text-[#64748b] max-w-[200px] truncate">
                        {entry.note || '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(entry.id)}
                            className="p-1.5 text-[#4a5568] hover:text-blue-400 transition-smooth rounded-lg hover:bg-blue-500/10"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className={`p-1.5 transition-smooth rounded-lg ${
                              isConfirmingDelete
                                ? 'text-red-400 bg-red-500/10'
                                : 'text-[#4a5568] hover:text-red-400 hover:bg-red-500/10'
                            }`}
                            title={isConfirmingDelete ? 'Click again to confirm' : 'Delete'}
                          >
                            {isConfirmingDelete ? (
                              <span className="text-[9px] font-bold px-0.5">Confirm?</span>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
