'use client';
// @ts-nocheck

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Transaction, CategorySpend } from '@/types';
import { formatIDR } from '@/lib/currency';
import { format, subMonths } from 'date-fns';

interface Props {
  transactions: Transaction[];
  categorySpends: CategorySpend[];
}

export function DashboardCharts({ transactions, categorySpends }: Props) {
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) =>
      subMonths(new Date(), 5 - i)
    );
    return months.map(date => {
      const month = date.toISOString().slice(0, 7);
      const income = transactions
        .filter(t => t.type === 'income' && t.budgetMonth === month)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter(t => t.type === 'expense' && t.budgetMonth === month)
        .reduce((sum, t) => sum + t.amount, 0);
      const savings = income - expenses;
      return {
        month: format(date, 'MMM'),
        income,
        expenses,
        savings,
      };
    });
  }, [transactions]);

  const radarData = useMemo(
    () =>
      categorySpends.map(c => ({
        name: c.categoryName,
        value: c.amount,
      })),
    [categorySpends]
  );

  const [metric, setMetric] = useState<'income' | 'expenses' | 'savings'>(
    'income'
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle>Earning Reports</CardTitle>
            <Tabs
              value={metric}
              onValueChange={v => setMetric(v as any)}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="savings">Savings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tickFormatter={value => formatIDR(value)}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  formatter={(value: number) => formatIDR(value)}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Bar
                  dataKey={metric}
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis
                  tickFormatter={value => formatIDR(value)}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
