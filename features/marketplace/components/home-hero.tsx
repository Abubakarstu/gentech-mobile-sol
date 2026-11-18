import { getServerTranslations } from "@/lib/i18n/get-server-translations";

import { LocalizedLink } from "@/components/localized-link";
import { getCountryConfig } from "@/lib/countries";
import type { CountryCode } from "@/lib/countries/types";
import type { CategoryItem } from "@/types/marketplace";
import type { LocationTree } from "@/features/locations/services/location.service";
import { SearchBar } from "./search-bar";

export async function HomeHero({
  country,
  popularCategories,
  locations,
}: {
  country: CountryCode;
  popularCategories: CategoryItem[];
  locations: LocationTree;
}) {
  const t = await getServerTranslations("homepage");
  const tSearch = await getServerTranslations("search");
  const tCategories = await getServerTranslations("categories");
  const config = getCountryConfig(country);

  return (
    <section className="relative overflow-hidden border-b">
      <div className="bg-primary/5 pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base text-pretty sm:text-lg">
          {t("heroSubtitle", { country: config.nativeName })}
        </p>

        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBar variant="hero" locations={locations} placeholder={tSearch("placeholder")} />
        </div>

        {popularCategories.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-muted-foreground text-sm">{t("popular")}</span>
            {popularCategories.slice(0, 5).map((category) => (
              <LocalizedLink
                key={category.id}
                href={`/marketplace?category=${category.slug}`}
                className="bg-muted hover:bg-accent rounded-full px-3 py-1 text-sm font-medium transition-colors"
              >
                {tCategories.has(category.slug)
                  ? tCategories(category.slug)
                  : category.name}
              </LocalizedLink>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
