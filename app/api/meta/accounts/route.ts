import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { getAccountBalances } from '@/lib/balances';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getUser();
    const data = await prisma.account.findMany({
      where: { userId: user.sub },
      select: { id: true, name: true, type: true, currency: true },
    });
    const balances = await getAccountBalances(
      user.sub,
      data.map(a => a.id),
    );
    const rows = data.map(acc => ({
      ...acc,
      computedBalance: balances[acc.id] ?? 0,
    }));
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
