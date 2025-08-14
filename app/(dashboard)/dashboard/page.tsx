'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatIDR } from '@/lib/currency';
import {
  DashboardKPIs,
  CategorySpend,
  Account,
  Transaction,
  Budget,
  Category,
} from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';

const toCamel = (str: string) =>
  str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function keysToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v)) as any;
  }
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[toCamel(key)] = keysToCamel(value);
    }
    return result as T;
  }
  return obj as T;
}

export default function DashboardPage() {
  const {
    user,
    accounts,
    categories,
    transactions,
    budgets,
    setAccounts,
    setTransactions,
    setBudgets,
    setCategories,
    loading,
    setLoading,
  } = useAppStore();
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalBalance: 0,
    monthlyBudget: 0,
    monthlyActual: 0,
    mtdSpend: 0,
    dailyAverage: 0,
    remainingAllowance: 0,
  });
  const [categorySpends, setCategorySpends] = useState<CategorySpend[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch accounts
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('archived', false);
        
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);
        
        // Fetch transactions (last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select(`
            *,
            account:accounts!transactions_account_id_fkey(name, type),
            from_account:accounts!transactions_from_account_id_fkey(name, type),
            to_account:accounts!transactions_to_account_id_fkey(name, type),
            category:categories(name, color, icon)
          `)
          .eq('user_id', user.id)
          .gte('date', threeMonthsAgo.toISOString().split('T')[0])
          .order('date', { ascending: false });

        // Fetch budgets (current month)
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: budgetsData } = await supabase
          .from('budgets')
          .select(
            `*, account:accounts(*), items:budget_items(*, category:categories(*))`
          )
          .eq('user_id', user.id)
          .eq('month', currentMonth);

        if (accountsData) setAccounts(keysToCamel<Account[]>(accountsData));
        if (categoriesData) setCategories(keysToCamel<Category[]>(categoriesData));
        if (transactionsData) setTransactions(keysToCamel<Transaction[]>(transactionsData));
        if (budgetsData) setBudgets(keysToCamel<Budget[]>(budgetsData));

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, setAccounts, setTransactions, setBudgets, setCategories, setLoading]);

  useEffect(() => {
    if (!accounts.length || !transactions.length) return;

    // Calculate KPIs
    const currentMonth = new Date().toISOString().slice(0, 7);
    const today = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    // Total balance
    let totalBalance = 0;
    accounts.forEach(account => {
      const accountTransactions = transactions.filter(t =>
        t.accountId === account.id ||
        t.fromAccountId === account.id ||
        t.toAccountId === account.id
      );

      let balance = account.openingBalance;
      accountTransactions.forEach(t => {
        if (t.type === 'income' && t.accountId === account.id) {
          balance += t.amount;
        } else if (t.type === 'expense' && t.accountId === account.id) {
          balance -= t.amount;
        } else if (t.type === 'transfer') {
          if (t.fromAccountId === account.id) {
            balance -= t.amount;
          } else if (t.toAccountId === account.id) {
            balance += t.amount;
          }
        }
      });
      totalBalance += balance;
    });

    // Monthly budget and actual
    const currentBudgets = budgets.filter(b => b.month === currentMonth);
    const monthlyBudget = currentBudgets.reduce((sum, b) => sum + b.totalAmount, 0);
    
    const monthlyActual = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    // MTD spend (same as monthly actual for current month)
    const mtdSpend = monthlyActual;

    // Daily average and remaining allowance
    const dailyAverage = today > 0 ? mtdSpend / today : 0;
    const remainingBudget = monthlyBudget - monthlyActual;
    const remainingDays = daysInMonth - today;
    const remainingAllowance = remainingDays > 0 ? remainingBudget / remainingDays : 0;

    setKpis({
      totalBalance,
      monthlyBudget,
      monthlyActual,
      mtdSpend,
      dailyAverage,
      remainingAllowance,
    });

    // Category spending
    if (currentBudgets.length) {
      const categorySpendData: CategorySpend[] = currentBudgets.flatMap(b =>
        (b.items || []).map(item => {
          const actual = transactions
            .filter(
              t =>
                t.type === 'expense' &&
                t.accountId === b.accountId &&
                t.categoryId === item.categoryId &&
                t.date.startsWith(currentMonth)
            )
            .reduce((sum, t) => sum + t.amount, 0);

          return {
            categoryId: item.categoryId,
            categoryName: item.category?.name || 'Unknown',
            amount: actual,
            budgeted: item.amount,
            color: item.category?.color || '#6B7280',
          };
        })
      );
      setCategorySpends(categorySpendData);
    }
  }, [accounts, transactions, budgets]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const kpiCards = [
    {
      title: 'Total Balance',
      value: formatIDR(kpis.totalBalance),
      icon: Wallet,
      trend: kpis.totalBalance >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Monthly Budget vs Actual',
      value: `${formatIDR(kpis.monthlyActual)} / ${formatIDR(kpis.monthlyBudget)}`,
      icon: TrendingUp,
      trend: kpis.monthlyActual <= kpis.monthlyBudget ? 'positive' : 'negative',
    },
    {
      title: 'MTD Spending',
      value: formatIDR(kpis.mtdSpend),
      icon: TrendingDown,
      trend: 'neutral',
    },
    {
      title: 'Daily Average',
      value: formatIDR(kpis.dailyAverage),
      icon: Calendar,
      trend: 'neutral',
    },
    {
      title: 'Remaining Daily Allowance',
      value: formatIDR(kpis.remainingAllowance),
      icon: DollarSign,
      trend: kpis.remainingAllowance >= 0 ? 'positive' : 'negative',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your financial health
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${
                card.trend === 'positive' 
                  ? 'text-green-600' 
                  : card.trend === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        transactions={transactions}
        categorySpends={categorySpends}
      />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}