import Anthropic from "@anthropic-ai/sdk";

import { QUESTION_GENERATOR_SYSTEM_PROMPT } from "../prompts/question-generator";
import {
  QuestionGeneratorOutputSchema,
  type QuestionGeneratorOutput,
} from "../schemas/question-generator";

const ASSISTANT_PREFILL = "{";

function getModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

export type GenerateQuestionsOptions = {
  job: {
    title: string;
    company_name: string;
    description_raw: string;
    modality: string;
    english_min_cefr: string | null;
  };
  apiKey?: string;
  signal?: AbortSignal;
};

export async function generateInterviewGuide(
  opts: GenerateQuestionsOptions,
): Promise<{ parsed: QuestionGeneratorOutput; raw: string }> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const client = new Anthropic({ apiKey });

  const userMessage = [
    `# Job`,
    `Title: ${opts.job.title}`,
    `Company: ${opts.job.company_name}`,
    `Modality: ${opts.job.modality}`,
    `English minimum: ${opts.job.english_min_cefr ?? "-"}`,
    "",
    `## Job description`,
    opts.job.description_raw,
    "",
    `Return the JSON interview guide.`,
  ].join("\n");

  const response = await client.messages.create(
    {
      model: getModel(),
      max_tokens: 6500,
      system: QUESTION_GENERATOR_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userMessage },
        { role: "assistant", content: ASSISTANT_PREFILL },
      ],
    },
    { signal: opts.signal },
  );

  const continuation = response.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
  const raw = ASSISTANT_PREFILL + continuation;
  const parsed = QuestionGeneratorOutputSchema.parse(JSON.parse(raw));
  return { parsed, raw };
}
