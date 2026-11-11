import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { isDemoModeEnabled, isReadOnlyDemoEnabled } from "@/lib/demo-mode";

const demoMode = isDemoModeEnabled();
const readOnlyDemo = isReadOnlyDemoEnabled();

/**
 * Type-safe, validated environment variables.
 *
 * Importing `env` anywhere guarantees the listed variables exist and are well-formed
 * at process boot — a missing/invalid value throws immediately instead of surfacing
 * as a confusing runtime error deep in a request.
 *
 * Conventions:
 * - `server`  : secrets, never sent to the browser.
 * - `client`  : must be prefixed with NEXT_PUBLIC_ and is safe to expose.
 * - Optional providers (OAuth, email) are `.optional()` so the app boots before they
 *   are configured; the relevant feature degrades gracefully when absent.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DEMO_MODE: z.enum(["true", "false"]).default(demoMode ? "true" : "false"),
    DEMO_READ_ONLY: z.enum(["true", "false"]).default(readOnlyDemo ? "true" : "false"),

    // --- Database (Neon PostgreSQL) ---
    // Pooled connection (PgBouncer) for the app; direct connection for migrations.
    DATABASE_URL: demoMode
      ? z.string().min(1).default("postgresql://demo:demo@127.0.0.1:5432/gentech")
      : z.string().min(1, "DATABASE_URL is required"),
    DIRECT_URL: z.string().min(1).optional(),

    // --- Better Auth ---
    BETTER_AUTH_SECRET: demoMode
      ? z.string().min(1).default("local-demo-secret-change-before-deploy-000000000000")
      : z.string().min(1, "BETTER_AUTH_SECRET is required"),
    BETTER_AUTH_URL: z.url().optional(),
    APP_URL: z.url().optional(),
    // DEV-ONLY escape hatch: set to "true" to skip the email-verification gate when no
    // email provider is configured. Ignored in production (see lib/auth.ts).
    AUTH_SKIP_EMAIL_VERIFICATION: z.string().optional(),

    // --- Social OAuth (optional until configured) ---
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    FACEBOOK_CLIENT_ID: z.string().min(1).optional(),
    FACEBOOK_CLIENT_SECRET: z.string().min(1).optional(),

    // --- Transactional email (optional until configured) ---
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(1).optional(),

    // --- Cloudinary media (optional until configured) ---
    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional(),

    // --- PayFast direct API (JazzCash + Easypaisa + cards) ---
    // Optional: when unset the app uses the built-in SANDBOX provider (no real
    // charges) so the whole payment flow is clickable in development.
    PAYFAST_MERCHANT_ID: z.string().min(1).optional(),
    PAYFAST_SECURED_KEY: z.string().min(1).optional(),
    PAYFAST_API_BASE: z.url().optional(),
    PAYFAST_MERCHANT_CATEGORY_CODE: z.string().min(1).optional(),
    PAYFAST_CARD_ACCOUNT_TYPE: z.string().min(1).optional(),
    PAYFAST_JAZZCASH_BANK_CODE: z.string().min(1).optional(),
    PAYFAST_JAZZCASH_ACCOUNT_TYPE: z.string().min(1).optional(),
    PAYFAST_EASYPAISA_BANK_CODE: z.string().min(1).optional(),
    PAYFAST_EASYPAISA_ACCOUNT_TYPE: z.string().min(1).optional(),
    PAYFAST_MODE: z.enum(["disabled", "sandbox", "live"]).default("disabled"),
    PAYFAST_LIVE_ENABLED: z.enum(["true", "false"]).default("false"),
  },

  client: {
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default("GenTech"),
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),

    // --- Analytics (optional; each provider loads only when its id is set) ---
    NEXT_PUBLIC_GTM_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_GA4_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_META_PIXEL_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().min(1).optional(),
  },

  /**
   * Next.js bundles client vars at build time, so they must be destructured
   * manually. Server vars are read from `process.env` automatically.
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    NEXT_PUBLIC_MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },

  emptyStringAsUndefined: true,

  /**
   * Allow `pnpm build` / lint to run in CI without a populated env by setting
   * SKIP_ENV_VALIDATION=1. Never set this at runtime.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
