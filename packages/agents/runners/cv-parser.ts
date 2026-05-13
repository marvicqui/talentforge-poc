import Anthropic from "@anthropic-ai/sdk";

import { CV_PARSER_SYSTEM_PROMPT } from "../prompts/cv-parser";
import {
  CvParserOutputSchema,
  type CvParserOutput,
} from "../schemas/cv-parser";

const ASSISTANT_PREFILL = "{";

function getModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

export type ParseCvOptions = {
  pdfBase64: string; // base64 of the PDF bytes
  apiKey?: string;
  signal?: AbortSignal;
};

/**
 * Sends a PDF to Claude (native PDF support) and asks for a structured
 * candidate profile.
 */
export async function parseCv(
  opts: ParseCvOptions,
): Promise<{ parsed: CvParserOutput; raw: string }> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create(
    {
      model: getModel(),
      max_tokens: 4000,
      system: CV_PARSER_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: opts.pdfBase64,
              },
            },
            {
              type: "text",
              text: "Extract the structured profile from this CV and return only the JSON object.",
            },
          ],
        },
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
  const parsed = CvParserOutputSchema.parse(JSON.parse(raw));
  return { parsed, raw };
}
