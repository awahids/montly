'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Transaction, Account, Category } from '@/types';
import { formatIDR } from '@/lib/currency';
import { format, parseISO } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Filter } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

export function RecentTransactions({ transactions, accounts, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    accountId: '',
    categoryId: '',
    type: '',
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      if (filters.accountId) {
        const matchesAccount =
          t.accountId === filters.accountId ||
          t.fromAccountId === filters.accountId ||
          t.toAccountId === filters.accountId;
        if (!matchesAccount) return false;
      }
      if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
      if (filters.type && t.type !== filters.type) return false;
      return true;
    });
  }, [transactions, filters]);
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.type === 'transfer') {
      return `Transfer from ${transaction.fromAccount?.name} to ${transaction.toAccount?.name}`;
    }
    return transaction.note || transaction.category?.name || 'No description';
  };

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case 'income':
        return 'default';
      case 'expense':
        return 'destructive';
      case 'transfer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <CardHeader className="space-y-2 sticky top-0 z-10 bg-background">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {open ? 'Hide' : 'Filters'}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="pt-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <Input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
              />
              <Input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
              />
              <Select
                value={filters.accountId}
                onValueChange={value => setFilters(f => ({ ...f, accountId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accounts</SelectItem>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.categoryId}
                onValueChange={value => setFilters(f => ({ ...f, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.type}
                onValueChange={value => setFilters(f => ({ ...f, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No transactions found.
              </p>
            ) : (
              filteredTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="text-sm font-medium">
                        {getTransactionDescription(transaction)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                        </p>
                        {transaction.account && (
                          <Badge variant="outline" className="text-xs">
                            {transaction.account.name}
                          </Badge>
                        )}
                        {transaction.tags && transaction.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {transaction.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {transaction.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{transaction.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : transaction.type === 'expense'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {transaction.type === 'expense' ? '-' : ''}
                      {formatIDR(transaction.amount)}
                    </p>
                    <Badge
                      variant={getTransactionBadgeVariant(transaction.type)}
                      className="text-xs mt-1"
                    >
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Collapsible>
    </Card>
  );
}