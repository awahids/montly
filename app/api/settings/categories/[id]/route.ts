import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { categorySchema } from '@/lib/validation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let body: Partial<z.infer<typeof categorySchema>>;
  try {
    body = categorySchema.partial().parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
  try {
    const user = await getUser();
    const existing = await prisma.category.findFirst({
      where: { id: params.id, userId: user.sub },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const data = await prisma.category.update({
      where: { id: params.id },
      data: {
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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUser();
    const category = await prisma.category.findFirst({
      where: { id: params.id, userId: user.sub },
    });
    if (!category) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const txnCount = await prisma.transaction.count({
      where: { userId: user.sub, categoryId: params.id },
    });
    if (txnCount > 0) {
      return NextResponse.json(
        { error: 'Category is in use. Reassign or remove references before deleting.' },
        { status: 409 },
      );
    }

    const itemCount = await prisma.budgetItem.count({
      where: {
        categoryId: params.id,
        budget: { userId: user.sub },
      },
    });
    if (itemCount > 0) {
      return NextResponse.json(
        { error: 'Category is in use. Reassign or remove references before deleting.' },
        { status: 409 },
      );
    }

    await prisma.category.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
