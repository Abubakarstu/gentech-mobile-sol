import { NextResponse } from "next/server";
import { z } from "zod";

import { createDemoCookieValue, DEMO_COOKIE, demoModeEnabled } from "@/lib/session";

const demoLoginSchema = z.object({
  username: z.enum(["admin", "user", "dealer"]),
  password: z.string(),
});

const DEMO_CREDENTIALS = {
  admin: { password: "admin", role: "ADMIN" },
  user: { password: "user", role: "USER" },
  dealer: { password: "dealer", role: "DEALER" },
} as const;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60,
};

export async function POST(request: Request) {
  if (!demoModeEnabled()) {
    return NextResponse.json({ error: "Demo access is disabled." }, { status: 404 });
  }
  const hostname = new URL(request.url).hostname;
  if (
    process.env.NODE_ENV !== "production" &&
    hostname !== "localhost" &&
    hostname !== "127.0.0.1" &&
    hostname !== "[::1]"
  ) {
    return NextResponse.json(
      { error: "Demo access is available only on this machine." },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = demoLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const account =
    process.env.NODE_ENV === "production"
      ? username === "user"
        ? DEMO_CREDENTIALS.user
        : undefined
      : DEMO_CREDENTIALS[username];

  if (!account || password !== account.password) {
    return NextResponse.json({ error: "Invalid demo credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ role: account.role });
  response.cookies.set(DEMO_COOKIE, createDemoCookieValue(account.role), cookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
