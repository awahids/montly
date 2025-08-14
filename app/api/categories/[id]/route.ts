import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth/server';
import { categorySchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  let body: Partial<z.infer<typeof categorySchema>>;
  try {
    body = categorySchema.partial().parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const category = await prisma.category.update({
      where: { id: params.id, userId: user.sub },
      data: {
        name: body.name,
        type: body.type,
        color: body.color,
        icon: body.icon,
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUser();
    await prisma.category.delete({ where: { id: params.id, userId: user.sub } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
