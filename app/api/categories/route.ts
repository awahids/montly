import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const supabase = createServerClient();
  let query = supabase.from('categories').select('*').eq('user_id', userId);
  if (type) {
    query = query.eq('type', type);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId, name, type, color, icon } = await req.json();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name,
      type,
      color,
      icon,
    })
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}
