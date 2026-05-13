import Anthropic from "@anthropic-ai/sdk";

import { OUTREACH_COMPOSER_SYSTEM_PROMPT } from "../prompts/outreach-composer";
import {
  OutreachComposerOutputSchema,
  type OutreachComposerOutput,
} from "../schemas/outreach-composer";

const ASSISTANT_PREFILL = "{";

function getModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

export type ComposeOutreachOptions = {
  job: {
    title: string;
    company_name: string;
    modality: string;
    salary_min_usd: number | null;
    salary_max_usd: number | null;
  };
  candidate: {
    first_name: string;
    seniority: string | null;
    country: string | null;
    top_skills: Array<{ name: string; years_experience: number }>;
    last_company: string | null;
  };
  apiKey?: string;
  signal?: AbortSignal;
};

export async function composeOutreach(
  opts: ComposeOutreachOptions,
): Promise<{ parsed: OutreachComposerOutput; raw: string }> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const client = new Anthropic({ apiKey });

  const skills = opts.candidate.top_skills
    .slice(0, 5)
    .map((s) => `${s.name} (${s.years_experience}y)`)
    .join(", ");

  const userMessage = [
    `# Job`,
    `Title: ${opts.job.title}`,
    `Company: ${opts.job.company_name}`,
    `Modality: ${opts.job.modality}`,
    `Salary USD/mes: ${opts.job.salary_min_usd ?? "?"}-${opts.job.salary_max_usd ?? "?"}`,
    "",
    `# Candidate (only first name + relevant attributes)`,
    `First name: ${opts.candidate.first_name}`,
    `Seniority: ${opts.candidate.seniority ?? "-"}`,
    `Country: ${opts.candidate.country ?? "-"}`,
    `Top skills: ${skills}`,
    `Last company: ${opts.candidate.last_company ?? "-"}`,
    "",
    `Return the JSON with two variants.`,
  ].join("\n");

  const response = await client.messages.create(
    {
      model: getModel(),
      max_tokens: 2000,
      system: OUTREACH_COMPOSER_SYSTEM_PROMPT,
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
  const parsed = OutreachComposerOutputSchema.parse(JSON.parse(raw));
  return { parsed, raw };
}
