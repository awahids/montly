"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { formatIDR } from "@/lib/currency";
import { Budget, BudgetItem, Category, Transaction } from "@/types";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export async function generateStaticParams() {
  return [];
}

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

export default function BudgetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const {
    user,
    budgets,
    categories,
    transactions,
    setBudgets,
    setCategories,
    setTransactions,
    loading,
    setLoading,
    getCategorySpending,
    getMonthlySpending,
  } = useAppStore();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newAmount, setNewAmount] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch budget
        if (!budgets.find((b) => b.id === params.id)) {
          const { data: budgetData } = await supabase
            .from("budgets")
            .select(`*, items:budget_items(*, category:categories(*))`)
            .eq("user_id", user.id)
            .eq("id", params.id)
            .single();
          if (budgetData) {
            const fetchedBudget = keysToCamel<Budget>(budgetData);
            const existing = budgets.find((b) => b.id === fetchedBudget.id);
            const updatedBudgets = existing
              ? budgets.map((b) => (b.id === fetchedBudget.id ? fetchedBudget : b))
              : [...budgets, fetchedBudget];
            setBudgets(updatedBudgets);
            setBudget(fetchedBudget);
            setItems(fetchedBudget.items || []);
          }
        } else {
          const existingBudget = budgets.find((b) => b.id === params.id) || null;
          setBudget(existingBudget);
          setItems(existingBudget?.items || []);
        }

        if (!categories.length) {
          const { data: categoriesData } = await supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id);
          if (categoriesData)
            setCategories(keysToCamel<Category[]>(categoriesData));
        }

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
        console.error("Failed to fetch budget:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, params.id, budgets, categories.length, transactions.length, setBudgets, setCategories, setTransactions, setLoading]);

  const totalBudget = useMemo(
    () => items.reduce((sum, item) => sum + item.amount, 0),
    [items]
  );
  const totalSpent = budget ? getMonthlySpending(budget.month) : 0;

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.type === "expense" && !items.some((i) => i.categoryId === c.id)
      ),
    [categories, items]
  );

  const handleUpdateItem = async (itemId: string, amount: number) => {
    const { error } = await supabase
      .from("budget_items")
      .update({ amount })
      .eq("id", itemId);
    if (!error) {
      const updatedItems = items.map((i) =>
        i.id === itemId ? { ...i, amount } : i
      );
      setItems(updatedItems);
      setBudgets(
        budgets.map((b) =>
          b.id === budget?.id ? { ...b, items: updatedItems } : b
        )
      );
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await supabase
      .from("budget_items")
      .delete()
      .eq("id", itemId);
    if (!error) {
      const updatedItems = items.filter((i) => i.id !== itemId);
      setItems(updatedItems);
      setBudgets(
        budgets.map((b) =>
          b.id === budget?.id ? { ...b, items: updatedItems } : b
        )
      );
    }
  };

  const handleAddItem = async () => {
    const amount = parseFloat(newAmount);
    if (!newCategoryId || isNaN(amount) || !budget) return;
    const { data, error } = await supabase
      .from("budget_items")
      .insert({
        budget_id: budget.id,
        category_id: newCategoryId,
        amount,
        rollover: false,
      })
      .select(`*, category:categories(*)`)
      .single();
    if (!error && data) {
      const newItem = keysToCamel<BudgetItem>(data);
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      setBudgets(
        budgets.map((b) =>
          b.id === budget.id ? { ...b, items: updatedItems } : b
        )
      );
      setNewCategoryId("");
      setNewAmount("");
    }
  };

  if (loading || !budget) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background pb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          Back
        </Button>
        <Button onClick={() => setIsEditing((v) => !v)}>
          {isEditing ? "Done" : "Edit"}
        </Button>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {budget.month}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Budget</span>
            <span className="text-lg font-medium">{formatIDR(totalBudget)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <span className="text-lg font-medium">{formatIDR(totalSpent)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead>Progress</TableHead>
              {isEditing && <TableHead className="w-0" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const spent = getCategorySpending(item.categoryId, budget.month);
              const progress = item.amount
                ? (spent / item.amount) * 100
                : 0;
              const Icon =
                (Icons as any)[item.category?.icon as keyof typeof Icons] ||
                Icons.Circle;
              const indicatorColor =
                progress < 70
                  ? "bg-green-500"
                  : progress <= 100
                    ? "bg-orange-500"
                    : "bg-red-500";
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon
                        className="h-4 w-4"
                        style={{ color: item.category?.color }}
                      />
                      <span>{item.category?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id
                                ? { ...i, amount: parseFloat(e.target.value) }
                                : i
                            )
                          )
                        }
                        onBlur={() => handleUpdateItem(item.id, item.amount)}
                        className="w-24 ml-auto"
                      />
                    ) : (
                      formatIDR(item.amount)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatIDR(spent)}
                  </TableCell>
                  <TableCell>
                    <Progress
                      value={Math.min(progress, 100)}
                      indicatorClassName={indicatorColor}
                    />
                  </TableCell>
                  {isEditing && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {isEditing && (
              <TableRow>
                <TableCell>
                  <Select
                    value={newCategoryId}
                    onValueChange={setNewCategoryId}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-24 ml-auto"
                  />
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={handleAddItem}
                    disabled={!newCategoryId || !newAmount}
                  >
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {items.map((item) => {
          const spent = getCategorySpending(item.categoryId, budget.month);
          const progress = item.amount
            ? (spent / item.amount) * 100
            : 0;
          const Icon =
            (Icons as any)[item.category?.icon as keyof typeof Icons] ||
            Icons.Circle;
          const indicatorColor =
            progress < 70
              ? "bg-green-500"
              : progress <= 100
                ? "bg-orange-500"
                : "bg-red-500";
          return (
            <Card key={item.id} className="bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-5 w-5"
                    style={{ color: item.category?.color }}
                  />
                  <CardTitle className="text-sm">
                    {item.category?.name}
                  </CardTitle>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((i) =>
                            i.id === item.id
                              ? {
                                ...i,
                                amount: parseFloat(e.target.value),
                              }
                              : i
                          )
                        )
                      }
                      onBlur={() => handleUpdateItem(item.id, item.amount)}
                      className="w-32 text-right"
                    />
                  ) : (
                    <span>{formatIDR(item.amount)}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span>Spent</span>
                  <span>{formatIDR(spent)}</span>
                </div>
                <Progress
                  value={Math.min(progress, 100)}
                  indicatorClassName={indicatorColor}
                />
              </CardContent>
            </Card>
          );
        })}
        {isEditing && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Add Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Amount"
              />
              <Button
                className="w-full"
                onClick={handleAddItem}
                disabled={!newCategoryId || !newAmount}
              >
                Add
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

