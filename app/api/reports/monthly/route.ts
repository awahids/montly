import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/lib/auth/server';
import type { Database } from '@/types/database';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

const querySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format. Use YYYY-MM'),
});

export async function GET(req: Request) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(req.url);
    const parse = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.issues[0]?.message ?? 'invalid query' },
        { status: 400 }
      );
    }
    const { month } = parse.data;
    const monthDate = new Date(`${month}-01T00:00:00.000Z`);
    const start = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
    const end = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1));

    const budgetData = await prisma.budget.findFirst({
      where: { userId: user.sub, month },
      select: {
        id: true,
        items: {
          select: {
            amount: true,
            categoryId: true,
            category: { select: { name: true, color: true } },
          },
        },
      },
    });

    const perCategory = new Map<string, { categoryId: string; name: string; color: string; planned: number; actual: number }>();
    budgetData?.items?.forEach(item => {
      perCategory.set(item.categoryId, {
        categoryId: item.categoryId,
        name: item.category?.name ?? '',
        color: item.category?.color ?? '#6B7280',
        planned: Number(item.amount),
        actual: 0,
      });
    });

    const txs = await prisma.transaction.findMany({
      where: {
        userId: user.sub,
        type: 'expense',
        date: { gte: start, lt: end },
      },
      select: { amount: true, categoryId: true },
    });

    txs.forEach(tx => {
      if (tx.categoryId) {
        const entry = perCategory.get(tx.categoryId);
        if (entry) entry.actual += Number(tx.amount);
        else
          perCategory.set(tx.categoryId, {
            categoryId: tx.categoryId,
            name: '',
            color: '#6B7280',
            planned: 0,
            actual: Number(tx.amount),
          });
      }
    });

    const data = Array.from(perCategory.values());
    const totalPlanned = data.reduce((sum, c) => sum + c.planned, 0);
    const totalActual = data.reduce((sum, c) => sum + c.actual, 0);

    return NextResponse.json({ data, totalPlanned, totalActual });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

