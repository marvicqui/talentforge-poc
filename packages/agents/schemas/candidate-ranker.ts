import { z } from "zod";

export const RecommendationEnum = z.enum([
  "strong_yes",
  "yes",
  "maybe",
  "no",
  "strong_no",
]);
export type Recommendation = z.infer<typeof RecommendationEnum>;

export const SkillBreakdownItemSchema = z.object({
  name: z.string().min(1),
  // Models occasionally emit fractional years ("0.5"); coerce + round to int.
  required_years: z.coerce.number().int().min(0).max(40),
  candidate_years: z.coerce.number().int().min(0).max(40),
  score: z.coerce.number().int().min(0).max(100),
  evidence: z.string().min(1),
});

export const CandidateRankerOutputSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  skill_breakdown: z.array(SkillBreakdownItemSchema).default([]),
  match_reasoning: z.string().min(20),
  gaps: z.array(z.string().min(1)).default([]),
  strengths: z.array(z.string().min(1)).default([]),
  recommendation: RecommendationEnum,
});

export type CandidateRankerOutput = z.infer<typeof CandidateRankerOutputSchema>;
export type SkillBreakdownItem = z.infer<typeof SkillBreakdownItemSchema>;
