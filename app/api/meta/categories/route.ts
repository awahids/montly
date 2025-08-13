import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';

export async function GET() {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, type, color, icon')
      .eq('user_id', user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
