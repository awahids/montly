import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { budgetItemPatchSchema } from '@/lib/validation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  let body: z.infer<typeof budgetItemPatchSchema>;
  try {
    body = budgetItemPatchSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const budget = await prisma.budget.findFirst({
      where: { id: params.id, userId: user.sub },
      select: { id: true },
    });
    if (!budget) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const data = await prisma.budgetItem.update({
      where: { id: params.itemId, budgetId: budget.id },
      data: {
        categoryId: body.categoryId,
        amount: body.amount,
        rollover: body.rollover,
      },
      select: { id: true, categoryId: true, amount: true, rollover: true },
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await getUser();
    const budget = await prisma.budget.findFirst({
      where: { id: params.id, userId: user.sub },
      select: { id: true },
    });
    if (!budget) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await prisma.budgetItem.delete({ where: { id: params.itemId, budgetId: budget.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
