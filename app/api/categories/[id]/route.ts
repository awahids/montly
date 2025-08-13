import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';
import { categorySchema } from '@/lib/validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  let body: z.infer<typeof categorySchema>;
  try {
    body = categorySchema.partial().parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: body.name,
        type: body.type,
        color: body.color,
        icon: body.icon,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
