import { MessagesSquare, Search, Tag } from "lucide-react";

import { getServerTranslations } from "@/lib/i18n/get-server-translations";

const STEPS = [
  { icon: Search, key: "step1" },
  { icon: MessagesSquare, key: "step2" },
  { icon: Tag, key: "step3" },
] as const;

export async function HowItWorks() {
  const t = await getServerTranslations("howItWorks");

  return (
    <section className="bg-muted/40 border-y">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight">{t("title")}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, key }, i) => (
            <div key={key} className="flex flex-col items-center text-center">
              <span className="bg-primary text-primary-foreground grid size-12 place-items-center rounded-full">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 flex items-center gap-2 text-lg font-semibold">
                <span className="text-muted-foreground">{i + 1}.</span>
                {t(`${key}Title`)}
              </h3>
              <p className="text-muted-foreground mt-1 max-w-xs text-sm">{t(`${key}Body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
