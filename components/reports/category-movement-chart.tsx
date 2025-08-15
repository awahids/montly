'use client';

import { useState } from 'react';
import useSWR from 'swr';
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
} from 'recharts';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toIDR } from '@/lib/currency';
import type { ChartResponse } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryMovementChart() {
  const now = new Date();
  const defaultMonth = now.toISOString().slice(0, 7);
  const [month, setMonth] = useState(defaultMonth);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const { data, error, isLoading } = useSWR<ChartResponse>(
    `/api/reports/budget-vs-actual?month=${month}&type=${type}`,
    fetcher
  );
  const [hidden, setHidden] = useState<{ [k: string]: boolean }>({});
  const toggleLine = (key: string) =>
    setHidden((prev) => ({ ...prev, [key]: !prev[key] }));

  const chartData = data?.data ?? [];

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full sm:w-fit"
          aria-label="Month"
        />
        <ToggleGroup
          type="single"
          value={type}
          onValueChange={(v) => setType((v as any) || 'expense')}
          className="w-full sm:w-fit"
        >
          <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
          <ToggleGroupItem value="income">Income</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {error && (
        <div className="text-sm text-destructive">Failed to load data</div>
      )}
      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
      {!isLoading && !error && chartData.length === 0 && (
        <div className="text-sm text-muted-foreground">No data</div>
      )}
      {chartData.length > 0 && (
        <div className="overflow-x-auto">
          <div className="h-72 min-w-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category_name"
                  interval={0}
                  tickFormatter={(v: string) =>
                    v.length > 10 ? `${v.slice(0, 10)}…` : v
                  }
                />
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
        </div>
      )}
    </div>
  );
}
