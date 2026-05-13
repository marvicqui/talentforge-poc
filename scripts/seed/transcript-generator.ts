/**
 * Generates a realistic interview transcript for the seed data.
 *
 * Not one of the 5 production agents — lives in scripts/ because it is only
 * used to populate the demo. The Interview Analyzer Agent (Fase 6) consumes
 * the output of this generator.
 *
 * Calibration targets: "strong_yes" | "yes" | "maybe_no".
 *   strong_yes: candidate gives fluent, detailed, technically precise answers.
 *               Demonstrates depth on every must-have skill of the job.
 *   yes:        candidate is solid overall but has 1-2 visible minor gaps.
 *   maybe_no:   candidate has notable knowledge gaps, gives vague answers,
 *               and / or shows mismatched seniority signals.
 *
 * Language behavior by CEFR:
 *   A1-A2:      monolingual Spanish; interviewer accommodates.
 *   B1-B2:      mostly Spanish; 1-2 segments in English with mild errors.
 *   C1-C2:      mixed Spanish + English fluently.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const SEGMENT_SCHEMA = z.object({
  speaker: z.enum(["interviewer", "candidate"]),
  language: z.enum(["es", "en", "mixed"]),
  // duration in seconds — converted to start_ms/end_ms during persistence.
  duration_seconds: z.coerce.number().int().min(2).max(420),
  text: z.string().min(2),
});

const OUTPUT_SCHEMA = z.object({
  language: z.enum(["es", "en", "mixed"]),
  segments: z.array(SEGMENT_SCHEMA).min(20).max(120),
});

export type TranscriptCalibration = "strong_yes" | "yes" | "maybe_no";

export type GenerateTranscriptInput = {
  jobTitle: string;
  jobCompany: string;
  jobDescription: string;
  jobEnglishMinCefr: string | null;
  candidate: {
    full_name: string;
    seniority: string | null;
    english_cefr: string | null;
    country: string | null;
    skills: Array<{ name: string; years_experience: number }>;
    summary: string;
  };
  calibration: TranscriptCalibration;
  targetMinutes: number; // 28-38 typical
};

export type GeneratedTranscript = z.infer<typeof OUTPUT_SCHEMA>;

const SYSTEM_PROMPT = `You generate a realistic technical interview transcript for our demo seed data.

You output ONLY valid JSON with this shape:
{
  "language": "es" | "en" | "mixed",
  "segments": [
    { "speaker": "interviewer" | "candidate", "language": "es" | "en" | "mixed", "duration_seconds": int (2..420), "text": "string" }
  ]
}

RULES:

1. Output ONLY the JSON. No markdown. Begin with { and end with }.
2. The interview has 6 phases in order:
   a) Intro & rapport (3-5 minutes)
   b) Candidate background (5-8 minutes)
   c) Technical core: 3-5 deep technical questions on the must-have skills (10-15 minutes)
   d) Practical case / system design (5-8 minutes)
   e) Behavioral STAR (3-5 minutes)
   f) Closing (2-3 minutes)
3. Total target minutes is provided. Distribute segments accordingly.
4. Segment duration_seconds must reflect the natural speaking time of the text (use ~150 words per minute as the rate). Interviewer questions are usually 8-30 seconds; candidate answers vary from 15 to 300 seconds.
5. Calibration target controls candidate quality. Reflect it in the candidate turns:
   - strong_yes: fluent, structured answers; concrete examples; demonstrates depth on EVERY must-have skill; pushes back constructively on the interviewer where useful.
   - yes: solid overall; shows 1-2 minor gaps where they acknowledge limited experience but recover well.
   - maybe_no: visible gaps; vague or generic answers on at least 2 must-have skills; mismatched seniority signals (e.g., over-reliance on past team, can't explain trade-offs); some hesitation.
6. Language behavior depends on candidate CEFR:
   - A1/A2: entire transcript in Spanish. interviewer accommodates.
   - B1/B2: mostly Spanish; 1-3 short candidate segments in English with mild errors (article omissions, verb tense slips). Mark those as language="en".
   - C1/C2: mixed Spanish + English fluently. Several segments mixed. Mark those as language="mixed".
7. Use canonical, plausible details from the job description (frameworks, tools). Do NOT invent fake URLs, papers, or specific dollar amounts that the candidate "negotiated". Keep claims realistic for the candidate's seniority.
8. Use the candidate's full_name only in the intro greeting (once or twice). Do NOT mention university or gender.
9. Avoid clichés ("synergy", "out-of-the-box thinker"). Sound like a real engineer talking.
10. Reasonable total: ~3000-5000 words (counting the text across all segments).`;

function getModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

function buildUserPrompt(input: GenerateTranscriptInput): string {
  const skillsLine = input.candidate.skills
    .map((s) => `${s.name} (${s.years_experience}y)`)
    .join(", ");
  return [
    `# Job`,
    `Title: ${input.jobTitle}`,
    `Company: ${input.jobCompany}`,
    `Required English: ${input.jobEnglishMinCefr ?? "—"}`,
    "",
    `## JD (excerpt)`,
    input.jobDescription.slice(0, 2400),
    "",
    `# Candidate`,
    `Name: ${input.candidate.full_name}`,
    `Seniority: ${input.candidate.seniority ?? "—"}`,
    `English CEFR: ${input.candidate.english_cefr ?? "—"}`,
    `Country: ${input.candidate.country ?? "—"}`,
    `Skills: ${skillsLine}`,
    "",
    `Summary:`,
    input.candidate.summary,
    "",
    `# Generation parameters`,
    `Calibration target: ${input.calibration}`,
    `Target total minutes: ${input.targetMinutes}`,
    "",
    `Return the JSON object now.`,
  ].join("\n");
}

const ASSISTANT_PREFILL = "{";

export async function generateTranscript(
  input: GenerateTranscriptInput,
): Promise<GeneratedTranscript> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: getModel(),
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildUserPrompt(input) },
      { role: "assistant", content: ASSISTANT_PREFILL },
    ],
  });

  const continuation = response.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
  const raw = ASSISTANT_PREFILL + continuation;
  return OUTPUT_SCHEMA.parse(JSON.parse(raw));
}

/** Convert relative duration_seconds into absolute start_ms/end_ms. */
export function withAbsoluteTimestamps(t: GeneratedTranscript): {
  segments: Array<{
    speaker: "interviewer" | "candidate";
    language: "es" | "en" | "mixed";
    start_ms: number;
    end_ms: number;
    text: string;
  }>;
  totalDurationMs: number;
} {
  let cursor = 0;
  const segments = t.segments.map((s) => {
    const start = cursor;
    const end = cursor + s.duration_seconds * 1000;
    cursor = end;
    return {
      speaker: s.speaker,
      language: s.language,
      start_ms: start,
      end_ms: end,
      text: s.text,
    };
  });
  return { segments, totalDurationMs: cursor };
}

export function transcriptToRawText(t: GeneratedTranscript): string {
  return t.segments
    .map((s) => `${s.speaker === "interviewer" ? "ENTREVISTADOR" : "CANDIDATO"}: ${s.text}`)
    .join("\n\n");
}
