"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PTA_STATUS_LABELS, PTA_STATUSES, type PtaStatus } from "@/lib/constants";
import { formatPrice } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPhoneModelAction,
  deletePhoneModelAction,
  updatePhoneModelAction,
} from "@/features/quotes/actions/admin-quote.actions";
import type { PhoneModelDto } from "@/features/quotes/types";

const PTA_VALUES = Object.values(PTA_STATUSES) as PtaStatus[];

export function AdminPriceBook({ models }: { models: PhoneModelDto[] }) {
  const [creating, setCreating] = React.useState(false);
  const [filter, setFilter] = React.useState("");

  const filtered = models.filter((m) =>
    `${m.brand} ${m.model} ${m.storage} ${m.ptaStatus}`.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Filter by brand, model, storage…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" onClick={() => setCreating((v) => !v)}>
          <Plus className="size-4" /> New price
        </Button>
      </div>

      {creating ? (
        <div className="bg-card rounded-xl border p-4">
          <ModelForm submitLabel="Add price" onDone={() => setCreating(false)} />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Brand</th>
              <th className="px-3 py-2 font-medium">Model</th>
              <th className="px-3 py-2 font-medium">Storage</th>
              <th className="px-3 py-2 font-medium">PTA</th>
              <th className="px-3 py-2 text-right font-medium">Base price</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <ModelRow key={m.id} model={m} />
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-3 py-6 text-center">
                  No matching rows.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground text-xs">{models.length} price rows</p>
    </div>
  );
}

function ModelRow({ model }: { model: PhoneModelDto }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function remove() {
    if (!confirm(`Delete ${model.brand} ${model.model} ${model.storage} (${model.ptaStatus})?`))
      return;
    setPending(true);
    const res = await deletePhoneModelAction({ id: model.id });
    setPending(false);
    if (res.ok) {
      toast.success("Deleted.");
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not delete.");
    }
  }

  return (
    <>
      <tr className="border-t">
        <td className="px-3 py-2">{model.brand}</td>
        <td className="px-3 py-2">{model.model}</td>
        <td className="px-3 py-2">{model.storage}</td>
        <td className="px-3 py-2">
          <Badge variant="secondary">{PTA_STATUS_LABELS[model.ptaStatus]}</Badge>
        </td>
        <td className="px-3 py-2 text-right font-medium">{formatPrice(model.basePricePkr)}</td>
        <td className="px-3 py-2">
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
              {editing ? "Close" : "Edit"}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={remove} disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            </Button>
          </div>
        </td>
      </tr>
      {editing ? (
        <tr className="border-t">
          <td colSpan={6} className="bg-muted/30 px-3 py-4">
            <ModelForm model={model} submitLabel="Save" onDone={() => setEditing(false)} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ModelForm({
  model,
  submitLabel,
  onDone,
}: {
  model?: PhoneModelDto;
  submitLabel: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      brand: String(form.get("brand") ?? "").trim(),
      model: String(form.get("model") ?? "").trim(),
      storage: String(form.get("storage") ?? "").trim(),
      ptaStatus: String(form.get("ptaStatus") ?? "") as PtaStatus,
      basePricePkr: Number(form.get("basePricePkr") ?? 0),
    };
    setPending(true);
    const res = model
      ? await updatePhoneModelAction({ id: model.id, ...payload })
      : await createPhoneModelAction(payload);
    setPending(false);
    if (res.ok) {
      toast.success(model ? "Updated." : "Added.");
      onDone();
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not save.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="brand">Brand</Label>
        <Input id="brand" name="brand" required defaultValue={model?.brand} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="model">Model</Label>
        <Input id="model" name="model" required defaultValue={model?.model} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="storage">Storage</Label>
        <Input id="storage" name="storage" required defaultValue={model?.storage} placeholder="128GB" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ptaStatus">PTA status</Label>
        <select
          id="ptaStatus"
          name="ptaStatus"
          defaultValue={model?.ptaStatus ?? ""}
          required
          className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
        >
          <option value="" disabled>
            Select
          </option>
          {PTA_VALUES.map((p) => (
            <option key={p} value={p}>
              {PTA_STATUS_LABELS[p]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="basePricePkr">Base price (PKR)</Label>
        <Input
          id="basePricePkr"
          name="basePricePkr"
          type="number"
          min={0}
          step="500"
          required
          defaultValue={model?.basePricePkr}
        />
      </div>
      <div className="flex gap-2 lg:col-span-5">
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
