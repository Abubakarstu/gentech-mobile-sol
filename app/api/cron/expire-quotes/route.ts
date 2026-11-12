import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { expireQuotes } from "@/features/quotes/services/quote.service";

export const dynamic = "force-dynamic";

/**
 * Scheduled job (Step 7): flips every quote past its 72h validity to EXPIRED.
 *
 * Trigger it from any scheduler (Cloudflare Cron Trigger → fetch, GitHub Actions,
 * external cron) with `Authorization: Bearer <CRON_SECRET>`. Quotes are also expired
 * lazily on read, so this is a safety net that keeps listings/counters consistent.
 */
async function handle(request: NextRequest) {
  const secret = env.CRON_SECRET;
  const authorized = request.headers.get("authorization") === `Bearer ${secret}`;

  if (secret) {
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else if (env.NODE_ENV === "production") {
    // Refuse to run an unguarded job in production.
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  try {
    const expired = await expireQuotes();
    return NextResponse.json({ ok: true, expired });
  } catch (error) {
    console.error("[quotes] expire cron failed:", error);
    return NextResponse.json({ ok: false, error: "Job failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handle(request);
}

// GET is convenient for simple cron services; the bearer secret still guards it.
export async function GET(request: NextRequest) {
  return handle(request);
}
