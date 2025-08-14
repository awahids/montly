import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { budgetSchema } from '@/lib/validation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
  const offset = (page - 1) * pageSize;

  try {
    const user = await getUser();
    const [budgets, count] = await Promise.all([
      prisma.budget.findMany({
        where: { userId: user.sub, month: { startsWith: `${year}-` } },
        select: { id: true, month: true, accountId: true, totalAmount: true },
        orderBy: { month: 'asc' },
        skip: offset,
        take: pageSize,
      }),
      prisma.budget.count({ where: { userId: user.sub, month: { startsWith: `${year}-` } } }),
    ]);
    if (budgets.length === 0) {
      return NextResponse.json({ data: [], total: count });
    }
    const tx = await prisma.transaction.findMany({
      where: {
        userId: user.sub,
        type: 'expense',
        accountId: { in: budgets.map(b => b.accountId) },
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${Number(year) + 1}-01-01`),
        },
      },
      select: { amount: true, date: true, accountId: true },
    });
    const actualByKey: Record<string, number> = {};
    for (const t of tx) {
      const monthKey = t.date.toISOString().slice(0, 7);
      const key = `${t.accountId}-${monthKey}`;
      actualByKey[key] = (actualByKey[key] || 0) + Number(t.amount);
    }
    const result = budgets.map(b => ({
      id: b.id,
      month: b.month,
      accountId: b.accountId,
      planned: Number(b.totalAmount),
      actual: actualByKey[`${b.accountId}-${b.month}`] || 0,
    }));
    return NextResponse.json({ data: result, total: count });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  let body: z.infer<typeof budgetSchema>;
  try {
    body = budgetSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const account = await prisma.account.findFirst({
      where: { id: body.accountId, userId: user.sub },
      select: { id: true },
    });
    if (!account) {
      return NextResponse.json({ error: 'Invalid account' }, { status: 400 });
    }
    const existing = await prisma.budget.findFirst({
      where: { userId: user.sub, month: body.month, accountId: body.accountId },
    });
    const budget = existing
      ? await prisma.budget.update({
          where: { id: existing.id },
          data: { totalAmount: body.totalAmount },
          select: { id: true, month: true, accountId: true, totalAmount: true },
        })
      : await prisma.budget.create({
          data: {
            userId: user.sub,
            month: body.month,
            accountId: body.accountId,
            totalAmount: body.totalAmount,
          },
          select: { id: true, month: true, accountId: true, totalAmount: true },
        });

    if (body.items.length) {
      await prisma.budgetItem.deleteMany({ where: { budgetId: budget.id } });
      await prisma.budgetItem.createMany({
        data: body.items.map(i => ({
          budgetId: budget.id,
          categoryId: i.categoryId,
          amount: i.amount,
          rollover: i.rollover ?? false,
        })),
      });
    }
    return NextResponse.json(budget);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
