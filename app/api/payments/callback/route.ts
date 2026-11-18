import { NextResponse } from "next/server";
import { verifyPayment } from "@/features/payments/services/payment.service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get("paymentId");
    const providerReference = url.searchParams.get("providerReference") || url.searchParams.get("providerReference") || "";

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const result = await verifyPayment(paymentId, providerReference);

    if (result.success) {
      return NextResponse.redirect(
        `${process.env.APP_URL || "http://localhost:3000"}/dashboard/orders?payment=success`,
      );
    } else {
      return NextResponse.redirect(
        `${process.env.APP_URL || "http://localhost:3000"}/dashboard/orders?payment=failed`,
      );
    }
  } catch (error) {
    return NextResponse.redirect(
      `${process.env.APP_URL || "http://localhost:3000"}/dashboard/orders?payment=error`,
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { processWebhook } = await import("@/features/payments/services/payment.service");
    const result = await processWebhook(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}