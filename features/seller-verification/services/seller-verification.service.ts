import "server-only";

import { prisma } from "@/lib/prisma";
import type { CountryCode } from "@/lib/countries/types";

export interface SellerVerificationDto {
  id: string;
  sellerId: string;
  region: string;
  status: string;
  documents: unknown;
  notes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get seller verification status for a country.
 */
export async function getSellerVerification(
  sellerId: string,
  country: CountryCode,
): Promise<SellerVerificationDto | null> {
  const region = country === "BH" ? "BAHRAIN" : "PAKISTAN";
  try {
    const record = await prisma.sellerVerification.findFirst({
      where: { sellerId, region: region as any },
      orderBy: { createdAt: "desc" },
    });
    if (!record) return null;
    return {
      id: record.id,
      sellerId: record.sellerId,
      region: record.region,
      status: record.status,
      documents: record.documents,
      notes: record.notes,
      reviewedBy: record.reviewedBy,
      reviewedAt: record.reviewedAt?.toISOString() ?? null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Submit verification documents for a seller.
 */
export async function submitVerification(
  sellerId: string,
  country: CountryCode,
  documents: unknown,
): Promise<SellerVerificationDto | null> {
  const region = country === "BH" ? "BAHRAIN" : "PAKISTAN";
  try {
    const record = await prisma.sellerVerification.create({
      data: {
        sellerId,
        region: region as any,
        status: "PENDING",
        documents: documents as any,
      },
    });
    return {
      id: record.id,
      sellerId: record.sellerId,
      region: record.region,
      status: record.status,
      documents: record.documents,
      notes: record.notes,
      reviewedBy: record.reviewedBy,
      reviewedAt: record.reviewedAt?.toISOString() ?? null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Approve or reject a seller verification (admin).
 */
export async function reviewVerification(
  verificationId: string,
  status: "APPROVED" | "REJECTED",
  adminId: string,
  notes?: string,
): Promise<boolean> {
  try {
    await prisma.sellerVerification.update({
      where: { id: verificationId },
      data: {
        status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        notes,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all pending verifications for a country (admin).
 */
export async function getPendingVerifications(country: CountryCode): Promise<SellerVerificationDto[]> {
  const region = country === "BH" ? "BAHRAIN" : "PAKISTAN";
  try {
    const records = await prisma.sellerVerification.findMany({
      where: { region: region as any, status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });
    return records.map((r) => ({
      id: r.id,
      sellerId: r.sellerId,
      region: r.region,
      status: r.status,
      documents: r.documents,
      notes: r.notes,
      reviewedBy: r.reviewedBy,
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}