'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, Wallet, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import TransactionForm, { TransactionFormValues } from '@/components/transactions/transaction-form';
import { Transaction } from '@/types';
import { toast } from 'sonner';
import { formatDate } from '@/lib/date';

const toCamel = (str: string) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

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

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { accounts, categories, transactions, setTransactions } = useAppStore();

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
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const linkClass = (active: boolean) =>
    cn(
      'flex flex-col items-center justify-center gap-1 text-xs leading-none py-3 px-2 min-h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 transition-all-smooth',
      active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground/80'
    );

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:hidden pb-[env(safe-area-inset-bottom)]"
        role="tablist"
        aria-label="Primary"
      >
        <div className="relative h-16">
          <div className="grid grid-cols-5 h-full">
            <Link
              href="/dashboard"
              role="tab"
              aria-label="Dashboard"
              aria-current={pathname === '/dashboard' ? 'page' : undefined}
              className={linkClass(pathname === '/dashboard')}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px]">Dashboard</span>
            </Link>
            <Link
              href="/transactions"
              role="tab"
              aria-label="Transactions"
              aria-current={pathname.startsWith('/transactions') ? 'page' : undefined}
              className={linkClass(pathname.startsWith('/transactions'))}
            >
              <ReceiptText className="h-5 w-5" />
              <span className="text-[10px]">Transactions</span>
            </Link>
            <div aria-hidden="true" />
            <Link
              href="/budgets"
              role="tab"
              aria-label="Budgets"
              aria-current={pathname.startsWith('/budgets') ? 'page' : undefined}
              className={linkClass(pathname.startsWith('/budgets'))}
            >
              <Wallet className="h-5 w-5" />
              <span className="text-[10px]">Budgets</span>
            </Link>
            <Link
              href="/settings"
              role="tab"
              aria-label="Settings"
              aria-current={pathname.startsWith('/settings') ? 'page' : undefined}
              className={linkClass(pathname.startsWith('/settings'))}
            >
              <Settings className="h-5 w-5" />
              <span className="text-[10px]">Settings</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute left-1/2 -top-4 h-12 w-12 -translate-x-1/2 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="New Transaction"
            aria-haspopup="dialog"
            aria-controls="new-transaction-dialog"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </nav>
      <TransactionForm
        id="new-transaction-dialog"
        open={open}
        onOpenChange={setOpen}
        accounts={accounts}
        categories={categories}
        onSubmit={handleSave}
      />
    </>
  );
}

export default MobileNav;
