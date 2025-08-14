import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { startOfMonth, TIMEZONE } from '@/lib/date';
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
    const accountId = searchParams.get('accountId');
    const monthDate = new Date(`${month}-01T00:00:00.000Z`);
    const start = startOfMonth(monthDate);
    const end = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1));

    const accounts = await prisma.account.findMany({
      where: { userId: user.sub, ...(accountId ? { id: accountId } : {}) },
      select: { id: true, openingBalance: true },
    });

    const allTxs = await prisma.transaction.findMany({
      where: {
        userId: user.sub,
        ...(accountId
          ? {
              OR: [
                { accountId },
                { fromAccountId: accountId },
                { toAccountId: accountId },
              ],
            }
          : {}),
      },
      select: { type: true, amount: true, accountId: true, fromAccountId: true, toAccountId: true },
    });

    const monthTxs = await prisma.transaction.findMany({
      where: {
        userId: user.sub,
        date: { gte: start, lt: end },
        ...(accountId
          ? {
              OR: [
                { accountId },
                { fromAccountId: accountId },
                { toAccountId: accountId },
              ],
            }
          : {}),
      },
      include: {
        account: { select: { name: true, type: true } },
        fromAccount: { select: { name: true, type: true } },
        toAccount: { select: { name: true, type: true } },
        category: { select: { name: true, color: true, icon: true } },
      },
      orderBy: { date: 'desc' },
    });

    const budgetData = await prisma.budget.findFirst({
      where: { userId: user.sub, month },
      select: { id: true, items: { select: { amount: true, categoryId: true, category: { select: { name: true } } } } },
    });

    let totalBalance = 0;
    accounts.forEach(acc => {
      let balance = Number(acc.openingBalance);
      allTxs.forEach(t => {
        if (t.type === 'income' && t.accountId === acc.id) balance += Number(t.amount);
        if (t.type === 'expense' && t.accountId === acc.id) balance -= Number(t.amount);
        if (t.type === 'transfer') {
          if (t.fromAccountId === acc.id) balance -= Number(t.amount);
          if (t.toAccountId === acc.id) balance += Number(t.amount);
        }
      });
      totalBalance += balance;
    });

    const items = budgetData?.items ?? [];
    const perCategoryMap = new Map<string, { categoryId: string; categoryName: string; planned: number; actual: number }>();
    let totalPlanned = 0;
    items.forEach(item => {
      totalPlanned += Number(item.amount);
      perCategoryMap.set(item.categoryId, {
        categoryId: item.categoryId,
        categoryName: item.category?.name ?? '',
        planned: Number(item.amount),
        actual: 0,
      });
    });

    const nowJakarta = new Date(
      new Date().toLocaleString('en-US', { timeZone: TIMEZONE })
    );
    let mtdSpend = 0;
    const dailyMap = new Map<string, number>();
    const categoryMap = new Map<string, { categoryId: string; name: string; color: string; amount: number }>();
    monthTxs.forEach(tx => {
      if (tx.type === 'expense') {
        if (new Date(tx.date) <= nowJakarta) {
          mtdSpend += Number(tx.amount);
        }
        const dayKey = tx.date.toISOString().slice(0, 10);
        dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + Number(tx.amount));
        if (tx.categoryId) {
          const cat = categoryMap.get(tx.categoryId);
          const name = tx.category?.name ?? '';
          const color = tx.category?.color ?? '';
          if (cat) cat.amount += Number(tx.amount);
          else categoryMap.set(tx.categoryId, { categoryId: tx.categoryId, name, color, amount: Number(tx.amount) });
          const pc = perCategoryMap.get(tx.categoryId);
          if (pc) pc.actual += Number(tx.amount);
          else {
            perCategoryMap.set(tx.categoryId, {
              categoryId: tx.categoryId,
              categoryName: name,
              planned: 0,
              actual: Number(tx.amount),
            });
          }
        }
      }
    });
    const daily = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
    const categories = Array.from(categoryMap.values());
    const perCategory = Array.from(perCategoryMap.values());
    const totalActual = perCategory.reduce((sum, c) => sum + c.actual, 0);

    const startLocal = new Date(start.toLocaleString('en-US', { timeZone: TIMEZONE }));
    const totalDays = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate();
    const daysPassed = Math.min(
      Math.floor((nowJakarta.getTime() - startLocal.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      totalDays
    );
    const dailyAverage = daysPassed > 0 ? mtdSpend / daysPassed : 0;
    const remainingDays = Math.max(totalDays - daysPassed, 0);
    const remainingDaysAllowance =
      remainingDays > 0 ? Math.max((totalPlanned - mtdSpend) / remainingDays, 0) : 0;

    const recentTransactions = monthTxs?.slice(0, 5) ?? [];

    return NextResponse.json({
      totalBalance,
      budget: {
        totalPlanned,
        totalActual,
        perCategory,
      },
      mtd: {
        spend: mtdSpend,
        dailyAverage,
        remainingDaysAllowance,
      },
      daily,
      categories,
      recentTransactions,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

