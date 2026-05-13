import Anthropic from "@anthropic-ai/sdk";

import { INTERVIEW_ANALYZER_SYSTEM_PROMPT } from "../prompts/interview-analyzer";
import {
  InterviewAnalyzerOutputSchema,
  type InterviewAnalyzerOutput,
} from "../schemas/interview-analyzer";

const ASSISTANT_PREFILL = "{";

function getModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

type TranscriptSegment = {
  speaker: "interviewer" | "candidate";
  language: "es" | "en" | "mixed";
  start_ms: number;
  end_ms: number;
  text: string;
};

export type JobForInterviewAnalyzer = {
  title: string;
  description_raw: string;
  english_min_cefr: string | null;
};

export type AnalyzeInterviewOptions = {
  job: JobForInterviewAnalyzer;
  transcript: {
    language: "es" | "en" | "mixed";
    segments: TranscriptSegment[];
  };
  apiKey?: string;
  signal?: AbortSignal;
};

function formatSegments(segments: TranscriptSegment[]): string {
  return segments
    .map(
      (s) =>
        `[${s.start_ms}ms · ${s.speaker} · ${s.language}] ${s.text}`,
    )
    .join("\n\n");
}

export async function analyzeInterview(
  opts: AnalyzeInterviewOptions,
): Promise<{ parsed: InterviewAnalyzerOutput; raw: string }> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const client = new Anthropic({ apiKey });

  const userMessage = [
    `# Job`,
    `Title: ${opts.job.title}`,
    `English minimum: ${opts.job.english_min_cefr ?? "-"}`,
    "",
    `JD (excerpt):`,
    opts.job.description_raw.slice(0, 2000),
    "",
    `# Interview transcript`,
    `Language label: ${opts.transcript.language}`,
    `Segments (timestamp ms, speaker, language, text):`,
    "",
    formatSegments(opts.transcript.segments),
    "",
    `Return the JSON report.`,
  ].join("\n");

  const response = await client.messages.create(
    {
      model: getModel(),
      max_tokens: 6500,
      system: INTERVIEW_ANALYZER_SYSTEM_PROMPT,
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
  const parsed = InterviewAnalyzerOutputSchema.parse(JSON.parse(raw));
  return { parsed, raw };
}
