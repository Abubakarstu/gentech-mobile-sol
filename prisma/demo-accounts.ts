import { hashPassword } from "better-auth/crypto";

import { DEMO_ACCOUNTS } from "../features/auth/lib/demo-accounts";
import type { PrismaClient } from "../lib/generated/prisma/client";

/**
 * Idempotent demo-account upserts shared by the explicit seed command and the
 * best-effort dev/preview seed entrypoint. Callers are responsible for checking
 * environment flags and database availability.
 */
export async function seedDemoAccounts(prisma: PrismaClient) {
  for (const demoAccount of DEMO_ACCOUNTS) {
    const password = await hashPassword(demoAccount.password);
    // Dealer capability is modelled by DealerUser membership, not a Role enum value.
    const role = demoAccount.role === "DEALER" ? "USER" : demoAccount.role;
    const user = await prisma.user.upsert({
      where: { email: demoAccount.email },
      update: {
        name: demoAccount.name,
        emailVerified: true,
        role,
      },
      create: {
        name: demoAccount.name,
        email: demoAccount.email,
        emailVerified: true,
        role,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    await prisma.account.upsert({
      where: {
        providerId_accountId: { providerId: "credential", accountId: user.id },
      },
      update: { password },
      create: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password,
      },
    });

    if (demoAccount.key === "dealer") {
      const dealer = await prisma.dealer.upsert({
        where: { slug: "demo-mobile-store" },
        update: {
          name: "Demo Mobile Store",
          businessName: "GenTech Demo Mobile Store",
          status: "ACTIVE",
          isVerified: true,
          verifiedAt: new Date(),
        },
        create: {
          name: "Demo Mobile Store",
          slug: "demo-mobile-store",
          businessName: "GenTech Demo Mobile Store",
          description: "Seeded demo dealership for sign-in and dealer dashboard previews.",
          email: demoAccount.email,
          city: "Lahore",
          status: "ACTIVE",
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      await prisma.dealerUser.upsert({
        where: {
          dealerId_userId: { dealerId: dealer.id, userId: user.id },
        },
        update: { role: "owner", isActive: true },
        create: { dealerId: dealer.id, userId: user.id, role: "owner", isActive: true },
      });
    }
  }

  console.info("✓ Seeded demo admin, inspector, user, and dealer accounts.");
}
