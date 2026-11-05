"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  BarChart3,
  BellRing,
  CreditCard,
  FileStack,
  FolderTree,
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageSquareText,
  Package,
  ShoppingCart,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Smartphone,
  Store,
  Tag,
  Users,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const GROUPS = [
  {
    label: "Workspace",
    links: [{ href: ROUTES.admin, label: "Overview", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Marketplace",
    links: [
      { href: ROUTES.adminUsers, label: "Customers", icon: Users },
      { href: ROUTES.adminListings, label: "Listings", icon: Package },
      { href: "/admin/brands", label: "Brands", icon: Tag },
      { href: "/admin/models", label: "Phone Models & Specs", icon: Smartphone },
      { href: "/admin/locations", label: "Locations & Cities", icon: MapPin },
      { href: "/admin/orders", label: "Orders & fulfilment", icon: ShoppingCart },
      { href: "/admin/shipments", label: "Shipping & handover", icon: ShoppingCart },
      { href: "/admin/dealers", label: "Dealers", icon: Store },
      { href: "/admin/promotions", label: "Promotions", icon: Tag },
      { href: "/admin/discounts", label: "Discounts & vouchers", icon: Tag },
      { href: ROUTES.adminReports, label: "Trust & safety", icon: ShieldCheck },
      { href: ROUTES.adminCategories, label: "Catalog", icon: FolderTree },
      { href: ROUTES.adminInspections, label: "Inspections", icon: ShieldCheck },
    ],
  },
  {
    label: "Growth",
    links: [
      { href: "/admin/marketing", label: "Marketing & leads", icon: Megaphone },
      { href: "/admin/blogs", label: "Editorial", icon: BookOpen },
      { href: "/admin/analytics", label: "Business analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Finance & ERP",
    links: [{ href: "/admin/finance", label: "Finance center", icon: CreditCard }],
  },
  {
    label: "Operations",
    links: [{ href: "/admin/support", label: "Customer support", icon: MessageSquareText }],
  },
  {
    label: "Platform",
    links: [{ href: "/admin/communications", label: "Notifications & email", icon: BellRing }],
  },
  {
    label: "Governance",
    links: [
      { href: "/admin/access", label: "Staff access", icon: Users },
      { href: "/admin/security", label: "Security center", icon: ShieldCheck },
      { href: "/admin/audit", label: "Audit trail", icon: ReceiptText },
      { href: "/admin/settings", label: "Marketplace settings", icon: Settings2 },
      { href: "/admin/integrations", label: "System integrations", icon: FileStack },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-[#08090b] text-slate-300 md:sticky md:top-0 md:h-svh md:w-64 md:border-r md:border-b-0">
      <Link
        href={ROUTES.admin}
        className="flex h-[72px] items-center gap-3 border-b border-white/10 px-6"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400 text-sm font-black text-slate-950">
          G
        </span>
        <span>
          <span className="block text-sm font-bold tracking-wide text-white">GenTech</span>
          <span className="block text-[11px] text-slate-400">Operations workspace</span>
        </span>
      </Link>

      <nav
        className="flex gap-4 overflow-x-auto px-3 py-3 md:block md:flex-1 md:space-y-7 md:overflow-x-hidden md:overflow-y-auto md:px-3 md:py-6"
        aria-label="Admin sections"
      >
        {GROUPS.map((group) => (
          <div key={group.label} className="shrink-0 md:space-y-2">
            <p className="hidden px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase md:block">
              {group.label}
            </p>
            <div className="flex gap-1 md:block md:space-y-1">
              {group.links.map((link) => {
                const { href, label, icon: Icon } = link;
                const active =
                  "exact" in link && link.exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors md:text-[13px]",
                      active
                        ? "bg-emerald-400 font-semibold text-slate-950"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Link
        href="/"
        className="hidden items-center justify-between border-t border-white/10 px-6 py-5 text-xs font-medium text-slate-400 transition-colors hover:text-white md:flex"
      >
        View marketplace <ArrowUpRight className="size-4" />
      </Link>
    </aside>
  );
}
