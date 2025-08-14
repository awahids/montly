import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';
import { startOfMonth, TIMEZONE } from '@/lib/date';
import type { Database } from '@/types/database';

export const revalidate = 60;

export async function GET(req: Request) {
  const supabase = createServerClient();
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

    // accounts for balance
    let accQuery = supabase
      .from('accounts')
      .select('id, opening_balance')
      .eq('user_id', user.id);
    if (accountId) {
      accQuery = accQuery.eq('id', accountId);
    }
    const { data: accounts, error: accErr } = await accQuery;
    if (accErr) {
      return NextResponse.json({ error: accErr.message }, { status: 400 });
    }

    // all transactions for balance
    let txAllQuery = supabase
      .from('transactions')
      .select('type, amount, account_id, from_account_id, to_account_id')
      .eq('user_id', user.id);
    if (accountId) {
      txAllQuery = txAllQuery.or(
        `account_id.eq.${accountId},from_account_id.eq.${accountId},to_account_id.eq.${accountId}`
      );
    }
    const { data: allTxs, error: allTxErr } = await txAllQuery;
    if (allTxErr) {
      return NextResponse.json({ error: allTxErr.message }, { status: 400 });
    }

    // month transactions with relations
    const buildMonthQuery = () => {
      let q = supabase
        .from('transactions')
        .select(
          `*,
          account:accounts!transactions_account_id_fkey(name, type),
          from_account:accounts!transactions_from_account_id_fkey(name, type),
          to_account:accounts!transactions_to_account_id_fkey(name, type),
          category:categories(name, color, icon)`
        )
        .eq('user_id', user.id)
        .gte('date', start.toISOString())
        .lt('date', end.toISOString())
        .order('date', { ascending: false });
      if (accountId) {
        q = q.or(
          `account_id.eq.${accountId},from_account_id.eq.${accountId},to_account_id.eq.${accountId}`
        );
      }
      return q;
    };
    const { data: monthTxs, error: monthErr } = await buildMonthQuery();
    if (monthErr) {
      return NextResponse.json({ error: monthErr.message }, { status: 400 });
    }

    // budgets for month
    type BudgetItem = Database['public']['Tables']['budget_items']['Row'] & {
      category: Pick<Database['public']['Tables']['categories']['Row'], 'name'> | null;
    };
    type Budget = { id: string; items: BudgetItem[] };
    const { data: budgetData, error: budgetErr } = await supabase
      .from('budgets')
      .select('id, items:budget_items(amount, category_id, category:categories(name))')
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle<Budget>();
    if (budgetErr) {
      return NextResponse.json({ error: budgetErr.message }, { status: 400 });
    }

    let totalBalance = 0;
    accounts?.forEach(acc => {
      let balance = acc.opening_balance;
      allTxs?.forEach(t => {
        if (t.type === 'income' && t.account_id === acc.id) balance += t.amount;
        if (t.type === 'expense' && t.account_id === acc.id) balance -= t.amount;
        if (t.type === 'transfer') {
          if (t.from_account_id === acc.id) balance -= t.amount;
          if (t.to_account_id === acc.id) balance += t.amount;
        }
      });
      totalBalance += balance;
    });

    const items = budgetData?.items ?? [];
    const perCategoryMap = new Map<string, { categoryId: string; categoryName: string; planned: number; actual: number }>();
    let totalPlanned = 0;
    items.forEach(item => {
      totalPlanned += item.amount;
      perCategoryMap.set(item.category_id, {
        categoryId: item.category_id,
        categoryName: item.category?.name ?? '',
        planned: item.amount,
        actual: 0,
      });
    });

    const nowJakarta = new Date(
      new Date().toLocaleString('en-US', { timeZone: TIMEZONE })
    );
    let mtdSpend = 0;
    const dailyMap = new Map<string, number>();
    const categoryMap = new Map<string, { categoryId: string; name: string; color: string; amount: number }>();
    monthTxs?.forEach(tx => {
      if (tx.type === 'expense') {
        if (new Date(tx.date) <= nowJakarta) {
          mtdSpend += tx.amount;
        }
        const dayKey = tx.date.slice(0, 10);
        dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + tx.amount);
        if (tx.category_id) {
          const cat = categoryMap.get(tx.category_id);
          const name = tx.category?.name ?? '';
          const color = tx.category?.color ?? '';
          if (cat) cat.amount += tx.amount;
          else categoryMap.set(tx.category_id, { categoryId: tx.category_id, name, color, amount: tx.amount });
          const pc = perCategoryMap.get(tx.category_id);
          if (pc) pc.actual += tx.amount;
          else {
            perCategoryMap.set(tx.category_id, {
              categoryId: tx.category_id,
              categoryName: name,
              planned: 0,
              actual: tx.amount,
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

