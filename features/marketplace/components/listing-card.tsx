"use client";

import { useTranslations } from "next-intl";
import { Check, GitCompareArrows, MapPin, Smartphone, ShieldCheck, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/localized-link";
import { useLocalizedRouteInfo } from "@/lib/localized-routing";
import { LISTING_CONDITION_LABELS } from "@/lib/constants";
import { formatPrice, formatRelativeTime } from "@/utils/format";
import type { ListingCardData } from "@/types/marketplace";
import { Badge } from "@/components/ui/badge";
import { useCompareSelection } from "@/features/compare/components/compare-selection-provider";
import { FavoriteButton } from "./favorite-button";

const GRADIENTS = [
  "from-violet-500/20 to-fuchsia-500/20",
  "from-sky-500/20 to-cyan-500/20",
  "from-emerald-500/20 to-teal-500/20",
  "from-amber-500/20 to-orange-500/20",
  "from-rose-500/20 to-pink-500/20",
  "from-indigo-500/20 to-blue-500/20",
];

function gradientFor(id: string): string {
  const sum = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length]!;
}

export function ListingCard({
  listing,
  isFavorite = false,
  isAuthenticated,
}: {
  listing: ListingCardData;
  isFavorite?: boolean;
  isAuthenticated: boolean;
}) {
  const t = useTranslations("listings");
  const tCompare = useTranslations("compare");
  const tCondition = useTranslations("condition");
  const { country, locale } = useLocalizedRouteInfo();
  const language = locale ?? "en";
  const showPakistanSignals = country === "PK";
  const { enabled, selected, selectionMode, max, toggle, selectOne } = useCompareSelection();
  const isSelected = selected.includes(listing.id);
  const isDisabled = !isSelected && selected.length >= max;

  const body = (
    <>
      <div
        className={cn("relative aspect-4/3 w-full bg-gradient-to-br", gradientFor(listing.id))}
      >
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-foreground/30 flex h-full flex-col items-center justify-center gap-2">
            <Smartphone className="size-10" />
            {listing.brand ? (
              <span className="text-foreground/50 text-sm font-medium">{listing.brand}</span>
            ) : null}
          </div>
        )}

        <div
          className={cn(
            "absolute top-2 flex flex-wrap gap-1",
            selectionMode ? "start-10 pe-1" : "start-2 pe-10 sm:pe-0",
          )}
        >
          {listing.isFeatured ? (
            <Badge className="bg-amber-500 text-white hover:bg-amber-500">{t("featured")}</Badge>
          ) : null}
          {showPakistanSignals && listing.ptaStatus === "PTA_APPROVED" ? (
            <Badge
              variant="outline"
              className="border-green-500 bg-green-50/90 text-xs text-green-700 backdrop-blur"
            >
              <CheckCircle2 className="me-0.5 size-3" />
              {t("ptaApproved")}
            </Badge>
          ) : null}
          {showPakistanSignals && listing.cpidStatus === "CPID_APPROVED" ? (
            <Badge
              variant="outline"
              className="border-blue-500 bg-blue-50/90 text-xs text-blue-700 backdrop-blur"
            >
              <CheckCircle2 className="me-0.5 size-3" />
              {t("cpidApproved")}
            </Badge>
          ) : null}
          {listing.isInspected ? (
            <Badge
              variant="outline"
              className="border-purple-500 bg-purple-50/90 text-xs text-purple-700 backdrop-blur"
            >
              <ShieldCheck className="me-0.5 size-3" />
              {t("inspected")}
            </Badge>
          ) : null}
          {listing.isVerifiedSeller ? (
            <Badge
              variant="outline"
              className="border-sky-500 bg-sky-50/90 text-xs text-sky-700 backdrop-blur"
            >
              <ShieldCheck className="me-0.5 size-3" />
              {t("verifiedSeller")}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 p-3">
        <p className="text-primary text-base font-bold">
          {formatPrice(listing.price, { currency: listing.currency, locale: language })}
        </p>
        <h3 className="line-clamp-2 text-sm leading-snug font-medium">{listing.title}</h3>

        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Badge variant="secondary" className="font-normal">
            {tCondition.has(listing.condition)
              ? tCondition(listing.condition)
              : LISTING_CONDITION_LABELS[listing.condition]}
          </Badge>
          <span className="flex items-center gap-1 truncate">
            <MapPin className="size-3 shrink-0" />
            {listing.city}
          </span>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          {listing.storage ? <span>{listing.storage} GB</span> : null}
          {listing.ram ? <span>{t("ramLabel", { value: listing.ram })}</span> : null}
          {listing.batteryHealth ? (
            <span>{t("batteryLabel", { value: listing.batteryHealth })}</span>
          ) : null}
        </div>

        <p className="text-muted-foreground text-xs">
          {formatRelativeTime(listing.createdAt, language)}
        </p>
      </div>
    </>
  );

  return (
    <article
      className={cn(
        "group bg-card relative overflow-hidden rounded-xl border transition-shadow hover:shadow-md",
        selectionMode && "cursor-pointer",
        isSelected && "ring-primary ring-2",
        isDisabled && "opacity-60",
      )}
    >
      {selectionMode ? (
        <button
          type="button"
          onClick={() => toggle(listing.id)}
          disabled={isDisabled}
          aria-pressed={isSelected}
          aria-label={isSelected ? tCompare("removeFromCompare") : tCompare("addToCompare")}
          className="block w-full text-start disabled:cursor-not-allowed"
        >
          {/*
           * The visual checkbox must live inside the toggle button: it is absolutely
           * positioned over the card and would otherwise intercept clicks without a
           * handler, making the checkbox itself unclickable.
           */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-2 start-2 z-10 flex size-6 items-center justify-center rounded-md border-2 shadow-sm",
              isSelected
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-background/90 border-muted-foreground/50",
            )}
          >
            {isSelected ? <Check className="size-4" /> : null}
          </span>
          {body}
        </button>
      ) : (
        <LocalizedLink href={`/listings/${listing.slug}`} className="block">
          {body}
        </LocalizedLink>
      )}

      {!selectionMode ? (
        <>
          {enabled ? (
            <button
              type="button"
              onClick={() => selectOne(listing.id)}
              title={tCompare("addToCompare")}
              aria-label={tCompare("addToCompare")}
              className="bg-background/90 hover:bg-background absolute top-2 end-11 z-10 rounded-md border p-1.5 shadow-sm"
            >
              <GitCompareArrows className="text-muted-foreground size-4" />
            </button>
          ) : null}
          <FavoriteButton
            listingId={listing.id}
            initialIsFavorite={isFavorite}
            isAuthenticated={isAuthenticated}
            className="absolute top-2 end-2"
          />
        </>
      ) : null}
    </article>
  );
}
