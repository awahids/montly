import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { categorySchema } from '@/lib/validation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  type: z.enum(['expense', 'income', 'all']).optional(),
  q: z.string().optional(),
});

export async function GET(req: Request) {
  let params: z.infer<typeof querySchema>;
  try {
    params = querySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
  try {
    const user = await getUser();
    const where: any = { userId: user.sub };
    if (params.type && params.type !== 'all') {
      where.type = params.type;
    }
    if (params.q) {
      where.name = { contains: params.q, mode: 'insensitive' };
    }
    const data = await prisma.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, type: true, color: true, icon: true },
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  let body: z.infer<typeof categorySchema>;
  try {
    body = categorySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
  try {
    const user = await getUser();
    const data = await prisma.category.create({
      data: {
        userId: user.sub,
        name: body.name,
        type: body.type,
        color: body.color,
        icon: body.icon,
      },
      select: { id: true, name: true, type: true, color: true, icon: true },
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
