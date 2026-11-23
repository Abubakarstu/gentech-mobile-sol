/**
 * Deterministic catalog fixture generator for marketplace seed data.
 *
 * Produces 100 Pakistan listings (12 curated + 88 generated) and 100 Bahrain
 * listings. Every listing carries external image links so seeded catalogs are
 * visually populated without uploading binary assets.
 */

export type SeedRegion = "BAHRAIN" | "PAKISTAN";
export type SeedCondition = "NEW" | "OPEN_BOX" | "USED" | "REFURBISHED" | "FOR_PARTS";

export interface SeedListing {
  title: string;
  slug: string;
  price: number;
  condition: SeedCondition;
  city: string;
  brandSlug: string;
  categorySlug: string;
  region: SeedRegion;
  currency: "PKR" | "BHD";
  isFeatured: boolean;
  negotiable: boolean;
  views: number;
  ageDays: number;
  images: string[];
}

export const IMAGES_PER_LISTING = 3;

const PHOTO_IDS = {
  smartphones: [
    "1511707171634-5f897ff02aa9",
    "1592750475338-74b7b21085ab",
    "1603891128711-11b4b03bb138",
    "1610945265064-0e34e5519bbf",
    "1598327105666-5b89351aff97",
    "1580910051074-3eb694886505",
    "1574944985070-8f3ebc6b79d2",
    "1606220588913-b3aacb4d2f46",
    "1610945415295-d9bbf067e59c",
    "1616348436168-de43ad0db179",
    "1605236453806-6ff36851218e",
    "1512499617640-c74ae3a79d37",
    "1556656793-08538906a9f8",
    "1567016432779-094069958ea5",
    "1587829741301-dc798b83add3",
    "1590658268037-6bf12165a8df",
    "1600185365483-26d7a4cc7519",
    "1511381939415-e44015466834",
  ],
  tablets: [
    "1572569511254-d8f925fe2cbb",
    "1511381939415-e44015466834",
    "1511707171634-5f897ff02aa9",
    "1592750475338-74b7b21085ab",
    "1603891128711-11b4b03bb138",
    "1580910051074-3eb694886505",
  ],
  "smart-watches": [
    "1546868871-7041f2a55e12",
    "1523275335684-37898b6baf30",
    "1524592094714-0f0654e20314",
    "1590658268037-6bf12165a8df",
  ],
  "earphones-headphones": [
    "1505740420928-5e560c06d30e",
    "1583394838336-acd977736f90",
    "1511381939415-e44015466834",
    "1572569511254-d8f925fe2cbb",
  ],
} as const;

const DEFAULT_PHOTO_IDS = PHOTO_IDS.smartphones;

