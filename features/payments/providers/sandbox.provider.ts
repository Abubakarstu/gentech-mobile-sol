import "server-only";

import type { PaymentProvider, PaymentInitParams, PaymentInitResult, PaymentVerifyParams, PaymentVerifyResult, PaymentRefundParams, PaymentRefundResult, WebhookPayload, WebhookResult } from "../types";

/**
 * Sandbox payment provider.
 * Simulates payment processing for development and testing.
 * Never charges real money.
 *
 * All sandbox transactions are clearly marked as simulated.
 */
export const sandboxProvider: PaymentProvider = {
  id: "sandbox",
  name: "Sandbox (Simulated)",
  supportedCountries: ["BH", "PK"],
  supportedCurrencies: ["BHD", "PKR"],

  async initialize(params: PaymentInitParams): Promise<PaymentInitResult> {
    // Simulate payment initialization
    const paymentId = `sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      success: true,
      paymentId,
      redirectUrl: `/api/payments/sandbox/callback?paymentId=${paymentId}&orderId=${params.orderId}`,
      providerReference: paymentId,
    };
  },

  async verify(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    // Simulate verification — always succeeds in sandbox
    return {
      success: true,
      status: "SUCCEEDED",
      providerTransactionId: params.providerReference,
      amount: 0,
      currency: "PKR",
    };
  },

  async refund(params: PaymentRefundParams): Promise<PaymentRefundResult> {
    return {
      success: true,
      refundId: `refund_${Date.now()}`,
    };
  },

  async processWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    return {
      success: true,
      paymentId: payload.data.paymentId as string,
      newStatus: "SUCCEEDED",
    };
  },

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Sandbox doesn't verify signatures
    return true;
  },
};