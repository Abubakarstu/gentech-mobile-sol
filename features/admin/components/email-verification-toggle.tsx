"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { setEmailVerificationRequiredAction } from "@/features/admin/actions/settings.actions";

export function EmailVerificationToggle({ initialRequired }: { initialRequired: boolean }) {
  const [required, setRequired] = useState(initialRequired);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await setEmailVerificationRequiredAction({ required: !required });
      if (!result.ok) {
        toast.error(result.error ?? "Could not save the setting.");
        return;
      }
      setRequired(!required);
      toast.success(
        !required
          ? "Email verification is now required for new unverified accounts."
          : "Email verification is off.",
      );
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
      <div>
        <p className="text-sm font-medium text-slate-100">Require email verification</p>
        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
          Off by default. When enabled, unverified accounts cannot complete email sign-in until they
          verify their address. Demo accounts are always pre-verified.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={required}
        aria-label="Require email verification"
        disabled={pending}
        onClick={toggle}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          required
            ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
            : "bg-white/10 text-slate-300 hover:bg-white/15"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pending ? "Saving..." : required ? "Required" : "Off"}
      </button>
    </div>
  );
}
