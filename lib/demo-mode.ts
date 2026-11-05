export const DEMO_LOCAL_SECRET = "gentech-local-demo-session-only-secret";

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
