import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import type { Database } from '@/types/database';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    if (!month) {
      return NextResponse.json({ error: 'month is required' }, { status: 400 });
    }
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));

    const data = await prisma.transaction.findMany({
      where: {
        userId: user.sub,
        type: 'expense',
        date: { gte: start, lt: end },
      },
      select: {
        amount: true,
        categoryId: true,
        category: { select: { name: true, color: true } },
      },
    });

    const map = new Map<string, { categoryId: string; name: string; color: string; amount: number }>();
    data.forEach(tx => {
      if (tx.categoryId) {
        const key = tx.categoryId;
        const existing = map.get(key);
        const name = tx.category?.name ?? '';
        const color = tx.category?.color ?? '#6B7280';
        if (existing) {
          existing.amount += Number(tx.amount);
        } else {
          map.set(key, { categoryId: key, name, color, amount: Number(tx.amount) });
        }
      }
    });

    return NextResponse.json({ data: Array.from(map.values()) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
