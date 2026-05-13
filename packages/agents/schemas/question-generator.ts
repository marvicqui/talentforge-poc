import { z } from "zod";

export const SectionIdEnum = z.enum([
  "intro_rapport",
  "background_experience",
  "technical_core",
  "practical_case",
  "behavioral_star",
]);
export type SectionId = z.infer<typeof SectionIdEnum>;

export const InterviewQuestionSchema = z.object({
  question: z.string().min(8),
  intent: z.string().min(8),
  time_minutes: z.coerce.number().int().min(1).max(45),
  what_to_look_for: z.array(z.string().min(2)).min(1).max(6),
  good_answer_signals: z.array(z.string().min(2)).min(1).max(4),
  weak_answer_signals: z.array(z.string().min(2)).min(1).max(4),
  red_flag_signals: z.array(z.string().min(2)).min(1).max(4),
});
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;

export const QuestionGeneratorOutputSchema = z.object({
  estimated_total_minutes: z.coerce.number().int().min(20).max(180),
  sections: z
    .array(
      z.object({
        id: SectionIdEnum,
        label: z.string().min(2),
        questions: z.array(InterviewQuestionSchema).min(1).max(10),
      }),
    )
    .min(3)
    .max(6),
  practical_case_context: z.string().min(40),
  practical_case_subprompts: z.array(z.string().min(4)).min(2).max(8),
});

export type QuestionGeneratorOutput = z.infer<
  typeof QuestionGeneratorOutputSchema
>;
