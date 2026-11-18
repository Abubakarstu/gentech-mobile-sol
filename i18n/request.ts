import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { LOCALE_HEADER } from "@/lib/countries/types";

/**
 * next-intl request configuration.
 *
 * The middleware resolves locale from the URL (or saved preference/geo for
 * non-localized routes) and passes it in a request header. Reading that header
 * here keeps every server component that calls `getTranslations()` without an
 * explicit locale aligned with the rendered country/locale route.
 */
const VALID_LOCALES = ["ar", "ur", "en"] as const;
type ValidLocale = (typeof VALID_LOCALES)[number];

function resolveLocale(value: string | undefined | null): ValidLocale | undefined {
  return VALID_LOCALES.find((locale) => locale === value?.trim().toLowerCase());
}

export default getRequestConfig(async ({ locale, requestLocale }) => {
  let headerLocale: string | null = null;
  try {
    headerLocale = (await headers()).get(LOCALE_HEADER);
  } catch {
    // Outside a request (for example during build-time analysis) the header
    // store is unavailable; fall back to the locale supplied by next-intl.
  }

  const resolvedLocale =
    resolveLocale(await requestLocale) ?? resolveLocale(headerLocale) ?? resolveLocale(locale) ?? "en";

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
