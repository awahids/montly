'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Account } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['bank', 'ewallet', 'cash']),
  currency: z.string().min(1, 'Currency is required'),
  openingBalance: z.coerce.number(),
  archived: z.boolean().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
  account?: Account;
}

export function AccountForm({ account }: AccountFormProps) {
  const router = useRouter();
  const { user, accounts, setAccounts } = useAppStore();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name ?? '',
      type: account?.type ?? 'bank',
      currency: account?.currency ?? 'IDR',
      openingBalance: account?.openingBalance ?? 0,
      archived: account?.archived ?? false,
    },
  });

  const onSubmit = async (values: AccountFormValues) => {
    if (!user) return;
    try {
      if (account) {
        const { error } = await supabase
          .from('accounts')
          .update({
            name: values.name,
            type: values.type,
            currency: values.currency,
            opening_balance: values.openingBalance,
            archived: values.archived,
          })
          .eq('id', account.id);
        if (error) throw error;
        setAccounts(
          accounts.map((a) =>
            a.id === account.id ? { ...a, ...values } : a
          )
        );
        toast.success('Account updated');
      } else {
        const { data, error } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id,
            name: values.name,
            type: values.type,
            currency: values.currency,
            opening_balance: values.openingBalance,
            archived: values.archived,
          })
          .select()
          .single();
        if (error) throw error;
        const newAccount: Account = {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          type: data.type,
          currency: data.currency,
          openingBalance: data.opening_balance,
          archived: data.archived,
        };
        setAccounts([...accounts, newAccount]);
        toast.success('Account created');
      }
      router.push('/accounts');
    } catch (err) {
      console.error('Failed to save account:', err);
      toast.error('Failed to save account');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="openingBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opening Balance</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="archived"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Archived</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {account ? 'Update' : 'Create'} Account
        </Button>
      </form>
    </Form>
  );
}

export default AccountForm;

