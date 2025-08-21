
'use client';

import { useState } from 'react';
import { useOffline } from '@/hooks/use-offline';
import { useAppStore } from '@/lib/store';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface OfflineTransactionFormProps {
  onSuccess?: () => void;
}

export function OfflineTransactionForm({ onSuccess }: OfflineTransactionFormProps) {
  const { isOnline, addOfflineChange } = useOffline();
  const { accounts, categories, transactions, setTransactions, user } = useAppStore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as const,
    amount: '',
    description: '',
    accountId: '',
    categoryId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newTransaction: Transaction = {
        id: uuidv4(),
        user_id: user?.id || '',
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        account_id: formData.accountId,
        category_id: formData.categoryId,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        budget_month: new Date().toISOString().slice(0, 7),
      };

      if (isOnline) {
        // Normal online flow
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTransaction),
        });

        if (!response.ok) throw new Error('Failed to create transaction');
      } else {
        // Offline flow
        await addOfflineChange('create', 'transactions', newTransaction);
      }

      // Update local state immediately
      setTransactions([...transactions, newTransaction]);

      toast({
        title: isOnline ? 'Transaction created' : 'Transaction saved offline',
        description: isOnline 
          ? 'Your transaction has been saved successfully.'
          : 'Your transaction will be synced when you reconnect.',
      });

      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        accountId: '',
        categoryId: '',
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: 'income' | 'expense') => 
            setFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Transaction description"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account">Account</Label>
        <Select
          value={formData.accountId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.filter(cat => cat.type === formData.type).map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : isOnline ? 'Create Transaction' : 'Save Offline'}
      </Button>

      {!isOnline && (
        <p className="text-sm text-muted-foreground text-center">
          This transaction will be saved locally and synced when you reconnect.
        </p>
      )}
    </form>
  );
}
