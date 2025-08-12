import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { date, type, accountId, fromAccountId, toAccountId, amount, categoryId, note, tags } = await req.json();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('transactions')
    .update({
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
    .eq('id', params.id)
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { error } = await supabase.from('transactions').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
