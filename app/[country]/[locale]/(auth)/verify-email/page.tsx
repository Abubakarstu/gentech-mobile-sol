import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getCountryFromParam, getLocaleFromParam } from "@/lib/countries/server";
import { AuthCard } from "@/features/auth/components/auth-card";
import { VerifyEmailNotice } from "@/features/auth/components/verify-email-notice";

type PageProps = {
  params: Promise<{ country: string; locale: string }>;
  searchParams: Promise<{ email?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, locale } = await params;
  const countryCode = getCountryFromParam(country);
  const resolvedLocale = getLocaleFromParam(locale, countryCode);
  const t = await getTranslations({ locale: resolvedLocale, namespace: "authentication" });
  return { title: t("verifyEmail"), robots: { index: false, follow: false } };
}

export default async function VerifyEmailPage({ params, searchParams }: PageProps) {
  const { country, locale: localeParam } = await params;
  const countryCode = getCountryFromParam(country);
  const locale = getLocaleFromParam(localeParam, countryCode);
  const t = await getTranslations({ locale, namespace: "authPage" });
  const { email } = await searchParams;

  return (
    <AuthCard title={t("verifyTitle")} description={t("verifyDescription")}>
      <VerifyEmailNotice email={email ?? null} />
    </AuthCard>
  );
}
