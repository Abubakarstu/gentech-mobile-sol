import { getRequestConfig } from "next-intl/server"

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
  const resolvedLocale = validLocales.find((value) => value === locale) ?? "en"

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  }
})