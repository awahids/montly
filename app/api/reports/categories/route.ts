import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/lib/auth/server';
import type { Database } from '@/types/database';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

const querySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid from date format'),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid to date format'),
  accountId: z.string().uuid().optional(),
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
    const { from, to, accountId } = parse.data;
    const start = new Date(`${from}T00:00:00.000Z`);
    const endDay = new Date(`${to}T00:00:00.000Z`);
    const end = new Date(Date.UTC(endDay.getUTCFullYear(), endDay.getUTCMonth(), endDay.getUTCDate() + 1));

    const where: any = {
      userId: user.sub,
      type: 'expense',
      date: { gte: start, lt: end },
    };
    if (accountId) where.accountId = accountId;

    const data = await prisma.transaction.findMany({
      where,
      select: {
        amount: true,
        categoryId: true,
        category: { select: { name: true, color: true } },
      },
    });

    const map = new Map<string, { categoryId: string; name: string; color: string; amount: number }>();
    data.forEach(tx => {
      if (tx.categoryId) {
        const name = tx.category?.name ?? '';
        const color = tx.category?.color ?? '#6B7280';
        const existing = map.get(tx.categoryId);
        if (existing) existing.amount += Number(tx.amount);
        else map.set(tx.categoryId, { categoryId: tx.categoryId, name, color, amount: Number(tx.amount) });
      }
    });

    return NextResponse.json({ data: Array.from(map.values()) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

