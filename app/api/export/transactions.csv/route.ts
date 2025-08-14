import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/lib/auth/server';
import type { Database } from '@/types/database';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: z.enum(['expense', 'income', 'transfer']).optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

function escapeCSV(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

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
    const { from, to, type, accountId, categoryId } = parse.data;
    const where: any = { userId: user.sub };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(`${from}T00:00:00.000Z`);
      if (to) {
        const endDay = new Date(`${to}T00:00:00.000Z`);
        const end = new Date(Date.UTC(endDay.getUTCFullYear(), endDay.getUTCMonth(), endDay.getUTCDate() + 1));
        where.date.lt = end;
      }
    }
    if (type) where.type = type;
    if (accountId)
      where.OR = [
        { accountId },
        { fromAccountId: accountId },
        { toAccountId: accountId },
      ];
    if (categoryId) where.categoryId = categoryId;

    const data = await prisma.transaction.findMany({
      where,
      select: {
        date: true,
        type: true,
        amount: true,
        note: true,
        tags: true,
        account: { select: { name: true } },
        fromAccount: { select: { name: true } },
        toAccount: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    });

    const header = [
      'date',
      'type',
      'account',
      'fromAccount',
      'toAccount',
      'category',
      'amount',
      'note',
      'tags',
    ];
    const lines = [header.join(',')];
    data.forEach(tx => {
      const note = (tx.note ?? '').replace(/\r?\n/g, ' ');
      const tags = (tx.tags ?? []).join('|');
      const row = [
        tx.date.toISOString(),
        tx.type,
        tx.account?.name ?? '',
        tx.fromAccount?.name ?? '',
        tx.toAccount?.name ?? '',
        tx.category?.name ?? '',
        tx.amount.toString(),
        note,
        tags,
      ].map(escapeCSV);
      lines.push(row.join(','));
    });
    const csv = lines.join('\r\n');
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="transactions.csv"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

