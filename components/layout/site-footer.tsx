import { APP } from "@/lib/constants";
import { getCountryConfig } from "@/lib/countries";
import { getRequestCountryLocale } from "@/lib/countries/server";
import { getServerTranslations } from "@/lib/i18n/get-server-translations";

export async function SiteFooter() {
  const t = await getServerTranslations("footer");
  const { country } = await getRequestCountryLocale();
  const config = getCountryConfig(country);

  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row">
        <p>
          © {new Date().getFullYear()} {APP.name}. {t("allRightsReserved")}
        </p>
        <p>{t("tagline", { country: config.nativeName })}</p>
      </div>
    </footer>
  );
}
