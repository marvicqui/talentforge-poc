import { z } from "zod";

import { computeEmbedding } from "@/lib/embeddings";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 15;

const BodySchema = z.object({
  q: z.string().min(3).max(500),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

type SearchHit = {
  candidate_id: string;
  similarity: number;
  full_name: string;
  country: string | null;
  seniority: string | null;
  english_cefr: string | null;
  match_score: number | null;
  job_title: string | null;
  job_id: string | null;
};

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parse = BodySchema.safeParse(body);
  if (!parse.success) {
    return new Response(
      JSON.stringify({ error: "Invalid body", details: parse.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const { q, limit = 10 } = parse.data;

  // 1) Compute the query embedding
  let queryEmbedding: string;
  try {
    queryEmbedding = await computeEmbedding(q);
  } catch (err: unknown) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Embedding failed" },
      { status: 500 },
    );
  }

  // 2) Vector search via RPC
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: matches, error } = await (supabase as any).rpc(
    "match_candidate_profiles",
    {
      query_embedding: queryEmbedding,
      match_count: limit,
    },
  );
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // 3) Enrich with candidate + best application info
  const ids = (matches ?? []).map((m: { candidate_id: string }) => m.candidate_id);
  if (ids.length === 0) {
    return Response.json({ hits: [] as SearchHit[] });
  }

  const { data: candData } = await supabase
    .from("candidates")
    .select(
      `id, full_name, country, seniority, english_cefr,
       applications (match_score, jobs (id, title))`,
    )
    .in("id", ids);

  type AppLite = { match_score: number | null; jobs: { id: string; title: string } | null };
  type CandRow = {
    id: string;
    full_name: string;
    country: string | null;
    seniority: string | null;
    english_cefr: string | null;
    applications: AppLite[] | null;
  };
  const candMap = new Map<string, CandRow>();
  for (const c of (candData ?? []) as CandRow[]) candMap.set(c.id, c);

  const hits: SearchHit[] = (matches ?? [])
    .map(
      (m: { candidate_id: string; similarity: number }): SearchHit | null => {
        const c = candMap.get(m.candidate_id);
        if (!c) return null;
        const apps = c.applications ?? [];
        const best = apps.reduce<AppLite | null>((acc, cur) => {
          if (!acc) return cur;
          if ((cur.match_score ?? -1) > (acc.match_score ?? -1)) return cur;
          return acc;
        }, null);
        return {
          candidate_id: c.id,
          similarity: m.similarity,
          full_name: c.full_name,
          country: c.country,
          seniority: c.seniority,
          english_cefr: c.english_cefr,
          match_score: best?.match_score ?? null,
          job_title: best?.jobs?.title ?? null,
          job_id: best?.jobs?.id ?? null,
        };
      },
    )
    .filter((h: SearchHit | null): h is SearchHit => h !== null);

  return Response.json({ hits });
}
