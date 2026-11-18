import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  createDemoSignInResponse,
  resolveDemoAccount,
} from "@/features/auth/server/demo-login";
import { findDemoAccountByEmail } from "@/features/auth/lib/demo-accounts";
import { isEmailVerificationRequired } from "@/features/admin/services/settings.service";
import { auth } from "@/lib/auth";
import { checkRateLimit, getRateLimitIdentifier, RATE_LIMIT_CONFIG } from "@/lib/rate-limit";

// Better Auth mounts all of its endpoints (sign-in, sign-up, OAuth callbacks,
// verification, password reset, ...) under /api/auth/*.
const baseHandler = toNextJsHandler(auth.handler);

const signInEmailSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

/**
 * Demo credentials never touch the database. This removes the 500 that occurs
 * when a local database is not running, and keeps the documented accounts usable
 * from the normal email/password form.
 */
async function handleSignInEmail(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.clone().json();
  } catch {
    return baseHandler.POST(request);
  }

  const parsed = signInEmailSchema.safeParse(body);
  if (!parsed.success) return baseHandler.POST(request);

  const knownDemoAccount = findDemoAccountByEmail(parsed.data.email);
  if (knownDemoAccount) {
    const demoAccount = resolveDemoAccount(parsed.data);
    if (!demoAccount) {
      return NextResponse.json(
        { message: "Invalid email or password.", code: "INVALID_CREDENTIALS" },
        { status: 401 },
      );
    }
    return createDemoSignInResponse(demoAccount);
  }

  const response = await baseHandler.POST(request);
  if (!response.ok || !(await isEmailVerificationRequired())) return response;

  const payload = (await response.clone().json().catch(() => null)) as
    | { user?: { emailVerified?: boolean } }
    | null;
  if (payload?.user?.emailVerified !== false) return response;

  // Do not forward Better Auth's session cookie for an unverified sign-in.
  return NextResponse.json(
    { message: "Email not verified.", code: "EMAIL_NOT_VERIFIED", status: 403 },
    { status: 403 },
  );
}

/**
 * Rate-limited auth handler that applies different limits based on the endpoint type.
 */
async function rateLimitedHandler(request: NextRequest, method: keyof typeof baseHandler) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ipAddress = forwardedFor
    ? forwardedFor.split(",")[0]?.trim() ?? null
    : realIp?.trim() ?? null;

  let rateLimitType: keyof typeof RATE_LIMIT_CONFIG = "auth";

  if (pathname.includes("/forgot-password") || pathname.includes("/reset-password")) {
    rateLimitType = "passwordReset";
  } else if (pathname.includes("/verify-email")) {
    rateLimitType = "emailVerification";
  }

  const identifier = getRateLimitIdentifier(ipAddress ?? "unknown");
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

  if (method === "POST" && pathname.endsWith("/sign-in/email")) {
    return handleSignInEmail(request);
  }

  return baseHandler[method](request);
}

export const GET = (request: NextRequest) => rateLimitedHandler(request, "GET");
export const POST = (request: NextRequest) => rateLimitedHandler(request, "POST");
export const PATCH = (request: NextRequest) => rateLimitedHandler(request, "PATCH");
export const PUT = (request: NextRequest) => rateLimitedHandler(request, "PUT");
export const DELETE = (request: NextRequest) => rateLimitedHandler(request, "DELETE");
