import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';

export const revalidate = 60;

export async function GET(req: Request) {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getUTCFullYear();
    if (isNaN(year)) {
      return NextResponse.json({ error: 'invalid year' }, { status: 400 });
    }

    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const { data, error } = await supabase
      .from('transactions')
      .select('date, type, amount')
      .eq('user_id', user.id)
      .gte('date', start.toISOString())
      .lt('date', end.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: `${year}-${String(i + 1).padStart(2, '0')}`,
      income: 0,
      expense: 0,
    }));

    data?.forEach(tx => {
      const idx = new Date(tx.date).getUTCMonth();
      if (tx.type === 'income') {
        months[idx].income += tx.amount;
      } else if (tx.type === 'expense') {
        months[idx].expense += tx.amount;
      }
    });

    return NextResponse.json({ data: months });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
