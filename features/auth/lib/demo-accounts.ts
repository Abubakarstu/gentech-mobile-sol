/**
 * Public demo credentials shared by the sign-in helper, the demo cookie route,
 * and the database seed. These are intentionally non-production fixtures.
 */
export const DEMO_ROLES = ["ADMIN", "INSPECTOR", "USER", "DEALER"] as const;

export type DemoRole = (typeof DEMO_ROLES)[number];

export interface DemoAccount {
  key: "admin" | "inspector" | "user" | "dealer";
  name: string;
  label: string;
  email: string;
  password: string;
  role: DemoRole;
  dashboard: "admin" | "inspector" | "user" | "dealer";
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    key: "admin",
    name: "GenTech Demo Admin",
    label: "Demo Admin",
    email: "admin@demo.gentech.test",
    password: "DemoAdmin-2026!",
    role: "ADMIN",
    dashboard: "admin",
  },
  {
    key: "inspector",
    name: "GenTech Demo Inspector",
    label: "Demo Inspector",
    email: "inspector@demo.gentech.test",
    password: "DemoInspector-2026!",
    role: "INSPECTOR",
    dashboard: "inspector",
  },
  {
    key: "user",
    name: "GenTech Demo User",
    label: "Demo User",
    email: "user@demo.gentech.test",
    password: "DemoUser-2026!",
    role: "USER",
    dashboard: "user",
  },
  {
    key: "dealer",
    name: "GenTech Demo Dealer",
    label: "Demo Dealer",
    email: "dealer@demo.gentech.test",
    password: "DemoDealer-2026!",
    role: "DEALER",
    dashboard: "dealer",
  },
];

export function findDemoAccountByEmail(email: string): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((account) => account.email.toLowerCase() === normalized);
}

export function findDemoAccountByKey(key: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((account) => account.key === key);
}

export function matchDemoCredentials(input: {
  email?: string;
  password?: string;
  username?: string;
}): DemoAccount | undefined {
  const account = input.email
    ? findDemoAccountByEmail(input.email)
    : input.username
      ? findDemoAccountByKey(input.username)
      : undefined;

  if (!account || !input.password || account.password !== input.password) return undefined;
  return account;
}
