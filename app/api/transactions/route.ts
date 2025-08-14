import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { transactionCreateSchema } from '@/lib/validation';
import { z } from 'zod';
import { getAccountBalances } from '@/lib/balances';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
    const skip = (page - 1) * pageSize;

    const where: any = { userId: user.sub };
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const type = searchParams.get('type');
    const accountId = searchParams.get('accountId');
    const categoryId = searchParams.get('categoryId');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId)
      where.OR = [
        { accountId },
        { fromAccountId: accountId },
        { toAccountId: accountId },
      ];
    if (tags) {
      const arr = tags.split(',').filter(Boolean);
      if (arr.length) where.tags = { hasSome: arr };
    }
    if (search) {
      where.OR = where.OR || [];
      where.OR.push(
        { note: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      );
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: { select: { name: true, type: true } },
          fromAccount: { select: { name: true, type: true } },
          toAccount: { select: { name: true, type: true } },
          category: { select: { name: true, color: true, icon: true } },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({ rows: data, page, pageSize, total });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  let body: z.infer<typeof transactionCreateSchema>;
  try {
    body = transactionCreateSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    if (body.type === 'expense' || body.type === 'income') {
      const account = await prisma.account.findFirst({
        where: { id: body.accountId!, userId: user.sub },
        select: { id: true },
      });
      if (!account) {
        return NextResponse.json({ error: 'Invalid account' }, { status: 400 });
      }
      if (body.categoryId) {
        const category = await prisma.category.findFirst({
          where: { id: body.categoryId, userId: user.sub },
          select: { id: true },
        });
        if (!category) {
          return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }
      }
    } else if (body.type === 'transfer') {
      const accounts = await prisma.account.findMany({
        where: {
          id: { in: [body.fromAccountId!, body.toAccountId!] },
          userId: user.sub,
        },
        select: { id: true },
      });
      if (accounts.length !== 2) {
        return NextResponse.json({ error: 'Invalid accounts' }, { status: 400 });
      }
      if (process.env.DISALLOW_NEGATIVE_BALANCE === 'true' && body.fromAccountId) {
        const balances = await getAccountBalances(user.sub, [body.fromAccountId]);
        if ((balances[body.fromAccountId] ?? 0) - body.amount < 0) {
          return NextResponse.json(
            { error: 'Insufficient funds' },
            { status: 400 },
          );
        }
      }
    }

    const data = await prisma.transaction.create({
      data: {
        userId: user.sub,
        date: new Date(body.date),
        type: body.type,
        accountId: body.accountId,
        fromAccountId: body.fromAccountId,
        toAccountId: body.toAccountId,
        amount: body.amount,
        categoryId: body.categoryId,
        note: body.note,
        tags: body.tags,
      },
      include: {
        account: { select: { name: true, type: true } },
        fromAccount: { select: { name: true, type: true } },
        toAccount: { select: { name: true, type: true } },
        category: { select: { name: true, color: true, icon: true } },
      },
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
