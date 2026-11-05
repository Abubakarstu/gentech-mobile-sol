"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import { logAudit } from "@/features/audit";
import {
  createAdminCity,
  updateAdminCity,
  deleteAdminCity,
  createAdminArea,
  deleteAdminArea,
} from "../services/location.service";

type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const createCitySchema = z.object({
  name: z.string().min(2, "City name must be at least 2 characters").max(60),
  slug: z.string().max(80).optional(),
  province: z.string().max(60).optional(),
  popular: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

export async function createCityAction(input: z.infer<typeof createCitySchema>): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized. Admin required." };

  const parsed = createCitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid city data." };
  }

  try {
    const city = await createAdminCity(parsed.data);
    await logAudit({
      actorId: admin.id,
      action: "CITY_CREATED",
      resource: "City",
      resourceId: city.id,
      after: city,
    });
    revalidatePath("/admin/locations");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create city." };
  }
}

const updateCitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(60).optional(),
  slug: z.string().max(80).optional(),
  province: z.string().max(60).nullable().optional(),
  popular: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function updateCityAction(input: z.infer<typeof updateCitySchema>): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized. Admin required." };

  const parsed = updateCitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid update." };
  }

  try {
    const { id, ...data } = parsed.data;
    const updated = await updateAdminCity(id, data);
    await logAudit({
      actorId: admin.id,
      action: "CITY_UPDATED",
      resource: "City",
      resourceId: id,
      after: updated,
    });
    revalidatePath("/admin/locations");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update city." };
  }
}

export async function deleteCityAction(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized. Admin required." };

  try {
    await deleteAdminCity(id);
    await logAudit({
      actorId: admin.id,
      action: "CITY_DELETED",
      resource: "City",
      resourceId: id,
    });
    revalidatePath("/admin/locations");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete city." };
  }
}

const createAreaSchema = z.object({
  name: z.string().min(2, "Area name must be at least 2 characters").max(80),
  cityId: z.string().min(1, "City is required"),
  position: z.number().int().min(0).optional(),
});

export async function createAreaAction(input: z.infer<typeof createAreaSchema>): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized. Admin required." };

  const parsed = createAreaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid area data." };
  }

  try {
    const area = await createAdminArea(parsed.data);
    await logAudit({
      actorId: admin.id,
      action: "AREA_CREATED",
      resource: "Area",
      resourceId: area.id,
      after: area,
    });
    revalidatePath("/admin/locations");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create area." };
  }
}

export async function deleteAreaAction(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Unauthorized. Admin required." };

  try {
    await deleteAdminArea(id);
    await logAudit({
      actorId: admin.id,
      action: "AREA_DELETED",
      resource: "Area",
      resourceId: id,
    });
    revalidatePath("/admin/locations");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete area." };
  }
}

