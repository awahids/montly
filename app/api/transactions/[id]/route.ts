import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { transactionPatchSchema } from '@/lib/validation';
import { z } from 'zod';
import { getAccountBalances } from '@/lib/balances';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  let body: z.infer<typeof transactionPatchSchema>;
  try {
    body = transactionPatchSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const existing = await prisma.transaction.findFirst({
      where: { id: params.id, userId: user.sub },
      select: {
        type: true,
        amount: true,
        accountId: true,
        fromAccountId: true,
        toAccountId: true,
        categoryId: true,
      },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const newType = body.type ?? existing.type;
    const newAmount = body.amount ?? existing.amount;
    const newAccountId = body.accountId ?? existing.accountId;
    const newFrom = body.fromAccountId ?? existing.fromAccountId;
    const newTo = body.toAccountId ?? existing.toAccountId;
    const newCategoryId =
      body.categoryId === undefined ? existing.categoryId : body.categoryId;

    if (newType === 'expense' || newType === 'income') {
      if (!newAccountId) {
        return NextResponse.json(
          { error: 'accountId is required' },
          { status: 400 },
        );
      }
      const account = await prisma.account.findFirst({
        where: { id: newAccountId, userId: user.sub },
        select: { id: true },
      });
      if (!account) {
        return NextResponse.json({ error: 'Invalid account' }, { status: 400 });
      }
      if (newCategoryId) {
        const category = await prisma.category.findFirst({
          where: { id: newCategoryId, userId: user.sub },
          select: { id: true },
        });
        if (!category) {
          return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }
      }
    } else if (newType === 'transfer') {
      if (!newFrom || !newTo) {
        return NextResponse.json(
          { error: 'fromAccountId and toAccountId are required' },
          { status: 400 },
        );
      }
      if (newFrom === newTo) {
        return NextResponse.json(
          { error: 'fromAccountId and toAccountId must differ' },
          { status: 400 },
        );
      }
      if (newCategoryId !== null && newCategoryId !== undefined) {
        return NextResponse.json(
          { error: 'categoryId must be null for transfers' },
          { status: 400 },
        );
      }
      const accounts = await prisma.account.findMany({
        where: { id: { in: [newFrom, newTo] }, userId: user.sub },
        select: { id: true },
      });
      if (accounts.length !== 2) {
        return NextResponse.json({ error: 'Invalid accounts' }, { status: 400 });
      }
      if (process.env.DISALLOW_NEGATIVE_BALANCE === 'true') {
        const balances = await getAccountBalances(user.sub, [newFrom]);
        let balance = balances[newFrom] ?? 0;
        if (existing.type === 'transfer' && existing.fromAccountId === newFrom) {
          balance += existing.amount;
        }
        if (existing.type === 'expense' && existing.accountId === newFrom) {
          balance += existing.amount;
        }
        if (balance - newAmount < 0) {
          return NextResponse.json(
            { error: 'Insufficient funds' },
            { status: 400 },
          );
        }
      }
    }

    const data = await prisma.transaction.update({
      where: { id: params.id, userId: user.sub },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        type: newType,
        accountId: newAccountId,
        fromAccountId: newFrom,
        toAccountId: newTo,
        amount: newAmount,
        categoryId: newCategoryId,
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getUser();
    await prisma.transaction.delete({ where: { id: params.id, userId: user.sub } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
