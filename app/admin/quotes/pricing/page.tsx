import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import {
  getDeductionRules,
  getMultipliers,
  getPriceBook,
} from "@/features/quotes/services/quote.service";
import { AdminPriceBook } from "@/features/quotes/components/admin-price-book";
import { AdminDeductionRules } from "@/features/quotes/components/admin-deduction-rules";
import { AdminGradeMultipliers } from "@/features/quotes/components/admin-grade-multipliers";

export const metadata: Metadata = { title: "Quote Pricing · Admin" };

export default async function AdminQuotePricingPage() {
  const admin = await requireAdmin();
  if (!admin) redirect(ROUTES.dashboard);

  const [models, rules, multipliers] = await Promise.all([
    getPriceBook(),
    getDeductionRules(),
    getMultipliers(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <Link
          href={ROUTES.adminQuotes}
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Quotes
        </Link>
        <h2 className="text-xl font-semibold">Pricing &amp; rules</h2>
        <p className="text-muted-foreground text-sm">
          Everything that drives an instant quote — all editable, and applied to future quotes only.
        </p>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">Grade multipliers</h3>
        <AdminGradeMultipliers multipliers={multipliers} />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">Deduction rules</h3>
        <AdminDeductionRules rules={rules} />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">Price book</h3>
        <AdminPriceBook models={models} />
      </section>
    </div>
  );
}
