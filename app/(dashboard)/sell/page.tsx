import type { Metadata } from "next";
import Link from "next/link";

import { DEMO_BRANDS, DEMO_CATEGORIES } from "@/features/marketplace/data/fixtures";
import { CreateListingForm } from "@/features/listings/components/create-listing-form";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Post your ad" };

export default function SellPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Post your ad</h1>
        <p className="text-muted-foreground text-sm">
          Add a few photos and details to reach thousands of buyers near you.
        </p>
      </header>

      {/* Phone Intelligence Quick Links */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          href="/valuation"
          className={buttonVariants({ variant: "outline", className: "flex flex-col items-center justify-center gap-2 h-auto py-4" })}
        >
          <span className="text-lg">💰</span>
          <span className="text-sm font-medium">Check Value</span>
          <span className="text-xs text-muted-foreground">Get price estimate</span>
        </Link>
        <Link
          href="/imei-check"
          className={buttonVariants({ variant: "outline", className: "flex flex-col items-center justify-center gap-2 h-auto py-4" })}
        >
          <span className="text-lg">🔍</span>
          <span className="text-sm font-medium">Verify IMEI</span>
          <span className="text-xs text-muted-foreground">Check PTA status</span>
        </Link>
      </div>

      <CreateListingForm categories={DEMO_CATEGORIES} brands={DEMO_BRANDS} />
    </div>
  );
}
