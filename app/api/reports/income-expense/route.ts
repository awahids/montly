import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getUTCFullYear();
    if (isNaN(year)) {
      return NextResponse.json({ error: 'invalid year' }, { status: 400 });
    }

    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const data = await prisma.transaction.findMany({
      where: {
        userId: user.sub,
        date: { gte: start, lt: end },
      },
      select: { date: true, type: true, amount: true },
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: `${year}-${String(i + 1).padStart(2, '0')}`,
      income: 0,
      expense: 0,
    }));

    data?.forEach(tx => {
      const idx = new Date(tx.date).getUTCMonth();
      if (tx.type === 'income') {
        months[idx].income += tx.amount;
      } else if (tx.type === 'expense') {
        months[idx].expense += tx.amount;
      }
    });

    return NextResponse.json({ data: months });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
