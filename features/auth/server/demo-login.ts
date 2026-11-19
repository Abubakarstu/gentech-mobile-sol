import "server-only";

import { NextResponse } from "next/server";

import {
  isDemoAccountAllowed,
  matchDemoCredentials,
  type DemoAccount,
} from "@/features/auth/lib/demo-accounts";
import { ROUTES } from "@/lib/constants";
import { createDemoCookieValue, DEMO_COOKIE } from "@/lib/session";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60,
};

const DASHBOARD_ROUTES: Record<DemoAccount["dashboard"], string> = {
  admin: ROUTES.admin,
  inspector: ROUTES.inspector,
  user: ROUTES.dashboard,
  dealer: ROUTES.dealerDashboard,
};

export { isDemoAccountAllowed };

export function resolveDemoAccount(input: {
  email?: string;
  password?: string;
  username?: string;
}): DemoAccount | null {
  const account = matchDemoCredentials(input);
  return account && isDemoAccountAllowed(account) ? account : null;
}

export function getDemoDashboard(account: DemoAccount): string {
  return DASHBOARD_ROUTES[account.dashboard];
}

export function publicDemoAccount(account: DemoAccount) {
  return {
    key: account.key,
    name: account.name,
    label: account.label,
    email: account.email,
    role: account.role,
    dashboard: getDemoDashboard(account),
  };
}

/** Creates the same response shape Better Auth returns for a successful email sign-in. */
export function createDemoSignInResponse(account: DemoAccount) {
  // Ignore caller-supplied callback URLs: each demo role has a fixed, trusted destination.
  const url = getDemoDashboard(account);
  const response = NextResponse.json({
    redirect: true,
    token: "local-demo-session",
    url,
    user: {
      id: `demo:${account.key}`,
      name: account.name,
      email: account.email,
      emailVerified: true,
      image: null,
      role: account.role,
    },
    account: publicDemoAccount(account),
  });
  response.headers.set("Location", url);
  response.cookies.set(DEMO_COOKIE, createDemoCookieValue(account.role), cookieOptions);
  return response;
}

export function createDemoSignOutResponse() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export const demoCookieOptions = cookieOptions;
