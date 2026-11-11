import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { uniqueSlug } from "@/utils/slug";
import type {
  ListingCardData,
  ListingDetail,
  ListingFilters,
  ListingFilterOptions,
  ListingSearchResult,
} from "@/types/marketplace";
import type { CreateListingInput } from "@/features/listings/schemas/create-listing";
import { formatAttributes } from "@/features/listings/lib/attributes";

/** Columns projected for a listing card — keep this tight to avoid over-fetching. */
const cardSelect = {
  id: true,
  dealerId: true,
  title: true,
  slug: true,
  price: true,
  currency: true,
  condition: true,
  city: true,
  isFeatured: true,
  negotiable: true,
  views: true,
  createdAt: true,
  attributes: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { slug: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true },
    orderBy: { position: "asc" },
  },
  seller: { select: { emailVerified: true } },
  inspections: {
    where: { status: "COMPLETED" },
    take: 1,
    select: { id: true },
  },
} satisfies Prisma.ListingSelect;

type ListingCardRow = Prisma.ListingGetPayload<{ select: typeof cardSelect }>;

function buildListingConditions(filters: ListingFilters, ranked: boolean): Prisma.Sql[] {
  const conditions: Prisma.Sql[] = [
    Prisma.sql`"status"::text = 'ACTIVE'`,
    Prisma.sql`"deletedAt" IS NULL`,
  ];

  if (ranked && filters.q) {
    conditions.push(Prisma.sql`"searchVector" @@ websearch_to_tsquery('english', ${filters.q})`);
  } else if (filters.q) {
    conditions.push(
      Prisma.sql`(position(lower(${filters.q}) in lower("title")) > 0 OR position(lower(${filters.q}) in lower("description")) > 0)`,
    );
  }
  if (filters.category) {
    conditions.push(
      Prisma.sql`"categoryId" IN (SELECT "id" FROM "category" WHERE "slug" = ${filters.category})`,
    );
  }
  if (filters.brand) {
    conditions.push(
      Prisma.sql`"brandId" IN (SELECT "id" FROM "brand" WHERE "slug" = ${filters.brand})`,
    );
  }
  if (filters.condition) {
    conditions.push(Prisma.sql`"condition"::text = ${filters.condition}`);
  }
  if (filters.city) {
    conditions.push(Prisma.sql`lower("city") = lower(${filters.city})`);
  }
  if (filters.minPrice !== undefined) {
    conditions.push(Prisma.sql`"price" >= ${filters.minPrice}`);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(Prisma.sql`"price" <= ${filters.maxPrice}`);
  }
  if (filters.storage) {
    conditions.push(Prisma.sql`"attributes"->>'storage' = ${filters.storage}`);
  }
  if (filters.ram) {
    conditions.push(Prisma.sql`"attributes"->>'ram' = ${filters.ram}`);
  }
  if (filters.color) {
    conditions.push(Prisma.sql`"attributes"->>'color' = ${filters.color}`);
  }
  if (filters.batteryHealthMin !== undefined) {
    conditions.push(
      Prisma.sql`CASE WHEN jsonb_typeof("attributes"->'batteryHealth') = 'number' THEN ("attributes"->>'batteryHealth')::numeric >= ${filters.batteryHealthMin} ELSE false END`,
    );
  }
  if (filters.ptaStatus) {
    conditions.push(Prisma.sql`"attributes"->>'ptaStatus' = ${filters.ptaStatus}`);
  }
  if (filters.cpidStatus) {
    conditions.push(Prisma.sql`"attributes"->>'cpidStatus' = ${filters.cpidStatus}`);
  }
  if (filters.warranty) {
    conditions.push(Prisma.sql`"attributes"->>'warranty' = ${filters.warranty}`);
  }
  if (filters.isInspected !== undefined) {
    conditions.push(
      filters.isInspected
        ? Prisma.sql`EXISTS (SELECT 1 FROM "inspection_request" WHERE "inspection_request"."listingId" = "listing"."id" AND "inspection_request"."status"::text = 'COMPLETED')`
        : Prisma.sql`NOT EXISTS (SELECT 1 FROM "inspection_request" WHERE "inspection_request"."listingId" = "listing"."id" AND "inspection_request"."status"::text = 'COMPLETED')`,
    );
  }
  if (filters.isDealer !== undefined) {
    conditions.push(
      filters.isDealer ? Prisma.sql`"dealerId" IS NOT NULL` : Prisma.sql`"dealerId" IS NULL`,
    );
  }
  if (filters.isVerifiedSeller !== undefined) {
    conditions.push(
      Prisma.sql`"sellerId" IN (SELECT "id" FROM "user" WHERE "emailVerified" = ${filters.isVerifiedSeller})`,
    );
  }

  return conditions;
}

