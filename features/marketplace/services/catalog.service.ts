import "server-only";

import { unstable_cache } from "next/cache";

import type { BrandItem, CategoryItem } from "@/types/marketplace";
import { DEMO_BRANDS, getDemoCategories } from "@/features/marketplace/data/fixtures";
import type { Region } from "@/lib/generated/prisma/enums";
import { CATALOG_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

/**
 * Returns active brands from the database, projected as `BrandItem[]`.
 * Falls back to demo fixtures if the database is unreachable so the sell
 * form and marketplace filters remain usable in preview environments.
 */
export async function getMarketplaceBrands(): Promise<BrandItem[]> {
  return unstable_cache(
    async () => {
      try {
        const rows = await prisma.brand.findMany({
          where: { isActive: true },
          orderBy: [{ position: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true },
        });
        if (rows.length === 0) return DEMO_BRANDS;
        return rows;
      } catch {
        return DEMO_BRANDS;
      }
    },
    ["marketplace-brands"],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.catalog],
    },
  )();
}

/**
 * Returns active top-level categories from the database.
 * Falls back to demo fixtures if the database is unreachable.
 */
export async function getMarketplaceCategories(region?: Region): Promise<CategoryItem[]> {
  return unstable_cache(
    async () => {
      try {
        const rows = await prisma.category.findMany({
          where: {
            isActive: true,
            ...(region ? { OR: [{ region }, { region: null }] } : {}),
          },
          orderBy: [{ position: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true, icon: true },
        });
        if (rows.length === 0) return getDemoCategories(region);
        return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon ?? undefined }));
      } catch {
        return getDemoCategories(region);
      }
    },
    ["marketplace-categories", region ?? "all"],
    {
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.catalog],
    },
  )();
}

