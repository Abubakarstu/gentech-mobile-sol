import { NextResponse, type NextRequest } from "next/server";

import { isReadOnlyDemoEnabled } from "@/lib/demo-mode";
import { getAvailableLocales, getDefaultLocale, isValidCountryCode } from "@/lib/countries";
import {
  COUNTRY_HEADER,
  LOCALE_HEADER,
  type CountryCode,
  type LocaleCode,
} from "@/lib/countries/types";
import { DEFAULT_COUNTRY } from "@/lib/constants";

const COUNTRY_SEGMENTS: Record<string, CountryCode> = { bh: "BH", pk: "PK" };
const LOCALE_SEGMENTS: readonly LocaleCode[] = ["ar", "ur", "en"];

/** Only these public routes have localized equivalents; admin tools stay global. */
const LOCALIZED_ROUTES = new Set([
  "marketplace",
  "categories",
  "listings",
  "sell",
  "checkout",
  "payment",
  "imei-check",
  "compare",
  "valuation",
  "inspection",
  "sign-in",
  "sign-up",
  "forgot-password",
  "reset-password",
  "verify-email",
  "dashboard",
  "account",
]);

function isStaticOrApi(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/) !== null
  );
}

/** Manual preference wins; geo inference never overwrites it. */
function resolveCountryLocale(request: NextRequest): { country: CountryCode; locale: LocaleCode } {
  const savedCountry = request.cookies.get("gentech_country")?.value?.trim().toUpperCase() ?? "";
  let country: CountryCode = DEFAULT_COUNTRY;

  if (savedCountry && isValidCountryCode(savedCountry)) {
    country = savedCountry;
  } else {
    const geoCountry = (
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      ""
    )
      .trim()
      .toUpperCase();
    if (geoCountry && isValidCountryCode(geoCountry)) country = geoCountry;
  }

  const savedLocale = request.cookies.get("gentech_locale")?.value?.trim().toLowerCase() ?? "";
  const locale =
    LOCALE_SEGMENTS.find((value) => value === savedLocale) &&
    getAvailableLocales(country).includes(savedLocale as LocaleCode)
      ? (savedLocale as LocaleCode)
      : getDefaultLocale(country);

  return { country, locale };
}

function withContextHeaders(request: NextRequest, country: CountryCode, locale: LocaleCode) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(COUNTRY_HEADER, country);
  requestHeaders.set(LOCALE_HEADER, locale);
  return requestHeaders;
}

function addSecurityHeaders(response: NextResponse) {
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com https://platform-lookaside.fbsbx.com",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }
}

/** Adds country/locale context and security headers to a pass-through response. */
function passThrough(request: NextRequest, country: CountryCode, locale: LocaleCode) {
  const response = NextResponse.next({ request: { headers: withContextHeaders(request, country, locale) } });
  addSecurityHeaders(response);
  return response;
}

/** Keeps the query string while moving a public route under its country prefix. */
function localizedRedirect(
  request: NextRequest,
  country: CountryCode,
  locale: LocaleCode,
  pathname = request.nextUrl.pathname,
) {
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${country.toLowerCase()}/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(newUrl);
  addSecurityHeaders(response);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticOrApi(pathname)) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  if (isReadOnlyDemoEnabled() && !["GET", "HEAD"].includes(request.method)) {
    const response = NextResponse.json(
      { error: "This read-only demo does not accept changes." },
      { status: 403 },
    );
    addSecurityHeaders(response);
    return response;
  }

  const { country, locale } = resolveCountryLocale(request);
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? "";
  const secondSegment = segments[1]?.toLowerCase() ?? "";
  const routeCountry = COUNTRY_SEGMENTS[firstSegment];

  if (routeCountry) {
    const routeLocale = LOCALE_SEGMENTS.find((value) => value === secondSegment);

    if (routeLocale && getAvailableLocales(routeCountry).includes(routeLocale)) {
      return passThrough(request, routeCountry, routeLocale);
    }

    // /bh, /bh/ur, /bh/unknown and /bh/marketplace all normalise to the
    // country's default locale so mixed content can never render.
    const fallbackLocale = getDefaultLocale(routeCountry);
    const remaining = routeLocale ? segments.slice(2) : segments.slice(1);
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${routeCountry.toLowerCase()}/${fallbackLocale}${
      remaining.length > 0 ? `/${remaining.join("/")}` : ""
    }`;
    const response = NextResponse.redirect(newUrl);
    addSecurityHeaders(response);
    return response;
  }

  if (pathname === "/") return localizedRedirect(request, country, locale);

  // Payment return URLs from the legacy inspection flow are intentionally global.
  const isLegacyPaymentReturn = firstSegment === "inspection" && secondSegment === "pay";
  if (!isLegacyPaymentReturn && LOCALIZED_ROUTES.has(firstSegment)) {
    return localizedRedirect(request, country, locale);
  }

  return passThrough(request, country, locale);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
