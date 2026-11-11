import "server-only";

import { sandboxProvider } from "@/features/inspections/payments/sandbox.provider";
import { payfastProvider } from "@/features/inspections/payments/payfast.provider";
import type { PaymentProvider } from "@/features/inspections/payments/types";

/**
 * The sandbox is available only outside production. Production must fail closed
 * when PayFast is not explicitly configured and live mode is not enabled.
 */
export function getPaymentProvider(): PaymentProvider | null {
  if (payfastProvider.isConfigured()) return payfastProvider;
  return process.env.NODE_ENV === "production" ? null : sandboxProvider;
}

export type { CheckoutRequest, CheckoutSession, VerifiedPayment } from "./types";
