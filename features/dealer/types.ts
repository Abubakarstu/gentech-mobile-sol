export interface DealerDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  businessName: string | null;
  businessType: string | null;
  taxNumber: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING" | "REJECTED";
  plan: "BASIC" | "PREMIUM" | "ENTERPRISE";
  planExpiresAt: string | null;
  featuredUntil: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  reviewNote: string | null;
  listingCount: number;
  soldCount: number;
  rating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealerApplicationDto extends DealerDto {
  owner: { name: string; email: string } | null;
}

export interface DealerBranchDto {
  id: string;
  dealerId: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DealerInventoryDto {
  id: string;
  dealerId: string;
  listingId: string | null;
  sku: string | null;
  stockCount: number;
  location: string | null;
  costPrice: number | null;
  acquiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealerUserDto {
  id: string;
  dealerId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
}

export interface CreateDealerInput {
  name: string;
  description?: string;
  businessName?: string;
  businessType?: string;
  taxNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateDealerInput {
  name?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  businessName?: string;
  businessType?: string;
  taxNumber?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateBranchInput {
  dealerId: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddInventoryInput {
  dealerId: string;
  listingId?: string;
  sku?: string;
  stockCount: number;
  location?: string;
  costPrice?: number;
}
