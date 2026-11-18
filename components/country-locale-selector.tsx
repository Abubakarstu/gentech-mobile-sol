"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";

import { getCountryConfig, getAllCountries } from "@/lib/countries";
import type { CountryCode, LocaleCode } from "@/lib/countries/types";
import { setCountryCookieClient, setLocaleCookieClient } from "@/lib/country-cookie-client";

const LOCALE_LABELS: Record<string, string> = {
  ar: "العربية",
  ur: "اردو",
  en: "English",
};

export function CountryLocaleSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse current country and locale from pathname
  const segments = pathname.split("/").filter(Boolean);
  const currentCountry = (segments[0]?.toUpperCase() || "PK") as CountryCode;
  const currentLocale = segments[1] || (currentCountry === "BH" ? "ar" : "ur");
  const config = getCountryConfig(currentCountry);

  const handleCountryChange = (country: CountryCode) => {
    setCountryCookieClient(country);
    const newConfig = getCountryConfig(country);
    const newLocale = newConfig.defaultLocale;
    setLocaleCookieClient(newLocale);
    // Replace country and locale in URL
    const newPath = pathname.replace(/^\/[^/]+\/[^/]+/, `/${country.toLowerCase()}/${newLocale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  const handleLocaleChange = (locale: LocaleCode) => {
    setLocaleCookieClient(locale);
    const newPath = pathname.replace(/^\/[^/]+\/[^/]+/, `/${currentCountry.toLowerCase()}/${locale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
        aria-label="Select country and language"
      >
        <Globe className="size-4" />
        <span>{config.flag}</span>
        <span className="hidden sm:inline">{config.name}</span>
        <span className="text-muted-foreground">|</span>
        <span className="hidden sm:inline">{LOCALE_LABELS[currentLocale]}</span>
        <span className="text-muted-foreground">|</span>
        <span className="hidden sm:inline">{config.defaultCurrency}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-3 shadow-lg">
          <div className="space-y-3">
            {/* Country selection */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Country</p>
              <div className="space-y-1">
                {getAllCountries().map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCountryChange(c.code)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent ${
                      c.code === currentCountry ? "bg-accent" : ""
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{c.defaultCurrency}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language selection */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Language</p>
              <div className="space-y-1">
                {config.availableLocales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleLocaleChange(loc)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent ${
                      loc === currentLocale ? "bg-accent" : ""
                    }`}
                  >
                    <span>{LOCALE_LABELS[loc]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}