import { describe, expect, it } from "vitest";

import {
  DEMO_ACCOUNTS,
  findDemoAccountByEmail,
  isDemoAccountAllowed,
  matchDemoCredentials,
} from "@/features/auth/lib/demo-accounts";

describe("demo accounts", () => {
  it("exposes all four documented accounts including dealer", () => {
    expect(DEMO_ACCOUNTS.map((account) => account.key)).toEqual([
      "admin",
      "inspector",
      "user",
      "dealer",
    ]);
  });

  it("matches credentials case-insensitively by email", () => {
    const account = matchDemoCredentials({
      email: "DEALER@demo.gentech.test",
      password: "DemoDealer-2026!",
    });
    expect(account?.key).toBe("dealer");
  });

  it("rejects a wrong password for a known demo account", () => {
    expect(
      matchDemoCredentials({
        email: "admin@demo.gentech.test",
        password: "wrong-password",
      }),
    ).toBeUndefined();
    expect(findDemoAccountByEmail("admin@demo.gentech.test")?.role).toBe("ADMIN");
  });
});

type EnvOverrides = Record<string, string | undefined>;

function withEnv(overrides: EnvOverrides, run: () => void) {
  const keys = Object.keys(overrides);
  const previous = keys.map((key) => [key, process.env[key]] as const);
  try {
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const previewEnv: EnvOverrides = {
  NODE_ENV: "production",
  VERCEL_ENV: "preview",
  DEMO_MODE: "true",
  DEMO_READ_ONLY: "false",
  BETTER_AUTH_SECRET: "preview-secret-with-at-least-32-characters",
  DATABASE_URL: "postgresql://example:example@127.0.0.1:5432/gentech",
};

describe("demo account environment policy", () => {
  it("allows every documented role in Vercel Preview", () => {
    withEnv(previewEnv, () => {
      expect(DEMO_ACCOUNTS.map(isDemoAccountAllowed)).toEqual([true, true, true, true]);
    });
  });

  it("allows every documented role in Vercel Preview without an explicit DEMO_MODE", () => {
    withEnv({ ...previewEnv, DEMO_MODE: undefined }, () => {
      expect(DEMO_ACCOUNTS.map(isDemoAccountAllowed)).toEqual([true, true, true, true]);
    });
  });

  it("allows every documented role in local development", () => {
    withEnv(
      {
        NODE_ENV: "development",
        VERCEL_ENV: undefined,
        DEMO_MODE: "true",
        DEMO_READ_ONLY: "true",
        BETTER_AUTH_SECRET: undefined,
        DATABASE_URL: "postgresql://example:example@127.0.0.1:5432/gentech",
      },
      () => {
        expect(DEMO_ACCOUNTS.map(isDemoAccountAllowed)).toEqual([true, true, true, true]);
      },
    );
  });

  it("limits Vercel Production to the read-only user", () => {
    withEnv(
      {
        ...previewEnv,
        VERCEL_ENV: "production",
      },
      () => {
        expect(DEMO_ACCOUNTS.map((account) => [account.key, isDemoAccountAllowed(account)])).toEqual([
          ["admin", false],
          ["inspector", false],
          ["user", true],
          ["dealer", false],
        ]);
      },
    );
  });

  it("limits Vercel Production even when NODE_ENV is unset", () => {
    withEnv(
      {
        ...previewEnv,
        NODE_ENV: undefined,
        VERCEL_ENV: "production",
      },
      () => {
        expect(DEMO_ACCOUNTS.map((account) => [account.key, isDemoAccountAllowed(account)])).toEqual([
          ["admin", false],
          ["inspector", false],
          ["user", true],
          ["dealer", false],
        ]);
      },
    );
  });

  it("blocks production privilege widening with the placeholder secret", () => {
    withEnv(
      {
        ...previewEnv,
        VERCEL_ENV: "production",
        DEMO_READ_ONLY: "false",
        BETTER_AUTH_SECRET: "local-demo-secret-change-before-deploy-000000000000",
      },
      () => {
        expect(DEMO_ACCOUNTS.map(isDemoAccountAllowed)).toEqual([false, false, false, false]);
      },
    );
  });

  it("honours an explicit DEMO_MODE=false opt-out in Vercel Preview", () => {
    withEnv({ ...previewEnv, DEMO_MODE: "false" }, () => {
      expect(DEMO_ACCOUNTS.map(isDemoAccountAllowed)).toEqual([false, false, false, false]);
    });
  });

  it("blocks all demo accounts when demo mode is disabled", () => {
    withEnv(
      {
        NODE_ENV: "development",
        VERCEL_ENV: undefined,
        DEMO_MODE: "false",
        DEMO_READ_ONLY: "false",
        BETTER_AUTH_SECRET: undefined,
        DATABASE_URL: undefined,
      },
      () => {
        expect(DEMO_ACCOUNTS.map(isDemoAccountAllowed)).toEqual([false, false, false, false]);
      },
    );
  });
});
