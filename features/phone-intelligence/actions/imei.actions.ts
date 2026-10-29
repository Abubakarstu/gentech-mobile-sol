'use server';

import { redirect } from 'next/navigation';
import { imeiVerificationService } from '../services/imei-verification.service';
import { imeiVerificationSchema } from '../schemas/imei.schema';
import { getCurrentUser } from '@/lib/session';
import { headers } from 'next/headers';

export async function verifyImeiAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const headersList = await headers();

  const input = imeiVerificationSchema.parse({
    imei: formData.get('imei'),
  });

  const ipAddress = (headersList.get('x-forwarded-for') || headersList.get('x-real-ip')) ?? undefined;
  const userAgent = headersList.get('user-agent') ?? undefined;

  await imeiVerificationService.verifyImei(
    input,
    user?.id,
    ipAddress,
    userAgent
  );

  redirect(`/imei-check?imei=${encodeURIComponent(input.imei)}`);
}

export async function getImeiVerificationAction(imei: string) {
  const verification = await imeiVerificationService.getVerification(imei);
  return verification;
}

export async function getUserImeiVerificationsAction() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const verifications = await imeiVerificationService.getUserVerifications(user.id);
  return verifications;
}
