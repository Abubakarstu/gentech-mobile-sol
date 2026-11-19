"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, Plus, ShieldCheck, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP, ROUTES } from "@/lib/constants";
import { LocalizedLink } from "@/components/localized-link";
import { useLocalizedRouteInfo } from "@/lib/localized-routing";
import type { CategoryItem } from "@/types/marketplace";
import { Button, buttonVariants } from "@/components/ui/button";
import { CategoryIcon } from "@/features/marketplace/components/category-icon";
import { CountryLocaleSelector } from "@/components/country-locale-selector";

interface MobileNavProps {
  categories: CategoryItem[];
  isAuthenticated: boolean;
}

export function MobileNav({ categories, isAuthenticated }: MobileNavProps) {
  const t = useTranslations("navigation");
  const tCategories = useTranslations("categories");
  const tCommon = useTranslations("common");
  const { locale } = useLocalizedRouteInfo();
  const isRtl = locale === "ar" || locale === "ur";
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const offscreen = isRtl ? "100%" : "-100%";

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={t("categories")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              aria-label={tCommon("close")}
              className="bg-background/80 absolute inset-0 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={t("categories")}
              className="bg-background absolute inset-y-0 start-0 flex w-80 max-w-[85%] flex-col border-e shadow-xl"
              initial={{ x: offscreen }}
              animate={{ x: 0 }}
              exit={{ x: offscreen }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              <div className="flex items-center justify-between border-b p-4">
                <LocalizedLink href={ROUTES.home} className="flex items-center gap-2 font-semibold">
                  <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md text-sm font-bold">
                    {APP.name.charAt(0)}
                  </span>
                  {APP.name}
                </LocalizedLink>
                <div className="flex items-center gap-2">
                  <CountryLocaleSelector />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={tCommon("close")}
                    onClick={() => setOpen(false)}
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <LocalizedLink
                  href={ROUTES.marketplace}
                  className="hover:bg-accent block rounded-md px-3 py-2 text-sm font-medium"
                >
                  {t("marketplace")}
                </LocalizedLink>
                <LocalizedLink
                  href={ROUTES.inspectionService}
                  className="hover:bg-accent flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
                >
                  <ShieldCheck className="text-muted-foreground size-4" />
                  {t("inspection")}
                </LocalizedLink>

                <p className="text-muted-foreground mt-4 px-3 text-xs font-semibold uppercase">
                  {t("categories")}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <LocalizedLink
                        href={`/marketplace?category=${category.slug}`}
                        className="hover:bg-accent flex items-center gap-3 rounded-md px-3 py-2 text-sm"
                      >
                        <CategoryIcon
                          name={category.icon}
                          className="text-muted-foreground size-4"
                        />
                        {tCategories.has(category.slug)
                          ? tCategories(category.slug)
                          : category.name}
                      </LocalizedLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="space-y-2 border-t p-4">
                <LocalizedLink href={ROUTES.sell} className={cn(buttonVariants(), "w-full")}>
                  <Plus className="size-4" />
                  {t("sell")}
                </LocalizedLink>
                {!isAuthenticated ? (
                  <LocalizedLink
                    href={ROUTES.signIn}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    {t("signIn")}
                  </LocalizedLink>
                ) : (
                  <LocalizedLink
                    href={ROUTES.dashboard}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    {t("dashboard")}
                  </LocalizedLink>
                )}
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
