import type { Metadata } from "next";
import { Tag } from "lucide-react";

import { AdminModulePage } from "@/features/admin/components/admin-module-page";

export const metadata: Metadata = {
  title: "Promotions — Admin",
  robots: { index: false, follow: false },
};

export default function AdminPromotionsPage() {
  return (
    <AdminModulePage
      eyebrow="Marketplace growth"
      title="Promotions & plans"
      description="Manage featured listing plans, promotion eligibility, campaign windows, and provider-linked promotion purchases."
      icon={Tag}
      metrics={[
        { label: "Active promotions", value: "—", detail: "Connect promotion service" },
        { label: "Plans available", value: "—", detail: "Plan catalogue not loaded" },
        { label: "Payments pending", value: "—", detail: "Verify via payment ledger" },
        { label: "Expiring soon", value: "—", detail: "Promotion schedule not connected" },
      ]}
      workflows={[
        {
          title: "Promotion plan catalogue",
          description: "Set documented duration, price, eligibility, and placement for each plan.",
        },
        {
          title: "Eligibility and activation",
          description:
            "Activate a promotion only after verifying the linked listing and successful payment.",
        },
        {
          title: "Campaign review",
          description: "Track start/end dates, visibility, refunds, and promotion performance.",
        },
      ]}
      connectedTo={[
        "Promotion plan and listing API",
        "Verified payment transaction ledger",
        "Campaign analytics",
      ]}
      relatedHref="/admin/finance/integrations"
      relatedLabel="Review payment integrations"
    />
  );
}
