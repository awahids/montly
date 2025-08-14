import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';
import { budgetSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET(req: Request) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
  const offset = (page - 1) * pageSize;

  try {
    const user = await getUser();
    const { data: budgets, error, count } = await supabase
      .from('budgets')
      .select('id, month, account_id, total_amount', { count: 'exact' })
      .eq('user_id', user.id)
      .like('month', `${year}-%`)
      .order('month', { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!budgets || budgets.length === 0) {
      return NextResponse.json({ data: [], total: count || 0 });
    }
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('amount, date, account_id')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', `${year}-01-01`)
      .lt('date', `${Number(year) + 1}-01-01`);
    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 });
    }
    const actualByKey: Record<string, number> = {};
    for (const t of tx || []) {
      const monthKey = new Date(t.date)
        .toLocaleDateString('en-CA', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
        })
        .slice(0, 7);
      const key = `${t.account_id}-${monthKey}`;
      actualByKey[key] = (actualByKey[key] || 0) + t.amount;
    }
    const result = budgets.map(b => ({
      id: b.id,
      month: b.month,
      accountId: b.account_id,
      planned: b.total_amount,
      actual: actualByKey[`${b.account_id}-${b.month}`] || 0,
    }));
    return NextResponse.json({ data: result, total: count || 0 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  const supabase = createServerClient();
  let body: z.infer<typeof budgetSchema>;
  try {
    body = budgetSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', body.accountId)
      .eq('user_id', user.id)
      .single();
    if (!account) {
      return NextResponse.json({ error: 'Invalid account' }, { status: 400 });
    }
    const { data: budget, error } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: user.id,
          month: body.month,
          account_id: body.accountId,
          total_amount: body.totalAmount,
        },
        { onConflict: 'user_id,month,account_id' }
      )
      .select('id, month, account_id, total_amount')
      .single();
    if (error || !budget) {
      return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 400 });
    }
    if (body.items.length) {
      const upserts = body.items.map(i => ({
        budget_id: budget.id,
        category_id: i.categoryId,
        amount: i.amount,
        rollover: i.rollover ?? false,
      }));
      const { error: itemError } = await supabase
        .from('budget_items')
        .upsert(upserts, { onConflict: 'budget_id,category_id' });
      if (itemError) {
        return NextResponse.json({ error: itemError.message }, { status: 400 });
      }
    }
    return NextResponse.json(budget);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
