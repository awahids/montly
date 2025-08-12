import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('transactions')
    .select(
      `*,
      account:accounts(name, type),
      from_account:accounts!transactions_from_account_id_fkey(name, type),
      to_account:accounts!transactions_to_account_id_fkey(name, type),
      category:categories(name, color, icon)`
    )
    .eq('user_id', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId, date, type, accountId, fromAccountId, toAccountId, amount, categoryId, note, tags } = await req.json();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      date,
      type,
      account_id: accountId,
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      amount,
      category_id: categoryId,
      note,
      tags,
    })
    .select(
      `*,
      account:accounts(name, type),
      from_account:accounts!transactions_from_account_id_fkey(name, type),
      to_account:accounts!transactions_to_account_id_fkey(name, type),
      category:categories(name, color, icon)`
    )
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}
