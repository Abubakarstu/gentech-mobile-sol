import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { slugify } from "@/utils/slug";
import type {
  CreateBranchInput,
  CreateDealerInput,
  DealerBranchDto,
  DealerDto,
  DealerInventoryDto,
  DealerUserDto,
  UpdateDealerInput,
} from "../types";

// ---------------------------------------------------------------------------
// Selects
// ---------------------------------------------------------------------------

const dealerSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logo: true,
  coverImage: true,
  businessName: true,
  businessType: true,
  taxNumber: true,
  phone: true,
  email: true,
  website: true,
  city: true,
  address: true,
  latitude: true,
  longitude: true,
  status: true,
  plan: true,
  planExpiresAt: true,
  featuredUntil: true,
  isVerified: true,
  verifiedAt: true,
  listingCount: true,
  soldCount: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DealerSelect;

const branchSelect = {
  id: true,
  dealerId: true,
  name: true,
  address: true,
  city: true,
  phone: true,
  email: true,
  latitude: true,
  longitude: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DealerBranchSelect;

const inventorySelect = {
  id: true,
  dealerId: true,
  listingId: true,
  sku: true,
  stockCount: true,
  location: true,
  costPrice: true,
  acquiredAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DealerInventorySelect;

const dealerUserSelect = {
  id: true,
  dealerId: true,
  userId: true,
  role: true,
  isActive: true,
  joinedAt: true,
  user: {
    select: {
      name: true,
      email: true,
    },
  },
} satisfies Prisma.DealerUserSelect;

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function toDealerDto(row: Prisma.DealerGetPayload<{ select: typeof dealerSelect }>): DealerDto {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logo: row.logo,
    coverImage: row.coverImage,
    businessName: row.businessName,
    businessType: row.businessType,
    taxNumber: row.taxNumber,
    phone: row.phone,
    email: row.email,
    website: row.website,
    city: row.city,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    status: row.status,
    plan: row.plan,
    planExpiresAt: row.planExpiresAt?.toISOString() ?? null,
    featuredUntil: row.featuredUntil?.toISOString() ?? null,
    isVerified: row.isVerified,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    listingCount: row.listingCount,
    soldCount: row.soldCount,
    rating: row.rating,
    reviewCount: row.reviewCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toBranchDto(row: Prisma.DealerBranchGetPayload<{ select: typeof branchSelect }>): DealerBranchDto {
  return {
    id: row.id,
    dealerId: row.dealerId,
    name: row.name,
    address: row.address,
    city: row.city,
    phone: row.phone,
    email: row.email,
    latitude: row.latitude,
    longitude: row.longitude,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toInventoryDto(row: Prisma.DealerInventoryGetPayload<{ select: typeof inventorySelect }>): DealerInventoryDto {
  return {
    id: row.id,
    dealerId: row.dealerId,
    listingId: row.listingId,
    sku: row.sku,
    stockCount: row.stockCount,
    location: row.location,
    costPrice: row.costPrice ? Number(row.costPrice) : null,
    acquiredAt: row.acquiredAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toDealerUserDto(row: Prisma.DealerUserGetPayload<{ select: typeof dealerUserSelect }>): DealerUserDto {
  return {
    id: row.id,
    dealerId: row.dealerId,
    userId: row.userId,
    userName: row.user.name,
    userEmail: row.user.email,
    role: row.role,
    isActive: row.isActive,
    joinedAt: row.joinedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Dealers
// ---------------------------------------------------------------------------

async function uniqueDealerSlug(name: string): Promise<string> {
  const base = slugify(name) || "dealer";
  let slug = base;
  let n = 1;
  while (await prisma.dealer.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function createDealer(input: CreateDealerInput, ownerId: string): Promise<string> {
  const slug = await uniqueDealerSlug(input.name);
  
  const dealer = await prisma.dealer.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      businessName: input.businessName,
      businessType: input.businessType,
      taxNumber: input.taxNumber,
      phone: input.phone,
      email: input.email,
      website: input.website,
      city: input.city,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      users: {
        create: {
          userId: ownerId,
          role: "owner",
        },
      },
    },
    select: { id: true },
  });
  
  return dealer.id;
}

export async function getDealerById(id: string): Promise<DealerDto | null> {
  const row = await prisma.dealer.findUnique({
    where: { id },
    select: dealerSelect,
  });
  return row ? toDealerDto(row) : null;
}

export async function getDealerBySlug(slug: string): Promise<DealerDto | null> {
  const row = await prisma.dealer.findUnique({
    where: { slug },
    select: dealerSelect,
  });
  return row ? toDealerDto(row) : null;
}

export async function getDealerByUserId(userId: string): Promise<DealerDto | null> {
  const dealerUser = await prisma.dealerUser.findFirst({
    where: { userId, isActive: true },
    select: { dealer: { select: dealerSelect } },
  });
  return dealerUser?.dealer ? toDealerDto(dealerUser.dealer) : null;
}

export async function updateDealer(id: string, input: UpdateDealerInput): Promise<void> {
  await prisma.dealer.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.logo !== undefined && { logo: input.logo }),
      ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
      ...(input.businessName !== undefined && { businessName: input.businessName }),
      ...(input.businessType !== undefined && { businessType: input.businessType }),
      ...(input.taxNumber !== undefined && { taxNumber: input.taxNumber }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.website !== undefined && { website: input.website }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.latitude !== undefined && { latitude: input.latitude }),
      ...(input.longitude !== undefined && { longitude: input.longitude }),
    },
  });
}

export async function listActiveDealers(limit = 20): Promise<DealerDto[]> {
  const rows = await prisma.dealer.findMany({
    where: { status: "ACTIVE", isVerified: true },
    orderBy: { listingCount: "desc" },
    take: limit,
    select: dealerSelect,
  });
  return rows.map(toDealerDto);
}

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

export async function createBranch(input: CreateBranchInput): Promise<string> {
  const branch = await prisma.dealerBranch.create({
    data: {
      dealerId: input.dealerId,
      name: input.name,
      address: input.address,
      city: input.city,
      phone: input.phone,
      email: input.email,
      latitude: input.latitude,
      longitude: input.longitude,
    },
    select: { id: true },
  });
  return branch.id;
}

export async function getBranchesByDealer(dealerId: string): Promise<DealerBranchDto[]> {
  const rows = await prisma.dealerBranch.findMany({
    where: { dealerId, isActive: true },
    orderBy: { name: "asc" },
    select: branchSelect,
  });
  return rows.map(toBranchDto);
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export async function addInventoryToDealer(input: {
  dealerId: string;
  listingId?: string;
  sku?: string;
  stockCount: number;
  location?: string;
  costPrice?: number;
}): Promise<string> {
  const inventory = await prisma.dealerInventory.create({
    data: {
      dealerId: input.dealerId,
      listingId: input.listingId,
      sku: input.sku,
      stockCount: input.stockCount,
      location: input.location,
      costPrice: input.costPrice ? new Prisma.Decimal(input.costPrice) : undefined,
      acquiredAt: new Date(),
    },
    select: { id: true },
  });
  return inventory.id;
}

export async function getDealerInventory(dealerId: string): Promise<DealerInventoryDto[]> {
  const rows = await prisma.dealerInventory.findMany({
    where: { dealerId },
    orderBy: { createdAt: "desc" },
    select: inventorySelect,
  });
  return rows.map(toInventoryDto);
}

// ---------------------------------------------------------------------------
// Dealer Users
// ---------------------------------------------------------------------------

export async function addUserToDealer(dealerId: string, userId: string, role: string = "staff"): Promise<void> {
  await prisma.dealerUser.create({
    data: {
      dealerId,
      userId,
      role,
    },
  });
}

export async function getDealerUsers(dealerId: string): Promise<DealerUserDto[]> {
  const rows = await prisma.dealerUser.findMany({
    where: { dealerId },
    orderBy: { joinedAt: "desc" },
    select: dealerUserSelect,
  });
  return rows.map(toDealerUserDto);
}

export async function removeUserFromDealer(dealerId: string, userId: string): Promise<void> {
  await prisma.dealerUser.deleteMany({
    where: { dealerId, userId },
  });
}
