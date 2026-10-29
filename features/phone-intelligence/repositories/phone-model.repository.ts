import { prisma } from '@/lib/prisma';
import type { PhoneModel, Brand } from '@/lib/generated/prisma/client';

export type PhoneModelWithBrand = PhoneModel & {
  brand: Brand;
};

export class PhoneModelRepository {
  /**
   * Get all active phone models with brand
   */
  async findAllActive(): Promise<PhoneModelWithBrand[]> {
    return prisma.phoneModel.findMany({
      where: { isActive: true },
      include: { brand: true },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Get phone model by slug
   */
  async findBySlug(slug: string): Promise<PhoneModelWithBrand | null> {
    return prisma.phoneModel.findUnique({
      where: { slug },
      include: { brand: true },
    });
  }

  /**
   * Get phone model by ID
   */
  async findById(id: string): Promise<PhoneModelWithBrand | null> {
    return prisma.phoneModel.findUnique({
      where: { id },
      include: { brand: true },
    });
  }

  /**
   * Get phone models by brand
   */
  async findByBrand(brandId: string): Promise<PhoneModelWithBrand[]> {
    return prisma.phoneModel.findMany({
      where: { brandId, isActive: true },
      include: { brand: true },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Get upcoming phone models
   */
  async findUpcoming(): Promise<PhoneModelWithBrand[]> {
    return prisma.phoneModel.findMany({
      where: { isUpcoming: true, isActive: true },
      include: { brand: true },
      orderBy: { releaseDate: 'asc' },
    });
  }

  /**
   * Search phone models by name
   */
  async search(query: string): Promise<PhoneModelWithBrand[]> {
    return prisma.phoneModel.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { modelNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { brand: true },
      orderBy: { position: 'asc' },
      take: 20,
    });
  }

  /**
   * Get multiple phone models by IDs
   */
  async findByIds(ids: string[]): Promise<PhoneModelWithBrand[]> {
    return prisma.phoneModel.findMany({
      where: { id: { in: ids } },
      include: { brand: true },
    });
  }
}

export const phoneModelRepository = new PhoneModelRepository();
