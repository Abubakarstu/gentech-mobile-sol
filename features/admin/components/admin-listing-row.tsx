"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, Loader2, MoreVertical, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  type ListingStatus,
} from "@/lib/constants";
import { formatPrice, formatRelativeTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListingStatusBadge } from "@/features/seller/components/listing-status-badge";
import type { AdminListingRow as AdminListingRowData } from "@/features/admin/types";
import {
  adminDeleteListingAction,
  adminSetListingStatusAction,
  approveListingAction,
  rejectListingAction,
} from "@/features/admin/actions/admin.actions";

const STATUS_OPTIONS: ListingStatus[] = [
  LISTING_STATUSES.ACTIVE,
  LISTING_STATUSES.SOLD,
  LISTING_STATUSES.DRAFT,
  LISTING_STATUSES.EXPIRED,
];

export function AdminListingRow({ listing }: { listing: AdminListingRowData }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectPending, setRejectPending] = React.useState(false);

  const isPendingApproval = listing.status === LISTING_STATUSES.PENDING_APPROVAL;

  async function run(action: () => Promise<{ ok: boolean; error?: string }>, message: string) {
    setPending(true);
    const result = await action();
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Action failed.");
      return;
    }
    toast.success(message);
    router.refresh();
  }

  async function handleApprove() {
    setPending(true);
    const result = await approveListingAction({ listingId: listing.id });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Failed to approve listing.");
      return;
    }
    toast.success("Listing approved and published.");
    router.refresh();
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (rejectReason.trim().length < 5) {
      toast.error("Please provide a rejection reason (min 5 characters).");
      return;
    }
    setRejectPending(true);
    const result = await rejectListingAction({ listingId: listing.id, reason: rejectReason.trim() });
    setRejectPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Failed to reject listing.");
      return;
    }
    toast.success("Listing rejected and seller notified.");
    setShowRejectDialog(false);
    setRejectReason("");
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/listings/${listing.slug}`}
            className="hover:text-primary line-clamp-1 font-medium"
          >
            {listing.title}
          </Link>
          <p className="text-muted-foreground truncate text-xs">
            {listing.sellerName} · {listing.city}
          </p>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <ListingStatusBadge status={listing.status} />
            <span className="text-foreground font-semibold">
              {formatPrice(listing.price, { currency: listing.currency })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {listing.views.toLocaleString()}
            </span>
            <span>{formatRelativeTime(listing.createdAt)}</span>
          </div>
        </div>

        {/* Quick approve/reject buttons for pending listings */}
        {isPendingApproval && (
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold gap-1 px-3"
              onClick={handleApprove}
              disabled={pending}
              title="Approve listing"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-rose-500/40 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 gap-1 px-3"
              onClick={() => setShowRejectDialog(true)}
              disabled={pending}
              title="Reject listing"
            >
              <X className="size-3.5" />
              Reject
            </Button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label={`Actions for ${listing.title}`}
                disabled={pending}
              />
            }
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MoreVertical className="size-4" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/listings/${listing.slug}`} />}>
              <Eye className="size-4" />
              View listing
            </DropdownMenuItem>
            {isPendingApproval && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Approval</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleApprove}>
                  <Check className="size-4 text-emerald-500" />
                  Approve listing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowRejectDialog(true)}>
                  <X className="size-4 text-rose-500" />
                  Reject listing
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Set status</DropdownMenuLabel>
            {STATUS_OPTIONS.filter((s) => s !== listing.status).map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() =>
                  run(
                    () => adminSetListingStatusAction({ listingId: listing.id, status }),
                    `Status set to ${LISTING_STATUS_LABELS[status]}`,
                  )
                }
              >
                {LISTING_STATUS_LABELS[status]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                if (!window.confirm("Remove this listing? This soft-deletes it.")) return;
                void run(
                  () => adminDeleteListingAction({ listingId: listing.id }),
                  "Listing removed",
                );
              }}
            >
              <Trash2 className="size-4" />
              Remove listing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRejectDialog(false);
          }}
        >
          <form
            onSubmit={handleReject}
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#141519] p-6 shadow-2xl space-y-4"
          >
            <div>
              <h2 className="text-base font-semibold text-white">Reject Listing</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide a reason so the seller can improve their listing.
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1 truncate">
                &quot;{listing.title}&quot;
              </p>
              <textarea
                className="w-full rounded-lg border border-white/10 bg-[#0e0f12] text-sm text-white placeholder:text-slate-500 p-3 focus:outline-none focus:ring-1 focus:ring-rose-400 resize-none"
                rows={4}
                placeholder="e.g. Photos are blurry and description is incomplete. Please upload clear images and provide accurate specs."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
                maxLength={500}
              />
              <p className="text-[11px] text-slate-500 text-right mt-0.5">{rejectReason.length}/500</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setShowRejectDialog(false); setRejectReason(""); }}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={rejectPending || rejectReason.trim().length < 5}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold"
              >
                {rejectPending ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                Reject Listing
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
