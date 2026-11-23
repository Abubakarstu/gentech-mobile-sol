import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  getCountryFromParam,
  getLocaleFromParam,
  getRegionForCountry,
} from "@/lib/countries/server";
import { getCountryName } from "@/lib/countries";
import { APP_URL } from "@/lib/app-url";
import { ROUTES } from "@/lib/constants";
import { localizedPath, isNonCanonicalQueryVariant, localizedSeoMetadata } from "@/lib/seo/metadata";
import { buildItemListStructuredData } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { LocalizedLink } from "@/components/localized-link";
import { parseListingFilters } from "@/features/listings/schemas/filters";
import { getListingFeed, getListingFilterOptions } from "@/features/listings/services/listing.service";
import { getCurrentUser } from "@/lib/session";
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
import { cn } from "@/lib/utils";
import { getActiveLocationTree } from "@/features/locations/services/location.service";
import {
  getMarketplaceBrands,
  getMarketplaceCategories,
} from "@/features/marketplace/services/catalog.service";
import { getFavoriteListingIds } from "@/features/favorites/services/favorite.service";
import { CompareControls } from "@/features/compare/components/compare-controls";
import { CompareSelectionProvider } from "@/features/compare/components/compare-selection-provider";

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
      filters.isDealer ||
      filters.color,
  );
}

type PageProps = {
  params: Promise<{ country: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { country, locale } = await params;
  const countryCode = getCountryFromParam(country);
  const resolvedLocale = getLocaleFromParam(locale, countryCode);
  const t = await getTranslations({ locale: resolvedLocale, namespace: "marketplace" });
  const hasQueryVariants = isNonCanonicalQueryVariant(await searchParams);

  return {
    ...localizedSeoMetadata({
      path: ROUTES.marketplace,
      country: countryCode,
      locale: resolvedLocale,
      robots: hasQueryVariants ? { index: false, follow: true } : undefined,
    }),
    title: t("title"),
    description: t("description", {
      country: getCountryName(countryCode, resolvedLocale),
    }),
  };
}

export default async function MarketplacePage({ params, searchParams }: PageProps) {
  const { country, locale: localeParam } = await params;
  const countryCode = getCountryFromParam(country);
  const locale = getLocaleFromParam(localeParam, countryCode);
  const region = getRegionForCountry(countryCode);
  const t = await getTranslations({ locale, namespace: "marketplace" });
  const filters = parseListingFilters(await searchParams);

  const [feed, user, locations, categories, brands, filterOptions] = await Promise.all([
    getListingFeed(filters, region),
    getCurrentUser(),
    getActiveLocationTree(countryCode),
    getMarketplaceCategories(region),
    getMarketplaceBrands(),
    getListingFilterOptions(region),
  ]);

  const canSaveSearch = hasActiveFilters(filters);
  const isAuthenticated = Boolean(user);
  const favoriteIds =
    isAuthenticated && user
      ? await getFavoriteListingIds(
          user.id,
          feed.items.map((listing) => listing.id),
        )
      : [];

  const itemListJsonLd =
    feed.items.length > 0
      ? buildItemListStructuredData(
          t("title"),
          localizedPath(ROUTES.marketplace, countryCode, locale),
          APP_URL,
          feed.items.map((listing) => ({
            name: listing.title,
            path: localizedPath(`/listings/${listing.slug}`, countryCode, locale),
            image: listing.imageUrl,
          })),
        )
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <h1 className="heading-4 flex items-center gap-2">
            <span aria-hidden="true" className="bg-brand h-5 w-1 shrink-0 rounded-full" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("results", { count: feed.total })}
            {filters.q ? ` ${t("resultsFor", { query: filters.q })}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canSaveSearch ? <SaveSearchButton isAuthenticated={Boolean(user)} /> : null}
          <FilterDrawer
            categories={categories}
            brands={brands}
            filters={filters}
            locations={locations}
            filterOptions={filterOptions}
          />
          <SortSelect value={filters.sort} />
        </div>
      </div>

      {feed.source === "demo" ? (
        <Badge variant="outline" className="mb-4 text-amber-600 dark:text-amber-400">
          {t("previewData")}
        </Badge>
      ) : null}

      <CompareSelectionProvider>
        <div className="mb-4 flex flex-wrap gap-3">
          <CompareControls />
          <LocalizedLink
            href={ROUTES.valuation}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hover:text-brand")}
          >
            {t("checkValue")}
          </LocalizedLink>
          <LocalizedLink
            href={ROUTES.imeiCheck}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hover:text-brand")}
          >
            {t("verifyImei")}
          </LocalizedLink>
        </div>

        <div className="mb-4">
          <ActiveFilters filters={filters} categories={categories} brands={brands} />
        </div>

        <div className="flex gap-6">
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="bg-card sticky top-28 rounded-xl border p-4">
              <MarketplaceFilters
                categories={categories}
                brands={brands}
                filters={filters}
                locations={locations}
                filterOptions={filterOptions}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <ListingsGrid
              listings={feed.items}
              favoriteIds={favoriteIds}
              isAuthenticated={isAuthenticated}
            />
            <ListingsPagination page={feed.page} totalPages={feed.totalPages} />
          </div>
        </div>
      </CompareSelectionProvider>
      {itemListJsonLd ? <JsonLd data={itemListJsonLd} /> : null}
    </div>
  );
}
