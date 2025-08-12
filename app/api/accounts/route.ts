import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId, name, type, currency, openingBalance, archived } = await req.json();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      name,
      type,
      currency,
      opening_balance: openingBalance,
      archived: archived ?? false,
    })
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}
