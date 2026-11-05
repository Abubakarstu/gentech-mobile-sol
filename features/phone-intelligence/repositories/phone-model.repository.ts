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

  /**
   * Admin: List all models with optional brand filter
   */
  async findAllForAdmin(brandId?: string): Promise<PhoneModelWithBrand[]> {
    return prisma.phoneModel.findMany({
      where: brandId ? { brandId } : undefined,
      include: { brand: true },
      orderBy: [{ brand: { name: 'asc' } }, { position: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Admin: Create a new phone model
   */
  async create(data: {
    name: string;
    slug: string;
    brandId: string;
    modelNumber?: string;
    releaseDate?: Date;
    launchPrice?: number;
    displaySize?: string;
    displayResolution?: string;
    displayType?: string;
    refreshRate?: string;
    processor?: string;
    cpuCores?: number;
    gpu?: string;
    ramOptions?: string[];
    storageOptions?: string[];
    mainCamera?: string;
    selfieCamera?: string;
    batteryCapacity?: string;
    chargingSpeed?: string;
    networkSupport?: string[];
    colors?: string[];
    imageUrl?: string;
    description?: string;
    position?: number;
    isActive?: boolean;
    isUpcoming?: boolean;
  }): Promise<PhoneModelWithBrand> {
    return prisma.phoneModel.create({
      data: {
        name: data.name,
        slug: data.slug,
        brandId: data.brandId,
        modelNumber: data.modelNumber ?? null,
        releaseDate: data.releaseDate ?? null,
        launchPrice: data.launchPrice ? (data.launchPrice as any) : null,
        displaySize: data.displaySize ?? null,
        displayResolution: data.displayResolution ?? null,
        displayType: data.displayType ?? null,
        refreshRate: data.refreshRate ?? null,
        processor: data.processor ?? null,
        cpuCores: data.cpuCores ?? null,
        gpu: data.gpu ?? null,
        ramOptions: data.ramOptions ?? [],
        storageOptions: data.storageOptions ?? [],
        mainCamera: data.mainCamera ?? null,
        selfieCamera: data.selfieCamera ?? null,
        batteryCapacity: data.batteryCapacity ?? null,
        chargingSpeed: data.chargingSpeed ?? null,
        networkSupport: data.networkSupport ?? [],
        colors: data.colors ?? [],
        imageUrl: data.imageUrl ?? null,
        description: data.description ?? null,
        position: data.position ?? 0,
        isActive: data.isActive ?? true,
        isUpcoming: data.isUpcoming ?? false,
      },
      include: { brand: true },
    });
  }

  /**
   * Admin: Update an existing phone model
   */
  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      brandId?: string;
      modelNumber?: string | null;
      releaseDate?: Date | null;
      launchPrice?: number | null;
      displaySize?: string | null;
      displayResolution?: string | null;
      displayType?: string | null;
      refreshRate?: string | null;
      processor?: string | null;
      cpuCores?: number | null;
      gpu?: string | null;
      ramOptions?: string[];
      storageOptions?: string[];
      mainCamera?: string | null;
      selfieCamera?: string | null;
      batteryCapacity?: string | null;
      chargingSpeed?: string | null;
      networkSupport?: string[];
      colors?: string[];
      imageUrl?: string | null;
      description?: string | null;
      position?: number;
      isActive?: boolean;
      isUpcoming?: boolean;
    },
  ): Promise<PhoneModelWithBrand> {
    const updateData: any = { ...data };
    if (data.launchPrice !== undefined) {
      updateData.launchPrice = data.launchPrice !== null ? data.launchPrice : null;
    }
    return prisma.phoneModel.update({
      where: { id },
      data: updateData,
      include: { brand: true },
    });
  }

  /**
   * Admin: Delete phone model
   */
  async delete(id: string): Promise<PhoneModelWithBrand> {
    return prisma.phoneModel.delete({
      where: { id },
      include: { brand: true },
    });
  }
}

export const phoneModelRepository = new PhoneModelRepository();
