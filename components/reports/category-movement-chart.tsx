'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { toIDR } from '@/lib/currency';
import type { ChartResponse } from '@/types';

export default function CategoryMovementChart({ month }: { month: string }) {
  const [chartData, setChartData] = useState<ChartResponse['data']>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState<{ [k: string]: boolean }>({});
  const toggleLine = (key: string) =>
    setHidden((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/budget-vs-actual?month=${month}&type=expense`)
      .then((res) => res.json())
      .then((res: ChartResponse) => {
        setChartData(res.data || []);
        setError(false);
      })
      .catch(() => {
        setChartData([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [month]);

  const CustomizedAxisTick = ({ x, y, payload }: any) => (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        transform="rotate(-90)"
        className="text-[10px]"
      >
        {payload.value}
      </text>
    </g>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload.find((p: any) => p.dataKey === 'planned')?.value ?? 0;
      const a = payload.find((p: any) => p.dataKey === 'actual')?.value ?? 0;
      const d = payload.find((p: any) => p.dataKey === 'diff')?.value ?? 0;
      const diffPct = p > 0 ? (d / p) * 100 : 0;
      return (
        <div className="rounded border bg-background p-2 text-xs">
          <div className="font-medium">{label}</div>
          <div>Planned: {toIDR(p)}</div>
          <div>Actual: {toIDR(a)}</div>
          <div>
            Diff: {toIDR(d)} {p > 0 && `(${diffPct.toFixed(0)}%)`}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-4 text-xs">
        {payload.map((entry: any) => (
          <label key={entry.dataKey} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={!hidden[entry.dataKey]}
              onChange={() => toggleLine(entry.dataKey)}
            />
            {entry.value}
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-destructive">Failed to load data</div>
      )}
      {loading && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
      {!loading && !error && chartData.length === 0 && (
        <div className="text-sm text-muted-foreground">No data</div>
      )}
      {chartData.length > 0 && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category_name"
                interval={0}
                height={70}
                tick={<CustomizedAxisTick />}
              >
                <Label value="Categories" position="right" angle={90} dx={10} />
              </XAxis>
              <YAxis tickFormatter={(v: number) => toIDR(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
              <ReferenceLine y={0} stroke="#888" />
              {!hidden.planned && (
                <Line type="monotone" dataKey="planned" stroke="#3B82F6" dot />
              )}
              {!hidden.actual && (
                <Line type="monotone" dataKey="actual" stroke="#16a34a" dot />
              )}
              {!hidden.diff && (
                <Line type="monotone" dataKey="diff" stroke="#dc2626" dot />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
