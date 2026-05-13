import { z } from "zod";

import { CefrEnum } from "./job-analyzer";
import { RecommendationEnum } from "./candidate-ranker";

export const EvidenceQuoteSchema = z.object({
  text: z.string().min(2).max(400),
  start_ms: z.coerce.number().int().min(0).max(60 * 60 * 1000 * 4), // up to 4h
});
export type EvidenceQuote = z.infer<typeof EvidenceQuoteSchema>;

const ScoredDimensionSchema = z.object({
  score: z.coerce.number().int().min(0).max(100),
  evidence_quotes: z.array(EvidenceQuoteSchema).min(0).max(5).default([]),
});

export const EnglishBreakdownSchema = z.object({
  assessed: z.boolean().default(true),
  notes: z.string().default(""),
  grammar: ScoredDimensionSchema,
  fluency: ScoredDimensionSchema,
  vocabulary: ScoredDimensionSchema,
  pronunciation: ScoredDimensionSchema,
});

export const TechnicalSkillScoreSchema = z.object({
  skill: z.string().min(1),
  score: z.coerce.number().int().min(0).max(100),
  evidence_quotes: z.array(EvidenceQuoteSchema).min(0).max(5).default([]),
  reasoning: z.string().min(5),
});

export const SoftSkillScoreSchema = z.object({
  communication: ScoredDimensionSchema,
  collaboration: ScoredDimensionSchema,
  problem_solving: ScoredDimensionSchema,
  ownership: ScoredDimensionSchema,
});

const FlagItemSchema = z.object({
  label: z.string().min(2),
  // Models occasionally emit `null` explicitly; tolerate both null and missing.
  evidence_quote: EvidenceQuoteSchema.nullish(),
});

export const InterviewAnalyzerOutputSchema = z.object({
  english_level: CefrEnum,
  english_breakdown: EnglishBreakdownSchema,
  technical_score: z.array(TechnicalSkillScoreSchema).min(1).max(8),
  softskill_score: SoftSkillScoreSchema,
  red_flags: z.array(FlagItemSchema).default([]),
  strengths: z.array(FlagItemSchema).default([]),
  summary: z.string().min(40),
  recommendation: RecommendationEnum,
});

export type InterviewAnalyzerOutput = z.infer<
  typeof InterviewAnalyzerOutputSchema
>;
