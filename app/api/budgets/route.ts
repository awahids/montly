import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId, month, items } = await req.json();
  const supabase = createServerClient();

  const { data: budget, error } = await supabase
    .from('budgets')
    .insert({ user_id: userId, month })
    .select('id')
    .single();

  if (error || !budget) {
    return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 400 });
  }

  if (items && items.length) {
    const { error: itemsError } = await supabase.from('budget_items').insert(
      items.map((i: any) => ({
        budget_id: budget.id,
        category_id: i.categoryId,
        amount: i.amount,
        rollover: i.rollover ?? false,
      }))
    );
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }
  }

  const { data: fullBudget, error: fetchError } = await supabase
    .from('budgets')
    .select('*, items:budget_items(*, category:categories(*))')
    .eq('id', budget.id)
    .single();

  if (fetchError || !fullBudget) {
    return NextResponse.json({ error: fetchError?.message || 'Fetch failed' }, { status: 400 });
  }

  return NextResponse.json(fullBudget);
}