/** Returns stable, optimized external image links for a listing. */
export function listingImages(categorySlug: string, seedIndex: number): string[] {
  const pool: readonly string[] = PHOTO_IDS[categorySlug as keyof typeof PHOTO_IDS] ?? DEFAULT_PHOTO_IDS;

  return Array.from({ length: IMAGES_PER_LISTING }, (_, offset) => {
    const photoId = pool[(seedIndex + offset) % pool.length]!;
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=75`;
  });
}

const PK_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Sialkot",
  "Gujranwala",
  "Peshawar",
  "Quetta",
] as const;

const BH_CITIES = [
  "Manama",
  "Riffa",
  "Muharraq",
  "Salmaniya",
  "Isa Town",
  "Sitra",
  "Zallaq",
  "Hamad Town",
  "Budaiya",
  "Sanabis",
] as const;

const VARIANTS = [
  { label: "Sealed", slug: "sealed", factor: 1.12, condition: "NEW" },
  { label: "Box Included", slug: "box-included", factor: 1.05, condition: "OPEN_BOX" },
  { label: "Pre-Owned", slug: "pre-owned", factor: 0.86, condition: "USED" },
  { label: "Certified Refurbished", slug: "certified-refurbished", factor: 0.74, condition: "REFURBISHED" },
  { label: "Bundle Deal", slug: "bundle-deal", factor: 1, condition: "OPEN_BOX" },
] as const satisfies ReadonlyArray<{
  label: string;
  slug: string;
  factor: number;
  condition: SeedCondition;
}>;

interface DeviceTemplate {
  brandSlug: string;
  categorySlug: string;
  model: string;
  slug: string;
  pricePkr: number;
  priceBhd: number;
}

const DEVICE_TEMPLATES: readonly DeviceTemplate[] = [
  { brandSlug: "apple", categorySlug: "smartphones", model: "iPhone 15 Pro 256GB", slug: "iphone-15-pro-256gb", pricePkr: 365000, priceBhd: 345 },
  { brandSlug: "apple", categorySlug: "smartphones", model: "iPhone 14 128GB", slug: "iphone-14-128gb", pricePkr: 235000, priceBhd: 225 },
  { brandSlug: "samsung", categorySlug: "smartphones", model: "Galaxy S24 Ultra 512GB", slug: "galaxy-s24-ultra-512gb", pricePkr: 355000, priceBhd: 335 },
  { brandSlug: "samsung", categorySlug: "smartphones", model: "Galaxy Z Flip 5 256GB", slug: "galaxy-z-flip-5-256gb", pricePkr: 285000, priceBhd: 270 },
  { brandSlug: "xiaomi", categorySlug: "smartphones", model: "Xiaomi 14 256GB", slug: "xiaomi-14-256gb", pricePkr: 185000, priceBhd: 175 },
  { brandSlug: "xiaomi", categorySlug: "smartphones", model: "Redmi Note 13 Pro 256GB", slug: "redmi-note-13-pro-256gb", pricePkr: 78000, priceBhd: 75 },
  { brandSlug: "oppo", categorySlug: "smartphones", model: "Reno 11 Pro 256GB", slug: "reno-11-pro-256gb", pricePkr: 118000, priceBhd: 112 },
  { brandSlug: "vivo", categorySlug: "smartphones", model: "V30 Pro 256GB", slug: "v30-pro-256gb", pricePkr: 112000, priceBhd: 106 },
  { brandSlug: "realme", categorySlug: "smartphones", model: "GT 6 Pro 512GB", slug: "gt-6-pro-512gb", pricePkr: 165000, priceBhd: 158 },
  { brandSlug: "infinix", categorySlug: "smartphones", model: "Note 40 Pro 256GB", slug: "note-40-pro-256gb", pricePkr: 62000, priceBhd: 59 },
  { brandSlug: "tecno", categorySlug: "smartphones", model: "Camon 20 Pro 256GB", slug: "camon-20-pro-256gb", pricePkr: 58000, priceBhd: 55 },
  { brandSlug: "google", categorySlug: "smartphones", model: "Pixel 8 Pro 128GB", slug: "pixel-8-pro-128gb", pricePkr: 225000, priceBhd: 215 },
  { brandSlug: "oneplus", categorySlug: "smartphones", model: "OnePlus 12 256GB", slug: "oneplus-12-256gb", pricePkr: 245000, priceBhd: 232 },
  { brandSlug: "huawei", categorySlug: "smartphones", model: "Nova 12 Pro 512GB", slug: "nova-12-pro-512gb", pricePkr: 132000, priceBhd: 125 },
  { brandSlug: "motorola", categorySlug: "smartphones", model: "Edge 50 Ultra 512GB", slug: "edge-50-ultra-512gb", pricePkr: 178000, priceBhd: 168 },
  { brandSlug: "samsung", categorySlug: "tablets", model: "Galaxy Tab S9 256GB", slug: "galaxy-tab-s9-256gb", pricePkr: 205000, priceBhd: 195 },
  { brandSlug: "apple", categorySlug: "tablets", model: "iPad Air M2 128GB", slug: "ipad-air-m2-128gb", pricePkr: 248000, priceBhd: 235 },
  { brandSlug: "apple", categorySlug: "smart-watches", model: "Watch Series 9 45mm", slug: "watch-series-9-45mm", pricePkr: 118000, priceBhd: 112 },
  { brandSlug: "samsung", categorySlug: "smart-watches", model: "Galaxy Watch6 Classic", slug: "galaxy-watch6-classic", pricePkr: 92000, priceBhd: 87 },
  { brandSlug: "apple", categorySlug: "earphones-headphones", model: "AirPods Pro 2 USB-C", slug: "airpods-pro-2-usb-c", pricePkr: 64000, priceBhd: 61 },
];

const MAX_GENERATED_PER_REGION = DEVICE_TEMPLATES.length * VARIANTS.length;

/**
 * Builds deterministic generated listings for one region. `count` must not
 * exceed 100; the seed uses 88 for Pakistan (with 12 curated listings) and 100
 * for Bahrain.
 */
export function buildGeneratedListings(region: SeedRegion, count: number): SeedListing[] {
  if (!Number.isInteger(count) || count < 0 || count > MAX_GENERATED_PER_REGION) {
    throw new RangeError(`Generated listing count must be between 0 and ${MAX_GENERATED_PER_REGION}.`);
  }

  const prefix = region === "BAHRAIN" ? "bh" : "pk";
  const cities = region === "BAHRAIN" ? BH_CITIES : PK_CITIES;
  const seedOffset = region === "BAHRAIN" ? 500 : 100;

  const listings: SeedListing[] = [];
  for (let index = 0; index < count; index += 1) {
    const template = DEVICE_TEMPLATES[Math.floor(index / VARIANTS.length)]!;
    const variant = VARIANTS[index % VARIANTS.length]!;
    const city = cities[(index + Math.floor(index / VARIANTS.length)) % cities.length]!;
    const price =
      region === "BAHRAIN"
        ? Number((template.priceBhd * variant.factor).toFixed(3))
        : Math.round(template.pricePkr * variant.factor);

    listings.push({
      title: `${template.model} — ${variant.label}`,
      slug: `${prefix}-${template.slug}-${variant.slug}`,
      price,
      condition: variant.condition,
      city,
      brandSlug: template.brandSlug,
      categorySlug: template.categorySlug,
      region,
      currency: region === "BAHRAIN" ? "BHD" : "PKR",
      isFeatured: index % 11 === 0,
      negotiable: index % 4 !== 0,
      views: 90 + ((index * 53 + variant.slug.length * 29) % 2100),
      ageDays: index % 30,
      images: listingImages(template.categorySlug, seedOffset + index),
    });
  }

  return listings;
}
