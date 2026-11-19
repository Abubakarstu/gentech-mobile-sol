import { PrismaPg } from "@prisma/adapter-pg";

import { seedDemoAccounts } from "./demo-accounts";
import { PrismaClient } from "../lib/generated/prisma/client";
import { isDemoSeedingEnabled } from "../lib/demo-mode";

// Prisma 7 no longer auto-loads .env; load it for standalone seed runs.
try {
  process.loadEnvFile();
} catch {
  // Ignore — env vars may already be present in the ambient environment.
}

function getConnectionString() {
  return process.env.DIRECT_URL ?? process.env.DATABASE_URL;
}

async function main() {
  if (!isDemoSeedingEnabled()) return;

  const connectionString = getConnectionString();
  if (!connectionString) {
    console.warn("Skipping demo account seeding: DATABASE_URL (or DIRECT_URL) is not configured.");
    return;
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    await seedDemoAccounts(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

// Build-time/dev-startup seeding is best-effort: a missing or stale preview database
// must never block local development or a Vercel deployment.
main().catch((error) => {
  console.warn("Demo account seeding skipped:", error instanceof Error ? error.message : error);
});
