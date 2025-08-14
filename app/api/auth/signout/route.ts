import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('access_token', '', { httpOnly: true, expires: new Date(0), path: '/' });
  res.cookies.set('refresh_token', '', { httpOnly: true, expires: new Date(0), path: '/' });
  return res;
}
