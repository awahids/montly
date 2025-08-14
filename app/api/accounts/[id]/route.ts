import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { accountSchema } from '@/lib/validation';
import { z } from 'zod';
import { getAccountBalances } from '@/lib/balances';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  let body: Partial<z.infer<typeof accountSchema>>;
  try {
    body = accountSchema.partial().parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.type !== undefined) updates.type = body.type;
    if (body.currency !== undefined) updates.currency = body.currency;
    if (body.openingBalance !== undefined)
      updates.openingBalance = body.openingBalance;
    if (body.archived !== undefined) updates.archived = body.archived;

    const data = await prisma.account.update({
      where: { id: params.id, userId: user.sub },
      data: updates,
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    await prisma.account.update({
      where: { id: params.id, userId: user.sub },
      data: { archived: true },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