function buildOrderBy(filters: ListingFilters, ranked: boolean): Prisma.Sql {
  if (ranked && filters.q) {
    return Prisma.sql`"isFeatured" DESC, ts_rank("searchVector", websearch_to_tsquery('english', ${filters.q})) DESC, "createdAt" DESC`;
  }

  switch (filters.sort) {
    case "price_asc":
      return Prisma.sql`"isFeatured" DESC, "price" ASC, "createdAt" DESC`;
    case "price_desc":
      return Prisma.sql`"isFeatured" DESC, "price" DESC, "createdAt" DESC`;
    case "popular":
      return Prisma.sql`"isFeatured" DESC, "views" DESC, "createdAt" DESC`;
    case "recent":
    default:
      return Prisma.sql`"isFeatured" DESC, "createdAt" DESC`;
  }
}

/** Tests many saved-search filters against one listing in a single DB round-trip. */
export async function matchListingFilters(
  listingId: string,
  filterSets: ListingFilters[],
): Promise<boolean[]> {
  if (filterSets.length === 0) return [];

  const projections = filterSets.map((filters, index) => {
    const conditions = Prisma.join(buildListingConditions(filters, false), " AND ");
    const alias = Prisma.raw(`"match_${index}"`);
    return Prisma.sql`EXISTS (SELECT 1 FROM "listing" WHERE "id" = ${listingId} AND ${conditions}) AS ${alias}`;
  });
  const rows = await prisma.$queryRaw<Array<Record<string, boolean>>>(Prisma.sql`
    SELECT ${Prisma.join(projections, ", ")}
  `);
  const row = rows[0];
  return filterSets.map((_, index) => row?.[`match_${index}`] === true);
}

export async function getListingAlertDetails(
  listingId: string,
): Promise<{ id: string; title: string; slug: string; sellerId: string } | null> {
  return prisma.listing.findFirst({
    where: { id: listingId, status: "ACTIVE", deletedAt: null },
    select: { id: true, title: true, slug: true, sellerId: true },
  });
}

function toCardData(row: ListingCardRow): ListingCardData {
  const attrs = row.attributes as Record<string, unknown> | null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    city: row.city ?? "—",
    brand: row.brand?.name,
    brandSlug: row.brand?.slug,
    categorySlug: row.category.slug,
    isFeatured: row.isFeatured,
    negotiable: row.negotiable,
    views: row.views,
    createdAt: row.createdAt.toISOString(),
    imageUrl: row.images[0]?.url,
    // Phone-specific attributes
    storage: typeof attrs?.storage === "string" ? attrs.storage : undefined,
    ram: typeof attrs?.ram === "string" ? attrs.ram : undefined,
    color: typeof attrs?.color === "string" ? attrs.color : undefined,
    batteryHealth: typeof attrs?.batteryHealth === "number" ? attrs.batteryHealth : undefined,
    ptaStatus: typeof attrs?.ptaStatus === "string" ? attrs.ptaStatus : undefined,
    cpidStatus: typeof attrs?.cpidStatus === "string" ? attrs.cpidStatus : undefined,
    warranty: typeof attrs?.warranty === "string" ? attrs.warranty : undefined,
    isInspected: row.inspections.length > 0,
    isVerifiedSeller: row.seller.emailVerified,
    isDealer: row.dealerId !== null,
  };
}

