'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import * as LucideIcons from 'lucide-react';
import { Plus, Pencil, Trash, Calendar as CalendarIcon } from 'lucide-react';

import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatIDR } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { Transaction, Account, Category } from '@/types';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange, SelectRangeEventHandler } from 'react-day-picker';

import TransactionForm, {
  TransactionFormValues,
} from '@/components/transactions/transaction-form';

const toCamel = (str: string) =>
  str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function keysToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v)) as any;
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

export default function TransactionsPage() {
  const {
    user,
    accounts,
    categories,
    transactions,
    setAccounts,
    setCategories,
    setTransactions,
  } = useAppStore();

  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const handleDateRangeSelect: SelectRangeEventHandler = (range) => {
    setDateRange(range ?? { from: undefined, to: undefined });
  };
  const [accountFilter, setAccountFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();

  useEffect(() => {
    if (!user) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    try {

      if (!accounts.length) {
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user!.id)
          .eq('archived', false);
        if (accountsData) setAccounts(keysToCamel<Account[]>(accountsData));
      }
      if (!categories.length) {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user!.id);
        if (categoriesData) setCategories(keysToCamel<Category[]>(categoriesData));
      }
      await fetchTransactions();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('transactions')
      .select(
        `*,
        account:accounts(name, type),
        from_account:accounts!transactions_from_account_id_fkey(name, type),
        to_account:accounts!transactions_to_account_id_fkey(name, type),
        category:categories(name, color, icon)`
      )
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (data) setTransactions(keysToCamel<Transaction[]>(data));
  };

  const handleSave = async (values: TransactionFormValues) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      date: values.date.toISOString().split('T')[0],
      type: values.type,
      account_id: values.accountId,
      from_account_id: values.fromAccountId,
      to_account_id: values.toAccountId,
      category_id: values.categoryId,
      amount: values.amount,
      note: values.note,
      tags: [],
    };
    if (editing) {
      await supabase.from('transactions').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('transactions').insert(payload);
    }
    await fetchTransactions();
    setFormOpen(false);
    setEditing(undefined);
  };

  const handleDelete = async () => {
    if (!editing) return;
    await supabase.from('transactions').delete().eq('id', editing.id);
    await fetchTransactions();
    setFormOpen(false);
    setEditing(undefined);
  };

  const handleDeleteRow = async (t: Transaction) => {
    await supabase.from('transactions').delete().eq('id', t.id);
    await fetchTransactions();
  };

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setFormOpen(true);
  };

  const filteredTransactions = transactions.filter((t) => {
    const dateOk =
      (!dateRange.from || new Date(t.date) >= dateRange.from) &&
      (!dateRange.to || new Date(t.date) <= dateRange.to);
    const accountOk =
      accountFilter === 'all' ||
      t.accountId === accountFilter ||
      t.fromAccountId === accountFilter ||
      t.toAccountId === accountFilter;
    const categoryOk =
      categoryFilter === 'all' || t.categoryId === categoryFilter;
    const typeOk = typeFilter === 'all' || t.type === typeFilter;
    return dateOk && accountOk && categoryOk && typeOk;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Track your recent transactions.</p>
        </div>
        <Button className="hidden md:flex" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[250px] justify-start',
                !dateRange.from && 'text-muted-foreground'
              )}
            >
              {dateRange.from ? (
                dateRange.to ? (
                  `${format(dateRange.from, 'LLL dd, yyyy')} - ${format(
                    dateRange.to,
                    'LLL dd, yyyy'
                  )}`
                ) : (
                  format(dateRange.from, 'LLL dd, yyyy')
                )
              ) : (
                <span>Pick dates</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((t) => {
              const Icon = t.category?.icon
                ? (LucideIcons[
                    t.category.icon as keyof typeof LucideIcons
                  ] as any)
                : null;
              const title =
                t.note ||
                t.category?.name ||
                (t.type === 'transfer'
                  ? `Transfer from ${t.fromAccount?.name} to ${t.toAccount?.name}`
                  : 'No description');
              const color =
                t.type === 'income'
                  ? 'text-green-600'
                  : t.type === 'expense'
                  ? 'text-red-600'
                  : 'text-blue-600';
              const amountPrefix = t.type === 'expense' ? '-' : '';
              return (
                <TableRow key={t.id}>
                  <TableCell className="p-0">
                    {Icon && (
                      <Icon
                        className="h-4 w-4"
                        color={t.category?.color}
                      />
                    )}
                  </TableCell>
                  <TableCell>{title}</TableCell>
                  <TableCell>
                    {format(parseISO(t.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {t.account?.name ||
                      t.fromAccount?.name ||
                      t.toAccount?.name ||
                      '-'}
                  </TableCell>
                  <TableCell className={cn('text-right font-medium', color)}>
                    {amountPrefix}
                    {formatIDR(t.amount)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(t)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRow(t)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {filteredTransactions.map((t) => {
          const Icon = t.category?.icon
            ? (LucideIcons[t.category.icon as keyof typeof LucideIcons] as any)
            : null;
          const title =
            t.note ||
            t.category?.name ||
            (t.type === 'transfer'
              ? `Transfer from ${t.fromAccount?.name} to ${t.toAccount?.name}`
              : 'No description');
          const color =
            t.type === 'income'
              ? 'text-green-600'
              : t.type === 'expense'
              ? 'text-red-600'
              : 'text-blue-600';
          const amountPrefix = t.type === 'expense' ? '-' : '';
          return (
            <Card
              key={t.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {Icon && <Icon className="h-5 w-5" color={t.category?.color} />}
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(t.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn('text-sm font-semibold', color)}>
                  {amountPrefix}
                  {formatIDR(t.amount)}
                </p>
                <div className="flex justify-end space-x-1 mt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(t)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRow(t)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={openNew}
        className="md:hidden fixed bottom-6 right-6 rounded-full h-14 w-14 p-0"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <TransactionForm
        open={formOpen}
        onOpenChange={(o) => {
          if (!o) setEditing(undefined);
          setFormOpen(o);
        }}
        transaction={editing}
        accounts={accounts}
        categories={categories}
        onSubmit={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
}

