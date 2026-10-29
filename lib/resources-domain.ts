import { z } from 'zod';
const optionalText = (max: number) => z.string().trim().max(max).default('');
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, 'Choose a valid date.')
  .nullable();
const amount = z
  .string()
  .regex(/^\d{1,13}(\.\d{1,2})?$/, 'Use a non-negative AUD amount with up to two decimals.')
  .nullable();
export const tenantSchema = z
  .object({
    full_name: z.string().trim().min(1, 'Enter the tenant’s name.').max(150),
    email: z.union([z.string().trim().email().max(320), z.literal('')]).default(''),
    phone: optionalText(40),
    status: z.enum(['active', 'upcoming', 'ended']),
    lease_start: date,
    lease_end: date,
    rent_amount: amount,
    rent_frequency: z.enum(['weekly', 'fortnightly', 'monthly']).nullable(),
    bond_amount: amount,
    notes: optionalText(2000),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.lease_start && v.lease_end && v.lease_end < v.lease_start)
      ctx.addIssue({ code: 'custom', message: 'Lease end must be on or after lease start.' });
    if ((v.rent_amount === null) !== (v.rent_frequency === null))
      ctx.addIssue({
        code: 'custom',
        message: 'Enter both rent amount and frequency, or leave both blank.',
      });
  });
export type TenantInput = z.infer<typeof tenantSchema>;
export type Tenant = TenantInput & {
  id: string;
  property_id: string;
  created_at: string;
  updated_at: string;
};
export type PropertyFile = {
  id: string;
  property_id: string;
  kind: 'photo' | 'document';
  name: string;
  mime: string;
  size: number;
  created_at: string;
};
export type PropertyResources = { files: PropertyFile[]; tenants: Tenant[] };
export const uploadLimits = {
  photoBytes: 5 * 1024 * 1024,
  documentBytes: 10 * 1024 * 1024,
  photos: 10,
  documents: 20,
};
export function safeFileName(input: string) {
  const name = input
    .split(/[\\/]/)
    .pop()
    ?.trim()
    .replace(/[\x00-\x1f\x7f]/g, '');
  if (!name || name.length > 180) throw new Error('Use a file name between 1 and 180 characters.');
  return name;
}
export function detectFileType(name: string, bytes: Uint8Array, kind: 'photo' | 'document') {
  const ext = name.toLowerCase().split('.').pop();
  const prefix = new TextDecoder('latin1').decode(bytes.slice(0, 16));
  if (kind === 'photo') {
    if (
      (ext === 'jpg' || ext === 'jpeg') &&
      bytes[0] === 255 &&
      bytes[1] === 216 &&
      bytes[2] === 255
    )
      return 'image/jpeg';
    if (ext === 'png' && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v))
      return 'image/png';
    if (ext === 'webp' && prefix.startsWith('RIFF') && prefix.slice(8, 12) === 'WEBP')
      return 'image/webp';
    throw new Error('Choose a valid JPG, PNG or WebP photo.');
  }
  if (ext === 'pdf' && prefix.startsWith('%PDF-')) return 'application/pdf';
  if (
    (ext === 'docx' || ext === 'xlsx') &&
    bytes[0] === 80 &&
    bytes[1] === 75 &&
    bytes[2] === 3 &&
    bytes[3] === 4
  )
    return ext === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (ext === 'txt' || ext === 'csv') {
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text)) throw new Error();
      return ext === 'csv' ? 'text/csv' : 'text/plain';
    } catch {
      throw new Error('Choose a UTF-8 text or CSV document.');
    }
  }
  throw new Error('Choose a PDF, DOCX, XLSX, TXT or CSV document.');
}