async function searchListingRows(
  filters: ListingFilters,
  ranked: boolean,
): Promise<ListingSearchResult> {
  const conditions = buildListingConditions(filters, ranked);
  const whereSql = Prisma.join(conditions, " AND ");
  const skip = (filters.page - 1) * filters.pageSize;

  const [idRows, countRows] = await Promise.all([
    prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "listing"
      WHERE ${whereSql}
      ORDER BY ${buildOrderBy(filters, ranked)}
      LIMIT ${filters.pageSize} OFFSET ${skip}
    `),
    prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT count(*)::bigint AS "count" FROM "listing" WHERE ${whereSql}
    `),
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  const ids = idRows.map((row) => row.id);
  const rows = ids.length
    ? await prisma.listing.findMany({
        where: { id: { in: ids } },
        select: cardSelect,
      })
    : [];
  const byId = new Map(rows.map((row) => [row.id, toCardData(row)]));

  return {
    items: ids.map((id) => byId.get(id)).filter((item): item is ListingCardData => Boolean(item)),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function searchListings(filters: ListingFilters): Promise<ListingSearchResult> {
  return searchListingRows(filters, false);
}

/**
 * Ranked full-text search. Uses `websearch_to_tsquery` + `ts_rank` over the
 * `searchVector` GIN index, with the same structured filters as `searchListings`.
 * Requires `filters.q` to be present.
 */
export async function searchListingsRanked(filters: ListingFilters): Promise<ListingSearchResult> {
  return searchListingRows(filters, true);
}

export async function getListingFilterOptions(): Promise<ListingFilterOptions> {
  async function getValues(attribute: "storage" | "ram" | "color"): Promise<string[]> {
    const expression = {
      storage: Prisma.sql`"attributes"->>'storage'`,
      ram: Prisma.sql`"attributes"->>'ram'`,
      color: Prisma.sql`"attributes"->>'color'`,
    }[attribute];
    const rows = await prisma.$queryRaw<Array<{ value: string }>>(Prisma.sql`
      SELECT DISTINCT ${expression} AS "value"
      FROM "listing"
      WHERE "status"::text = 'ACTIVE'
        AND "deletedAt" IS NULL
        AND jsonb_typeof("attributes"->${attribute}) = 'string'
        AND length(trim(${expression})) BETWEEN 1 AND 40
      ORDER BY "value" ASC
      LIMIT 100
    `);
    return rows.map(({ value }) => value);
  }

  const [storage, ram, colors] = await Promise.all([
    getValues("storage"),
    getValues("ram"),
    getValues("color"),
  ]);
  return { storage, ram, colors };
}

/** Full projection for the listing detail page. */
const detailSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  price: true,
  currency: true,
  condition: true,
  negotiable: true,
  city: true,
  area: true,
  latitude: true,
  longitude: true,
  isFeatured: true,
  views: true,
  videoUrl: true,
  attributes: true,
  createdAt: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { position: "asc" },
    select: { url: true, width: true, height: true },
  },
  seller: {
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      profile: { select: { city: true, phone: true } },
    },
  },
  dealer: { select: { phone: true } },
} satisfies Prisma.ListingSelect;

type ListingDetailRow = Prisma.ListingGetPayload<{ select: typeof detailSelect }>;

function toDetail(row: ListingDetailRow): ListingDetail {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    negotiable: row.negotiable,
    city: row.city ?? "—",
    area: row.area ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    brand: row.brand?.name,
    brandSlug: row.brand?.slug,
    categorySlug: row.category.slug,
    categoryName: row.category.name,
    isFeatured: row.isFeatured,
    views: row.views,
    createdAt: row.createdAt.toISOString(),
    images: row.images.map((img) => ({
      url: img.url,
      width: img.width ?? undefined,
      height: img.height ?? undefined,
    })),
    attributes: formatAttributes(row.attributes),
    videoUrl: row.videoUrl ?? undefined,
    seller: {
      id: row.seller.id,
      name: row.seller.name,
      image: row.seller.image,
      phone: row.dealer?.phone ?? row.seller.profile?.phone ?? undefined,
      city: row.seller.profile?.city ?? row.city ?? undefined,
      memberSince: row.seller.createdAt.toISOString(),
    },
  };
}

/** A single listing by slug. Increments the view counter (best effort). */
export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  const row = await prisma.listing.findFirst({
    where: { slug, deletedAt: null },
    select: detailSelect,
  });
  if (!row) return null;

  void prisma.listing
    .update({ where: { id: row.id }, data: { views: { increment: 1 } } })
    .catch(() => {
      /* view counting is best-effort */
    });

  return toDetail(row);
}

/** Top listing title matches for the search autocomplete. */
export async function suggestListings(
  q: string,
  limit = 6,
): Promise<Array<{ title: string; slug: string }>> {
  return prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      title: { contains: q, mode: "insensitive" },
    },
    orderBy: [{ isFeatured: "desc" }, { views: "desc" }],
    take: limit,
    select: { title: true, slug: true },
  });
}

/** Up to `limit` other active listings in the same category. */
export async function getRelatedListings(
  categorySlug: string | undefined,
  excludeId: string,
  limit = 4,
): Promise<ListingCardData[]> {
  const rows = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      id: { not: excludeId },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCardData);
}

