import { useState, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { usePortfolioStore } from '../../store/portfolioStore';
import type { Benchmark } from '../../types';

const BENCHMARK_COLORS = [
  '#f59e0b', '#ef4444', '#22c55e', '#a855f7', '#06b6d4', '#ec4899',
];

function AddBenchmarkForm({ onAdd }: { onAdd: (name: any, color: any) => void }) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const colorIdx = Math.floor(Math.random() * BENCHMARK_COLORS.length);
    onAdd(name.trim(), BENCHMARK_COLORS[colorIdx]);
    setName('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-[#64748b] hover:text-blue-400 flex items-center gap-1.5 transition-smooth px-3 py-1.5 rounded-lg hover:bg-blue-500/10 touch-active"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Index/Stock
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 animate-fade-in">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Nifty 50"
        autoFocus
        className="flex-1 bg-[#0a0e17] border border-[#1e293b] rounded-xl px-3 py-2.5 text-xs text-[#f1f5f9] placeholder-[#4a5568] focus:border-blue-500 transition-smooth"
      />
      <button type="submit" className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-smooth">
        Add
      </button>
      <button type="button" onClick={() => setIsOpen(false)} className="px-3.5 py-2.5 bg-[#1e293b] text-[#94a3b8] text-xs rounded-xl transition-smooth">
        Cancel
      </button>
    </form>
  );
}

