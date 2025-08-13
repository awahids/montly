import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { accountSchema } from '@/lib/validation';
import { z } from 'zod';
import { getAccountBalances } from '@/lib/balances';

export async function GET(req: Request) {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
    const fromIdx = (page - 1) * pageSize;
    const toIdx = fromIdx + pageSize - 1;

    let query = supabase
      .from('accounts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (!includeArchived) {
      query = query.eq('archived', false);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(fromIdx, toIdx);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const balances = await getAccountBalances(
      supabase,
      user.id,
      data?.map((a) => a.id) ?? []
    );

    const rows = (data ?? []).map((acc) => ({
      id: acc.id,
      userId: acc.user_id,
      name: acc.name,
      type: acc.type,
      currency: acc.currency,
      openingBalance: acc.opening_balance,
      archived: acc.archived,
      currentBalance: balances[acc.id] ?? acc.opening_balance,
    }));

    return NextResponse.json({ rows, page, pageSize, total: count ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  const supabase = createServerClient();
  let body: z.infer<typeof accountSchema>;
  try {
    body = accountSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: body.name,
        type: body.type,
        currency: body.currency ?? 'IDR',
        opening_balance: body.openingBalance ?? 0,
        archived: body.archived ?? false,
      })
      .select('*')
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    const balances = await getAccountBalances(supabase, user.id, [data.id]);

    return NextResponse.json({
      id: data.id,
      userId: data.user_id,
      name: data.name,
      type: data.type,
      currency: data.currency,
      openingBalance: data.opening_balance,
      archived: data.archived,
      currentBalance: balances[data.id] ?? data.opening_balance,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
