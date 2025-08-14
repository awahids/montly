import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { budgetPatchSchema } from '@/lib/validation';
import type { Database } from '@/types/database';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUser();
    const budget = await prisma.budget.findFirst({
      where: { id: params.id, userId: user.sub },
      include: { items: { include: { category: true } } },
    });
    if (!budget) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const categoryIds = budget.items.map(i => i.categoryId).filter(Boolean) as string[];
    const actualByCat: Record<string, number> = {};
    if (categoryIds.length) {
      const start = new Date(`${budget.month}-01`);
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);
      const txs = await prisma.transaction.findMany({
        where: {
          userId: user.sub,
          type: 'expense',
          categoryId: { in: categoryIds },
          date: { gte: start, lt: end },
        },
        select: { amount: true, categoryId: true },
      });
      for (const t of txs) {
        const cid = t.categoryId!;
        actualByCat[cid] = (actualByCat[cid] || 0) + Number(t.amount);
      }
    }
    const items = budget.items.map(i => ({
      id: i.id,
      categoryId: i.categoryId,
      categoryName: i.category?.name || null,
      categoryColor: i.category?.color || null,
      amount: Number(i.amount),
      rollover: i.rollover,
      actual: i.categoryId ? actualByCat[i.categoryId] || 0 : 0,
    }));
    return NextResponse.json({
      id: budget.id,
      month: budget.month,
      accountId: budget.accountId,
      totalAmount: Number(budget.totalAmount),
      items,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  let body: z.infer<typeof budgetPatchSchema>;
  try {
    body = budgetPatchSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const existing = await prisma.budget.findFirst({
      where: { id: params.id, userId: user.sub },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (body.accountId) {
      const acc = await prisma.account.findFirst({
        where: { id: body.accountId, userId: user.sub },
        select: { id: true },
      });
      if (!acc) {
        return NextResponse.json({ error: 'Invalid account' }, { status: 400 });
      }
    }
    const updated = await prisma.budget.update({
      where: { id: existing.id },
      data: {
        month: body.month ?? existing.month,
        accountId: body.accountId ?? existing.accountId,
        totalAmount: body.totalAmount ?? existing.totalAmount,
      },
    });
    if (body.items) {
      await prisma.budgetItem.deleteMany({ where: { budgetId: existing.id } });
      await prisma.budgetItem.createMany({
        data: body.items.map(i => ({
          budgetId: existing.id,
          categoryId: i.categoryId,
          amount: i.amount,
          rollover: i.rollover ?? false,
        })),
      });
    }
    const data = await prisma.budget.findFirst({
      where: { id: updated.id },
      include: { items: { include: { category: true } }, account: true },
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUser();
    await prisma.budget.delete({ where: { id: params.id, userId: user.sub } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
