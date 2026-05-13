import Anthropic from "@anthropic-ai/sdk";

import { CANDIDATE_RANKER_SYSTEM_PROMPT } from "../prompts/candidate-ranker";
import {
  CandidateRankerOutputSchema,
  type CandidateRankerOutput,
} from "../schemas/candidate-ranker";
import {
  sanitizeCandidate,
  type RawCandidateForSanitize,
  type SanitizedCandidate,
} from "../sanitize";

const ASSISTANT_PREFILL = "{";

function getModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

export type JobForRanker = {
  title: string;
  company_name: string;
  description_raw: string;
  modality: string;
  english_min_cefr: string | null;
  salary_min_usd: number | null;
  salary_max_usd: number | null;
};

export type RankCandidateOptions = {
  job: JobForRanker;
  candidate: RawCandidateForSanitize;
  apiKey?: string;
  signal?: AbortSignal;
};

export type RankCandidateResult = {
  parsed: CandidateRankerOutput;
  raw: string;
  /** The sanitized payload we actually shipped to the LLM. Save in agent_traces. */
  sanitizedInput: SanitizedCandidate;
};

function buildUserMessage(
  job: JobForRanker,
  candidate: SanitizedCandidate,
): string {
  return [
    "## Job",
    `Title: ${job.title}`,
    `Company: ${job.company_name}`,
    `Modality: ${job.modality}`,
    `English min: ${job.english_min_cefr ?? "-"}`,
    `Salary USD/mes: ${job.salary_min_usd ?? "?"}-${job.salary_max_usd ?? "?"}`,
    "",
    "Description:",
    job.description_raw,
    "",
    "## Candidate (SANITIZED — identity fields removed)",
    `Seniority self-declared: ${candidate.seniority ?? "-"}`,
    `English: ${candidate.english_cefr ?? "-"}`,
    `Country: ${candidate.country ?? "-"}`,
    `City: ${candidate.city ?? "-"}`,
    "",
    "Skills (years_experience):",
    ...candidate.skills.map((s) => `- ${s.name}: ${s.years_experience}y`),
    "",
    "Summary:",
    candidate.summary,
    "",
    "Experience:",
    ...candidate.experience.map(
      (e) =>
        `- ${e.role} @ ${e.company} (${e.start}—${e.end ?? "present"}): ${e.description}`,
    ),
    "",
    "Return the JSON ranking.",
  ].join("\n");
}

/**
 * Sanitize + rank the candidate against the job. Single LLM call (not streamed
 * — the consumer needs the full validated object).
 */
export async function rankCandidate(
  opts: RankCandidateOptions,
): Promise<RankCandidateResult> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY missing.");
  }
  const client = new Anthropic({ apiKey });

  const sanitized = sanitizeCandidate(opts.candidate);
  const userMessage = buildUserMessage(opts.job, sanitized);

  const response = await client.messages.create(
    {
      model: getModel(),
      max_tokens: 4000,
      system: CANDIDATE_RANKER_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userMessage },
        { role: "assistant", content: ASSISTANT_PREFILL },
      ],
    },
    { signal: opts.signal },
  );

  // Reassemble the prefilled text plus the model's continuation.
  const continuation = response.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
  const raw = ASSISTANT_PREFILL + continuation;

  const parsed = CandidateRankerOutputSchema.parse(JSON.parse(raw));
  return { parsed, raw, sanitizedInput: sanitized };
}
