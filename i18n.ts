import { getRequestConfig } from "next-intl/server"

/**
 * next-intl configuration.
 *
 * Locale is determined from the URL segment: /[country]/[locale]/...
 * Supported locales: ar (Arabic), ur (Urdu), en (English)
 */
export default getRequestConfig(async ({ locale }) => {
  const validLocales = ["ar", "ur", "en"] as const
  const resolvedLocale = validLocales.find((value) => value === locale) ?? "en"

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  }
})