import { prisma } from '@/lib/prisma';
import type { ImeiVerification } from '@/lib/generated/prisma/client';
import {
  imeiVerificationResultSchema,
  type ImeiVerificationInput,
  type ImeiVerificationResult,
} from '../schemas/imei.schema';

export class ImeiVerificationService {
  /**
   * Verify IMEI status
   * Note: This is a placeholder implementation. In production, this would integrate
   * with the actual PTA/CPID verification APIs.
   */
  async verifyImei(
    input: ImeiVerificationInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ImeiVerificationResult> {
    // Check if already verified
    const existing = await prisma.imeiVerification.findUnique({
      where: { imei: input.imei },
    });

    if (existing) {
      return this.mapToResult(existing);
    }

    // Simulate PTA verification (replace with actual API call in production)
    const ptaResult = await this.checkPtaStatus(input.imei);
    const cpidResult = await this.checkCpidStatus(input.imei);

    // Create verification record
    const verification = await prisma.imeiVerification.create({
      data: {
        imei: input.imei,
        ptaStatus: ptaResult.status,
        cpidStatus: cpidResult.status,
        isStolen: ptaResult.isStolen,
        isBlacklisted: ptaResult.isBlacklisted,
        deviceModel: ptaResult.deviceModel,
        deviceBrand: ptaResult.deviceBrand,
        deviceColor: ptaResult.deviceColor,
        verifiedAt: new Date(),
        verifiedBy: userId,
        verificationSource: 'PTA',
        ipAddress,
        userAgent,
      },
    });

    return this.mapToResult(verification);
  }

  /**
   * Get verification by IMEI
   */
  async getVerification(imei: string): Promise<ImeiVerificationResult | null> {
    const verification = await prisma.imeiVerification.findUnique({
      where: { imei },
    });

    if (!verification) {
      return null;
    }

    return this.mapToResult(verification);
  }

  /**
   * Get verification by ID
   */
  async getVerificationById(id: string): Promise<ImeiVerificationResult | null> {
    const verification = await prisma.imeiVerification.findUnique({
      where: { id },
    });

    if (!verification) {
      return null;
    }

    return this.mapToResult(verification);
  }

  /**
   * Get user's verification history
   */
  async getUserVerifications(userId: string) {
    return prisma.imeiVerification.findMany({
      where: { verifiedBy: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Map database record to result
   */
  private mapToResult(verification: ImeiVerification): ImeiVerificationResult {
    return imeiVerificationResultSchema.parse({
      id: verification.id,
      imei: verification.imei,
      ptaStatus: verification.ptaStatus,
      cpidStatus: verification.cpidStatus,
      isStolen: verification.isStolen,
      isBlacklisted: verification.isBlacklisted,
      deviceModel: verification.deviceModel,
      deviceBrand: verification.deviceBrand,
      deviceColor: verification.deviceColor,
      verifiedAt: verification.verifiedAt,
      verificationSource: verification.verificationSource,
      lastCheckedAt: verification.updatedAt,
    });
  }

  /**
   * Check PTA status (placeholder - replace with actual API call)
   */
  private async checkPtaStatus(imei: string) {
    // TODO: Integrate with actual PTA API
    // For now, return a mock response based on IMEI pattern
    const isSimulatedApproved = imei.endsWith('1') || imei.endsWith('3') || imei.endsWith('5');

    return {
      status: isSimulatedApproved ? 'APPROVED' : 'UNKNOWN',
      isStolen: false,
      isBlacklisted: false,
      deviceModel: null,
      deviceBrand: null,
      deviceColor: null,
    };
  }

  /**
   * Check CPID status (placeholder - replace with actual API call)
   */
  private async checkCpidStatus(_imei: string) {
    // TODO: Integrate with actual CPID API
    return {
      status: 'UNKNOWN',
    };
  }
}

export const imeiVerificationService = new ImeiVerificationService();
