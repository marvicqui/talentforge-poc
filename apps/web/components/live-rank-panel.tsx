"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { scoreColorClass, recColorClass, fmtRecommendation } from "@/lib/format";

type Parsed = {
  overall_score: number;
  recommendation: string;
  match_reasoning: string;
};

type StreamEvent =
  | { type: "thinking"; text: string }
  | { type: "answer"; text: string }
  | { type: "done"; parsed: Parsed }
  | { type: "error"; message: string };

export function LiveRankPanel({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState("");
  const [answer, setAnswer] = useState("");
  const [done, setDone] = useState<Parsed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const router = useRouter();

  async function start() {
    setOpen(true);
    setThinking("");
    setAnswer("");
    setDone(null);
    setError(null);
    setRunning(true);
    try {
      const res = await fetch(
        `/api/applications/${applicationId}/rank-stream`,
        { method: "POST" },
      );
      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${detail || res.statusText}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            const ev = JSON.parse(json) as StreamEvent;
            if (ev.type === "thinking") {
              setThinking((s) => s + ev.text);
            } else if (ev.type === "answer") {
              setAnswer((s) => s + ev.text);
            } else if (ev.type === "done") {
              setDone(ev.parsed);
              // refresh the page data so the new score appears in the card
              router.refresh();
            } else if (ev.type === "error") {
              setError(ev.message);
            }
          } catch {
            // ignore malformed
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={running}
        className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium hover:bg-primary/20 disabled:opacity-60"
        title="Ver al agente razonar paso a paso (extended thinking)"
      >
        ✨ {running ? "Analizando…" : "Ver agente pensando"}
      </button>

      {open ? (
        <div className="mt-3 rounded-md border border-border bg-card p-4 space-y-3">
          <header className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Extended thinking · Claude Haiku 4.5
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
              title="Cerrar"
            >
              ✕
            </button>
          </header>
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}

          {thinking ? (
            <section className="rounded-md bg-secondary/40 p-3 max-h-72 overflow-y-auto">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Razonamiento (interno)
              </p>
              <pre className="whitespace-pre-wrap break-words text-xs text-foreground/80 font-mono">
                {thinking}
              </pre>
            </section>
          ) : (
            <p className="text-xs italic text-muted-foreground">
              {running ? "Esperando primer token..." : "Click para arrancar."}
            </p>
          )}

          {answer ? (
            <section className="rounded-md bg-background border border-border p-3 max-h-48 overflow-y-auto">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Respuesta estructurada (JSON)
              </p>
              <pre className="whitespace-pre-wrap break-words text-xs text-foreground/90 font-mono">
                {answer}
              </pre>
            </section>
          ) : null}

          {done ? (
            <section className="rounded-md border border-emerald-500/40 bg-emerald-50 p-3 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-emerald-900">
                Nuevo score guardado en applications.
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={
                    "tabular-nums rounded-md px-2 py-1 text-sm font-semibold " +
                    scoreColorClass(done.overall_score)
                  }
                >
                  {done.overall_score}
                </span>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-xs font-medium " +
                    recColorClass(done.recommendation)
                  }
                >
                  {fmtRecommendation(done.recommendation)}
                </span>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
