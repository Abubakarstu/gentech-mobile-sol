import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CircleDashed, LockKeyhole } from "lucide-react";

type AdminModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  metrics: { label: string; value: string; detail: string }[];
  workflows: { title: string; description: string }[];
  connectedTo: string[];
  relatedHref: string;
  relatedLabel: string;
};

export function AdminModulePage({
  eyebrow,
  title,
  description,
  icon: Icon,
  metrics,
  workflows,
  connectedTo,
  relatedHref,
  relatedLabel,
}: AdminModulePageProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300">
          <CircleDashed className="size-3.5" /> Setup required
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <section
            key={metric.label}
            className="rounded-xl border border-white/10 bg-[#141519] p-5 shadow-sm shadow-black/20"
          >
            <p className="text-xs font-medium text-slate-400">{metric.label}</p>
            <p className="mt-3 text-2xl font-bold text-slate-100">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="overflow-hidden rounded-xl border border-white/10 bg-[#141519] shadow-sm shadow-black/20">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
              <Icon className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Workflows in this workspace</h2>
              <p className="mt-0.5 text-xs text-slate-500">Operational areas ready to configure</p>
            </div>
          </div>
          <div className="divide-y divide-white/[0.07]">
            {workflows.map((workflow) => (
              <div
                key={workflow.title}
                className="flex items-start justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">{workflow.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{workflow.description}</p>
                </div>
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-slate-600" />
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border border-white/10 bg-[#141519] p-5 shadow-sm shadow-black/20">
          <h2 className="text-sm font-semibold text-slate-100">Connect your operations</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            This workspace is a setup-ready interface. No campaigns, cases, payments, or articles
            are fabricated or changed until a data source is connected.
          </p>
          <div className="mt-5 space-y-3">
            {connectedTo.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="size-1.5 rounded-full bg-amber-400" />
                {item}
              </div>
            ))}
          </div>
          <Link
            href={relatedHref}
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            {relatedLabel} <ArrowRight className="size-3.5" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
