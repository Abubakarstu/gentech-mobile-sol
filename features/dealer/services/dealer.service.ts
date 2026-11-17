import "server-only";

import { prisma } from "@/lib/prisma";
import {
  addInventoryToDealer,
  addUserToDealer,
  createBranch,
  createDealer,
  getBranchesByDealer,
  getDealerById,
  getDealerMembershipByUserId,
  getDealerBySlug,
  getDealerByUserId,
  getDealerReviewQueue as getDealerReviewQueueRecords,
  getDealerStatusCounts as getDealerStatusCountRecords,
  getDealerInventory,
  removeDealerInventory as removeDealerInventoryRecord,
  getDealerUsers,
  listActiveDealers,
  removeUserFromDealer,
  reviewDealerApplication as reviewDealerApplicationRecord,
  updateDealer,
  setDealerBranchActive,
  updateDealerInventory as updateDealerInventoryRecord,
} from "../repositories/dealer.repository";
import type {
  CreateBranchInput,
  CreateDealerInput,
  DealerBranchDto,
  DealerDto,
  DealerInventoryDto,
  DealerUserDto,
  UpdateDealerInput,
} from "../types";
import { DealerRole, DealerPermission } from "../types";

// Re-export for use in actions
export const addInventory = addInventoryToDealer;

function warn(scope: string, error: unknown): void {
  console.warn(`[dealer] ${scope}:`, error instanceof Error ? error.message : error);
}

/** Checks if a user role has the required permission */
function hasPermission(role: string, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    [DealerRole.OWNER]: [
      DealerPermission.MANAGE_DEALER,
      DealerPermission.MANAGE_BRANCH,
      DealerPermission.MANAGE_INVENTORY,
      DealerPermission.VIEW_DEALER,
      DealerPermission.VIEW_BRANCH,
      DealerPermission.VIEW_INVENTORY,
      DealerPermission.CREATE_LEAD,
      DealerPermission.EDIT_LEAD,
      DealerPermission.CONVERT_LEAD,
      DealerPermission.DELETE_LEAD,
      DealerPermission.APPROVE_DEALER,
      DealerPermission.REJECT_DEALER,
      DealerPermission.MANAGE_DEALERS,
    ],
    [DealerRole.MANAGER]: [
      DealerPermission.MANAGE_DEALER,
      DealerPermission.VIEW_DEALER,
      DealerPermission.VIEW_BRANCH,
      DealerPermission.VIEW_INVENTORY,
      DealerPermission.CREATE_LEAD,
      DealerPermission.EDIT_LEAD,
      DealerPermission.CONVERT_LEAD,
      // Managers can't delete leads or manage dealers
    ],
    [DealerRole.STAFF]: [
      DealerPermission.VIEW_DEALER,
      DealerPermission.VIEW_BRANCH,
      DealerPermission.VIEW_INVENTORY,
      // Staff can only view, not edit
    ],
  };

  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

/**
 * Creates a new dealer account with the user as owner.
 */
export async function registerDealer(input: CreateDealerInput, ownerId: string): Promise<string> {
  try {
    return await createDealer(input, ownerId);
  } catch (error) {
    warn("failed to create dealer", error);
    throw new Error("Could not create dealer account.");
  }
}

/**
 * Gets dealer information by ID.
 */
export async function getDealer(id: string): Promise<DealerDto | null> {
  try {
    return await getDealerById(id);
  } catch (error) {
    warn("failed to get dealer", error);
    return null;
  }
}

/**
 * Gets dealer information by slug (for public pages).
 */
export async function getDealerBySlugPublic(slug: string): Promise<DealerDto | null> {
  try {
    return await getDealerBySlug(slug);
  } catch (error) {
    warn("failed to get dealer by slug", error);
    return null;
  }
}

/**
 * Gets the dealer associated with a user (if any).
 */
