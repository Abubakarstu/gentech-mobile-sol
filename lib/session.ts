import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";

import { auth } from "@/lib/auth";
import { USER_ROLES, type UserRole } from "@/lib/constants";
import {
  DEMO_LOCAL_SECRET,
  isDemoSessionEnabled,
  isNonProductionDemoEnvironment,
  isReadOnlyDemoEnabled,
} from "@/lib/demo-mode";
import type { DemoRole } from "@/features/auth/lib/demo-accounts";

const DEMO_COOKIE = "gentech_demo_session";
const DEMO_SESSION_MAX_AGE = 8 * 60 * 60 * 1000;

function signDemoPayload(payload: string) {
  const secret = process.env.BETTER_AUTH_SECRET ?? DEMO_LOCAL_SECRET;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function createDemoSession(role: DemoRole) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEMO_SESSION_MAX_AGE);
  const account = {
    ADMIN: { name: "Demo Admin", email: "admin@demo.gentech.test" },
    INSPECTOR: { name: "Demo Inspector", email: "inspector@demo.gentech.test" },
    USER: { name: "Demo User", email: "user@demo.gentech.test" },
    DEALER: { name: "Demo Dealer", email: "dealer@demo.gentech.test" },
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
  if (!isNonProductionDemoEnvironment() && role !== "USER") {
    throw new Error("Production demo sessions are restricted to the preview user.");
  }
  const payload = `${role}.${Date.now()}`;
  return `${payload}.${signDemoPayload(payload)}`;
}

function readDemoRole(value?: string): DemoRole | null {
  if (!isDemoSessionEnabled() || !value) return null;
  const [role, issuedAt, signature, extra] = value.split(".");
  if (
    extra ||
    !role ||
    !issuedAt ||
    !signature ||
    !["ADMIN", "INSPECTOR", "USER", "DEALER"].includes(role) ||
    (!isNonProductionDemoEnvironment() && role !== "USER")
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
  if (isReadOnlyDemoEnabled()) {
    if (!isDemoSessionEnabled()) return null;
    const role = readDemoRole((await cookies()).get(DEMO_COOKIE)?.value);
    return role ? createDemoSession(role) : null;
  }

  if (isDemoSessionEnabled()) {
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

export { DEMO_COOKIE, isDemoSessionEnabled as demoModeEnabled, readDemoRole };

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
