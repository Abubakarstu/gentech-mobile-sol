"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import {
  addBranch,
  addInventory,
  addStaffMember,
  getDealer,
  getUserDealer,
  registerDealer,
  removeStaffMember,
  updateDealerProfile,
} from "../services/dealer.service";
import type {
  AddInventoryInput,
  AddStaffInput,
  CreateBranchInput,
  CreateDealerInput,
  UpdateDealerInput,
} from "../schemas/dealer";
import type { DealerDto } from "../types";

type ActionResult<T = void> = ({ ok: true } & T) | { ok: false; error: string };

const SIGN_IN_REQUIRED = "Sign in to access dealer features.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

/** Registers a new dealer profile for the current user. */
export async function registerDealerAction(
  input: CreateDealerInput,
): Promise<ActionResult<{ dealerId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  // Check if user already has a dealer
  const existing = await getUserDealer(user.id);
  if (existing) return { ok: false, error: "You already have a dealer profile." };

  try {
    const dealerId = await registerDealer(input, user.id);
    revalidatePath(ROUTES.dealers);
    return { ok: true, dealerId };
  } catch (error) {
    console.error("[dealer] registerDealer failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Gets the current user's dealer profile if they have one. */
export async function getMyDealerAction(): Promise<ActionResult<{ dealer: DealerDto }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  try {
    const dealer = await getUserDealer(user.id);
    if (!dealer) return { ok: false, error: "You don't have a dealer profile yet." };
    return { ok: true, dealer };
  } catch (error) {
    console.error("[dealer] getMyDealer failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Gets a dealer profile by ID (public view). */
export async function getDealerAction(id: string): Promise<ActionResult<{ dealer: DealerDto }>> {
  try {
    const dealer = await getDealer(id);
    if (!dealer) return { ok: false, error: "Dealer not found." };
    return { ok: true, dealer };
  } catch (error) {
    console.error("[dealer] getDealer failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Updates the current user's dealer profile. */
export async function updateDealerAction(input: UpdateDealerInput) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const dealer = await getUserDealer(user.id);
  if (!dealer) return { ok: false, error: "You don't have a dealer profile." };

  try {
    await updateDealerProfile(dealer.id, input);
    revalidatePath(`${ROUTES.dealers}/${dealer.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("[dealer] updateDealer failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Adds a branch to the dealer's business. */
export async function addBranchAction(
  input: CreateBranchInput,
): Promise<ActionResult<{ branchId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const dealer = await getUserDealer(user.id);
  if (!dealer) return { ok: false, error: "You don't have a dealer profile." };

  // Verify the dealer ID matches
  if (input.dealerId !== dealer.id) {
    return { ok: false, error: "You can only add branches to your own dealer profile." };
  }

  try {
    const branchId = await addBranch(input);
    revalidatePath(`${ROUTES.dealers}/${dealer.slug}`);
    return { ok: true, branchId };
  } catch (error) {
    console.error("[dealer] addBranch failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Adds inventory to the dealer. */
export async function addInventoryAction(
  input: AddInventoryInput,
): Promise<ActionResult<{ inventoryId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const dealer = await getUserDealer(user.id);
  if (!dealer) return { ok: false, error: "You don't have a dealer profile." };

  // Verify the dealer ID matches
  if (input.dealerId !== dealer.id) {
    return { ok: false, error: "You can only add inventory to your own dealer profile." };
  }

  try {
    const inventoryId = await addInventory(input);
    revalidatePath(`${ROUTES.dealers}/${dealer.slug}`);
    return { ok: true, inventoryId };
  } catch (error) {
    console.error("[dealer] addInventory failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Adds a staff member to the dealer. */
export async function addStaffAction(input: AddStaffInput) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const dealer = await getUserDealer(user.id);
  if (!dealer) return { ok: false, error: "You don't have a dealer profile." };

  // Verify the dealer ID matches and user is owner
  if (input.dealerId !== dealer.id) {
    return { ok: false, error: "You can only add staff to your own dealer profile." };
  }

  try {
    await addStaffMember(input.dealerId, input.userId, input.role);
    revalidatePath(`${ROUTES.dealers}/${dealer.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("[dealer] addStaff failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Removes a staff member from the dealer. */
export async function removeStaffAction(dealerId: string, userId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const dealer = await getUserDealer(user.id);
  if (!dealer) return { ok: false, error: "You don't have a dealer profile." };

  // Verify the dealer ID matches
  if (dealerId !== dealer.id) {
    return { ok: false, error: "You can only remove staff from your own dealer profile." };
  }

  try {
    await removeStaffMember(dealerId, userId);
    revalidatePath(`${ROUTES.dealers}/${dealer.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("[dealer] removeStaff failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
