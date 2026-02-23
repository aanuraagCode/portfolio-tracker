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
import { formatCurrencyFull, formatPercent } from '../../utils/calculations';
import type { ChartType } from '../../types';

/* Custom tooltip */
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
    <div className="bg-[#1a2235] border border-[#2a3548] rounded-lg p-3 shadow-xl text-sm">
      <p className="text-[#64748b] font-medium mb-1.5">
        {format(parseISO(label), 'MMM d, yyyy')}
      </p>
      {chartType === 'drawdown' ? (
        <p className="text-red-400 font-semibold">
          Drawdown: {formatPercent(data.drawdown as number)}
        </p>
      ) : chartType === 'cumulative' ? (
        <p className="text-blue-400 font-semibold">
          Return: {formatPercent(data.cumulativeReturn as number)}
        </p>
      ) : chartType === 'bar' ? (
        <p
          className={`font-semibold ${
            (data.pnl as number) >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          P&L: {formatCurrencyFull(data.pnl as number)}
        </p>
      ) : (
        <>
          <p className="text-white font-semibold">
            Equity: {formatCurrencyFull(data.equity as number)}
          </p>
          <p
            className={`${
              (data.pnl as number) >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            P&L: {formatCurrencyFull(data.pnl as number)}
          </p>
        </>
      )}
    </div>
  );
}

export default function PortfolioChart() {
  const { filteredEquityCurve, selectedChartType } = usePortfolioStore();

  // Prepare chart data with formatted date axis labels
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
    dataKey: 'date',
    tick: { fill: '#64748b', fontSize: 11 },
    tickLine: false,
    axisLine: false,
    tickFormatter: (val: string) => {
      try {
        return format(parseISO(val), 'MMM d');
      } catch {
        return val;
      }
    },
    minTickGap: 40,
  };

  const yAxisProps = {
    tick: { fill: '#64748b', fontSize: 11 },
    tickLine: false,
    axisLine: false,
    width: 70,
  };

  const gridProps = {
    strokeDasharray: '3 3',
    stroke: '#1f2b42',
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
            <YAxis
              {...yAxisProps}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              content={<CustomTooltip chartType={selectedChartType} />}
            />
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
            <YAxis
              {...yAxisProps}
              tickFormatter={(v: number) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              content={<CustomTooltip chartType={selectedChartType} />}
            />
            <ReferenceLine y={0} stroke="#2a3548" />
            <Bar
              dataKey="pnl"
              animationDuration={800}
              radius={[2, 2, 0, 0]}
              fill="#3b82f6"
              // Color individual bars based on P&L sign
              shape={(props) => {
                const { x, y, width, height, payload } = props as unknown as {
                  x: number;
                  y: number;
                  width: number;
                  height: number;
                  payload: { pnl: number };
                };
                const fill = payload.pnl >= 0 ? '#10b981' : '#ef4444';
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={Math.abs(height)}
                    fill={fill}
                    rx={2}
                  />
                );
              }}
            />
          </BarChart>
        );

      case 'cumulative':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="cumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis
              {...yAxisProps}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            />
            <Tooltip
              content={<CustomTooltip chartType={selectedChartType} />}
            />
            <ReferenceLine y={0} stroke="#2a3548" />
            <Area
              type="monotone"
              dataKey="cumulativeReturnPct"
              stroke="#8b5cf6"
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
            <YAxis
              {...yAxisProps}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            />
            <Tooltip
              content={<CustomTooltip chartType={selectedChartType} />}
            />
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
            <YAxis
              {...yAxisProps}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              content={<CustomTooltip chartType={selectedChartType} />}
            />
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

