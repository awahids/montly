import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  let body: z.infer<typeof signUpSchema>;
  try {
    body = signUpSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }

  const supabase = createServerClient();
  const admin = createAdminClient();

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: { data: { name: body.name } },
  });

  if (error) {
    const message =
      error.message === 'User already registered'
        ? 'An account already exists for this email.'
        : error.message;
    return NextResponse.json({ ok: false, error: message });
  }

  const userId = data.user?.id;
  if (userId) {
    const { error: profileError } = await admin.from('profiles').insert({
      id: userId,
      email: body.email,
      name: body.name,
      default_currency: 'IDR',
    });
    if (profileError) {
      return NextResponse.json({ ok: false, error: profileError.message });
    }
    // clear auth cookies to require sign in after sign up
    await supabase.auth.signOut();
  }

  return NextResponse.json({ ok: true });
}
