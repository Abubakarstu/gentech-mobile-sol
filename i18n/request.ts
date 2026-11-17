import { getRequestConfig } from "next-intl/server"

import { getCountryConfig } from "@/lib/countries"
import { getCountryFromCookie } from "@/lib/country-cookie"

/**
 * next-intl request configuration.
 *
 * Locale is determined from:
 * 1. URL segment ([locale] in /[country]/[locale]/...)
 * 2. Cookie preference
 * 3. Country default
 *
 * Country and language are independent preferences.
 */
export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  const validLocales = ["ar", "ur", "en"] as const
  const resolvedLocale = validLocales.includes(locale as any)
    ? (locale as (typeof validLocales)[number])
    : "en"

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  }
})