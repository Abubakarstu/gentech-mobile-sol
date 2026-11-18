import "server-only";

import { prisma } from "@/lib/prisma";
import { getPaymentProvider, getDefaultProvider, getProvidersForCountry } from "../providers";
import { createPayment, findPaymentById, updatePaymentStatus, findPaymentByIdempotencyKey } from "../repositories/payment.repository";
import type { PaymentProviderId, PaymentVerifyResult, WebhookPayload } from "../types";

export interface InitiatePaymentInput {
  orderId: string;
  providerId?: PaymentProviderId;
  idempotencyKey?: string;
}

export interface InitiatePaymentResult {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  clientSecret?: string;
  error?: string;
}

/**
 * Initiate a payment for an order.
 * Creates a payment record and initializes with the provider.
 */
export async function initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
  try {
    // 1. Get order details
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: {
        id: true,
        customerId: true,
        region: true,
        currency: true,
        total: true,
        paymentStatus: true,
        customer: { select: { email: true, name: true } },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // 2. Check if already paid
    if (order.paymentStatus === "PAID") {
      return { success: false, error: "Order already paid" };
    }

    // 3. Determine country code
    const country = order.region === "BAHRAIN" ? "BH" : "PK";

    // 4. Check idempotency
    if (input.idempotencyKey) {
      const existing = await findPaymentByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        return {
          success: true,
          paymentId: existing.id,
          redirectUrl: undefined,
        };
      }
    }

    // 5. Get provider
    const providerId = input.providerId ?? getDefaultProvider(country);
    const provider = getPaymentProvider(providerId);
    if (!provider) {
      return { success: false, error: "Payment provider not available" };
    }

    // 6. Verify provider supports country
    if (!provider.supportedCountries.includes(country)) {
      return { success: false, error: `Provider does not support ${country}` };
    }

    // 7. Verify currency
    if (!provider.supportedCurrencies.includes(order.currency)) {
      return { success: false, error: `Provider does not support ${order.currency}` };
    }

    // 8. Create payment record
    const payment = await createPayment({
      orderId: order.id,
      provider: provider.id,
      country,
      currency: order.currency,
      amount: Number(order.total),
      idempotencyKey: input.idempotencyKey,
    });

    if (!payment) {
      return { success: false, error: "Failed to create payment record" };
    }

    // 9. Initialize with provider
    const result = await provider.initialize({
      orderId: order.id,
      amount: Number(order.total),
      currency: order.currency,
      country,
      customerEmail: order.customer.email,
      customerName: order.customer.name,
      callbackUrl: `${process.env.APP_URL || "http://localhost:3000"}/api/payments/callback`,
    });

    if (!result.success) {
      await updatePaymentStatus(payment.id, "FAILED", {
        failureReason: result.error,
      });
      return { success: false, error: result.error };
    }

    // 10. Update payment with provider reference
    if (result.providerReference) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerReference: result.providerReference },
      });
    }

    return {
      success: true,
      paymentId: payment.id,
      redirectUrl: result.redirectUrl,
      clientSecret: result.clientSecret,
    };
  } catch (error) {
    console.error("[payment] Initiation failed:", error);
    return { success: false, error: "Payment initiation failed" };
  }
}

/**
 * Verify a payment after customer returns from provider.
 */
export async function verifyPayment(paymentId: string, providerReference: string): Promise<PaymentVerifyResult> {
  try {
    const payment = await findPaymentById(paymentId);
    if (!payment) {
      return { success: false, status: "FAILED", error: "Payment not found" };
    }

    // Already verified
    if (payment.status === "SUCCEEDED") {
      return { success: true, status: "SUCCEEDED", providerTransactionId: payment.providerTransactionId ?? undefined };
    }

    const provider = getPaymentProvider(payment.provider as PaymentProviderId);
    if (!provider) {
      return { success: false, status: "FAILED", error: "Provider not found" };
    }

    const result = await provider.verify({
      paymentId,
      providerReference,
    });

    // Update payment status
    if (result.success) {
      await updatePaymentStatus(paymentId, result.status, {
        providerTransactionId: result.providerTransactionId,
        verifiedAt: new Date(),
      });

      // Update order payment status if succeeded
      if (result.status === "SUCCEEDED") {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "PAID", paidAt: new Date() },
        });
      }
    } else {
      await updatePaymentStatus(paymentId, "FAILED", {
        failureReason: result.error,
      });
    }

    return result;
  } catch (error) {
    console.error("[payment] Verification failed:", error);
    return { success: false, status: "FAILED", error: "Verification failed" };
  }
}

/**
 * Process a webhook from a payment provider.
 */
export async function processWebhook(payload: WebhookPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = getPaymentProvider(payload.provider);
    if (!provider) {
      return { success: false, error: "Unknown provider" };
    }

    // Verify signature
    if (payload.signature && !provider.verifyWebhookSignature(JSON.stringify(payload.data), payload.signature)) {
      return { success: false, error: "Invalid signature" };
    }

    const result = await provider.processWebhook(payload);

    if (result.success && result.paymentId) {
      const payment = await findPaymentById(result.paymentId);
      if (payment) {
        // Idempotency: check if already processed
        if (payment.status === result.newStatus) {
          return { success: true }; // Already processed
        }

        await updatePaymentStatus(result.paymentId, result.newStatus || "FAILED");

        if (result.newStatus === "SUCCEEDED") {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: "PAID", paidAt: new Date() },
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[payment] Webhook processing failed:", error);
    return { success: false, error: "Webhook processing failed" };
  }
}

/**
 * Get available payment providers for a country.
 */
export function getAvailableProviders(country: "BH" | "PK"): string[] {
  return getProvidersForCountry(country);
}