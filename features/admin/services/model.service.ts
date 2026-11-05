import "server-only";

import { slugify } from "@/utils/slug";
import {
  phoneModelRepository,
  type PhoneModelWithBrand,
} from "@/features/phone-intelligence/repositories/phone-model.repository";

export async function getAdminModels(brandId?: string): Promise<PhoneModelWithBrand[]> {
  return phoneModelRepository.findAllForAdmin(brandId);
}

export async function createAdminModel(data: {
  name: string;
  slug?: string;
  brandId: string;
  modelNumber?: string;
  releaseDate?: string;
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
}) {
  const baseSlug = slugify(data.slug && data.slug.trim().length > 0 ? data.slug : data.name);
  return phoneModelRepository.create({
    name: data.name.trim(),
    slug: baseSlug,
    brandId: data.brandId,
    modelNumber: data.modelNumber?.trim() || undefined,
    releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
    launchPrice: data.launchPrice,
    displaySize: data.displaySize?.trim() || undefined,
    displayResolution: data.displayResolution?.trim() || undefined,
    displayType: data.displayType?.trim() || undefined,
    refreshRate: data.refreshRate?.trim() || undefined,
    processor: data.processor?.trim() || undefined,
    cpuCores: data.cpuCores,
    gpu: data.gpu?.trim() || undefined,
    ramOptions: data.ramOptions,
    storageOptions: data.storageOptions,
    mainCamera: data.mainCamera?.trim() || undefined,
    selfieCamera: data.selfieCamera?.trim() || undefined,
    batteryCapacity: data.batteryCapacity?.trim() || undefined,
    chargingSpeed: data.chargingSpeed?.trim() || undefined,
    networkSupport: data.networkSupport,
    colors: data.colors,
    imageUrl: data.imageUrl?.trim() || undefined,
    description: data.description?.trim() || undefined,
    position: data.position ?? 0,
    isActive: data.isActive ?? true,
    isUpcoming: data.isUpcoming ?? false,
  });
}

export async function updateAdminModel(
  id: string,
  data: {
    name?: string;
    slug?: string;
    brandId?: string;
    modelNumber?: string | null;
    releaseDate?: string | null;
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
) {
  const existing = await phoneModelRepository.findById(id);
  if (!existing) {
    throw new Error("Phone model not found");
  }

  const updates: Parameters<typeof phoneModelRepository.update>[1] = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.slug !== undefined) updates.slug = slugify(data.slug);
  if (data.brandId !== undefined) updates.brandId = data.brandId;
  if (data.modelNumber !== undefined) updates.modelNumber = data.modelNumber;
  if (data.releaseDate !== undefined) {
    updates.releaseDate = data.releaseDate ? new Date(data.releaseDate) : null;
  }
  if (data.launchPrice !== undefined) updates.launchPrice = data.launchPrice;
  if (data.displaySize !== undefined) updates.displaySize = data.displaySize;
  if (data.displayResolution !== undefined) updates.displayResolution = data.displayResolution;
  if (data.displayType !== undefined) updates.displayType = data.displayType;
  if (data.refreshRate !== undefined) updates.refreshRate = data.refreshRate;
  if (data.processor !== undefined) updates.processor = data.processor;
  if (data.cpuCores !== undefined) updates.cpuCores = data.cpuCores;
  if (data.gpu !== undefined) updates.gpu = data.gpu;
  if (data.ramOptions !== undefined) updates.ramOptions = data.ramOptions;
  if (data.storageOptions !== undefined) updates.storageOptions = data.storageOptions;
  if (data.mainCamera !== undefined) updates.mainCamera = data.mainCamera;
  if (data.selfieCamera !== undefined) updates.selfieCamera = data.selfieCamera;
  if (data.batteryCapacity !== undefined) updates.batteryCapacity = data.batteryCapacity;
  if (data.chargingSpeed !== undefined) updates.chargingSpeed = data.chargingSpeed;
  if (data.networkSupport !== undefined) updates.networkSupport = data.networkSupport;
  if (data.colors !== undefined) updates.colors = data.colors;
  if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl;
  if (data.description !== undefined) updates.description = data.description;
  if (data.position !== undefined) updates.position = data.position;
  if (data.isActive !== undefined) updates.isActive = data.isActive;
  if (data.isUpcoming !== undefined) updates.isUpcoming = data.isUpcoming;

  return phoneModelRepository.update(id, updates);
}

export async function deleteAdminModel(id: string) {
  const existing = await phoneModelRepository.findById(id);
  if (!existing) {
    throw new Error("Phone model not found");
  }
  return phoneModelRepository.delete(id);
}

