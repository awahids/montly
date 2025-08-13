import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
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
      .select('id, month, items:budget_items(amount, category_id)', { count: 'exact' })
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
    const categoryIds = Array.from(
      new Set(budgets.flatMap(b => b.items.map(i => i.category_id)))
    );
    let tx: { amount: number; date: string; category_id: string | null }[] = [];
    if (categoryIds.length) {
      const start = `${year}-01-01`;
      const end = `${Number(year) + 1}-01-01`;
      const { data: tData, error: tError } = await supabase
        .from('transactions')
        .select('amount, date, category_id')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .in('category_id', categoryIds)
        .gte('date', start)
        .lt('date', end);
      if (tError) {
        return NextResponse.json({ error: tError.message }, { status: 400 });
      }
      tx = tData || [];
    }
    const actualByMonth: Record<string, number> = {};
    for (const t of tx) {
      const key = new Date(t.date)
        .toLocaleDateString('en-CA', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
        })
        .slice(0, 7);
      actualByMonth[key] = (actualByMonth[key] || 0) + t.amount;
    }
    const result = budgets.map(b => ({
      id: b.id,
      month: b.month,
      planned: b.items.reduce((sum: number, i: any) => sum + i.amount, 0),
      actual: actualByMonth[b.month] || 0,
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
    const { data: budget, error } = await supabase
      .from('budgets')
      .upsert({ user_id: user.id, month: body.month }, { onConflict: 'user_id,month' })
      .select('id, month')
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
