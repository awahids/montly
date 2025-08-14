import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { accountSchema } from '@/lib/validation';
import { z } from 'zod';
import { getAccountBalances } from '@/lib/balances';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
    const skip = (page - 1) * pageSize;
    const where = { userId: user.sub, ...(includeArchived ? {} : { archived: false }) };

    const [data, total] = await Promise.all([
      prisma.account.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.account.count({ where }),
    ]);

    const balances = await getAccountBalances(
      user.sub,
      data.map(a => a.id),
    );

    const rows = data.map(acc => ({
      id: acc.id,
      userId: acc.userId,
      name: acc.name,
      type: acc.type,
      currency: acc.currency,
      openingBalance: Number(acc.openingBalance),
      archived: acc.archived,
      currentBalance: balances[acc.id] ?? Number(acc.openingBalance),
    }));

    return NextResponse.json({ rows, page, pageSize, total });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  let body: z.infer<typeof accountSchema>;
  try {
    body = accountSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const data = await prisma.account.create({
      data: {
        userId: user.sub,
        name: body.name,
        type: body.type,
        currency: body.currency ?? 'IDR',
        openingBalance: body.openingBalance ?? 0,
        archived: body.archived ?? false,
      },
    });

    const balances = await getAccountBalances(user.sub, [data.id]);

    return NextResponse.json({
      id: data.id,
      userId: data.userId,
      name: data.name,
      type: data.type,
      currency: data.currency,
      openingBalance: Number(data.openingBalance),
      archived: data.archived,
      currentBalance: balances[data.id] ?? Number(data.openingBalance),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
