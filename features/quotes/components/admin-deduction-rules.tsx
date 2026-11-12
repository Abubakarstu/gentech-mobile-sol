"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatPrice } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteDeductionRuleAction,
  saveDeductionRuleAction,
  toggleDeductionRuleAction,
} from "@/features/quotes/actions/admin-quote.actions";
import type { DeductionRuleDto } from "@/features/quotes/types";

export function AdminDeductionRules({ rules }: { rules: DeductionRuleDto[] }) {
  const [creating, setCreating] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{rules.length} rules</p>
        <Button size="sm" onClick={() => setCreating((v) => !v)}>
          <Plus className="size-4" /> New rule
        </Button>
      </div>

      {creating ? (
        <div className="bg-card rounded-xl border p-4">
          <RuleForm submitLabel="Create rule" onDone={() => setCreating(false)} />
        </div>
      ) : null}

      <div className="space-y-2">
        {rules.map((rule) => (
          <RuleRow key={rule.id} rule={rule} />
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        Rule keys are matched against questionnaire answers (e.g. <code>water_damage</code>,{" "}
        <code>display_lines</code>). A rule uses a flat amount or a percentage of the base price.
      </p>
    </div>
  );
}

function RuleRow({ rule }: { rule: DeductionRuleDto }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function act(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    setPending(true);
    const res = await fn();
    setPending(false);
    if (res.ok) {
      toast.success(ok);
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not update.");
    }
  }

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{rule.label}</span>
            <Badge variant={rule.isActive ? "secondary" : "outline"}>
              {rule.isActive ? "Active" : "Off"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            <code>{rule.key}</code> ·{" "}
            {rule.amountPkr != null ? formatPrice(rule.amountPkr) : `${rule.percent}% of base`}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              act(
                () => toggleDeductionRuleAction({ key: rule.key, isActive: !rule.isActive }),
                rule.isActive ? "Disabled." : "Enabled.",
              )
            }
          >
            {rule.isActive ? "Disable" : "Enable"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? "Close" : "Edit"}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete rule "${rule.key}"?`))
                act(() => deleteDeductionRuleAction({ key: rule.key }), "Deleted.");
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {editing ? (
        <div className="mt-4 border-t pt-4">
          <RuleForm rule={rule} submitLabel="Save changes" onDone={() => setEditing(false)} />
        </div>
      ) : null}
    </div>
  );
}

function RuleForm({
  rule,
  submitLabel,
  onDone,
}: {
  rule?: DeductionRuleDto;
  submitLabel: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [mode, setMode] = React.useState<"amount" | "percent">(
    rule?.percent != null ? "percent" : "amount",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = Number(form.get("value") ?? 0);
    setPending(true);
    const res = await saveDeductionRuleAction({
      key: String(form.get("key") ?? "").trim(),
      label: String(form.get("label") ?? "").trim(),
      amountPkr: mode === "amount" ? value : null,
      percent: mode === "percent" ? value : null,
    });
    setPending(false);
    if (res.ok) {
      toast.success(rule ? "Rule updated." : "Rule created.");
      onDone();
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not save.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="key">Key</Label>
          <Input
            id="key"
            name="key"
            required
            defaultValue={rule?.key}
            readOnly={Boolean(rule)}
            placeholder="water_damage"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" required defaultValue={rule?.label} />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="mode">Type</Label>
          <select
            id="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as "amount" | "percent")}
            className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
          >
            <option value="amount">Flat amount (PKR)</option>
            <option value="percent">Percent of base</option>
          </select>
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="value">{mode === "amount" ? "Amount (PKR)" : "Percent (%)"}</Label>
          <Input
            id="value"
            name="value"
            type="number"
            min={0}
            step={mode === "amount" ? "500" : "1"}
            required
            defaultValue={mode === "percent" ? (rule?.percent ?? undefined) : (rule?.amountPkr ?? undefined)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