/** All of a seller's listings (any status), newest first. */
export async function getSellerListings(sellerId: string): Promise<ListingCardData[]> {
  const rows = await prisma.listing.findMany({
    where: { sellerId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: cardSelect,
  });
  return rows.map(toCardData);
}

/** Loads active listing cards in the same order as the requested ids. */
export async function getListingCardsByIds(ids: string[]): Promise<ListingCardData[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.listing.findMany({
    where: { id: { in: ids }, status: "ACTIVE", deletedAt: null },
    select: cardSelect,
  });
  const byId = new Map(rows.map((row) => [row.id, toCardData(row)]));
  return ids
    .map((id) => byId.get(id))
    .filter((listing): listing is ListingCardData => Boolean(listing));
}

/** Builds the category-specific attributes JSON from the validated input. */
function buildAttributes(input: CreateListingInput): Prisma.InputJsonValue | undefined {
  const attributes: Record<string, string | number | boolean> = {};
  if (input.storage) attributes.storage = input.storage;
  if (input.ram) attributes.ram = input.ram;
  if (input.color) attributes.color = input.color;
  if (input.batteryHealth) attributes.batteryHealth = Number(input.batteryHealth);
  if (input.ptaApproved !== undefined) attributes.ptaApproved = input.ptaApproved;
  if (input.ptaStatus) attributes.ptaStatus = input.ptaStatus;
  if (input.cpidStatus) attributes.cpidStatus = input.cpidStatus;

  // Extended phone attributes
  if (input.model) attributes.model = input.model;
  if (input.variant) attributes.variant = input.variant;
  if (input.networkType) attributes.networkType = input.networkType;
  if (input.carrier) attributes.carrier = input.carrier;
  if (input.isUnlocked !== undefined) attributes.isUnlocked = input.isUnlocked;
  if (input.modelNumber) attributes.modelNumber = input.modelNumber;
  if (input.region) attributes.region = input.region;
  if (input.warranty) attributes.warranty = input.warranty;
  if (input.warrantyExpiry) attributes.warrantyExpiry = input.warrantyExpiry;
  if (input.hasOriginalBox !== undefined) attributes.hasOriginalBox = input.hasOriginalBox;
  if (input.hasCharger !== undefined) attributes.hasCharger = input.hasCharger;
  if (input.hasHeadphones !== undefined) attributes.hasHeadphones = input.hasHeadphones;
  if (input.repairHistory) attributes.repairHistory = input.repairHistory;

  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

/** Creates a listing (resolving category/brand by slug) with its images. */
export async function createListing(
  input: CreateListingInput,
  sellerId: string,
): Promise<{ id: string; slug: string }> {
  const city = await prisma.city.findFirst({
    where: {
      id: input.cityId,
      countryId: input.countryId,
      isActive: true,
      country: { isActive: true },
    },
    select: {
      id: true,
      name: true,
      areas: {
        where: { id: input.areaId || undefined, isActive: true },
        select: { id: true, name: true },
        take: 1,
      },
    },
  });
  if (!city) throw new Error("Choose an active city in the selected country.");
  const area = input.areaId ? city.areas[0] : undefined;
  if (input.areaId && !area) throw new Error("Choose an active area in the selected city.");

  const category = await prisma.category.findUnique({
    where: { slug: input.categorySlug },
    select: { id: true },
  });
  if (!category) throw new Error("Selected category does not exist.");

  const brandId = input.brandSlug
    ? (
        await prisma.brand.findUnique({
          where: { slug: input.brandSlug },
          select: { id: true },
        })
      )?.id
    : undefined;

  const listing = await prisma.listing.create({
    data: {
      title: input.title,
      slug: uniqueSlug(input.title),
      description: input.description,
      price: new Prisma.Decimal(input.price),
      negotiable: input.negotiable ?? false,
      condition: input.condition,
      status: "PENDING_APPROVAL",
      city: city.name,
      area: area?.name,
      cityId: city.id,
      areaId: area?.id,
      attributes: buildAttributes(input),
      sellerId,
      categoryId: category.id,
      brandId,
      images: {
        create: input.images.map((image, index) => ({
          url: image.url,
          publicId: image.publicId,
          width: image.width,
          height: image.height,
          position: index,
          isPrimary: index === 0,
        })),
      },
    },
    select: { id: true, slug: true },
  });

  // Populate the full-text search vector (kept in the app layer so the column stays
  // a normal Prisma-managed column — no DB triggers/generated expressions to maintain).
  await prisma.$executeRaw`
    UPDATE "listing"
    SET "searchVector" = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
    WHERE id = ${listing.id}
  `;

  return listing;
}
