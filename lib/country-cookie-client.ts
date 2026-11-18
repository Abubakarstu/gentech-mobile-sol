/**
 * Client-side country cookie helpers.
 * Used by client components (like CountryLocaleSelector) to save preferences.
 */

const COUNTRY_COOKIE_NAME = "gentech_country";
const LOCALE_COOKIE_NAME = "gentech_locale";

/**
 * Save country preference to cookie (client-side).
 */
export function setCountryCookieClient(country: string): void {
  document.cookie = `${COUNTRY_COOKIE_NAME}=${country};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

/**
 * Save locale preference to cookie (client-side).
 */
export function setLocaleCookieClient(locale: string): void {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}