"use client";

import * as React from "react";
import { AlertTriangle, Camera, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { PHOTO_SLOTS } from "@/features/quotes/lib/questions";
import { ACCEPTED_TYPES, prepareQuotePhoto } from "@/features/quotes/lib/image-quality";
import type { QuotePhoto } from "@/features/quotes/schemas/quote";

interface Props {
  value: QuotePhoto[];
  onChange: (photos: QuotePhoto[]) => void;
  /** Slots the AI asked to be retaken — highlighted in amber. */
  retakeSlots?: number[];
}

interface SignResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

interface UploadedPhoto {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

/**
 * Uploads one prepared blob and returns its hosted URL. Uses Cloudinary's signed
 * direct upload when configured; in development (sign route → 503) it falls back to
 * the dev-only local upload endpoint so the flow works without a Cloudinary account.
 */
async function uploadBlob(blob: Blob, slot: number): Promise<UploadedPhoto | null> {
  const signRes = await fetch("/api/v1/uploads/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ folder: "quotes" }),
  });

  // Cloudinary not configured → dev-only local fallback.
  if (signRes.status === 503) {
    const form = new FormData();
    form.append("file", blob, `quote-slot-${slot}.jpg`);
    form.append("folder", "quotes");
    const res = await fetch("/api/v1/uploads/local", { method: "POST", body: form });
    if (!res.ok) return null;
    const data = (await res.json()) as { secure_url: string; public_id: string };
    return { url: data.secure_url, publicId: data.public_id };
  }

  if (!signRes.ok) return null;
  const sign = (await signRes.json()) as SignResponse;

  const form = new FormData();
  form.append("file", blob, `quote-slot-${slot}.jpg`);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
  };
  return { url: data.secure_url, publicId: data.public_id, width: data.width, height: data.height };
}

export function QuotePhotoUpload({ value, onChange, retakeSlots = [] }: Props) {
  const [busySlot, setBusySlot] = React.useState<number | null>(null);
  const [errors, setErrors] = React.useState<Record<number, string>>({});
  const bySlot = React.useMemo(() => new Map(value.map((p) => [p.slot, p])), [value]);

  function setSlot(slot: number, photo: QuotePhoto | null) {
    const next = value.filter((p) => p.slot !== slot);
    if (photo) next.push(photo);
    next.sort((a, b) => a.slot - b.slot);
    onChange(next);
  }

  async function handleFile(slot: number, file: File | undefined) {
    if (!file) return;
    setErrors((e) => ({ ...e, [slot]: "" }));
    setBusySlot(slot);
    try {
      const prepared = await prepareQuotePhoto(file);
      if (!prepared.ok) {
        setErrors((e) => ({ ...e, [slot]: prepared.reason }));
        toast.error(prepared.reason);
        return;
      }

      const uploaded = await uploadBlob(prepared.blob, slot);
      if (!uploaded) {
        const msg = "Upload failed. Please try again.";
        setErrors((e) => ({ ...e, [slot]: msg }));
        toast.error(msg);
        return;
      }
      setSlot(slot, { slot, ...uploaded });
    } catch {
      setErrors((e) => ({ ...e, [slot]: "Upload failed. Please try again." }));
      toast.error("Upload failed. Please try again.");
    } finally {
      setBusySlot(null);
    }
  }

  return (
    <div className="space-y-3">
      {PHOTO_SLOTS.map((slot) => {
        const photo = bySlot.get(slot.slot);
        const busy = busySlot === slot.slot;
        const needsRetake = retakeSlots.includes(slot.slot);
        const error = errors[slot.slot];
        const inputId = `quote-photo-${slot.slot}`;

        return (
          <div
            key={slot.slot}
            className={cn(
              "bg-card flex gap-3 rounded-xl border p-3",
              needsRetake && "border-amber-400 bg-amber-50 dark:bg-amber-950/20",
              error && "border-destructive/50",
            )}
          >
            {/* Sample / preview */}
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-white">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slot.sample}
                  alt={`Sample: ${slot.en}`}
                  className="h-full w-full object-cover opacity-80"
                />
              )}
              {photo ? (
                <span className="absolute right-1 bottom-1 rounded-full bg-emerald-600 p-0.5 text-white">
                  <CheckCircle2 className="size-3.5" />
                </span>
              ) : null}
            </div>

            {/* Text + action */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-muted grid size-5 shrink-0 place-items-center rounded-full text-xs font-semibold">
                  {slot.slot}
                </span>
                <p className="truncate text-sm font-medium">{slot.en}</p>
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">{slot.instructionEn}</p>
              <p dir="rtl" className="text-muted-foreground text-xs">
                {slot.instructionUr}
              </p>

              {error ? (
                <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {error}
                </p>
              ) : needsRetake ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                  <RotateCcw className="size-3.5 shrink-0" />
                  Please retake this photo.
                </p>
              ) : null}

              <label
                htmlFor={inputId}
                className={cn(
                  "mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  busy ? "pointer-events-none opacity-60" : "hover:bg-muted",
                )}
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : photo ? (
                  <RotateCcw className="size-3.5" />
                ) : (
                  <Camera className="size-3.5" />
                )}
                {busy ? "Uploading…" : photo ? "Replace" : "Add photo"}
              </label>
              <input
                id={inputId}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                hidden
                capture="environment"
                onChange={(e) => handleFile(slot.slot, e.target.files?.[0])}
              />
            </div>
          </div>
        );
      })}
      <p className="text-muted-foreground text-xs">
        All {PHOTO_SLOTS.length} photos are required · JPG, PNG or HEIC · up to 8 MB each. We
        compress them automatically.
      </p>
    </div>
  );
}
