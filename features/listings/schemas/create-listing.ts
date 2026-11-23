import { z } from "zod";

import { isValidImageUrl, MAX_IMAGE_URL_LENGTH } from "@/lib/validation/image-url";

export const CONDITION_VALUES = ["NEW", "OPEN_BOX", "USED", "REFURBISHED", "FOR_PARTS"] as const;

/** Accepts both Cloudinary upload results and seller-supplied https image URLs. */
export const uploadedImageSchema = z.object({
  url: z
    .string()
    .max(MAX_IMAGE_URL_LENGTH)
    .refine(isValidImageUrl, "Enter a valid https image URL."),
  publicId: z.string().max(255).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type UploadedImage = z.infer<typeof uploadedImageSchema>;

export const createListingSchema = z.object({
  title: z.string().trim().min(5, "Title is too short").max(120),
  description: z.string().trim().min(20, "Add a bit more detail").max(4000),
  price: z
    .number({ message: "Enter a valid price" })
    .positive("Price must be greater than 0")
    .max(100_000_000),
  condition: z.enum(CONDITION_VALUES, { message: "Select a condition" }),
  categorySlug: z.string().min(1, "Select a category"),
  brandSlug: z.string().optional(),
  countryId: z.string().min(1, "Select a country"),
  cityId: z.string().min(1, "Select a city"),
  areaId: z.string().optional().or(z.literal("")),
  negotiable: z.boolean().optional(),

  // Phone-specific attributes (all optional).
  storage: z.string().trim().max(40).optional(),
  ram: z.string().trim().max(40).optional(),
  color: z.string().trim().max(40).optional(),
  batteryHealth: z
    .string()
    .regex(/^\d{1,3}$/, "Enter a number 0–100")
    .optional()
    .or(z.literal("")),
  ptaApproved: z.boolean().optional(),
  ptaStatus: z.enum(["PTA_APPROVED", "NON_PTA", "CPID", "FACTORY_UNLOCKED", "CARRIER_LOCKED", "UNKNOWN", "VERIFICATION_PENDING"]).optional(),
  cpidStatus: z.enum(["CPID_APPROVED", "NON_CPID", "UNKNOWN"]).optional(),
  
  // Extended phone attributes
  model: z.string().trim().max(100).optional(),
  variant: z.string().trim().max(100).optional(),
  networkType: z.enum(["SINGLE_SIM", "DUAL_SIM", "ESIM", "HYBRID"]).optional(),
  carrier: z.string().trim().max(50).optional(),
  isUnlocked: z.boolean().optional(),
  modelNumber: z.string().trim().max(50).optional(),
  region: z.string().trim().max(50).optional(),
  warranty: z.enum(["NO_WARRANTY", "MANUFACTURER", "SELLER", "THIRD_PARTY"]).optional(),
  warrantyExpiry: z.string().optional(),
  hasOriginalBox: z.boolean().optional(),
  hasCharger: z.boolean().optional(),
  hasHeadphones: z.boolean().optional(),
  repairHistory: z.string().trim().max(500).optional(),

  // Category-specific attributes (tablets, laptops and accessories).
  processor: z.string().trim().max(40).optional(),
  operatingSystem: z.string().trim().max(40).optional(),
  screenSize: z.string().trim().max(20).optional(),
  connectivity: z.string().trim().max(40).optional(),
  accessoryType: z.string().trim().max(40).optional(),
  compatibility: z.string().trim().max(40).optional(),

  images: z
    .array(uploadedImageSchema)
    .min(1, "Add at least one photo")
    .max(10)
    .refine((images) => new Set(images.map((image) => image.url)).size === images.length, {
      message: "Duplicate photos are not allowed.",
    }),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
