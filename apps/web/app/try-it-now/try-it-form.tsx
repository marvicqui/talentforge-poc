"use client";

import { useState } from "react";

import { SAMPLE_JD } from "./sample-jd";

type Parsed = {
  title: string;
  seniority: string;
  must_have_skills: string[];
  nice_to_have_skills: string[];
  soft_skills: string[];
  languages: { code: string; cefr: string }[];
  years_experience_min: number;
  modality: string;
  red_flags_to_avoid: string[];
  ideal_candidate_summary: string;
};

type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; parsed: Parsed; raw: string }
  | { type: "error"; message: string };

export function TryItForm({ calendlyUrl }: { calendlyUrl: string | null }) {
  const [description, setDescription] = useState(SAMPLE_JD);
  const [streamingText, setStreamingText] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setStreamingText("");
    setParsed(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${detail || res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by blank lines.
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            const ev = JSON.parse(json) as StreamEvent;
            if (ev.type === "delta") {
              setStreamingText((prev) => prev + ev.text);
            } else if (ev.type === "done") {
              setParsed(ev.parsed);
            } else if (ev.type === "error") {
              setError(ev.message);
            }
          } catch {
            // Ignore malformed frames; backend always emits valid JSON.
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Pega tu Job Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={14}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Pega aquí la JD..."
          />
        </label>
        <button
          onClick={analyze}
          disabled={loading || description.trim().length < 40}
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {loading ? "Analizando…" : "Analizar con IA"}
        </button>
      </section>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {streamingText && !parsed ? (
        <section className="rounded-md border border-border bg-secondary p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Generando ICP…
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs font-mono text-foreground">
            {streamingText}
          </pre>
        </section>
      ) : null}

      {parsed ? (
        <section className="space-y-6">
          <div className="rounded-md border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Ideal Candidate Profile
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-card-foreground">
              {parsed.title}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Chip>{parsed.seniority}</Chip>
              <Chip>{parsed.modality}</Chip>
              <Chip>{parsed.years_experience_min}+ años</Chip>
              {parsed.languages.map((l) => (
                <Chip key={l.code}>
                  {l.code.toUpperCase()} {l.cefr}
                </Chip>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {parsed.ideal_candidate_summary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkillCard title="Must-have" items={parsed.must_have_skills} />
            <SkillCard title="Nice-to-have" items={parsed.nice_to_have_skills} />
            <SkillCard title="Soft skills" items={parsed.soft_skills} />
            <SkillCard
              title="Red flags a evitar"
              items={parsed.red_flags_to_avoid}
              variant="warning"
            />
          </div>

          <div className="sticky bottom-4">
            <div className="rounded-lg border border-border bg-primary px-6 py-4 text-primary-foreground shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  ¿Querés ver candidatos rankeados para esta vacante?
                </p>
                <p className="text-xs opacity-80">
                  Agenda una demo de 30 min y te mostramos el match-engine
                  completo.
                </p>
              </div>
              {calendlyUrl ? (
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow hover:bg-secondary transition-colors"
                >
                  Agendar demo
                </a>
              ) : (
                <span className="text-xs italic opacity-80">
                  Demo agendamiento se configura en producción.
                </span>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
      {children}
    </span>
  );
}

function SkillCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: "warning";
}) {
  const isWarning = variant === "warning";
  return (
    <div
      className={
        "rounded-md border p-4 " +
        (isWarning
          ? "border-destructive/40 bg-destructive/5"
          : "border-border bg-card")
      }
    >
      <p
        className={
          "text-xs uppercase tracking-wider " +
          (isWarning ? "text-destructive" : "text-muted-foreground")
        }
      >
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground italic">—</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <li
              key={`${title}-${i}`}
              className={
                "rounded-md border px-2 py-1 text-xs " +
                (isWarning
                  ? "border-destructive/30 bg-background text-destructive"
                  : "border-border bg-background text-foreground")
              }
            >
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
