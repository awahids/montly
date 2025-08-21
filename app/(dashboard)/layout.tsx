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
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <Header />
        <main className="mobile-safe-area p-4 pb-20">
          <div className="w-full space-y-4 animate-fade-in">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] min-h-screen">
        <Sidebar />
        <div className="flex flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 animate-fade-in overflow-auto">
            <div className="w-full max-w-none space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}