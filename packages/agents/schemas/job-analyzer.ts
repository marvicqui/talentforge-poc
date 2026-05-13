import { z } from "zod";

export const SeniorityEnum = z.enum([
  "junior",
  "mid",
  "senior",
  "staff",
  "principal",
]);
export type Seniority = z.infer<typeof SeniorityEnum>;

export const ModalityEnum = z.enum(["remote", "hybrid", "onsite"]);
export type Modality = z.infer<typeof ModalityEnum>;

export const CefrEnum = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);
export type Cefr = z.infer<typeof CefrEnum>;

export const JobAnalyzerOutputSchema = z.object({
  title: z.string().min(1),
  seniority: SeniorityEnum,
  must_have_skills: z.array(z.string().min(1)).default([]),
  nice_to_have_skills: z.array(z.string().min(1)).default([]),
  soft_skills: z.array(z.string().min(1)).default([]),
  languages: z
    .array(
      z.object({
        code: z.string().min(2).max(3),
        cefr: CefrEnum,
      }),
    )
    .default([]),
  years_experience_min: z.number().int().min(0).max(40),
  modality: ModalityEnum,
  red_flags_to_avoid: z.array(z.string().min(1)).default([]),
  ideal_candidate_summary: z.string().min(20),
});

export type JobAnalyzerOutput = z.infer<typeof JobAnalyzerOutputSchema>;
