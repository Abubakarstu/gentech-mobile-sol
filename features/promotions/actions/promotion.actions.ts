"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import {
  cancelPromotion,
  getActivePlans,
  getListingPromotionInfo,
  markPaymentCompleted,
  markPaymentFailed,
  pausePromotion,
  promoteListing,
  recordPayment,
} from "../services/promotion.service";
import {
  createListingPromotionSchema,
  createPromotionPaymentSchema,
  type CreateListingPromotionInput,
  type CreatePromotionPaymentInput,
} from "../schemas/promotion";

type ActionResult<T = void> = ({ ok: true } & T) | { ok: false; error: string };

const SIGN_IN_REQUIRED = "Sign in to access promotion features.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

/** Gets all active promotion plans. */
export async function getActivePromotionPlansAction(): Promise<ActionResult<{ plans: any[] }>> {
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
): Promise<ActionResult<{ promotion: any }>> {
  try {
    const promotion = await getListingPromotionInfo(listingId);
    if (!promotion) return { ok: false, error: "No active promotion found." };
    return { ok: true, promotion };
  } catch (error) {
    console.error("[promotions] getListingPromotion failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Promotes a listing with a specific plan. */
export async function promoteListingAction(
  input: CreateListingPromotionInput,
): Promise<ActionResult<{ promotionId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const parsed = createListingPromotionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid promotion data." };

  try {
    const promotionId = await promoteListing(parsed.data);
    revalidatePath(`${ROUTES.marketplace}`);
    return { ok: true, promotionId };
  } catch (error) {
    console.error("[promotions] promoteListing failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : GENERIC_ERROR };
  }
}

/** Pauses an active promotion. */
export async function pausePromotionAction(promotionId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  try {
    await pausePromotion(promotionId);
    revalidatePath(`${ROUTES.marketplace}`);
    return { ok: true };
  } catch (error) {
    console.error("[promotions] pausePromotion failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Cancels an active promotion. */
export async function cancelPromotionAction(promotionId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  try {
    await cancelPromotion(promotionId);
    revalidatePath(`${ROUTES.marketplace}`);
    return { ok: true };
  } catch (error) {
    console.error("[promotions] cancelPromotion failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Records a payment for a promotion. */
export async function recordPromotionPaymentAction(
  input: CreatePromotionPaymentInput,
): Promise<ActionResult<{ paymentId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const parsed = createPromotionPaymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid payment data." };

  try {
    const paymentId = await recordPayment(parsed.data);
    return { ok: true, paymentId };
  } catch (error) {
    console.error("[promotions] recordPayment failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Marks a payment as completed. */
export async function markPaymentCompletedAction(paymentId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  try {
    await markPaymentCompleted(paymentId);
    return { ok: true };
  } catch (error) {
    console.error("[promotions] markPaymentCompleted failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Marks a payment as failed. */
export async function markPaymentFailedAction(paymentId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  try {
    await markPaymentFailed(paymentId);
    return { ok: true };
  } catch (error) {
    console.error("[promotions] markPaymentFailed failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
