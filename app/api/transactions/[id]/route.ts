import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { transactionSchema } from '@/lib/validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  let body: z.infer<typeof transactionSchema>;
  try {
    body = transactionSchema.partial().parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    if (
      process.env.DISALLOW_NEGATIVE_BALANCE === 'true' &&
      body.type === 'transfer' &&
      body.fromAccountId &&
      body.amount !== undefined
    ) {
      const err = await ensureTransferBalance(
        supabase,
        user.id,
        body.fromAccountId,
        body.amount
      );
      if (err) {
        return NextResponse.json({ error: err }, { status: 400 });
      }
    }
    const { data, error } = await supabase
      .from('transactions')
      .update({
        date: body.date,
        type: body.type,
        account_id: body.accountId,
        from_account_id: body.fromAccountId,
        to_account_id: body.toAccountId,
        amount: body.amount,
        category_id: body.categoryId,
        note: body.note,
        tags: body.tags,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select(
        `*,
        account:accounts(name, type),
        from_account:accounts!transactions_from_account_id_fkey(name, type),
        to_account:accounts!transactions_to_account_id_fkey(name, type),
        category:categories(name, color, icon)`
      )
      .single();
    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

async function ensureTransferBalance(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  fromAccountId: string,
  amount: number
) {
  const { data: account, error: accErr } = await supabase
    .from('accounts')
    .select('opening_balance')
    .eq('id', fromAccountId)
    .eq('user_id', userId)
    .single();
  if (accErr || !account) return accErr?.message || 'Account not found';
  const { data: txs, error: txErr } = await supabase
    .from('transactions')
    .select('type, amount, account_id, from_account_id, to_account_id')
    .eq('user_id', userId)
    .or(
      `account_id.eq.${fromAccountId},from_account_id.eq.${fromAccountId},to_account_id.eq.${fromAccountId}`
    );
  if (txErr) return txErr.message;
  let balance = account.opening_balance;
  txs?.forEach(t => {
    if (t.type === 'income' && t.account_id === fromAccountId) balance += t.amount;
    if (t.type === 'expense' && t.account_id === fromAccountId) balance -= t.amount;
    if (t.type === 'transfer') {
      if (t.from_account_id === fromAccountId) balance -= t.amount;
      if (t.to_account_id === fromAccountId) balance += t.amount;
    }
  });
  if (balance - amount < 0) return 'Insufficient funds';
  return null;
}
