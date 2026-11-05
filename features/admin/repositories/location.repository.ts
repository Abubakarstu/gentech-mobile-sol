import "server-only";

import { prisma } from "@/lib/prisma";
import type { City, Area } from "@/lib/generated/prisma/client";

export interface CityWithAreas extends City {
  areas: Area[];
  _count: {
    areas: number;
  };
}

export async function getAllCitiesForAdmin(): Promise<CityWithAreas[]> {
  return prisma.city.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: {
      areas: {
        orderBy: [{ position: "asc" }, { name: "asc" }],
      },
      _count: {
        select: { areas: true },
      },
    },
  });
}

export async function getActiveCities(): Promise<City[]> {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
}

export async function getCityById(id: string): Promise<City | null> {
  return prisma.city.findUnique({
    where: { id },
    include: { areas: true },
  });
}

export async function createCity(data: {
  name: string;
  slug: string;
  province?: string;
  popular?: boolean;
  position?: number;
  isActive?: boolean;
}): Promise<City> {
  return prisma.city.create({
    data: {
      name: data.name,
      slug: data.slug,
      province: data.province ?? null,
      popular: data.popular ?? false,
      position: data.position ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateCity(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    province: string | null;
    popular: boolean;
    position: number;
    isActive: boolean;
  }>,
): Promise<City> {
  return prisma.city.update({
    where: { id },
    data,
  });
}

export async function deleteCity(id: string): Promise<City> {
  return prisma.city.delete({
    where: { id },
  });
}

export async function createArea(data: {
  name: string;
  slug: string;
  cityId: string;
  position?: number;
  isActive?: boolean;
}): Promise<Area> {
  return prisma.area.create({
    data: {
      name: data.name,
      slug: data.slug,
      cityId: data.cityId,
      position: data.position ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function deleteArea(id: string): Promise<Area> {
  return prisma.area.delete({
    where: { id },
  });
}

