/**
 * Country configuration types for multi-country localization.
 *
 * Country and language are independent preferences:
 * - Bahrain: Arabic (default) or English
 * - Pakistan: Urdu (default) or English
 *
 * RTL languages: Arabic (ar), Urdu (ur)
 * LTR languages: English (en)
 */

/** Supported country codes. */
export type CountryCode = "BH" | "PK"

/** Supported locale codes. */
export type LocaleCode = "ar" | "ur" | "en"

/** Whether a locale uses RTL text direction. */
export function isRtlLocale(locale: LocaleCode): boolean {
  return locale === "ar" || locale === "ur"
}

/** Country configuration — drives all country-specific behavior. */
export interface CountryConfig {
  /** ISO 3166-1 alpha-2 country code. */
  code: CountryCode
  /** English country name. */
  name: string
  /** Native country name. */
  nativeName: string
  /** Country flag emoji. */
  flag: string
  /** Default language for this country. */
  defaultLocale: LocaleCode
  /** All languages available for this country. */
  availableLocales: LocaleCode[]
  /** Default currency code. */
  defaultCurrency: "BHD" | "PKR"
  /** Whether the default locale is RTL. */
  rtl: boolean
  /** Available payment method IDs (configurable). */
  paymentMethods: string[]
  /** Available shipping method IDs (configurable). */
  shippingMethods: string[]
  /** Tax configuration. */
  taxConfig: {
    vatRate: number
    vatName: string
    vatNumber?: string
  }
  /** Contact information. */
  contactInfo: {
    email: string
    phone: string
    address: string
    whatsapp?: string
  }
  /** Business policies. */
  businessPolicies: {
    returnPolicy: string
    shippingPolicy: string
    privacyPolicy: string
  }
}

/** Country code to display name mapping. */
export const COUNTRY_NAMES: Record<CountryCode, string> = {
  BH: "Bahrain",
  PK: "Pakistan",
}

/** Locale code to display name mapping. */
export const LOCALE_NAMES: Record<LocaleCode, string> = {
  ar: "Arabic",
  ur: "Urdu",
  en: "English",
}

/** Locale code to native name mapping. */
export const LOCALE_NATIVE_NAMES: Record<LocaleCode, string> = {
  ar: "العربية",
  ur: "اردو",
  en: "English",
}