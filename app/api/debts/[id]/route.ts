import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';
import { debtSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('share_id', params.id)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
    shareId: data.share_id,
    attachments: data.attachments,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  let body: Partial<z.infer<typeof debtSchema>>;
  try {
    body = debtSchema.partial().parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('debts')
      .update({
        contact: body.contact,
        amount: body.amount,
        note: body.note,
        type: body.type,
        status: body.status,
        due_date: body.dueDate ?? null,
        attachments: body.attachments,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Failed to update debt' },
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
      shareId: data.share_id,
      attachments: data.attachments,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
