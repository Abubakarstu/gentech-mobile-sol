"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { LocalizedLink } from "@/components/localized-link";

export function SectionHeader({
  title,
  description,
  href,
  actionLabel,
}: {
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}) {
  const t = useTranslations("common");

  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {href ? (
        <LocalizedLink
          href={href}
          className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-sm font-medium"
        >
          {actionLabel ?? t("seeAll")}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </LocalizedLink>
      ) : null}
    </div>
  );
}
