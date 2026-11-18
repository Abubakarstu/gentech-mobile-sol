"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import {
  isEmailVerificationRequired,
  setEmailVerificationRequired,
} from "@/features/admin/services/settings.service";
import { logAudit } from "@/features/audit";

type ActionResult = { ok: boolean; error?: string };

const emailVerificationSchema = z.object({ required: z.boolean() });

export async function setEmailVerificationRequiredAction(input: {
  required: boolean;
}): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Admin access required." };

  const parsed = emailVerificationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  try {
    const before = await isEmailVerificationRequired();
    if (before === parsed.data.required) return { ok: true };

    await setEmailVerificationRequired(parsed.data.required, admin.id);
    await logAudit({
      actorId: admin.id,
      action: parsed.data.required
        ? "EMAIL_VERIFICATION_ENABLED"
        : "EMAIL_VERIFICATION_DISABLED",
      resource: "AppSetting",
      resourceId: "EMAIL_VERIFICATION_REQUIRED",
      before: { required: before },
      after: { required: parsed.data.required },
    });
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (error) {
    console.error("[admin] failed to update email verification setting:", error);
    return { ok: false, error: "Could not save the setting." };
  }
}
