"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}