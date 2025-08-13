import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { budgetItemsAddSchema } from '@/lib/validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  let body: z.infer<typeof budgetItemsAddSchema>;
  try {
    body = budgetItemsAddSchema.parse(await req.json());
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
    const inserts = body.items.map(i => ({
      budget_id: budget.id,
      category_id: i.categoryId,
      amount: i.amount,
      rollover: i.rollover ?? false,
    }));
    const { data, error: insertError } = await supabase
      .from('budget_items')
      .insert(inserts)
      .select('id, category_id, amount, rollover');
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
