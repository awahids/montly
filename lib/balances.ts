import { createServerClient } from './supabase/server';

// Compute balances for multiple accounts in a single set of aggregate queries.
export async function getAccountBalances(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  accountIds: string[],
) {
  if (accountIds.length === 0) return {} as Record<string, number>;

  const uniqueIds = Array.from(new Set(accountIds));

  const { data: accounts, error: accErr } = await supabase
    .from('accounts')
    .select('id, opening_balance')
    .eq('user_id', userId)
    .in('id', uniqueIds);
  if (accErr) throw new Error(accErr.message);

  const balances: Record<string, number> = {};
  accounts?.forEach(a => {
    balances[a.id] = a.opening_balance;
  });

  const { data: incomes, error: incErr } = await supabase
    .from('transactions')
    .select('account_id, amount')
    .eq('user_id', userId)
    .in('account_id', uniqueIds)
    .eq('type', 'income');
  if (incErr) throw new Error(incErr.message);
  incomes?.forEach(row => {
    const id = row.account_id as string;
    const amt = row.amount as number;
    balances[id] = (balances[id] || 0) + amt;
  });

  const { data: expenses, error: expErr } = await supabase
    .from('transactions')
    .select('account_id, amount')
    .eq('user_id', userId)
    .in('account_id', uniqueIds)
    .eq('type', 'expense');
  if (expErr) throw new Error(expErr.message);
  expenses?.forEach(row => {
    const id = row.account_id as string;
    const amt = row.amount as number;
    balances[id] = (balances[id] || 0) - amt;
  });

  const { data: transferOut, error: outErr } = await supabase
    .from('transactions')
    .select('from_account_id, amount')
    .eq('user_id', userId)
    .in('from_account_id', uniqueIds)
    .eq('type', 'transfer');
  if (outErr) throw new Error(outErr.message);
  transferOut?.forEach(row => {
    const id = row.from_account_id as string;
    const amt = row.amount as number;
    balances[id] = (balances[id] || 0) - amt;
  });

  const { data: transferIn, error: inErr } = await supabase
    .from('transactions')
    .select('to_account_id, amount')
    .eq('user_id', userId)
    .in('to_account_id', uniqueIds)
    .eq('type', 'transfer');
  if (inErr) throw new Error(inErr.message);
  transferIn?.forEach(row => {
    const id = row.to_account_id as string;
    const amt = row.amount as number;
    balances[id] = (balances[id] || 0) + amt;
  });

  return balances;
}
