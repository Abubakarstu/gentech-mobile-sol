"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DEMO_ACCOUNTS } from "@/features/auth/lib/demo-accounts";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const DASHBOARD_ROUTES: Record<string, string> = {
  admin: ROUTES.admin,
  inspector: ROUTES.inspector,
  user: ROUTES.dashboard,
  dealer: ROUTES.dealerDashboard,
};

export function DemoAccess({ productionDemo = false }: { productionDemo?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const accounts = productionDemo
    ? DEMO_ACCOUNTS.filter((account) => account.key === "user")
    : DEMO_ACCOUNTS;

  async function enterDemo(email: string, password: string, key: string, dashboard: string) {
    setPending(key);
    try {
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Demo sign-in is unavailable.");
      router.push(DASHBOARD_ROUTES[dashboard] ?? ROUTES.dashboard);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start demo session.");
      setPending(null);
    }
  }

  return (
    <section className="border-t pt-5" aria-label="Demo accounts">
      <h2 className="text-sm font-semibold">Demo access</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        {productionDemo
          ? "Read-only preview account. Database changes are disabled."
          : "One-click demo sign-in. No email verification required."}
      </p>
      <div className="mt-3 grid gap-2">
        {accounts.map((account) => (
          <Button
            key={account.key}
            type="button"
            variant="outline"
            className="h-auto flex-col items-stretch gap-1 py-2.5 text-left"
            disabled={pending !== null}
            onClick={() =>
              void enterDemo(account.email, account.password, account.key, account.dashboard)
            }
          >
            <span className="text-sm font-medium">
              {pending === account.key ? "Opening..." : account.label}
            </span>
            <span className="text-muted-foreground font-mono text-[11px] leading-4">
              {account.email}
            </span>
            <span className="text-muted-foreground font-mono text-[11px] leading-4">
              {account.password}
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
