import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { isLocaleAvailable, isValidCountryCode } from "@/lib/countries";
import { isRtlLocale, type LocaleCode } from "@/lib/countries/types";
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

  // Validate country and locale as a pair — /bh/ur and /pk/ar are not valid.
  const countryCode = country.toUpperCase();
  if (!isValidCountryCode(countryCode)) {
    notFound();
  }
  if (!isValidLocale(locale) || !isLocaleAvailable(countryCode, locale)) {
    notFound();
  }

  const resolvedLocale = locale as LocaleCode;
  setRequestLocale(resolvedLocale);
  const messages = await getMessages({ locale: resolvedLocale });
  const isRtl = isRtlLocale(resolvedLocale);

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
      <DirectionSetter locale={locale} isRtl={isRtl} />
      {children}
    </NextIntlClientProvider>
  );
}