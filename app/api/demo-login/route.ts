import { NextResponse } from "next/server";

import { createDemoCookieValue, DEMO_COOKIE, demoModeEnabled } from "@/lib/session";

const DEMO_CREDENTIALS = {
  admin: { password: "admin", role: "ADMIN" },
  user: { password: "user", role: "USER" },
  dealer: { password: "dealer", role: "DEALER" },
} as const;

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60,
};

export async function POST(request: Request) {
  if (!demoModeEnabled()) {
    return NextResponse.json({ error: "Demo access is disabled." }, { status: 404 });
  }
  const hostname = new URL(request.url).hostname;
  if (hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "[::1]") {
    return NextResponse.json({ error: "Demo access is available only on this machine." }, { status: 404 });
  }

  let credentials: { username?: string; password?: string };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const account = credentials.username
    ? DEMO_CREDENTIALS[credentials.username as keyof typeof DEMO_CREDENTIALS]
    : undefined;

  if (!account || credentials.password !== account.password) {
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