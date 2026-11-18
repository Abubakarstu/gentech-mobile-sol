import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAllowedTransitions } from "@/features/orders/services/order-status.service";
import { OrderStatusUpdate } from "@/components/orders/order-status-update";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  CONFIRMED: "text-blue-400",
  PROCESSING: "text-purple-400",
  SHIPPED: "text-indigo-400",
  DELIVERED: "text-green-400",
  CANCELLED: "text-red-400",
  REFUNDED: "text-orange-400",
};

export default async function SellerOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.signIn);

  // Get orders containing this seller's products
  const orderItems = await prisma.orderItem.findMany({
    where: {
      listing: { sellerId: user.id },
    },
    include: {
      order: {
        include: {
          customer: { select: { name: true, email: true } },
        },
      },
      listing: { select: { title: true, sellerId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by order
  type SellerOrder = (typeof orderItems)[number]["order"];
  const ordersMap = new Map<string, {
    order: SellerOrder;
    items: typeof orderItems;
  }>();

  for (const item of orderItems) {
    if (!ordersMap.has(item.orderId)) {
      ordersMap.set(item.orderId, { order: item.order, items: [] });
    }
    ordersMap.get(item.orderId)!.items.push(item);
  }

  const orders = Array.from(ordersMap.values());

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Seller Orders</h1>
      <p className="mt-2 text-sm text-slate-400">
        Orders containing your products. Update status for your items.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-[#141519]/60 px-5 py-12 text-center">
          <p className="text-sm font-semibold text-slate-200">No orders yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Orders containing your products will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map(({ order, items }) => {
            const allowedTransitions = getAllowedTransitions(order.status, "SELLER");
            return (
              <div
                key={order.id}
                className="rounded-xl border border-white/[0.08] bg-[#141519] p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-400">
                      Customer: {order.customer.name} ({order.customer.email})
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${STATUS_COLORS[order.status] || "text-slate-400"}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {order.region === "BAHRAIN" ? "🇧🇭" : "🇵🇰"} {order.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Items from this seller */}
                <div className="mt-3 space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0e0f12] p-3"
                    >
                      <div>
                        <p className="text-sm text-white">{item.title}</p>
                        <p className="text-xs text-slate-400">
                          {Number(item.unitPrice).toFixed(order.currency === "BHD" ? 3 : 0)} {item.currency} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {Number(item.lineTotal).toFixed(order.currency === "BHD" ? 3 : 0)} {item.currency}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Delivery info */}
                {order.deliveryAddress && (
                  <div className="mt-3 rounded-lg border border-white/[0.06] bg-[#0e0f12] p-3">
                    <p className="text-xs font-medium text-slate-300">Delivery</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {order.shippingMethod || "Standard"} — {order.estimatedDays || "?"} days
                    </p>
                  </div>
                )}

                {/* Status update controls */}
                <OrderStatusUpdate
                  orderId={order.id}
                  allowedTransitions={allowedTransitions}
                  statusLabels={STATUS_LABELS}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}