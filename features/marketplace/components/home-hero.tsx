import Image from "next/image";
import { ShieldCheck } from "lucide-react";

import { getServerTranslations } from "@/lib/i18n/get-server-translations";
import { APP } from "@/lib/constants";
import { getCountryName } from "@/lib/countries";
import type { CountryCode, LocaleCode } from "@/lib/countries/types";
import type { CategoryItem, ListingCardData } from "@/types/marketplace";
import type { LocationTree } from "@/features/locations/services/location.service";
import { formatPrice } from "@/utils/format";
import { LocalizedLink } from "@/components/localized-link";
import { SearchBar } from "./search-bar";

export async function HomeHero({
  country,
  locale,
  popularCategories,
  locations,
  featuredListing,
}: {
  country: CountryCode;
  locale: LocaleCode;
  popularCategories: CategoryItem[];
  locations: LocationTree;
  featuredListing?: ListingCardData;
}) {
  const t = await getServerTranslations("homepage");
  const tSearch = await getServerTranslations("search");
  const tCategories = await getServerTranslations("categories");

  return (
    <section aria-labelledby="home-hero-title" className="border-b">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-center">
        <div className="max-w-[680px]">
          <p className="caption-3 text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
            <span className="bg-primary text-primary-foreground grid size-6 place-items-center rounded-md text-xs font-semibold">
              {APP.name.charAt(0)}
            </span>
            {APP.name} · {getCountryName(country, locale)}
          </p>

          <h1
            id="home-hero-title"
            className="heading-1 mt-6 bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
          >
            {t("heroTitle")}
          </h1>

          <p className="body-3 text-muted-foreground mt-6 max-w-[680px]">
            {t("heroSubtitle", { country: getCountryName(country, locale) })}
          </p>

          <div className="mt-8">
            <SearchBar variant="hero" locations={locations} placeholder={tSearch("placeholder")} />
          </div>

          <p className="caption-2 text-muted-foreground mt-4 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600 size-4 dark:text-emerald-400" />
            {t("featuredDescription")}
          </p>

          {popularCategories.length > 0 ? (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="caption-2 text-muted-foreground">{t("popular")}</span>
              {popularCategories.slice(0, 5).map((category) => (
                <LocalizedLink
                  key={category.id}
                  href={`/marketplace?category=${category.slug}`}
                  className="bg-muted hover:bg-accent hover-lift rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {tCategories.has(category.slug)
                    ? tCategories(category.slug)
                    : category.name}
                </LocalizedLink>
              ))}
            </div>
          ) : null}
        </div>

        {featuredListing ? (
          <article className="surface-flat hover-lift overflow-hidden rounded-2xl">
            <LocalizedLink
              href={`/listings/${featuredListing.slug}`}
              className="focus-visible:ring-ring block outline-none focus-visible:ring-2"
            >
              <div className="bg-muted relative aspect-4/3 overflow-hidden rounded-t-xl">
                {featuredListing.imageUrl ? (
                  <Image
                    src={featuredListing.imageUrl}
                    alt={featuredListing.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground grid h-full place-items-center text-4xl font-semibold">
                    {featuredListing.brand?.charAt(0) ?? featuredListing.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="caption-3 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 rounded-md px-2 py-1 font-semibold uppercase tracking-wide">
                    {t("featuredListings")}
                  </span>
                  {featuredListing.isInspected ? (
                    <span className="caption-3 text-muted-foreground">{t("featuredDescription")}</span>
                  ) : null}
                </div>
                <h2 className="title-2 mt-3 line-clamp-2">{featuredListing.title}</h2>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="body-1 font-semibold">
                    {formatPrice(featuredListing.price, {
                      currency: featuredListing.currency,
                      locale,
                    })}
                  </p>
                  <p className="caption-2 text-muted-foreground">{featuredListing.city}</p>
                </div>
              </div>
            </LocalizedLink>
          </article>
        ) : null}
      </div>
    </section>
  );
}
