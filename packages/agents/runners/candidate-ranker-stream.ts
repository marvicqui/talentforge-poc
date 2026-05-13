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

export type RankCandidateStreamOptions = {
  job: JobForRanker;
  candidate: RawCandidateForSanitize;
  apiKey?: string;
  signal?: AbortSignal;
};

export type RankCandidateStreamEvent =
  | { type: "thinking"; text: string }
  | { type: "answer"; text: string }
  | { type: "done"; parsed: CandidateRankerOutput; raw: string; sanitizedInput: SanitizedCandidate }
  | { type: "error"; message: string };

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
 * Streams the Candidate Ranker with **extended thinking** enabled (Claude
 * Haiku 4.5+). Emits separate events for thinking text and final answer text,
 * plus a terminal `done` with the parsed schema.
 *
 * Anthropic SDK ^0.30 doesn't expose `thinking` in its public types yet,
 * so we widen the param via `unknown` cast (runtime supports it).
 */
export async function* rankCandidateStream(
  opts: RankCandidateStreamOptions,
): AsyncGenerator<RankCandidateStreamEvent, void, void> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    yield { type: "error", message: "ANTHROPIC_API_KEY missing." };
    return;
  }
  const client = new Anthropic({ apiKey });

  const sanitized = sanitizeCandidate(opts.candidate);
  const userMessage = buildUserMessage(opts.job, sanitized);

  // We can't prefill the assistant when extended thinking is enabled — the
  // model needs to produce the thinking block first. So we ask the model
  // explicitly to start its final answer with `{` and never wrap it.
  const requestParams: unknown = {
    model: getModel(),
    max_tokens: 6500,
    thinking: { type: "enabled", budget_tokens: 2000 },
    system:
      CANDIDATE_RANKER_SYSTEM_PROMPT +
      "\n\nIMPORTANT: Use the thinking block to reason about the candidate. Then your final answer MUST begin with `{` and end with `}` — no preamble.",
    messages: [{ role: "user", content: userMessage }],
  };

  let answer = "";
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = (client.messages.stream as any)(requestParams, {
      signal: opts.signal,
    });

    for await (const event of stream as AsyncIterable<unknown>) {
      // SDK <0.40 doesn't type thinking_delta; treat events as loose JSON.
      const ev = event as {
        type?: string;
        delta?: { type?: string; text?: string; thinking?: string };
      };
      if (ev.type === "content_block_delta" && ev.delta) {
        if (ev.delta.type === "thinking_delta") {
          const t = ev.delta.thinking ?? "";
          if (t) yield { type: "thinking", text: t };
        } else if (ev.delta.type === "text_delta") {
          const t = ev.delta.text ?? "";
          answer += t;
          if (t) yield { type: "answer", text: t };
        }
      }
    }

    // Parse the final answer JSON
    const trimmed = answer.trim();
    const start = trimmed.indexOf("{");
    const jsonStr = start >= 0 ? trimmed.slice(start) : trimmed;
    const parsed = CandidateRankerOutputSchema.parse(JSON.parse(jsonStr));
    yield {
      type: "done",
      parsed,
      raw: answer,
      sanitizedInput: sanitized,
    };
  } catch (err: unknown) {
    yield {
      type: "error",
      message:
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Unknown error",
    };
  }
}
