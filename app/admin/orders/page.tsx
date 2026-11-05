import type { Metadata } from "next";
import { AlertTriangle, ShoppingCart, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Orders & fulfilment — Admin",
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Marketplace operations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Orders & fulfilment</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          The current product is a buyer-to-seller listing marketplace. This order workspace is
          prepared for a future managed-checkout flow, not a live order ledger.
        </p>
      </header>
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
          <p className="text-xs leading-5 text-amber-100/80">
            <strong className="font-semibold text-amber-200">
              No order or shipment model is connected.
            </strong>{" "}
            Listings and messages do not prove a sale. Before enabling checkout, define order state
            transitions, buyer/seller obligations, payment authorization/capture, cancellation,
            refund, dispute, delivery evidence, and accounting events.
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          {
            icon: ShoppingCart,
            title: "Order lifecycle",
            text: "Draft → awaiting payment → paid → processing → completed, with explicit cancellation, expiry, refund, and dispute states.",
          },
          {
            icon: Truck,
            title: "Delivery & handover",
            text: "Define pickup or courier modes, tracking evidence, handover confirmation, loss claims, and service boundaries.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <section key={title} className="rounded-xl border border-white/10 bg-[#141519] p-5">
            <Icon className="size-5 text-emerald-400" />
            <h2 className="mt-3 text-sm font-semibold text-slate-100">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-slate-400">{text}</p>
          </section>
        ))}
      </div>
      <section className="overflow-hidden rounded-xl border border-white/10 bg-[#141519]">
        <div className="border-b border-white/[0.07] p-4">
          <h2 className="text-sm font-semibold text-slate-100">Order register</h2>
          <p className="mt-1 text-xs text-slate-500">
            Empty until an order domain and checkout API are implemented.
          </p>
        </div>
        <div className="px-4 py-12 text-center">
          <ShoppingCart className="mx-auto size-6 text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-300">No order records connected</p>
          <p className="mt-1 text-xs text-slate-500">
            This workspace does not infer transactions from listing status.
          </p>
        </div>
      </section>
    </div>
  );
}
