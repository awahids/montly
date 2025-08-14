import { prisma } from './prisma';

// Compute balances for multiple accounts in a single set of aggregate queries.
export async function getAccountBalances(
  userId: string,
  accountIds: string[],
) {
  if (accountIds.length === 0) return {} as Record<string, number>;

  const uniqueIds = Array.from(new Set(accountIds));

  const accounts = await prisma.account.findMany({
    where: { userId, id: { in: uniqueIds } },
    select: { id: true, openingBalance: true },
  });

  const balances: Record<string, number> = {};
  accounts.forEach(a => {
    balances[a.id] = Number(a.openingBalance);
  });

  const incomes = await prisma.transaction.groupBy({
    by: ['accountId'],
    where: { userId, accountId: { in: uniqueIds }, type: 'income' },
    _sum: { amount: true },
  });
  incomes.forEach(row => {
    const id = row.accountId!;
    const amt = Number(row._sum.amount || 0);
    balances[id] = (balances[id] || 0) + amt;
  });

  const expenses = await prisma.transaction.groupBy({
    by: ['accountId'],
    where: { userId, accountId: { in: uniqueIds }, type: 'expense' },
    _sum: { amount: true },
  });
  expenses.forEach(row => {
    const id = row.accountId!;
    const amt = Number(row._sum.amount || 0);
    balances[id] = (balances[id] || 0) - amt;
  });

  const transferOut = await prisma.transaction.groupBy({
    by: ['fromAccountId'],
    where: { userId, fromAccountId: { in: uniqueIds }, type: 'transfer' },
    _sum: { amount: true },
  });
  transferOut.forEach(row => {
    const id = row.fromAccountId!;
    const amt = Number(row._sum.amount || 0);
    balances[id] = (balances[id] || 0) - amt;
  });

  const transferIn = await prisma.transaction.groupBy({
    by: ['toAccountId'],
    where: { userId, toAccountId: { in: uniqueIds }, type: 'transfer' },
    _sum: { amount: true },
  });
  transferIn.forEach(row => {
    const id = row.toAccountId!;
    const amt = Number(row._sum.amount || 0);
    balances[id] = (balances[id] || 0) + amt;
  });

  return balances;
}
