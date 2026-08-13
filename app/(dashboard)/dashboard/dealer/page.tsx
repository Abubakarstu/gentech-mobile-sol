import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Users, Package, MapPin, TrendingUp } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { getCurrentSession } from "@/lib/session";
import { getUserDealer, getDealerStats } from "@/features/dealer/services/dealer.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { 
  title: "Dealer Dashboard",
  robots: { index: false, follow: false },
};

export default async function DealerDashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect(ROUTES.signIn);

  const { user } = session;
  const dealer = await getUserDealer(user.id);
  
  if (!dealer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dealer Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your dealership</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Not a Dealer</CardTitle>
            <CardDescription>
              You don&apos;t have a dealer account yet. Apply to become a dealer to access advanced features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${ROUTES.dashboard}/dealer/apply`}>
              <Badge variant="outline" className="cursor-pointer">
                Apply for Dealer Account
              </Badge>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = await getDealerStats(dealer.id);

  const dashboardStats = [
    {
      icon: Package,
      label: "Total Listings",
      value: String(stats.totalListings),
      hint: "Active and inactive listings",
    },
    {
      icon: Users,
      label: "Staff Members",
      value: String(stats.staffCount),
      hint: "Active team members",
    },
    {
      icon: MapPin,
      label: "Branches",
      value: String(stats.branchCount),
      hint: "Operating locations",
    },
    {
      icon: TrendingUp,
      label: "Items Sold",
      value: String(stats.soldCount),
      hint: "Total sales count",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{dealer.name}</h1>
          <p className="text-muted-foreground text-sm">{dealer.businessName || dealer.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={dealer.status === "ACTIVE" ? "default" : "secondary"}>
            {dealer.status}
          </Badge>
          {dealer.isVerified && (
            <Badge variant="outline" className="text-green-600 dark:text-green-400">
              Verified
            </Badge>
          )}
          <Badge variant="outline">{dealer.plan}</Badge>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map(({ icon: Icon, label, value, hint }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <CardDescription>{hint}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`${ROUTES.dashboard}/dealer/profile`}>
              <Badge variant="outline" className="cursor-pointer w-full justify-center py-2">
                <Building2 className="mr-2 size-4" />
                Edit Profile
              </Badge>
            </Link>
            <Link href={`${ROUTES.dashboard}/dealer/branches`}>
              <Badge variant="outline" className="cursor-pointer w-full justify-center py-2">
                <MapPin className="mr-2 size-4" />
                Manage Branches
              </Badge>
            </Link>
            <Link href={`${ROUTES.dashboard}/dealer/inventory`}>
              <Badge variant="outline" className="cursor-pointer w-full justify-center py-2">
                <Package className="mr-2 size-4" />
                Manage Inventory
              </Badge>
            </Link>
            <Link href={`${ROUTES.dashboard}/dealer/staff`}>
              <Badge variant="outline" className="cursor-pointer w-full justify-center py-2">
                <Users className="mr-2 size-4" />
                Manage Staff
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dealer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Name:</span>
              <span className="font-medium">{dealer.businessName || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Type:</span>
              <span className="font-medium">{dealer.businessType || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{dealer.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{dealer.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">City:</span>
              <span className="font-medium">{dealer.city || "—"}</span>
            </div>
            {dealer.planExpiresAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan Expires:</span>
                <span className="font-medium">
                  {new Date(dealer.planExpiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
