import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

const mockedEnv = vi.hoisted(() => ({
  env: { NODE_ENV: "test", NEXT_PUBLIC_APP_NAME: "GenTech" } as Record<string, unknown>,
}));

vi.mock("@/lib/env", () => ({ env: mockedEnv.env }));
vi.mock("@/lib/demo-mode", () => ({ isReadOnlyDemoEnabled: () => false }));

import { middleware } from "@/middleware";

function makeRequest(options: {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  path?: string;
} = {}) {
  const request = new NextRequest(`https://gentech.example${options.path ?? "/"}`, {
    headers: options.headers ?? {},
  });
  for (const [name, value] of Object.entries(options.cookies ?? {})) {
    request.cookies.set(name, value);
  }
  return request;
}

describe("Country and locale routing middleware", () => {
  it("uses Vercel's country header to send Bahrain visitors to Arabic/BHD", () => {
    const response = middleware(
      makeRequest({ headers: { "x-vercel-ip-country": "BH" } }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/bh/ar");
  });

  it("falls back to the Cloudflare country header", () => {
    const response = middleware(makeRequest({ headers: { "cf-ipcountry": "BH" } }));
    expect(response.headers.get("location")).toContain("/bh/ar");
  });

  it("never overrides a saved country preference with a geo header", () => {
    const response = middleware(
      makeRequest({
        headers: { "x-vercel-ip-country": "BH" },
        cookies: { gentech_country: "PK" },
      }),
    );
    expect(response.headers.get("location")).toContain("/pk/ur");
  });

  it("honours a saved English locale for Bahrain", () => {
    const response = middleware(
      makeRequest({
        headers: { "x-vercel-ip-country": "BH" },
        cookies: { gentech_locale: "en" },
      }),
    );
    expect(response.headers.get("location")).toContain("/bh/en");
  });

  it("uses the configured default for an unrecognised geo country", () => {
    const response = middleware(
      makeRequest({ headers: { "x-vercel-ip-country": "ZZ" } }),
    );
    expect(response.headers.get("location")).toContain("/pk/ur");
  });

  it("preserves the requested path when redirecting", () => {
    const response = middleware(
      makeRequest({ headers: { "x-vercel-ip-country": "BH" }, path: "/marketplace" }),
    );
    expect(response.headers.get("location")).toContain("/bh/ar/marketplace");
  });
});
