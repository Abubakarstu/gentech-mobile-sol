import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  getCountryFromParam,
  getLocaleFromParam,
  getRegionForCountry,
} from "@/lib/countries/server";
import { getCountryName } from "@/lib/countries";
import { ROUTES } from "@/lib/constants";
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

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ country: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, locale } = await params;
  const countryCode = getCountryFromParam(country);
  const resolvedLocale = getLocaleFromParam(locale, countryCode);
  setRequestLocale(resolvedLocale);
  const t = await getTranslations({ locale: resolvedLocale, namespace: "homepage" });

  return {
    title: t("heroTitle"),
    description: t("heroSubtitle", {
      country: getCountryName(countryCode, resolvedLocale),
    }),
  };
}

export default async function LocalizedHomepage({ params }: PageProps) {
  const { country, locale: localeParam } = await params;
  const countryCode = getCountryFromParam(country);
  const locale = getLocaleFromParam(localeParam, countryCode);
  setRequestLocale(locale);
  const region = getRegionForCountry(countryCode);
  const t = await getTranslations({ locale, namespace: "homepage" });

  const [feed, categories, locations, user] = await Promise.all([
    getListingFeed({ sort: "recent", page: 1, pageSize: 8 }, region),
    getCategoriesWithCounts(8, region),
    getActiveLocationTree(countryCode),
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
      <HomeHero
        country={countryCode}
        locale={locale}
        popularCategories={categories}
        locations={locations}
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeader title={t("browseByCategory")} href={ROUTES.marketplace} />
        <CategoryGrid categories={categories} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <SectionHeader
          title={t("featuredListings")}
          description={t("featuredDescription")}
          href={`${ROUTES.marketplace}?featured=1`}
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
          description={t("recentDescription")}
          href={ROUTES.marketplace}
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
