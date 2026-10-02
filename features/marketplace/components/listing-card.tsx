import Link from "next/link";
import { MapPin, Smartphone, ShieldCheck, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { LISTING_CONDITION_LABELS } from "@/lib/constants";
import { formatPrice, formatRelativeTime } from "@/utils/format";
import type { ListingCardData } from "@/types/marketplace";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "./favorite-button";

/** Deterministic gradient per listing so the demo tiles look varied but stable. */
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

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const href = `/listings/${listing.slug}`;

  return (
    <article className="group bg-card relative overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
      <Link href={href} className="block">
        {/* Thumbnail */}
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

          <div className="absolute top-2 left-2 flex gap-1">
            {listing.isFeatured && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                Featured
              </Badge>
            )}
            {listing.ptaStatus === "PTA_APPROVED" && (
              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50/90 backdrop-blur text-xs">
                <CheckCircle2 className="mr-0.5 size-3" />
                PTA
              </Badge>
            )}
            {listing.cpidStatus === "CPID_APPROVED" && (
              <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50/90 backdrop-blur text-xs">
                <CheckCircle2 className="mr-0.5 size-3" />
                CPID
              </Badge>
            )}
            {listing.isInspected && (
              <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50/90 backdrop-blur text-xs">
                <ShieldCheck className="mr-0.5 size-3" />
                Inspected
              </Badge>
            )}
            {listing.isVerifiedSeller && (
              <Badge variant="outline" className="border-sky-500 text-sky-700 bg-sky-50/90 backdrop-blur text-xs">
                <ShieldCheck className="mr-0.5 size-3" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="space-y-2 p-3">
          <p className="text-primary text-base font-bold">
            {formatPrice(listing.price, { currency: listing.currency })}
          </p>
          <h3 className="line-clamp-2 text-sm leading-snug font-medium">{listing.title}</h3>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="font-normal">
              {LISTING_CONDITION_LABELS[listing.condition]}
            </Badge>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="size-3 shrink-0" />
              {listing.city}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            {listing.storage && <span>{listing.storage}GB</span>}
            {listing.ram && <span>• {listing.ram}GB RAM</span>}
            {listing.batteryHealth && <span>• {listing.batteryHealth}% Battery</span>}
          </div>

          <p className="text-muted-foreground text-xs">{formatRelativeTime(listing.createdAt)}</p>
        </div>
      </Link>

      <FavoriteButton className="absolute top-2 right-2" />
    </article>
  );
}
