import Anthropic from "@anthropic-ai/sdk";

import { JOB_ANALYZER_SYSTEM_PROMPT } from "../prompts/job-analyzer";
import {
  JobAnalyzerOutputSchema,
  type JobAnalyzerOutput,
} from "../schemas/job-analyzer";

// Prefill technique: we start the assistant turn with "{" so Claude must
// continue valid JSON. This is the most reliable JSON mode for Claude today.
const ASSISTANT_PREFILL = "{";

function getModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

export type AnalyzeJobEvent =
  | { type: "delta"; text: string }
  | { type: "done"; parsed: JobAnalyzerOutput; raw: string }
  | { type: "error"; message: string };

export type AnalyzeJobOptions = {
  description: string;
  apiKey?: string;
  signal?: AbortSignal;
};

/**
 * Streams the Job Analyzer output. Each yielded event is either a
 * text delta (raw JSON characters as Claude emits them), or a terminal
 * `done` (with parsed/validated result) or `error`.
 */
export async function* analyzeJob(
  opts: AnalyzeJobOptions,
): AsyncGenerator<AnalyzeJobEvent, void, void> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    yield { type: "error", message: "ANTHROPIC_API_KEY missing." };
    return;
  }

  const client = new Anthropic({ apiKey });

  let text = ASSISTANT_PREFILL;
  try {
    const stream = client.messages.stream(
      {
        model: getModel(),
        max_tokens: 1500,
        system: JOB_ANALYZER_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analyze the following job description and return the ICP JSON.\n\n---\n\n${opts.description}`,
          },
          { role: "assistant", content: ASSISTANT_PREFILL },
        ],
      },
      { signal: opts.signal },
    );

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        text += event.delta.text;
        yield { type: "delta", text: event.delta.text };
      }
    }

    const parsed = JSON.parse(text);
    const validated = JobAnalyzerOutputSchema.parse(parsed);
    yield { type: "done", parsed: validated, raw: text };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Unknown error";
    yield { type: "error", message };
  }
}
