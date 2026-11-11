import "server-only";

import { APP_URL } from "@/lib/app-url";
import { NOTIFICATION_TYPES, ROUTES, type PaymentMethod } from "@/lib/constants";
import { dispatchNotification } from "@/features/notifications/services/notification.service";
import { getPaymentProvider } from "@/features/inspections/payments";
import {
  assertPayFastContinuation,
  beginPayFastPayment,
  completePayFastPayment,
  getPayFastPaymentStatus,
  PayFastError,
} from "@/features/inspections/payments/payfast.provider";
import type {
  PayFastChallenge,
  PayFastPaymentDetails,
  PaymentVerificationStatus,
} from "@/features/inspections/payments/types";
import {
  claimPaymentProcessing,
  getPayableRequest,
  markRequestPaid,
  markRequestPaymentFailed,
  markRequestPaymentPending,
  recordPaymentIntent,
} from "@/features/inspections/repositories/inspection.repository";

export async function startPayFastInspectionPayment(input: {
  requestId: string;
  requesterId: string;
  customerIp: string;
  details: PayFastPaymentDetails;
}): Promise<PayFastChallenge> {
  const provider = getPaymentProvider();
  if (provider?.id !== "payfast") throw new PayFastError("NOT_CONFIGURED");

  const request = await getPayableRequest(input.requestId, input.requesterId);
  if (!request) throw new PayFastError("INVALID_STATE");
  if (
    ![
      "UNPAID",
      "FAILED",
      "AWAITING_CUSTOMER",
    ].includes(request.paymentStatus) ||
    request.currency !== "PKR"
  ) {
    throw new PayFastError("INVALID_STATE");
  }

  const nonce = randomBytes(24).toString("base64url");
  const callbackUrl = new URL(
    `/api/payments/payfast/3ds/callback?nonce=${encodeURIComponent(nonce)}`,
    APP_URL,
  ).toString();
  const challenge = await beginPayFastPayment({
    userId: input.requesterId,
    requestId: request.id,
    basketId: request.id,
    amount: request.feeAmountDecimal,
    currency: request.currency,
    method,
    customerName: request.contactName ?? undefined,
    customerPhone: request.contactPhone ?? undefined,
    returnUrl: `${APP_URL}${ROUTES.inspections}`,
  });
  await applyPayFastStatus(
    request.id,
    input.requesterId,
    request.paymentRef,
    undefined,
    result.status,
  );
  return result.status;
}

export async function checkPayFastInspectionPayment(input: {
  requestId: string;
  requesterId: string;
  customerIp: string;
}): Promise<PaymentVerificationStatus> {
  const provider = getPaymentProvider();
  if (provider?.id !== "payfast") throw new PayFastError("NOT_CONFIGURED");

  const request = await getPayableRequest(input.requestId, input.requesterId);
  if (!request?.paymentRef) throw new PayFastError("INVALID_STATE");
  if (
    request.paymentStatus !== "PENDING" &&
    request.paymentStatus !== "PROCESSING"
  ) {
    throw new PayFastError("INVALID_STATE");
  }

  const result = await getPayFastPaymentStatus({
    transactionId: request.paymentRef,
    basketId: request.id,
    customerIp: input.customerIp,
  });
  await applyPayFastStatus(
    request.id,
    input.requesterId,
    request.paymentRef,
    undefined,
    result.status,
  );
  return result.status;
}

async function applyPayFastStatus(
  requestId: string,
  requesterId: string,
  reference: string,
  method: PaymentMethod | undefined,
  status: PaymentVerificationStatus,
): Promise<void> {
  if (status === "PAID") {
    const paid = await markRequestPaid(requestId, requesterId, reference, method);
    if (paid) {
      await dispatchNotification({
        userId: requesterId,
        type: NOTIFICATION_TYPES.INSPECTION_SCHEDULED,
        title: "Payment received",
        body: "We've received your inspection payment. Your slot is confirmed.",
        url: ROUTES.inspections,
        email: true,
      }).catch(() => {
        /* best-effort */
      });
    }
  } else if (status === "FAILED") {
    await markRequestPaymentFailed(requestId, requesterId, reference);
  } else {
    await markRequestPaymentPending(requestId, requesterId, reference);
  }
}

export async function confirmInspectionPayment(
  requestId: string,
  requesterId: string,
  method: PaymentMethod,
  outcome: "PAID" | "FAILED",
): Promise<boolean> {
  const provider = getPaymentProvider();
  if (provider?.id !== "sandbox") return false;

  const request = await getPayableRequest(requestId, requesterId);
  if (!request) return false;

  const reference = `SANDBOX-${requestId}`;
  const recorded = await recordPaymentIntent(requestId, requesterId, reference, method);
  if (!recorded) return false;
  const claimed = await claimPaymentProcessing(requestId, requesterId, reference);
  if (!claimed) return false;

  const verified = await provider.verify({ reference, outcome });
  if (verified.status !== "PAID") {
    await markRequestPaymentFailed(requestId, requesterId, reference);
    return false;
  }
  return markRequestPaid(requestId, requesterId, reference, method);
}
