import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";

import { auth } from "@/lib/auth";
import { USER_ROLES, type UserRole } from "@/lib/constants";

const DEMO_COOKIE = "gentech_demo_session";
const DEMO_COOKIE_SECRET = "gentech-local-demo-session-only";
const DEMO_SESSION_MAX_AGE = 8 * 60 * 60 * 1000;
type DemoRole = "ADMIN" | "USER" | "DEALER";

function demoModeEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_MODE === "true";
}

function signDemoPayload(payload: string) {
  return createHmac("sha256", DEMO_COOKIE_SECRET).update(payload).digest("base64url");
}

function createDemoSession(role: DemoRole) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEMO_SESSION_MAX_AGE);
  const account = {
    ADMIN: { name: "Demo Admin", email: "admin@demo.local" },
    USER: { name: "Demo User", email: "user@demo.local" },
    DEALER: { name: "Demo Dealer", email: "dealer@demo.local" },
  }[role];
  const userId = `demo:${role.toLowerCase()}`;

  return {
    session: {
      id: userId,
      token: "local-demo-session",
      userId,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      ipAddress: null,
      userAgent: "local-demo",
    },
    user: {
      id: userId,
      name: account.name,
      email: account.email,
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
      role,
    },
  };
}

export function createDemoCookieValue(role: DemoRole) {
  const payload = `${role}.${Date.now()}`;
  return `${payload}.${signDemoPayload(payload)}`;
}

function readDemoRole(value?: string): DemoRole | null {
  if (!demoModeEnabled() || !value) return null;
  const [role, issuedAt, signature, extra] = value.split(".");
  if (
    extra ||
    !role ||
    !issuedAt ||
    !signature ||
    !["ADMIN", "USER", "DEALER"].includes(role)
  ) {
    return null;
  }
  if (!/^\d+$/.test(issuedAt)) return null;
  const age = Date.now() - Number(issuedAt);
  if (age < 0 || age > DEMO_SESSION_MAX_AGE) return null;

  const payload = `${role}.${issuedAt}`;
  const expected = Buffer.from(signDemoPayload(payload));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return role as DemoRole;
}

/**
 * Resolves the current session on the server (RSC, Route Handlers, Server Actions).
 * Wrapped in React `cache` so multiple calls within one request hit Better Auth once.
 *
 * Returns `null` when there is no authenticated user.
 */
export const getCurrentSession = cache(async () => {
  if (demoModeEnabled()) {
    const role = readDemoRole((await cookies()).get(DEMO_COOKIE)?.value);
    if (role) return createDemoSession(role);
  }

  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    // Fail closed: treat an auth-backend error as "no session". Public pages stay
    // up; protected routes still redirect to sign-in.
    console.error("[session] getSession failed:", error);
    return null;
  }
});

export { DEMO_COOKIE, demoModeEnabled, readDemoRole };

/** Convenience: the current user, or `null`. */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/** Narrowed role of the current user, defaulting to `USER` when unknown. */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (user.role as UserRole | undefined) ?? USER_ROLES.USER;
}
