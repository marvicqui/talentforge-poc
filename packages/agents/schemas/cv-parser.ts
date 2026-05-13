import { z } from "zod";

import { CefrEnum, SeniorityEnum } from "./job-analyzer";

const SkillEntrySchema = z.object({
  name: z.string().min(1),
  years_experience: z.coerce.number().int().min(0).max(50),
});

const ExperienceEntrySchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  start: z.string().min(4).max(10),
  end: z.string().min(4).max(10).nullish(),
  description: z.string().min(2),
});

export const CvParserOutputSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email().or(z.literal("unknown@cv.local")),
  phone_e164: z.string().nullish(),
  country: z.string().nullish(),
  city: z.string().nullish(),
  english_cefr: CefrEnum.nullish(),
  seniority: SeniorityEnum,
  summary: z.string().min(40),
  skills: z.array(SkillEntrySchema).min(0).max(25),
  experience: z.array(ExperienceEntrySchema).min(0).max(10),
  _extraction_failed: z.boolean().default(false),
});

export type CvParserOutput = z.infer<typeof CvParserOutputSchema>;
