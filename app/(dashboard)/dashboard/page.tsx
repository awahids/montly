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
import { Button } from '@/components/ui/button';
import TransactionForm, {
  TransactionFormValues,
} from '@/components/transactions/transaction-form';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/lib/date';

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
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
  });
  const [categorySpends, setCategorySpends] = useState<CategorySpend[]>([]);
  const [formOpen, setFormOpen] = useState(false);

  const handleSave = async (values: TransactionFormValues) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgetMonth: values.budgetMonth,
          actualDate: formatDate(values.actualDate),
          date: formatDate(values.actualDate),
          type: values.type,
          accountId: values.accountId,
          fromAccountId: values.fromAccountId,
          toAccountId: values.toAccountId,
          categoryId: values.categoryId,
          amount: values.amount,
          note: values.note,
          tags: values.tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create transaction');
      const tx = keysToCamel<Transaction>(data);
      setTransactions([tx, ...transactions]);
      toast.success('Transaction created');
      setFormOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

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
          .gte('date', formatDate(threeMonthsAgo))
          .order('date', { ascending: false });

        // Fetch budgets (current month)
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: budgetsData } = await supabase
          .from('budgets')
          .select(
            `*, items:budget_items(*, category:categories(*))`
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

    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && t.budgetMonth === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense' && t.budgetMonth === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = monthlyIncome - monthlyExpenses;

    setKpis({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savings,
    });

    // Category spending from transactions
    const categoryMap = new Map<string, CategorySpend>();

    transactions
      .filter(
        t => t.type === 'expense' && t.budgetMonth === currentMonth
      )
      .forEach(t => {
        if (!t.categoryId || !t.category) return;
        const existing = categoryMap.get(t.categoryId);
        if (existing) {
          existing.amount += t.amount;
        } else {
          categoryMap.set(t.categoryId, {
            categoryId: t.categoryId,
            categoryName: t.category.name,
            amount: t.amount,
            budgeted: 0,
            color: t.category.color || '#6B7280',
          });
        }
      });

    currentBudgets.forEach(b =>
      (b.items || []).forEach(item => {
        const existing = categoryMap.get(item.categoryId);
        if (existing) {
          existing.budgeted = item.amount;
        } else {
          categoryMap.set(item.categoryId, {
            categoryId: item.categoryId,
            categoryName: item.category?.name || 'Unknown',
            amount: 0,
            budgeted: item.amount,
            color: item.category?.color || '#6B7280',
          });
        }
      })
    );

    setCategorySpends(Array.from(categoryMap.values()));
  }, [accounts, transactions, budgets]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const summaryCards = [
    {
      title: 'Total Balance',
      value: formatIDR(kpis.totalBalance),
      icon: Wallet,
    },
    {
      title: 'Monthly Income',
      value: formatIDR(kpis.monthlyIncome),
      icon: TrendingUp,
    },
    {
      title: 'Monthly Expenses',
      value: formatIDR(kpis.monthlyExpenses),
      icon: TrendingDown,
    },
    {
      title: 'Savings',
      value: formatIDR(kpis.savings),
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Good Morning{user?.name ? `, ${user.name}` : ''}
          </h2>
          <p className="text-muted-foreground">
            Here is your financial overview
          </p>
        </div>
        <Button
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary text-white shadow-lg"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
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

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        accounts={accounts}
        categories={categories}
        onSubmit={handleSave}
      />
    </div>
  );
}