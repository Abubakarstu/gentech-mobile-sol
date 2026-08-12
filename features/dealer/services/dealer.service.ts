import "server-only";

import {
  addInventoryToDealer,
  addUserToDealer,
  createBranch,
  createDealer,
  getBranchesByDealer,
  getDealerById,
  getDealerBySlug,
  getDealerByUserId,
  getDealerInventory,
  getDealerUsers,
  listActiveDealers,
  removeUserFromDealer,
  updateDealer,
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

// Re-export for use in actions
export const addInventory = addInventoryToDealer;

function warn(scope: string, error: unknown): void {
  console.warn(`[dealer] ${scope}:`, error instanceof Error ? error.message : error);
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

/**
 * Updates dealer information.
 */
export async function updateDealerProfile(id: string, input: UpdateDealerInput): Promise<void> {
  try {
    await updateDealer(id, input);
  } catch (error) {
    warn("failed to update dealer", error);
    throw new Error("Could not update dealer profile.");
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

/**
 * Adds a user to a dealer with a specific role.
 */
export async function addStaffMember(dealerId: string, userId: string, role: string = "staff"): Promise<void> {
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
