import OpenAI from "openai";

// OpenAI text-embedding-3-small returns 1536 dimensions, matching the
// vector(1536) columns declared in supabase/migrations/20260512230400_init.sql.
const MODEL = "text-embedding-3-small";
const MAX_BATCH = 96; // OpenAI accepts up to 2048; keep batches conservative.

type EmbeddingClient = {
  embedMany(texts: string[]): Promise<number[][]>;
};

export function createEmbeddingClient(): EmbeddingClient {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY missing. Set it in .env.local before running the seed.",
    );
  }
  const client = new OpenAI({ apiKey });

  return {
    async embedMany(texts: string[]): Promise<number[][]> {
      const out: number[][] = [];
      for (let i = 0; i < texts.length; i += MAX_BATCH) {
        const chunk = texts.slice(i, i + MAX_BATCH);
        const res = await client.embeddings.create({
          model: MODEL,
          input: chunk,
        });
        for (const item of res.data) {
          out.push(item.embedding);
        }
      }
      return out;
    },
  };
}

// pgvector accepts the embedding as a string in the form `[0.1,0.2,...]`
// (or as JSON-encoded number array, but the bracketed string is the
// canonical literal for COPY/INSERT). We use the canonical form.
export function pgvectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}
