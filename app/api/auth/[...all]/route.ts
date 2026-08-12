import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { checkRateLimit, getRateLimitIdentifier, RATE_LIMIT_CONFIG } from "@/lib/rate-limit";

// Better Auth mounts all of its endpoints (sign-in, sign-up, OAuth callbacks,
// verification, password reset, ...) under /api/auth/*.
const baseHandler = toNextJsHandler(auth.handler);

/**
 * Rate-limited auth handler that applies different limits based on the endpoint type.
 */
async function rateLimitedHandler(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Extract IP address for rate limiting
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0].trim() 
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  
  // Determine rate limit type based on endpoint
  let rateLimitType: keyof typeof RATE_LIMIT_CONFIG = "auth";
  
  if (pathname.includes("/forgot-password") || pathname.includes("/reset-password")) {
    rateLimitType = "passwordReset";
  } else if (pathname.includes("/verify-email")) {
    rateLimitType = "emailVerification";
  }
  
  // Check rate limit
  const identifier = getRateLimitIdentifier(ipAddress);
  const rateLimitResult = checkRateLimit(identifier, rateLimitType);
  
  if (!rateLimitResult.allowed) {
    const resetDate = new Date(rateLimitResult.resetTime);
    const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
    
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG[rateLimitType].requests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(resetDate.toISOString()),
        },
      },
    );
  }
  
  // Pass through to the base handler
  return baseHandler(request);
}

export const GET = rateLimitedHandler;
export const POST = rateLimitedHandler;
