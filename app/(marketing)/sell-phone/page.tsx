import type { Metadata } from "next";
import { Banknote, Camera, ClipboardList, Sparkles } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { getCatalog } from "@/features/quotes/services/quote.service";
import { QuoteWizard } from "@/features/quotes/components/quote-wizard";

export const metadata: Metadata = {
  title: "Sell Your Phone — Instant Quote",
  description:
    "Get an instant, AI-graded price for your used phone. Answer a few questions, upload 5 photos, and receive a fair price range in seconds — then we pick it up.",
};

const STEPS = [
  { icon: ClipboardList, title: "Answer a few questions", body: "Tell us the model, PTA status and condition." },
  { icon: Camera, title: "Upload 5 guided photos", body: "Follow the samples so we can grade accurately." },
  { icon: Sparkles, title: "AI grades your phone", body: "Our AI reviews the photos and your answers instantly." },
  { icon: Banknote, title: "Get a price & pickup", body: "See your range, accept, and we collect the phone." },
];

export default async function SellPhonePage() {
  const [catalog, user] = await Promise.all([getCatalog(), getCurrentUser()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <section className="text-center">
        <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium">
          <Sparkles className="size-4" />
          Instant AI Quote
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Sell your phone in minutes
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl">
          Answer a few questions, upload five photos, and get a fair price range instantly — graded
          by AI, honoured at pickup. چند سوالات کے جواب دیں اور فوری قیمت پائیں۔
        </p>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.title} className="bg-card rounded-xl border p-4 text-center">
            <div className="bg-primary/10 text-primary mx-auto grid size-10 place-items-center rounded-xl">
              <step.icon className="size-5" />
            </div>
            <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-1 text-xs">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <QuoteWizard catalog={catalog} isAuthenticated={Boolean(user)} />
      </section>
    </div>
  );
}
