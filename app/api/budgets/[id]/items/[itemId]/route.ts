import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';
import { budgetItemPatchSchema } from '@/lib/validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const supabase = createServerClient();
  let body: z.infer<typeof budgetItemPatchSchema>;
  try {
    body = budgetItemPatchSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const { data: budget, error } = await supabase
      .from('budgets')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();
    if (error || !budget) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }
    const { data, error: updateError } = await supabase
      .from('budget_items')
      .update({
        category_id: body.categoryId,
        amount: body.amount,
        rollover: body.rollover,
      })
      .eq('id', params.itemId)
      .eq('budget_id', budget.id)
      .select('id, category_id, amount, rollover')
      .single();
    if (updateError || !data) {
      return NextResponse.json({ error: updateError?.message || 'Not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { data: budget, error } = await supabase
      .from('budgets')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();
    if (error || !budget) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }
    const { error: deleteError } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', params.itemId)
      .eq('budget_id', budget.id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
