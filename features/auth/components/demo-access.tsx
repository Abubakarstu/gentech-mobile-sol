"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin", label: "Admin panel", href: ROUTES.admin },
  { username: "user", password: "user", label: "User panel", href: ROUTES.dashboard },
  {
    username: "dealer",
    password: "dealer",
    label: "Dealer panel",
    href: `${ROUTES.dashboard}/dealer`,
  },
];

export function DemoAccess({ productionDemo = false }: { productionDemo?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const accounts = productionDemo
    ? DEMO_ACCOUNTS.filter((account) => account.username === "user")
    : DEMO_ACCOUNTS;

  async function enterDemo(username: string, password: string, href: string) {
    setPending(username);
    try {
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error("Demo sign-in is unavailable.");
      router.push(href);
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
          : "Local preview accounts. Data changes are not saved."}
      </p>
      <div className="mt-3 grid gap-2">
        {accounts.map((account) => (
          <Button
            key={account.username}
            type="button"
            variant="outline"
            className="justify-between"
            disabled={pending !== null}
            onClick={() => void enterDemo(account.username, account.password, account.href)}
          >
            <span>{pending === account.username ? "Opening..." : account.label}</span>
            <span className="text-muted-foreground font-mono text-xs">
              {account.username} / {account.password}
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
