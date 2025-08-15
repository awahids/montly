import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';
import { budgetPatchSchema } from '@/lib/validation';
import type { Database } from '@/types/database';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    type BudgetItem = Database['public']['Tables']['budget_items']['Row'] & {
      category: Pick<
        Database['public']['Tables']['categories']['Row'],
        'id' | 'name' | 'color'
      > | null;
    };
    type Budget = Database['public']['Tables']['budgets']['Row'] & {
      items: BudgetItem[];
      total_amount: number;
    };
    const { data: budget, error } = await supabase
      .from('budgets')
      .select(
        'id, month, total_amount, items:budget_items(id, amount, rollover, category:categories(id, name, color))'
      )
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single<Budget>();
    if (error || !budget) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }
    const categoryIds = budget.items
      .map(i => i.category?.id)
      .filter((id): id is string => Boolean(id));
    let actualByCat: Record<string, number> = {};
    if (categoryIds.length) {
      const start = `${budget.month}-01`;
      const endDate = new Date(`${budget.month}-01T00:00:00Z`);
      endDate.setUTCMonth(endDate.getUTCMonth() + 1);
      const end = endDate.toISOString().slice(0, 10);
      const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .in('category_id', categoryIds)
        .gte('date', start)
        .lt('date', end);
      if (txError) {
        return NextResponse.json({ error: txError.message }, { status: 400 });
      }
      for (const t of txs || []) {
        if (t.category_id) {
          actualByCat[t.category_id] = (actualByCat[t.category_id] || 0) + t.amount;
        }
      }
    }
    const items = budget.items.map(i => ({
      id: i.id,
      categoryId: i.category?.id || null,
      categoryName: i.category?.name || null,
      categoryColor: i.category?.color || null,
      amount: i.amount,
      rollover: i.rollover,
      actual: i.category?.id ? actualByCat[i.category.id] || 0 : 0,
    }));
    return NextResponse.json({
      id: budget.id,
      month: budget.month,
      totalAmount: budget.total_amount,
      items,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  let body: z.infer<typeof budgetPatchSchema>;
  try {
    body = budgetPatchSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const { data: existing, error } = await supabase
      .from('budgets')
      .select('id, month, total_amount, items:budget_items(id, category_id, amount, rollover)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();
    if (error || !existing) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }
    if (body.month && body.month !== existing.month) {
      const { error: monthError } = await supabase
        .from('budgets')
        .update({ month: body.month })
        .eq('id', params.id)
        .eq('user_id', user.id);
      if (monthError) {
        return NextResponse.json({ error: monthError.message }, { status: 400 });
      }
    }
    if (body.totalAmount !== undefined && body.totalAmount !== existing.total_amount) {
      const { error: totalError } = await supabase
        .from('budgets')
        .update({ total_amount: body.totalAmount })
        .eq('id', params.id)
        .eq('user_id', user.id);
      if (totalError) {
        return NextResponse.json({ error: totalError.message }, { status: 400 });
      }
    }
    if (body.items) {
      const newCatIds = new Set(body.items.map(i => i.categoryId));
      const upserts = body.items.map(i => ({
        budget_id: existing.id,
        category_id: i.categoryId,
        amount: i.amount,
        rollover: i.rollover ?? false,
      }));
      if (upserts.length) {
        const { error: upsertError } = await supabase
          .from('budget_items')
          .upsert(upserts, { onConflict: 'budget_id,category_id' });
        if (upsertError) {
          return NextResponse.json({ error: upsertError.message }, { status: 400 });
        }
      }
      const toDelete = existing.items
        .filter(i => !newCatIds.has(i.category_id))
        .map(i => i.id);
      if (toDelete.length) {
        const { error: deleteError } = await supabase
          .from('budget_items')
          .delete()
          .in('id', toDelete);
        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 400 });
        }
      }
    }
    const { data, error: fetchError } = await supabase
      .from('budgets')
      .select('*, items:budget_items(*, category:categories(*))')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();
    if (fetchError || !data) {
      return NextResponse.json({ error: fetchError?.message || 'Not found' }, { status: 404 });
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
      .from('budgets')
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
