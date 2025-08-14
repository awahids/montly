import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let body: z.infer<typeof signInSchema>;
  try {
    body = signInSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user });
}
