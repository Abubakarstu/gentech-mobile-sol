import "server-only";

import { NextResponse } from "next/server";

import {
  isDemoAccountAllowed,
  matchDemoCredentials,
  type DemoAccount,
} from "@/features/auth/lib/demo-accounts";
import {
  isDemoModeEnabled,
  isNonProductionDemoEnvironment,
  isReadOnlyDemoEnabled,
  isDemoSessionEnabled,
} from "@/lib/demo-mode";
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
  const sessionEnabled = isDemoSessionEnabled();
  const allowed = Boolean(account && isDemoAccountAllowed(account));
  console.info("[demo policy diagnostic]", {
    matched: account?.key ?? null,
    hasEmail: Boolean(input.email),
    hasUsername: Boolean(input.username),
    passwordLength: input.password?.length ?? 0,
    sessionEnabled,
    demoModeEnabled: isDemoModeEnabled(),
    nonProduction: isNonProductionDemoEnvironment(),
    readOnly: isReadOnlyDemoEnabled(),
    productionEnv: {
      nodeEnvProduction: process.env.NODE_ENV === "production",
      vercelEnvProduction: process.env.VERCEL_ENV === "production",
      demoModeNotFalse: process.env.DEMO_MODE !== "false",
      databaseUrlSet: Boolean(process.env.DATABASE_URL),
      authSecretLength: process.env.BETTER_AUTH_SECRET?.length ?? 0,
      authSecretIsPlaceholder:
        process.env.BETTER_AUTH_SECRET?.trim() ===
        "local-demo-secret-change-before-deploy-000000000000",
    },
    allowed,
  });
  return allowed ? (account ?? null) : null;
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
