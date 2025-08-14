import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { categorySchema } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  try {
    const user = await getUser();
    const categories = await prisma.category.findMany({
      where: { userId: user.sub },
    });
    return NextResponse.json(categories);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  let body: z.infer<typeof categorySchema>;
  try {
    body = categorySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const category = await prisma.category.create({
      data: {
        userId: user.sub,
        name: body.name,
        type: body.type,
        color: body.color,
        icon: body.icon,
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
