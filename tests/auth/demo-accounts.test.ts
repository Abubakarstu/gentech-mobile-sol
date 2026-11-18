import { describe, expect, it } from "vitest";

import {
  DEMO_ACCOUNTS,
  findDemoAccountByEmail,
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
