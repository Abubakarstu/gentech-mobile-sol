"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";

import { useLocalizedRouteInfo } from "@/lib/localized-routing";

import type {
  BrandItem,
  CategoryItem,
  ListingFilters,
  ListingFilterOptions,
} from "@/types/marketplace";
import type { LocationTree } from "@/features/locations/services/location.service";
import { Button } from "@/components/ui/button";
import { MarketplaceFilters } from "./marketplace-filters";

/** Mobile entry point to the filters — opens the sidebar in a slide-over. */
export function FilterDrawer(props: {
  categories: CategoryItem[];
  brands: BrandItem[];
  filters: ListingFilters;
  locations: LocationTree;
  filterOptions: ListingFilterOptions;
}) {
  const [open, setOpen] = React.useState(false);
  const tCommon = useTranslations("common");
  const { locale } = useLocalizedRouteInfo();
  const isRtl = locale === "ar" || locale === "ur";

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

  return (
    <>
      <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="size-4" />
        {tCommon("filter")}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
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
              aria-label={tCommon("filter")}
              className="bg-background absolute inset-y-0 end-0 flex w-80 max-w-[88%] flex-col border-s shadow-xl"
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold">{tCommon("filter")}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={tCommon("close")}
                  onClick={() => setOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <MarketplaceFilters {...props} onApply={() => setOpen(false)} />
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
