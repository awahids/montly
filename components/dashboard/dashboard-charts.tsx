'use client';
// @ts-nocheck

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, CategorySpend } from '@/types';
import { formatIDR } from '@/lib/currency';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

interface Props {
  transactions: Transaction[];
  categorySpends: CategorySpend[];
}

export function DashboardCharts({ transactions, categorySpends }: Props) {
  const dailyExpenseData = useMemo(() => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(day, 'MMM dd'),
        amount: dayExpenses,
      };
    });
  }, [transactions]);

  const categoryPieData = useMemo(() => {
    return categorySpends
      .filter(c => c.amount > 0)
      .map(category => ({
        name: category.categoryName,
        value: category.amount,
        color: category.color,
      }));
  }, [categorySpends]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Daily Expenses Line Chart */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Daily Expenses (Current Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyExpenseData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatIDR(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatIDR(value), 'Amount']}
                  labelStyle={{ color: '#374151' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Pie Chart */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Expense by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatIDR(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}