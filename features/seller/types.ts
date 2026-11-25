import type { ListingCondition, ListingStatus } from "@/lib/constants";
import type { ListingModelData } from "@/types/marketplace";

/** Aggregate engagement metrics for a seller's whole inventory. */
export interface SellerStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  /** How many times the seller's listings have been saved (favorited). */
  totalFavorites: number;
}

/** A management-view row for one of the seller's own listings. */
export interface SellerListingRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  condition: ListingCondition;
  city: string;
  status: ListingStatus;
  views: number;
  favorites: number;
  isFeatured: boolean;
  imageUrl?: string;
  /** Up to four images for the management thumbnail carousel. */
  imageUrls?: string[];
  /** Optional genuine 3D model supplied by the seller. */
  model3d?: ListingModelData | null;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp, present when status is SOLD. */
  soldAt?: string;
}
