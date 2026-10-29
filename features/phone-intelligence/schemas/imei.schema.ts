import { z } from 'zod';

export const imeiVerificationSchema = z.object({
  imei: z.string().regex(/^\d{15}$/, 'IMEI must be exactly 15 digits'),
});

export type ImeiVerificationInput = z.infer<typeof imeiVerificationSchema>;

export const imeiVerificationResultSchema = z.object({
  id: z.string(),
  imei: z.string(),
  ptaStatus: z.enum(['APPROVED', 'REJECTED', 'PENDING', 'UNKNOWN']).nullable(),
  cpidStatus: z.enum(['APPROVED', 'REJECTED', 'UNKNOWN']).nullable(),
  isStolen: z.boolean(),
  isBlacklisted: z.boolean(),
  deviceModel: z.string().nullable(),
  deviceBrand: z.string().nullable(),
  deviceColor: z.string().nullable(),
  verifiedAt: z.date().nullable(),
  verificationSource: z.enum(['PTA', 'CPID', 'MANUAL']).nullable(),
  lastCheckedAt: z.date(),
});

export type ImeiVerificationResult = z.infer<typeof imeiVerificationResultSchema>;
