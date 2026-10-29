import type { Metadata } from "next";
import Link from "next/link";

import { parseListingFilters } from "@/features/listings/schemas/filters";
import { getListingFeed } from "@/features/listings/services/listing.service";
import { getCurrentUser } from "@/lib/session";
import { DEMO_BRANDS, DEMO_CATEGORIES } from "@/features/marketplace/data/fixtures";
import { ListingsGrid } from "@/features/marketplace/components/listings-grid";
import { MarketplaceFilters } from "@/features/listings/components/marketplace-filters";
import { FilterDrawer } from "@/features/listings/components/filter-drawer";
import { SortSelect } from "@/features/listings/components/sort-select";
import { ActiveFilters } from "@/features/listings/components/active-filters";
import { ListingsPagination } from "@/features/listings/components/listings-pagination";
import { SaveSearchButton } from "@/features/saved-searches/components/save-search-button";
import type { ListingFilters } from "@/types/marketplace";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

/** True when the user has narrowed the feed in some way worth saving. */
function hasActiveFilters(filters: ListingFilters): boolean {
  return Boolean(
    filters.q ||
      filters.category ||
      filters.brand ||
      filters.condition ||
      filters.city ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.storage ||
      filters.ram ||
      filters.batteryHealthMin !== undefined ||
      filters.ptaStatus ||
      filters.cpidStatus ||
      filters.warranty ||
      filters.isInspected ||
      filters.isVerifiedSeller ||
      filters.isDealer,
  );
}

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse phones and accessories for sale across Pakistan.",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseListingFilters(await searchParams);
  const [feed, user] = await Promise.all([getListingFeed(filters), getCurrentUser()]);
  const canSaveSearch = hasActiveFilters(filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground text-sm">
            {feed.total.toLocaleString()} {feed.total === 1 ? "result" : "results"}
            {filters.q ? (
              <>
                {" for "}
                <span className="text-foreground font-medium">“{filters.q}”</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canSaveSearch ? <SaveSearchButton isAuthenticated={Boolean(user)} /> : null}
          <FilterDrawer categories={DEMO_CATEGORIES} brands={DEMO_BRANDS} filters={filters} />
          <SortSelect value={filters.sort} />
        </div>
      </div>

      {feed.source === "demo" ? (
        <Badge variant="outline" className="mb-4 text-amber-600 dark:text-amber-400">
          Preview data — connect a database to see live listings
        </Badge>
      ) : null}

      {/* Phone Intelligence Quick Links */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Link href="/compare" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Compare Phones
        </Link>
        <Link href="/valuation" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Check Value
        </Link>
        <Link href="/imei-check" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Verify IMEI
        </Link>
      </div>

      <div className="mb-4">
        <ActiveFilters filters={filters} categories={DEMO_CATEGORIES} brands={DEMO_BRANDS} />
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="bg-card sticky top-20 rounded-xl border p-4">
            <MarketplaceFilters
              categories={DEMO_CATEGORIES}
              brands={DEMO_BRANDS}
              filters={filters}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <ListingsGrid listings={feed.items} />
          <ListingsPagination page={feed.page} totalPages={feed.totalPages} />
        </div>
      </div>
    </div>
  );
}
