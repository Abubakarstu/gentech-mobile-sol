import "server-only";

import { prisma } from "@/lib/prisma";

export const EMAIL_VERIFICATION_REQUIRED_KEY = "EMAIL_VERIFICATION_REQUIRED";

/** Reads a boolean setting, falling back to `false` when it is absent or unavailable. */
export async function readBooleanSetting(key: string): Promise<boolean> {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key },
      select: { value: true },
    });
    return setting?.value === true;
  } catch {
    // Missing migration/table or an unavailable database must never lock users out.
    return false;
  }
}

export async function writeBooleanSetting(key: string, value: boolean, actorId: string) {
  await prisma.appSetting.upsert({
    where: { key },
    update: { value, updatedBy: actorId },
    create: { key, value, updatedBy: actorId },
  });
}
