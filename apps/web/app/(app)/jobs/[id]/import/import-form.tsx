"use client";

import { useCallback, useRef, useState } from "react";

import { recColorClass, scoreColorClass, fmtRecommendation } from "@/lib/format";

type ImportResult = {
  filename: string;
  candidate_id?: string;
  full_name?: string;
  seniority?: string;
  country?: string | null;
  score?: number;
  recommendation?: string;
  error?: string;
};

const MAX_FILES = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const CONCURRENCY = 3;

export function ImportForm({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Map<string, ImportResult>>(new Map());
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = useCallback((list: FileList | File[]) => {
    const arr = Array.from(list).filter((f) => {
      if (f.size > MAX_BYTES) return false;
      if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
        return false;
      }
      return true;
    });
    setFiles((cur) => {
      const seen = new Set(cur.map((f) => f.name + f.size));
      const merged = [...cur];
      for (const f of arr) {
        if (seen.has(f.name + f.size)) continue;
        merged.push(f);
        seen.add(f.name + f.size);
        if (merged.length >= MAX_FILES) break;
      }
      return merged;
    });
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) accept(e.dataTransfer.files);
  };

  async function processOne(file: File) {
    setResults((cur) =>
      new Map(cur).set(file.name, { filename: file.name }),
    );
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/jobs/${jobId}/import-cv`, {
        method: "POST",
        body: form,
      });
      const json = (await res.json().catch(() => ({}))) as ImportResult;
      if (!res.ok) {
        setResults((cur) =>
          new Map(cur).set(file.name, {
            filename: file.name,
            error: json.error ?? `HTTP ${res.status}`,
          }),
        );
        return;
      }
      setResults((cur) => new Map(cur).set(file.name, json));
    } catch (err: unknown) {
      setResults((cur) =>
        new Map(cur).set(file.name, {
          filename: file.name,
          error: err instanceof Error ? err.message : "Unknown error",
        }),
      );
    }
  }

  async function startProcessing() {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);
    const queue = [...files];
    async function worker() {
      while (queue.length) {
        const file = queue.shift();
        if (!file) return;
        await processOne(file);
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker()),
    );
    setProcessing(false);
    setDone(true);
  }

  const sortedResults = Array.from(results.values()).sort((a, b) => {
    const sa = a.score ?? -1;
    const sb = b.score ?? -1;
    return sb - sa;
  });

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-border p-10 text-center hover:bg-secondary/30 transition-colors"
      >
        <p className="text-sm text-foreground">
          <strong>Suelta los PDFs aquí</strong> o haz click para seleccionarlos.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Máx {MAX_FILES} archivos · 5 MB por PDF · sólo .pdf
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && accept(e.target.files)}
        />
      </div>

      {files.length > 0 && !processing && results.size === 0 ? (
        <div className="rounded-md border border-border bg-card p-4 space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {files.length} archivo(s) seleccionado(s)
          </p>
          <ul className="space-y-1 text-sm text-foreground">
            {files.map((f) => (
              <li key={f.name} className="flex items-center justify-between">
                <span>{f.name}</span>
                <button
                  onClick={() =>
                    setFiles((cur) => cur.filter((x) => x.name !== f.name))
                  }
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={startProcessing}
            className="w-full mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Procesar {files.length} CV{files.length === 1 ? "" : "s"} con IA →
          </button>
        </div>
      ) : null}

      {results.size > 0 ? (
        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Procesamiento
            </h2>
            <p className="text-xs text-muted-foreground">
              {[...results.values()].filter((r) => r.score != null).length} /{" "}
              {files.length} listos
            </p>
          </header>
          <ul className="space-y-2">
            {sortedResults.map((r) => (
              <li
                key={r.filename}
                className="rounded-md border border-border bg-card px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {r.full_name ?? r.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.filename}
                    {r.seniority ? ` · ${r.seniority}` : ""}
                    {r.country ? ` · ${r.country}` : ""}
                  </p>
                  {r.error ? (
                    <p className="text-xs text-destructive mt-1">{r.error}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {r.recommendation ? (
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium " +
                        recColorClass(r.recommendation)
                      }
                    >
                      {fmtRecommendation(r.recommendation)}
                    </span>
                  ) : null}
                  {r.score != null ? (
                    <span
                      className={
                        "tabular-nums rounded-md px-2 py-1 text-sm font-semibold " +
                        scoreColorClass(r.score)
                      }
                    >
                      {r.score}
                    </span>
                  ) : r.error ? (
                    <span className="text-xs italic text-destructive">
                      error
                    </span>
                  ) : (
                    <span className="text-xs italic text-muted-foreground animate-pulse">
                      procesando…
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {done ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 flex items-center justify-between gap-3 flex-wrap">
          <span>
            ✓ Procesamiento terminado para <strong>{jobTitle}</strong>.
          </span>
          <a
            href={`/jobs/${jobId}?tab=candidatos`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ver ranking completo →
          </a>
        </div>
      ) : null}
    </div>
  );
}
