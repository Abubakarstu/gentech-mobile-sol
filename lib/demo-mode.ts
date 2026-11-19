export const DEMO_LOCAL_SECRET = "gentech-local-demo-session-only-secret";
const DEMO_AUTH_SECRET_PLACEHOLDER = "local-demo-secret-change-before-deploy-000000000000";

export function isProductionDemoFallback() {
  return (
    process.env.NODE_ENV === "production" &&
    !process.env.DATABASE_URL &&
    !process.env.BETTER_AUTH_SECRET &&
    process.env.DEMO_MODE !== "false" &&
    process.env.DEMO_READ_ONLY !== "false"
  );
}

export function isDemoModeEnabled() {
  return process.env.DEMO_MODE === "true" || isProductionDemoFallback();
}

export function isReadOnlyDemoEnabled() {
  return process.env.DEMO_READ_ONLY === "true" || isProductionDemoFallback();
}

/**
 * Dev-like environments where every documented demo account is available:
 * local development, tests, and Vercel Preview. Vercel Production stays
 * restricted to the read-only preview user.
 */
export function isNonProductionDemoEnvironment() {
  // Vercel sets VERCEL_ENV explicitly; prefer it over NODE_ENV, which build
  // tools may leave unset before the framework assigns it.
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV !== "production";
  return process.env.NODE_ENV !== "production";
}

/**
 * Whether signed demo sessions may be issued at all. Production never falls back
 * to the local secret and never widens privileges without a real auth secret.
 */
export function isDemoSessionEnabled() {
  if (!isDemoModeEnabled()) return false;
  if (isNonProductionDemoEnvironment()) return true;
  if (isReadOnlyDemoEnabled()) return true;
  const secret = process.env.BETTER_AUTH_SECRET;
  return Boolean(secret && secret !== DEMO_AUTH_SECRET_PLACEHOLDER && secret.length >= 32);
}
