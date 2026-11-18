import { ArrowRight } from "lucide-react";

import { getServerTranslations } from "@/lib/i18n/get-server-translations";
import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/localized-link";
import { buttonVariants } from "@/components/ui/button";

export async function CtaBand() {
  const t = await getServerTranslations("cta");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="from-primary/10 to-primary/5 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 text-center sm:p-14">
        <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{t("title")}</h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-pretty">{t("body")}</p>
        <LocalizedLink
          href="/sell"
          className={cn(buttonVariants({ size: "lg" }), "mt-6 rounded-full")}
        >
          {t("button")}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </LocalizedLink>
      </div>
    </section>
  );
}
