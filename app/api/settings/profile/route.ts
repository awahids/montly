import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { profilePatchSchema } from '@/lib/validation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getUser();
    const data = await prisma.profile.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        email: true,
        name: true,
        defaultCurrency: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  let body: z.infer<typeof profilePatchSchema>;
  try {
    body = profilePatchSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
  try {
    const user = await getUser();
    const data = await prisma.profile.update({
      where: { id: user.sub },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.defaultCurrency !== undefined
          ? { defaultCurrency: body.defaultCurrency }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        defaultCurrency: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
