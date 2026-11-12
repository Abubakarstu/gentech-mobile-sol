"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMultipliersAction } from "@/features/quotes/actions/admin-quote.actions";
import type { GradeMultipliers } from "@/features/quotes/types";

/** Edit the admin-editable A/B/C grade multipliers used in pricing (Step 5 + 8). */
export function AdminGradeMultipliers({ multipliers }: { multipliers: GradeMultipliers }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const res = await saveMultipliersAction({
      A: Number(form.get("A") ?? 1),
      B: Number(form.get("B") ?? 1),
      C: Number(form.get("C") ?? 1),
    });
    setPending(false);
    if (res.ok) {
      toast.success("Grade multipliers saved.");
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not save.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card space-y-4 rounded-xl border p-5">
      <p className="text-muted-foreground text-sm">
        Final price = base price × grade multiplier − deductions. 1.0 = full base price.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["A", "B", "C"] as const).map((g) => (
          <div key={g} className="space-y-1.5">
            <Label htmlFor={`mult-${g}`}>Grade {g}</Label>
            <Input
              id={`mult-${g}`}
              name={g}
              type="number"
              min={0}
              max={2}
              step="0.01"
              required
              defaultValue={multipliers[g]}
            />
          </div>
        ))}
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
        Save multipliers
      </Button>
    </form>
  );
}
