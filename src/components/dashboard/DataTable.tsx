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

  // Sort descending for display (most recent first)
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
        // Auto-cancel confirm after 3 seconds
        setTimeout(() => setDeleteConfirm(null), 3000);
      }
    },
    [deleteConfirm, deleteEntry],
  );

  if (entries.length === 0) {
    return (
      <div className="bg-[#1a2235] border border-[#2a3548] rounded-xl p-8 text-center">
        <p className="text-[#64748b] text-sm">No entries yet. Add your first daily P&L above.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a2235] border border-[#2a3548] rounded-xl overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-[#2a3548] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#e2e8f0] uppercase tracking-wider">
          Trade Log
        </h3>
        <span className="text-xs text-[#64748b]">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px]">
          <thead>
            <tr className="border-b border-[#2a3548]">
              <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wider px-4 sm:px-5 py-3">
                Date
              </th>
              <th className="text-right text-xs font-medium text-[#64748b] uppercase tracking-wider px-4 sm:px-5 py-3">
                P&L
              </th>
              <th className="text-left text-xs font-medium text-[#64748b] uppercase tracking-wider px-4 sm:px-5 py-3">
                Note
              </th>
              <th className="text-right text-xs font-medium text-[#64748b] uppercase tracking-wider px-4 sm:px-5 py-3 w-28">
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
                  className={`border-b border-[#2a3548]/50 hover:bg-[#1f2b42]/50 transition-smooth ${
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-[#111827]/30'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <td className="px-4 sm:px-5 py-2.5">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="bg-[#0a0e17] border border-[#2a3548] rounded px-2 py-1 text-xs text-[#e2e8f0] w-full"
                        />
                      </td>
                      <td className="px-4 sm:px-5 py-2.5">
                        <input
                          type="number"
                          step="any"
                          value={editPnl}
                          onChange={(e) => setEditPnl(e.target.value)}
                          className="bg-[#0a0e17] border border-[#2a3548] rounded px-2 py-1 text-xs text-[#e2e8f0] w-full text-right"
                        />
                      </td>
                      <td className="px-4 sm:px-5 py-2.5">
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="bg-[#0a0e17] border border-[#2a3548] rounded px-2 py-1 text-xs text-[#e2e8f0] w-full"
                        />
                      </td>
                      <td className="px-4 sm:px-5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={handleSaveEdit}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded transition-smooth"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-[#2a3548] hover:bg-[#374151] text-[#94a3b8] text-xs rounded transition-smooth"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 sm:px-5 py-2.5 text-sm text-[#e2e8f0]">
                        {format(parseISO(entry.date), 'MMM d, yyyy')}
                      </td>
                      <td
                        className={`px-4 sm:px-5 py-2.5 text-sm font-medium text-right ${
                          entry.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {entry.pnl >= 0 ? '+' : ''}
                        {formatCurrencyFull(entry.pnl)}
                      </td>
                      <td className="px-4 sm:px-5 py-2.5 text-sm text-[#94a3b8] max-w-[200px] truncate">
                        {entry.note || '—'}
                      </td>
                      <td className="px-4 sm:px-5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(entry.id)}
                            className="p-1.5 text-[#64748b] hover:text-blue-400 transition-smooth rounded hover:bg-blue-500/10"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className={`p-1.5 transition-smooth rounded ${
                              isConfirmingDelete
                                ? 'text-red-400 bg-red-500/10'
                                : 'text-[#64748b] hover:text-red-400 hover:bg-red-500/10'
                            }`}
                            title={isConfirmingDelete ? 'Click again to confirm' : 'Delete'}
                          >
                            {isConfirmingDelete ? (
                              <span className="text-[10px] font-medium">Confirm?</span>
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

