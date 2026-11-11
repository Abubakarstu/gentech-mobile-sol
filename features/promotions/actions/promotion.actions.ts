"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  cancelPromotion,
  getActivePlans,
  getListingPromotionInfo,
  pausePromotion,
} from "../services/promotion.service";
import {
  createListingPromotionSchema,
  createPromotionPaymentSchema,
  type CreateListingPromotionInput,
  type CreatePromotionPaymentInput,
} from "../schemas/promotion";
import type { PromotionPlanDto, ListingPromotionDto } from "../types";

type ActionResult<T = void> = ({ ok: true } & T) | { ok: false; error: string };

const SIGN_IN_REQUIRED = "Sign in to access promotion features.";
const GENERIC_ERROR = "Something went wrong. Please try again.";
const PROMOTION_CHECKOUT_UNAVAILABLE =
  "Paid promotion checkout is unavailable until verified payment processing is enabled.";

/** Gets all active promotion plans. */
export async function getActivePromotionPlansAction(): Promise<ActionResult<{ plans: PromotionPlanDto[] }>> {
  try {
    const plans = await getActivePlans();
    return { ok: true, plans };
  } catch (error) {
    console.error("[promotions] getActivePlans failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Gets promotion info for a listing. */
export async function getListingPromotionAction(
  listingId: string,
): Promise<ActionResult<{ promotion: ListingPromotionDto | null }>> {
  try {
    const promotion = await getListingPromotionInfo(listingId);
    if (!promotion) return { ok: false, error: "No active promotion found." };
    return { ok: true, promotion };
  } catch (error) {
    console.error("[promotions] getListingPromotion failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Promotes a listing with a specific plan. User must own the listing. */
export async function promoteListingAction(
  input: CreateListingPromotionInput,
): Promise<ActionResult<{ promotionId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const parsed = createListingPromotionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid promotion data." };
  return { ok: false, error: PROMOTION_CHECKOUT_UNAVAILABLE };
}

/** Pauses an active promotion. User must own the listing. */
export async function pausePromotionAction(promotionId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  try {
    // Verify ownership before pausing
    const promotion = await getListingPromotionInfo(promotionId);
    if (!promotion) return { ok: false, error: "Promotion not found." };
    
    // Check if user owns the listing
    const listing = await prisma.listing.findUnique({
      where: { id: promotion.listingId },
      select: { sellerId: true },
    });
    
    if (!listing || listing.sellerId !== user.id) {
      return { ok: false, error: "You can only pause your own promotions." };
    }
    
    await pausePromotion(promotionId);
    revalidatePath(`${ROUTES.marketplace}`);
    return { ok: true };
  } catch (error) {
    console.error("[promotions] pausePromotion failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Cancels an active promotion. User must own the listing. */
export async function cancelPromotionAction(promotionId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  try {
    // Verify ownership before canceling
    const promotion = await getListingPromotionInfo(promotionId);
    if (!promotion) return { ok: false, error: "Promotion not found." };
    
    // Check if user owns the listing
    const listing = await prisma.listing.findUnique({
      where: { id: promotion.listingId },
      select: { sellerId: true },
    });
    
    if (!listing || listing.sellerId !== user.id) {
      return { ok: false, error: "You can only cancel your own promotions." };
    }
    
    await cancelPromotion(promotionId);
    revalidatePath(`${ROUTES.marketplace}`);
    return { ok: true };
  } catch (error) {
    console.error("[promotions] cancelPromotion failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Records a payment for a promotion. User must own the listing. */
export async function recordPromotionPaymentAction(
  input: CreatePromotionPaymentInput,
): Promise<ActionResult<{ paymentId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const parsed = createPromotionPaymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid payment data." };
  return { ok: false, error: PROMOTION_CHECKOUT_UNAVAILABLE };
}

/** Seller-submitted outcomes are never accepted as payment verification. */
export async function markPaymentCompletedAction(_paymentId: string) {
  void _paymentId;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };
  return { ok: false, error: PROMOTION_CHECKOUT_UNAVAILABLE };
}

/** Payment failures are set only by server-verified provider responses. */
export async function markPaymentFailedAction(_paymentId: string) {
  void _paymentId;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };
  return { ok: false, error: PROMOTION_CHECKOUT_UNAVAILABLE };
}
