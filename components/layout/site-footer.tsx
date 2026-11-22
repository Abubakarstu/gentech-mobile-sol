import { APP, ROUTES } from "@/lib/constants";
import { getCountryName } from "@/lib/countries";
import { getRequestCountryLocale } from "@/lib/countries/server";
import { getServerTranslations } from "@/lib/i18n/get-server-translations";
import { LocalizedLink } from "@/components/localized-link";

export async function SiteFooter() {
  const t = await getServerTranslations("footer");
  const tNav = await getServerTranslations("navigation");
  const { country, locale } = await getRequestCountryLocale();

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="title-4">{APP.name}</p>
          <p className="caption-2 text-muted-foreground">
            {t("tagline", { country: getCountryName(country, locale) })}
          </p>
        </div>
        <nav aria-label={tNav("navigation")} className="flex flex-wrap gap-x-6 gap-y-2">
          <LocalizedLink href={ROUTES.marketplace} className="caption-2 hover:text-foreground">
            {tNav("marketplace")}
          </LocalizedLink>
          <LocalizedLink href={ROUTES.categories} className="caption-2 hover:text-foreground">
            {tNav("categories")}
          </LocalizedLink>
          <LocalizedLink href={ROUTES.inspectionService} className="caption-2 hover:text-foreground">
            {tNav("inspection")}
          </LocalizedLink>
          <LocalizedLink href={ROUTES.sell} className="caption-2 hover:text-foreground">
            {tNav("sell")}
          </LocalizedLink>
        </nav>
      </div>
      <div className="border-t">
        <div className="text-muted-foreground mx-auto max-w-6xl px-4 py-5">
          <p className="caption-2">
            © {new Date().getFullYear()} {APP.name}. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
