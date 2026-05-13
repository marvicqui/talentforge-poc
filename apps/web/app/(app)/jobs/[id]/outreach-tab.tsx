"use client";

import { useState } from "react";

import { fmtRecommendation, recColorClass } from "@/lib/format";

export type OutreachAppRow = {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  country: string | null;
  phoneE164: string | null;
  recommendation: string | null;
  stage: string;
  isVerifiedNumber: boolean;
  lastOutboundAt: string | null;
};

type Variant = {
  tag: "A" | "B";
  style: string;
  message: string;
  char_count: number;
  personalization_notes: string[];
};

type ComposeState = {
  variants: Variant[] | null;
  loading: boolean;
  error: string | null;
};

type SendState = {
  status: "idle" | "sending" | "sent" | "simulated" | "error";
  message?: string;
  variantTag?: "A" | "B";
};

export function OutreachTab({ rows }: { rows: OutreachAppRow[] }) {
  return (
    <section className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Outreach por WhatsApp. Los números no verificados en Twilio Sandbox se
        envían en{" "}
        <span className="font-medium text-foreground">modo simulado</span>: la
        IA genera el mensaje y queda guardado pero no se entrega.
      </p>
      <ol className="space-y-3">
        {rows.length === 0 ? (
          <li className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No hay candidatos en stages aptos para outreach.
          </li>
        ) : null}
        {rows.map((r) => (
          <OutreachRow key={r.applicationId} row={r} />
        ))}
      </ol>
    </section>
  );
}

function OutreachRow({ row }: { row: OutreachAppRow }) {
  const [open, setOpen] = useState(false);
  const [compose, setCompose] = useState<ComposeState>({
    variants: null,
    loading: false,
    error: null,
  });
  const [send, setSend] = useState<SendState>({ status: "idle" });
  const [edited, setEdited] = useState<Record<"A" | "B", string>>({
    A: "",
    B: "",
  });

  async function doCompose() {
    setCompose({ variants: null, loading: true, error: null });
    try {
      const res = await fetch("/api/outreach/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: row.applicationId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
      const json = (await res.json()) as { variants: Variant[] };
      setCompose({ variants: json.variants, loading: false, error: null });
      const edits: Record<"A" | "B", string> = { A: "", B: "" };
      for (const v of json.variants) edits[v.tag] = v.message;
      setEdited(edits);
    } catch (err: unknown) {
      setCompose({
        variants: null,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  async function doSend(tag: "A" | "B") {
    const message = edited[tag];
    if (!message || message.length < 20 || message.length > 1024) {
      setSend({
        status: "error",
        message: "Mensaje fuera de rango (20-1024 caracteres).",
        variantTag: tag,
      });
      return;
    }
    setSend({ status: "sending", variantTag: tag });
    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: row.applicationId,
          message,
          variantTag: tag,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
      const json = (await res.json()) as { status: "sent" | "simulated" };
      setSend({
        status: json.status,
        variantTag: tag,
        message:
          json.status === "sent"
            ? "Mensaje enviado por WhatsApp."
            : "Modo simulado: el mensaje se guardó pero no se envió.",
      });
    } catch (err: unknown) {
      setSend({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown",
        variantTag: tag,
      });
    }
  }

  const tail = row.phoneE164 ? row.phoneE164.slice(-4) : "—";

  return (
    <li className="rounded-md border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-card-foreground">
            {row.candidateName}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.country ?? "—"} · WhatsApp ending in •••{tail} ·{" "}
            <span className="capitalize">{row.stage}</span>
            {row.recommendation ? (
              <span
                className={
                  "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium " +
                  recColorClass(row.recommendation)
                }
              >
                {fmtRecommendation(row.recommendation)}
              </span>
            ) : null}
            {row.isVerifiedNumber ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                ✓ verified (envío real)
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                modo simulado
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            setOpen((o) => !o);
            if (!compose.variants && !compose.loading) doCompose();
          }}
          className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
        >
          {open ? "Cerrar" : "Generar mensajes"}
        </button>
      </header>

      {open ? (
        <div className="border-t border-border px-4 py-4 space-y-3">
          {compose.loading ? (
            <p className="text-sm text-muted-foreground">
              Generando variantes con IA…
            </p>
          ) : null}
          {compose.error ? (
            <p className="text-sm text-destructive">{compose.error}</p>
          ) : null}
          {compose.variants ? (
            <div className="grid gap-3 md:grid-cols-2">
              {compose.variants.map((v) => (
                <VariantCard
                  key={v.tag}
                  variant={v}
                  edited={edited[v.tag] ?? v.message}
                  onChange={(text) =>
                    setEdited((cur) => ({ ...cur, [v.tag]: text }))
                  }
                  onSend={() => doSend(v.tag)}
                  sendState={
                    send.variantTag === v.tag ? send : { status: "idle" }
                  }
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function VariantCard({
  variant,
  edited,
  onChange,
  onSend,
  sendState,
}: {
  variant: Variant;
  edited: string;
  onChange: (text: string) => void;
  onSend: () => void;
  sendState: SendState;
}) {
  const len = edited.length;
  const tooShort = len < 20;
  const tooLong = len > 1024;
  return (
    <div className="rounded-md border border-border bg-background p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">
          Variante {variant.tag} ·{" "}
          <span className="text-muted-foreground capitalize">
            {variant.style}
          </span>
        </p>
        <span
          className={
            "text-[10px] tabular-nums " +
            (tooLong ? "text-destructive" : "text-muted-foreground")
          }
        >
          {len}/1024
        </span>
      </div>
      <textarea
        value={edited}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <p className="text-[10px] text-muted-foreground">
        Personalización: {variant.personalization_notes.join(" · ")}
      </p>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onSend}
          disabled={
            sendState.status === "sending" ||
            sendState.status === "sent" ||
            tooShort ||
            tooLong
          }
          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
        >
          {sendState.status === "sending"
            ? "Enviando…"
            : sendState.status === "sent"
              ? "Enviado ✓"
              : sendState.status === "simulated"
                ? "Simulado ✓"
                : `Enviar ${variant.tag}`}
        </button>
        {sendState.message ? (
          <span
            className={
              "text-[10px] " +
              (sendState.status === "error"
                ? "text-destructive"
                : sendState.status === "sent"
                  ? "text-emerald-600"
                  : "text-amber-700")
            }
          >
            {sendState.message}
          </span>
        ) : null}
      </div>
    </div>
  );
}
