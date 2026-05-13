"use client";

import { useState } from "react";
import Link from "next/link";

import { scoreColorClass } from "@/lib/format";

type Hit = {
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

const SAMPLE_QUERIES = [
  "candidatos con experiencia fintech en LATAM e inglés B2+",
  "ingenieros de DevOps fuertes en Kubernetes y observability",
  "perfiles AI/ML con LangChain en producción",
  "senior Full-Stack con Next.js App Router",
];

export function SemanticSearch() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search(query?: string) {
    const term = (query ?? q).trim();
    if (term.length < 3) return;
    setQ(term);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/search-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: term, limit: 8 }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${await res.text()}`);
      }
      const json = (await res.json()) as { hits: Hit[] };
      setHits(json.hits);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-md border border-border bg-card p-5 space-y-3" data-ai-only>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Búsqueda semántica
        </p>
        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium">
          pgvector + embeddings
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Describí en lenguaje natural qué candidato querés. El motor busca por
        similitud semántica contra los embeddings de los perfiles.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ej: senior DevOps con experiencia en e-commerce y observability"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || q.trim().length < 3}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5 text-xs">
        {SAMPLE_QUERIES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => search(s)}
            className="rounded-full border border-border bg-background px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            {s}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}

      {hits ? (
        hits.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">Sin resultados.</p>
        ) : (
          <ol className="space-y-1.5 mt-2">
            {hits.map((h, i) => (
              <li
                key={h.candidate_id}
                className="rounded-md border border-border bg-background px-3 py-2 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      #{i + 1}
                    </span>
                    <Link
                      href={`/candidates/${h.candidate_id}${h.job_id ? `?job=${h.job_id}` : ""}`}
                      className="text-sm font-medium text-foreground hover:underline truncate"
                    >
                      {h.full_name}
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[h.seniority, h.country, h.english_cefr ? `EN ${h.english_cefr}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                    {h.job_title ? ` · best fit: ${h.job_title}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    sim {Math.round(h.similarity * 100)}%
                  </span>
                  {h.match_score != null ? (
                    <span
                      className={
                        "tabular-nums rounded-md px-2 py-0.5 text-xs font-medium " +
                        scoreColorClass(h.match_score)
                      }
                    >
                      {h.match_score}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )
      ) : null}
    </section>
  );
}
