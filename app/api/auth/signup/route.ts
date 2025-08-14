import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  let body: z.infer<typeof signUpSchema>;
  try {
    body = signUpSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  const existing = await prisma.profile.findUnique({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }
  const hash = bcrypt.hashSync(body.password, 10);
  const user = await prisma.profile.create({
    data: {
      email: body.email,
      name: body.name,
      passwordHash: hash,
    },
  });
  const payload = { sub: user.id, email: user.email };
  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);
  const res = NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    defaultCurrency: user.defaultCurrency,
  });
  res.cookies.set('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });
  res.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });
  return res;
}