function BenchmarkDataEntry({ benchmark }: { benchmark: Benchmark }) {
  const { addBenchmarkEntry, importBenchmarkCSV, removeBenchmark } = usePortfolioStore();
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [value, setValue] = useState('');

  const handleAdd = useCallback(() => {
    const num = parseFloat(value);
    if (isNaN(num) || !date) return;
    addBenchmarkEntry(benchmark.id, date, num);
    setValue('');
    setShowAdd(false);
  }, [benchmark.id, date, value, addBenchmarkEntry]);

  return (
    <div className="flex items-center justify-between p-3 bg-[#0a0e17]/60 rounded-xl border border-[#1e293b]/50">
      <div className="flex items-center gap-2.5">
        <div className="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-offset-[#0a0e17]" style={{ backgroundColor: benchmark.color }} />
        <span className="text-xs font-semibold text-[#f1f5f9]">{benchmark.name}</span>
        <span className="text-[10px] text-[#4a5568] bg-[#111827] px-2 py-0.5 rounded-full">
          {benchmark.entries.length} pts
        </span>
      </div>
      <div className="flex items-center gap-1">
        {showAdd ? (
          <div className="flex items-center gap-1.5 animate-fade-in">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#111827] border border-[#1e293b] rounded-lg px-2 py-1.5 text-[10px] text-[#f1f5f9] w-28"
            />
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Value"
              className="bg-[#111827] border border-[#1e293b] rounded-lg px-2 py-1.5 text-[10px] text-[#f1f5f9] w-20 font-[JetBrains_Mono]"
            />
            <button onClick={handleAdd} className="px-2.5 py-1.5 bg-blue-600 text-white text-[10px] rounded-lg transition-smooth font-medium">
              Add
            </button>
            <button onClick={() => setShowAdd(false)} className="px-2 py-1.5 bg-[#1e293b] text-[#94a3b8] text-[10px] rounded-lg transition-smooth">
              ×
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowAdd(true)}
              className="p-1.5 text-[#64748b] hover:text-blue-400 transition-smooth rounded-lg hover:bg-blue-500/10"
              title="Add data point"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => importBenchmarkCSV(benchmark.id)}
              className="p-1.5 text-[#64748b] hover:text-amber-400 transition-smooth rounded-lg hover:bg-amber-500/10"
              title="Import CSV (date,value)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={() => removeBenchmark(benchmark.id)}
              className="p-1.5 text-[#64748b] hover:text-red-400 transition-smooth rounded-lg hover:bg-red-500/10"
              title="Remove"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BenchmarkComparison() {
  const { benchmarks, addBenchmark, fullEquityCurve } = usePortfolioStore();

  // Normalize all data series to % from starting point
  const chartData = useMemo(() => {
    if (fullEquityCurve.length === 0) return [];

    // Build a set of all dates
    const dateSet = new Set<string>();
    fullEquityCurve.forEach((p) => dateSet.add(p.date));
    benchmarks.forEach((b) => b.entries.forEach((e) => dateSet.add(e.date)));
    const allDates = Array.from(dateSet).sort();

    // Portfolio normalized returns
    const portfolioStart = fullEquityCurve[0].equity - fullEquityCurve[0].pnl;
    const portfolioByDate = new Map<string, number>();
    fullEquityCurve.forEach((p) => {
      portfolioByDate.set(p.date, ((p.equity - portfolioStart) / portfolioStart) * 100);
    });

    // Benchmark normalized returns
    const benchmarkByDate = new Map<string, Map<string, number>>();
    benchmarks.forEach((b) => {
      if (b.entries.length === 0) return;
      const bMap = new Map<string, number>();
      const startVal = b.entries[0].value;
      b.entries.forEach((e) => {
        bMap.set(e.date, ((e.value - startVal) / startVal) * 100);
      });
      benchmarkByDate.set(b.id, bMap);
    });

    return allDates
      .filter((d) => portfolioByDate.has(d))
      .map((d) => {
        const point: Record<string, number | string> = {
          date: d,
          'My Portfolio': portfolioByDate.get(d) ?? 0,
        };
        benchmarks.forEach((b) => {
          const bMap = benchmarkByDate.get(b.id);
          if (bMap?.has(d)) {
            point[b.name] = bMap.get(d)!;
          }
        });
        return point;
      });
  }, [fullEquityCurve, benchmarks]);

  return (
    <div className="card-glass rounded-2xl p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          Benchmark Comparison
        </h3>
        <AddBenchmarkForm onAdd={addBenchmark} />
      </div>

      {/* Benchmark list */}
      {benchmarks.length > 0 && (
        <div className="space-y-2">
          {benchmarks.map((b) => (
            <BenchmarkDataEntry key={b.id} benchmark={b} />
          ))}
        </div>
      )}

      {/* Comparison chart */}
      {chartData.length > 0 && benchmarks.some((b) => b.entries.length > 0) ? (
        <div className="h-[280px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: string) => {
                  try { return format(parseISO(val), 'MMM d'); } catch { return val; }
                }}
                minTickGap={40}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={50}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length || !label) return null;
                  return (
                    <div className="bg-[#111827]/95 border border-[#1e293b] rounded-xl p-3 shadow-2xl text-xs backdrop-blur-sm">
                      <p className="text-[#64748b] font-medium mb-2">
                        {format(parseISO(label as string), 'MMM d, yyyy')}
                      </p>
                      {payload.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2 mb-0.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-[#94a3b8]">{entry.name}:</span>
                          <span className="font-bold font-[JetBrains_Mono]" style={{ color: entry.color }}>
                            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              {/* Portfolio line */}
              <Line
                type="monotone"
                dataKey="My Portfolio"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                animationDuration={800}
              />
              {/* Benchmark lines */}
              {benchmarks
                .filter((b) => b.entries.length > 0)
                .map((b) => (
                  <Line
                    key={b.id}
                    type="monotone"
                    dataKey={b.name}
                    stroke={b.color}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    animationDuration={800}
                    connectNulls
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-[#64748b] text-xs">
          <div className="text-center">
            <div className="empty-state-icon mx-auto">
              <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="mt-2 font-medium text-[#94a3b8]">Add an index or stock to compare</p>
            <p className="text-[10px] mt-1 text-[#4a5568]">Import CSV or add data points manually</p>
          </div>
        </div>
      )}
    </div>
  );
}
