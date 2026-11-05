import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Clock,
  Flag,
  Package,
  ShoppingBag,
  Smartphone,
  Store,
  Tag,
  UserPlus,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStats } from "@/features/admin/services/admin.service";
import { getCurrentUser } from "@/lib/session";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin — Overview",
  robots: { index: false, follow: false },
};

const WORKSPACES = [
  {
    title: "Marketing & leads",
    description: "Campaigns, dealer leads, and acquisition performance.",
    href: "/admin/marketing",
    label: "Growth",
  },
  {
    title: "Customer support",
    description: "Support inbox, response targets, and customer resolutions.",
    href: "/admin/support",
    label: "Service",
  },
  {
    title: "Payments",
    description: "Transactions, refunds, payouts, and reconciliation.",
    href: "/admin/payments",
    label: "Finance",
  },
  {
    title: "Editorial",
    description: "Phone guides, news, and search-ready content.",
    href: "/admin/blogs",
    label: "Content",
  },
];

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  const isDemo = user?.id === "demo:admin";
  const stats = isDemo ? null : await getStats();

  const cards = [
    {
      icon: Clock,
      label: "Pending Approvals",
      value: stats?.pendingListings,
      href: `${ROUTES.adminListings}?status=PENDING_APPROVAL`,
      highlight: (stats?.pendingListings ?? 0) > 0,
    },
    {
      icon: Tag,
      label: "Active listings",
      value: stats?.activeListings,
      href: `${ROUTES.adminListings}?status=ACTIVE`,
    },
    {
      icon: ShoppingBag,
      label: "Sold mobiles",
      value: stats?.soldListings,
      href: `${ROUTES.adminListings}?status=SOLD`,
    },
    { icon: Users, label: "Total customers", value: stats?.totalUsers, href: ROUTES.adminUsers },
    {
      icon: Smartphone,
      label: "Catalog Models",
      value: stats?.totalModels,
      href: "/admin/models",
    },
    {
      icon: Store,
      label: "Registered Dealers",
      value: stats?.totalDealers,
      href: "/admin/dealers",
    },
    { icon: Flag, label: "Open reports", value: stats?.openReports, href: ROUTES.adminReports },
    {
      icon: UserPlus,
      label: "New customers · 7d",
      value: stats?.newUsers7d,
      href: ROUTES.adminUsers,
    },
    {
      icon: Package,
      label: "Total listings",
      value: stats?.totalListings,
      href: ROUTES.adminListings,
    },
  ];

  return (
    <div className="space-y-9">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-500 uppercase">
            Marketplace Command Center
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Good to see you, {user?.name?.split(" ")[0] ?? "Admin"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Real-time classified marketplace operations, approval queues, and catalog health.
          </p>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
          Pakistan Mobile Classifieds
        </span>
      </section>

      {/* Moderation Alert Banner if listings are waiting */}
      {stats && stats.pendingListings > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">
                {stats.pendingListings} mobile advertisement{stats.pendingListings > 1 ? "s" : ""} waiting for approval
              </p>
              <p className="text-xs text-amber-300/80">
                Review photos, specifications, and pricing before publishing to the public feed.
              </p>
            </div>
          </div>
          <Link
            href={`${ROUTES.adminListings}?status=PENDING_APPROVAL`}
            className="rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors"
          >
            Review Queue →
          </Link>
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Marketplace Health & Metrics</h2>
            <p className="mt-1 text-xs text-slate-500">
              {isDemo
                ? "Preview mode · live database metrics are unavailable"
                : "Live operational metrics"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cards.map(({ icon: Icon, label, value, href, highlight }) => (
            <Link key={label} href={href} className="rounded-xl outline-none focus-visible:ring-2">
              <Card
                className={`h-full border-white/10 bg-[#141519] shadow-sm shadow-black/20 transition-colors hover:border-emerald-400/40 ${
                  highlight ? "border-amber-500/40 bg-amber-500/[0.04]" : ""
                }`}
              >
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-slate-400">{label}</CardTitle>
                  <Icon
                    className={`size-4 ${
                      highlight ? "text-amber-400" : "text-emerald-400"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      highlight ? "text-amber-300" : "text-slate-100"
                    }`}
                  >
                    {value === undefined ? "—" : value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-100">Business Workspaces</h2>
          <p className="mt-1 text-xs text-slate-500">
            Marketing, customer service, finance, and content operations.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {WORKSPACES.map((workspace) => (
            <Link
              key={workspace.href}
              href={workspace.href}
              className="group rounded-xl border border-white/10 bg-[#141519] p-5 shadow-sm shadow-black/20 transition-colors hover:border-emerald-400/40"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                  {workspace.label}
                </span>
                <ArrowUpRight className="size-4 text-slate-500 transition-colors group-hover:text-emerald-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-100">{workspace.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{workspace.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
