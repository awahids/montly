'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Smartphone,
  Wallet2,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import { Account, Transaction } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccountForm } from '@/components/accounts/account-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const typeIcons = {
  bank: Building2,
  ewallet: Smartphone,
  cash: Wallet2,
};

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

export default function AccountsPage() {
  const {
    user,
    accounts,
    transactions,
    setAccounts,
    setTransactions,
    loading,
    setLoading,
    getCurrentBalance,
  } = useAppStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);
        if (accountsData) setAccounts(keysToCamel<Account[]>(accountsData));

        if (!transactions.length) {
          const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id);
          if (txData) setTransactions(keysToCamel<Transaction[]>(txData));
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, setAccounts, setTransactions, transactions.length, setLoading]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw error;
      setAccounts(accounts.filter((a) => a.id !== id));
      toast.success('Account deleted');
    } catch (err) {
      console.error('Failed to delete account:', err);
      toast.error('Failed to delete account');
    }
  };

  const handleArchive = async (id: string, archived: boolean) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ archived })
        .eq('id', id);
      if (error) throw error;
      setAccounts(
        accounts.map((a) => (a.id === id ? { ...a, archived } : a))
      );
      toast.success(archived ? 'Account archived' : 'Account unarchived');
    } catch (err) {
      console.error('Failed to update account:', err);
      toast.error('Failed to update account');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">View and manage your accounts.</p>
        </div>
        <div className="hidden md:block">
          <Button
            onClick={() => {
              setEditingAccount(null);
              setDialogOpen(true);
            }}
            className="transition-transform hover:scale-105"
          >
            Add Account
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const Icon = typeIcons[account.type];
          const balance = getCurrentBalance(account.id);
          return (
            <Card
              key={account.id}
              className="bg-muted/50 hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span>{account.name}</span>
                  {account.archived && (
                    <Badge variant="secondary">Archived</Badge>
                  )}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingAccount(account);
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleArchive(account.id, !account.archived)
                      }
                    >
                      {account.archived ? 'Unarchive' : 'Archive'}
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete account?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(account.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(balance, account.currency)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {account.currency}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={() => {
          setEditingAccount(null);
          setDialogOpen(true);
        }}
        className="md:hidden fixed bottom-6 right-6 h-12 w-12 rounded-full p-0 shadow-lg transition-transform hover:scale-105"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </DialogTitle>
          </DialogHeader>
          <AccountForm
            account={editingAccount || undefined}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

