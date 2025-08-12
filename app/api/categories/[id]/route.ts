import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, type, color, icon } = await req.json();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .update({ name, type, color, icon })
    .eq('id', params.id)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { error } = await supabase.from('categories').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
