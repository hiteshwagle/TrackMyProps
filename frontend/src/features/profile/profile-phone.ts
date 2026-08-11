import { z } from 'zod';

export const optionalProfilePhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^[+0-9 ()-]{7,20}$/.test(value),
    'Enter a valid phone number or leave it blank.',
  );

export function profilePhoneFromMetadata(metadata: Record<string, unknown> | undefined): string {
  const phone = metadata?.phone;
  return typeof phone === 'string' ? phone : '';
}
