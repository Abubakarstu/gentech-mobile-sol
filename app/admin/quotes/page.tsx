import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import { buttonVariants } from "@/components/ui/button";
import { getAllQuotes } from "@/features/quotes/services/quote.service";
import { AdminQuoteList } from "@/features/quotes/components/admin-quote-list";

export const metadata: Metadata = { title: "Quotes · Admin" };

export default async function AdminQuotesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect(ROUTES.dashboard);

  const quotes = await getAllQuotes(200);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Sell-Your-Phone Quotes</h2>
          <p className="text-muted-foreground text-sm">
            Every instant quote, with its AI grade, photos and inspection outcome.
          </p>
        </div>
        <Link href={`${ROUTES.adminQuotes}/pricing`} className={cn(buttonVariants({ variant: "outline" }))}>
          <SlidersHorizontal className="size-4" /> Pricing &amp; rules
        </Link>
      </div>
      <AdminQuoteList quotes={quotes} />
    </div>
  );
}
