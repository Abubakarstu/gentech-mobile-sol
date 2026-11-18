import { getTranslations } from "next-intl/server";

import { getCountryConfig } from "@/lib/countries";
import { getListingFeed } from "@/features/listings/services/listing.service";
import { getCategoriesWithCounts } from "@/features/marketplace/services/category.service";
import { HomeHero } from "@/features/marketplace/components/home-hero";
import { CategoryGrid } from "@/features/marketplace/components/category-grid";
import { ListingsGrid } from "@/features/marketplace/components/listings-grid";
import { SectionHeader } from "@/features/marketplace/components/section-header";
import { HowItWorks } from "@/features/marketplace/components/how-it-works";
import { CtaBand } from "@/features/marketplace/components/cta-band";
import { getActiveLocationTree } from "@/features/locations/services/location.service";
import { getCurrentUser } from "@/lib/session";
import { getFavoriteListingIds } from "@/features/favorites/services/favorite.service";

export default async function LocalizedHomepage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const t = await getTranslations("homepage");
  const countryConfig = getCountryConfig(country.toUpperCase() as "BH" | "PK");
  const region = country.toUpperCase() === "BH" ? "BAHRAIN" : "PAKISTAN";

  // Real listings + real category counts from the DB (both fail-soft).
  const [feed, categories, locations, user] = await Promise.all([
    getListingFeed({ sort: "recent", page: 1, pageSize: 8 }, region),
    getCategoriesWithCounts(8),
    getActiveLocationTree(),
    getCurrentUser(),
  ]);

  const featuredReal = feed.items.filter((item) => item.isFeatured);
  const featured = featuredReal.length > 0 ? featuredReal : feed.items;
  const latest = feed.items;
  const isAuthenticated = Boolean(user && user.id !== "demo:user");
  const favoriteIds =
    isAuthenticated && user
      ? await getFavoriteListingIds(user.id, [
          ...new Set([...featured, ...latest].map((listing) => listing.id)),
        ])
      : [];

  return (
    <>
      <HomeHero popularCategories={[]} locations={locations} />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeader title={t("browseByCategory")} href={`/${country}/${locale}/marketplace`} />
        <CategoryGrid categories={categories} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <SectionHeader
          title={t("featuredListings")}
          description={t("heroSubtitle")}
          href={`/${country}/${locale}/marketplace?featured=1`}
        />
        <ListingsGrid
          listings={featured}
          favoriteIds={favoriteIds}
          isAuthenticated={isAuthenticated}
        />
      </section>

      <HowItWorks />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeader
          title={t("recentListings")}
          description={t("heroSubtitle")}
          href={`/${country}/${locale}/marketplace`}
        />
        <ListingsGrid
          listings={latest}
          favoriteIds={favoriteIds}
          isAuthenticated={isAuthenticated}
        />
      </section>

      <CtaBand />
    </>
  );
}