"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";

import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { formatIDR } from "@/lib/currency";
import { Budget, Transaction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BudgetDetailDialog } from "@/components/budgets/budget-detail-dialog";

const toCamel = (str: string) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function keysToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v)) as any;
  }
  if (obj && typeof obj === "object" && obj.constructor === Object) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[toCamel(key)] = keysToCamel(value);
    }
    return result as T;
  }
  return obj as T;
}

export default function BudgetsPage() {
  const {
    user,
    budgets,
    transactions,
    setBudgets,
    setTransactions,
    loading,
    setLoading,
    getCategorySpending,
  } = useAppStore();

  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: budgetsData } = await supabase
          .from("budgets")
          .select(`*, items:budget_items(*, category:categories(*))`)
          .eq("user_id", user.id);
        if (budgetsData) setBudgets(keysToCamel<Budget[]>(budgetsData));

        if (!transactions.length) {
          const { data: transactionsData } = await supabase
            .from("transactions")
            .select(`
              *,
              account:accounts(name, type),
              from_account:accounts!transactions_from_account_id_fkey(name, type),
              to_account:accounts!transactions_to_account_id_fkey(name, type),
              category:categories(name, color, icon)
            `)
            .eq("user_id", user.id);
          if (transactionsData)
            setTransactions(keysToCamel<Transaction[]>(transactionsData));
        }
      } catch (error) {
        console.error("Failed to fetch budgets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, setBudgets, setTransactions, transactions.length, setLoading]);

  const years = Array.from(new Set(budgets.map((b) => b.month.slice(0, 4)))).sort();
  const months = Array.from(
    new Set(
      budgets
        .filter((b) => year === "all" || b.month.startsWith(year))
        .map((b) => b.month.slice(5, 7))
    )
  ).sort();
  const filteredBudgets = budgets.filter(
    (b) =>
      (year === "all" || b.month.startsWith(year)) &&
      (month === "all" || b.month.slice(5, 7) === month)
  );

  const renderBudgetCard = (budget: Budget) => {
    const totalBudget =
      budget.items?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const totalSpent =
      budget.items?.reduce(
        (sum, item) =>
          sum + getCategorySpending(item.categoryId, budget.month),
        0
      ) || 0;
    const progress = totalBudget ? (totalSpent / totalBudget) * 100 : 0;
    const indicatorColor =
      progress < 70
        ? "bg-green-500"
        : progress <= 100
        ? "bg-orange-500"
        : "bg-red-500";

    return (
      <Card
        key={budget.id}
        className="bg-muted/50 hover:shadow-md transition-shadow"
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{budget.month}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedBudgetId(budget.id)}
            className="transition-transform hover:scale-105"
          >
            View
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Planned</span>
            <span>{formatIDR(totalBudget)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Spent</span>
            <span>{formatIDR(totalSpent)}</span>
          </div>
          <Progress value={progress} indicatorClassName={indicatorColor} />
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">Manage your budgets.</p>
        </div>
        <div className="hidden md:block">
          <Link href="/budgets/new">
            <Button className="transition-transform hover:scale-105">
              Add Budget
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 max-w-sm">
        <Select
          value={year}
          onValueChange={(v) => {
            setYear(v);
            setMonth("all");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={month}
          onValueChange={setMonth}
        >
          <SelectTrigger>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {format(new Date(0, Number(m) - 1), "MMMM")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBudgets.map((b) => renderBudgetCard(b))}
      </div>

      <Link
        href="/budgets/new"
        className="md:hidden fixed bottom-6 right-6"
      >
        <Button
          className="h-12 w-12 rounded-full p-0 shadow-lg transition-transform hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
      <BudgetDetailDialog
        budgetId={selectedBudgetId}
        open={selectedBudgetId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedBudgetId(null);
        }}
      />
    </div>
  );
}

