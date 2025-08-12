'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { Account } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { AccountForm } from '@/components/accounts/account-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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

export default function EditAccountPage() {
  const params = useParams<{ id: string }>();
  const { accounts } = useAppStore();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = accounts.find((a) => a.id === params.id);
    if (existing) {
      setAccount(existing);
      setLoading(false);
    } else {
      const fetchAccount = async () => {
        const { data } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', params.id)
          .single();
        if (data) setAccount(keysToCamel<Account>(data));
        setLoading(false);
      };
      fetchAccount();
    }
  }, [params.id, accounts]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!account) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Account</h2>
        <p className="text-muted-foreground">Update account details.</p>
      </div>
      <AccountForm account={account} />
    </div>
  );
}

