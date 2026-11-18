import "server-only";

import {
  EMAIL_VERIFICATION_REQUIRED_KEY,
  readBooleanSetting,
  writeBooleanSetting,
} from "@/features/admin/repositories/settings.repository";

/** Email verification is opt-in; default-off keeps local and preview sign-in frictionless. */
export async function isEmailVerificationRequired(): Promise<boolean> {
  return readBooleanSetting(EMAIL_VERIFICATION_REQUIRED_KEY);
}

export async function setEmailVerificationRequired(required: boolean, actorId: string) {
  await writeBooleanSetting(EMAIL_VERIFICATION_REQUIRED_KEY, required, actorId);
}
