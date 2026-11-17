import { NextResponse } from "next/server";
import { verifyPayment } from "@/features/payments/services/payment.service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get("paymentId");
    const orderId = url.searchParams.get("orderId");

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    // In sandbox mode, automatically verify as successful
    const result = await verifyPayment(paymentId, paymentId);

    const redirectUrl = result.success
      ? `${process.env.APP_URL || "http://localhost:3000"}/dashboard/orders?payment=success&orderId=${orderId}`
      : `${process.env.APP_URL || "http://localhost:3000"}/dashboard/orders?payment=failed&orderId=${orderId}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.redirect(
      `${process.env.APP_URL || "http://localhost:3000"}/dashboard/orders?payment=error`,
    );
  }
}