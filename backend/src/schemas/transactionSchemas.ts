import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;

export const purchaseSchema = z.object({
  trackId: z.string().regex(objectIdRegex, 'Invalid trackId format'),
});
