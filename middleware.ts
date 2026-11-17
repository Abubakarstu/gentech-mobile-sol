import { NextResponse, type NextRequest } from "next/server";
import { isReadOnlyDemoEnabled } from "@/lib/demo-mode";
import { isValidCountryCode } from "@/lib/countries";
import { DEFAULT_COUNTRY } from "@/lib/constants";

/**
 * Security middleware that adds HTTP security headers to all responses.
 * Also handles country/locale routing for i18n.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
  ) {
    // Still add security headers
    const response = NextResponse.next();
    addSecurityHeaders(response, request);
    return response;
  }

  // Check if already has country/locale prefix
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? "";
  const secondSegment = segments[1]?.toLowerCase() ?? "";

  const validCountries = ["bh", "pk"];
  const validLocales = ["ar", "ur", "en"];

  const hasCountryPrefix = validCountries.includes(firstSegment);
  const hasLocalePrefix = hasCountryPrefix && validLocales.includes(secondSegment);

  if (hasCountryPrefix && hasLocalePrefix) {
    // Already localized — add security headers and continue
    const response = NextResponse.next();
    addSecurityHeaders(response, request);
    return response;
  }

  // Determine country from cookie or IP
  const countryCookie = request.cookies.get("gentech_country")?.value?.toLowerCase() ?? "";
  let country = "pk"; // default

  if (countryCookie && isValidCountryCode(countryCookie.toUpperCase())) {
    country = countryCookie.toLowerCase();
  } else {
    // Try Cloudflare header
    const cfCountry = request.headers.get("cf-ipcountry")?.toLowerCase();
    if (cfCountry && (cfCountry === "bh" || cfCountry === "pk")) {
      country = cfCountry;
    }
  }

  // Determine locale from cookie or country default
  const localeCookie = request.cookies.get("gentech_locale")?.value?.toLowerCase() ?? "";
  let locale = country === "bh" ? "ar" : "ur"; // default per country

  if (localeCookie && validLocales.includes(localeCookie)) {
    // Validate locale is available for this country
    const availableLocales = country === "bh" ? ["ar", "en"] : ["ur", "en"];
    if (availableLocales.includes(localeCookie)) {
      locale = localeCookie;
    }
  }

  // Build redirect URL
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${country}/${locale}${pathname === "/" ? "" : pathname}`;

  const blockedDemoMutation =
    isReadOnlyDemoEnabled() && !["GET", "HEAD"].includes(request.method);

  if (blockedDemoMutation) {
    return NextResponse.json({ error: "This read-only demo does not accept changes." }, { status: 403 });
  }

  const response = NextResponse.redirect(newUrl);
  addSecurityHeaders(response, request);
  return response;
}

function addSecurityHeaders(response: NextResponse, request: NextRequest) {
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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};