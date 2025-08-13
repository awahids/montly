import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';
import type { Database } from '@/types/database';

export const revalidate = 60;

const querySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format. Use YYYY-MM'),
});

export async function GET(req: Request) {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { searchParams } = new URL(req.url);
    const parse = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.issues[0]?.message ?? 'invalid query' },
        { status: 400 }
      );
    }
    const { month } = parse.data;
    const monthDate = new Date(`${month}-01T00:00:00.000Z`);
    const start = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
    const end = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1));

    type BudgetItem = Database['public']['Tables']['budget_items']['Row'] & {
      category: Pick<
        Database['public']['Tables']['categories']['Row'],
        'name' | 'color'
      > | null;
    };
    type Budget = { id: string; items: BudgetItem[] };
    const { data: budgetData, error: budgetErr } = await supabase
      .from('budgets')
      .select(
        'id, items:budget_items(amount, category_id, category:categories(name, color))'
      )
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle<Budget>();
    if (budgetErr) {
      return NextResponse.json({ error: budgetErr.message }, { status: 400 });
    }

    const perCategory = new Map<
      string,
      { categoryId: string; name: string; color: string; planned: number; actual: number }
    >();
    budgetData?.items?.forEach(item => {
      perCategory.set(item.category_id, {
        categoryId: item.category_id,
        name: item.category?.name ?? '',
        color: item.category?.color ?? '#6B7280',
        planned: item.amount,
        actual: 0,
      });
    });

    const { data: txs, error: txErr } = await supabase
      .from('transactions')
      .select('amount, category_id')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', start.toISOString())
      .lt('date', end.toISOString());
    if (txErr) {
      return NextResponse.json({ error: txErr.message }, { status: 400 });
    }

    txs?.forEach(tx => {
      if (tx.category_id) {
        const entry = perCategory.get(tx.category_id);
        if (entry) entry.actual += tx.amount;
        else
          perCategory.set(tx.category_id, {
            categoryId: tx.category_id,
            name: '',
            color: '#6B7280',
            planned: 0,
            actual: tx.amount,
          });
      }
    });

    const data = Array.from(perCategory.values());
    const totalPlanned = data.reduce((sum, c) => sum + c.planned, 0);
    const totalActual = data.reduce((sum, c) => sum + c.actual, 0);

    return NextResponse.json({ data, totalPlanned, totalActual });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

