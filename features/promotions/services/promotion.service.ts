import "server-only";

import {
  createListingPromotion,
  createPromotionPayment,
  getActivePromotedListings,
  getListingPromotion,
  getPromotionPayments,
  getPromotionPlan,
  listActivePromotionPlans,
  listAllPromotionPlans,
  markExpiredPromotions,
  updateListingPromotionStatus,
  updatePromotionPaymentStatus,
} from "../repositories/promotion.repository";
import type {
  CreateListingPromotionInput,
  CreatePromotionPaymentInput,
  ListingPromotionDto,
  PromotionPaymentDto,
  PromotionPlanDto,
} from "../types";

function warn(scope: string, error: unknown): void {
  console.warn(`[promotions] ${scope}:`, error instanceof Error ? error.message : error);
}

// ---------------------------------------------------------------------------
// Promotion Plans (Admin)
// ---------------------------------------------------------------------------

export async function getActivePlans(): Promise<PromotionPlanDto[]> {
  try {
    return await listActivePromotionPlans();
  } catch (error) {
    warn("failed to load active plans", error);
    return [];
  }
}

export async function getAllPlans(): Promise<PromotionPlanDto[]> {
  try {
    return await listAllPromotionPlans();
  } catch (error) {
    warn("failed to load all plans", error);
    return [];
  }
}

export async function getPlan(id: string): Promise<PromotionPlanDto | null> {
  try {
    return await getPromotionPlan(id);
  } catch (error) {
    warn("failed to get plan", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Listing Promotions
// ---------------------------------------------------------------------------

export async function promoteListing(
  input: CreateListingPromotionInput,
): Promise<string> {
  try {
    return await createListingPromotion(input);
  } catch (error) {
    warn("failed to promote listing", error);
    throw new Error("Could not promote listing.");
  }
}

export async function getListingPromotionInfo(
  listingId: string,
): Promise<ListingPromotionDto | null> {
  try {
    return await getListingPromotion(listingId);
  } catch (error) {
    warn("failed to get listing promotion", error);
    return null;
  }
}

export async function getActivePromotions(): Promise<
  { listingId: string; promotion: ListingPromotionDto }[]
> {
  try {
    return await getActivePromotedListings();
  } catch (error) {
    warn("failed to get active promotions", error);
    return [];
  }
}

export async function pausePromotion(id: string): Promise<void> {
  try {
    await updateListingPromotionStatus(id, "PAUSED");
  } catch (error) {
    warn("failed to pause promotion", error);
    throw new Error("Could not pause promotion.");
  }
}

export async function cancelPromotion(id: string): Promise<void> {
  try {
    await updateListingPromotionStatus(id, "CANCELLED");
  } catch (error) {
    warn("failed to cancel promotion", error);
    throw new Error("Could not cancel promotion.");
  }
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export async function recordPayment(
  input: CreatePromotionPaymentInput,
): Promise<string> {
  try {
    return await createPromotionPayment(input);
  } catch (error) {
    warn("failed to record payment", error);
    throw new Error("Could not record payment.");
  }
}

export async function getPayments(promotionId: string): Promise<PromotionPaymentDto[]> {
  try {
    return await getPromotionPayments(promotionId);
  } catch (error) {
    warn("failed to get payments", error);
    return [];
  }
}

export async function markPaymentCompleted(id: string): Promise<void> {
  try {
    await updatePromotionPaymentStatus(id, "COMPLETED");
  } catch (error) {
    warn("failed to mark payment completed", error);
    throw new Error("Could not mark payment as completed.");
  }
}

export async function markPaymentFailed(id: string): Promise<void> {
  try {
    await updatePromotionPaymentStatus(id, "FAILED");
  } catch (error) {
    warn("failed to mark payment failed", error);
    throw new Error("Could not mark payment as failed.");
  }
}

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------

export async function expirePromotions(): Promise<number> {
  try {
    return await markExpiredPromotions();
  } catch (error) {
    warn("failed to expire promotions", error);
    return 0;
  }
}
