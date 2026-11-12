import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { getMyQuotes } from "@/features/quotes/services/quote.service";
import { MyQuotesList } from "@/features/quotes/components/my-quotes-list";

export const metadata: Metadata = { title: "My Quotes" };

export default async function MyQuotesPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.signIn);

  const quotes = await getMyQuotes(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Quotes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your instant sell-your-phone quotes. Expired ones can be requoted at today&apos;s price.
          </p>
        </div>
        <Link href={ROUTES.sellPhone} className={cn(buttonVariants())}>
          New quote
        </Link>
      </div>
      <MyQuotesList quotes={quotes} />
    </div>
  );
}
