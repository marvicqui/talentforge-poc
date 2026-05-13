import { z } from "zod";

export const OutreachVariantSchema = z.object({
  tag: z.enum(["A", "B"]),
  style: z.enum(["direct", "consultative", "warm"]).default("direct"),
  message: z.string().min(40).max(1024),
  char_count: z.coerce.number().int().min(1).max(1024),
  personalization_notes: z.array(z.string().min(2)).min(1).max(5),
});

export const OutreachComposerOutputSchema = z.object({
  variants: z.array(OutreachVariantSchema).length(2),
});

export type OutreachComposerOutput = z.infer<typeof OutreachComposerOutputSchema>;
export type OutreachVariant = z.infer<typeof OutreachVariantSchema>;
