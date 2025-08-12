'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types';
import { formatIDR } from '@/lib/currency';
import { format, parseISO } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: Props) {
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
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No transactions yet. Start by adding your first transaction.
            </p>
          ) : (
            transactions.map((transaction) => (
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
                  <p className={`text-sm font-semibold ${
                    transaction.type === 'income' 
                      ? 'text-green-600' 
                      : transaction.type === 'expense'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}>
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
    </Card>
  );
}