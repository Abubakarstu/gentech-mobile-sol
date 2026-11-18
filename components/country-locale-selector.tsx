"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";

import { getCountryConfig, getAllCountries } from "@/lib/countries";
import type { CountryCode, LocaleCode } from "@/lib/countries/types";
import { useLocalizedRouteInfo } from "@/lib/localized-routing";
import { setCountryCookieClient, setLocaleCookieClient } from "@/lib/country-cookie-client";

const LOCALE_LABELS: Record<LocaleCode, string> = {
  ar: "العربية",
  ur: "اردو",
  en: "English",
};

export function CountryLocaleSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("country");
  const { country: routeCountry, locale: routeLocale } = useLocalizedRouteInfo();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentCountry = routeCountry ?? "PK";
  const config = getCountryConfig(currentCountry);
  const currentLocale = routeLocale ?? config.defaultLocale;

  function replacePrefix(country: CountryCode, locale: LocaleCode) {
    return pathname.replace(
      /^\/[a-z]{2}(?:\/[a-z]{2})?(?=\/|$)/i,
      `/${country.toLowerCase()}/${locale}`,
    );
  }

  function handleCountryChange(country: CountryCode) {
    const nextConfig = getCountryConfig(country);
    const nextLocale = nextConfig.defaultLocale as LocaleCode;
    setCountryCookieClient(country);
    setLocaleCookieClient(nextLocale);
    router.push(replacePrefix(country, nextLocale));
    setIsOpen(false);
  }

  function handleLocaleChange(locale: LocaleCode) {
    setLocaleCookieClient(locale);
    router.push(replacePrefix(currentCountry, locale));
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
        aria-label={t("selectCountry")}
      >
        <Globe className="size-4" />
        <span>{config.flag}</span>
        <span className="hidden sm:inline">{config.nativeName}</span>
        <span className="text-muted-foreground">|</span>
        <span className="hidden sm:inline">{LOCALE_LABELS[currentLocale]}</span>
        <span className="text-muted-foreground">|</span>
        <span className="hidden sm:inline">{config.defaultCurrency}</span>
      </button>

      {isOpen ? (
        <div className="absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border bg-popover p-3 shadow-lg">
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">{t("country")}</p>
              <div className="space-y-1">
                {getAllCountries().map((item) => (
                  <button
                    key={item.code}
                    onClick={() => handleCountryChange(item.code)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent ${
                      item.code === currentCountry ? "bg-accent" : ""
                    }`}
                  >
                    <span>{item.flag}</span>
                    <span>{item.nativeName}</span>
                    <span className="text-muted-foreground ms-auto text-xs">
                      {item.defaultCurrency}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">{t("language")}</p>
              <div className="space-y-1">
                {config.availableLocales.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleLocaleChange(item)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent ${
                      item === currentLocale ? "bg-accent" : ""
                    }`}
                  >
                    <span>{LOCALE_LABELS[item]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