export async function getUserDealer(userId: string): Promise<DealerDto | null> {
  try {
    return await getDealerByUserId(userId);
  } catch (error) {
    warn("failed to get user dealer", error);
    return null;
  }
}

export async function getUserDealerMembership(userId: string) {
  try {
    return await getDealerMembershipByUserId(userId);
  } catch (error) {
    warn("failed to get dealer membership", error);
    throw new Error("Could not verify dealer access.");
  }
}

/**
 * Updates dealer information.
 */
export async function updateDealerProfile(
  id: string,
  input: UpdateDealerInput,
  resubmit = false,
): Promise<void> {
  try {
    await updateDealer(id, input, resubmit);
  } catch (error) {
    warn("failed to update dealer", error);
    throw new Error("Could not update dealer profile.");
  }
}

export async function getDealerReviewQueueData(params: {
  status?: DealerDto["status"];
  q?: string;
}) {
  const [items, counts] = await Promise.all([
    getDealerReviewQueueRecords(params),
    getDealerStatusCountRecords(),
  ]);
  return { items, counts };
}

export async function reviewDealerApplicationStatus(input: {
  dealerId: string;
  status: "ACTIVE" | "REJECTED";
  reason?: string;
}): Promise<boolean> {
  try {
    return await reviewDealerApplicationRecord(input);
  } catch (error) {
    warn("failed to review dealer application", error);
    throw new Error("Could not update dealer application.");
  }
}

/**
 * Lists active verified dealers for the marketplace.
 */
export async function getActiveDealers(limit = 20): Promise<DealerDto[]> {
  try {
    return await listActiveDealers(limit);
  } catch (error) {
    warn("failed to list active dealers", error);
    return [];
  }
}

/**
 * Creates a new branch for a dealer.
 */
export async function addBranch(input: CreateBranchInput): Promise<string> {
  try {
    return await createBranch(input);
  } catch (error) {
    warn("failed to create branch", error);
    throw new Error("Could not create branch.");
  }
}

/**
 * Gets all branches for a dealer.
 */
export async function getDealerBranches(dealerId: string): Promise<DealerBranchDto[]> {
  try {
    return await getBranchesByDealer(dealerId);
  } catch (error) {
    warn("failed to get dealer branches", error);
    return [];
  }
}

export async function setDealerBranchStatus(input: {
  dealerId: string;
  branchId: string;
  isActive: boolean;
}): Promise<boolean> {
  try {
    return await setDealerBranchActive(input);
  } catch (error) {
    warn("failed to update branch status", error);
    throw new Error("Could not update branch status.");
  }
}

/**
 * Gets dealer inventory.
 */
export async function getInventory(dealerId: string): Promise<DealerInventoryDto[]> {
  try {
    return await getDealerInventory(dealerId);
  } catch (error) {
    warn("failed to get dealer inventory", error);
    return [];
  }
}

export async function updateInventory(input: {
  dealerId: string;
  inventoryId: string;
  stockCount: number;
  location?: string;
}): Promise<boolean> {
  try {
    return await updateDealerInventoryRecord(input);
  } catch (error) {
    warn("failed to update dealer inventory", error);
    throw new Error("Could not update inventory.");
  }
}

export async function removeInventory(input: {
  dealerId: string;
  inventoryId: string;
}): Promise<boolean> {
  try {
    return await removeDealerInventoryRecord(input);
  } catch (error) {
    warn("failed to remove dealer inventory", error);
    throw new Error("Could not remove inventory.");
  }
}

/**
 * Adds a user to a dealer with a specific role.
 */
export async function addStaffMember(
  dealerId: string,
  userId: string,
  role: string = "staff",
): Promise<void> {
  try {
    await addUserToDealer(dealerId, userId, role);
  } catch (error) {
    warn("failed to add staff member", error);
    throw new Error("Could not add staff member.");
  }
}

/**
 * Gets all users associated with a dealer.
 */
