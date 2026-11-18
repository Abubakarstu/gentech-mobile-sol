"use client";

import { useTranslations } from "next-intl";

import { LocalizedLink } from "@/components/localized-link";
import type { CategoryItem } from "@/types/marketplace";
import { CategoryIcon } from "./category-icon";

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  const tCategories = useTranslations("categories");
  const tListings = useTranslations("listings");

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {categories.map((category) => (
        <LocalizedLink
          key={category.id}
          href={`/marketplace?category=${category.slug}`}
          className="group bg-card hover:border-primary/40 hover:bg-accent flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors"
        >
          <span className="bg-primary/10 text-primary grid size-12 place-items-center rounded-full transition-transform group-hover:scale-105">
            <CategoryIcon name={category.icon} className="size-6" />
          </span>
          <span className="text-sm leading-tight font-medium">
            {tCategories.has(category.slug) ? tCategories(category.slug) : category.name}
          </span>
          {typeof category.count === "number" ? (
            <span className="text-muted-foreground text-xs">
              {tListings("adsCount", { count: category.count })}
            </span>
          ) : null}
        </LocalizedLink>
      ))}
    </div>
  );
}
