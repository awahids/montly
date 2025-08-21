"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAppStore } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser } = useAppStore();

  useEffect(() => {
    if (user) return;
    (async () => {
      const current = await getCurrentUser();
      if (current) {
        setUser(current);
      } else {
        router.push("/auth/sign-in");
      }
    })();
  }, [user, setUser, router]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-gradient-to-br from-background via-background to-muted/20">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 animate-fade-in">
          <div className="w-full max-w-none space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}