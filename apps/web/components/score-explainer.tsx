"use client";

import { useEffect, useRef, useState } from "react";

export function ScoreExplainer({
  label = "¿Cómo se calcula?",
}: {
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-0.5 bg-background hover:bg-secondary transition-colors"
        aria-expanded={open}
        title={label}
      >
        <span aria-hidden>ⓘ</span>
        <span>{label}</span>
      </button>
      {open ? (
        <div
          role="dialog"
          className="absolute z-30 right-0 mt-2 w-96 max-w-[min(96vw,28rem)] rounded-lg border border-border bg-card shadow-xl p-4 text-sm text-card-foreground space-y-3"
        >
          <p className="font-semibold text-base">¿Cómo se calcula el score?</p>
          <p className="text-foreground/90">
            Un agente de IA (Claude Haiku 4.5) evalúa al candidato contra la JD
            en <strong>5 dimensiones</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1 text-foreground/90 text-xs">
            <li>
              <strong>Skills</strong> — años requeridos vs años del candidato.
            </li>
            <li>
              <strong>Calidad de experiencia</strong> — dominio, recency,
              complejidad de lo entregado.
            </li>
            <li>
              <strong>Seniority</strong> declarada vs experiencia real.
            </li>
            <li>
              <strong>Inglés</strong> (CEFR) vs requerimiento del rol.
            </li>
            <li>
              <strong>Modalidad / locación</strong> compatibles.
            </li>
          </ul>
          <div className="rounded-md border border-border bg-secondary/40 p-2 text-xs space-y-1">
            <p className="font-medium">Escala</p>
            <p>
              <span className="inline-block w-14 text-emerald-700 font-medium">
                85-100
              </span>{" "}
              strong yes
            </p>
            <p>
              <span className="inline-block w-14 text-emerald-600 font-medium">
                70-84
              </span>{" "}
              yes
            </p>
            <p>
              <span className="inline-block w-14 text-amber-600 font-medium">
                50-69
              </span>{" "}
              maybe
            </p>
            <p>
              <span className="inline-block w-14 text-destructive font-medium">
                0-49
              </span>{" "}
              no / strong no
            </p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
            <p className="font-medium">Anti-bias por diseño</p>
            <p>
              El agente <strong>nunca recibe</strong> nombre, género ni
              universidad — se redactan antes de la llamada. Cada decisión
              queda con <strong>citas textuales</strong> del CV como evidencia.
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Cada llamada queda registrada en <code>agent_traces</code> con
            input redactado y output completo — auditable.
          </p>
        </div>
      ) : null}
    </div>
  );
}
