import type { ListingCardData } from "@/types/marketplace";
import { ListingCard } from "./listing-card";

export function ListingsGrid({
  listings,
  favoriteIds = [],
  isAuthenticated = false,
  emptyMessage = "No listings yet. Be the first to post one.",
}: {
  listings: ListingCardData[];
  favoriteIds?: string[];
  isAuthenticated?: boolean;
  emptyMessage?: string;
}) {
  if (listings.length === 0) {
    return (
      <p className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  const favorites = new Set(favoriteIds);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isFavorite={favorites.has(listing.id)}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}
