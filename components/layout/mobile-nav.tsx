"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Receipt, Plus, PieChart, Settings } from "lucide-react";
import TransactionForm from "@/components/transactions/transaction-form";
import type { Transaction } from "@/types";
import { useAppStore } from "@/lib/store";

const links = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/transactions", icon: Receipt, label: "Transactions" },
  // index 2 akan diisi tombol Plus
  { href: "/budgets", icon: PieChart, label: "Budgets" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [formOpen, setFormOpen] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | undefined>();
  const { accounts, categories } = useAppStore();

  const handleAddTransaction = () => {
    setTransaction(undefined);
    setFormOpen(true);
  };

  // Sisipkan tombol Plus pada index ke-2 (0-based)
  const navWithPlus = [
    links[0],
    links[1],
    "PLUS", // marker untuk tombol tambah
    links[2],
    links[3],
  ] as const;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-card/95 backdrop-blur-md sm:hidden shadow-lg">
        <div className="safe-area-bottom flex items-center justify-around px-4 py-2">
          {navWithPlus.map((item, idx) => {
            if (item === "PLUS") {
              return (
                <button
                  key={`plus-${idx}`}
                  onClick={handleAddTransaction}
                  aria-label="Add transaction"
                  className={cn(
                    "relative -mt-6 flex h-12 w-12 items-center justify-center rounded-full",
                    "bg-gradient-to-tr from-primary to-primary/70 shadow-xl transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/40",
                  )}
                >
                  <Plus className="h-6 w-6 text-white" />
                  <span className="sr-only">Add transaction</span>
                </button>
              );
            }

            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (pathname?.startsWith(item.href) && item.href !== "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  "flex min-w-[64px] flex-col items-center justify-center rounded-lg p-3 transition-transform duration-200",
                  isActive
                    ? "scale-110 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-primary active:scale-95",
                )}
              >
                <Icon className="mb-1 h-5 w-5 flex-shrink-0" />
                {/* Optional label (mobile icon-only) */}
                {/* <span className="text-xs">{item.label}</span> */}
              </Link>
            );
          })}
        </div>
      </nav>

      {formOpen && (
        <TransactionForm
          open={formOpen}
          transaction={transaction}
          accounts={accounts}
          categories={categories}
          onOpenChange={(open) => setFormOpen(open)}
          onSubmit={async (values) => {
            // TODO: call your create transaction API here
            console.log("Transaction Submitted:", values);
            setFormOpen(false);
          }}
        />
      )}
    </>
  );
}

export default MobileNav;
