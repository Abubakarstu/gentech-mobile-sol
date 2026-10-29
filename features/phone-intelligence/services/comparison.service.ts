import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/lib/generated/prisma/client';
import { phoneModelRepository } from '../repositories/phone-model.repository';
import type { PhoneComparisonInput, PhoneSpecComparison } from '../schemas/comparison.schema';

export class ComparisonService {
  /**
   * Create a comparison session
   */
  async createComparison(
    input: PhoneComparisonInput,
    userId?: string,
    sessionId?: string
  ) {
    const phones = await phoneModelRepository.findByIds(input.phoneIds);

    if (phones.length < 2) {
      throw new Error('At least 2 phones must be compared');
    }

    const comparison = await prisma.phoneComparison.create({
      data: {
        userId,
        phoneIds: input.phoneIds,
        phoneSpecs: phones as unknown as Prisma.InputJsonValue,
        isAnonymous: !userId,
        sessionId,
      },
    });

    return comparison;
  }

  /**
   * Get comparison by ID
   */
  async getComparison(id: string) {
    return prisma.phoneComparison.findUnique({
      where: { id },
    });
  }

  /**
   * Get comparison specs for display
   */
  async getComparisonSpecs(phoneIds: string[]): Promise<PhoneSpecComparison[]> {
    const phones = await phoneModelRepository.findByIds(phoneIds);
    return phones.map(phone => ({
      id: phone.id,
      name: phone.name,
      brand: phone.brand.name,
      slug: phone.slug,
      imageUrl: phone.imageUrl ?? undefined,
      displaySize: phone.displaySize,
      displayResolution: phone.displayResolution,
      displayType: phone.displayType,
      refreshRate: phone.refreshRate,
      processor: phone.processor,
      cpuCores: phone.cpuCores,
      gpu: phone.gpu,
      ramOptions: phone.ramOptions,
      storageOptions: phone.storageOptions,
      mainCamera: phone.mainCamera,
      selfieCamera: phone.selfieCamera,
      cameraFeatures: phone.cameraFeatures,
      batteryCapacity: phone.batteryCapacity,
      batteryType: phone.batteryType,
      chargingSpeed: phone.chargingSpeed,
      networkSupport: phone.networkSupport,
      simType: phone.simType,
      wifi: phone.wifi,
      bluetooth: phone.bluetooth,
      nfc: phone.nfc,
      weight: phone.weight,
      dimensions: phone.dimensions,
      os: phone.os,
      osVersion: phone.osVersion,
      features: phone.features,
      colors: phone.colors,
      launchPrice: phone.launchPrice ? Number(phone.launchPrice) : null,
      releaseDate: phone.releaseDate,
    }));
  }

  /**
   * Get user's comparison history
   */
  async getUserComparisons(userId: string) {
    return prisma.phoneComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  /**
   * Get comparison by session ID (for anonymous users)
   */
  async getComparisonBySession(sessionId: string) {
    return prisma.phoneComparison.findFirst({
      where: { sessionId },
    });
  }
}

export const comparisonService = new ComparisonService();
