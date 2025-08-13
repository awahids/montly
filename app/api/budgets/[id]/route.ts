import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { budgetPatchSchema } from '@/lib/validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

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
      .select('id, month, items:budget_items(id, category_id, amount, rollover)')
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
