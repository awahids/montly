import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';
import { debtSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const rows = (data ?? []).map((d) => ({
      id: d.id,
      userId: d.user_id,
      contact: d.contact,
      amount: d.amount,
      note: d.note,
      type: d.type,
      status: d.status,
      dueDate: d.due_date,
    }));
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  const supabase = createServerClient();
  let body: z.infer<typeof debtSchema>;
  try {
    body = debtSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        contact: body.contact,
        amount: body.amount,
        note: body.note,
        type: body.type,
        status: body.status,
        due_date: body.dueDate ?? null,
      })
      .select('*')
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Failed to create debt' },
        { status: 400 }
      );
    }
    return NextResponse.json({
      id: data.id,
      userId: data.user_id,
      contact: data.contact,
      amount: data.amount,
      note: data.note,
      type: data.type,
      status: data.status,
      dueDate: data.due_date,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
