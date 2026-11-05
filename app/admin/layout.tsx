import { redirect } from "next/navigation";

import { AdminNav } from "@/features/admin/components/admin-nav";
import { requireAdmin } from "@/features/admin/lib/require-admin";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Authoritative authorization boundary for all `/admin` routes. The edge proxy does
 * an optimistic auth-cookie check; this layout enforces the ADMIN role before render.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect(ROUTES.dashboard);

  return (
    <div className="dark flex min-h-svh flex-col bg-[#0b0c0f] md:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-white/10 bg-[#101114] px-5 sm:px-8">
          <div>
            <p className="text-xs font-medium text-slate-500">GenTech / Admin</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-100">Business operations</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-semibold text-slate-200">{admin.name}</span>
              <span className="block text-[11px] text-slate-500">Administrator</span>
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-bold text-emerald-300">
              {admin.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9">{children}</main>
      </div>
    </div>
  );
}
