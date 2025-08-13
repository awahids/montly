import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';
import { getAccountBalances } from '@/lib/balances';

export async function GET() {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, type, currency')
      .eq('user_id', user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const balances = await getAccountBalances(
      supabase,
      user.id,
      data?.map((a) => a.id) ?? []
    );
    const rows = (data ?? []).map((acc) => ({
      ...acc,
      computedBalance: balances[acc.id] ?? 0,
    }));
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
