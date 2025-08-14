import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { budgetItemsAddSchema } from '@/lib/validation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  let body: z.infer<typeof budgetItemsAddSchema>;
  try {
    body = budgetItemsAddSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  try {
    const user = await getUser();
    const budget = await prisma.budget.findFirst({
      where: { id: params.id, userId: user.sub },
      select: { id: true },
    });
    if (!budget) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const inserts = body.items.map(i => ({
      budgetId: budget.id,
      categoryId: i.categoryId,
      amount: i.amount,
      rollover: i.rollover ?? false,
    }));
    const data = await prisma.budgetItem.createMany({ data: inserts });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
