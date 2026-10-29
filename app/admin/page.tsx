import type { Metadata } from "next";
import Link from "next/link";
import { Flag, Package, ShoppingBag, Tag, UserPlus, Users } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { getStats } from "@/features/admin/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { 
  title: "Admin — Overview",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (user?.id === "demo:admin") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {["Users", "Listings", "Reports", "Categories", "Inspections", "Promotions"].map(
            (label) => (
              <Card key={label}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Demo</div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Preview mode: database actions are unavailable.
        </p>
      </div>
    );
  }

  const stats = await getStats();

  const cards = [
    { icon: Users, label: "Total users", value: stats.totalUsers, href: ROUTES.adminUsers },
    { icon: UserPlus, label: "New (7 days)", value: stats.newUsers7d, href: ROUTES.adminUsers },
    { icon: Package, label: "Listings", value: stats.totalListings, href: ROUTES.adminListings },
    { icon: Tag, label: "Active", value: stats.activeListings, href: ROUTES.adminListings },
    { icon: ShoppingBag, label: "Sold", value: stats.soldListings, href: ROUTES.adminListings },
    { icon: Flag, label: "Open reports", value: stats.openReports, href: ROUTES.adminReports },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map(({ icon: Icon, label, value, href }) => (
        <Link key={label} href={href} className="rounded-xl outline-none focus-visible:ring-2">
          <Card className="hover:border-primary/40 transition-colors">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
