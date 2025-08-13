import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { budgetSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('budgets')
      .select('*, items:budget_items(*, category:categories(*))')
      .eq('user_id', user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
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
      .insert({ user_id: user.id, month: body.month })
      .select('id')
      .single();
    if (error || !budget) {
      return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 400 });
    }

    if (body.items && body.items.length) {
      const { error: itemsError } = await supabase.from('budget_items').insert(
        body.items.map(i => ({
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
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
