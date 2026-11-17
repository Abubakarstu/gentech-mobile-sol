import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { VerifyEmailNotice } from "@/features/auth/components/verify-email-notice";

export const metadata: Metadata = { 
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <AuthCard title="Verify your email">
      <VerifyEmailNotice email={email ?? null} />
    </AuthCard>
  );
}
