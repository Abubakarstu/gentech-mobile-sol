import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { AdminModulePage } from "@/features/admin/components/admin-module-page";

export const metadata: Metadata = {
  title: "Business analytics — Admin",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return (
    <AdminModulePage
      eyebrow="Business intelligence"
      title="Marketplace analytics"
      description="Measure marketplace liquidity and service quality—not just page views—using privacy-conscious, clearly defined business metrics."
      icon={BarChart3}
      metrics={[
        { label: "Active listings", value: "—", detail: "Existing marketplace dashboard" },
        { label: "Buyer enquiries", value: "—", detail: "Connect conversation aggregates" },
        {
          label: "Listing-to-sale rate",
          value: "—",
          detail: "Sale confirmation is not modeled yet",
        },
        { label: "Service revenue", value: "—", detail: "Connect verified finance ledger" },
      ]}
      workflows={[
        {
          title: "Marketplace health",
          description:
            "Listings by city, brand, condition, age, price range, and enquiry activity.",
        },
        {
          title: "Funnel and cohort reporting",
          description:
            "Aggregate discovery, signup, listing, enquiry, and verified conversion events.",
        },
        {
          title: "Finance and growth attribution",
          description: "Reconcile realized service fees to approved campaigns and source channels.",
        },
      ]}
      connectedTo={[
        "Consented analytics events",
        "Marketplace listing and conversation aggregates",
        "Verified finance ledger and campaign tags",
      ]}
      relatedHref="/admin"
      relatedLabel="Return to admin overview"
    />
  );
}