export async function getStaffMembers(dealerId: string): Promise<DealerUserDto[]> {
  try {
    return await getDealerUsers(dealerId);
  } catch (error) {
    warn("failed to get staff members", error);
    return [];
  }
}

/**
 * Removes a user from a dealer.
 */
export async function removeStaffMember(dealerId: string, userId: string): Promise<void> {
  try {
    await removeUserFromDealer(dealerId, userId);
  } catch (error) {
    warn("failed to remove staff member", error);
    throw new Error("Could not remove staff member.");
  }
}

/**
 * Converts a dealer lead to a dealer account.
 * Creates the dealer and links the converted lead.
 */
export async function convertLeadToDealer(input: {
  dealerId: string;
  leadId: string;
  source: "admin" | "import" | "conversation";
  conversionNotes?: string;
}): Promise<{ dealer: DealerDto; leadConverted: boolean }> {
  try {
    // Check if dealer already exists
    const existingDealer = await prisma.dealer.findUnique({
      where: { id: input.dealerId },
    });

    if (existingDealer) {
      // Map prisma dealer to DealerDto manually
      const { createdAt, updatedAt, ...rest } = existingDealer as any;
      return { dealer: { ...rest, createdAt: createdAt?.toISOString(), updatedAt: updatedAt?.toISOString() } as DealerDto, leadConverted: false };
    }

    // Create the dealer account
    const ownerId = input.leadId || "lead-user";
    const slug = input.leadId || "dealer";

    const newDealer = await prisma.dealer.create({
      data: {
        name: input.leadId || "New Dealer",
        slug,
        description: `Dealer converted from lead`,
        businessName: input.leadId || "New Dealer",
        businessType: "retailer",
        taxNumber: "",
        phone: "",
        email: "",
        city: "",
        address: "",
        status: "PENDING",
        plan: "BASIC",
        featuredUntil: null,
        isVerified: false,
        verifiedAt: null,
        reviewNote: null,
        listingCount: 0,
        soldCount: 0,
        rating: 0,
        reviewCount: 0,
        users: {
          create: {
            userId: ownerId,
            role: "owner",
          },
        },
      },
      select: {
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
        reviewNote: true,
        listingCount: true,
        soldCount: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const { createdAt, updatedAt, ...rest } = newDealer as any;
    return { dealer: { ...rest, createdAt: createdAt?.toISOString(), updatedAt: updatedAt?.toISOString() } as DealerDto, leadConverted: true };
  } catch (error) {
    warn("failed to convert lead to dealer", error);
    throw new Error("Could not convert lead to dealer.");
  }
}

/**
 * Validates that a dealer owns a resource (listing, branch, inventory)
 * Throws error if dealer does not own the resource
 */
async function validateDealerOwnership(dealerId: string, resourceDealerId: string, resourceType: "listing" | "branch" | "inventory"): Promise<void> {
  if (dealerId !== resourceDealerId) {
    throw new Error(`Dealer does not own this ${resourceType}`);
  }
}

/**
 * Gets aggregated statistics for a dealer dashboard.
 */
export async function getDealerStats(dealerId: string) {
  try {
    const [totalListings, staffCount, branchCount, soldCount] = await Promise.all([
      prisma.listing.count({
        where: { sellerId: dealerId, deletedAt: null },
      }),
      prisma.dealerUser.count({
        where: { dealerId, isActive: true },
      }),
      prisma.dealerBranch.count({
        where: { dealerId, isActive: true },
      }),
      prisma.dealer.findUnique({
        where: { id: dealerId },
        select: { soldCount: true },
      }),
    ]);

    return {
      totalListings,
      staffCount,
      branchCount,
      soldCount: soldCount?.soldCount ?? 0,
    };
  } catch (error) {
    warn("failed to get dealer stats", error);
    return {
      totalListings: 0,
      staffCount: 0,
      branchCount: 0,
      soldCount: 0,
    };
  }
}
