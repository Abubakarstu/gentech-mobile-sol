import "server-only";

import { slugify } from "@/utils/slug";
import {
  getAllCitiesForAdmin,
  getActiveCities,
  getCityById,
  createCity as repoCreateCity,
  updateCity as repoUpdateCity,
  deleteCity as repoDeleteCity,
  createArea as repoCreateArea,
  deleteArea as repoDeleteArea,
  type CityWithAreas,
} from "../repositories/location.repository";

export async function getAdminLocations(): Promise<CityWithAreas[]> {
  return getAllCitiesForAdmin();
}

export async function createAdminCity(data: {
  name: string;
  slug?: string;
  province?: string;
  popular?: boolean;
  position?: number;
  isActive?: boolean;
}) {
  const baseSlug = slugify(data.slug && data.slug.trim().length > 0 ? data.slug : data.name);
  return repoCreateCity({
    name: data.name.trim(),
    slug: baseSlug,
    province: data.province?.trim() || undefined,
    popular: data.popular ?? false,
    position: data.position ?? 0,
    isActive: data.isActive ?? true,
  });
}

export async function updateAdminCity(
  id: string,
  data: {
    name?: string;
    slug?: string;
    province?: string | null;
    popular?: boolean;
    position?: number;
    isActive?: boolean;
  },
) {
  const existing = await getCityById(id);
  if (!existing) {
    throw new Error("City not found");
  }

  const updates: Parameters<typeof repoUpdateCity>[1] = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.slug !== undefined) updates.slug = slugify(data.slug);
  if (data.province !== undefined) updates.province = data.province?.trim() || null;
  if (data.popular !== undefined) updates.popular = data.popular;
  if (data.position !== undefined) updates.position = data.position;
  if (data.isActive !== undefined) updates.isActive = data.isActive;

  return repoUpdateCity(id, updates);
}

export async function deleteAdminCity(id: string) {
  const existing = await getCityById(id);
  if (!existing) {
    throw new Error("City not found");
  }
  return repoDeleteCity(id);
}

export async function createAdminArea(data: {
  name: string;
  slug?: string;
  cityId: string;
  position?: number;
  isActive?: boolean;
}) {
  const baseSlug = slugify(data.slug && data.slug.trim().length > 0 ? data.slug : data.name);
  return repoCreateArea({
    name: data.name.trim(),
    slug: baseSlug,
    cityId: data.cityId,
    position: data.position ?? 0,
    isActive: data.isActive ?? true,
  });
}

export async function deleteAdminArea(id: string) {
  return repoDeleteArea(id);
}

