'use client';

import { useEffect, useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatIDR } from '@/lib/currency';
import { Download, Filter } from 'lucide-react';

interface TrendRow {
  month: string;
  income: number;
  expense: number;
}

interface CategoryRow {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
}

interface SummaryResponse {
  daily: { date: string; amount: number }[];
  categories: CategoryRow[];
}

export default function ReportsPage() {
  const now = new Date();
  const defaultMonth = now.toISOString().slice(0, 7);
  const defaultYear = String(now.getUTCFullYear());

  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [summary, setSummary] = useState<SummaryResponse>({ daily: [], categories: [] });
  const [trend, setTrend] = useState<TrendRow[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryRow[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard?month=${month}`)
      .then(res => res.json())
      .then(data => setSummary({ daily: data.daily || [], categories: data.categories || [] }))
      .catch(() => setSummary({ daily: [], categories: [] }));
  }, [month]);

  useEffect(() => {
    fetch(`/api/reports/income-expense?year=${year}`)
      .then(res => res.json())
      .then(res => setTrend(res.data || []))
      .catch(() => setTrend([]));
  }, [year]);

  useEffect(() => {
    fetch(`/api/reports/category?month=${month}`)
      .then(res => res.json())
      .then(res => setCategoryData(res.data || []))
      .catch(() => setCategoryData([]));
  }, [month]);

  const exportCSV = (rows: any[], filename: string) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]).join(',');
    const csv = headers + '\n' + rows.map(r => Object.values(r).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const dailyData = summary.daily.map(d => ({
    date: d.date.slice(8, 10),
    amount: d.amount,
  }));

  return (
    <div className="space-y-6">
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
            <p className="text-muted-foreground">Analyze your finances</p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Input type="number" value={year} onChange={e => setYear(e.target.value)} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Monthly Summary</TabsTrigger>
          <TabsTrigger value="trend">Income vs Expense Trend</TabsTrigger>
          <TabsTrigger value="category">Category Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => exportCSV(summary.daily, `daily-${month}.csv`)}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id="sumColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={v => formatIDR(v)} />
                      <Tooltip formatter={(v: number) => formatIDR(v)} />
                      <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="url(#sumColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Expense by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.categories}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                      >
                        {summary.categories.map(entry => (
                          <Cell key={entry.categoryId} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatIDR(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => exportCSV(trend, `trend-${year}.csv`)}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expense ({year})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={v => formatIDR(v)} />
                    <Tooltip formatter={(v: number) => formatIDR(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#16a34a" />
                    <Line type="monotone" dataKey="expense" stroke="#dc2626" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => exportCSV(categoryData, `categories-${month}.csv`)}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown ({month})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={70}
                    >
                      {categoryData.map(entry => (
                        <Cell key={entry.categoryId} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatIDR(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
