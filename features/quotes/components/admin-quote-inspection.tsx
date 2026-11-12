"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { QUOTE_INSPECTION_RESULTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { inspectQuoteAction } from "@/features/quotes/actions/admin-quote.actions";
import type { QuoteDto } from "@/features/quotes/types";

/** Admin inspection screen: mark MATCH (price honoured) or MISMATCH (+reason, +adjusted price). */
export function AdminQuoteInspection({ quote }: { quote: QuoteDto }) {
  const router = useRouter();
  const [result, setResult] = React.useState<"MATCH" | "MISMATCH" | null>(
    quote.inspectionResult,
  );
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result) {
      toast.error("Choose match or mismatch.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const adjustedRaw = String(form.get("adjustedPricePkr") ?? "");
    setPending(true);
    const res = await inspectQuoteAction({
      id: quote.id,
      result,
      reason: String(form.get("reason") ?? "") || undefined,
      adjustedPricePkr:
        result === QUOTE_INSPECTION_RESULTS.MISMATCH && adjustedRaw ? Number(adjustedRaw) : undefined,
    });
    setPending(false);
    if (res.ok) {
      toast.success("Inspection recorded.");
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not record the inspection.");
    }
  }

  const alreadyDone = Boolean(quote.inspectedAt);

  return (
    <form onSubmit={handleSubmit} className="bg-card space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-sm font-semibold">Inspection outcome</h2>
        <p className="text-muted-foreground text-xs">
          Confirm the phone matches its answers &amp; photos, or record a mismatch with the adjusted
          price.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setResult("MATCH")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
            result === "MATCH"
              ? "border-emerald-500 ring-2 ring-emerald-500/30"
              : "hover:border-primary/40",
          )}
        >
          <CheckCircle2 className="size-4 text-emerald-600" /> Matches
        </button>
        <button
          type="button"
          onClick={() => setResult("MISMATCH")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
            result === "MISMATCH"
              ? "border-destructive ring-destructive/30 ring-2"
              : "hover:border-primary/40",
          )}
        >
          <XCircle className="text-destructive size-4" /> Mismatch
        </button>
      </div>

      {result === "MISMATCH" ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason for mismatch</Label>
            <Textarea
              id="reason"
              name="reason"
              required
              rows={2}
              maxLength={500}
              defaultValue={quote.inspectionReason ?? ""}
              placeholder="e.g. Screen has a crack not shown in photos; battery replaced."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adjustedPricePkr">Adjusted price (PKR)</Label>
            <Input
              id="adjustedPricePkr"
              name="adjustedPricePkr"
              type="number"
              min={0}
              step="500"
              required
              defaultValue={quote.adjustedPricePkr ?? undefined}
            />
          </div>
        </div>
      ) : null}

      {alreadyDone ? (
        <p className="text-muted-foreground text-xs">
          Recorded {new Date(quote.inspectedAt!).toLocaleString("en-PK")} ·{" "}
          {quote.inspectionResult === "MISMATCH" && quote.adjustedPricePkr != null
            ? `Adjusted to ${formatPrice(quote.adjustedPricePkr)}`
            : "Price honoured"}
        </p>
      ) : null}

      <Button type="submit" disabled={pending || !result}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {alreadyDone ? "Update outcome" : "Record inspection"}
      </Button>
    </form>
  );
}
