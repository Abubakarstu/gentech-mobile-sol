import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createDemoSignInResponse,
  createDemoSignOutResponse,
  resolveDemoAccount,
} from "@/features/auth/server/demo-login";

const demoLoginSchema = z
  .object({
    username: z.enum(["admin", "inspector", "user", "dealer"]).optional(),
    email: z.email().optional(),
    password: z.string().min(1),
  })
  .refine((value) => Boolean(value.username || value.email), {
    message: "username or email is required",
  });

export async function POST(request: Request) {
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

  const account = resolveDemoAccount(parsed.data);
  if (!account) {
    return NextResponse.json({ error: "Invalid demo credentials." }, { status: 401 });
  }

  return createDemoSignInResponse(account);
}

export async function DELETE() {
  return createDemoSignOutResponse();
}
