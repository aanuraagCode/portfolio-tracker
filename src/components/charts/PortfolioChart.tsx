import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { usePortfolioStore } from '../../store/portfolioStore';
import {
  formatCurrencyFull,
  formatPercent,
  formatCurrency,
  computeRollingSharpe,
  computePnLDistribution,
} from '../../utils/calculations';
import type { ChartType, MonthlyReturn } from '../../types';

/* ── Custom Tooltip ── */
interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  payload: Record<string, number | string>;
}

function CustomTooltip({
  active,
  payload,
  label,
  chartType,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  chartType: ChartType;
}) {
  if (!active || !payload?.length || !label) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-3 shadow-2xl text-xs backdrop-blur-sm">
      <p className="text-[#64748b] font-medium mb-1.5">
        {chartType === 'distribution'
          ? `Range: ${label}`
          : (() => { try { return format(parseISO(label), 'MMM d, yyyy'); } catch { return label; } })()
        }
      </p>
      {chartType === 'drawdown' ? (
        <p className="text-red-400 font-bold">
          Drawdown: {formatPercent((data.drawdown as number) / 100)}
        </p>
      ) : chartType === 'cumulative' ? (
        <p className="text-purple-400 font-bold">
          Return: {formatPercent((data.cumulativeReturnPct as number) / 100)}
        </p>
      ) : chartType === 'bar' ? (
        <p className={`font-bold ${(data.pnl as number) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          P&L: {formatCurrencyFull(data.pnl as number)}
        </p>
      ) : chartType === 'distribution' ? (
        <p className="text-blue-400 font-bold">
          Count: {data.count as number} days
        </p>
      ) : chartType === 'rolling' ? (
        <p className="text-cyan-400 font-bold">
          Sharpe: {(data.sharpe as number).toFixed(2)}
        </p>
      ) : (
        <>
          <p className="text-white font-bold">
            Equity: {formatCurrencyFull(data.equity as number)}
          </p>
          <p className={`${(data.pnl as number) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            P&L: {formatCurrencyFull(data.pnl as number)}
          </p>
          <p className="text-[#64748b] mt-1">
            Invested: {formatCurrencyFull(data.investedCapital as number)}
          </p>
        </>
      )}
    </div>
  );
}

/* ── Monthly Heatmap ── */
function MonthlyHeatmap({ monthlyReturns }: { monthlyReturns: MonthlyReturn[] }) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const years = useMemo(() => {
    const yearSet = new Set(monthlyReturns.map((m) => m.year));
    return Array.from(yearSet).sort();
  }, [monthlyReturns]);

  const dataMap = useMemo(() => {
    const map = new Map<string, MonthlyReturn>();
    monthlyReturns.forEach((m) => map.set(`${m.year}-${m.month}`, m));
    return map;
  }, [monthlyReturns]);

  const getColor = (returnPct: number) => {
    const pct = returnPct * 100;
    if (pct >= 10) return 'bg-emerald-500 text-white';
    if (pct >= 5) return 'bg-emerald-500/70 text-white';
    if (pct >= 2) return 'bg-emerald-500/40 text-emerald-100';
    if (pct >= 0) return 'bg-emerald-500/20 text-emerald-300';
    if (pct >= -2) return 'bg-red-500/20 text-red-300';
    if (pct >= -5) return 'bg-red-500/40 text-red-100';
    if (pct >= -10) return 'bg-red-500/70 text-white';
    return 'bg-red-500 text-white';
  };

  if (monthlyReturns.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-[#64748b] text-sm">
        No monthly data available yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr>
            <th className="text-left text-[10px] font-medium text-[#64748b] uppercase p-2 w-16">Year</th>
            {MONTHS.map((m) => (
              <th key={m} className="text-center text-[10px] font-medium text-[#64748b] uppercase p-1 w-16">
                {m}
              </th>
            ))}
            <th className="text-center text-[10px] font-medium text-[#64748b] uppercase p-1 w-16">Total</th>
          </tr>
        </thead>
        <tbody>
          {years.map((year) => {
            const yearData = monthlyReturns.filter((m) => m.year === year);
            const yearTotal = yearData.reduce((s, m) => s + m.pnl, 0);
            const firstMonth = yearData.find(() => true);
            const startEquity = firstMonth ? firstMonth.pnl / (firstMonth.returnPct || 1) : 0;
            const yearReturnPct = startEquity !== 0 ? yearTotal / startEquity : 0;

            return (
              <tr key={year}>
                <td className="text-xs font-semibold text-[#f1f5f9] p-2 font-[JetBrains_Mono]">{year}</td>
                {Array.from({ length: 12 }, (_, i) => {
                  const data = dataMap.get(`${year}-${i}`);
                  if (!data) {
                    return (
                      <td key={i} className="p-1">
                        <div className="heatmap-cell w-full h-10 bg-[#0a0e17] rounded flex items-center justify-center">
                          <span className="text-[10px] text-[#2a3548]">—</span>
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td key={i} className="p-1">
                      <div
                        className={`heatmap-cell w-full h-10 rounded flex flex-col items-center justify-center ${getColor(data.returnPct)}`}
                        title={`${data.monthLabel} ${year}: ${formatCurrency(data.pnl)} (${(data.returnPct * 100).toFixed(1)}%)`}
                      >
                        <span className="text-[10px] font-bold font-[JetBrains_Mono] leading-tight">
                          {(data.returnPct * 100).toFixed(1)}%
                        </span>
                        <span className="text-[8px] opacity-70 font-[JetBrains_Mono]">
                          {formatCurrency(data.pnl)}
                        </span>
                      </div>
                    </td>
                  );
                })}
                <td className="p-1">
                  <div className={`heatmap-cell w-full h-10 rounded flex flex-col items-center justify-center border ${getColor(yearReturnPct)} border-[#1e293b]`}>
                    <span className="text-[10px] font-bold font-[JetBrains_Mono] leading-tight">
                      {(yearReturnPct * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main Chart Component ── */
export default function PortfolioChart() {
  const { filteredEquityCurve, selectedChartType } = usePortfolioStore();
  const monthlyReturns = usePortfolioStore((s) => s.monthlyReturns);

  // Standard chart data
  const chartData = useMemo(
    () =>
      filteredEquityCurve.map((p) => ({
        ...p,
        displayDate: format(parseISO(p.date), 'MMM d'),
        cumulativeReturnPct: p.cumulativeReturn * 100,
        drawdownPct: p.drawdown * 100,
      })),
    [filteredEquityCurve],
  );

  // Rolling Sharpe data
  const rollingSharpeData = useMemo(
    () => computeRollingSharpe(filteredEquityCurve, 20),
    [filteredEquityCurve],
  );

  // P&L distribution data
  const distributionData = useMemo(
    () => computePnLDistribution(filteredEquityCurve, 25),
    [filteredEquityCurve],
  );

  // Monthly heatmap
  if (selectedChartType === 'monthly') {
    return <MonthlyHeatmap monthlyReturns={monthlyReturns} />;
  }

  // Distribution histogram
  if (selectedChartType === 'distribution') {
    if (distributionData.length === 0) {
      return (
        <div className="h-[300px] sm:h-[400px] flex items-center justify-center text-[#64748b] text-sm">
          Not enough data for distribution.
        </div>
      );
    }

    return (
      <div className="h-[300px] sm:h-[400px] lg:h-[480px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distributionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: '#64748b', fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(distributionData.length / 8)}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip chartType="distribution" />}
            />
            <ReferenceLine x={distributionData.findIndex((b) => b.midpoint >= 0)} stroke="#2a3548" />
            <Bar
              dataKey="count"
              animationDuration={800}
              radius={[3, 3, 0, 0]}
              shape={(props) => {
                const { x, y, width, height, payload } = props as unknown as {
                  x: number; y: number; width: number; height: number;
                  payload: { midpoint: number };
                };
                const fill = payload.midpoint >= 0 ? '#22c55e' : '#ef4444';
                return <rect x={x} y={y} width={width} height={Math.abs(height)} fill={fill} rx={3} fillOpacity={0.8} />;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Rolling Sharpe
  if (selectedChartType === 'rolling') {
    if (rollingSharpeData.length === 0) {
      return (
        <div className="h-[300px] sm:h-[400px] flex items-center justify-center text-[#64748b] text-sm">
          Need at least 20 trading days for rolling Sharpe.
        </div>
      );
    }

    return (
      <div className="h-[300px] sm:h-[400px] lg:h-[480px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rollingSharpeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sharpeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: string) => {
                try { return format(parseISO(val), 'MMM d'); } catch { return val; }
              }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(v: number) => v.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip chartType="rolling" />} />
            <ReferenceLine y={0} stroke="#2a3548" />
            <ReferenceLine y={1} stroke="#22c55e33" strokeDasharray="5 5" label={{ value: 'Good', fill: '#22c55e', fontSize: 10 }} />
            <ReferenceLine y={2} stroke="#22c55e55" strokeDasharray="5 5" label={{ value: 'Great', fill: '#22c55e', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="sharpe"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#sharpeGradient)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Standard charts (line, area, bar, cumulative, drawdown)
  if (chartData.length === 0) {
    return (
      <div className="h-[300px] sm:h-[400px] lg:h-[480px] flex items-center justify-center text-[#64748b] text-sm">
        No data to display for the selected period.
      </div>
    );
  }

  const commonProps = {
    data: chartData,
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
  };

  const xAxisProps = {
    dataKey: 'date' as const,
    tick: { fill: '#64748b', fontSize: 10 },
    tickLine: false,
    axisLine: false,
    tickFormatter: (val: string) => {
      try { return format(parseISO(val), 'MMM d'); } catch { return val; }
    },
    minTickGap: 40,
  };

  const yAxisProps = {
    tick: { fill: '#64748b', fontSize: 10 },
    tickLine: false,
    axisLine: false,
    width: 65,
  };

  const gridProps = {
    strokeDasharray: '3 3' as const,
    stroke: '#1e293b',
    vertical: false,
  };

  const renderChart = () => {
    switch (selectedChartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={(v: number) => formatCurrency(v)} />
            <Tooltip content={<CustomTooltip chartType={selectedChartType} />} />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#equityGradient)"
              animationDuration={800}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={(v: number) => formatCurrency(v)} />
            <Tooltip content={<CustomTooltip chartType={selectedChartType} />} />
            <ReferenceLine y={0} stroke="#2a3548" />
            <Bar
              dataKey="pnl"
              animationDuration={800}
              radius={[2, 2, 0, 0]}
              fill="#3b82f6"
              shape={(props) => {
                const { x, y, width, height, payload } = props as unknown as {
                  x: number; y: number; width: number; height: number;
                  payload: { pnl: number };
                };
                const fill = payload.pnl >= 0 ? '#22c55e' : '#ef4444';
                return <rect x={x} y={y} width={width} height={Math.abs(height)} fill={fill} rx={2} fillOpacity={0.85} />;
              }}
            />
          </BarChart>
        );

      case 'cumulative':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="cumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
            <Tooltip content={<CustomTooltip chartType={selectedChartType} />} />
            <ReferenceLine y={0} stroke="#2a3548" />
            <Area
              type="monotone"
              dataKey="cumulativeReturnPct"
              stroke="#a855f7"
              strokeWidth={2}
              fill="url(#cumGradient)"
              animationDuration={800}
            />
          </AreaChart>
        );

      case 'drawdown':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
            <Tooltip content={<CustomTooltip chartType={selectedChartType} />} />
            <ReferenceLine y={0} stroke="#2a3548" />
            <Area
              type="monotone"
              dataKey="drawdownPct"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#ddGradient)"
              animationDuration={800}
            />
          </AreaChart>
        );

      // Default: line chart
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={(v: number) => formatCurrency(v)} />
            <Tooltip content={<CustomTooltip chartType={selectedChartType} />} />
            <Line
              type="monotone"
              dataKey="equity"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={800}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="h-[300px] sm:h-[400px] lg:h-[480px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
