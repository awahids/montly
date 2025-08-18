import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('id', params.id)
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
  });
}
