import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getUser();
    const data = await prisma.category.findMany({
      where: { userId: user.sub },
      select: { id: true, name: true, type: true, color: true, icon: true },
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
