import type { Metadata } from "next";
import { Store } from "lucide-react";

import { AdminModulePage } from "@/features/admin/components/admin-module-page";

export const metadata: Metadata = {
  title: "Dealers — Admin",
  robots: { index: false, follow: false },
};

export default function AdminDealersPage() {
  return (
    <AdminModulePage
      eyebrow="Marketplace"
      title="Dealer management"
      description="Onboard and support professional mobile retailers, branches, inventory feeds, and dealer-generated leads."
      icon={Store}
      metrics={[
        { label: "Active dealers", value: "—", detail: "Connect dealer repository" },
        { label: "Applications to review", value: "—", detail: "No application queue connected" },
        { label: "Branches", value: "—", detail: "Dealer branch records not loaded" },
        { label: "Dealer leads", value: "—", detail: "Lead pipeline not connected" },
      ]}
      workflows={[
        {
          title: "Dealer onboarding",
          description: "Verify business identity, contact, ownership, and applicable documents.",
        },
        {
          title: "Branch management",
          description: "Review locations, authorized staff, and branch status changes.",
        },
        {
          title: "Lead and inventory health",
          description: "Monitor consented dealer leads and inventory-feed quality.",
        },
      ]}
      connectedTo={[
        "Dealer and dealer-user APIs",
        "Business verification process",
        "Dealer inventory and lead workflows",
      ]}
      relatedHref="/admin/listings"
      relatedLabel="Review marketplace listings"
    />
  );
}
