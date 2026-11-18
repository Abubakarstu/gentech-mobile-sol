import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import {
  getCountryFromParam,
  getLocaleFromParam,
} from "@/lib/countries/server";
import { ROUTES } from "@/lib/constants";
import { withCountryLocalePrefix } from "@/lib/localized-path";
import { localizedSeoMetadata } from "@/lib/seo/metadata";
import { PhoneComparisonTable } from "@/features/phone-intelligence/components/phone-comparison-table";
import { comparisonService } from "@/features/phone-intelligence/services/comparison.service";
import type { PhoneSpecComparison } from "@/features/phone-intelligence/schemas/comparison.schema";

type PageProps = {
  params: Promise<{ country: string; locale: string }>;
  searchParams?: Promise<{ phones?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, locale } = await params;
  const countryCode = getCountryFromParam(country);
  const resolvedLocale = getLocaleFromParam(locale, countryCode);
  const t = await getTranslations({ locale: resolvedLocale, namespace: "marketplace" });
  return {
    ...localizedSeoMetadata({
      path: ROUTES.comparison,
      country: countryCode,
      locale: resolvedLocale,
    }),
    title: `${t("comparePhones")} · GenTech`,
    description: t("description"),
  };
}

export default async function ComparePage({ params, searchParams }: PageProps) {
  const { country, locale: localeParam } = await params;
  const countryCode = getCountryFromParam(country);
  const locale = getLocaleFromParam(localeParam, countryCode);
  const t = await getTranslations({ locale, namespace: "marketplace" });
  const tUi = await getTranslations({ locale, namespace: "uiActions" });

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const phoneIds = resolvedSearchParams.phones?.split(",").filter(Boolean) ?? [];

  let phones: PhoneSpecComparison[] = [];
  if (phoneIds.length >= 2) {
    phones = await comparisonService.getComparisonSpecs(phoneIds);
  }

  const marketplaceHref = withCountryLocalePrefix(ROUTES.marketplace, countryCode, locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t("comparePhones")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {phones.length >= 2 ? (
        <PhoneComparisonTable phones={phones} />
      ) : (
        <div className="bg-card rounded-lg border p-12 text-center shadow-md">
          <h2 className="mb-2 text-xl font-semibold">{t("noListings")}</h2>
          <p className="text-muted-foreground mb-6">{t("description")}</p>
          <Link
            href={marketplaceHref}
            className="bg-primary text-primary-foreground inline-flex items-center rounded-lg px-4 py-2"
          >
            {tUi("browseMarketplace")}
          </Link>
        </div>
      )}
    </div>
  );
}
