// Lightweight wrapper around OpenAI text-embedding-3-small for runtime use
// (server actions / API routes). Returns the canonical pgvector literal.
import OpenAI from "openai";

const MODEL = "text-embedding-3-small";

export async function computeEmbedding(text: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const client = new OpenAI({ apiKey });
  const res = await client.embeddings.create({
    model: MODEL,
    input: text,
  });
  const v = res.data[0]?.embedding;
  if (!v || v.length === 0) throw new Error("Empty embedding");
  return `[${v.join(",")}]`;
}
