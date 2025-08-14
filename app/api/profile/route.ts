import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth/server';
import { profilePatchSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  try {
    const user = await getUser();
    const profile = await prisma.profile.findUnique({
      where: { id: user.sub },
      select: { id: true, email: true, name: true, defaultCurrency: true },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  let body: z.infer<typeof profilePatchSchema>;
  try {
    body = profilePatchSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const profile = await prisma.profile.update({
      where: { id: user.sub },
      data: {
        name: body.name,
        defaultCurrency: body.defaultCurrency,
      },
      select: { id: true, email: true, name: true, defaultCurrency: true },
    });
    return NextResponse.json(profile);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
