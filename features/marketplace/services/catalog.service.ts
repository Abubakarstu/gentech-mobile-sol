import "server-only";

import type { BrandItem, CategoryItem } from "@/types/marketplace";
import { DEMO_BRANDS, DEMO_CATEGORIES } from "@/features/marketplace/data/fixtures";
import { prisma } from "@/lib/prisma";

/**
 * Returns active brands from the database, projected as `BrandItem[]`.
 * Falls back to demo fixtures if the database is unreachable so the sell
 * form and marketplace filters remain usable in preview environments.
 */
export async function getMarketplaceBrands(): Promise<BrandItem[]> {
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
}

/**
 * Returns active top-level categories from the database.
 * Falls back to demo fixtures if the database is unreachable.
 */
export async function getMarketplaceCategories(): Promise<CategoryItem[]> {
  try {
    const rows = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, icon: true },
    });
    if (rows.length === 0) return DEMO_CATEGORIES;
    return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon ?? undefined }));
  } catch {
    return DEMO_CATEGORIES;
  }
}

