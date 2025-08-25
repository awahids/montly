'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  Smartphone,
  Wallet2,
  MoreHorizontal,
  Plus,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import { Account } from '@/types';
import { Card } from '@/components/ui/card';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const typeIcons = {
  bank: Building2,
  ewallet: Smartphone,
  cash: Wallet2,
};

const formatAccountNumber = (num: string) =>
  num.replace(/(\d{4})(?=\d)/g, '$1 ');

export default function AccountsPage() {
  const {
    user,
    accounts,
    setAccounts,
    loading,
    setLoading,
  } = useAppStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts?page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch accounts');
      setAccounts(data.rows);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }, [user, page, setAccounts, setLoading]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Account deleted');
      await fetchAccounts();
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
      toast.success(archived ? 'Account archived' : 'Account unarchived');
      await fetchAccounts();
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
          const balance = account.currentBalance ?? 0;
          return (
            <Card
              key={account.id}
              className="relative h-44 overflow-hidden rounded-xl text-white shadow hover:shadow-lg transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70" />
              <div className="relative z-10 flex h-full flex-col justify-between p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{account.name}</span>
                    {account.archived && (
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white"
                      >
                        Archived
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
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
                </div>
                {account.accountNumber && (
                  <div className="mt-4 flex items-center font-mono text-lg tracking-widest">
                    <span>{formatAccountNumber(account.accountNumber)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-6 w-6 text-white hover:bg-white/20"
                      onClick={() => {
                        navigator.clipboard.writeText(account.accountNumber!);
                        toast.success('Account number copied');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="mt-auto">
                  <p className="text-xs uppercase">{account.currency}</p>
                  <div className="text-2xl font-bold">
                    {formatCurrency(balance, account.currency)}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {total > pageSize && (
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: Math.ceil(total / pageSize) }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))
                }
                className={
                  page === Math.ceil(total / pageSize)
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Button
        onClick={() => {
          setEditingAccount(null);
          setDialogOpen(true);
        }}
        className="md:hidden fixed right-6 bottom-[calc(5rem+env(safe-area-inset-bottom))] h-12 w-12 rounded-full p-0 shadow-lg transition-transform hover:scale-105"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto p-0 sm:p-6">
          <DialogHeader className="px-4 pt-4 sm:px-0 sm:pt-0">
            <DialogTitle>
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 sm:px-0">
            <AccountForm
              account={editingAccount || undefined}
              onSuccess={() => {
                setDialogOpen(false);
                fetchAccounts();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

