import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import { getCountryConfig, isValidCountryCode } from "@/lib/countries";
import { isRtlLocale } from "@/lib/countries/types";
import { DirectionSetter } from "@/components/direction-setter";

const VALID_LOCALES = ["ar", "ur", "en"] as const;
type ValidLocale = (typeof VALID_LOCALES)[number];

function isValidLocale(locale: string): locale is ValidLocale {
  return VALID_LOCALES.includes(locale as ValidLocale);
}

export function generateStaticParams() {
  return [
    { country: "bh", locale: "ar" },
    { country: "bh", locale: "en" },
    { country: "pk", locale: "ur" },
    { country: "pk", locale: "en" },
  ];
}

export default async function CountryLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;

  // Validate country and locale
  if (!isValidCountryCode(country.toUpperCase())) {
    notFound();
  }
  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = isRtlLocale(locale as ValidLocale);

  return (
    <NextIntlClientProvider messages={messages}>
      <DirectionSetter locale={locale} isRtl={isRtl} />
      {children}
    </NextIntlClientProvider>
  );
}